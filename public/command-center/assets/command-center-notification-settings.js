(function(){
"use strict";
const KIND_OPTIONS=[
 ["lead","New inquiry","Nueva consulta"],
 ["quote_request","Quote request","Solicitud de cotización"],
 ["booking_received","New booking","Nueva reserva"],
 ["appointment_change","Reschedule or cancellation","Cambio o cancelación"],
 ["customer_message","Customer message","Mensaje de cliente"],
 ["ai_message","AI Assistant activity","Actividad del AI Assistant"],
 ["followup_due","Follow-up due","Seguimiento pendiente"],
 ["demo","Demo request","Solicitud de demo"],
 ["won","New customer","Nuevo cliente"],
 ["system_ready","System update","Actualización del sistema"]
];
const ID="tle-notification-settings",SHORT="tle-notification-settings-shortcut";
const $=id=>document.getElementById(id);
const gateway=()=>window.TLECommandCenterNotificationsGateway;
const ready=()=>gateway()?.ready?.()===true;
const isEs=()=>{try{return localStorage.getItem("tle_crm_language")==="es"||localStorage.getItem("tle_crm_owner_language")==="es"}catch{return false}};
const t=(en,es)=>isEs()?es:en;
const apple=()=>/iPhone|iPad|iPod/.test(navigator.userAgent)||(/Macintosh/.test(navigator.userAgent)&&navigator.maxTouchPoints>1);
const installed=()=>window.matchMedia("(display-mode: standalone)").matches||navigator.standalone===true;
let loadedWorkspace=null,config=null,loading=false,busy=false;
function note(message){if($("tle-ns-status"))$("tle-ns-status").textContent=message}
function add(tag,attrs={},textValue){const el=document.createElement(tag);for(const [k,v] of Object.entries(attrs)){if(k==="className")el.className=v;else if(k==="style")el.style.cssText=v;else el.setAttribute(k,v)}if(textValue!==undefined)el.textContent=textValue;return el}
function btn(id,label,action,secondary=false){const b=add("button",{id,type:"button",className:secondary?"secondary":""},label);b.addEventListener("click",action);return b}
function labels(){const on=isEs();return KIND_OPTIONS.map(k=>({id:k[0],label:k[on?2:1]}))}
function deviceReason(){
 if(!isSecureContext||!("serviceWorker" in navigator)||!("PushManager" in window)||!("Notification" in window))return t("Your browser does not support phone notifications.","Tu navegador no permite avisos en el teléfono.");
 if(apple()&&!installed())return t("On iPhone/iPad: open Command Center in Safari, tap Share → Add to Home Screen, then open its icon.","En iPhone/iPad: abre Command Center en Safari, toca Compartir → Añadir a pantalla de inicio y luego abre el icono.");
 return "";
}
function getTopics(){return Array.from(document.querySelectorAll("#tle-ns-topics input:checked")).map(x=>x.value)}
function selections(){return {email_enabled:!!$("tle-ns-email")?.checked,push_enabled:!!$("tle-ns-phone")?.checked,kinds:getTopics(),language:isEs()?"es":"en"}}
async function pushReg(){let reg=await navigator.serviceWorker.getRegistration("/command-center/");if(!reg)reg=await navigator.serviceWorker.register("/command-center/sw.js",{scope:"/command-center/"});return reg}
function publicKeyBytes(key){const raw=atob((key+"=".repeat((4-key.length%4)%4)).replace(/-/g,"+").replace(/_/g,"/"));return Uint8Array.from(raw,c=>c.charCodeAt(0))}
async function save(){if(busy||!ready())return;const form=selections();if(!form.kinds.length){note(t("Choose at least one event.","Selecciona al menos un tipo de aviso."));return}
 busy=true;note(t("Saving preferences…","Guardando preferencias…"));
 try{await gateway().call("save",form);note(t("Saved. Only your selected channels and events will trigger alerts. Phone alerts require enabling each device.","Guardado. Solo recibirás los avisos y canales elegidos. Para el teléfono necesitas activar cada dispositivo."))}
 catch(e){note(t("Could not save your preferences. Please try again.","No se pudieron guardar las preferencias. Inténtalo otra vez."));console.warn("Alert preferences",e.message)}
 finally{busy=false}
}
async function enableDevice(){if(busy||!ready()||!config)return;const reason=deviceReason();if(reason){note(reason);return}
 if(Notification.permission==="denied"){note(t("Enable Command Center notifications in your iPhone/Android settings first.","Activa los permisos de Command Center en los ajustes del teléfono."));return}
 busy=true;note(t("Activating notifications…","Activando notificaciones…"));
 try{
  const permission=Notification.permission==="granted"?"granted":await Notification.requestPermission();
  if(permission!=="granted"){note(t("Permission not granted. Nothing was activated.","No se concedió permiso. No se activó nada."));return}
  const reg=await pushReg();let subscription=await reg.pushManager.getSubscription();
  if(!subscription)subscription=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:publicKeyBytes(config.publicKey)});
  await gateway().call("subscribe",{subscription:subscription.toJSON()});
  $("tle-ns-phone").checked=true;const chosen=selections();if(!chosen.kinds.length){$("tle-ns-topic-lead").checked=true;chosen.kinds.push("lead")}
  await gateway().call("save",chosen);
  note(t("Phone alerts enabled! Now tap Test phone.","¡Avisos en el teléfono activados! Toca Probar teléfono."));
 }catch(e){note(t("Could not activate this device. Try from the Home Screen icon.","No se pudo activar este dispositivo. Inténtalo desde el icono de inicio."));console.warn("Alert device",e.message)}
 finally{busy=false}
}
async function disableDevice(){if(busy||!ready())return;busy=true;try{const reg=await pushReg();const sub=await reg.pushManager.getSubscription();if(sub){await gateway().call("unsubscribe",{endpoint:sub.endpoint});await sub.unsubscribe()}note(t("Notifications disabled on this device.","Notificaciones desactivadas en este dispositivo."))}catch(e){note(t("Could not disconnect this device.","No se pudo desconectar este dispositivo."))}finally{busy=false}}
async function test(channel){if(busy||!ready())return;busy=true;note(t("Sending your test…","Enviando prueba…"));
 try{const r=await gateway().call(channel==="email"?"test_email":"test_push");note(r.provider_accepted?t("Accepted for sending. Check your "+(channel==="email"?"email inbox.":"device notifications.")+" Delivery may take a moment.",channel==="email"?"El proveedor aceptó el correo. Revisa tu bandeja, podría tardar un momento.":"El proveedor aceptó el aviso. Revisa tu teléfono; puede tardar un momento."):t("Test not available. Check your preferences.","Prueba no disponible. Revisa tus preferencias."))}
 catch(e){note(t("Test unavailable. Save your preferences and activate your device first.","Prueba no disponible. Guarda tus preferencias y activa el dispositivo primero."));console.warn("Notification test",e.message)}
 finally{busy=false}
}
async function refresh(){
 if(!ready()||loading)return;loading=true;const id=gateway().workspaceId();
 try{
  const data=await gateway().call("config");if(!ready()||gateway().workspaceId()!==id)return;config=data;loadedWorkspace=id;
  const email=$("tle-ns-email"),phone=$("tle-ns-phone");if(!email||!phone)return;
  email.checked=!!data.email_enabled;phone.checked=!!data.push_enabled;
  const emailLabel=$("tle-ns-email-address");if(emailLabel)emailLabel.textContent=t("Verified account email: ","Correo verificado: ")+(data.verified_email||"—");
  for(const kind of KIND_OPTIONS){const node=$("tle-ns-topic-"+kind[0]);if(node){node.checked=(data.kinds||[]).includes(kind[0]);node.disabled=kind[0]==="ai_message"&&!data.ai_eligible; if(node.disabled)node.checked=false}}
  const aiHelp=$("tle-ns-ai-help");if(aiHelp)aiHelp.textContent=data.ai_eligible?t("AI messages are shown only after the Assistant actually handles a conversation.","Los avisos del AI solo aparecen cuando el asistente realmente atiende una conversación."):t("AI Assistant activity is available when this service is purchased and activated.","Los avisos del AI Assistant estarán disponibles cuando el servicio se compre y active.");
  const reason=deviceReason();
  note(reason||t("Ready. Choose which updates you want by email, phone, or both.","Listo. Escoge qué avisos recibir por correo, teléfono o ambos."));
 }catch(e){note(t("Sign in again if notification settings do not load.","Vuelve a iniciar sesión si las preferencias no se cargan."));console.warn("Alert settings",e.message)}
 finally{loading=false}
}
function createCard(){
 const panel=$("notificationPanel"),list=$("notificationList");if(!panel)return;
 const container=add("section",{id:ID,className:"tle-alerts-card"});container.setAttribute("aria-label","Notification preferences");
 container.append(add("h3",{},t("Choose your notifications","Elige tus notificaciones")));
 container.append(add("p",{className:"tle-alerts-muted"},t("Private alerts for your own business. They never go to your customers.","Avisos privados de tu negocio. Nunca se envían a tus clientes.")));
 const channels=add("div",{className:"tle-alerts-channels"});
 for(const [id,en,es] of [["email","Email","Correo"],["phone","Phone notifications","Notificaciones en el teléfono"]]){
  const label=add("label",{className:"tle-alerts-switch"}),input=add("input",{id:"tle-ns-"+id,type:"checkbox"}),name=add("span",{},t(en,es));label.append(input,name);channels.append(label);
 }
 container.append(channels,add("small",{id:"tle-ns-email-address",className:"tle-alerts-muted"},""));
 container.append(add("h4",{},t("Alert me about","Avísame cuando llegue")));
 const grid=add("div",{id:"tle-ns-topics",className:"tle-alerts-topics"});
 for(const kind of labels()){const l=add("label",{className:"tle-alerts-option"}),c=add("input",{type:"checkbox",value:kind.id,id:"tle-ns-topic-"+kind.id});l.append(c,add("span",{},kind.label));grid.append(l)}
 container.append(grid,add("p",{id:"tle-ns-ai-help",className:"tle-alerts-muted"},""));
 const actions=add("div",{className:"tle-alerts-actions"});
 actions.append(btn("tle-ns-save",t("Save preferences","Guardar preferencias"),save));
 actions.append(btn("tle-ns-enable-phone",t("Enable this phone","Activar este teléfono"),enableDevice,true));
 actions.append(btn("tle-ns-test-phone",t("Test phone","Probar teléfono"),()=>test("phone"),true));
 actions.append(btn("tle-ns-test-email",t("Test email","Probar correo"),()=>test("email"),true));
 actions.append(btn("tle-ns-disable-phone",t("Disable this device","Desactivar este dispositivo"),disableDevice,true));
 container.append(actions,add("p",{id:"tle-ns-status",className:"tle-alerts-status",role:"status","aria-live":"polite"},""));
 panel.insertBefore(container,list||null);
}
function render(){
 const visible=ready();const node=$(ID),shortcut=$(SHORT);
 if(!visible){if(node)node.remove();if(shortcut)shortcut.remove();loadedWorkspace=null;config=null;return}
 const workspaceId=gateway().workspaceId();
 if(!node)createCard();
 if(workspaceId!==loadedWorkspace&&!loading)void refresh();
 const bell=$("bellButton");
 if(bell&&!$(SHORT)){
  const b=btn(SHORT,t("Alert settings","Configurar avisos"),()=>{if($("notificationPanel")?.classList.contains("hidden"))bell.click();$(ID)?.scrollIntoView({behavior:"smooth",block:"start"})},true);
  b.setAttribute("aria-label",t("Notification preferences","Preferencias de notificaciones"));b.title=t("Notification preferences","Preferencias de notificaciones");
  b.className="tle-alerts-shortcut";bell.after(b);
 }
}
function styles(){if($("tle-notification-style"))return;
 const css=add("style",{id:"tle-notification-style"});
 css.textContent=`
 .tle-alerts-card{background:#FAF8F3;color:#191919;border:1px solid #e6e0d2;border-radius:20px;padding:clamp(17px,3vw,24px);margin:14px 0 22px;box-shadow:0 10px 30px #1919190d}
 .tle-alerts-card h3{font-size:clamp(19px,2.3vw,23px);margin:0 0 8px;letter-spacing:-.03em}
 .tle-alerts-card h4{font-size:15px;margin:22px 0 10px}
 .tle-alerts-muted{color:#4e5e68;font-size:13px;line-height:1.5;margin:8px 0}
 .tle-alerts-channels{display:flex;gap:12px;flex-wrap:wrap;margin:15px 0}
 .tle-alerts-switch,.tle-alerts-option{display:flex;align-items:center;gap:10px;color:#191919;font-size:14px;font-weight:600;line-height:1.35}
 .tle-alerts-switch{border:1px solid #d8d9d5;background:#fff;border-radius:14px;padding:14px 17px;flex:1 1 195px;min-height:50px}
 .tle-alerts-switch input,.tle-alerts-option input{margin:0!important;width:20px!important;height:20px!important;min-width:20px;accent-color:#191919}
 .tle-alerts-topics{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
 .tle-alerts-option{border:1px solid #e6e6e2;background:#fff;border-radius:11px;padding:12px 13px;min-height:48px}
 .tle-alerts-option:has(input:disabled){opacity:.5}
 .tle-alerts-actions{display:flex;flex-wrap:wrap;gap:9px;margin:17px 0 9px}
 .tle-alerts-actions button{border-radius:999px;padding:11px 17px;min-height:44px;font-size:13px;white-space:normal}
 .tle-alerts-status{color:#3e5669;font-size:13px;line-height:1.5;min-height:22px}
 .tle-alerts-shortcut{font-size:12px!important;line-height:1.1;white-space:normal;max-width:112px;border-radius:999px!important;padding:9px 12px!important}
 @media(max-width:560px){.tle-alerts-topics{grid-template-columns:1fr}.tle-alerts-channels{flex-direction:column}.tle-alerts-actions{display:grid;grid-template-columns:repeat(2,minmax(0,1fr))}.tle-alerts-actions button{width:100%;min-width:0}.tle-alerts-shortcut{max-width:83px}}
 `;
 document.head.append(css);
}
let queued=false;function schedule(){if(queued)return;queued=true;setTimeout(()=>{queued=false;render()},80)}
function init(){styles();new MutationObserver(schedule).observe(document.body,{attributes:true,attributeFilter:["class"]});window.addEventListener("tle-crm-ready",schedule);window.addEventListener("pageshow",schedule);window.addEventListener("tle-owner-section-change",schedule);schedule()}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();