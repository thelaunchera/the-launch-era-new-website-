import "jsr:@supabase/functions-js/edge-runtime.d.ts";
const MAKE_HOOK = "https://hook.us2.make.com/vmku733oldcldive8qixgqn59yuzvpmx";
const ALLOWED = new Set(["https://thelaunchera.com","https://www.thelaunchera.com"]);
const OFFERS = new Set(["website-basic","website-plus","website-agent"]);
function headers(origin:string) {
 return {"Content-Type":"application/json; charset=utf-8","Access-Control-Allow-Origin":ALLOWED.has(origin)?origin:"https://thelaunchera.com","Access-Control-Allow-Headers":"content-type","Access-Control-Allow-Methods":"POST,OPTIONS","Cache-Control":"no-store","Vary":"Origin"};
}
function reply(origin:string,status:number,obj:Record<string,unknown>) {
 return new Response(JSON.stringify(obj),{status,headers:headers(origin)});
}
Deno.serve(async req=>{
 const origin=req.headers.get("origin")||"";
 if(req.method==="OPTIONS")return new Response(null,{status:204,headers:headers(origin)});
 if(req.method!=="POST")return reply(origin,405,{ok:false,error:"Method not allowed"});
 if(!ALLOWED.has(origin))return reply(origin,403,{ok:false,error:"Origin not allowed"});
 try {
  const raw=await req.text();
  if(raw.length>512)return reply(origin,413,{ok:false,error:"Invalid request"});
  const input=JSON.parse(raw);
  const offer=String(input?.offer||"");
  const language=input?.language==="es"?"es":"en";
  if(!OFFERS.has(offer))return reply(origin,400,{ok:false,error:"Invalid package"});
  const rawSession=String(input?.website_session||"");
  const website_session=/^cs_live_[A-Za-z0-9]+$/.test(rawSession)?rawSession:"";
  const website_offer=["website-basic","website-plus"].includes(String(input?.website_offer||""))?String(input.website_offer):"";
  const ctrl=new AbortController();
  const timeout=setTimeout(()=>ctrl.abort(),18000);
  let response:Response;
  try {
   response=await fetch(MAKE_HOOK,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({offer,language,website_session,website_offer}),signal:ctrl.signal});
  } finally {clearTimeout(timeout)}
  if(!response.ok)return reply(origin,503,{ok:false,error:"Checkout temporarily unavailable"});
  const json=await response.json().catch(()=>null);
  const checkoutUrl=String(json?.url||"");
  const sessionId=String(json?.session_id||"");
  let dest:URL;
  try {dest=new URL(checkoutUrl)}catch{return reply(origin,503,{ok:false,error:"Checkout link unavailable"})}
  if(dest.protocol!=="https:"||!["checkout.stripe.com"].includes(dest.hostname)||!/^cs_live_[A-Za-z0-9]+$/.test(sessionId))
   return reply(origin,503,{ok:false,error:"Checkout link not verified"});
  return reply(origin,200,{ok:true,url:dest.href});
 } catch(e) {
  console.error("Website checkout start unavailable",String(e).slice(0,70));
  return reply(origin,503,{ok:false,error:"Unable to start secure checkout"});
 }
});