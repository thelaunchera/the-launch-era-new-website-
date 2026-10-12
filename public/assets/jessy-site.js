
(function(){
"use strict";
if(window.__tleJessyInstalled)return;
window.__tleJessyInstalled=true;
const ENDPOINT="https://bowacxhmjvrqixtwaikv.supabase.co/functions/v1/tle-jessy-chat";
const CONTACT="https://bowacxhmjvrqixtwaikv.supabase.co/functions/v1/tle-contact";
const catalogPath="/assets/jessy-offers.json";
const avatarPath="/assets/jessy-avatar.webp";
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
let startedAt=Date.now();
const words={
 en:{name:"Jessy",status:"AI Assistant · The Launch Era",nudge:"Hi! I'm Jessy 👋 Need a hand?",hello:"Hi! 👋 I'm Jessy, The Launch Era's AI Assistant. What can I help you with today?",opening:"Open Jessy AI Assistant",close:"Close assistant",sound:"Toggle welcome sound",label:"Ask Jessy",typing:"One moment…",input:"Ask me anything about our services…",send:"Send",lead:"Leave my details for the team",leadTitle:"Let's keep in touch",leadIntro:"Share a few details. We'll review your question and get back to you.",nameLabel:"Your name",businessLabel:"Business name",emailLabel:"Email address",needLabel:"What do you need help with?",consent:"I agree that The Launch Era may contact me about this request. This does not subscribe me to marketing emails.",confirm:"Send my request",back:"← Back to chat",privacy:"Your details are only used to reply to this request.",sent:"Thanks! We received your request. Our team will review it soon.",error:"Your request didn't go through. Please try again.",liveError:"I'm having trouble answering right now. You can still explore a service or send us your details.",limit:"I'm a little busy right now. Please try again soon or leave your details.",next:"Ready for the next step?",checkout:"View checkout ↗",learn:"Explore service ↗",service:"Booking automation",ai:"AI assistants",price:"Pricing",human:"Contact the team",hint:"I can guide you. I don't handle payments or confirm orders."},
 es:{name:"Jessy",status:"Asistente IA · The Launch Era",nudge:"¡Hola! Soy Jessy 👋 ¿Te ayudo?",hello:"¡Hola! 👋 Soy Jessy, la asistente IA de The Launch Era. ¿En qué puedo ayudarte?",opening:"Abrir asistente Jessy",close:"Cerrar asistente",sound:"Activar o desactivar sonido",label:"Pregúntale a Jessy",typing:"Un momento…",input:"Pregúntame sobre nuestros servicios…",send:"Enviar",lead:"Dejar mis datos al equipo",leadTitle:"Sigamos en contacto",leadIntro:"Compártenos algunos datos. Revisaremos tu consulta y te responderemos.",nameLabel:"Tu nombre",businessLabel:"Nombre del negocio",emailLabel:"Correo electrónico",needLabel:"¿En qué necesitas ayuda?",consent:"Acepto que The Launch Era me contacte sobre esta consulta. Esto no me suscribe a correos de marketing.",confirm:"Enviar mi solicitud",back:"← Volver al chat",privacy:"Solo usamos tus datos para responder esta consulta.",sent:"¡Gracias! Recibimos tu solicitud. Nuestro equipo la revisará pronto.",error:"No se pudo enviar tu solicitud. Inténtalo nuevamente.",liveError:"Ahora mismo no puedo responder en vivo. Puedes explorar el servicio o dejarnos tus datos.",limit:"Estoy un poco ocupada. Inténtalo después o déjanos tus datos.",next:"¿Lista para el próximo paso?",checkout:"Ver checkout ↗",learn:"Explorar servicio ↗",service:"Reservas automáticas",ai:"Asistentes IA",price:"Precios",human:"Contactar al equipo",hint:"Te oriento. No proceso pagos ni confirmo compras."}
};
function t(k){return words[lang][k]}
function pageText(kind){
 const p=currentPage(),es=lang==="es";
 const copy={
 "cleaning-app":{en:["Hi! 👋 I'm Jessy. Questions about the Cleaning App? I can help with features, the demo or your free trial.","Questions about the Cleaning App? 💬"],es:["¡Hola! 👋 Soy Jessy. ¿Dudas sobre la Cleaning App? Te ayudo con sus funciones, la demo o la prueba gratis.","¿Dudas sobre la Cleaning App? 💬"]},
 "booking":{en:["Hi! 👋 I'm Jessy. Want to organize booking requests and follow-ups? I can show you how.","Need help with booking? 💬"],es:["¡Hola! 👋 Soy Jessy. ¿Quieres organizar reservas y seguimientos? Te explico cómo funciona.","¿Dudas sobre las reservas? 💬"]},
 "ai-booking":{en:["Hi! 👋 I'm Jessy. Looking at our AI Assistants? Ask me which setup fits your business.","Questions about AI Assistants? 💬"],es:["¡Hola! 👋 Soy Jessy. ¿Viendo nuestros asistentes de IA? Te ayudo a elegir.","¿Dudas sobre la IA? 💬"]},
 "website":{en:["Hi! 👋 I'm Jessy. Have a question about automating your website inquiries?","Questions about website automation? 💬"],es:["¡Hola! 👋 Soy Jessy. ¿Quieres automatizar las consultas de tu website?","¿Dudas sobre tu website? 💬"]},
 "va":{en:["Hi! 👋 I'm Jessy. Need a hand with our VA support? Ask away.","Questions about VA support? 💬"],es:["¡Hola! 👋 Soy Jessy. ¿Tienes dudas sobre nuestro apoyo VA?","¿Preguntas sobre VA? 💬"]},
 "whatsapp":{en:["Hi! 👋 I'm Jessy. WhatsApp AI is coming soon. Want to see our available assistants?","Want to explore our AI options? 💬"],es:["¡Hola! 👋 Soy Jessy. WhatsApp AI llegará pronto. ¿Quieres ver los asistentes disponibles?","¿Quieres conocer nuestros asistentes? 💬"]}
 };
 const entry=copy[p]?.[es?"es":"en"];
 return entry?entry[kind==="nudge"?1:0]:t(kind==="nudge"?"nudge":"hello");
}
function node(tag,cls,text){const x=document.createElement(tag);if(cls)x.className=cls;if(text!==undefined)x.textContent=text;return x}
function button(cls,label,title){const b=node("button",cls,label);b.type="button";if(title)b.setAttribute("aria-label",title);return b}
function track(action){try{window.tleTrackEvent?.("jessy_interaction",{action,language:lang})}catch{}}
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
function makeImage(){const x=node("img","tle-jessy-avatar");x.src=avatarPath;x.alt="Jessy · AI Assistant";x.loading="lazy";x.width=53;x.height=53;return x}
const style=node("link");style.rel="stylesheet";style.href="/assets/jessy-site.css?v=20261012";document.head.appendChild(style);
const root=node("div","tle-jessy-root");root.setAttribute("data-tle-jessy","true");
const fab=button("tle-jessy-fab","",t("opening"));fab.append(makeImage(),node("span","", "Chat with Jessy"));fab.append(node("span","tle-jessy-status"));fab.setAttribute("aria-expanded","false");
const nudge=node("div","tle-jessy-nudge",pageText("nudge"));nudge.hidden=true;
const backdrop=node("div","tle-jessy-backdrop");backdrop.hidden=true;
const panel=node("section","tle-jessy-panel");panel.hidden=true;panel.setAttribute("role","dialog");panel.setAttribute("aria-modal","true");panel.setAttribute("aria-label","Jessy AI Assistant");
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
function msg(text,sender){const bubble=node("div","tle-jessy-message "+sender,text);log.appendChild(bubble);log.scrollTop=log.scrollHeight;return bubble}
function actions(checkout,detail,trial){
 const row=node("div","tle-jessy-inline");
 const list=[
 [trial,lang==="es"?"Iniciar prueba gratis ↗":"Start free trial ↗"],
 [checkout,t("checkout")],
 [detail,detail?.startsWith("/cleaning-app-demo/")?(lang==="es"?"Probar demo ↗":"Try the demo ↗"):t("learn")]
 ];
 for(const [href,label] of list){const u=routeFor(href);if(!u)continue;const a=node("a","",label);a.href=u;a.setAttribute("rel","noopener");a.addEventListener("click",()=>track("checkout_or_details"));row.appendChild(a)}
 if(row.children.length){log.appendChild(row);log.scrollTop=log.scrollHeight}
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
 ["AI Booking",es?"¿Qué hace AI Booking Assistant?":"What does the AI Booking Assistant do?"],
 [es?"Seguimientos":"Follow-ups",es?"¿Qué hace el AI Follow-Up Assistant?":"What does AI Follow-Up Assistant do?"],
 [t("price"),es?"¿Qué planes de AI tienen?":"What are your AI plans?"],
 [t("human"),"lead-form"]];
 opts.forEach(function(entry){const b=button("",entry[0]);b.addEventListener("click",()=>{if(entry[1]==="lead-form")showLead(true);else ask(entry[1])});quick.appendChild(b)});
}
function greeting(){if(!seen){msg(pageText("hello"),"bot");seen=true;quickChoices()}}
function optionalChime(){if(!soundOn)return;try{const Context=window.AudioContext||window.webkitAudioContext;if(!Context)return;const a=new Context();const o=a.createOscillator();const gain=a.createGain();o.type="sine";o.frequency.value=660;gain.gain.setValueAtTime(.0001,a.currentTime);gain.gain.exponentialRampToValueAtTime(.03,a.currentTime+.02);gain.gain.exponentialRampToValueAtTime(.0001,a.currentTime+.15);o.connect(gain);gain.connect(a.destination);o.start();o.stop(a.currentTime+.16);o.onended=()=>a.close()}catch{}}
function showLead(on){details=on;lead.hidden=!on;log.hidden=on;quick.hidden=on;bottom.hidden=on;if(on){if(offer){const entry=catalog.find(x=>x.id===offer);if(entry&&!needInput.value)needInput.value=(lang==="es"?"Me interesa ":"I'm interested in ")+entry.name}nameInput.focus()}else{input.focus()}}
function toggle(state){open=state;panel.hidden=!state;backdrop.hidden=!state;fab.setAttribute("aria-expanded",state?"true":"false");fab.hidden=state;nudge.hidden=true;document.body.classList.toggle("tle-jessy-open",state);if(state){lastFocus=document.activeElement;startedAt=Date.now()-3000;greeting();reloadOffers();optionalChime();try{navigator.vibrate?.(45)}catch{}if(window.innerWidth>600)input.focus();track("opened")}else{showLead(false);fab.hidden=false;if(lastFocus&&lastFocus.isConnected&&lastFocus.focus)lastFocus.focus();else fab.focus();track("closed")}}
async function ask(raw){if(waiting)return;const message=String(raw||"").trim().slice(0,340);if(message.length<2)return;if(/(?:\d[ -]*?){13,19}/.test(message)){msg(lang==="es"?"Por favor, no compartas números de tarjeta aquí.":"Please don't share card numbers here.","bot");return}
msg(message,"user");input.value="";waiting=true;send.disabled=true;const indicator=msg(t("typing"),"bot");
if(/quiero hablar|contactar|leave my details|talk to a person|human support/i.test(message)){indicator.remove();showLead(true);waiting=false;send.disabled=false;return}
const previous=history.slice(-6);let result=null;try{const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),16000);try{const r=await fetch(ENDPOINT,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message,language:lang,selected_offer:offer||currentPage(),page_path:location.pathname,history:previous}),signal:controller.signal});if(r.ok)result=await r.json();else if(r.status===429)result={reply:t("limit")}}finally{clearTimeout(timeout)}}catch{}
indicator.textContent=result&&typeof result.reply==="string"?result.reply:t("liveError");
if(result&&typeof result.reply==="string"){
 history.push({role:"user",message},{role:"assistant",message:result.reply});
 if(history.length>12)history=history.slice(-12);
 if(typeof result.selected_offer==="string"&&result.selected_offer)offer=result.selected_offer;
 const entry=catalog.find(x=>x.id===offer);
 const checkout=result.checkout||(entry?.checkout||null);const info=result.details||(entry?.details||null);
 if(checkout||info||result.trial)actions(checkout,info,result.trial);
 track("answered");
}else{actions(null,"/solutions");track("chat_unavailable")}
waiting=false;send.disabled=false;log.scrollTop=log.scrollHeight;input.focus()}
fab.addEventListener("click",()=>toggle(true));closeBtn.addEventListener("click",()=>toggle(false));backdrop.addEventListener("click",()=>toggle(false));
soundBtn.addEventListener("click",()=>{soundOn=!soundOn;soundBtn.textContent=soundOn?"♫":"♪̸";soundBtn.setAttribute("aria-pressed",soundOn?"true":"false");optionalChime()});
languageBtn.addEventListener("click",()=>{lang=lang==="en"?"es":"en";languageBtn.textContent=lang==="en"?"ES":"EN";status.textContent=t("status");nudge.textContent=t("nudge");fab.querySelector("span:not(.tle-jessy-status)").textContent=lang==="es"?"Habla con Jessy":"Chat with Jessy";input.placeholder=t("input");input.setAttribute("aria-label",t("input"));send.textContent=t("send");leadTrigger.textContent=t("lead");note.textContent=t("hint");leadTitle.textContent=t("leadTitle");leadIntro.textContent=t("leadIntro");back.textContent=t("back");nameInput.parentNode.querySelector("span").textContent=t("nameLabel");businessInput.parentNode.querySelector("span").textContent=t("businessLabel");emailInput.parentNode.querySelector("span").textContent=t("emailLabel");needInput.parentNode.querySelector("span").textContent=t("needLabel");consentLabel.querySelector("span").textContent=t("consent");submit.textContent=t("confirm");privacy.textContent=t("privacy");quickChoices();msg(lang==="es"?"¡También hablo español! ¿En qué te ayudo?":"I speak English too! How can I help?","bot");track("language_switch")});
form.addEventListener("submit",e=>{e.preventDefault();ask(input.value)});
input.addEventListener("keydown",e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();form.requestSubmit()}});
leadTrigger.addEventListener("click",()=>showLead(true));back.addEventListener("click",()=>showLead(false));
leadForm.addEventListener("submit",async e=>{
 e.preventDefault();if(!consent.checked||!leadForm.reportValidity())return;
 submit.disabled=true;formResult.textContent="";formResult.className="";
 const payload={name:nameInput.value.trim(),business_name:businessInput.value.trim(),email:emailInput.value.trim(),language:lang,source:lang==="es"?"main_website_es":"main_website",help_needed:[catalog.find(o=>o.id===offer)?.name||"Jessy — general inquiry"],message:"Jessy website assistant inquiry: "+needInput.value.trim().slice(0,430)+". Visitor explicitly accepted contact about this request; no marketing subscription.",preferred_contact:"email",started_at:startedAt,website:""};
 try{const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),16000);let r;try{r=await fetch(CONTACT,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload),signal:controller.signal})}finally{clearTimeout(timeout)}const data=await r.json().catch(()=>null);if(!r.ok||data?.ok!==true)throw Error("delivery");formResult.textContent=t("sent");consent.checked=false;track("lead_saved");leadForm.querySelectorAll("input:not([type=checkbox]),textarea").forEach(x=>x.readOnly=true);submit.hidden=true}
 catch{formResult.textContent=t("error");formResult.className="tle-jessy-error"}finally{submit.disabled=false}
});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&open)toggle(false)});
function handleRoute(){if(!open){lang=(location.pathname==="/es"||location.pathname.startsWith("/es/"))?"es":"en";nudge.textContent=t("nudge")}}
window.addEventListener("popstate",handleRoute);
window.addEventListener("focus",()=>{if(open)reloadOffers()});
setTimeout(()=>{if(!open){nudge.hidden=false;setTimeout(()=>{nudge.hidden=true},8000)}},2200);
reloadOffers();track("loaded");
})();
