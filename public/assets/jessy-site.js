
(function(){
"use strict";
// Never create a second assistant inside sample demos or embedded previews.
if(location.pathname.replace(/\/+$/,"")==="/cleaning-app-demo"||window.self!==window.top)return;
if(window.__tleJessyInstalled)return;
window.__tleJessyInstalled=true;
const ENDPOINT="https://bowacxhmjvrqixtwaikv.supabase.co/functions/v1/tle-jessy-chat";
const CONTACT="https://bowacxhmjvrqixtwaikv.supabase.co/functions/v1/tle-contact";
const METRICS="https://bowacxhmjvrqixtwaikv.supabase.co/functions/v1/tle-jessie-metrics";
const catalogPath="/assets/jessy-offers.json";
const avatarPath="/assets/jessie-avatar.webp?v=20261015";
function currentPage(){
 const path=location.pathname.replace(/\/+$/,"")||"/";
 if(["/cleaning-web-app","/es/cleaning-web-app","/cleaning-app-demo"].includes(path))return "cleaning-app";
 if(["/booking-lead-automation","/es/booking-lead-automation","/booking-demo"].includes(path))return "booking";
 if(["/ai-booking-assistant","/es/ai-booking-assistant"].includes(path))return "ai-booking";
 if(["/website-automation","/es/website-automation"].includes(path))return "website";
 if(["/virtual-assistant","/es/virtual-assistant"].includes(path))return "va";
 if(["/whatsapp-ai-agent","/es/whatsapp-ai-agent"].includes(path))return "whatsapp";
 return "";
}
let lang=(location.pathname==="/es"||location.pathname.startsWith("/es/")||new URLSearchParams(location.search).get("lang")==="es")?"es":"en";
let open=false,waiting=false,seen=false,details=false,soundOn=false,catalog=[],offer=currentPage(),history=[],draft=[],lastFocus=null;
let startedAt=Date.now(),manualLanguage=false,lastIntent="general";
const words={
 en:{name:"Jessie",status:"AI Assistant · The Launch Era",nudge:"Chat with the assistant",hello:"Hi! I’m Jessie 👋 Glad you’re here. Want a hand finding what works best for your cleaning business?",opening:"Chat with the assistant",close:"Close assistant",sound:"Toggle welcome sound",label:"Ask Jessie",typing:"One moment…",input:"Ask me anything about our services…",send:"Send",lead:"Leave my details for the team",leadTitle:"Let's keep in touch",leadIntro:"Share a few details. We'll review your question and get back to you.",nameLabel:"Your name",businessLabel:"Business name",emailLabel:"Email address",needLabel:"What do you need help with?",consent:"I agree that The Launch Era may contact me about this request. This does not subscribe me to marketing emails.",confirm:"Send my request",back:"← Back to chat",privacy:"Your details are only used to reply to this request.",sent:"Thanks! We received your request. Our team will review it soon.",error:"Your request didn't go through. Please try again.",liveError:"I'm having trouble answering right now. You can still explore a service or send us your details.",limit:"I'm a little busy right now. Please try again soon or leave your details.",next:"Ready for the next step?",checkout:"Get started",learn:"How it works",service:"Booking automation",ai:"AI assistants",price:"Pricing",human:"Contact the team",hint:"Here to help you choose—no pressure."},
 es:{name:"Jessie",status:"Asistente IA · The Launch Era",nudge:"Habla con la asistente",hello:"¡Hola! Soy Jessie 👋 Qué gusto verte por aquí. ¿Te ayudo a encontrar lo que mejor le viene a tu negocio?",opening:"Hablar con la asistente",close:"Cerrar asistente",sound:"Activar o desactivar sonido",label:"Pregúntale a Jessie",typing:"Un momento…",input:"Pregúntame sobre nuestros servicios…",send:"Enviar",lead:"Dejar mis datos al equipo",leadTitle:"Sigamos en contacto",leadIntro:"Compártenos algunos datos. Revisaremos tu consulta y te responderemos.",nameLabel:"Tu nombre",businessLabel:"Nombre del negocio",emailLabel:"Correo electrónico",needLabel:"¿En qué necesitas ayuda?",consent:"Acepto que The Launch Era me contacte sobre esta consulta. Esto no me suscribe a correos de marketing.",confirm:"Enviar mi solicitud",back:"← Volver al chat",privacy:"Solo usamos tus datos para responder esta consulta.",sent:"¡Gracias! Recibimos tu solicitud. Nuestro equipo la revisará pronto.",error:"No se pudo enviar tu solicitud. Inténtalo nuevamente.",liveError:"Ahora mismo no puedo responder en vivo. Puedes explorar el servicio o dejarnos tus datos.",limit:"Estoy un poco ocupada. Inténtalo después o déjanos tus datos.",next:"¿Lista para el próximo paso?",checkout:"Comenzar",learn:"Cómo funciona",service:"Reservas automáticas",ai:"Asistentes IA",price:"Precios",human:"Contactar al equipo",hint:"Estoy aquí para ayudarte a elegir, sin presión."}
};
function t(k){return words[lang][k]}
function pageText(kind){
 const p=currentPage(),es=lang==="es";
 const copy={
 "cleaning-app":{en:["Hi! I’m Jessie 👋 Want a quick look around the Cleaning App? I’m happy to show you, or answer anything you’re wondering about.","Hi! 👋 Need help with the Cleaning App?"],es:["¡Hola! Soy Jessie 👋 ¿Te gustaría conocer la Cleaning App? Puedo enseñártela o resolver cualquier duda que tengas.","¡Hola! 👋 ¿Dudas sobre la Cleaning App?"]},
 "booking":{en:["Hey! I’m Jessie 👋 Curious about getting your bookings organized? I can show you how it all fits together.","Hi! 👋 Need help with bookings?"],es:["¡Hola! Soy Jessie 👋 ¿Te gustaría organizar mejor las reservas? Te enseño cómo funciona, sin complicaciones.","¡Hola! 👋 ¿Dudas sobre reservas?"]},
 "ai-booking":{en:["Hi! I’m Jessie 👋 Looking at the AI Assistants? Tell me what you’d like help with, and we’ll find a good fit.","Hi! 👋 Exploring our AI Assistants?"],es:["¡Hola! Soy Jessie 👋 ¿Estás mirando los asistentes IA? Cuéntame qué necesitas y vemos cuál te conviene.","¡Hola! 👋 ¿Dudas sobre nuestros asistentes?"]},
 "website":{en:["Hi! I’m Jessie 👋 Wondering how your website could handle more of the follow-up work? Happy to help.","Hi! 👋 Need help with your website?"],es:["¡Hola! Soy Jessie 👋 ¿Quieres recibir y organizar mejor las consultas de tu website? Te cuento cómo.","¡Hola! 👋 ¿Te ayudo con tu website?"]},
 "va":{en:["Hi! I’m Jessie 👋 Need an extra hand with the day-to-day? I can tell you about our VA support.","Hi! 👋 Questions about VA support?"],es:["¡Hola! Soy Jessie 👋 ¿Necesitas una mano con el día a día? Te cuento cómo funciona nuestro apoyo VA.","¡Hola! 👋 ¿Dudas sobre VA?"]},
 "whatsapp":{en:["Hey! I’m Jessie 👋 WhatsApp AI isn’t available just yet, but I can show you the assistants we do offer.","Hi! 👋 Want to explore our AI options?"],es:["¡Hola! Soy Jessie 👋 WhatsApp AI todavía no está disponible, pero te puedo enseñar los asistentes que sí tenemos.","¡Hola! 👋 ¿Quieres conocer nuestros asistentes?"]}
 };
 const entry=copy[p]?.[es?"es":"en"];
 return entry?entry[kind==="nudge"?1:0]:t(kind==="nudge"?"nudge":"hello");
}
function node(tag,cls,text){const x=document.createElement(tag);if(cls)x.className=cls;if(text!==undefined)x.textContent=text;return x}
function button(cls,label,title){const b=node("button",cls,label);b.type="button";if(title)b.setAttribute("aria-label",title);return b}
function track(action){
 try{window.tleTrackEvent?.("jessy_interaction",{action,language:lang,service:allowedService.has(offer)?offer:"general",intent:lastIntent})}catch{}
 if(!categoryEvents.has(action)||!/^(thelaunchera\.com|www\.thelaunchera\.com)$/.test(location.hostname))return;
 const body={event:action,language:lang,service:allowedService.has(offer)?offer:"general",intent:lastIntent};
 // Only categorical stats. No names, message text, email, IP or visitor identifier.
 try{fetch(METRICS,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body),keepalive:true}).catch(()=>{})}catch{}
}

const categoryEvents=new Set(["opened","lead_start","lead_saved","demo_open","demo_close","demo_lead_saved","diagnostic","comparison","pricing","recommendation","client_help","language_switch","answered"]);
const allowedService=new Set(["booking","cleaning-app","website","va","ai-booking","ai-followup","ai-business"]);
function visitorLanguage(m){
 const tokens=(String(m).toLowerCase().match(/[\p{L}]+/gu)||[]).slice(0,60);
 const spanish=new Set(["hola","quiero","necesito","puedes","cómo","como","funciona","cuánto","cuanto","precio","reservas","clientes","limpieza","ayuda","negocio","seguimiento","mostrar","tengo","para","qué","interesa","servicios","con","saber","hacen"]);
 const english=new Set(["hello","hey","what","how","much","need","want","with","your","business","cleaning","website","bookings","clients","follow","price","show","works","can","could","help","would","like","please","service","demo","know","about"]);
 const es=tokens.filter(x=>spanish.has(x)).length+(String(m).match(/[¿¡ñ]/g)||[]).length, en=tokens.filter(x=>english.has(x)).length;
 return es>=2&&es>=en+1?"es":en>=2&&en>=es+2?"en":null;
}
function visitorIntent(m){
 const q=String(m).toLowerCase();
 if(/(price|cost|cuánto|cuanto|precio|mensual|monthly)/.test(q))return "pricing";
 if(/(demo|preview|muestra|demostraci|see it|verlo)/.test(q))return "demo";
 if(/(already bought|purchased|already paid|ya compr|pedido|intake|soporte|support|entrega)/.test(q))return "client_help";
 if(/(compare|versus|\bvs\b|diferencia|compar|bundle|paquete)/.test(q))return "comparison";
 if(/(follow.?up|seguimiento|lost leads|perder clientes|olvid|reply)/.test(q))return "followups";
 if(/(job|invoice|factura|schedule|calendar|calendario|trabajos)/.test(q))return "operations";
 if(/(booking|reserva|cotiz|quote|request)/.test(q))return "bookings";
 return "general";
}

function direct(href){
 if(!href||typeof href!=="string"||!href.startsWith("/")||href.startsWith("//"))return null;
 const p=href.split("?")[0];
 if(!/^\/(?:booking-bundle\/|service-checkout\/|booking-lead-automation|ai-booking-assistant\/|cleaning-web-app|cleaning-app-demo\/|booking-demo\/|website-automation|virtual-assistant|whatsapp-ai-agent\/|es\/)/.test(p))return null;
 return href;
}
function routeFor(href){
 if(!href)return null;
 if(href==="https://app.thelaunchera.com/?entry=signup")return href;
 const s=direct(href);if(!s)return null;
 if(s.startsWith("/booking-bundle/"))return "/booking-bundle/?lang="+lang;
 if(s.startsWith("/cleaning-app-demo/")||s.startsWith("/booking-demo/"))return s.includes("lang=")?s.replace(/lang=(en|es)/,"lang="+lang):s+"?lang="+lang;
 if(s.includes("lang="))return s.replace(/lang=(en|es)/,"lang="+lang);
 if(s.startsWith("/service-checkout/"))return s+"&lang="+lang;
 if(lang==="es"&&!s.startsWith("/es/"))return "/es"+s.replace(/\/$/,"/");
 return s;
}
function makeImage(){const x=node("img","tle-jessy-avatar");x.src=avatarPath;x.alt="Jessie · AI Assistant";x.loading="lazy";x.width=53;x.height=53;return x}
const style=node("link");style.rel="stylesheet";style.href="/assets/jessy-site.css?v=20261015-jessie-seven-v1";document.head.appendChild(style);
const root=node("div","tle-jessy-root tle-jessy-compact");root.setAttribute("data-tle-jessy","true");
const fab=button("tle-jessy-fab","",t("opening"));const fabLabel=node("span","tle-jessy-fab-label",lang==="es"?"Habla con la asistente":"Chat with the assistant");const launcherPhoto=makeImage();launcherPhoto.alt="";fab.append(launcherPhoto,fabLabel);fab.append(node("span","tle-jessy-status"));fab.setAttribute("aria-expanded","false");
const nudge=node("div","tle-jessy-nudge",t("nudge"));nudge.hidden=true;
const backdrop=node("div","tle-jessy-backdrop");backdrop.hidden=true;
const panel=node("section","tle-jessy-panel");panel.hidden=true;panel.setAttribute("role","dialog");panel.setAttribute("aria-modal","true");panel.setAttribute("aria-label","Jessie AI Assistant");
const head=node("header","tle-jessy-head");head.append(makeImage());
const who=node("div","tle-jessy-title");const headName=node("b","",t("name"));const status=node("small","",t("status"));who.append(headName,status);
const languageBtn=button("tle-jessy-icon",lang==="en"?"ES":"EN","Switch language / Cambiar idioma");languageBtn.style.fontSize="11px";languageBtn.style.fontWeight="800";
const soundBtn=button("tle-jessy-icon","♪̸",t("sound"));const closeBtn=button("tle-jessy-icon","×",t("close"));head.append(who,languageBtn,soundBtn,closeBtn);
const log=node("div","tle-jessy-log");log.setAttribute("role","log");log.setAttribute("aria-live","polite");log.setAttribute("aria-relevant","additions text");
const quick=node("div","tle-jessy-quick");
const bottom=node("footer","tle-jessy-bottom");
const form=node("form","tle-jessy-form");const input=node("textarea","tle-jessy-message-field");input.rows=1;input.maxLength=340;input.required=true;input.placeholder=t("input");input.setAttribute("aria-label",t("input"));
const send=button("tle-jessy-send",t("send"));send.type="submit";form.append(input,send);
const leadTrigger=button("tle-jessy-lead-trigger",t("lead"));const note=node("p","tle-jessy-note",t("hint"));bottom.append(form,leadTrigger,note);
const lead=node("div","tle-jessy-lead");lead.hidden=true;
const back=button("tle-jessy-lead-back",t("back"));const leadTitle=node("h3","",t("leadTitle"));const leadIntro=node("p","",t("leadIntro"));
const leadForm=node("form");
function field(label,key,type){const wrapper=node("label");const title=node("span","",label);const element=node(key==="message"?"textarea":"input");element.name=key;if(key!=="message")element.type=type||"text";element.required=key==="name"||key==="email"||key==="business";element.maxLength=key==="message"?500:key==="email"?140:110;element.autocomplete=key==="name"?"name":key==="email"?"email":key==="business"?"organization":"off";wrapper.append(title,element);leadForm.append(wrapper);return element}
const nameInput=field(t("nameLabel"),"name");
const businessInput=field(t("businessLabel"),"business");
const emailInput=field(t("emailLabel"),"email","email");
const needInput=field(t("needLabel"),"message");
const consentLabel=node("label","tle-jessy-consent");const consent=document.createElement("input");consent.type="checkbox";consent.required=true;consent.name="consent";consentLabel.append(consent,node("span","",t("consent")));leadForm.append(consentLabel);
const submit=button("tle-jessy-submit",t("confirm"));submit.type="submit";const formResult=node("p");formResult.setAttribute("role","status");
const privacy=node("p","tle-jessy-note",t("privacy"));leadForm.append(submit,formResult,privacy);lead.append(back,leadTitle,leadIntro,leadForm);
panel.append(head,log,quick,bottom,lead);root.append(fab,nudge,backdrop,panel);document.body.append(root);

const DEMOS=Object.freeze({
  booking:{url:"/lead-private-preview.html",name:"Booking Experience",es:"Experiencia de reservas",image:"/assets/lead-demo/hero-luxury-home.png"},
  "cleaning-app":{url:"/cleaning-app-demo/",name:"Cleaning App",es:"Cleaning App",image:"/assets/cleaning-demo/living-suite.png"}
});
// Reuses existing public sample screens; never passes customer access keys or real booking data.
const demoOverlay=node("div","tle-jessy-demo-overlay");
demoOverlay.hidden=true;demoOverlay.setAttribute("role","dialog");demoOverlay.setAttribute("aria-modal","true");
demoOverlay.setAttribute("aria-label","Interactive sample demo");
const demoWindow=node("div","tle-jessy-demo-window"),demoToolbar=node("div","tle-jessy-demo-toolbar");
const demoHeading=node("div","tle-jessy-demo-heading"),demoTitle=node("strong","","Interactive demo");
const demoCaption=node("small","","Sample only · No real bookings");
demoHeading.append(demoTitle,demoCaption);
const demoExternal=node("a","tle-jessy-demo-external","Open full size ↗");
demoExternal.target="_blank";demoExternal.rel="noopener noreferrer";
const demoClose=button("tle-jessy-demo-close","×","Close demo");
const DEMO_REQUEST="https://bowacxhmjvrqixtwaikv.supabase.co/functions/v1/tle-jessie-demo-lead";
const demoGate=node("form","tle-jessy-demo-gate");
const demoGateTitle=node("h3","","See the demo made for your business");
const demoGateText=node("p","","Tell me a little about your cleaning business. I'll email the demo and show you the sample here.");
function demoField(name,type){
 const label=node("label","tle-jessy-demo-label");
 const caption=node("span","",name);
 const field=node("input","tle-jessy-demo-input");
 field.type=type||"text";field.required=true;field.maxLength=type==="email"?200:100;
 label.append(caption,field);demoGate.append(label);return field;
}
demoGate.append(demoGateTitle,demoGateText);
const demoBusiness=demoField("Business name"),demoEmail=demoField("Email address","email"),demoArea=demoField("Service area (city / ZIP codes)");
const demoConsentRow=node("label","tle-jessy-demo-consent");
const demoConsent=node("input");demoConsent.type="checkbox";demoConsent.required=true;
const demoConsentText=node("span","","I agree to receive the demo I requested by email. This is not a marketing subscription.");
demoConsentRow.append(demoConsent,demoConsentText);
const demoTrap=node("input");demoTrap.type="text";demoTrap.name="website";demoTrap.tabIndex=-1;demoTrap.autocomplete="off";
demoTrap.setAttribute("aria-hidden","true");demoTrap.className="tle-jessy-demo-trap";
const demoSubmit=button("tle-jessy-demo-submit","Email & show my demo →");demoSubmit.type="submit";
const demoStatus=node("p","tle-jessy-demo-status");demoStatus.setAttribute("role","status");demoStatus.setAttribute("aria-live","polite");
demoGate.append(demoConsentRow,demoTrap,demoSubmit,demoStatus);
let demoSelected="booking",demoBusy=false;
function demoText(){
 const es=lang==="es";
 demoGateTitle.textContent=es?"Mira cómo se vería para tu negocio":"See how it works for your business";
 demoGateText.textContent=es?"Dime el nombre de tu negocio, tu correo y el área donde ofreces servicios. Te enviaremos el demo y lo podrás explorar aquí.":"Share your business name, email and service area. We'll email the demo and let you explore it right here.";
 [demoBusiness,demoEmail,demoArea].forEach((field,i)=>{const labels=es?["Nombre del negocio","Correo electrónico","Área de servicio (ciudad / ZIP codes)"]:["Business name","Email address","Service area (city / ZIP codes)"];field.parentNode.querySelector("span").textContent=labels[i]});
 demoConsentText.textContent=es?"Acepto recibir por correo el demo que solicito. Esto no me suscribe a correos de marketing.":"I agree to receive my requested demo by email. This does not subscribe me to marketing emails.";
 demoSubmit.textContent=es?"Enviar y ver mi demo →":"Email & show my demo →";
}
demoGate.addEventListener("submit",async e=>{
 e.preventDefault();
 if(demoBusy||!demoGate.reportValidity())return;
 demoBusy=true;demoSubmit.disabled=true;demoStatus.textContent=lang==="es"?"Preparando tu demo…":"Preparing your demo…";
 try{
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),14000);
  let response;
  try{response=await fetch(DEMO_REQUEST,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({business_name:demoBusiness.value.trim(),email:demoEmail.value.trim(),service_area:demoArea.value.trim(),service:demoSelected,language:lang,consent:demoConsent.checked,website:demoTrap.value}),signal:controller.signal})}finally{clearTimeout(timer)}
  const data=await response.json().catch(()=>({}));
  if(!response.ok||data.ok!==true)throw Error("submit_failed");
  demoStatus.textContent=data.email_sent?(lang==="es"?"¡Listo! Te enviamos el demo por correo.":"Done! Your demo email is on its way."):data.duplicate?(lang==="es"?"Ya tenemos tu solicitud. Puedes explorar el demo aquí.":"We already have your request. You can explore the demo here."):lang==="es"?"Guardamos tu solicitud, pero el correo necesita revisión. Puedes explorar el demo.":"Your request was saved but the email needs review. You can explore the demo.";
  const query=new URLSearchParams({lang,source:"jessie_sample"});
  if(demoSelected==="booking"){query.set("business",demoBusiness.value.trim().slice(0,100));query.set("area",demoArea.value.trim().slice(0,100))}
  const href=DEMOS[demoSelected].url+"?"+query.toString();
  demoExternal.href=href;demoExternal.hidden=false;demoFrame.src=href;demoFrame.hidden=false;
  demoGate.hidden=true;track("demo_lead_saved");
 }catch{
  demoStatus.textContent=lang==="es"?"No pudimos guardar la solicitud ahora. Inténtalo otra vez.":"We couldn't save your request right now. Please try again.";
 }finally{demoBusy=false;demoSubmit.disabled=false}
});

const demoFrame=node("iframe","tle-jessy-demo-frame");
demoFrame.title="Interactive sample demo; no real bookings";
demoFrame.loading="lazy";demoFrame.referrerPolicy="no-referrer";
demoFrame.setAttribute("sandbox","allow-scripts allow-same-origin allow-forms");
demoToolbar.append(demoHeading,demoExternal,demoClose);
demoWindow.append(demoToolbar,demoGate,demoFrame);demoOverlay.append(demoWindow);document.body.append(demoOverlay);
let demoLastFocus=null;
function closeDemo(){
 if(demoOverlay.hidden)return;
 demoOverlay.hidden=true;demoFrame.removeAttribute("src");demoFrame.hidden=true;demoGate.reset();
 document.body.classList.remove("tle-jessy-demo-open");track("demo_close");
 (demoLastFocus&&demoLastFocus.isConnected?demoLastFocus:input).focus();
}
function openDemo(id){
 const d=DEMOS[id];if(!d)return;
 demoSelected=id;demoLastFocus=document.activeElement;
 demoTitle.textContent=lang==="es"?d.es:d.name;
 demoCaption.textContent=lang==="es"?"Demo de ejemplo · Sin reservas reales":"Sample only · No real bookings";
 demoExternal.textContent=lang==="es"?"Abrir pantalla completa ↗":"Open full size ↗";
 demoClose.setAttribute("aria-label",lang==="es"?"Cerrar demo":"Close demo");
 demoText();demoGate.reset();demoStatus.textContent="";
 demoGate.hidden=false;demoFrame.hidden=true;demoFrame.removeAttribute("src");
 demoExternal.hidden=true;demoExternal.removeAttribute("href");
 demoOverlay.hidden=false;document.body.classList.add("tle-jessy-demo-open");
 demoClose.focus();track("demo_open");
}
demoClose.addEventListener("click",closeDemo);
demoOverlay.addEventListener("click",event=>{if(event.target===demoOverlay)closeDemo()});
demoOverlay.addEventListener("keydown",event=>{
 if(event.key==="Escape"){event.preventDefault();closeDemo()}
 if(event.key==="Tab"){
  if(event.shiftKey&&document.activeElement===demoExternal){event.preventDefault();demoClose.focus()}
  else if(!event.shiftKey&&document.activeElement===demoClose){event.preventDefault();demoExternal.focus()}
 }
});
function showDemoCard(id){
 const d=DEMOS[id];if(!d)return false;
 const card=button("tle-jessy-demo-card","","");
 card.setAttribute("aria-label",lang==="es"?"Abrir demo interactiva":"Open interactive demo");
 const photo=node("img","tle-jessy-demo-cover");photo.src=d.image;photo.alt="";photo.loading="lazy";
 const copy=node("span","tle-jessy-demo-card-copy");
 copy.append(node("strong","",lang==="es"?d.es:d.name),node("small","",lang==="es"?"Demo original · Datos de ejemplo":"Original demo · Sample data"));
 card.append(photo,copy,node("span","tle-jessy-demo-arrow","↗"));
 card.addEventListener("click",()=>openDemo(id));
 log.append(card);log.scrollTop=log.scrollHeight;
 return true;
}

function msg(text,sender){const bubble=node("div","tle-jessy-message "+sender,text);log.appendChild(bubble);log.scrollTop=log.scrollHeight;return bubble}
function actions(checkout,detail,trial){
 const row=node("div","tle-jessy-inline");
 const isEs=lang==="es";
 const options=[];
 if(trial){
  options.push({href:trial,label:isEs?"Probar gratis":"Try it free",kind:"primary"});
  if(detail)options.push({href:detail,label:isEs?"Ver demo":"See the demo",kind:"secondary"});
 }else if(checkout){
  options.push({href:checkout,label:isEs?"Comenzar":"Get started",kind:"primary",checkout:true});
  options.push({prompt:isEs?"¿Me explicas un poco cómo funciona este servicio?":"Could you walk me through how this service works?",label:isEs?"Cómo funciona":"How it works",kind:"secondary"});
 }else if(detail){
  options.push({href:detail,label:isEs?"Ver opciones":"See your options",kind:"primary"});
 }
 for(const item of options.slice(0,2)){
  const el=item.href?node("a","tle-jessy-action tle-jessy-action-"+item.kind,item.label):button("tle-jessy-action tle-jessy-action-"+item.kind,item.label);
  if(item.href){
   const url=routeFor(item.href);if(!url)continue;
   el.href=url;
   el.setAttribute("rel","noopener");
   if(item.checkout)el.setAttribute("aria-label",isEs?"Continuar al checkout del servicio":"Continue to this service's checkout");
   el.addEventListener("click",()=>track(item.checkout?"checkout_opened":"service_demo_opened"));
  }else{
   el.addEventListener("click",()=>{track("service_explained");ask(item.prompt)});
  }
  row.appendChild(el);
 }
 if(row.children.length){log.appendChild(row);log.scrollTop=log.scrollHeight}
}
function showAiPlanChoices(plans){
 const wanted=["ai-booking","ai-followup","ai-business"];
 if(!Array.isArray(plans)||plans.length!==3||wanted.some(id=>!plans.some(p=>p&&p.id===id)))return false;
 const list=node("div","tle-jessy-plan-list");
 list.setAttribute("role","group");
 list.setAttribute("aria-label",lang==="es"?"Comparar los tres planes de AI Assistant":"Compare all three AI Assistant plans");
 for(const id of wanted){
  const p=plans.find(row=>row.id===id),target=routeFor(p.checkout);
  if(!target||!target.startsWith("/service-checkout/?offer="+id+"&"))return false;
  const card=node("div","tle-jessy-plan-card");
  const heading=node("strong","tle-jessy-plan-name",String(p.name||"").slice(0,80));
  const description=node("p","tle-jessy-plan-description",String(p.description||"").slice(0,180));
  const price=node("p","tle-jessy-plan-price",String(p.price||"").slice(0,200));
  const a=node("a","tle-jessy-plan-cta",lang==="es"?"Elegir este plan →":"Choose this plan →");
  a.href=target;a.setAttribute("aria-label",(lang==="es"?"Abrir checkout de ":"Open checkout for ")+p.name);
  a.addEventListener("click",()=>track("ai_plan_checkout_"+id));
  card.append(heading,description,price,a);list.appendChild(card);
 }
 log.appendChild(list);log.scrollTop=log.scrollHeight;
 track("ai_plans_shown");
 return true;
}
async function reloadOffers(){try{const r=await fetch(catalogPath+"?r="+Date.now(),{cache:"no-store"});if(r.ok){const data=await r.json();if(Array.isArray(data.offers)&&data.offers.length>=7)catalog=data.offers}}catch{}}
function quickChoices(){
 quick.replaceChildren();
 const p=currentPage(),es=lang==="es";
 let opts=[[t("service"),es?"Necesito mejorar mis reservas.":"I need better bookings."],[t("ai"),es?"¿Qué asistentes IA ofrecen?":"Which AI Assistants do you offer?"],[t("price"),es?"¿Qué precios tienen?":"What are your prices?"],[t("human"),"lead-form"]];
 if(p==="cleaning-app")opts=[
 [es?"Funciones de la app":"App features",es?"¿Qué puedo organizar en la Cleaning App?":"What can I manage in the Cleaning App?"],
 [es?"Prueba gratis":"Free trial",es?"¿Cómo comienzo mi prueba gratis de la app?":"How do I start my free trial in the app?"],
 [es?"Ver demo":"Try demo",es?"¿Puedo probar una demo de la app?":"Can I try the app demo?"],
 [t("human"),"lead-form"]];
 else if(p==="booking")opts=[
 [es?"Cómo funciona":"How it works",es?"¿Cómo funciona Booking Automation?":"How does Booking Automation work?"],
 [es?"Ver planes":"See plans",es?"¿Qué incluye el paquete de reservas?":"What's included in the booking package?"],
 [t("price"),es?"¿Qué cuesta Booking Automation?":"What does Booking Automation cost?"],
 [t("human"),"lead-form"]];
 else if(p==="ai-booking")opts=[
 [es?"Comparar 3 planes":"Compare 3 plans",es?"¿Qué planes de AI Assistant ofrecen?":"Which AI Assistants do you offer?"],
 ["AI Booking",es?"¿Qué hace AI Booking Assistant?":"What does the AI Booking Assistant do?"],
 [es?"Seguimientos":"Follow-ups",es?"¿Qué hace el AI Follow-Up Assistant?":"What does AI Follow-Up Assistant do?"],
 [es?"Ambos asistentes":"Both assistants",es?"¿Qué hace AI Business Assistant?":"What does AI Business Assistant do?"],
 [t("human"),"lead-form"]];
 opts.forEach(function(entry){const b=button("",entry[0]);b.addEventListener("click",()=>{if(entry[1]==="lead-form")showLead(true);else ask(entry[1])});quick.appendChild(b)});
}
function greeting(){if(!seen){msg(pageText("hello"),"bot");seen=true;quickChoices()}}
function optionalChime(){if(!soundOn)return;try{const Context=window.AudioContext||window.webkitAudioContext;if(!Context)return;const a=new Context();const o=a.createOscillator();const gain=a.createGain();o.type="sine";o.frequency.value=660;gain.gain.setValueAtTime(.0001,a.currentTime);gain.gain.exponentialRampToValueAtTime(.03,a.currentTime+.02);gain.gain.exponentialRampToValueAtTime(.0001,a.currentTime+.15);o.connect(gain);gain.connect(a.destination);o.start();o.stop(a.currentTime+.16);o.onended=()=>a.close()}catch{}}
function showLead(on){
 if(on)track("lead_start");
 details=on;lead.hidden=!on;log.hidden=on;quick.hidden=on;bottom.hidden=on;
 if(on){
  // Editable summary only: no transcript sent unless the visitor submits the consent form.
  if(!needInput.value){
   const entry=catalog.find(x=>x.id===offer);
   const lastQuestion=[...history].reverse().find(x=>x.role==="user")?.message||"";
   const service=entry?(lang==="es"?"Me interesa ":"I'm interested in ")+entry.name:"";
   const question=lastQuestion?(lang==="es"?"Mi consulta: ":"My question: ")+lastQuestion:"";
   needInput.value=[service,question].filter(Boolean).join(". ").slice(0,480);
  }
  nameInput.focus();
 }else{input.focus()}
}
function toggle(state){open=state;panel.hidden=!state;backdrop.hidden=!state;fab.setAttribute("aria-expanded",state?"true":"false");fab.hidden=state;nudge.hidden=true;document.body.classList.toggle("tle-jessy-open",state);if(state){lastFocus=document.activeElement;startedAt=Date.now()-3000;greeting();reloadOffers();optionalChime();try{navigator.vibrate?.(45)}catch{}if(window.innerWidth>600)input.focus();track("opened")}else{showLead(false);fab.hidden=false;if(lastFocus&&lastFocus.isConnected&&lastFocus.focus)lastFocus.focus();else fab.focus();track("closed")}}
async function ask(raw){if(waiting)return;const message=String(raw||"").trim().slice(0,340);if(message.length<2)return;
 if(!manualLanguage){const auto=visitorLanguage(message);if(auto&&auto!==lang){lang=auto;syncLanguage()}}
 lastIntent=visitorIntent(message);
 if(lastIntent!=="general")track("diagnostic");if(/(?:\d[ -]*?){13,19}/.test(message)){msg(lang==="es"?"Por favor, no compartas números de tarjeta aquí.":"Please don't share card numbers here.","bot");return}
msg(message,"user");input.value="";waiting=true;send.disabled=true;const indicator=msg(t("typing"),"bot");
if(/quiero hablar|contactar|leave my details|talk to a person|human support/i.test(message)){indicator.remove();showLead(true);waiting=false;send.disabled=false;return}
const previous=history.slice(-12);let result=null;try{const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),16000);try{const r=await fetch(ENDPOINT,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message,language:lang,selected_offer:offer||currentPage(),page_path:location.pathname,history:previous}),signal:controller.signal});if(r.ok)result=await r.json();else if(r.status===429)result={reply:t("limit")}}finally{clearTimeout(timeout)}}catch{}
indicator.textContent=result&&typeof result.reply==="string"?result.reply:t("liveError");
if(result&&typeof result.reply==="string"){
 history.push({role:"user",message},{role:"assistant",message:result.reply});
 if(history.length>16)history=history.slice(-16);
 // A general capabilities answer clears any stale previously selected product.
 if(typeof result.selected_offer==="string")offer=result.selected_offer;
 const entry=catalog.find(x=>x.id===offer);
 const checkout=result.checkout||(entry?.checkout||null);const info=result.details||(entry?.details||null);
 const plansShown=showAiPlanChoices(result.ai_plans);
 // Answer first, offer only a relevant action that the visitor explicitly requested.
 // The old auto-actions repeated "Get started / How it works" after EVERY answer.
 if(!plansShown){
  const next=result.next_action;
  if(next==="demo"&&DEMOS[offer])showDemoCard(offer);
  if(next==="client_help"){const help=node("a","tle-jessy-help-link",lang==="es"?"Ir a ayuda y soporte ↗":"Go to help & support ↗");help.href="/help/";log.append(help)}
  if(next==="checkout"&&checkout)actions(checkout,info,null);
  else if(next==="trial"&&result.trial)actions(null,info,result.trial);
  else if(next==="demo"&&!DEMOS[offer]&&info)actions(null,info,null);
 }
 if(lastIntent==="comparison")track("comparison");
 if(lastIntent==="pricing")track("pricing");
 if(allowedService.has(offer)&&lastIntent!=="general")track("recommendation");
 track("answered");
}else{track("chat_unavailable")}
waiting=false;send.disabled=false;log.scrollTop=log.scrollHeight;input.focus()}
fab.addEventListener("click",()=>toggle(true));closeBtn.addEventListener("click",()=>toggle(false));backdrop.addEventListener("click",()=>toggle(false));
soundBtn.addEventListener("click",()=>{soundOn=!soundOn;soundBtn.textContent=soundOn?"♫":"♪̸";soundBtn.setAttribute("aria-pressed",soundOn?"true":"false");optionalChime()});
function syncLanguage(){
 languageBtn.textContent=lang==="en"?"ES":"EN";status.textContent=t("status");
 nudge.textContent=t("nudge");
 fabLabel.textContent=lang==="es"?"Habla con la asistente":"Chat with the assistant";
 fab.setAttribute("aria-label",t("opening"));closeBtn.setAttribute("aria-label",t("close"));
 input.placeholder=t("input");input.setAttribute("aria-label",t("input"));
 send.textContent=t("send");leadTrigger.textContent=t("lead");note.textContent=t("hint");
 leadTitle.textContent=t("leadTitle");leadIntro.textContent=t("leadIntro");back.textContent=t("back");
 nameInput.parentNode.querySelector("span").textContent=t("nameLabel");
 businessInput.parentNode.querySelector("span").textContent=t("businessLabel");
 emailInput.parentNode.querySelector("span").textContent=t("emailLabel");
 needInput.parentNode.querySelector("span").textContent=t("needLabel");
 consentLabel.querySelector("span").textContent=t("consent");
 submit.textContent=t("confirm");privacy.textContent=t("privacy");quickChoices();
}
languageBtn.addEventListener("click",()=>{manualLanguage=true;lang=lang==="en"?"es":"en";syncLanguage();track("language_switch");msg(lang==="es"?"¡También hablo español! ¿En qué te ayudo?":"I speak English too! How can I help?","bot");track("language_switch")});
form.addEventListener("submit",e=>{e.preventDefault();ask(input.value)});
input.addEventListener("keydown",e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();form.requestSubmit()}});
leadTrigger.addEventListener("click",()=>showLead(true));back.addEventListener("click",()=>showLead(false));
leadForm.addEventListener("submit",async e=>{
 e.preventDefault();if(!consent.checked||!leadForm.reportValidity())return;
 submit.disabled=true;formResult.textContent="";formResult.className="";
 const payload={name:nameInput.value.trim(),business_name:businessInput.value.trim(),email:emailInput.value.trim(),language:lang,source:lang==="es"?"main_website_es":"main_website",help_needed:[catalog.find(o=>o.id===offer)?.name||"Jessie — general inquiry"],message:"Jessie website assistant inquiry: "+needInput.value.trim().slice(0,430)+". Visitor explicitly accepted contact about this request; no marketing subscription.",preferred_contact:"email",started_at:startedAt,website:""};
 try{const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),16000);let r;try{r=await fetch(CONTACT,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload),signal:controller.signal})}finally{clearTimeout(timeout)}const data=await r.json().catch(()=>null);if(!r.ok||data?.ok!==true)throw Error("delivery");formResult.textContent=t("sent");consent.checked=false;track("lead_saved");leadForm.querySelectorAll("input:not([type=checkbox]),textarea").forEach(x=>x.readOnly=true);submit.hidden=true}
 catch{formResult.textContent=t("error");formResult.className="tle-jessy-error"}finally{submit.disabled=false}
});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&open)toggle(false)});
let lastLocation=location.pathname+"?"+location.search;
function handleRoute(){
 const next=location.pathname+"?"+location.search;
 if(next===lastLocation)return;
 lastLocation=next;
 const isEs=location.pathname==="/es"||location.pathname.startsWith("/es/")||new URLSearchParams(location.search).get("lang")==="es";
 lang=isEs?"es":"en";
 offer=currentPage();
 syncLanguage();
 if(open&&offer){msg(pageText("hello"),"bot");quickChoices();}
 reloadOffers();track("page_changed");
}
window.addEventListener("popstate",handleRoute);
window.addEventListener("hashchange",handleRoute);
for(const name of ["pushState","replaceState"]){
 const original=window.history[name];
 if(typeof original==="function")window.history[name]=function(...args){const result=original.apply(this,args);Promise.resolve().then(handleRoute);return result;};
}
syncLanguage();
window.addEventListener("focus",()=>{if(open)reloadOffers()});
/* Welcome visibly on first entry; shrink the launcher when the visitor starts scrolling.
 * The conversation never closes on scroll, and the avatar remains a full-size tap target. */
let compact=false;
function collapseJessyLauncher(){
 if(compact)return;
 compact=true;
 root.classList.add("tle-jessy-compact");
 nudge.hidden=true;
 fab.setAttribute("title",lang==="es"?"Hablar con la asistente":"Chat with the assistant");
 track("launcher_collapsed_on_scroll");
}
function updateJessyScroll(){
 if(!compact&&window.scrollY>36)collapseJessyLauncher();
}
window.addEventListener("scroll",updateJessyScroll,{passive:true});
updateJessyScroll();
setTimeout(()=>{
 if(!open&&!compact&&window.scrollY<=36){
  nudge.textContent=t("nudge");
  nudge.hidden=false;
  setTimeout(()=>{nudge.hidden=true},6900);
 }
},1050);
reloadOffers();track("loaded");
})();
