import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { BOOKING_HTML, TRACKER_HTML } from "./protected-templates.ts";

// Email-code authentication is intentionally separate from marketing consent.
// A public UUID or a copy of the old email URL never grants content access.
const SITE="https://thelaunchera.com";
const W="c0b24907-3a17-4273-b00c-70efbba314c4";
const SUPABASE_URL=Deno.env.get("SUPABASE_URL")||"";
const SERVICE_KEY=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")||"";
const RESEND=Deno.env.get("TLE_CRM_RESEND_API_KEY")||Deno.env.get("RESEND_API_KEY")||"";
const ALLOWED=new Set([SITE,"https://www.thelaunchera.com","https://thelaunchera.github.io"]);
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isEmail=v=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
function headers(origin:string){return {"Content-Type":"application/json; charset=utf-8","Cache-Control":"private, no-store, max-age=0","X-Content-Type-Options":"nosniff","Referrer-Policy":"no-referrer","Vary":"Origin","Access-Control-Allow-Origin":ALLOWED.has(origin)?origin:SITE,"Access-Control-Allow-Methods":"POST, OPTIONS","Access-Control-Allow-Headers":"content-type"};}
function reply(origin:string,status:number,data:unknown){return new Response(JSON.stringify(data),{status,headers:headers(origin)});}
function hex(data:Uint8Array){return [...data].map(x=>x.toString(16).padStart(2,"0")).join("");}
function randomHex(){const bytes=new Uint8Array(32);crypto.getRandomValues(bytes);return hex(bytes);}
async function digest(purpose:string,input:string){const bytes=new TextEncoder().encode("tle-booking-demo-gate-v1:"+purpose+":"+SERVICE_KEY+":"+input);return hex(new Uint8Array(await crypto.subtle.digest("SHA-256",bytes)));}
async function db(path:string,init:RequestInit={}){
 const r=await fetch(SUPABASE_URL+"/rest/v1/"+path,{
  ...init,signal:init.signal||AbortSignal.timeout(8000),
  headers:{apikey:SERVICE_KEY,Authorization:"Bearer "+SERVICE_KEY,"Content-Type":"application/json","Prefer":"return=representation",...(init.headers||{})}
 });
 if(!r.ok)throw Error("DB "+r.status);
 return r.status===204?[]:await r.json();
}
async function eligible(id:string){
 if(!uuid.test(id))return null;
 const requests=await db("personalized_demo_requests?select=id,email,status,sent_at,goal&id=eq."+id+"&limit=1");
 const q=requests?.[0];
 if(!q||q.status!=="sent"||!q.sent_at||!isEmail(q.email))return null;
 if(String(q.goal||"").startsWith("crm_interest:")){
   const lead=String(q.goal).slice("crm_interest:".length);
   if(!uuid.test(lead))return null;
   const rows=await db("tle_crm_leads?select=id,email,email_consent_status,archived_at,workspace_id&id=eq."+lead+"&workspace_id=eq."+W+"&limit=1");
   const l=rows?.[0];
   if(!l||l.archived_at||l.email_consent_status!=="authorized"||String(l.email||"").toLowerCase()!==String(q.email).toLowerCase())return null;
   const events=await db("tle_crm_email_events?select=event_type&lead_id=eq."+lead+"&workspace_id=eq."+W+"&event_type=in.(confirmation_sent,demo_sent,email_bounced,email_failed,email_suppressed,email_unsubscribed,email_complained)");
   const types=new Set((events||[]).map((e:{event_type:string})=>e.event_type));
   if(!types.has("confirmation_sent")||!types.has("demo_sent")||["email_bounced","email_failed","email_suppressed","email_unsubscribed","email_complained"].some(x=>types.has(x)))return null;
 }
 return q as {id:string,email:string,goal?:string};
}
async function sendCode(email:string,id:string,code:string){
 if(!RESEND)throw Error("MAIL_UNAVAILABLE");
 const html='<div style="max-width:560px;margin:32px auto;background:#faf8f3;padding:26px;border-radius:20px;font:15px/1.6 Arial,sans-serif;color:#191919"><p style="font-size:12px;letter-spacing:.12em"><b>THE LAUNCH ERA</b></p><h2>Your private Booking Automation demo</h2><p>Enter the code below on the page you just opened:</p><p style="font-size:30px;letter-spacing:.24em;color:#256f9e;font-weight:800">'+code+'</p><p>This code expires in 10 minutes. If you did not request it, ignore this email.</p><p>— The Launch Era</p></div>';
 const res=await fetch("https://api.resend.com/emails",{method:"POST",headers:{"Authorization":"Bearer "+RESEND,"Content-Type":"application/json","Idempotency-Key":"tle-booking-demo-access-"+id+"-"+Date.now()},body:JSON.stringify({from:"The Launch Era <hello@thelaunchera.com>",to:[email],subject:"Your Booking Automation demo access code",text:"The Launch Era Booking Automation demo code: "+code+"\n\nExpires in 10 minutes. Ignore if you did not request it.",html}),signal:AbortSignal.timeout(9500)});
 const body=await res.json().catch(()=>({}));
 if(!res.ok||!body?.id)throw Error("MAIL_REJECTED");
}
Deno.serve(async req=>{
 const origin=req.headers.get("origin")||"";
 if(req.method==="OPTIONS")return new Response(null,{status:204,headers:headers(origin)});
 if(req.method!=="POST")return reply(origin,405,{error:"Method not allowed"});
 if(origin&&!ALLOWED.has(origin))return reply(origin,403,{error:"Access denied"});
 if(!SUPABASE_URL||!SERVICE_KEY)return reply(origin,503,{error:"Access temporarily unavailable"});
 let data:Record<string,unknown>;
 try{data=await req.json();}catch{return reply(origin,400,{error:"Invalid request"});}
 const action=String(data.action||""),id=String(data.rid||"");
 if(!uuid.test(id))return reply(origin,action==="start"?200:403,action==="start"?{ok:true,message:"If your demo is ready, an access code will be sent."}:{error:"Please request a personalized demo first."});
 try{
  // The status/consent check is repeated on EVERY step, including content loading.
  const q=await eligible(id);
  if(action==="start"){
   // Invalid or archived leads get the same generic response: no email enumeration.
   const generic={ok:true,message:"If this demo is available, the access code will arrive by email."};
   if(!q)return reply(origin,200,generic);
   const entries=await db("tle_booking_demo_access?select=demo_id,challenge_sent_at,send_window_start,send_count&demo_id=eq."+id+"&limit=1");
   const old=entries?.[0],now=Date.now();
   const last=old?.challenge_sent_at?new Date(old.challenge_sent_at).getTime():0;
   const begin=old?.send_window_start?new Date(old.send_window_start).getTime():0;
   const count=begin&&now-begin<3600000?(Number(old.send_count)||0):0;
   if(now-last<120000||count>=4)return reply(origin,200,generic);
   const n=new Uint32Array(1);crypto.getRandomValues(n);
   const code=String(100000+(n[0]%900000));
   const hash=await digest("code",id+":"+code);
   await db("tle_booking_demo_access?on_conflict=demo_id",{
    method:"POST",headers:{"Prefer":"resolution=merge-duplicates,return=representation"},
    body:JSON.stringify({demo_id:id,challenge_hash:hash,challenge_expires_at:new Date(now+600000).toISOString(),challenge_attempts:0,challenge_sent_at:new Date(now).toISOString(),send_window_start:count?new Date(begin).toISOString():new Date(now).toISOString(),send_count:count+1,updated_at:new Date(now).toISOString()})
   });
   try{await sendCode(q.email,id,code);}catch(e){
    console.error("Booking demo code not accepted",e instanceof Error?e.message:"unknown");
    // Fail closed even if email acceptance is uncertain; no code is disclosed to the browser.
    return reply(origin,503,{error:"Unable to send the access email right now. Please try again shortly."});
   }
   return reply(origin,200,generic);
  }
  if(!q)return reply(origin,403,{error:"This demo is unavailable. Please request access through The Launch Era."});
  if(action==="verify"){
   const code=String(data.code||"");
   if(!/^[0-9]{6}$/.test(code))return reply(origin,400,{error:"Enter the 6-digit code."});
   const rows=await db("tle_booking_demo_access?select=challenge_hash,challenge_expires_at,challenge_attempts&demo_id=eq."+id+"&limit=1");
   const a=rows?.[0];
   if(!a?.challenge_hash||!a?.challenge_expires_at||Date.now()>new Date(a.challenge_expires_at).getTime()||a.challenge_attempts>=5)return reply(origin,403,{error:"Code expired or too many attempts. Request a new code."});
   const hash=await digest("code",id+":"+code);
   if(hash!==a.challenge_hash){
    await db("tle_booking_demo_access?demo_id=eq."+id,{method:"PATCH",body:JSON.stringify({challenge_attempts:Number(a.challenge_attempts)+1,updated_at:new Date().toISOString()})});
    return reply(origin,403,{error:"Incorrect code. Try again."});
   }
   const token=randomHex(),sessionHash=await digest("session",id+":"+token);
   await db("tle_booking_demo_access?demo_id=eq."+id,{method:"PATCH",body:JSON.stringify({challenge_hash:null,challenge_expires_at:null,challenge_attempts:0,session_hash:sessionHash,session_expires_at:new Date(Date.now()+12*3600000).toISOString(),updated_at:new Date().toISOString()})});
   return reply(origin,200,{ok:true,token,expires_in:43200});
  }
  if(action==="content"){
   const token=String(data.token||"");
   if(!/^[0-9a-f]{64}$/i.test(token))return reply(origin,403,{error:"Verify your email to open this demo."});
   const rows=await db("tle_booking_demo_access?select=session_hash,session_expires_at&demo_id=eq."+id+"&limit=1");
   const a=rows?.[0],hash=await digest("session",id+":"+token);
   if(!a?.session_hash||hash!==a.session_hash||!a.session_expires_at||Date.now()>new Date(a.session_expires_at).getTime())return reply(origin,403,{error:"Your session has expired. Verify your email again."});
   const view=String(data.view||"booking");
   if(view!=="booking"&&view!=="tracker")return reply(origin,400,{error:"Unknown demo view"});
   return reply(origin,200,{ok:true,html:view==="booking"?BOOKING_HTML:TRACKER_HTML});
  }
  return reply(origin,400,{error:"Unknown action"});
 }catch(e){
  console.error("Booking demo gate error",e instanceof Error?e.message:"unknown");
  return reply(origin,503,{error:"This demo is temporarily unavailable. Please retry later."});
 }
});
