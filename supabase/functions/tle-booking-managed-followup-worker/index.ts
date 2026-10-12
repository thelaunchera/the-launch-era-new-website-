import {decorateBusinessEmail,sendBusinessEmail} from "../_shared/business-email.ts";
import {createClient} from "npm:@supabase/supabase-js@2.57.0";
const res=(n:number,data:unknown)=>new Response(JSON.stringify(data),{status:n,headers:{"Content-Type":"application/json","Cache-Control":"no-store"}});
const clean=(x:unknown,n=200)=>String(x||"").replace(/[<>\r\n]/g,"").trim().slice(0,n);
const esc=(s:string)=>s.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;");
function color(v:any,fallback:string){return /^#[0-9a-fA-F]{6}$/.test(String(v||""))?String(v):fallback}
function ink(bg:string){const a=[1,3,5].map(i=>parseInt(bg.slice(i,i+2),16)/255).map(x=>x<=.04045?x/12.92:Math.pow((x+.055)/1.055,2.4));return .2126*a[0]+.7152*a[1]+.0722*a[2]>.4?"#191919":"#ffffff"}
function logo(value:string,name:string){
 try{const u=new URL(value);if(u.protocol==="https:"&&/\.(png|jpe?g|webp)$/i.test(u.pathname))return u.toString()}catch{}
 return /^cb\s*depot$/i.test(name)?"https://thelaunchera.com/assets/clients/cb-depot/approved-favicon-192.png":"";
}
Deno.serve(async req=>{
 if(req.method!=="POST")return res(405,{error:"Method not allowed"});
 const url=Deno.env.get("SUPABASE_URL"),service=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"),api=Deno.env.get("TLE_CRM_RESEND_API_KEY");
 if(!url||!service||!api)return res(503,{error:"Managed email infrastructure not ready"});
 const db=createClient(url,service,{auth:{persistSession:false,autoRefreshToken:false}});
 const token=req.headers.get("x-tle-worker-token")||"";
 if(token.length!==64)return res(401,{error:"Not authorized"});
 const {data:authorized,error:ae}=await db.rpc("tle_crm_worker_token_ok",{p_token:token});
 if(ae||authorized!==true)return res(401,{error:"Not authorized"});
 // Fail closed if a new customer reply has not yet been authenticated and
 // recorded by the signed inbound webhook. Check the provider inbox before
 // claiming a follow-up, so delayed webhook delivery cannot trigger mail.
 let cursor="";
 for(let page=0;page<4;page++){
  let incoming:Response;
  try{incoming=await fetch("https://api.resend.com/emails/receiving?limit=100"+(cursor?"&after="+encodeURIComponent(cursor):""),{
   headers:{"Authorization":"Bearer "+api},signal:AbortSignal.timeout(7000)})}
  catch{return res(503,{error:"Reply monitor unreachable; no email sent"})}
  if(!incoming.ok)return res(503,{error:"Reply monitor unavailable; no email sent"});
  const batch=await incoming.json().catch(()=>null);
  if(!Array.isArray(batch?.data))return res(503,{error:"Invalid inbox response; no email sent"});
  for(const item of batch.data){
   const tos=[...(Array.isArray(item.to)?item.to:[item.to]),...(Array.isArray(item.received_for)?item.received_for:[item.received_for])]
      .map(x=>String(x||"").trim().toLowerCase());
   if(!tos.some(to=>/^r-[0-9a-f-]{36}@nupelke\.resend\.app$/.test(to)))continue;
   if(!item.id)return res(503,{error:"Unidentified managed reply; no email sent"});
   // The provider retains old test messages even after their temporary lead
   // is deleted. Only current real customer replies may block live mail.
   const recipient=tos.find(to=>/^r-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}@nupelke\.resend\.app$/.test(to));
   if(!recipient)return res(503,{error:"Unrecognized managed reply address; no email sent"});
   const leadId=recipient.slice(2,38);
   const {data:replyLead,error:lookupError}=await db.from("tle_booking_flow_leads")
    .select("id,source,raw_payload").eq("id",leadId).maybeSingle();
   if(lookupError)return res(503,{error:"Could not verify a customer reply; no email sent"});
   if(!replyLead||(replyLead.source==="owner_qa_managed"&&replyLead.raw_payload?.managed_qa_test===true))continue;
   const {data:processed,error:pe}=await db.rpc("tle_booking_managed_reply_processed",{p_email_id:String(item.id)});
   if(pe||processed!==true)return res(503,{error:"Unprocessed live customer reply: pausing follow-ups until signed webhook completes"});
  }
  if(!batch.has_more)break;
  if(page===3||!batch.data.length)return res(503,{error:"Reply backlog not fully checked; no follow-up sent"});
  cursor=String(batch.data[batch.data.length-1].id||"");
  if(!cursor)return res(503,{error:"Reply pagination unavailable; no email sent"});
 }
 const {data:due,error:claimError}=await db.rpc("tle_booking_managed_followup_claim");
 if(claimError)return res(503,{error:"Could not claim eligible follow-up"});
 if(!due)return res(200,{ok:true,eligible:0,sent:0});
 const id=due.lead_id,step=Number(due.step);
 async function completed(provider:string|null,reason:string|null){
  const {data,error}=await db.rpc("tle_booking_managed_followup_complete",
   {p_lead_id:id,p_step:step,p_provider_id:provider,p_error:reason});
  return {ok:!error&&data?.ok===true};
 }
 const {data:lead,error:leadError}=await db.from("tle_booking_flow_leads")
  .select("id,account_id,customer_email,follow_up_count,follow_up_at,status,workflow_stage,raw_payload,service_name")
  .eq("id",id).eq("account_id",due.account_id).maybeSingle();
 if(leadError||!lead||lead.status!=="new"&&lead.status!=="contacted"||
   ["booked","closed","declined"].includes(lead.workflow_stage)||
   lead.raw_payload?.managed_reply_received||lead.raw_payload?.managed_unsubscribed_at){
   await completed(null,"Customer responded, unsubscribed, or request closed");
   return res(200,{ok:true,cancelled:1,sent:0});
 }
 const bytes=crypto.getRandomValues(new Uint8Array(32));
 const plainToken=Array.from(bytes,x=>x.toString(16).padStart(2,"0")).join("");
 const hashArr=new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(plainToken)));
 const tokenHash=Array.from(hashArr,x=>x.toString(16).padStart(2,"0")).join("");
 const {data:stored,error:storeError}=await db.rpc("tle_booking_managed_unsubscribe_create",{p_lead_id:id,p_hash:tokenHash});
 if(storeError||stored!==true){await completed(null,"Unsubscribe link could not be created");return res(503,{error:"Unsubscribe setup unavailable; no email sent"})}
 const unsubscribe=url+"/functions/v1/tle-booking-managed-unsubscribe?token="+plainToken;
 const replyTo="r-"+id+"@nupelke.resend.app";
 const lang=due.language==="es",first=step===1,category=due.category;
 const firstName=clean(due.customer_name,70).split(/\s+/)[0]||"there";
 const {data:branding,error:be}=await db.from("tle_booking_page_branding").select("business_name,logo_image,primary_color,accent_color,design_reviewed_at").eq("account_id",due.account_id).maybeSingle();
 if(be){await completed(null,"Brand identity unavailable");return res(503,{error:"Brand identity unavailable; no email sent"})}
 const business=clean(branding?.design_reviewed_at?branding.business_name:due.business_name,80)||"Your service provider";
 const businessLogo=logo(branding?.design_reviewed_at?branding.logo_image:"",business);
 const primary=color(branding?.design_reviewed_at?branding.primary_color:"","#191919"),accent=color(branding?.design_reviewed_at?branding.accent_color:"","#087DFF");
 const svc=clean(due.service_name,110)||(category==="detailing"?"car detailing":"service");
 let subject:string,paragraph:string;
 if(category==="detailing"){
  subject=lang?(first?"Seguimiento a tu solicitud de detailing":"¿Sigues interesado en el detailing?"):
   (first?"Following up on your detailing request":"Still interested in your detailing?");
  paragraph=lang?(first?"Queríamos saber si tienes preguntas sobre el servicio para tu vehículo. Responde directamente a este mensaje y te ayudaremos.":"Queríamos volver a saber de ti sobre tu solicitud. Si deseas continuar o tienes preguntas sobre tu vehículo, responde aquí."):
   (first?"Just following up on your vehicle detailing request. If you have questions about the quote or appointment, reply to this email.":"Checking in again about your detailing request. Reply here if you'd like to continue or have any questions.");
 }else{
  subject=lang?(first?"Seguimiento a tu solicitud de servicio":"¿Necesitas ayuda con tu solicitud?"):
   (first?"Following up on your service request":"Still need help with your request?");
  paragraph=lang?(first?"¿Todavía necesitas este servicio? Si tienes preguntas, responde directamente a este correo.":"Volvemos a contactarte sobre tu solicitud. Puedes responder aquí si necesitas ayuda."):
   (first?"Just checking whether you still need help with your service request. Reply here if you have questions.":"Checking in again about your request. Reply here if you need anything.");
 }
 // Use only the quote the owner actually sent. Keep existing consent, reply-stop
 // and idempotency checks; this does not introduce another email schedule.
 const approvedQuote=lead.raw_payload?.quote_offer;
 const quoteAmount=Number(approvedQuote?.amount);
 if(lead.workflow_stage==="quoted"&&Number.isFinite(quoteAmount)&&quoteAmount>0){
  const price=new Intl.NumberFormat(lang?"es-US":"en-US",{style:"currency",currency:approvedQuote?.currency==="CAD"?"CAD":"USD"}).format(quoteAmount);
  subject=lang?"¿Tienes preguntas sobre tu cotización?":"Any questions about your quote?";
  paragraph=lang
   ?"Queríamos saber si tienes alguna pregunta sobre tu cotización de "+price+" para "+svc+". Responde aquí si deseas continuar o aclarar un detalle. El horario se confirma por separado."
   :"Do you have any questions about your "+price+" quote for "+svc+"? Reply here if you would like to continue or clarify a detail. Your appointment time is confirmed separately.";
 }
 const footer=lang?"Para dejar de recibir recordatorios: ":"To stop receiving these reminders: ";
 const logoHtml=businessLogo?'<img src="'+esc(businessLogo)+'" alt="'+esc(business)+' logo" width="62" height="62" style="display:block;max-width:85px;max-height:62px;height:auto;border:0;margin-right:12px"/>':"";
 const html='<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="background:#f5f4f0;padding:24px 12px;margin:0;font-family:Arial,Helvetica,sans-serif">'+
 '<table role="presentation" cellspacing="0" cellpadding="0" style="width:100%;max-width:580px;margin:0 auto;background:#fff;border:1px solid #e7e1d8;border-radius:16px"><tr><td style="background:'+primary+';padding:20px 25px;border-radius:16px 16px 0 0"><table role="presentation"><tr><td>'+logoHtml+'</td><td style="font-size:20px;color:'+ink(primary)+';font-weight:800">'+esc(business)+'</td></tr></table></td></tr>'+
 '<tr><td style="padding:24px 25px;color:#191919;font-size:15px;line-height:1.6"><h2 style="font-size:22px">'+esc(lang?"Hola":"Hi")+' '+esc(firstName)+'</h2><p>'+esc(paragraph)+'</p>'+
 '<p style="font-size:12px;color:#4e6070;margin-top:24px">'+esc(footer)+'<a href="'+esc(unsubscribe)+'" style="color:'+accent+'">'+esc(lang?"Cancelar recordatorios":"Unsubscribe")+'</a></p></td></tr>'+
 '<tr><td style="background:#faf9f6;padding:16px 25px;border-top:1px solid #e6e2dc;font-size:11px;color:#777;border-radius:0 0 16px 16px">'+esc(business)+' · <a href="https://thelaunchera.com/" style="color:'+accent+';text-decoration:underline;font-weight:700">Powered by The Launch Era</a></td></tr></table></body></html>';
 let decorated;try{decorated=await decorateBusinessEmail(String(due.account_id),business,html,lang)}catch{await completed(null,"Business legal links unavailable; no email sent");return res(503,{error:"Business email footer unavailable"})}
 const msg={from:business+" <hello@thelaunchera.com>",
  to:[String(due.customer_email)],reply_to:replyTo,subject,html:decorated.html,
  text:(lang?"Hola ":"Hi ")+firstName+"\\n\\n"+paragraph+"\\n\\n"+footer+unsubscribe+decorated.textSuffix,
  headers:{"List-Unsubscribe":"<"+unsubscribe+">","List-Unsubscribe-Post":"List-Unsubscribe=One-Click"}};
 let accepted:Response;
 try{accepted=await fetch("https://api.resend.com/emails",{
  method:"POST",headers:{"Authorization":"Bearer "+api,"Content-Type":"application/json",
  "Idempotency-Key":"tle-managed-fu-"+id+"-"+step},
  body:JSON.stringify(msg),signal:AbortSignal.timeout(12000)})}
 catch{await completed(null,"Provider response uncertain: review before retry");return res(502,{error:"Provider response uncertain; no automatic retry"})}
 const result=await accepted.json().catch(()=>({}));
 if(!accepted.ok||typeof result.id!=="string"){
  await completed(null,"Provider rejected follow-up: HTTP "+accepted.status);
  return res(502,{error:"Provider did not accept message",http_status:accepted.status})}
 const saved=await completed(result.id,null);
 if(!saved.ok)return res(503,{sent:1,error:"Email accepted but follow-up record needs review"});
 return res(200,{ok:true,sent:1,step,category});
});
