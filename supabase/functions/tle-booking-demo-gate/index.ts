import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { HTML as BOOKING_HTML } from "./booking-template.ts";
import { HTML as TRACKER_HTML } from "./tracker-template.ts";

/** Server-side-only Booking Automation demo access gate.
 * No access to the public Cleaning App sample and no changes to buyer-keyed booking pages.
 * A public static file may not include the underlying HTML; only this function serves it.
 */
const BASE=Deno.env.get("SUPABASE_URL")||"";
const SERVICE=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")||"";
const RESEND=Deno.env.get("TLE_CRM_RESEND_API_KEY")||Deno.env.get("RESEND_API_KEY")||"";
const WORKSPACE="c0b24907-3a17-4273-b00c-70efbba314c4";
const ORIGINS=new Set(["https://thelaunchera.com","https://www.thelaunchera.com","https://thelaunchera.github.io"]);
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function headers(origin:string) {
 return {
  "content-type":"application/json; charset=utf-8",
  "cache-control":"no-store, max-age=0",
  "pragma":"no-cache",
  "x-content-type-options":"nosniff",
  "referrer-policy":"no-referrer",
  "vary":"Origin",
  "access-control-allow-origin":ORIGINS.has(origin)?origin:"https://thelaunchera.com",
  "access-control-allow-methods":"POST, OPTIONS",
  "access-control-allow-headers":"content-type"
 };
}
const reply=(data:unknown,status:number,origin:string)=>new Response(JSON.stringify(data),{status,headers:headers(origin)});
const iso=(d:Date)=>d.toISOString();
async function query(path:string, init:RequestInit={}):Promise<any[]> {
 const response=await fetch(BASE+"/rest/v1/"+path,{
  ...init,
  signal:AbortSignal.timeout(8000),
  headers:{"apikey":SERVICE,"Authorization":"Bearer "+SERVICE,"Content-Type":"application/json","Prefer":"return=representation",...(init.headers||{})}
 });
 if(!response.ok)throw new Error("DB_UNAVAILABLE");
 return response.json();
}
function token():string {
 const b=crypto.getRandomValues(new Uint8Array(32));
 return [...b].map(x=>x.toString(16).padStart(2,"0")).join("");
}
async function sign(purpose:string,rid:string,value:string):Promise<string> {
 const key=await crypto.subtle.importKey("raw",new TextEncoder().encode(SERVICE),"HMAC",{name:"HMAC",hash:"SHA-256"},false,["sign"]);
 const s=await crypto.subtle.sign("HMAC",key,new TextEncoder().encode(purpose+":"+rid+":"+value));
 return [...new Uint8Array(s)].map(x=>x.toString(16).padStart(2,"0")).join("");
}
async function authorized(rid:string):Promise<{id:string;email:string}|null> {
 if(!UUID.test(rid))return null;
 const [r]=await query("personalized_demo_requests?id=eq."+encodeURIComponent(rid)+"&select=id,email,goal,status,sent_at&limit=1");
 if(!r||r.status!=="sent"||!r.sent_at||!EMAIL.test(String(r.email||"")))return null;
 const goal=String(r.goal||"");
 if(goal.startsWith("crm_interest:")){
  const leadId=goal.substring("crm_interest:".length);
  if(!UUID.test(leadId))return null;
  const [lead]=await query("tle_crm_leads?id=eq."+encodeURIComponent(leadId)+"&workspace_id=eq."+WORKSPACE+"&select=id,email,email_consent_status,archived_at&limit=1");
  if(!lead||lead.archived_at||lead.email_consent_status!=="authorized"||String(lead.email||"").toLowerCase()!==String(r.email).toLowerCase())return null;
  const events=await query("tle_crm_email_events?workspace_id=eq."+WORKSPACE+"&lead_id=eq."+leadId+"&event_type=in.(confirmation_sent,demo_sent,email_bounced,email_failed,email_suppressed,email_unsubscribed,email_complained)&select=event_type&limit=100");
  const types=new Set(events.map((e:{event_type:string})=>e.event_type));
  if(!types.has("confirmation_sent")||!types.has("demo_sent"))return null;
  for(const blocked of ["email_bounced","email_failed","email_suppressed","email_unsubscribed","email_complained"])if(types.has(blocked))return null;
 }
 return {id:rid,email:String(r.email)};
}
async function access(rid:string):Promise<any|null> {
 const rows=await query("tle_booking_demo_access?request_id=eq."+encodeURIComponent(rid)+"&select=*&limit=1");
 return rows[0]||null;
}
async function emailCode(email:string,code:string,rid:string,minute:number):Promise<void> {
 if(!RESEND)throw new Error("MAIL_UNAVAILABLE");
 const html='<div style="max-width:480px;margin:auto;padding:26px;border-radius:20px;background:#faf8f3;font-family:Arial,sans-serif;color:#191919"><p style="font-size:12px;font-weight:800;letter-spacing:2px">THE LAUNCH ERA</p><h2>Access your Booking Automation demo</h2><p>Enter this code to view your personalized demo:</p><p style="font-size:32px;font-weight:800;letter-spacing:6px">'+code+'</p><p>Expires in 10 minutes. If you did not ask for this code, ignore this email.</p></div>';
 const response=await fetch("https://api.resend.com/emails",{
  method:"POST",signal:AbortSignal.timeout(12000),
  headers:{"authorization":"Bearer "+RESEND,"content-type":"application/json","Idempotency-Key":"tle-booking-demo-access-"+rid+"-"+minute},
  body:JSON.stringify({from:"The Launch Era <hello@thelaunchera.com>",to:[email],subject:"Booking Automation — your demo access code",html,text:"Your Booking Automation demo code is "+code+". It expires in 10 minutes."})
 });
 const data=await response.json().catch(()=>({}));
 if(!response.ok||!data.id)throw new Error("MAIL_UNAVAILABLE");
}
Deno.serve(async(req:Request)=>{
 const origin=req.headers.get("origin")||"";
 if(req.method==="OPTIONS")return new Response(null,{status:204,headers:headers(origin)});
 if(req.method!=="POST")return reply({error:"Method not allowed"},405,origin);
 if(origin&&!ORIGINS.has(origin))return reply({error:"Not allowed"},403,origin);
 if(!BASE||!SERVICE)return reply({error:"Unavailable"},503,origin);
 let data:Record<string,unknown>;
 try {data=await req.json();}catch{return reply({error:"Invalid JSON"},400,origin);}
 const rid=String(data.rid||"").trim();
 const action=String(data.action||"").trim();
 if(!UUID.test(rid))return reply({code:"funnel_required",error:"Request your Booking Automation demo first."},403,origin);
 try {
  const user=await authorized(rid);
  if(!user)return reply({code:"funnel_required",error:"This demo link has not been authorized by the funnel. Please request access."},403,origin);
  if(action==="request"){
   const old=await access(rid);
   const at=Date.now(),last=old?.last_sent_at?Date.parse(old.last_sent_at):0;
   const windowActive=old?.window_started_at&&at-Date.parse(old.window_started_at)<3600000;
   const sentCount=windowActive?Number(old?.sent_count||0):0;
   if(last&&at-last<60000)return reply({code:"rate_limited",error:"Wait one minute before requesting another code."},429,origin);
   if(sentCount>=3)return reply({code:"rate_limited",error:"Too many requests. Try again in an hour."},429,origin);
   const random=crypto.getRandomValues(new Uint32Array(1))[0];
   const code=String(random%1000000).padStart(6,"0");
   const hash=await sign("otp",rid,code);
   const record={
    request_id:rid,
    code_hash:hash,code_expires_at:iso(new Date(at+600000)),code_attempts:0,
    sent_count:sentCount+1,window_started_at:windowActive?old.window_started_at:iso(new Date(at)),
    last_sent_at:iso(new Date(at)),
    session_hash:null,session_expires_at:null,updated_at:iso(new Date(at))
   };
   await query("tle_booking_demo_access?on_conflict=request_id",{
    method:"POST",
    headers:{"Prefer":"resolution=merge-duplicates,return=representation"},
    body:JSON.stringify(record)
   });
   try {await emailCode(user.email,code,rid,Math.floor(at/60000));}
   catch {
    await query("tle_booking_demo_access?request_id=eq."+rid,{method:"PATCH",body:JSON.stringify({code_hash:null,code_expires_at:null})}).catch(()=>{});
    return reply({code:"mail_failed",error:"Could not send your access code. Please try again shortly."},503,origin);
   }
   return reply({ok:true,message:"We sent the code to the email address from your approved demo request."},200,origin);
  }
  if(action==="verify"){
   const code=String(data.code||"").trim();
   if(!/^\d{6}$/.test(code))return reply({error:"Enter your six-digit code."},400,origin);
   const entry=await access(rid);
   if(!entry||!entry.code_hash||!entry.code_expires_at||Date.parse(entry.code_expires_at)<Date.now()||Number(entry.code_attempts||0)>=5)
    return reply({code:"expired",error:"Code expired or unavailable. Request a new code."},403,origin);
   const hash=await sign("otp",rid,code);
   if(hash!==entry.code_hash){
    await query("tle_booking_demo_access?request_id=eq."+rid,{method:"PATCH",body:JSON.stringify({code_attempts:Number(entry.code_attempts||0)+1,updated_at:iso(new Date())})});
    return reply({code:"invalid",error:"That code was not accepted."},403,origin);
   }
   const session=token(),at=Date.now(),sessionHash=await sign("session",rid,session);
   await query("tle_booking_demo_access?request_id=eq."+rid,{method:"PATCH",body:JSON.stringify({
    code_hash:null,code_expires_at:null,session_hash:sessionHash,
    session_expires_at:iso(new Date(at+14400000)),verified_at:iso(new Date(at)),updated_at:iso(new Date(at))
   })});
   return reply({ok:true,session,expires_in_seconds:14400},200,origin);
  }
  if(action==="content"){
   const session=String(data.session||"").trim();
   if(!/^[0-9a-f]{64}$/.test(session))return reply({code:"verification_required",error:"Verify your email first."},401,origin);
   const entry=await access(rid);
   if(!entry?.session_hash||!entry.session_expires_at||Date.parse(entry.session_expires_at)<Date.now())
    return reply({code:"verification_required",error:"Your access has expired."},401,origin);
   const hash=await sign("session",rid,session);
   if(hash!==entry.session_hash)return reply({code:"verification_required",error:"Access denied."},401,origin);
   const page=String(data.page||"");
   if(page!=="booking"&&page!=="tracker")return reply({error:"Invalid page"},400,origin);
   return reply({ok:true,html:page==="booking"?BOOKING_HTML:TRACKER_HTML},200,origin);
  }
  return reply({error:"Invalid action"},400,origin);
 }catch(error){
  console.error("Booking demo access:",error instanceof Error?error.message:"unexpected");
  return reply({error:"Temporarily unavailable. Please try again later."},503,origin);
 }
});