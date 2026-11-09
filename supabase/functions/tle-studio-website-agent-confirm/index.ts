import "jsr:@supabase/functions-js/edge-runtime.d.ts";
const HOOK="https://hook.us2.make.com/vmku733oldcldive8qixgqn59yuzvpmx";
const SUPABASE_BASE=Deno.env.get("SUPABASE_URL")||"";
const KEY=(()=>{let v:Record<string,string>={};try{v=JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS")||"{}")}catch{}return v.default||Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")||""})();
const ORIGINS=new Set(["https://thelaunchera.com","https://www.thelaunchera.com"]);
const langOf=(v:unknown)=>v==="es"?"es":"en";
function heads(origin:string){return {"Content-Type":"application/json; charset=utf-8","Access-Control-Allow-Origin":ORIGINS.has(origin)?origin:"https://thelaunchera.com","Access-Control-Allow-Headers":"content-type","Access-Control-Allow-Methods":"POST,OPTIONS","Cache-Control":"no-store","Vary":"Origin"}}
function done(origin:string,status:number,value:Record<string,unknown>){return new Response(JSON.stringify(value),{status,headers:heads(origin)})}
const auth=()=>({apikey:KEY,Authorization:"Bearer "+KEY,"Content-Type":"application/json"});
Deno.serve(async req=>{
 const origin=req.headers.get("origin")||"";
 if(req.method==="OPTIONS")return new Response(null,{status:204,headers:heads(origin)});
 if(req.method!=="POST")return done(origin,405,{ok:false,error:"Method not allowed"});
 if(origin&&!ORIGINS.has(origin))return done(origin,403,{ok:false,error:"Origin not allowed"});
 if(!SUPABASE_BASE||!KEY)return done(origin,503,{ok:false,error:"Receipt service unavailable"});
 try{
  const body=await req.text();if(body.length>7000)return done(origin,413,{ok:false,error:"Request too large"});
  const input=JSON.parse(body||"{}"),session=String(input.session_id||""),action=String(input.action||"confirm");
  if(!/^cs_live_[A-Za-z0-9]+$/.test(session)||!["confirm","save_brief"].includes(action))return done(origin,400,{ok:false,error:"Invalid receipt"});
  const controller=new AbortController(),tm=setTimeout(()=>controller.abort(),16000);
  let vr:Response;
  try{vr=await fetch(HOOK,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({offer:"website-order-verify",session_id:session}),signal:controller.signal})}finally{clearTimeout(tm)}
  if(!vr.ok)return done(origin,503,{ok:false,error:"Payment verification unavailable"});
  const proof=await vr.json().catch(()=>null);
  if(!proof||proof.session_id!==session||proof.offer!=="website-agent"||proof.tle_flow!=="website_agent_optional_20261109"||
    String(proof.mode)!=="subscription"||String(proof.payment_status)!=="paid"||String(proof.status)!=="complete"||
    String(proof.livemode)!=="true"||String(proof.currency).toLowerCase()!=="usd"||Number(proof.amount_total)!==1000||
    !/^sub_[A-Za-z0-9]+$/.test(String(proof.subscription||""))){
    return done(origin,403,{ok:false,error:"Agent subscription not confirmed"});
  }
  const email=String(proof.email||"").trim().toLowerCase();
  if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)||email.length>254)return done(origin,503,{ok:false,error:"Billing email unavailable"});
  const original=String(proof.website_session||""),website_session=/^cs_live_[A-Za-z0-9]+$/.test(original)?original:null;
  const website_offer=["website-basic","website-plus"].includes(String(proof.website_offer||""))?String(proof.website_offer):null;
  const row={stripe_session_id:session,stripe_subscription_id:String(proof.subscription),customer_email:email,
    customer_name:String(proof.name||"").slice(0,150)||null,amount_cents:1000,currency:"usd",
    language:langOf(input.lang),website_session_id:website_session,website_offer};
  const base=SUPABASE_BASE+"/rest/v1/tle_studio_website_agent_orders";
  const inserted=await fetch(base+"?on_conflict=stripe_session_id",{method:"POST",headers:{...auth(),Prefer:"resolution=ignore-duplicates,return=minimal"},body:JSON.stringify(row)});
  if(!inserted.ok){console.error("Agent order persistence failed",inserted.status);return done(origin,503,{ok:false,error:"Order registration unavailable"})}
  if(action==="save_brief"){
    const web=String(input.website_url||"").trim(),goals=String(input.agent_goals||"").trim();
    let validUrl:URL|null=null;if(web){try{validUrl=new URL(web)}catch{return done(origin,400,{ok:false,error:"Enter a valid website URL"})}}
    if((!validUrl&&!website_session)||(validUrl&&(!["http:","https:"].includes(validUrl.protocol)||!validUrl.hostname.includes(".")))||web.length>350||goals.length<15||goals.length>1800)
      return done(origin,400,{ok:false,error:"Provide your website (unless it is being built) and an agent description (15–1800 characters)"});
    const saved=await fetch(base+"?stripe_session_id=eq."+encodeURIComponent(session),{method:"PATCH",headers:{...auth(),Prefer:"return=minimal"},body:JSON.stringify({website_url:validUrl?.href||null,agent_goals:goals,language:langOf(input.lang),status:"setup_requested",updated_at:new Date().toISOString()})});
    if(!saved.ok){console.error("Agent setup request persistence failed",saved.status);return done(origin,503,{ok:false,error:"Setup request unavailable"})}
    return done(origin,200,{ok:true,paid:true,setup_received:true,website_session,website_offer});
  }
  const existing=await fetch(base+"?select=status&stripe_session_id=eq."+encodeURIComponent(session)+"&limit=1",{headers:auth()});
  const current=existing.ok?await existing.json().catch(()=>[]):[];
  return done(origin,200,{ok:true,paid:true,setup_received:current?.[0]?.status!=="paid_pending_setup",website_session,website_offer});
 }catch(e){console.error("Agent receipt verification unavailable",String(e).slice(0,80));return done(origin,503,{ok:false,error:"Could not verify agent checkout"})}
});