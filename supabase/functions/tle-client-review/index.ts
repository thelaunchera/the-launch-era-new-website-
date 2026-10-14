import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.0";

const URL_ROOT=Deno.env.get("SUPABASE_URL")||"";
const SECRET=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")||"";
const api=URL_ROOT&&SECRET?createClient(URL_ROOT,SECRET,{auth:{persistSession:false,autoRefreshToken:false}}):null;
const ORIGINS=new Set(["https://thelaunchera.com","https://www.thelaunchera.com","https://the-launch-era-crm.dailinsegura17.workers.dev","https://command.thelaunchera.com"]);
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const respond=(data:unknown,status:number,origin:string)=>new Response(JSON.stringify(data),{status,headers:{"Content-Type":"application/json","Access-Control-Allow-Origin":ORIGINS.has(origin)?origin:"https://thelaunchera-crm.dailinsegura17.workers.dev","Access-Control-Allow-Headers":"authorization,apikey,content-type","Access-Control-Allow-Methods":"POST,OPTIONS","Cache-Control":"no-store","Vary":"Origin"}});
const now=()=>new Date().toISOString();
const text=(v:unknown,max=2000)=>String(v||"").trim().slice(0,max);
async function userFrom(req:Request) {
 const auth=req.headers.get("Authorization")||"";
 if(!/^Bearer \S+$/.test(auth)||!api)throw {code:401,message:"Please sign in first."};
 const {data,error}=await api.auth.getUser(auth.slice(7));
 if(error||!data.user)throw {code:401,message:"Your session expired. Sign in again."};
 return data.user;
}
async function ownerFrom(req:Request) {
 const u=await userFrom(req);
 const {data,error}=await api!.from("platform_admins").select("user_id").eq("user_id",u.id).maybeSingle();
 if(error||!data)throw {code:403,message:"Owner access required."};
 return u;
}
async function bookingForBuyer(req:Request) {
 const user=await userFrom(req);
 const {data:spaces,error:e}=await api!.from("tle_crm_workspaces").select("id").eq("created_by",user.id).eq("is_internal",false);
 if(e||!spaces?.length)throw {code:403,message:"A private buyer workspace is required."};
 const spaceIds=spaces.map(x=>x.id);
 const {data:accounts,error}=await api!.from("tle_booking_flow_accounts").select("id,business_name,owner_email,language,payment_status,intake_completed_at,status,delivery_sent_at,booking_page_url").in("crm_workspace_id",spaceIds).eq("payment_status","paid").order("created_at",{ascending:false}).limit(10);
 if(error||!accounts?.length)throw {code:404,message:"No paid Booking Page found for this account."};
 const acct=accounts.find(x=>!x.delivery_sent_at)||accounts[0];
 if(!acct.intake_completed_at||acct.status!=="active"||!acct.booking_page_url)throw {code:409,message:"Your preview is not ready for review."};
 return {id:acct.id,name:acct.business_name||"Your business",language:acct.language||"en",email:acct.owner_email,delivered:!!acct.delivery_sent_at,userId:user.id};
}
async function orderInfo(kind:string,id:string) {
 if(!uuid.test(id)||!["booking","ai"].includes(kind))throw {code:400,message:"Invalid order."};
 if(kind==="booking"){
  const {data,error}=await api!.from("tle_booking_flow_accounts").select("id,business_name,owner_email,language,payment_status,delivery_sent_at").eq("id",id).maybeSingle();
  if(error||!data||data.payment_status!=="paid")throw {code:404,message:"Paid order not found."};
  return {id,name:data.business_name||"Business",email:data.owner_email,language:data.language||"en",delivered:!!data.delivery_sent_at};
 }
 const {data,error}=await api!.from("tle_ai_agent_orders").select("id,business_name,customer_email,preferred_language,status,delivered_at").eq("id",id).maybeSingle();
 if(error||!data||!["intake_submitted","in_setup","active"].includes(data.status))throw {code:404,message:"AI order not ready."};
 return {id,name:data.business_name||"Business",email:data.customer_email,language:data.preferred_language||"en",delivered:!!data.delivered_at};
}
const maxRevisions=(kind:string)=>kind==="booking"?1:2;
async function review(kind:string,id:string) {
 const limit=maxRevisions(kind);
 const {error:insertError}=await api!.from("tle_client_reviews").upsert({subject_type:kind,subject_id:id,revisions_limit:limit},{onConflict:"subject_type,subject_id",ignoreDuplicates:true});
 if(insertError)throw {code:503,message:"Review history is unavailable."};
 const {data,error}=await api!.from("tle_client_reviews").select("*").eq("subject_type",kind).eq("subject_id",id).single();
 if(error||!data)throw {code:503,message:"Cannot load review history."};
 return data;
}
const safeState=(r:any,business?:string)=>({ok:true,status:r.status,revisions_used:r.revisions_used,revisions_limit:r.revisions_limit,revisions_remaining:r.revisions_limit-r.revisions_used,feedback:r.feedback||"",feedback_at:r.feedback_at||null,ready_at:r.ready_at||null,approved_at:r.approved_at||null,business_name:business||"",preview_url:r.preview_url||null});
async function ownerReminderState(r:any,info:any,kind:string){
 const state={manual_reminder_due_at:null as string|null,manual_reminder_ready_at:null as string|null,manual_reminder_available:false,
  manual_reminder_sent_at:null as string|null,manual_reminder_attempted:false,
  manual_reminder_last_error:null as string|null};
 if(kind!=="booking"||info.delivered||!["pending_review","ready_for_retest"].includes(r.status))return state;
 let readyAt:string|null=null;
 if(r.status==="ready_for_retest")readyAt=r.ready_at||null;
 else {
  const [acct,brand]=await Promise.all([
   api!.from("tle_booking_flow_accounts").select("activation_email_sent_at,delivery_sent_at,status").eq("id",info.id).single(),
   api!.from("tle_booking_page_branding").select("design_reviewed_at").eq("account_id",info.id).maybeSingle()
  ]);
  if(acct.error||brand.error||acct.data?.delivery_sent_at||acct.data?.status!=="active")return state;
  const start=acct.data?.activation_email_sent_at,design=brand.data?.design_reviewed_at;
  // Both the private access and reviewed design must be ready, not merely a purchase.
  if(start&&design)readyAt=new Date(Math.max(Date.parse(start),Date.parse(design))).toISOString();
 }
 if(!readyAt||!Number.isFinite(Date.parse(readyAt)))return state;
 const deadline=new Date(Date.parse(readyAt)+8*3600000).toISOString();
 const thisCycle=!!r.manual_reminder_cycle_at&&Math.abs(Date.parse(r.manual_reminder_cycle_at)-Date.parse(readyAt))<1000;
 return {manual_reminder_due_at:deadline,manual_reminder_ready_at:readyAt,
  manual_reminder_available:Date.now()>=Date.parse(deadline)&&!thisCycle,
  manual_reminder_sent_at:thisCycle?r.manual_reminder_sent_at||null:null,
  manual_reminder_attempted:thisCycle,
  manual_reminder_last_error:thisCycle?r.manual_reminder_last_error||null:null};
}
function customerCommandUrl(_businessName:string){
 // Buyer identities resolve their own workspaces inside one authenticated app.
 // Never route a review reminder to a public website or legacy Worker.
 return "https://thelaunchera.com/command-center/?from=private-access";
}
async function sendOwnerReminder(info:any,r:any,kind:string){
 if(kind!=="booking")throw {code:400,message:"Booking design approvals only."};
 if(info.delivered)throw {code:409,message:"Already delivered. No reminder needed."};
 const state=await ownerReminderState(r,info,kind);
 if(!state.manual_reminder_available||!state.manual_reminder_ready_at)
  throw {code:409,message:state.manual_reminder_attempted?"A reminder was already attempted for this review. Check its email status before retrying.":"The 8-hour review window has not elapsed, or the review was already completed."};
 if(!info.email||!/^\S+@\S+\.\S+$/.test(info.email))throw {code:409,message:"The buyer email address is not valid."};
 const key=Deno.env.get("TLE_CRM_RESEND_API_KEY")||"";
 if(!key)throw {code:503,message:"Email service unavailable. No reminder sent."};
 const {data:claimed,error:claimError}=await api!.rpc("tle_client_review_manual_reminder_claim",
 {p_booking_id:info.id,p_expected_ready_at:state.manual_reminder_ready_at});
 if(claimError)throw {code:503,message:"Could not reserve this reminder. No email sent."};
 if(!claimed?.ok)throw {code:409,message:claimed?.reason==="already_claimed"?"A reminder was already requested for this review.":"This review is no longer eligible for a reminder. Refresh its status."};
 // Recheck buyer action immediately before requesting provider delivery.
 const latest=await review(kind,info.id);
 if(!["pending_review","ready_for_retest"].includes(latest.status)||latest.approved_at){
  await api!.rpc("tle_client_review_manual_reminder_complete",{p_booking_id:info.id,
   p_ready_at:state.manual_reminder_ready_at,p_provider_id:null,p_error:"Buyer responded before send."});
  throw {code:409,message:"The client has already responded. No reminder was sent."};
 }
 const es=info.language==="es";
 const name=String(info.name||"your business").slice(0,100).replace(/[<>]/g,"");
 const link=customerCommandUrl(name);
 const esc=(v:string)=>v.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;");
 const subject=es?"Recordatorio: revisa el diseño de "+name:"Reminder: review your "+name+" design";
 // Master template: email-templates/client-design-approval-reminder.html
 // All buyer accounts reuse the same email layout; copy remains localized.
 const master="<!DOCTYPE html>\n<html lang=\"{{LANG}}\">\n<head><meta charset=\"UTF-8\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\"><meta http-equiv=\"X-UA-Compatible\" content=\"IE=edge\"><title>{{TITLE}}</title></head>\n<body style=\"margin:0;padding:0;background-color:#f3f5f5;font-family:Arial,Helvetica,sans-serif;\">\n<table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" role=\"presentation\" style=\"width:100%;background-color:#f3f5f5;\">\n<tr><td bgcolor=\"#f3f5f5\" align=\"center\" style=\"padding-top:30px;padding-bottom:30px;padding-left:14px;padding-right:14px;\">\n<table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" role=\"presentation\" style=\"width:100%;max-width:580px;background-color:#FAF8F3;border:1px solid #e0e4e6;border-radius:16px;overflow:hidden;\">\n<tr><td bgcolor=\"#191919\" style=\"padding-top:25px;padding-bottom:25px;padding-left:30px;padding-right:30px;background-color:#191919;\">\n<p style=\"font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:20px;font-weight:800;letter-spacing:2px;color:#F2D85B;margin-top:0;margin-bottom:6px;\">THE LAUNCH ERA</p>\n<p style=\"font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;color:#e2e4e6;margin-top:0;margin-bottom:0;\">A simpler way to run your business.</p>\n</td></tr>\n{{TEST_BANNER}}\n<tr><td bgcolor=\"#FAF8F3\" style=\"background-color:#FAF8F3;padding-top:32px;padding-bottom:33px;padding-left:30px;padding-right:30px;\">\n<table cellpadding=\"0\" cellspacing=\"0\" border=\"0\" role=\"presentation\"><tr><td bgcolor=\"#e5f0fb\" style=\"border-radius:20px;background-color:#e5f0fb;padding-top:7px;padding-bottom:7px;padding-left:13px;padding-right:13px;\"><p style=\"font-family:Arial,Helvetica,sans-serif;font-size:10px;line-height:14px;font-weight:800;letter-spacing:1.2px;color:#285c8e;margin:0;\">{{EYEBROW}}</p></td></tr></table>\n<h1 style=\"font-family:Arial,Helvetica,sans-serif;font-size:29px;line-height:36px;font-weight:800;letter-spacing:-0.5px;color:#191919;margin-top:20px;margin-bottom:17px;\">{{TITLE}}</h1>\n<p style=\"font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:25px;color:#323436;margin-top:0;margin-bottom:18px;\">{{GREETING}}</p>\n<p style=\"font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:25px;color:#323436;margin-top:0;margin-bottom:18px;\">{{MESSAGE}}</p>\n<table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" role=\"presentation\" style=\"width:100%;background-color:#ffffff;border:1px solid #e4e8eb;border-radius:12px;\"><tr>\n<td bgcolor=\"#ffffff\" style=\"background-color:#ffffff;padding-top:18px;padding-bottom:18px;padding-left:20px;padding-right:20px;\">\n<p style=\"font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:17px;font-weight:800;letter-spacing:1px;color:#285c8e;margin-top:0;margin-bottom:9px;\">{{STEP_LABEL}}</p>\n<p style=\"font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:24px;color:#191919;margin-top:0;margin-bottom:0;\">{{STEP_TEXT}}</p>\n</td></tr></table>\n<table cellpadding=\"0\" cellspacing=\"0\" border=\"0\" role=\"presentation\" style=\"margin-top:25px;margin-bottom:19px;\"><tr><td bgcolor=\"#191919\" align=\"center\" style=\"background-color:#191919;border-radius:9px;padding-top:15px;padding-bottom:15px;padding-left:25px;padding-right:25px;\">\n<a href=\"{{ACTION_URL}}\" style=\"display:inline-block;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:700;line-height:20px;color:#ffffff;text-decoration:none;\">{{CTA}} &rarr;</a>\n</td></tr></table>\n<p style=\"font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:21px;color:#59646d;margin-top:0;margin-bottom:10px;\">{{NOTE}}</p>\n<p style=\"font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:20px;color:#59646d;margin-top:0;margin-bottom:0;\">{{FOLDERS}}</p>\n</td></tr>\n<tr><td bgcolor=\"#e9f2fa\" style=\"background-color:#e9f2fa;padding-top:17px;padding-bottom:19px;padding-left:30px;padding-right:30px;border-top:1px solid #dce5ed;\">\n<p style=\"font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:19px;font-weight:700;color:#191919;margin-top:0;margin-bottom:5px;\">THE LAUNCH ERA</p>\n<p style=\"font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:19px;color:#4c5963;margin-top:0;margin-bottom:0;\">{{FOOTER}}</p>\n</td></tr>\n</table></td></tr></table>\n</body></html>";
 const vars:Record<string,string>={
  LANG:es?"es":"en",
  TITLE:es?"Tu diseño está listo para revisar.":"Your design is ready for review.",
  EYEBROW:es?"REVISIÓN DEL DISEÑO":"DESIGN REVIEW",
  GREETING:es?"¡Hola!":"Hello,",
  MESSAGE:es?"La página de reservas y el Command Center de "+name+" ya están preparados para que los revises.":"Your personalized Booking Page and Command Center for "+name+" are ready for your review.",
  STEP_LABEL:es?"SOLO UN PASO":"ONE QUICK STEP",
  STEP_TEXT:es?"Entra a tu Centro de Pruebas y selecciona Aprobar y continuar o Solicitar cambios.":"Open your Test Center and choose Approve & Continue or Request Changes.",
  CTA:es?"Abrir mi Centro de Pruebas":"Open My Test Center",
  ACTION_URL:link,
  NOTE:es?"Esto es una revisión del diseño, no la entrega final. Si ya respondiste, puedes ignorar este recordatorio.":"This is a design review, not final delivery. If you've already responded, you can ignore this reminder.",
  FOLDERS:es?"Si no encuentras nuestros correos, revisa Promociones y Spam.":"If you don't see our emails, check Promotions and Spam/Junk.",
  FOOTER:es?"¿Tienes preguntas? Responde a este correo y te ayudaremos.":"Questions? Reply to this email and we'll help.",
  TEST_BANNER:""
 };
 let html=master;
 for(const [key,value] of Object.entries(vars)){
  html=html.replaceAll("{{"+key+"}}",key==="TEST_BANNER"?"":esc(value));
 }
 const title=vars.TITLE;
 const body=vars.MESSAGE+"\n\n"+vars.STEP_TEXT;
 const note=vars.NOTE;
 const idempotency="tle-review12h-"+info.id+"-"+Date.parse(state.manual_reminder_ready_at);
 let accepted:Response;
 try {
  accepted=await fetch("https://api.resend.com/emails",{
   method:"POST",headers:{"Authorization":"Bearer "+key,"Content-Type":"application/json","Idempotency-Key":idempotency},
   body:JSON.stringify({from:"The Launch Era <hello@thelaunchera.com>",to:[info.email],
   reply_to:"hello@thelaunchera.com",subject,html,
   text:title+"\n\n"+body+"\n\n"+link+"\n\n"+note+"\n\nThe Launch Era"}),
   signal:AbortSignal.timeout(12000)
  });
 }catch{
  await api!.rpc("tle_client_review_manual_reminder_complete",{p_booking_id:info.id,
   p_ready_at:state.manual_reminder_ready_at,p_provider_id:null,p_error:"Provider status uncertain. Verify before another attempt."});
  throw {code:502,message:"The email provider did not confirm acceptance. Verify its status before retrying; no duplicate will be sent automatically."};
 }
 const out=await accepted.json().catch(()=>({}));
 if(!accepted.ok||typeof out.id!=="string"){
  await api!.rpc("tle_client_review_manual_reminder_complete",{p_booking_id:info.id,
   p_ready_at:state.manual_reminder_ready_at,p_provider_id:null,p_error:"Provider rejected: HTTP "+accepted.status});
  throw {code:502,message:"The email provider did not accept the reminder. Check the sending status."};
 }
 const {error:writeError}=await api!.rpc("tle_client_review_manual_reminder_complete",{
  p_booking_id:info.id,p_ready_at:state.manual_reminder_ready_at,p_provider_id:out.id,p_error:null});
 if(writeError)throw {code:503,message:"The email provider accepted the reminder but status logging needs review. Do not send again."};
 return {ok:true,notification_accepted:true,provider_message_id:out.id,
  reminder_sent_at:now(),message:"Reminder accepted by email provider; inbox delivery is not yet confirmed."};
}
async function digest(token:string) {
 const sum=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(token));
 return [...new Uint8Array(sum)].map(x=>x.toString(16).padStart(2,"0")).join("");
}
async function createLink(id:string,previewUrl:string|undefined) {
 const token=Array.from(crypto.getRandomValues(new Uint8Array(32))).map(x=>x.toString(16).padStart(2,"0")).join("");
 const hashed=await digest(token);
 const expires=new Date(Date.now()+14*86400000).toISOString();
 const row:any={link_hash:hashed,link_expires_at:expires,updated_at:now()};
 if(previewUrl)row.preview_url=previewUrl;
 const {error}=await api!.from("tle_client_reviews").update(row).eq("subject_type","ai").eq("subject_id",id);
 if(error)throw {code:503,message:"Could not prepare secure review link."};
 return {url:"https://thelaunchera.com/client-review/?token="+token,expires_at:expires};
}
function validateLink(value:unknown) {
 const u=text(value,350);
 let parsed:URL;try{parsed=new URL(u)}catch{throw {code:400,message:"Enter a working https preview URL."}};
 if(parsed.protocol!=="https:"||!parsed.hostname.includes(".")||parsed.username||parsed.password)throw {code:400,message:"The preview URL must be an HTTPS address."};
 return parsed.toString();
}
async function recordReview(kind:string,id:string,actor:string,decision:string,note:string,business:string,recipient:string) {
 const r=await review(kind,id);
 const isApprove=decision==="approve";
 if(!["pending_review","ready_for_retest"].includes(r.status))throw {code:409,message:r.status==="approved"?"Already approved.":"Your request is being revised. Please wait until the corrected version is ready."};
 if(!isApprove&&note.length<12)throw {code:400,message:"Describe what should be corrected (at least 12 characters)."};
 if(!isApprove&&r.revisions_used>=r.revisions_limit)throw {code:409,message:"All included revisions have been used. Contact The Launch Era about additional changes."};
 const update:any={status:isApprove?"approved":"changes_requested",updated_at:now()};
 if(isApprove){update.approved_at=now();update.reviewed_by=uuid.test(actor)?actor:null;}
 else{update.feedback=note;update.feedback_at=now();update.revisions_used=r.revisions_used+1;update.approved_at=null;update.reviewed_by=null;update.ready_at=null;}
 const {data,error}=await api!.from("tle_client_reviews").update(update)
  .eq("subject_type",kind).eq("subject_id",id).eq("status",r.status).eq("revisions_used",r.revisions_used).select("*").maybeSingle();
 if(error)throw {code:503,message:"Could not save your review."};
 if(!data)throw {code:409,message:"This review changed in another session. Refresh and try again."};
 if(!isApprove&&kind==="booking"){
   // A revision reopens design approval and earlier technical checks for an owner retest.
   await api!.from("tle_booking_page_branding").update({design_reviewed_at:null}).eq("account_id",id);
 }
 if(!isApprove)await notifyOwner(kind,business,note,data.revisions_used,data.revisions_limit);
 return safeState(data,business);
}
async function notifyOwner(kind:string,business:string,note:string,used:number,limit:number) {
 const key=Deno.env.get("TLE_CRM_RESEND_API_KEY")||"";
 if(!key)return;
 try{
  await fetch("https://api.resend.com/emails",{method:"POST",headers:{"Authorization":"Bearer "+key,"Content-Type":"application/json"},body:JSON.stringify({
    from:"The Launch Era <hello@thelaunchera.com>",to:["hello@thelaunchera.com"],
    subject:business+" — Client requested changes ("+used+"/"+limit+")",
    text:"A client requested their included revision.\nProduct: "+(kind==="ai"?"AI Assistant":"Booking Page + Command Center")+"\nBusiness: "+business+"\nRevision: "+used+" of "+limit+"\nRequested changes:\n"+note+"\n\nOpen your private Command Center > Owner Settings > Client Delivery to make corrections and return the preview."
  })});
 }catch(e){console.error("Revision owner notification failed",String(e).slice(0,120))}
}
async function notifyBuyer(info:any,kind:string,url:string) {
 const key=Deno.env.get("TLE_CRM_RESEND_API_KEY")||"";
 if(!key||!info.email)return false;
 const es=info.language==="es",business=String(info.name||"Your business").slice(0,110);
 let image="",primary="#191919",accent="#176dd8";
 try{
  const q=kind==="booking"
   ?api!.from("tle_booking_page_branding").select("logo_image,primary_color,accent_color,design_reviewed_at").eq("account_id",info.id).maybeSingle()
   :api!.from("tle_ai_agent_orders").select("brand_logo_url,brand_primary_color,brand_accent_color").eq("id",info.id).maybeSingle();
  const {data:brand,error:brandErr}=await q;
  if(!brandErr&&brand&&(kind!=="booking"||("design_reviewed_at" in brand&&brand.design_reviewed_at))){
   const raw=String("logo_image" in brand?brand.logo_image||"":("brand_logo_url" in brand?brand.brand_logo_url||"":""));
   try{const u=new URL(raw);if(u.protocol==="https:"&&/\\.(png|jpe?g|webp)$/i.test(u.pathname))image=u.toString()}catch{}
   const p="primary_color" in brand?brand.primary_color:("brand_primary_color" in brand?brand.brand_primary_color:null);
   const a="accent_color" in brand?brand.accent_color:("brand_accent_color" in brand?brand.brand_accent_color:null);
   if(/^#[0-9a-fA-F]{6}$/.test(String(p||"")))primary=String(p);
   if(/^#[0-9a-fA-F]{6}$/.test(String(a||"")))accent=String(a);
  }
 }catch{}
 if(!image&&/^cb\\s*depot$/i.test(business))image="https://thelaunchera.com/assets/clients/cb-depot/approved-favicon-192.png";
 const rgb=[1,3,5].map(i=>parseInt(primary.slice(i,i+2),16)/255).map(x=>x<=.04045?x/12.92:Math.pow((x+.055)/1.055,2.4));
 const foreground=.2126*rgb[0]+.7152*rgb[1]+.0722*rgb[2]>.4?"#191919":"#ffffff";
 const name=business.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;");
 const logo=image?'<img src="'+image+'" alt="'+name+' logo" width="52" height="52" style="display:block;height:auto;max-width:70px;max-height:52px;border:0;margin-right:13px"/>':"";
 const target=String(url||"");
 if(!/^https:\/\//.test(target))return false;
 const safeUrl=target.replaceAll("&","&amp;").replaceAll('"',"&quot;").replaceAll("<","&lt;");
 const product=kind==="ai"?(es?"asistente de IA":"AI Assistant"):(es?"Booking Page y Command Center":"Booking Page + Command Center");
 const subject=es?business+" — Ya puedes revisar los cambios de tu "+product:business+" — Your updated "+product+" is ready to review";
 const greeting=es?"¡Hola!":"Hello,";
 const message=es?"Ya realizamos los cambios que solicitaste para "+name+". Tu vista previa actualizada está lista para revisar.":"We made the changes you requested for "+name+". Your updated preview is ready for another look.";
 const step=es?"Abre el Test Center, realiza una prueba y selecciona Aprobar diseño o Solicitar cambios (si todavía tienes revisiones incluidas).":"Open the Test Center, run a private sample test, and choose Approve Design or Request Changes (if you have an included revision remaining).";
 const note=es?"Esto es una revisión del diseño, no la entrega final. Si no ves el correo, revisa Promociones y Spam.":"This is a design review, not final delivery. If you can't find the email, check Promotions and Spam/Junk.";
 const button=es?"Revisar mi diseño":"Review my design";
 const html='<!doctype html><html lang="'+(es?"es":"en")+'"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;background:#f3f5f5;padding:25px 12px;font-family:Arial,Helvetica,sans-serif;color:#191919"><table role="presentation" cellspacing="0" cellpadding="0" style="max-width:560px;width:100%;margin:auto;background:#fff;border:1px solid #e0e4e8;border-radius:14px"><tr><td style="background:'+primary+';padding:21px 26px;color:'+foreground+';font-size:15px;letter-spacing:1px;font-weight:800"><table role="presentation" cellspacing="0" cellpadding="0"><tr><td>'+logo+'</td><td style="color:'+foreground+';font-size:18px;font-weight:800">'+name+'<div style="font-size:10px;letter-spacing:.09em;font-weight:600;margin-top:5px">THE LAUNCH ERA · PRIVATE REVIEW</div></td></tr></table></td></tr><tr><td style="padding:26px;font-size:15px;line-height:1.65"><h1 style="font-size:24px;margin:0 0 15px">'+name+'</h1><p>'+greeting+'</p><p>'+message+'</p><p>'+step+'</p><a href="'+safeUrl+'" style="display:inline-block;border-radius:10px;padding:12px 19px;background:#191919;color:#ffffff;text-decoration:none;font-weight:800">'+button+' →</a><p style="font-size:12px;color:#53616b;margin-top:20px">'+note+'</p></td></tr><tr><td style="border-top:1px solid #e0e4e8;padding:16px 26px;color:#53616b;font-size:11px">'+name+' · <span style="font-weight:700">Powered by The Launch Era</span></td></tr></table></body></html>';
 const plain=es?"Hola,\n\nYa realizamos los cambios que solicitaste para "+business+".\n\nRevisa tu diseño: "+target+"\n\n"+step+"\n\n"+note+"\n\nThe Launch Era":
 "Hello,\n\nWe made the changes you requested for "+business+".\n\nReview your design: "+target+"\n\n"+step+"\n\n"+note+"\n\nThe Launch Era";
 try{
  const res=await fetch("https://api.resend.com/emails",{method:"POST",headers:{"Authorization":"Bearer "+key,"Content-Type":"application/json"},body:JSON.stringify({
   from:"The Launch Era <hello@thelaunchera.com>",to:[info.email],reply_to:"hello@thelaunchera.com",
   subject,html,text:plain
  })});
  return res.ok;
 }catch(e){console.error("Client review notification failed",String(e).slice(0,120));return false}
}

Deno.serve(async(req)=>{
 const origin=req.headers.get("origin")||"";
 if(req.method==="OPTIONS")return new Response(null,{status:204,headers:{"Access-Control-Allow-Origin":ORIGINS.has(origin)?origin:"https://thelaunchera.com","Access-Control-Allow-Headers":"authorization,apikey,content-type","Access-Control-Allow-Methods":"POST,OPTIONS","Vary":"Origin"}});
 if(req.method!=="POST")return respond({error:"POST required"},405,origin);
 if(!ORIGINS.has(origin))return respond({error:"Origin not permitted"},403,origin);
 if(!api)return respond({error:"Review system unavailable"},503,origin);
 try{
  const body=await req.json().catch(()=>({}));
  const action=text(body.action,40);
  if(["buyer_status","buyer_decision"].includes(action)){
    const buyer=await bookingForBuyer(req);
    const r=await review("booking",buyer.id);
    if(action==="buyer_status")return respond({...safeState(r,buyer.name),technical_test_is_separate:true,delivered:buyer.delivered},200,origin);
    if(buyer.delivered)throw {code:409,message:"This system is already delivered. Contact support for post-delivery requests."};
    const decision=text(body.decision,25);
    if(!["approve","request_changes"].includes(decision))throw {code:400,message:"Choose approve or request changes."};
    const saved=await recordReview("booking",buyer.id,buyer.userId,decision,text(body.feedback,2000),buyer.name,buyer.email);
    return respond(saved,200,origin);
  }
  if(["ai_status","ai_decision"].includes(action)){
   const token=text(body.token,200);
   if(!/^[0-9a-f]{64}$/i.test(token))throw {code:403,message:"This review link is invalid."};
   const hashed=await digest(token);
   const {data:r,error}=await api.from("tle_client_reviews").select("*").eq("subject_type","ai").eq("link_hash",hashed).gt("link_expires_at",now()).maybeSingle();
   if(error||!r)throw {code:403,message:"This review link is expired or invalid. Request a fresh link from The Launch Era."};
   const info=await orderInfo("ai",r.subject_id);
   if(action==="ai_status")return respond({...safeState(r,info.name),delivered:info.delivered,language:info.language==="es"?"es":"en"},200,origin);
   if(info.delivered)throw {code:409,message:"This AI Assistant has already been delivered."};
   const decision=text(body.decision,25);
   if(!["approve","request_changes"].includes(decision))throw {code:400,message:"Choose approve or request changes."};
   return respond({...await recordReview("ai",r.subject_id,"",decision,text(body.feedback,2000),info.name,info.email),language:info.language==="es"?"es":"en"},200,origin);
  }
  if(["owner_get","owner_mark_ready","owner_issue_ai_link","owner_send_review_reminder"].includes(action)){
   await ownerFrom(req);
   const kind=text(body.subject_type,12);
   const id=text(body.subject_id,50);
   if(!uuid.test(id)||!["booking","ai"].includes(kind))throw {code:400,message:"Choose a client order."};
   const info=await orderInfo(kind,id);
   const r=await review(kind,id);
   if(action==="owner_get")return respond({...safeState(r,info.name),...(await ownerReminderState(r,info,kind))},200,origin);
   if(action==="owner_send_review_reminder")return respond(await sendOwnerReminder(info,r,kind),200,origin);
   if(info.delivered)throw {code:409,message:"Already delivered. This preview review is closed."};
   if(action==="owner_issue_ai_link"){
     if(kind!=="ai")throw {code:400,message:"AI orders only."};
     const link=await createLink(id,validateLink(body.preview_url));
     return respond({...safeState(await review(kind,id),info.name),...link},200,origin);
   }
   if(r.status!=="changes_requested")throw {code:409,message:"Mark ready only after the buyer requests changes."};
   if(kind==="booking"){
     const {data:design}=await api.from("tle_booking_page_branding").select("design_reviewed_at").eq("account_id",id).maybeSingle();
     if(!design?.design_reviewed_at)throw {code:409,message:"First save and approve the corrected buyer design in the owner designer."};
   }
   const updated={status:"ready_for_retest",ready_at:now(),updated_at:now()};
   const {data,error}=await api.from("tle_client_reviews").update(updated).eq("subject_type",kind).eq("subject_id",id).eq("status","changes_requested").select("*").maybeSingle();
   if(error||!data)throw {code:409,message:"The review changed. Refresh it."};
   let link=kind==="booking"?customerCommandUrl(info.name):"";
   if(kind==="ai"){const newLink=await createLink(id,undefined);link=newLink.url;}
   const notified=await notifyBuyer(info,kind,link);
   return respond({...safeState(data,info.name),notification_accepted:notified,review_url:kind==="ai"?link:undefined},200,origin);
  }
  throw {code:400,message:"Unsupported action"};
 }catch(e){const error=e as {code?:number,message?:string};return respond({error:error.message||"Unable to process this review"},error.code||500,origin);}
});