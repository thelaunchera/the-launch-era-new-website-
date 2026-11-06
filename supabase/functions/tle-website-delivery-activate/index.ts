import "jsr:@supabase/functions-js/edge-runtime.d.ts";
const SITE="https://thelaunchera.com";
const ALLOWED=new Set([SITE,"https://www.thelaunchera.com","https://command.thelaunchera.com"]);
const URL=Deno.env.get("SUPABASE_URL")||"";
const ANON=Deno.env.get("SUPABASE_ANON_KEY")||"";
const KEY=(()=>{let o={};try{o=JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS")||"{}")}catch{}return (o as Record<string,string>).default||Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")||""})();
const CORS=(origin:string)=>({"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store","Access-Control-Allow-Origin":ALLOWED.has(origin)?origin:SITE,"Access-Control-Allow-Methods":"POST,OPTIONS","Access-Control-Allow-Headers":"authorization,content-type,apikey","Vary":"Origin","X-Content-Type-Options":"nosniff"});
const resp=(origin:string,status:number,v:object)=>new Response(JSON.stringify(v),{status,headers:CORS(origin)});
const authHeaders={"apikey":KEY,"Authorization":"Bearer "+KEY,"Content-Type":"application/json"};
async function db(path:string,init:RequestInit={}){return fetch(URL+"/rest/v1/"+path,{...init,headers:{...authHeaders,...(init.headers||{})}})}
async function parse(r:Response,label:string){const data=await r.json().catch(()=>null);if(!r.ok)throw Error(label+" "+r.status);return data}
async function admin(req:Request){
 const authorization=req.headers.get("authorization")||"";
 if(!authorization.startsWith("Bearer ")||authorization.length<25||!ANON)throw Error("Unauthorized");
 const user=await fetch(URL+"/auth/v1/user",{headers:{"apikey":ANON,authorization}});
 const session=await parse(user,"Authenticated session");
 const id=String(session?.id||"");
 if(!/^[0-9a-f-]{36}$/i.test(id))throw Error("Unauthorized");
 const rows=await parse(await db("platform_admins?user_id=eq."+encodeURIComponent(id)+"&select=user_id&limit=1"),"Owner authorization");
 if(!Array.isArray(rows)||rows.length!==1)throw Error("Unauthorized");
 return id;
}
function monthFrom(date:string){
 const d=new Date(date);
 if(!Number.isFinite(d.getTime()))throw Error("Invalid delivery date");
 const y=d.getUTCFullYear(),m=d.getUTCMonth(),day=d.getUTCDate();
 const last=new Date(Date.UTC(y,m+2,0)).getUTCDate();
 return new Date(Date.UTC(y,m+1,Math.min(day,last),d.getUTCHours(),d.getUTCMinutes(),d.getUTCSeconds())).toISOString();
}
function urlValid(raw:string){
 try{
  const u=new URL(raw);
  return u.protocol==="https:"&&u.hostname.includes(".")&&!u.username&&!u.password&&raw.length<=600;
 }catch{return false}
}
const FIELDS="id,stripe_session_id,package_slug,stripe_customer_email,stripe_customer_name,stripe_customer_id,stripe_payment_intent_id,business_name,project_stage,payment_status,intake_received_at,studio_intake_submission_id,created_at,delivered_at,delivered_url,first_month_ends_at,stripe_subscription_id,subscription_billing_status,billing_activation_claimed_at,billing_activation_error";
Deno.serve(async(req:Request)=>{
 const origin=req.headers.get("origin")||"";
 if(req.method==="OPTIONS")return new Response(null,{status:ALLOWED.has(origin)?204:403,headers:CORS(origin)});
 if(req.method!=="POST")return resp(origin,405,{ok:false});
 if(!ALLOWED.has(origin)||!KEY||!URL||!ANON)return resp(origin,403,{ok:false});
 try{await admin(req)}catch{return resp(origin,403,{ok:false,error:"Owner login required"})}
 try{
  const raw=await req.text();if(raw.length>5000)return resp(origin,413,{ok:false});
  let b:any;try{b=JSON.parse(raw)}catch{return resp(origin,400,{ok:false})}
  if(b?.action==="list"){
    const rows=await parse(await db("tle_website_projects?select="+FIELDS+"&order=created_at.desc&limit=100"),"Website orders");
    return resp(origin,200,{ok:true,projects:rows||[]});
  }
  if(b?.action!=="confirm_delivery"||b?.confirmed_delivered!==true)return resp(origin,400,{ok:false,error:"Delivery confirmation required"});
  const id=String(b.project_id||"");
  const live=String(b.delivered_url||"").trim();
  if(!/^[0-9a-f-]{36}$/i.test(id)||!urlValid(live))return resp(origin,400,{ok:false,error:"A valid HTTPS project URL is required"});
  const rows=await parse(await db("tle_website_projects?id=eq."+encodeURIComponent(id)+"&select="+FIELDS+"&limit=1"),"Project");
  const row=Array.isArray(rows)?rows[0]:null;
  if(!row||!["website-basic","website-ai-crm"].includes(row.package_slug))return resp(origin,404,{ok:false});
  if(row.payment_status!=="paid"||!/^cs_live_[A-Za-z0-9]+$/.test(String(row.stripe_session_id||"")))return resp(origin,409,{ok:false,error:"A verified LIVE paid order is required"});
  if(!row.intake_received_at||!row.studio_intake_submission_id)return resp(origin,409,{ok:false,error:"Customer intake must be completed before delivery"});
  if(row.delivered_at&&row.delivered_url&&row.delivered_url!==live)return resp(origin,409,{ok:false,error:"Delivery URL has already been recorded; contact support to amend"});
  if(row.package_slug==="website-basic"){
    if(row.delivered_at)return resp(origin,200,{ok:true,already_delivered:true,delivered_at:row.delivered_at});
    const changed=await parse(await db("tle_website_projects?id=eq."+encodeURIComponent(id)+"&delivered_at=is.null",{method:"PATCH",headers:{"Prefer":"return=representation"},body:JSON.stringify({project_stage:"delivered",delivered_at:new Date().toISOString(),delivered_url:live,subscription_billing_status:"not_applicable",updated_at:new Date().toISOString()})}),"Basic project delivery");
    if(!Array.isArray(changed)||changed.length!==1)return resp(origin,409,{ok:false,error:"Concurrent delivery update"});
    return resp(origin,200,{ok:true,delivered_at:changed[0].delivered_at,subscription:"not_applicable"});
  }
  if(row.stripe_subscription_id)return resp(origin,200,{ok:true,already_activated:true,subscription_id:row.stripe_subscription_id,delivered_at:row.delivered_at,first_month_ends_at:row.first_month_ends_at});
  if(!/^cus_[A-Za-z0-9]+$/.test(String(row.stripe_customer_id||""))||!/^pi_[A-Za-z0-9]+$/.test(String(row.stripe_payment_intent_id||"")))return resp(origin,409,{ok:false,error:"Saved customer/payment authorization is missing"});
  const time=new Date().toISOString(),stale=new Date(Date.now()-15*60*1000).toISOString();
  if(!row.delivered_at){
    await parse(await db("tle_website_projects?id=eq."+encodeURIComponent(id)+"&delivered_at=is.null",{method:"PATCH",headers:{"Prefer":"return=minimal"},body:JSON.stringify({delivered_at:time,delivered_url:live,first_month_ends_at:monthFrom(time),project_stage:"delivery_confirmed_pending_billing",updated_at:time})}),"Delivery timestamp");
  }
  const updated=await parse(await db("tle_website_projects?id=eq."+encodeURIComponent(id)+"&select="+FIELDS+"&limit=1"),"Current delivery");
  const state=updated[0];
  if(state.stripe_subscription_id)return resp(origin,200,{ok:true,already_activated:true,subscription_id:state.stripe_subscription_id});
  const end=String(state.first_month_ends_at||"");
  const trialEnd=Math.floor(new Date(end).getTime()/1000);
  if(!Number.isFinite(trialEnd)||trialEnd<Math.floor(Date.now()/1000)+86400||trialEnd>Math.floor(Date.now()/1000)+35*86400)return resp(origin,409,{ok:false,error:"Delivery date requires manual billing review"});
  const claim=await parse(await db("tle_website_projects?id=eq."+encodeURIComponent(id)+"&stripe_subscription_id=is.null&or=(billing_activation_claimed_at.is.null,billing_activation_claimed_at.lt."+encodeURIComponent(stale)+")",{method:"PATCH",headers:{"Prefer":"return=representation"},body:JSON.stringify({billing_activation_claimed_at:new Date().toISOString(),billing_activation_error:null})}),"Activation lock");
  if(!Array.isArray(claim)||claim.length===0)return resp(origin,409,{ok:false,error:"Activation already in progress"});
  let subscribed=false;
  try{
    const route=await parse(await db("tle_private_payment_hooks?kind=eq.website_delivery_activation&select=endpoint"),"Private payment route");
    const endpoint=route?.[0]?.endpoint;
    if(typeof endpoint!=="string"||!endpoint.startsWith("https://hook.us2.make.com/"))throw Error("Billing route unavailable");
    const result=await fetch(endpoint,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({event_type:"website-delivery-activate",session_id:state.stripe_session_id,plan_price_id:"price_1UYoJ2CnlGzKRSIMEL4AfPB1",trial_end:trialEnd,delivered_at:state.delivered_at,is_test:false}),signal:AbortSignal.timeout(20000)});
    const output=await result.json().catch(()=>null);
    if(!result.ok||output?.ok!==true||!/^sub_[A-Za-z0-9]+$/.test(String(output.subscription_id||""))||output.customer!==state.stripe_customer_id||Number(output.trial_end)!==trialEnd||String(output.livemode)!=="true")throw Error("Stripe activation was not verified");
    const store=await parse(await db("tle_website_projects?id=eq."+encodeURIComponent(id)+"&stripe_subscription_id=is.null",{method:"PATCH",headers:{"Prefer":"return=representation"},body:JSON.stringify({stripe_subscription_id:output.subscription_id,project_stage:"delivered",subscription_started_at:new Date().toISOString(),subscription_billing_status:String(output.status||"trialing"),billing_activation_claimed_at:null,billing_activation_error:null,updated_at:new Date().toISOString()})}),"Save Stripe subscription");
    if(!Array.isArray(store)||store.length!==1)throw Error("Subscription created but project update failed");
    subscribed=true;
    return resp(origin,200,{ok:true,subscription_id:output.subscription_id,delivered_at:state.delivered_at,first_month_ends_at:state.first_month_ends_at});
  }catch(e){
    const problem=String(e).slice(0,150);
    await db("tle_website_projects?id=eq."+encodeURIComponent(id)+"&stripe_subscription_id=is.null",{method:"PATCH",headers:{"Prefer":"return=minimal"},body:JSON.stringify({billing_activation_claimed_at:null,billing_activation_error:"Delivery activation needs review; retry idempotently",updated_at:new Date().toISOString()})}).catch(()=>{});
    console.error("website delivery activation",problem);
    return resp(origin,503,{ok:false,error:"Billing activation is awaiting verification. No duplicate should be created; retry or contact support."});
  }
 }catch(e){console.error("website admin delivery",String(e).slice(0,120));return resp(origin,503,{ok:false,error:"Unable to complete this request"})}
});