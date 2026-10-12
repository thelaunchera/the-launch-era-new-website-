/* Jessy — private Owner Command Center helper. No public chat or buyer access. */
(function(){
"use strict";
if(window.__tleOwnerJessyInstalled)return;
window.__tleOwnerJessyInstalled=true;
const ASSET="/assets/jessy-avatar.webp",CSS="./assets/jessy-owner.css?v=20261012-owner-alert-v1";
let root=null,log=null,form=null,input=null,send=null,quick=null,open=false,waiting=false,language="en",history=[],previousFocus=null;
let notificationTimer=0;
const copy={
 en:{open:"Ask Jessy",intro:"Hi! 👋 I'm Jessy, your Command Center assistant. Want to check leads, follow-ups or a client delivery?",subtitle:"Your private workspace helper",placeholder:"Ask about leads, clients or your next step…",send:"Send",close:"Close Jessy",thinking:"Checking your workspace…",error:"I couldn't check that right now. Try again or open the section directly.",note:"Private owner assistance · Drafts require your approval. Jessy never sends emails.",label:"Open this section →",quick:[["Prepare follow-up draft","Prepare a follow-up email draft"],["Today's priorities","What needs my attention today?"],["Follow-ups","Which prospect follow-ups are due?"],["Website leads","Any new website inquiries?"],["Client deliveries","Which client deliveries need review?"],["Support","I need help with a problem"]]},
 es:{open:"Pregúntale a Jessy",intro:"¡Hola! 👋 Soy Jessy, tu asistente del Command Center. ¿Revisamos leads, seguimientos o entregas?",subtitle:"Tu asistente privada de operaciones",placeholder:"Pregunta sobre leads, clientes o el próximo paso…",send:"Enviar",close:"Cerrar Jessy",thinking:"Revisando tu espacio…",error:"Ahora no pude comprobarlo. Inténtalo otra vez o abre la sección directamente.",note:"Asistencia privada · Los borradores requieren tu aprobación. Jessy no envía correos.",label:"Abrir esta sección →",quick:[["Preparar seguimiento","Prepara un borrador de seguimiento"],["Prioridades de hoy","¿Qué necesita mi atención hoy?"],["Seguimientos","¿Qué seguimientos de prospectos están pendientes?"],["Leads web","¿Hay nuevas consultas del website?"],["Entregas","¿Qué entregas de clientes debo revisar?"],["Soporte","Necesito ayuda con un problema"]]}
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
function hide(restoreFocus=true){if(!root)return;root.querySelector(".jo-panel").hidden=true;root.querySelector(".jo-fab").hidden=false;open=false;document.body.classList.remove("jo-open");if(restoreFocus&&previousFocus?.isConnected)previousFocus.focus()}
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
 const alert=b("jo-notification-nudge");alert.hidden=true;
 alert.setAttribute("aria-live","polite");
 alert.setAttribute("aria-label","Open Command Center notifications");
 alert.addEventListener("click",()=>{
  if(owner())window.TLEOwnerJessyGateway.openNotifications();
  alert.hidden=true;
  if(open)hide(false);
 });
 root.append(fab,alert,panel);document.body.append(root);
 fab.addEventListener("click",show);close.addEventListener("click",hide);form.addEventListener("submit",e=>{e.preventDefault();ask(input.value)});
 input.addEventListener("keydown",e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();form.requestSubmit()}});
 shortcuts();
}
function onOwnerNotifications(event){
 if(!owner()||!root||!event.detail)return;
 const total=Math.max(0,Math.min(50,Number(event.detail.unread)||0));
 const added=Math.max(0,Math.min(50,Number(event.detail.newCount)||0));
 const initial=event.detail.initial===true;
 const alert=root.querySelector(".jo-notification-nudge");
 if(!total){alert.hidden=true;return}
 if(!initial&&!added)return;
 const en=language!=="es";
 const message=initial
  ?(en?"Jessy: You have "+total+" unread Command Center notification"+(total===1?"":"s")+". View alerts →":
   "Jessy: Tienes "+total+" notificaci"+(total===1?"ón":"ones")+" sin leer. Ver avisos →")
  :(en?"Jessy: "+added+" new Command Center alert"+(added===1?"":"s")+". View →":
    "Jessy: "+added+" nuevo"+(added===1?" aviso":"s avisos")+" en tu Command Center. Ver →");
 if(open){if(!initial)bubble(message.replace(/ →$/,""),"bot")}
 else{alert.textContent=message;alert.hidden=false;clearTimeout(notificationTimer);
  notificationTimer=setTimeout(()=>{if(alert.isConnected)alert.hidden=true},13000)}
}
function sync(){
 if(!owner()){if(root){clearTimeout(notificationTimer);root.remove();root=null;history=[];open=false;log=null;input=null;quick=null}return}
 if(!root)build();
 const next=lang();if(next!==language){language=next;if(root){root.querySelector(".jo-fab span").textContent=t("open");root.querySelector(".jo-heading small").textContent=t("subtitle");root.querySelector(".jo-close").setAttribute("aria-label",t("close"));input.placeholder=t("placeholder");send.textContent=t("send");root.querySelector(".jo-note").textContent=t("note");shortcuts()}}
}

async function prepareDraftPanel(){
 if(!owner()||!root)return;
 if(!open)show();
 const es=language==="es";
 const panel=el("div","jo-draft-panel");
 const title=el("strong","jo-draft-title",es?"Preparar un seguimiento":"Prepare a follow-up");
 const status=el("p","jo-draft-status",es?"Buscando prospectos con permiso y seguimiento pendiente…":"Checking due prospects with verified permission…");
 panel.append(title,status);log.appendChild(panel);log.scrollTop=log.scrollHeight;
 let candidates;
 try{candidates=await window.TLEOwnerJessyGateway.draftCandidates()}
 catch(e){status.textContent=e.message||t("error");return}
 if(!owner()||!panel.isConnected)return;
 if(!candidates.length){
  status.textContent=es?"No encontré seguimientos pendientes con permiso de correo confirmado. Puedes revisar los leads y su consentimiento.":"No due follow-ups have verified email permission. Review the prospects and their consent first.";
  const go=b("jo-next",es?"Abrir prospectos →":"Open prospects →");
  go.addEventListener("click",()=>{if(window.TLEOwnerJessyGateway.navigate("leads"))hide(false)});
  panel.appendChild(go);return;
 }
 status.textContent=es?"Elige un prospecto. No se enviará ningún correo.":"Choose a prospect. Nothing will be sent.";
 const label=el("label","jo-draft-label",es?"Prospecto":"Prospect");
 const select=el("select","jo-draft-select");select.setAttribute("aria-label",es?"Selecciona un prospecto":"Choose a prospect");
 for(const x of candidates){
  const option=el("option","",x.business+(x.contact?" · "+x.contact:"")+(x.due?" · "+x.due:""));
  option.value=x.id;select.appendChild(option);
 }
 label.append(select);panel.appendChild(label);
 const create=b("jo-next",es?"Crear borrador →":"Create draft →");panel.appendChild(create);
 create.addEventListener("click",async()=>{
  if(!owner()||!select.value)return;
  create.disabled=true;status.textContent=es?"Preparando mensaje para revisión…":"Preparing a message to review…";
  try{
   const draft=await window.TLEOwnerJessyGateway.prepareFollowupDraft(select.value);
   if(!owner()||!panel.isConnected)return;
   panel.replaceChildren();
   panel.append(el("strong","jo-draft-title",es?"Borrador para aprobar":"Draft for your approval"));
   panel.append(el("p","jo-draft-recipient",(es?"Destinatario: ":"Recipient: ")+draft.recipient));
   const subjectLabel=el("label","jo-draft-label",es?"Asunto":"Subject");
   const subject=el("input","jo-draft-input");subject.type="text";subject.maxLength=150;subject.value=draft.subject;
   subjectLabel.append(subject);panel.appendChild(subjectLabel);
   const bodyLabel=el("label","jo-draft-label",es?"Mensaje":"Message");
   const body=el("textarea","jo-draft-textarea");body.rows=7;body.maxLength=4000;body.value=draft.body;
   bodyLabel.append(body);panel.appendChild(bodyLabel);
   panel.append(el("p","jo-draft-disclaimer",es?
    "Revísalo y edítalo. Aprobar solo abrirá el editor existente. Para enviar tendrás que confirmar de nuevo.":
    "Review and edit first. Approval only opens the existing email editor. Sending requires separate confirmation."));
   const actions=el("div","jo-draft-actions");
   const cancel=b("jo-draft-cancel",es?"Descartar":"Discard");
   cancel.addEventListener("click",()=>panel.remove());
   const approve=b("jo-draft-approve",es?"Aprobar y abrir editor →":"Approve & open editor →");
   const result=el("p","jo-draft-status","");
   approve.addEventListener("click",async()=>{
     if(!owner()||approve.disabled)return;
     approve.disabled=true;result.textContent=es?"Verificando permiso e historial de envío…":"Rechecking consent and email history…";
     try{
      const ok=await window.TLEOwnerJessyGateway.useFollowupDraft(draft,subject.value,body.value);
      if(!ok)throw Error(es?"No se pudo abrir el editor.":"Could not open the email editor.");
      hide(false);
     }catch(e){result.textContent=e.message||t("error");approve.disabled=false}
   });
   actions.append(cancel,approve);panel.append(actions,result);
   log.scrollTop=log.scrollHeight;
  }catch(e){status.textContent=e.message||t("error");create.disabled=false}
 });
}
async function ask(raw){
 if(waiting||!owner()||!root)return;
 const question=String(raw||"").trim().slice(0,340);
 if(question.length<2)return;
 if(/\b(draft|borrador|prepara|preparar|escribe|write)\b.*\b(follow.?up|seguimiento|correo|email)\b|\b(follow.?up|seguimiento)\b.*\b(draft|borrador|prepar)/i.test(question)){
   if(!open)show();bubble(question,"user");input.value="";await prepareDraftPanel();return;
 }
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
 window.addEventListener("tle-crm-owner-notifications",onOwnerNotifications);
 window.addEventListener("pageshow",sync);
 document.addEventListener("keydown",e=>{if(e.key==="Escape"&&open)hide()});
 sync();
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
})();
