(function(){
"use strict";
const ID="tle-jessy-push-card", SHORTCUT="tle-jessy-push-shortcut";
let busy=false,active=false;
const $=id=>document.getElementById(id);
const isOwner=()=>window.TLEOwnerJessyGateway?.ready?.()===true;
const es=()=>{try{return (localStorage.getItem("tle_crm_language")==="es"||localStorage.getItem("tle_crm_owner_language")==="es")}catch{return false}};
const t=(en,spanish)=>es()?spanish:en;
const onApple=()=>/iPhone|iPad|iPod/.test(navigator.userAgent)||(/Macintosh/.test(navigator.userAgent)&&navigator.maxTouchPoints>1);
const installed=()=>window.matchMedia("(display-mode: standalone)").matches||navigator.standalone===true;
const gateway=(action,payload={})=>window.TLEOwnerJessyGateway.pushAlerts(action,payload);
const status=(s)=>{if($("tle-jessy-push-status"))$("tle-jessy-push-status").textContent=s;};
function setButtons(isOn){active=isOn;const enable=$("tle-jessy-push-enable"),test=$("tle-jessy-push-test"),stop=$("tle-jessy-push-stop");if(enable)enable.textContent=isOn?t("Alerts enabled ✓","Avisos activados ✓"):t("Enable alerts","Activar avisos");if(test)test.hidden=!isOn;if(stop)stop.hidden=!isOn;const chip=$(SHORTCUT);if(chip)chip.title=isOn?t("Jessy alerts are enabled","Jessy: avisos activados"):t("Configure Jessy alerts","Configurar avisos de Jessy");}
function keyBytes(base64){const padded=(base64+"=".repeat((4-base64.length%4)%4)).replace(/-/g,"+").replace(/_/g,"/");const decoded=atob(padded);return Uint8Array.from(decoded,c=>c.charCodeAt(0))}
async function registration(){let reg=await navigator.serviceWorker.getRegistration("/command-center/");if(!reg)reg=await navigator.serviceWorker.register("/command-center/sw.js",{scope:"/command-center/"});return reg}
function supportReason(){
 if(!window.isSecureContext||!("serviceWorker" in navigator)||!("PushManager" in window)||!("Notification" in window))return t("Push notifications are not supported in this browser.","Este navegador no permite avisos push.");
 if(onApple()&&!installed())return t("On iPhone/iPad, open the Command Center in Safari, tap Share → Add to Home Screen, then open its icon and enable alerts.","En iPhone/iPad, abre Command Center en Safari, toca Compartir → Añadir a pantalla de inicio, abre el icono y activa los avisos.");
 return "";
}
async function refresh(){if(!isOwner())return;const reason=supportReason();if(reason){status(reason);setButtons(false);return}try{const reg=await registration();const sub=await reg.pushManager.getSubscription();setButtons(!!sub&&Notification.permission==="granted");status(sub?t("This device is subscribed to Jessy alerts.","Este dispositivo está suscrito a los avisos de Jessy."):t("Alerts are off on this device.","Los avisos están desactivados en este dispositivo."))}catch(e){status(t("Push setup is not available yet.","Aún no está disponible la configuración de avisos."))}}
async function enable(){
 if(busy||!isOwner())return;
 const reason=supportReason();if(reason){status(reason);return}
 if(Notification.permission==="denied"){status(t("Allow Command Center notifications in your device settings, then try again.","Permite las notificaciones de Command Center en los ajustes del dispositivo y vuelve a intentarlo."));return}
 busy=true;status(t("Preparing your alerts…","Preparando tus avisos…"));
 try{
  // Ask directly from this user click: WebKit requires a user gesture on iOS.
  const permission=Notification.permission==="granted"?"granted":await Notification.requestPermission();
  if(permission!=="granted"){status(t("Notification permission was not granted.","No se concedió permiso para las notificaciones."));return}
  const config=await gateway("config");if(!config.publicKey)throw Error("Missing public key");
  const reg=await registration();let sub=await reg.pushManager.getSubscription();
  if(!sub)sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:keyBytes(config.publicKey)});
  const data=sub.toJSON();const saved=await gateway("subscribe",{subscription:data});if(!saved.ok)throw Error("Subscription not saved");
  setButtons(true);status(t("Alerts enabled! Tap Test alert to confirm on this device.","¡Avisos activados! Toca Probar aviso para comprobarlos en este dispositivo."));
 }catch(e){status(t("Couldn't activate alerts. Try again from the Home Screen icon.","No se pudieron activar. Inténtalo desde el icono en la pantalla de inicio."));console.warn("Jessy push activation",e?.message)}
 finally{busy=false}
}
async function test(){if(busy||!isOwner())return;busy=true;status(t("Sending a test alert…","Enviando aviso de prueba…"));try{const result=await gateway("test");status(result.provider_accepted?t("Sent to the push provider. Check your device notifications.","Enviado al proveedor de avisos. Revisa las notificaciones de tu dispositivo."):t("The test could not be sent.","No se pudo enviar la prueba."))}catch(e){status(t("Test unavailable. Try again later.","Prueba no disponible. Vuelve a intentarlo."))}finally{busy=false}}
async function disable(){if(busy||!isOwner())return;busy=true;try{const reg=await registration();const sub=await reg.pushManager.getSubscription();if(sub){await gateway("unsubscribe",{endpoint:sub.endpoint});await sub.unsubscribe()}setButtons(false);status(t("Jessy alerts disabled on this device.","Avisos de Jessy desactivados en este dispositivo."))}catch(e){status(t("Could not turn off alerts. Please try again.","No se pudieron desactivar. Inténtalo nuevamente."))}finally{busy=false}}
function button(id,label,fn,secondary=false){const node=document.createElement("button");node.id=id;node.type="button";node.textContent=label;node.className=secondary?"secondary":"";node.style.cssText="border-radius:999px;padding:10px 16px;font-size:13px;min-height:42px";node.addEventListener("click",fn);return node}
function render(){
 const authorized=isOwner();
 let card=$(ID),chip=$(SHORTCUT);
 if(!authorized){if(card)card.remove();if(chip)chip.remove();return}
 const panel=$("notificationPanel"),bell=$("bellButton");
 if(!panel)return;
 if(!card){card=document.createElement("div");card.id=ID;card.style.cssText="background:#FAF8F3;border:1px solid #e9e2d2;border-radius:19px;padding:clamp(15px,3vw,22px);margin:12px 0 18px;color:#191919;box-shadow:0 5px 20px #1919190d";
  const headline=document.createElement("strong");headline.textContent=t("Jessy · Phone alerts","Jessy · Avisos en tu teléfono");headline.style.cssText="font-size:17px;display:block;margin-bottom:7px";
  const description=document.createElement("p");description.textContent=t("Private notifications for new leads, demos and important Command Center updates. Your clients will not receive these alerts.","Avisos privados de nuevos prospectos, demos y novedades importantes de Command Center. Tus clientes no recibirán estos avisos.");description.style.cssText="font-size:13px;line-height:1.5;margin:0 0 12px";
  const actions=document.createElement("div");actions.style.cssText="display:flex;gap:8px;align-items:center;flex-wrap:wrap";
  actions.append(button("tle-jessy-push-enable",t("Enable alerts","Activar avisos"),enable),button("tle-jessy-push-test",t("Test alert","Probar aviso"),test,true),button("tle-jessy-push-stop",t("Turn off","Desactivar"),disable,true));
  const note=document.createElement("p");note.id="tle-jessy-push-status";note.setAttribute("role","status");note.setAttribute("aria-live","polite");note.style.cssText="font-size:12px;margin:10px 0 0;color:#465a68;line-height:1.55";
  card.append(headline,description,actions,note);
  const list=$("notificationList");panel.insertBefore(card,list||null);
  setButtons(active);void refresh();
 }
 if(bell&&!chip){chip=button(SHORTCUT,"🔔",()=>{window.TLEOwnerJessyGateway?.openNotifications?.();const view=$(ID);if(view)view.scrollIntoView({behavior:"smooth",block:"center"})},true);chip.setAttribute("aria-label",t("Configure Jessy phone alerts","Configurar avisos de Jessy"));chip.style.cssText="border-radius:50%;width:40px;height:40px;padding:0;font-size:19px;display:inline-flex;align-items:center;justify-content:center;flex:0 0 auto";bell.after(chip)}
}
let scheduled=false;function schedule(){if(scheduled)return;scheduled=true;setTimeout(()=>{scheduled=false;render()},80)}
function start(){const observer=new MutationObserver(schedule);observer.observe(document.body,{attributes:true,attributeFilter:["class"]});window.addEventListener("tle-crm-ready",schedule);window.addEventListener("pageshow",schedule);window.addEventListener("tle-owner-section-change",schedule);schedule()}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
})();