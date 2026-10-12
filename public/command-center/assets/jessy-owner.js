/* Jessy — private Owner Command Center helper. No public chat or buyer access. */
(function(){
"use strict";
if(window.__tleOwnerJessyInstalled)return;
window.__tleOwnerJessyInstalled=true;
const ASSET="/assets/jessy-avatar.webp",CSS="./assets/jessy-owner.css?v=20261012-owner-1";
let root=null,log=null,form=null,input=null,send=null,quick=null,open=false,waiting=false,language="en",history=[],previousFocus=null;
const copy={
 en:{open:"Ask Jessy",intro:"Hi! 👋 I'm Jessy, your Command Center assistant. Want to check leads, follow-ups or a client delivery?",subtitle:"Your private workspace helper",placeholder:"Ask about leads, clients or your next step…",send:"Send",close:"Close Jessy",thinking:"Checking your workspace…",error:"I couldn't check that right now. Try again or open the section directly.",note:"Private owner assistance · No automatic emails or changes",label:"Open this section →",quick:[["Today's priorities","What needs my attention today?"],["Follow-ups","Which prospect follow-ups are due?"],["Website leads","Any new website inquiries?"],["Client deliveries","Which client deliveries need review?"],["Support","I need help with a problem"]]},
 es:{open:"Pregúntale a Jessy",intro:"¡Hola! 👋 Soy Jessy, tu asistente del Command Center. ¿Revisamos leads, seguimientos o entregas?",subtitle:"Tu asistente privada de operaciones",placeholder:"Pregunta sobre leads, clientes o el próximo paso…",send:"Enviar",close:"Cerrar Jessy",thinking:"Revisando tu espacio…",error:"Ahora no pude comprobarlo. Inténtalo otra vez o abre la sección directamente.",note:"Asistencia privada · Sin correos ni cambios automáticos",label:"Abrir esta sección →",quick:[["Prioridades de hoy","¿Qué necesita mi atención hoy?"],["Seguimientos","¿Qué seguimientos de prospectos están pendientes?"],["Leads web","¿Hay nuevas consultas del website?"],["Entregas","¿Qué entregas de clientes debo revisar?"],["Soporte","Necesito ayuda con un problema"]]}
};
const sections={
 "owner-pages":["Clients & Purchases","Clientes y compras"],
 "owner-calendar":["Client Calendar","Calendario de clientes"],
 "leads":["Prospect Leads","Prospectos"],
 "calendar":["Prospect Follow-ups","Seguimientos"],
 "inbox":["Website Inquiries","Consultas web"],
 "emails":["Outreach Emails","Correos"],
 "owner-support":["Troubleshooting & Support","Soporte"],
 "owner-help":["Help","Ayuda"]
};
function t(k){return copy[language][k]}
function el(tag,cls,txt){const node=document.createElement(tag);if(cls)node.className=cls;if(txt!==undefined)node.textContent=txt;return node}
function b(cls,txt){const node=el("button",cls,txt);node.type="button";return node}
function owner(){return window.TLEOwnerJessyGateway?.ready?.()===true}
function lang(){const workspace=document.body.dataset.languageWorkspace;let saved;try{saved=localStorage.getItem("tle_crm_language_"+workspace)||localStorage.getItem("tle_crm_owner_language")||localStorage.getItem("tle_crm_language")}catch{}return saved==="es"?"es":"en"}
function bubble(text,role){const item=el("div","jo-bubble "+role,text);log.appendChild(item);log.scrollTop=log.scrollHeight;return item}
function shortcuts(){quick.replaceChildren();t("quick").forEach(([name,message])=>{const btn=b("jo-quick",name);btn.addEventListener("click",()=>ask(message));quick.appendChild(btn)})}
function hide(){if(!root)return;root.querySelector(".jo-panel").hidden=true;root.querySelector(".jo-fab").hidden=false;open=false;document.body.classList.remove("jo-open");if(previousFocus?.isConnected)previousFocus.focus()}
function show(){if(!owner())return;const panel=root.querySelector(".jo-panel");previousFocus=document.activeElement;panel.hidden=false;root.querySelector(".jo-fab").hidden=true;open=true;if(!log.children.length)bubble(t("intro"),"bot");shortcuts();if(window.innerWidth>650)input.focus()}
function build(){
 if(root||!owner())return;
 language=lang();
 root=el("div","jo-root");root.id="tleOwnerJessy";root.setAttribute("data-owner-only","true");
 const fab=b("jo-fab");
 const face=el("img","jo-face");face.src=ASSET;face.alt="Jessy";face.width=48;face.height=48;
 fab.append(face,el("span","",t("open")));fab.setAttribute("aria-label",t("open"));
 const panel=el("section","jo-panel");panel.hidden=true;panel.setAttribute("role","dialog");panel.setAttribute("aria-label","Jessy · Owner Command Center");panel.setAttribute("aria-modal","false");
 const head=el("header","jo-head"),pic=el("img","jo-face");pic.src=ASSET;pic.alt="";pic.width=46;pic.height=46;
 const heading=el("div","jo-heading");heading.append(el("strong","","Jessy"),el("small","",t("subtitle")));
 const close=b("jo-close","×");close.setAttribute("aria-label",t("close"));head.append(pic,heading,close);
 log=el("div","jo-log");log.setAttribute("role","log");log.setAttribute("aria-live","polite");
 quick=el("div","jo-quick-list");
 form=el("form","jo-form");input=el("textarea","jo-input");input.required=true;input.rows=1;input.maxLength=340;input.placeholder=t("placeholder");input.setAttribute("aria-label",t("placeholder"));send=b("jo-send",t("send"));send.type="submit";
 form.append(input,send);const note=el("p","jo-note",t("note"));
 const foot=el("footer","jo-footer");foot.append(quick,form,note);panel.append(head,log,foot);
 root.append(fab,panel);document.body.append(root);
 fab.addEventListener("click",show);close.addEventListener("click",hide);form.addEventListener("submit",e=>{e.preventDefault();ask(input.value)});
 input.addEventListener("keydown",e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();form.requestSubmit()}});
 shortcuts();
}
function sync(){
 if(!owner()){if(root){root.remove();root=null;history=[];open=false;log=null;input=null;quick=null}return}
 if(!root)build();
 const next=lang();if(next!==language){language=next;if(root){root.querySelector(".jo-fab span").textContent=t("open");root.querySelector(".jo-heading small").textContent=t("subtitle");root.querySelector(".jo-close").setAttribute("aria-label",t("close"));input.placeholder=t("placeholder");send.textContent=t("send");root.querySelector(".jo-note").textContent=t("note");shortcuts()}}
}
async function ask(raw){
 if(waiting||!owner()||!root)return;
 const question=String(raw||"").trim().slice(0,340);
 if(question.length<2)return;
 if(!open)show();
 bubble(question,"user");input.value="";
 const pending=bubble(t("thinking"),"bot");
 waiting=true;send.disabled=true;const shortHistory=history.slice(-4);
 try{
  const result=await window.TLEOwnerJessyGateway.ask({message:question,language,history:shortHistory});
  if(!owner())return;
  pending.textContent=result.reply||t("error");
  history.push({role:"user",message:question},{role:"assistant",message:pending.textContent});
  if(history.length>8)history=history.slice(-8);
  const dest=result.section;
  if(dest&&sections[dest]){
   const btn=b("jo-next",t("label")+" "+sections[dest][language==="es"?1:0]);
   btn.addEventListener("click",()=>{if(window.TLEOwnerJessyGateway.navigate(dest))hide()});
   log.appendChild(btn);
  }
 }catch{if(owner())pending.textContent=t("error")}
 finally{waiting=false;if(send)send.disabled=false;if(log)log.scrollTop=log.scrollHeight}
}
const sheet=el("link");sheet.rel="stylesheet";sheet.href=CSS;document.head.append(sheet);
function start(){
 const target=document.getElementById("app");
 new MutationObserver(sync).observe(document.body,{attributes:true,attributeFilter:["class"]});
 if(target)new MutationObserver(sync).observe(target,{attributes:true,attributeFilter:["class"]});
 document.addEventListener("tle-crm-language",sync);
 window.addEventListener("tle-crm-ready",sync);
 window.addEventListener("pageshow",sync);
 document.addEventListener("keydown",e=>{if(e.key==="Escape"&&open)hide()});
 sync();
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
})();
