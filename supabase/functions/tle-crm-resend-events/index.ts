const encoder=new TextEncoder();
function fromBase64(v:string){const b=atob(v.replace(/-/g,"+").replace(/_/g,"/").padEnd(Math.ceil(v.length/4)*4,"="));return Uint8Array.from(b,c=>c.charCodeAt(0))}
async function verify(body:string,h:Headers){
 const id=h.get("svix-id"),timestamp=h.get("svix-timestamp"),signature=h.get("svix-signature");
 if(!id||!timestamp||!signature||!Number.isFinite(+timestamp)||Math.abs(Date.now()/1000-Number(timestamp))>300)return false;
 const apiKey=Deno.env.get("TLE_CRM_RESEND_API_KEY");
 if(!apiKey)throw new Error("Resend key unavailable");
 const r=await fetch("https://api.resend.com/webhooks/e827e817-c943-4706-b51b-4e21e32ce732",{headers:{"Authorization":"Bearer "+apiKey},signal:AbortSignal.timeout(8000)});
 if(!r.ok)throw new Error("Resend webhook signing configuration unavailable");
 const doc=await r.json();
 const secret=doc.signing_secret;
 if(typeof secret!=="string"||!secret.startsWith("whsec_"))throw new Error("Resend signing configuration missing");
 const key=await crypto.subtle.importKey("raw",fromBase64(secret.slice(6)),{name:"HMAC",hash:"SHA-256"},false,["verify"]);
 const input=encoder.encode(id+"."+timestamp+"."+body);
 for(const item of signature.split(" ")){
  if(!item.startsWith("v1,"))continue;
  try{if(await crypto.subtle.verify("HMAC",key,fromBase64(item.slice(3)),input))return true}catch{}
 }
 return false;
}
Deno.serve(async req=>{
if(req.method!=="POST")return new Response("Method not allowed",{status:405});
const body=await req.text();let valid=false;try{valid=await verify(body,req.headers)}catch{return new Response("Webhook signing service unavailable",{status:503})}if(!valid)return new Response("Invalid signature",{status:401});
let e:any;try{e=JSON.parse(body)}catch{return new Response("Bad JSON",{status:400})}
const kind=String(e.type||"");
if(kind==="email.received"){
 const data=e.data||{};
 const recipients=Array.isArray(data.to)?data.to:[data.to];

 // Platform-managed buyer replies: a unique destination per booking request.
 // Existing agency reply processing is retained below without changes.
 const managed=recipients.map((x:any)=>String(x||"").toLowerCase().trim())
   .find((x:string)=>/^r-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}@nupelke\.resend\.app$/.test(x));
 if(managed){
  const sender=String(data.from||"").match(/<([^<>\s]+@[^<>\s]+)>/)?.[1]||String(data.from||"").trim();
  const inboundId=String(data.email_id||"");
  if(!inboundId)return Response.json({ok:true,ignored:"missing inbound event ID"});
  const url=Deno.env.get("SUPABASE_URL"),key=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if(!url||!key)return new Response("Managed reply service unavailable",{status:503});
  const headers={"apikey":key,"Authorization":"Bearer "+key,"Content-Type":"application/json"};
  const routed=await fetch(url+"/rest/v1/rpc/tle_booking_managed_reply_route",{
   method:"POST",headers,body:JSON.stringify({p_sender:sender,p_recipient:managed,p_message_id:inboundId})
  });
  if(!routed.ok)return new Response("Managed reply routing temporarily unavailable",{status:503});
  const outcome=await routed.json();
  if(!outcome?.matched)return Response.json({ok:true,ignored:outcome?.reason||"not a current customer"});
  if(outcome.owner_notified===true)return Response.json({ok:true,matched:true,duplicate:true,forwarded:true});
  const emailKey=Deno.env.get("TLE_CRM_RESEND_API_KEY");
  if(!emailKey)return new Response("Managed notification sender unavailable",{status:503});
  const received=await fetch("https://api.resend.com/emails/receiving/"+encodeURIComponent(inboundId),{
   headers:{"Authorization":"Bearer "+emailKey},signal:AbortSignal.timeout(9000)
  });
  if(!received.ok)return new Response("Reply content temporarily unavailable",{status:503});
  const incoming=await received.json();
  const full=incoming?.data||incoming;
  const snippet=String(full?.text||"").slice(0,3200);
  const esc=(v:string)=>v.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;");
  const ownerEmail=String(outcome.owner_email||"").trim();
  const customer=String(outcome.customer_email||"").trim();
  if(!ownerEmail||!customer)return new Response("Notification address missing",{status:503});
  const messageHtml='<div style="font-family:Arial,Helvetica,sans-serif;line-height:1.65;color:#191919;max-width:590px"><p style="font-size:12px;font-weight:800;letter-spacing:.1em;color:#42718d">THE LAUNCH ERA · CUSTOMER REPLY</p>'+
   '<h2 style="margin:8px 0">A customer replied to '+esc(String(outcome.business_name||"your business"))+'</h2>'+
   '<p><strong>Customer:</strong> '+esc(customer)+'</p>'+
   '<p>Automatic follow-ups for this request have been stopped.</p>'+
   '<div style="padding:16px;background:#f4f8fa;border-radius:12px;white-space:pre-wrap">'+esc(snippet||"Reply received. Open your business inbox to review.")+'</div>'+
   '<p><strong>Reply directly to this email</strong> to respond to your customer.</p></div>';
  const notify=await fetch("https://api.resend.com/emails",{
   method:"POST",headers:{"Authorization":"Bearer "+emailKey,"Content-Type":"application/json",
    "Idempotency-Key":"tle-managed-reply-notify-"+inboundId},
   body:JSON.stringify({from:"The Launch Era <hello@thelaunchera.com>",
    to:[ownerEmail],reply_to:customer,subject:"Customer reply — "+String(outcome.business_name||"Booking Page").slice(0,90),
    html:messageHtml,text:"A customer replied: "+customer+"\\n\\n"+snippet+"\\n\\nFollow-ups stopped. Reply to this email to respond."}),
   signal:AbortSignal.timeout(12000)
  });
  if(!notify.ok)return new Response("Customer reply recorded; business notification needs retry",{status:503});
  const marked=await fetch(url+"/rest/v1/rpc/tle_booking_managed_reply_forwarded",{
   method:"POST",headers,body:JSON.stringify({p_message_id:inboundId})
  });
  if(!marked.ok)return new Response("Reply notification accepted; acknowledgement retry required",{status:503});
  return Response.json({ok:true,matched:true,followups_stopped:true,owner_notified:true});
 }
 const matched=recipients.map((x:any)=>String(x||"").toLowerCase().trim()).find((x:string)=>x==="3fd50e4e@nupelke.resend.app");
 if(!matched)return Response.json({ok:true,ignored:"not CRM reply inbox"});
 const sender=String(data.from||"").match(/<([^<>\s]+@[^<>\s]+)>/)?.[1]||String(data.from||"").trim();
 const inboundId=String(data.email_id||"");
 if(!inboundId)return Response.json({ok:true,ignored:"missing inbound id"});
 const url=Deno.env.get("SUPABASE_URL"),key=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
 if(!url||!key)return new Response("Reply service unavailable",{status:503});
 const outcome=await fetch(url+"/rest/v1/rpc/tle_crm_record_incoming_reply",{method:"POST",headers:{"apikey":key,"Authorization":"Bearer "+key,"Content-Type":"application/json"},body:JSON.stringify({p_sender:sender,p_recipient:matched,p_message_id:inboundId})});
 if(!outcome.ok){const err=await outcome.json().catch(()=>({}));return new Response("Reply recording unavailable: HTTP "+outcome.status+" / code "+String(err.code||"unknown"),{status:503})}
 const recorded=await outcome.json();
 return Response.json({ok:true,matched_reply:recorded===true});
}
const allowed=["email.sent","email.delivered","email.opened","email.clicked","email.bounced","email.failed","email.complained","email.suppressed"];
if(!allowed.includes(kind))return Response.json({ok:true,ignored:true});
const data=e.data||{},providerId=String(data.email_id||data.id||"");
if(!providerId)return Response.json({ok:true,ignored:"no provider id"});
const url=Deno.env.get("SUPABASE_URL")!,token=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const headers={"apikey":token,"Authorization":"Bearer "+token,"Content-Type":"application/json"};
// Correlate by provider ID only. The CRM send endpoint records its ID in email events;
// direct one-to-one scheduled mail records its ID in the prospect follow-up queue.
const match=await fetch(url+"/rest/v1/tle_crm_email_events?select=lead_id,workspace_id&event_type=eq.email_sent&details=like."+encodeURIComponent("*Resend id: "+providerId+"*")+"&order=created_at.desc&limit=1",{headers});
if(!match.ok)return new Response("CRM correlation unavailable",{status:500});
const rows=await match.json();
const q=await fetch(url+"/rest/v1/tle_crm_prospect_followup_queue?select=id,lead_id,workspace_id,status,sender_channel&message_id=eq."+encodeURIComponent(providerId)+"&limit=1",{headers});
if(!q.ok)return new Response("Follow-up correlation unavailable",{status:500});
const pending=await q.json();
const queued:any=pending.find((x:any)=>x.sender_channel==="resend_scheduled"&&["sending","sent","failed"].includes(x.status))||null;
if(!rows.length&&!queued){
 // The delivery webhook may arrive before the app records the provider ID.
 // Only request a retry for a matching approved CRM prospect and an exact
 // personalized first-contact subject. Never infer delivery or consent here.
 const recipient=Array.isArray(data.to)&&data.to.length===1?String(data.to[0]||"").trim():"";
 const sender=String(data.from||"").toLowerCase();
 const subject=String(data.subject||"");
 if(kind==="email.delivered"&&recipient&&sender.includes("hello@thelaunchera.com")&&subject){
  const lookup=await fetch(url+"/rest/v1/tle_crm_leads?select=id&email=ilike."+encodeURIComponent(recipient)+"&personalized_email_subject=eq."+encodeURIComponent(subject)+"&contact_decision=eq.yes&archived_at=is.null&limit=1",{headers});
  if(!lookup.ok)return new Response("CRM recipient correlation unavailable",{status:503});
  if((await lookup.json()).length)return new Response("CRM first-contact event not yet recorded; retry delivery update",{status:503});
 }
 return Response.json({ok:true,ignored:"not a CRM outbound email"});
}
const lead=rows[0]||queued;
const eventId=req.headers.get("svix-id")||"";
const eventTime=typeof e.created_at==="string"&&!isNaN(Date.parse(e.created_at))?e.created_at:new Date().toISOString();
if(kind==="email.sent"){
 if(queued){
  const eventDetails="Resend id: "+providerId;
  const prev=await fetch(url+"/rest/v1/tle_crm_email_events?select=id&lead_id=eq."+lead.lead_id+"&event_type=eq.email_sent&details=eq."+encodeURIComponent(eventDetails)+"&limit=1",{headers});
  if(!prev.ok)return new Response("Sent event lookup unavailable",{status:500});
  if(!(await prev.json()).length){
   const added=await fetch(url+"/rest/v1/tle_crm_email_events",{method:"POST",headers:{...headers,Prefer:"return=minimal"},body:JSON.stringify({workspace_id:lead.workspace_id,lead_id:lead.lead_id,event_type:"email_sent",details:eventDetails})});
   if(!added.ok)return new Response("Sent event logging unavailable",{status:500});
  }
  const statusUpdate=await fetch(url+"/rest/v1/tle_crm_prospect_followup_queue?id=eq."+queued.id+"&status=eq.sending",{method:"PATCH",headers:{...headers,Prefer:"return=minimal"},body:JSON.stringify({status:"sent",sent_at:eventTime,updated_at:new Date().toISOString()})});
  if(!statusUpdate.ok)return new Response("Follow-up send state unavailable",{status:500});
 }
 return Response.json({ok:true,matched:true,event_type:"email_sent"});
}
const details="Resend "+kind+" | message "+providerId+" | event "+eventId;
const eventType=["email.bounced","email.failed","email.suppressed","email.complained"].includes(kind)?"email_failed":kind==="email.delivered"?"email_delivered":kind==="email.opened"?"email_opened":kind==="email.clicked"?"email_clicked":kind;
const already=await fetch(url+"/rest/v1/tle_crm_email_events?select=id&lead_id=eq."+lead.lead_id+"&event_type=eq."+eventType+"&details=eq."+encodeURIComponent(details)+"&limit=1",{headers});
if(!already.ok)return new Response("Email event lookup unavailable",{status:500});
if(!(await already.json()).length){
 const write=await fetch(url+"/rest/v1/tle_crm_email_events",{method:"POST",headers:{...headers,Prefer:"return=minimal"},body:JSON.stringify({workspace_id:lead.workspace_id,lead_id:lead.lead_id,event_type:eventType,details})});
 if(!write.ok)return new Response("CRM event write failed",{status:500});
}
if(queued){
 if(eventType==="email_failed"){
  const failure=await fetch(url+"/rest/v1/tle_crm_prospect_followup_queue?id=eq."+queued.id+"&status=in.(sending,sent)",{method:"PATCH",headers:{...headers,Prefer:"return=minimal"},body:JSON.stringify({status:"failed",updated_at:new Date().toISOString()})});
  if(!failure.ok)return new Response("Follow-up failure state unavailable",{status:500});
  const stop=await fetch(url+"/rest/v1/tle_crm_leads?id=eq."+queued.lead_id,{method:"PATCH",headers:{...headers,Prefer:"return=minimal"},body:JSON.stringify({contact_decision:"no",email_followup_enabled:false,contact_decision_updated_at:new Date().toISOString(),updated_at:new Date().toISOString()})});
  if(!stop.ok)return new Response("Unable to prevent repeat failures",{status:500});
 }else if(eventType==="email_delivered"){
  // Provider delivery is authoritative evidence that the scheduled message was sent.
  const mark=await fetch(url+"/rest/v1/tle_crm_prospect_followup_queue?id=eq."+queued.id+"&status=eq.sending",{method:"PATCH",headers:{...headers,Prefer:"return=minimal"},body:JSON.stringify({status:"sent",sent_at:eventTime,updated_at:new Date().toISOString()})});
  if(!mark.ok)return new Response("Follow-up delivery state unavailable",{status:500});
 }
}
return Response.json({ok:true,matched:true,event_type:eventType});
});