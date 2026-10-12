import {decorateBusinessEmail,sendBusinessEmail} from "../_shared/business-email.ts";
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import {createClient} from "npm:@supabase/supabase-js@2.57.0";
const HOOK="https://hook.us2.make.com/ztirdqf4g4i9i1npb0k4lsci4zt822gf";
const esc=(x:unknown)=>String(x??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
const clean=(x:unknown,max=750)=>String(x??"").trim().slice(0,max);
const hdr={"Content-Type":"text/html; charset=utf-8","Cache-Control":"no-store, private","Referrer-Policy":"no-referrer","X-Content-Type-Options":"nosniff","X-Robots-Tag":"noindex, nofollow","Content-Security-Policy":"default-src 'none'; form-action 'self'; style-src 'unsafe-inline'; base-uri 'none'; frame-ancestors 'none'"};
function page(title:string,inner:string,lang="en"){return new Response('<!doctype html><html lang="'+lang+'"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+esc(title)+'</title><style>*{box-sizing:border-box}:root{font-family:Arial,Helvetica,sans-serif;background:#FAF8F3;color:#191919}body{margin:0;padding:24px 14px}.card{max-width:570px;margin:25px auto;background:white;border:1px solid #d6e8f1;border-radius:23px;padding:clamp(20px,5vw,34px);box-shadow:0 13px 30px #23456013}.mark{font-weight:800;letter-spacing:.13em;font-size:12px;color:#477e9e}h1{font-size:29px;line-height:1.1;letter-spacing:-.04em;margin:16px 0}p{line-height:1.6;color:#566a77}.quote{background:#edf6fc;border-radius:14px;padding:16px}.amount{font-size:26px;font-weight:800;margin-top:8px;color:#1d536e}label{display:block;font-size:13px;font-weight:700;color:#34586c;margin:15px 0 6px}textarea,select{font:inherit;width:100%;border-radius:11px;border:1px solid #c0d4df;padding:12px;resize:vertical}button,.btn{display:inline-block;border:0;background:#286b92;color:#fff;text-decoration:none;padding:13px 17px;border-radius:12px;font:inherit;font-weight:700;margin:12px 8px 3px 0;cursor:pointer}.alt{background:#e9f4fb;color:#285e7f}.warn{background:#f7eeee;color:#8d4242}.sub{font-size:12px}a{color:#236a93}</style></head><body><main class="card"><div class="mark">✳ QUOTE RESPONSE</div>'+inner+'</main></body></html>',{headers:{...hdr,"Content-Language":lang}})}
function fail(msg:string){return page("Quote unavailable",'<h1>Quote unavailable</h1><p>'+esc(msg)+'</p><p>Please contact the business that sent this quote directly.</p>')}
async function digest(token:string){const h=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(token));return [...new Uint8Array(h)].map(x=>x.toString(16).padStart(2,"0")).join("")}
function safeEmailLogo(value:any,name:string){
 try{const u=new URL(clean(value,1000));if(u.protocol==="https:"&&/\.(png|jpe?g|webp)$/i.test(u.pathname))return u.toString()}catch{}
 return /^cb\s*depot$/i.test(name)?"https://thelaunchera.com/assets/clients/cb-depot/approved-favicon-192.png":"";
}
function safeColor(v:any,fallback:string){return /^#[0-9a-fA-F]{6}$/.test(String(v||""))?String(v):fallback}
function quoteInk(bg:string){const rgb=[1,3,5].map(i=>parseInt(bg.slice(i,i+2),16)/255).map(x=>x<=.04045?x/12.92:Math.pow((x+.055)/1.055,2.4));return .2126*rgb[0]+.7152*rgb[1]+.0722*rgb[2]>.4?"#191919":"#ffffff"}
function brandedQuoteMail(inner:string,business:string,logo:string,primary:string,accent:string){
 const identity=esc(business),header=safeColor(primary,"#191919"),linkColor=safeColor(accent,"#087DFF");
 const icon=logo?'<img src="'+esc(logo)+'" alt="'+identity+' logo" width="64" height="64" style="display:block;height:auto;max-height:64px;max-width:100px;border:0;margin-right:14px"/>':"";
 return '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;background:#f4f3ef;padding:24px 12px;font-family:Arial,Helvetica,sans-serif"><table role="presentation" cellspacing="0" cellpadding="0" style="background:#fff;border:1px solid #e5e2dc;border-radius:16px;width:100%;max-width:590px;margin:0 auto"><tr><td style="background:'+header+';padding:22px 25px;border-radius:16px 16px 0 0"><table role="presentation"><tr><td>'+icon+'</td><td style="color:'+quoteInk(header)+';font-size:21px;font-weight:800">'+identity+'</td></tr></table></td></tr><tr><td style="padding:22px 25px">'+inner+'</td></tr><tr><td style="padding:16px 25px;background:#faf9f5;border-top:1px solid #eae5dc;color:#737373;font-size:11px;border-radius:0 0 16px 16px">'+identity+' · <a href="https://thelaunchera.com/" style="color:'+linkColor+';text-decoration:underline;font-weight:700">Powered by The Launch Era</a></td></tr></table></body></html>';
}
async function pushEmail(address:string,replyTo:string,business:string,subject:string,html:string,accountId:string,leadId:string,logo:string,primary:string,accent:string,es=false){
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address))return false;
 return sendBusinessEmail({type:"booking_flow_message",customer_email:address,reply_to:replyTo,business_name:business,email_subject:subject,email_html:brandedQuoteMail(html,business,logo,primary,accent),business_id:accountId,outbox_id:leadId},es);
}
Deno.serve(async req=>{
 if(!["GET","POST"].includes(req.method))return new Response("Method not allowed",{status:405});
 const url=Deno.env.get("SUPABASE_URL"),key=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
 if(!url||!key)return fail("The response service is temporarily unavailable.");
 const db=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
 const form=req.method==="POST"?await req.formData().catch(()=>null):null;
 const raw=clean(form?.get("token")||new URL(req.url).searchParams.get("token"),80);
 if(!/^[0-9a-f]{64}$/i.test(raw))return fail("This response link is invalid.");
 const hash=await digest(raw);
 const {data:quote,error:qe}=await db.from("tle_booking_quote_response_links")
  .select("id,account_id,lead_id,status,amount,currency,expires_at,decline_reason")
  .eq("token_hash",hash).maybeSingle();
 if(qe||!quote||Date.parse(quote.expires_at)<Date.now()||quote.status==="revoked")return fail("This quote link has expired. Please contact the business for an updated quote.");
 const [{data:lead},{data:account}]=await Promise.all([
  db.from("tle_booking_flow_leads").select("id,account_id,customer_name,customer_email,preferred_language,service_name,status,raw_payload")
   .eq("id",quote.lead_id).eq("account_id",quote.account_id).maybeSingle(),
  db.from("tle_booking_flow_accounts").select("id,business_name,business_category,owner_email,notification_email,crm_workspace_id")
   .eq("id",quote.account_id).maybeSingle()
 ]);
 if(!lead||!account)return fail("The associated quote is no longer available.");
 const es=lead.preferred_language==="es", tr=(en:string,sp:string)=>es?sp:en,lang=es?"es":"en";
 const amount=new Intl.NumberFormat(es?"es-US":"en-US",{style:"currency",currency:quote.currency}).format(Number(quote.amount));
 const {data:approvedBrand}=await db.from("tle_booking_page_branding").select("business_name,logo_image,primary_color,accent_color,design_reviewed_at").eq("account_id",account.id).maybeSingle();
 const business=clean(approvedBrand?.design_reviewed_at?approvedBrand.business_name:account.business_name||"Service business",100);
 const logo=safeEmailLogo(approvedBrand?.design_reviewed_at?approvedBrand.logo_image:"",business);
 const primary=safeColor(approvedBrand?.design_reviewed_at?approvedBrand.primary_color:"","#191919");
 const accent=safeColor(approvedBrand?.design_reviewed_at?approvedBrand.accent_color:"","#087DFF");
 const detailing=account.business_category==="detailing",other=account.business_category==="other";
 if(lead.status==="booked")return page(tr("This job is already booked","Este servicio ya está reservado"),'<h1>'+tr("This job is already booked","Este servicio ya está reservado")+'</h1><p>'+tr("Contact the business if you need an update.","Contacta al negocio si necesitas actualizarlo.")+'</p>',lang);
 if(quote.status!=="pending"&&!(quote.status==="declined"&&clean(new URL(req.url).searchParams.get("action")||form?.get("action"),12)==="talk"))return page(tr("Response recorded","Respuesta registrada"),'<h1>'+tr("Thank you — your response is saved.","Gracias. Tu respuesta está guardada.")+'</h1><p>'+tr("The business has your response and can contact you with next steps.","El negocio recibió tu respuesta y puede comunicarse contigo para el próximo paso.")+'</p>',lang);
 if(req.method==="GET"){
  const action=clean(new URL(req.url).searchParams.get("action"),20);
  const type=["accept","decline","talk"].includes(action)?action:"";
  let body='<h1>'+esc(detailing?tr("Your car detailing quote","Tu cotización de detailing"):other?tr("Your service quote","Tu cotización de servicio"):tr("Your cleaning quote","Tu cotización de limpieza"))+'</h1><p>'+esc(business)+'</p><div class="quote"><strong>'+esc(lead.service_name||(detailing?tr("Car detailing","Detallado de autos"):other?tr("Service","Servicio"):tr("Cleaning service","Servicio de limpieza")))+'</strong><div class="amount">'+esc(amount)+'</div></div><p>'+esc(tr("Choose how you would like to proceed. On acceptance, we check availability and confirm the booking automatically if the time is free.","Elige cómo quieres continuar. Al aceptar verificamos disponibilidad y confirmamos automáticamente tu reserva si el horario está libre."))+'</p>';
  if(!type){
   body+='<a class="btn" href="?token='+raw+'&amp;action=accept">'+tr("Accept quote","Aceptar cotización")+'</a><a class="btn alt" href="?token='+raw+'&amp;action=talk">'+tr("Let’s talk","Hablemos")+'</a><a class="btn warn" href="?token='+raw+'&amp;action=decline">'+tr("Decline quote","Rechazar cotización")+'</a>';
  }else{
   body+='<form method="post"><input type="hidden" name="token" value="'+raw+'"><input type="hidden" name="action" value="'+type+'">';
   if(type==="accept"){
     const original=lead.raw_payload&&typeof lead.raw_payload==="object"&&!Array.isArray(lead.raw_payload)?lead.raw_payload:{};
     const d=clean(original.requested_date,10),t=clean(original.requested_time,5);
     body+='<label>'+tr("Booking date","Fecha de reserva")+'</label><input type="date" name="date" required min="'+new Date().toISOString().slice(0,10)+'" value="'+esc(/^\d{4}-\d{2}-\d{2}$/.test(d)?d:"")+'"><label>'+tr("Start time","Hora de inicio")+'</label><input type="time" name="time" required step="1800" value="'+esc(/^\d{2}:\d{2}$/.test(t)?t:"")+'"><p class="sub">'+tr("If the time is available your booking is confirmed immediately.","Si el horario está disponible, tu reserva se confirma al momento.")+'</p>';
   }
   if(type==="decline")body+='<label>'+tr("What made you decide not to proceed?","¿Por qué decidiste no continuar?")+'</label><select name="reason" required><option value="">'+tr("Choose a reason","Elige un motivo")+'</option><option value="Price"> '+tr("Price","Precio")+'</option><option value="Schedule">'+tr("Timing / schedule","Horario o fecha")+'</option><option value="No longer needed">'+tr("Service no longer needed","Ya no necesito el servicio")+'</option><option value="Selected another company">'+tr("Chose another company","Elegí otra compañía")+'</option><option value="Other">'+tr("Other","Otro")+'</option></select>';
   if(type!=="accept")body+='<label>'+tr(type==="talk"?"What would you like to discuss?":"Additional comments (optional)",type==="talk"?"¿Qué te gustaría conversar?":"Comentarios adicionales (opcional)")+'</label><textarea name="message" maxlength="750" rows="4"></textarea>';
   body+='<button type="submit">'+tr(type==="accept"?"Confirm acceptance":type==="decline"?"Send decline reason":"Request a conversation",type==="accept"?"Confirmar aceptación":type==="decline"?"Enviar motivo":"Pedir conversación")+'</button><p><a href="?token='+raw+'">'+tr("Back","Volver")+'</a></p></form>';
  }
  body+='<p class="sub">'+tr("Private quote link. Please do not share it.","Enlace privado. No lo compartas.")+'</p>';
  return page(tr("Respond to quote","Responder cotización"),body,lang);
 }
 const action=clean(form?.get("action"),12);
 if(!["accept","decline","talk"].includes(action)||quote.status==="declined"&&action!=="talk")return fail("Choose a valid response.");
 const reason=clean(form?.get("reason"),60),note=clean(form?.get("message"),750);
 if(action==="decline"&&!["Price","Schedule","No longer needed","Selected another company","Other"].includes(reason))return page(tr("Choose a reason","Elige un motivo"),'<h1>'+tr("Please choose why you declined.","Por favor, elige por qué rechazaste.")+'</h1><p><a href="?token='+raw+'&amp;action=decline">'+tr("Go back","Volver")+'</a></p>',lang);
 if(action==="accept"){
   const date=clean(form?.get("date"),10),time=clean(form?.get("time"),5);
   if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(time))
     return page(tr("Choose a date and time","Elige fecha y hora"),'<h1>'+tr("Choose a valid booking date and time.","Selecciona una fecha y hora válidas.")+'</h1><p><a href="?token='+raw+'&amp;action=accept">'+tr("Try again","Volver a intentar")+'</a></p>',lang);
   const {data:confirmed,error:err}=await db.rpc("tle_confirm_accepted_quote",{
     p_quote_id:quote.id,p_token_hash:hash,p_local_start:date+"T"+time+":00"
   });
   if(err||!confirmed?.ok){
     const unavailable=confirmed?.reason==="slot_unavailable"||confirmed?.reason==="schedule_unavailable";
     const head=unavailable?tr("That time is not available.","Ese horario no está disponible."):tr("Booking was not completed.","No se completó la reserva.");
     const hint=unavailable?tr("Please choose another date or time. Your quote remains open.","Elige otra fecha u hora. Tu cotización sigue abierta."):tr("Try again or contact the business.","Vuelve a intentar o contacta al negocio.");
     return page(tr("Choose another time","Elige otro horario"),'<h1>'+head+'</h1><p>'+hint+'</p><p><a href="?token='+raw+'&amp;action=accept">'+tr("Try another time","Probar otro horario")+'</a></p>',lang);
   }
   const owner=clean(account.notification_email||account.owner_email,254),to=clean(lead.customer_email,254);
   let links="";
   try{
     const bytes=crypto.getRandomValues(new Uint8Array(32));
     const secret=[...bytes].map(n=>n.toString(16).padStart(2,"0")).join("");
     const newHash=await digest(secret);
     const {error:linkError}=await db.from("tle_booking_customer_change_links").insert({
       account_id:account.id,lead_id:lead.id,token_hash:newHash,expires_at:new Date(Date.now()+90*86400000).toISOString()
     });
     if(!linkError){
       const root="https://bowacxhmjvrqixtwaikv.supabase.co/functions/v1/tle-booking-customer-change?token="+secret+"&action=";
       const button=(title:string,a:string)=>'<a style="display:inline-block;padding:12px 17px;margin:6px;background:#e8f4fb;color:#245d7c;border-radius:12px;text-decoration:none" href="'+root+a+'">'+esc(title)+'</a>';
       links='<div style="padding-top:13px;border-top:1px solid #dcebf3;margin-top:16px">'+button(tr("Request cancellation","Solicitar cancelación"),"cancel")+button(tr("Reschedule","Cambiar fecha"),"reschedule")+'</div>';
     }
   }catch(e){console.error("Change-link generation failed",String(e).slice(0,120))}
   const first=clean(lead.customer_name,100).split(/\s+/)[0];
   const price=new Intl.NumberFormat(es?"es-US":"en-US",{style:"currency",currency:quote.currency}).format(Number(quote.amount));
   const email='<div style="font:15px Arial,sans-serif;line-height:1.65;color:#191919;max-width:610px;margin:auto;padding:19px"><h2>'+tr("Your booking is confirmed!","¡Tu reserva está confirmada!")+'</h2><p>'+tr("Hi ","Hola ")+esc(first)+',</p><p>'+tr("Your quote was accepted and your appointment is confirmed automatically.","Aceptaste la cotización y tu cita quedó confirmada automáticamente.")+'</p><p><strong>'+esc(lead.service_name)+'</strong></p><p>'+tr("Date and time: ","Fecha y hora: ")+esc(date+" · "+time)+'</p><p>'+tr("Confirmed price: ","Precio confirmado: ")+esc(price)+'</p>'+links+'<p>'+esc(business)+'</p></div>';
   const ownerEmail='<div style="font:15px Arial,sans-serif;line-height:1.6;color:#191919"><h2>Quote accepted — booking confirmed</h2><p>'+esc(lead.customer_name)+' booked '+esc(lead.service_name)+'</p><p>'+esc(date+" · "+time)+' · '+esc(price)+'</p><p>The slot has been reserved automatically. Open Command Center to review the job.</p></div>';
   const customerSent=await pushEmail(to,owner,business,tr("Your booking is confirmed","Reserva confirmada")+" — "+business,email,String(account.id),String(lead.id),logo,primary,accent,es);
   const ownerSent=await pushEmail(owner,to,business,"New confirmed booking — "+clean(lead.customer_name,100),ownerEmail,String(account.id),String(lead.id),logo,primary,accent);
   const {data:latest}=await db.from("tle_booking_flow_leads").select("raw_payload").eq("id",lead.id).eq("account_id",account.id).maybeSingle();
   await db.from("tle_booking_flow_leads").update({raw_payload:{
     ...(latest?.raw_payload||{}),confirmation_email_accepted:customerSent,owner_notification_email_accepted:ownerSent
   },updated_at:new Date().toISOString()}).eq("id",lead.id).eq("account_id",account.id).eq("status","booked");
   if((!customerSent||!ownerSent)&&account.crm_workspace_id){
     await db.from("tle_crm_notifications").insert({
       workspace_id:account.crm_workspace_id,kind:"lead",
       title:"Confirmed booking email needs attention",
       body:clean(lead.customer_name,100)+" · "+clean(lead.service_name,100)+" · Check the customer confirmation and business email.",
       source_key:"quote-confirmation-mail-issue:"+String(quote.id)
     });
   }
   return page(tr("Booking confirmed","Reserva confirmada"),'<h1>'+tr("Your appointment is confirmed!","¡Tu cita está confirmada!")+'</h1><div class="quote"><strong>'+esc(lead.service_name)+'</strong><div class="amount">'+esc(price)+'</div><p>'+esc(date+" · "+time)+'</p></div><p>'+tr(customerSent?"Your confirmation email was accepted for delivery.":"Your booking is reserved, but the confirmation email may be delayed.",customerSent?"Tu correo de confirmación fue aceptado para envío.":"Tu reserva está confirmada, pero el correo podría demorarse.")+'</p>',lang);
 }
 const status=action==="decline"?"declined":"lets_talk",at=new Date().toISOString();
 const {data:updated,error:ue}=await db.from("tle_booking_quote_response_links")
  .update({status,decline_reason:action==="decline"?reason:null,customer_note:note||null,responded_at:at})
  .eq("id",quote.id).eq("status",quote.status==="declined"?"declined":"pending").select("id").maybeSingle();
 if(ue||!updated)return fail("We could not save your response. It may already have been submitted.");
 const payload=(lead.raw_payload&&typeof lead.raw_payload==="object"&&!Array.isArray(lead.raw_payload))?lead.raw_payload:{};
 await db.from("tle_booking_flow_leads").update({raw_payload:{...payload,quote_response:{status,reason:reason||null,note:note||null,responded_at:at,quote_amount:quote.amount,quote_currency:quote.currency}},follow_up_at:null,updated_at:at})
   .eq("id",lead.id).eq("account_id",account.id);
 if(account.crm_workspace_id){
  await db.from("tle_crm_notifications").insert({
    workspace_id:account.crm_workspace_id,kind:"lead",
    title:status==="accepted"?"Quote accepted":status==="declined"?"Quote declined":"Customer wants to talk",
    body:clean(lead.customer_name,100)+" · "+clean(lead.service_name,100)+(reason?" · "+reason:""),
    source_key:"quote-response:"+quote.id+":"+status
  });
  const {data:link}=await db.from("tle_crm_source_links").select("lead_id").eq("source_type","tle_booking_flow_leads").eq("source_id",lead.id).maybeSingle();
  if(link?.lead_id){
    await db.from("tle_crm_leads").update({replied_at:at,email_followup_enabled:false})
      .eq("id",link.lead_id).eq("workspace_id",account.crm_workspace_id);
    await db.from("tle_crm_followup_steps").update({status:"cancelled",last_error:"Customer responded to quote",completed_at:at})
      .eq("lead_id",link.lead_id).eq("workspace_id",account.crm_workspace_id).in("status",["scheduled","ready"]);
  }
 }
 const owner=clean(account.notification_email||account.owner_email,254),customer=clean(lead.customer_name,100);
 const state=status==="accepted"?"ACCEPTED":status==="declined"?"DECLINED":"LET'S TALK";
 const ownerHtml='<div style="font:15px Arial,sans-serif;line-height:1.65;color:#191919"><h2>Quote response: '+esc(state)+'</h2><p>'+esc(customer)+' responded to a '+esc(amount)+' quote for '+esc(lead.service_name)+'.</p>'+(reason?'<p><strong>Reason:</strong> '+esc(reason)+'</p>':'')+(note?'<p><strong>Customer note:</strong> '+esc(note)+'</p>':'')+'<p>Open Command Center → Bookings &amp; Requests to review. Open the customer record for the full response and next steps.</p></div>';
 await pushEmail(owner,clean(lead.customer_email,254),business,"Quote "+state+" — "+customer,ownerHtml,String(account.id),String(lead.id),logo,primary,accent);
 const ack=tr("We received your quote response","Recibimos tu respuesta a la cotización");
 await pushEmail(clean(lead.customer_email,254),owner,business,ack+" — "+business,
  '<div style="font:15px Arial,sans-serif;line-height:1.65;color:#191919"><h2>'+esc(ack)+'</h2><p>'+tr("Thanks for letting us know. ","Gracias por responder. ")+esc(business)+tr(" will review your response and contact you about next steps. Your response has been saved."," revisará tu respuesta y se comunicará contigo sobre los próximos pasos. Tu respuesta quedó guardada.")+'</p></div>',String(account.id),String(lead.id),logo,primary,accent,es);
 return page(tr("Response received","Respuesta recibida"),'<h1>'+tr(status==="declined"?"Thanks for letting us know.":"Thanks! We have your response.",status==="declined"?"Gracias por responder.":"¡Gracias! Recibimos tu respuesta.")+'</h1><p>'+esc(business)+' '+tr("has received your decision. You can discuss the price or another option with the business.","recibió tu decisión. Puedes conversar sobre el precio o explorar otra opción.")+'</p>'+(status==="declined"?'<a class="btn" href="?token='+raw+'&amp;action=talk">'+tr("Talk to us","Hablemos")+'</a>':''),lang);
});
