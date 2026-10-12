import {decorateBusinessEmail,sendBusinessEmail} from "../_shared/business-email.ts";
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import {createClient} from "npm:@supabase/supabase-js@2.57.0";
const HOOK="https://hook.us2.make.com/ztirdqf4g4i9i1npb0k4lsci4zt822gf";
const SAFE={"Content-Type":"text/html; charset=utf-8","Cache-Control":"no-store","Referrer-Policy":"no-referrer","X-Content-Type-Options":"nosniff","Content-Security-Policy":"default-src 'none'; form-action 'self'; style-src 'unsafe-inline'; base-uri 'none'; frame-ancestors 'none'"};
const escape=(s:unknown)=>String(s??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
const clean=(s:unknown,max=450)=>String(s??"").trim().slice(0,max);
const page=(title:string,body:string)=>new Response('<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width,initial-scale=1"><meta charset="utf-8"><title>'+escape(title)+' · Booking Request</title><style>:root{font-family:Arial,Helvetica,sans-serif;background:#FAF8F3;color:#191919}body{margin:0;padding:26px 16px}main{max-width:570px;margin:25px auto;background:#fff;border:1px solid #d6e8f1;border-radius:24px;padding:clamp(20px,5vw,35px);box-shadow:0 12px 44px #24476612}.brand{font-size:12px;letter-spacing:.15em;color:#5c839b;font-weight:800}h1{font-size:28px;letter-spacing:-.04em;margin:18px 0}p{color:#536779;line-height:1.6}label{display:block;margin:16px 0 7px;color:#344b5a;font-weight:700;font-size:14px}input,textarea{box-sizing:border-box;width:100%;border:1px solid #b9d1e0;border-radius:12px;padding:12px;font:inherit}textarea{resize:vertical}button{border:0;background:#22658e;color:#fff;font:inherit;font-weight:700;padding:13px 18px;border-radius:12px;margin:13px 10px 6px 0;cursor:pointer}.secondary{background:#eaf5fb;color:#285b76}.info{background:#edf6fc;padding:12px 14px;border-radius:12px;font-size:13px}small{display:block;color:#577183;margin-top:14px;line-height:1.5}</style></head><body><main><div class="brand">✳ BOOKING SUPPORT</div>'+body+'</main></body></html>',{status:200,headers:SAFE});
const renderError=(x:string)=>page("Unable to open request","<h1>We couldn't open this request</h1><p>"+escape(x)+"</p><p>Please contact the business that sent this link directly for help.</p>");
async function hash(str:string){const h=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(str));return Array.from(new Uint8Array(h),n=>n.toString(16).padStart(2,"0")).join("")}
const html=(x:unknown)=>escape(x);
function brandColor(v:any,fallback:string){return /^#[0-9a-fA-F]{6}$/.test(String(v||""))?String(v):fallback}
function ink(bg:string){const a=[1,3,5].map(i=>parseInt(bg.slice(i,i+2),16)/255).map(x=>x<=.04045?x/12.92:Math.pow((x+.055)/1.055,2.4));return .2126*a[0]+.7152*a[1]+.0722*a[2]>.4?"#191919":"#ffffff"}
function emailLogo(raw:any,business:string){try{const u=new URL(String(raw||""));if(u.protocol==="https:"&&/\.(png|jpe?g|webp)$/i.test(u.pathname))return u.toString()}catch{}return /^cb\s*depot$/i.test(business)?"https://thelaunchera.com/assets/clients/cb-depot/approved-favicon-192.png":""}
function mailShell(inner:string,business:string,logo:string,primary:string,accent:string){
 const image=logo?'<img src="'+html(logo)+'" width="60" height="60" style="display:block;max-height:60px;max-width:90px;height:auto;border:0;margin-right:12px" alt="'+html(business)+' logo"/>':"";
 return '<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="background:#f5f4f1;padding:24px 12px;margin:0;font-family:Arial,Helvetica,sans-serif"><table role="presentation" cellspacing="0" cellpadding="0" style="width:100%;max-width:580px;margin:auto;border:1px solid #e3ded6;background:#fff;border-radius:16px"><tr><td style="background:'+primary+';padding:20px 25px;border-radius:16px 16px 0 0"><table role="presentation"><tr><td>'+image+'</td><td style="color:'+ink(primary)+';font-size:20px;font-weight:800">'+html(business)+'</td></tr></table></td></tr><tr><td style="padding:24px;color:#191919;font-size:15px;line-height:1.6">'+inner+'</td></tr><tr><td style="background:#faf9f6;border-top:1px solid #e3ded6;border-radius:0 0 16px 16px;padding:15px 24px;color:#777;font-size:11px">'+html(business)+' · <a href="https://thelaunchera.com/" style="color:'+accent+';text-decoration:underline;font-weight:700">Powered by The Launch Era</a></td></tr></table></body></html>';
}
Deno.serve(async(req)=>{
 if(!["GET","POST"].includes(req.method))return new Response("Method not allowed",{status:405});
 const url=Deno.env.get("SUPABASE_URL"),service=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
 if(!url||!service)return renderError("This service is temporarily unavailable.");
 const db=createClient(url,service,{auth:{persistSession:false,autoRefreshToken:false}});
 const params=new URL(req.url).searchParams;
 const form=req.method==="POST"?await req.formData().catch(()=>null):null;
 const raw=clean(form?.get("token")||params.get("token"),160);
 if(!/^[a-f0-9]{64}$/i.test(raw))return renderError("This private link is invalid.");
 const digest=await hash(raw);
 const {data:link,error:linkError}=await db.from("tle_booking_customer_change_links").select("id,account_id,lead_id,expires_at,revoked_at,last_action_at").eq("token_hash",digest).maybeSingle();
 if(linkError||!link||link.revoked_at||Date.parse(link.expires_at)<=Date.now())return renderError("This link is expired or no longer available.");
 const [{data:lead},{data:account}]=await Promise.all([
  db.from("tle_booking_flow_leads").select("id,account_id,customer_name,customer_email,preferred_language,service_name,status,workflow_stage,raw_payload,requested_start_at").eq("id",link.lead_id).eq("account_id",link.account_id).maybeSingle(),
  db.from("tle_booking_flow_accounts").select("id,business_name,business_category,owner_email,notification_email,crm_workspace_id").eq("id",link.account_id).maybeSingle()
 ]);
 if(!lead||!account)return renderError("The booking is no longer available.");
 const es=lead.preferred_language==="es";
 const label=(en:string,spanish:string)=>es?spanish:en;
 if(req.method==="GET"){
  if(lead.status!=="booked")return page(label("Booking status","Estado de reserva"),"<h1>"+label("This is no longer a confirmed booking.","Esta reserva ya no está confirmada.")+"</h1><p>"+label("Contact the business directly if you need assistance.","Contacta directamente con el negocio si necesitas ayuda.")+"</p>");
  const action=clean(params.get("action"),20);
  const change=action==="reschedule";
  const cancel=action==="cancel";
  let body="<h1>"+escape(label("Manage your booking","Gestiona tu reserva"))+"</h1><p><strong>"+escape(account.business_name)+"</strong></p><div class=\"info\">"+escape(lead.service_name||(account.business_category==="detailing"?"Car detailing":account.business_category==="other"?"Service":"Cleaning service"))+"</div><p>"+escape(label("You can ask to cancel or reschedule. The business will review your request and confirm the change. Your existing booking remains unchanged until then.","Puedes solicitar cancelar o cambiar la fecha. El negocio revisará tu solicitud y confirmará el cambio. Tu reserva actual sigue igual hasta entonces."))+"</p>";
  if(!change&&!cancel){
   body+='<a href="?token='+raw+'&amp;action=reschedule">'+escape(label("Request reschedule","Solicitar otra fecha"))+'</a><p><a href="?token='+raw+'&amp;action=cancel">'+escape(label("Request cancellation","Solicitar cancelación"))+"</a></p>";
  }else{
   body+='<form method="post"><input type="hidden" name="token" value="'+raw+'"><input type="hidden" name="action" value="'+(change?"reschedule":"cancel")+'">';
   if(change)body+='<label>'+label("Preferred new date","Nueva fecha preferida")+'</label><input type="date" name="date" required><label>'+label("Preferred start time","Hora preferida")+'</label><input type="time" name="time" required step="1800">';
   body+='<label>'+label("Message (optional)","Mensaje (opcional)")+'</label><textarea name="message" rows="4" maxlength="750" placeholder="'+escape(label("Anything we should know?","¿Algo que debamos saber?"))+'"></textarea><button type="submit">'+label("Submit request","Enviar solicitud")+'</button></form><p><a href="?token='+raw+'">'+label("Back","Volver")+"</a></p>";
  }
  body+="<small>"+label("This link is private. Do not share it.","Este enlace es privado. No lo compartas.")+"</small>";
  const response=page(label("Manage booking","Gestionar reserva"),body);
  return new Response(response.body,{status:200,headers:{...SAFE,"Content-Language":es?"es":"en"}});
 }
 if(lead.status!=="booked")return renderError("Only confirmed bookings can be changed.");
 const action=clean(form?.get("action"),20);
 if(!["cancel","reschedule"].includes(action))return renderError("Unknown request type.");
 const date=clean(form?.get("date"),10),time=clean(form?.get("time"),5),message=clean(form?.get("message"),750);
 if(action==="reschedule"&&(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(time)))return renderError("Select a valid date and time.");
 if(action==="reschedule"&&date<new Date().toISOString().slice(0,10))return renderError("Please choose a future date.");
 if(link.last_action_at&&Date.now()-Date.parse(link.last_action_at)<120000)return page(label("Request received","Solicitud recibida"),"<h1>"+label("We have your recent request.","Ya tenemos tu solicitud reciente.")+"</h1><p>"+label("The business will review it. You don't need to submit it again.","El negocio la revisará. No necesitas enviarla otra vez.")+"</p>");
 const request={action,preferred_date:date||null,preferred_time:time||null,message,requested_at:new Date().toISOString(),state:"pending_owner_review"};
 const rawData=lead.raw_payload&&typeof lead.raw_payload==="object"&&!Array.isArray(lead.raw_payload)?lead.raw_payload:{};
 const {error:ue}=await db.from("tle_booking_flow_leads").update({
  raw_payload:{...rawData,customer_change_request:request},
  updated_at:new Date().toISOString()
 }).eq("id",lead.id).eq("account_id",account.id).eq("status","booked");
 if(ue)return renderError("Could not save your request. Please contact the business.");
 await db.from("tle_booking_customer_change_links").update({last_action_at:request.requested_at}).eq("id",link.id);
 if(account.crm_workspace_id)await db.from("tle_crm_notifications").insert({
  workspace_id:account.crm_workspace_id,kind:"lead",
  title:action==="cancel"?"Booking cancellation requested":"Booking reschedule requested",
  body:clean(lead.customer_name,110)+" · "+clean(lead.service_name,110),
  source_key:"customer-change:"+lead.id+":"+Date.now()
 });
 const {data:brand}=await db.from("tle_booking_page_branding").select("business_name,logo_image,primary_color,accent_color,design_reviewed_at").eq("account_id",account.id).maybeSingle();
 const business=clean(brand?.design_reviewed_at?brand.business_name:account.business_name||"Service Business",90);
 const brandLogo=emailLogo(brand?.design_reviewed_at?brand.logo_image:"",business),
       primary=brandColor(brand?.design_reviewed_at?brand.primary_color:"","#191919"),
       accent=brandColor(brand?.design_reviewed_at?brand.accent_color:"","#087DFF");
 const customer=clean(lead.customer_name,120),target=clean(lead.customer_email,254),owner=clean(account.notification_email||account.owner_email,254);
 const type=action==="cancel"?label("cancellation","cancelación"):label("reschedule","cambio de fecha");
 const info=action==="reschedule"?" "+date+" "+time:"";
 const note=message?"\n"+message:"";
 const mails=[
  {customer_email:owner,reply_to:target,email_subject:(action==="cancel"?"Cancellation requested":"Reschedule requested")+" — "+customer,
   email_html:'<div style="font-family:Arial,sans-serif"><h2>Booking change request</h2><p>'+html(customer)+' requested '+html(action)+'.</p><p>'+html(lead.service_name)+'</p><p>'+html(info)+'</p><p>'+html(note)+'</p><p>Open your Command Center → Bookings & Requests to review. The confirmed booking has not been changed.</p></div>'},
  {customer_email:target,reply_to:owner,email_subject:label("Your change request was received","Recibimos tu solicitud de cambio")+" — "+business,
   email_html:'<div style="font-family:Arial,sans-serif"><h2>'+label("We received your request.","Recibimos tu solicitud.")+'</h2><p>'+html(customer)+', '+label("your ","tu solicitud de ")+html(type)+label(" request for "," para ")+html(lead.service_name)+' '+label("has been received.","fue recibida.")+'</p><p>'+label("Your current booking has not been changed. The business will review your request and confirm next steps.","Tu reserva actual no ha cambiado. El negocio revisará tu solicitud y confirmará los próximos pasos.")+'</p><p>'+html(business)+'</p></div>'}
 ];
 let failedHandoffs=0;
 for(const mail of mails){
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail.customer_email))continue;
  if(!await sendBusinessEmail({type:"booking_flow_message",customer_email:mail.customer_email,reply_to:mail.reply_to,business_name:business,email_subject:mail.email_subject,email_html:mailShell(mail.email_html,business,brandLogo,primary,accent),business_id:account.id,outbox_id:lead.id,event_key:"booking_change_"+request.requested_at},String(lead.preferred_language)==="es"))failedHandoffs++;
 }
 if(failedHandoffs>0&&account.crm_workspace_id){await db.from("tle_crm_notifications").insert({workspace_id:account.crm_workspace_id,kind:"lead",title:"Change request email needs attention",body:"Customer request saved, but an email was not accepted for sending. Review the request before contacting the customer.",source_key:"change-email-warning:"+String(lead.id)+":"+request.requested_at});}
 return page(label("Request received","Solicitud recibida"),'<h1>'+label("Your request is in!","¡Solicitud recibida!")+'</h1><p>'+label("We have sent your request to ","Enviamos tu solicitud a ")+html(business)+'. '+label("They will review it and confirm before any cancellation or schedule change takes effect.","La revisarán y confirmarán antes de que se haga efectiva cualquier cancelación o cambio de horario.")+'</p>');
});
