import {decorateBusinessEmail,sendBusinessEmail} from "../_shared/business-email.ts";

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import {createClient} from "npm:@supabase/supabase-js@2.57.0";
const response=(status:number,data:any)=>new Response(JSON.stringify(data),{status,headers:{"Content-Type":"application/json","Cache-Control":"no-store"}});
const esc=(s:unknown)=>String(s??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
const clean=(x:any,max=110)=>String(x??"").replace(/[<>\r\n]/g,"").trim().slice(0,max);
const validMail=(x:unknown)=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(x||""));
const hash=async(value:string)=>[...new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(value)))].map(x=>x.toString(16).padStart(2,"0")).join("");
const newToken=()=>[...crypto.getRandomValues(new Uint8Array(32))].map(x=>x.toString(16).padStart(2,"0")).join("");
const color=(v:any,fallback:string)=>/^#[0-9a-fA-F]{6}$/.test(String(v||""))?String(v):fallback;
const label=(en:string,es:string,spanish:boolean)=>spanish?es:en;
const HOME="https://bowacxhmjvrqixtwaikv.supabase.co/functions/v1/tle-service-feedback";
function makeShell(business:string,logo:string,primary:string,accent:string,body:string,plain:string,smallFooter:string){
 const header=logo?'<img src="'+esc(logo)+'" alt="" width="48" height="48" style="object-fit:contain;height:48px;max-width:65px;margin-right:12px"/>':"";
 const contrast=/^#(?:f[0-9a-f]{5}|e[0-9a-f]{5})$/i.test(primary)?"#191919":"#ffffff";
 const html='<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><meta charset="utf-8"></head><body style="margin:0;background:#FAF8F3;padding:26px 12px;font-family:Arial,Helvetica,sans-serif;color:#191919">'+
 '<table role="presentation" cellspacing="0" cellpadding="0" style="width:100%;max-width:565px;margin:auto;background:white;border:1px solid #e4e8ed;border-radius:18px">'+
 '<tr><td style="padding:22px 26px;background:'+primary+';border-radius:18px 18px 0 0"><table role="presentation"><tr><td>'+header+'</td><td style="font-size:20px;line-height:1.3;font-weight:800;color:'+contrast+'">'+esc(business)+'</td></tr></table></td></tr>'+
 '<tr><td style="padding:25px 28px;font-size:15px;line-height:1.75">'+body+'</td></tr>'+
 '<tr><td style="border-top:1px solid #eef0f2;padding:17px 28px;color:#677782;font-size:12px;line-height:1.6">'+esc(business)+(smallFooter?' · '+smallFooter:'')+'</td></tr></table></body></html>';
 return {html,text:plain};
}
function tip(category:string,spaceRaw:string,index:number,es:boolean){
 const space=spaceRaw.toLowerCase();const isOffice=/office|commercial|business|local|oficina|negocio|retail/.test(space);
 if(category==="detailing"){
  const array=es?[
   "Un paño de microfibra limpio y suave ayuda a retirar el polvo del tablero sin rayar las superficies. Evita los limpiadores muy fuertes.",
   "Para conservar el acabado exterior entre visitas, retira cuanto antes los residuos de aves o insectos con agua y un producto apto para la pintura, sin frotar en seco.",
   "Si tu auto tiene asientos de cuero, usa productos diseñados para ese material y prueba primero en una zona discreta. Una limpieza suave y regular ayuda a mantenerlos."
  ]:[
   "A clean, soft microfiber cloth is great for gently lifting dust from your dashboard. Skip harsh household cleaners.",
   "To protect the exterior between visits, remove bird droppings or bug residue promptly with water and a paint-safe product. Avoid dry scrubbing.",
   "If your seats are leather, use a leather-safe product and test it on a small hidden spot first. Gentle care goes a long way."
  ];return array[index%array.length];
 }
 if(isOffice){
  const array=es?[
   "Una pasada rápida diaria por las superficies de uso frecuente —manijas, interruptores y escritorios compartidos— ayuda a mantener el espacio agradable.",
   "Dejar las entradas despejadas y usar tapetes limpios ayuda a reducir el polvo que entra al negocio.",
   "Designa una pequeña zona para los suministros de limpieza. Tener paños y productos etiquetados evita usar el producto equivocado en superficies delicadas."
  ]:[
   "A quick daily wipe of high-touch areas like handles, switches and shared desks helps keep the space welcoming.",
   "Keeping entryways clear and entrance mats clean can help reduce the dirt tracked into your business.",
   "A small, labeled cleaning-supply station makes daily touch-ups easier and helps prevent using the wrong product on delicate surfaces."
  ];return array[index%array.length];
 }
 const small=/apartment|condo|studio|apartamento/.test(space);
 const array=es?[
  small?"En espacios pequeños, ventilar unos minutos cuando sea seguro y guardar los objetos sueltos facilita que cada rincón se sienta fresco.":"Un repaso suave a las superficies que más usas, como mesas y manijas, mantiene la casa agradable entre limpiezas.",
  "Después de ducharte, retirar el exceso de agua de las paredes y abrir la ventilación del baño ayuda a reducir la humedad acumulada.",
  "Una rutina de cinco minutos para despejar las encimeras de la cocina hace más fáciles las limpiezas diarias. Usa un producto adecuado al material."
 ]:[
  small?"In a smaller space, a few minutes of safe ventilation and putting away loose items can make the whole room feel fresher.":"A quick wipe of everyday touchpoints like tables and handles helps your home stay comfortable between visits.",
  "After a shower, removing excess water from surfaces and ventilating the bathroom can help reduce moisture buildup.",
  "Five minutes spent clearing kitchen counters makes daily touch-ups much easier. Just use a cleaner suited to the surface."
 ];return array[index%array.length];
}
Deno.serve(async req=>{
 if(req.method!=="POST")return response(405,{error:"Method not allowed"});
 const url=Deno.env.get("SUPABASE_URL"),service=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"),api=Deno.env.get("TLE_CRM_RESEND_API_KEY");
 if(!url||!service||!api)return response(503,{error:"Service mail infrastructure unavailable"});
 const db=createClient(url,service,{auth:{persistSession:false,autoRefreshToken:false}});
 const secret=req.headers.get("x-tle-worker-token")||"";
 if(secret.length!==64)return response(401,{error:"Not authorized"});
 const {data:authorized,error:ae}=await db.rpc("tle_crm_worker_token_ok",{p_token:secret});
 if(ae||authorized!==true)return response(401,{error:"Not authorized"});
 const {data:job,error:je}=await db.rpc("tle_service_claim_next");
 if(je)return response(503,{error:"Could not claim scheduled message"});
 if(!job?.id)return response(200,{ok:true,eligible:0,sent:0});
 async function close(status:string,detail:string="",provider:string=""){
  await db.from("tle_service_outbox").update({status,error:detail||null,provider_id:provider||null,sent_at:status==="sent"?new Date().toISOString():null}).eq("id",job.id).eq("status","processing");
  if(status==="failed")try{
   const {data:a}=await db.from("tle_booking_flow_accounts").select("crm_workspace_id").eq("id",job.account_id).single();
   if(a?.crm_workspace_id)await db.from("tle_crm_notifications").upsert({workspace_id:a.crm_workspace_id,kind:"lead",source_key:"care-email:"+job.id,title:"Customer email needs attention",body:"A scheduled service email needs review. Open the service care panel before retrying."},{onConflict:"workspace_id,source_key"});
  }catch{}
  return response(status==="failed"?503:200,{ok:status!=="failed",status,event:job.kind,sent:status==="sent"?1:0});
 }
 const [{data:lead,error:le},{data:acct,error:be},{data:completion,error:ce}]=await Promise.all([
  db.from("tle_booking_flow_leads").select("id,account_id,customer_name,customer_email,preferred_language,service_name,requested_start_at,status,raw_payload,created_at").eq("id",job.lead_id).eq("account_id",job.account_id).maybeSingle(),
  db.from("tle_booking_flow_accounts").select("id,crm_workspace_id,business_name,business_category,notification_email,owner_email,timezone,status,payment_status,delivery_sent_at").eq("id",job.account_id).maybeSingle(),
  job.completion_id?db.from("tle_service_completions").select("id,completed_at,recurring,space_type,outreach_opted_in").eq("id",job.completion_id).maybeSingle():Promise.resolve({data:null,error:null})
 ]);
 if(le||be||ce||!lead||!acct||acct.status!=="active"||acct.payment_status!=="paid"||!acct.delivery_sent_at||!validMail(lead.customer_email))return await close("cancelled","Business or customer email no longer eligible");
 const kind=job.kind,operational=kind==="reminder_48h"||kind==="reminder_day_5am"||kind==="service_thanks",reminder=kind.startsWith("reminder_");
 if(reminder&&(lead.status!=="booked"||!lead.requested_start_at||Date.parse(lead.requested_start_at)!==Date.parse(job.booking_at)||Date.parse(lead.requested_start_at)<=Date.now()||lead.raw_payload?.appointment_reminders_opt_in!==true||lead.raw_payload?.reminders_opt_out===true))
  return await close("cancelled","Booking changed or was not confirmed");
 if(reminder){
  const {data:finished}=await db.from("tle_service_completions").select("id").eq("lead_id",lead.id).limit(1);
  if(finished?.length)return await close("cancelled","Service already completed");
 }
 if(!reminder&&!completion)return await close("cancelled","Completion no longer exists");
 if(!operational){
  if(!completion?.outreach_opted_in)return await close("cancelled","Optional emails not permitted");
  const {data:optout}=await db.from("tle_service_optouts").select("opted_out_at").eq("account_id",acct.id).eq("customer_email",String(lead.customer_email).toLowerCase()).maybeSingle();
  if(optout)return await close("cancelled","Customer unsubscribed");
  if(kind==="new_service_21d"&&completion.recurring)return await close("cancelled","Customer is recurring");
  if(kind.startsWith("recurring_tip_")&&!completion.recurring)return await close("cancelled","Customer is not recurring");
  const {data:later,error:laterError}=await db.from("tle_booking_flow_leads").select("id,requested_start_at").eq("account_id",acct.id).eq("customer_email",lead.customer_email)
   .eq("status","booked").gt("requested_start_at",completion.completed_at).order("requested_start_at",{ascending:true}).limit(20);
  if(laterError)return await close("failed","Could not verify upcoming appointment");
  if(later?.some((b:any)=>kind==="new_service_21d"||Date.parse(b.requested_start_at)<=Date.parse(job.due_at)+24*3600000))
   return await close("cancelled","Next appointment already scheduled");
 }
 const {data:branding,error:br}=await db.from("tle_booking_page_branding").select("business_name,logo_image,primary_color,accent_color,design_reviewed_at").eq("account_id",acct.id).maybeSingle();
 if(br)return await close("failed","Could not verify approved business branding");
 const business=clean(branding?.design_reviewed_at?branding.business_name:acct.business_name,110)||"Your service team";
 const logo=clean(branding?.design_reviewed_at?branding.logo_image:"",750)||(/^cb\s*depot$/i.test(business)?"https://thelaunchera.com/assets/clients/cb-depot/approved-favicon-192.png":"");
 const primary=color(branding?.design_reviewed_at?branding.primary_color:"#191919","#191919");
 const accent=color(branding?.design_reviewed_at?branding.accent_color:"#7caec9","#7caec9");
 const es=lead.preferred_language==="es",first=clean(lead.customer_name,50).split(/\s+/)[0]||label("there","hola",es);
 const isDetail=acct.business_category==="detailing",isClean=acct.business_category==="cleaning";
 const serviceName=clean(lead.service_name,130)||label("your appointment","tu cita",es);
 const start=lead.requested_start_at?new Date(lead.requested_start_at):new Date();
 const when=new Intl.DateTimeFormat(es?"es-US":"en-US",{timeZone:acct.timezone||"America/New_York",weekday:"long",month:"long",day:"numeric",hour:"numeric",minute:"2-digit"}).format(start);
 let subject="",paragraph="",extra="",reviewPlain="",footer="",link="";
 if(kind==="reminder_48h"){
  subject=label("A little reminder about your upcoming appointment","Un recordatorio de tu próxima cita",es);
  paragraph=es?"Solo queríamos recordarte que tu cita está en dos días. Nos alegra verte pronto.":"Just a friendly reminder that your appointment is coming up in two days. We're looking forward to seeing you.";
  extra=label("Appointment: "+serviceName+" · "+when,"Cita: "+serviceName+" · "+when,es);
 }else if(kind==="reminder_day_5am"){
  subject=label("We're looking forward to seeing you today","Nos vemos hoy",es);
  paragraph=es?"¡Hoy es el día! Tenemos tu cita en nuestro calendario. Si necesitas avisarnos de algo, simplemente responde a este correo.":"Today's the day! Your appointment is on our calendar. If there's anything we should know beforehand, simply reply to this email.";
  extra=label("Your appointment: "+serviceName+" · "+when,"Tu cita: "+serviceName+" · "+when,es);
 }else if(kind==="service_thanks"){
  subject=isDetail?label("Your car is all set — thank you!","¡Tu auto está listo! Gracias",es):
   isClean?label("All finished — thank you for welcoming us","Terminamos la limpieza — gracias por recibirnos",es):
   label("All finished — thank you for trusting us","Servicio terminado — gracias por confiar en nosotros",es);
  paragraph=isDetail?
   label("We finished taking care of your vehicle. Thank you for trusting us with it — we hope you enjoy that fresh, clean feeling. If there's anything you need us to look at, just reply here.","Ya terminamos de cuidar tu vehículo. Gracias por confiarnos tu auto. Esperamos que disfrutes esa sensación de recién limpio. Si necesitas comentarnos algo, responde a este correo.",es):
   isClean?
    label("Your cleaning is all finished. Thank you for welcoming our team into your space. We hope it feels a little lighter and more comfortable today. If we missed something, please reply and let us make it right.","Ya terminamos tu limpieza. Gracias por recibirnos en tu espacio. Esperamos que hoy se sienta más fresco y acogedor. Si se nos pasó algún detalle, responde a este correo y lo revisaremos.",es):
    label("All finished! Thank you for trusting our team. We hope you're happy with the result. If anything needs another look, just reply and we'll be glad to help.","¡Terminamos! Gracias por confiar en nuestro equipo. Esperamos que te guste el resultado. Si hay algún detalle que debamos revisar, responde y con gusto te ayudaremos.",es);
  const raw=newToken(),digest=await hash(raw);
  const {error:tokenError}=await db.from("tle_service_public_tokens").insert({token_hash:digest,account_id:acct.id,lead_id:lead.id,completion_id:completion.id,purpose:"review",expires_at:new Date(Date.now()+90*86400000).toISOString()});
  if(tokenError)return await close("failed","Private feedback link could not be created");
  link=HOME+"?token="+raw;
  reviewPlain=label("If you'd like to share a quick note with our team (optional): ","Si quieres dejarnos una nota breve (opcional): ",es)+link;
 }else if(kind==="new_service_21d"){
  subject=label("Hope your space is doing well","Esperamos que tu espacio siga muy bien",es);
  paragraph=isDetail?
    label("It's been a little while since we cared for your car. If you ever want another refresh, we're here — no pressure at all.","Ha pasado un tiempito desde que cuidamos tu auto. Si deseas darle otra limpieza, aquí estamos, sin ningún compromiso.",es):
    label("Just checking in — we hope you've been enjoying your space since our last visit. If another cleaning would be helpful, reply here whenever you're ready. No rush.","Solo pasamos a saludarte. Esperamos que hayas disfrutado tu espacio desde nuestra visita. Si te vendría bien otra limpieza, responde cuando quieras, sin compromiso.",es);
 }else if(kind.startsWith("recurring_tip_")){
  const n=Number(kind.split("_").pop()||1);
  subject=label("A little care tip between visits","Un consejito para cuidar tu espacio",es);
  paragraph=tip(String(acct.business_category||"cleaning"),String(completion.space_type||"home"),n-1,es);
  extra=label("We're thinking of you between visits. No need to reply unless you have a question.","Nos acordamos de ti entre visitas. No hace falta responder, salvo que tengas una pregunta.",es);
 }else return await close("cancelled","Unknown service message");
 if(!operational){
  const raw=newToken(),digest=await hash(raw);
  const {error:tokenError}=await db.from("tle_service_public_tokens").insert({token_hash:digest,account_id:acct.id,lead_id:lead.id,completion_id:completion.id,purpose:"unsubscribe",expires_at:new Date(Date.now()+365*86400000).toISOString()});
  if(tokenError)return await close("failed","Unsubscribe link could not be created");
  footer=label("Stop optional emails","Cancelar correos opcionales",es)+": "+HOME+"?token="+raw+"&action=unsubscribe";
 }
 const greeting=label("Hi","Hola",es)+" "+first+",";
 const body='<h1 style="margin:0 0 13px;font-size:23px;letter-spacing:-.035em;color:#191919">'+esc(greeting)+'</h1>'+
 '<p style="margin:0 0 15px">'+esc(paragraph)+'</p>'+
 (extra?'<p style="margin:12px 0 0;padding:13px 15px;background:#f3f8fb;border-radius:12px;color:#456275;font-size:13px">'+esc(extra)+'</p>':"")+
 (link?'<p style="margin:28px 0 0;padding-top:15px;border-top:1px solid #edf0f2;font-size:12px;color:#617683">'+
 esc(label("If you'd like, you can leave a private note about your experience.","Si quieres, puedes compartir una nota privada sobre tu experiencia.",es))+
 ' <a href="'+esc(link)+'" style="color:'+accent+'">'+esc(label("Share a note","Dejar una nota",es))+'</a>.</p>':"");
 const plain=greeting+"\n\n"+paragraph+(extra?"\n\n"+extra:"")+(reviewPlain?"\n\n"+reviewPlain:"")+(footer?"\n\n"+footer:"");
 const built=makeShell(business,logo,primary,accent,body,plain,footer?'<a href="'+esc(footer.split(": ").slice(-1)[0])+'" style="color:'+accent+'">'+esc(label("Unsubscribe from optional emails","Cancelar correos opcionales",es))+'</a>':"");
 let decorated;try{decorated=await decorateBusinessEmail(String(acct.id),business,built.html,es)}catch{return await close("failed","Business legal links unavailable; no email sent")}
 const payload:any={from:business+" <hello@thelaunchera.com>",to:[lead.customer_email],reply_to:clean(acct.notification_email||acct.owner_email,250)||"hello@thelaunchera.com",subject,html:decorated.html,text:built.text+decorated.textSuffix};
 if(footer){const link=footer.split(": ").slice(-1)[0];payload.headers={"List-Unsubscribe":"<"+link+">","List-Unsubscribe-Post":"List-Unsubscribe=One-Click"}}
 let sendResult:Response;
 try{sendResult=await fetch("https://api.resend.com/emails",{method:"POST",headers:{"Authorization":"Bearer "+api,"Content-Type":"application/json","Idempotency-Key":job.outbox_key},body:JSON.stringify(payload),signal:AbortSignal.timeout(12000)})}
 catch{return await close("failed","Email provider connection unavailable; check delivery before retrying")}
 const sent=await sendResult.json().catch(()=>({}));
 if(!sendResult.ok||!sent?.id)return await close("failed","Email provider did not accept delivery ("+sendResult.status+")");
 return await close("sent","",String(sent.id));
});

