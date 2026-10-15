/* v22 — focused booking workspace for the PUBLIC interactive demo.
 * Keeps all existing selection/quote/review/submit functions and fields.
 * The marketing tour and photo story are only visible in Explore mode.
 */
(()=>{
"use strict";
const q=new URLSearchParams(location.search);
if(!/\/lead-private-preview\.html$/.test(location.pathname)
   ||q.has("key")||q.get("owner_preview")==="1")return;
function init(){
 const html=document.documentElement;
 if(!html.classList.contains("demo-editorial"))return;
 const panel=document.getElementById("bookingStarter");
 const home=document.getElementById("leadHero");
 if(!panel||!home||document.getElementById("tleFocusBookingBar"))return;
 const es=q.get("lang")==="es";
 const text=es?{
  back:"Volver al inicio del demo",brand:"BOOKING STUDIO · DEMO",
  title:"Crea tu solicitud paso a paso",home:"Inicio",choose:"Cambiar servicio",
  note:"Prueba interactiva · no se reserva ni se envía nada",
  exit:"Volviste a la portada. Ninguna solicitud fue enviada."
 }:{
  back:"Back to Demo Home",brand:"BOOKING STUDIO · DEMO",
  title:"Build your cleaning request",home:"Home",choose:"Change service",
  note:"Interactive preview · nothing is booked or sent",
  exit:"Back at the demo home. No request was submitted."
 };
 const bar=document.createElement("div");bar.id="tleFocusBookingBar";bar.className="tle-focus-booking-bar";
 bar.setAttribute("aria-label",es?"Controles de la reserva":"Booking navigation");
 const left=document.createElement("span");left.className="tle-focus-booking-label";left.textContent=text.brand;
 const nav=document.createElement("div");nav.className="tle-focus-booking-actions";
 const choices=document.createElement("button");choices.type="button";choices.className="tle-focus-change";
 choices.textContent="‹ "+text.choose;
 const back=document.createElement("button");back.type="button";back.className="tle-focus-home";
 back.textContent=text.back;
 nav.append(choices,back);bar.append(left,nav);panel.prepend(bar);
 const sr=document.createElement("span");sr.id="tleFocusStatus";
 sr.className="tle-focus-screenreader";sr.setAttribute("role","status");
 sr.setAttribute("aria-live","polite");panel.prepend(sr);
 let focused=false;
 const reduce=()=>matchMedia("(prefers-reduced-motion: reduce)").matches;
 function jumpToPanel(){
  requestAnimationFrame(()=>{
   panel.scrollIntoView({block:"start",behavior:reduce()?"auto":"instant"});
   panel.focus({preventScroll:true});
  });
 }
 function enter(){
  if(focused)return;
  focused=true;html.classList.add("tle-demo-booking-active");
  document.body.classList.add("tle-demo-booking-active");
  const chat=document.getElementById("tleSonnyGreetingPopup");if(chat)chat.hidden=true;
  sr.textContent=text.title;
  jumpToPanel();
 }
 function exit(){
  focused=false;html.classList.remove("tle-demo-booking-active");
  document.body.classList.remove("tle-demo-booking-active");
  window.showMain?.();
  sr.textContent=text.exit;
  try{history.replaceState(history.state,"","#leadHero")}catch{}
  requestAnimationFrame(()=>{
   home.scrollIntoView({block:"start",behavior:reduce()?"auto":"instant"});
   const brand=document.getElementById("demoBrandName");brand?.focus({preventScroll:true});
  });
 }
 choices.addEventListener("click",()=>{
  enter();
  window.showMain?.();
  jumpToPanel();
 });
 back.addEventListener("click",exit);
 // The brand remains a real way to return to the public demo cover.
 document.getElementById("demoBrandName")?.addEventListener("click",e=>{
  if(!focused)return;
  e.preventDefault();exit();
 },true);
 // Intercept intent, not data/submit behavior. Do not override source
 // functions, avoid extra onclicks, and never call any booking APIs.
 document.addEventListener("click",e=>{
  if(e.target.closest("#tleFocusBookingBar"))return;
  const el=e.target.closest(
    '#bookingStarter .service,#categoryTabs .choice,'+
    'a[href="#bookingStarter"],a[data-demo-scroll="bookingStarter"]'
  );
  if(!el)return;
  // Existing navigation/selection handler runs as authored after this.
  enter();
 },true);
 // Forms may be advanced by keyboard Enter, Sonny or other explicit controls,
 // so the active screen is authoritative even if no click was observed.
 const screens=[...panel.querySelectorAll(".screen")];
 const observer=new MutationObserver(()=>{
  const active=screens.find(s=>s.classList.contains("on"));
  if(active&&active.id!=="main"&&!focused)enter();
  choices.hidden=!(active&&active.id!=="main");
  panel.dataset.focusStep=active?.id||"main";
 });
 screens.forEach(s=>observer.observe(s,{attributes:true,attributeFilter:["class"]}));
 choices.hidden=true;
 // Restore entry on a direct focus hash; never auto-exit while the user is filling fields.
 if(location.hash==="#bookingStarter"&&document.activeElement?.closest("#bookingStarter"))enter();
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();