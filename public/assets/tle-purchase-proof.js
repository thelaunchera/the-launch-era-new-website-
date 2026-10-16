(() => {
 "use strict";
 // The real purchase signal is returned by an independent read-only endpoint.
 // Exclude customer, booking, checkout, private workspace and app pages.
 const supported=new Set([
  "/","/es","/solutions","/how-it-works","/help",
  "/booking-lead-automation","/es/booking-lead-automation",
  "/cleaning-web-app","/es/cleaning-web-app",
  "/website-automation","/es/website-automation",
  "/virtual-assistant","/es/virtual-assistant",
  "/ai-booking-assistant","/es/ai-booking-assistant"
 ]);
 const endpoint="https://bowacxhmjvrqixtwaikv.supabase.co/functions/v1/tle-public-purchase-proof";
 const key="tle_verified_purchase_notice_shown_v1";
 let shownInPage=false;
 function safePath(){return location.pathname.replace(/\/+$/,"")||"/";}
 function locale(){return safePath()==="/es"||safePath().startsWith("/es/")?"es":"en";}
 function shownBefore(){try{return sessionStorage.getItem(key)==="yes";}catch{return shownInPage;}}
 function markSeen(){shownInPage=true;try{sessionStorage.setItem(key,"yes");}catch{}}
 function footerVisible(){
  const footer=document.querySelector(".site-footer");
  const rect=footer?.getBoundingClientRect?.();
  return !!rect && rect.top < (window.innerHeight || 0);
 }
 function busyPage(){
  return document.visibilityState!=="visible"||
   document.body.classList.contains("tle-jessy-open")||
   footerVisible()||
   !!document.querySelector('[role="dialog"][aria-modal="true"]:not([hidden]),dialog[open]');
 }
 function place(kind){
  if(shownBefore()||!supported.has(safePath())||busyPage())return;
  const es=locale()==="es";
  const bundle=kind==="booking_bundle";
  const title=es
   ?bundle?"Alguien compró recientemente Booking + AI.":"Alguien compró recientemente Booking Automation."
   :bundle?"Someone recently purchased Booking + AI.":"Someone recently purchased Booking Automation.";
  const note=es?"Compra real verificada · The Launch Era":"Verified recent purchase · The Launch Era";
  const element=document.createElement("aside");
  element.className="tle-proof-pop";
  element.setAttribute("role","status");
  element.setAttribute("aria-live","polite");
  element.setAttribute("aria-label",es?"Compra reciente verificada":"Verified recent purchase");
  const logo=document.createElement("span");
  logo.className="tle-proof-mark";
  logo.setAttribute("aria-hidden","true");
  logo.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8h12l1 12H5L6 8Z"/><path d="M9 9V6a3 3 0 0 1 6 0v3"/><path d="m9.7 14 1.7 1.7 3.3-3.4"/></svg>';
  const copy=document.createElement("div");
  copy.className="tle-proof-copy";
  const heading=document.createElement("strong");heading.textContent=title;
  const small=document.createElement("small");small.textContent=note;
  copy.append(heading,small);
  const close=document.createElement("button");
  close.className="tle-proof-close";close.type="button";close.textContent="×";
  close.setAttribute("aria-label",es?"Cerrar aviso":"Dismiss purchase notice");
  const bar=document.createElement("span");bar.className="tle-proof-timebar";bar.setAttribute("aria-hidden","true");
  element.append(logo,copy,close,bar);
  document.body.appendChild(element);
  markSeen();
  let removed=false;
  const remove=()=>{if(removed)return;removed=true;element.classList.remove("tle-proof-visible");
    window.removeEventListener?.("scroll",dismissNearFooter);
    window.setTimeout(()=>element.remove(),300);};
  const dismissNearFooter=()=>{if(footerVisible())remove();};
  window.addEventListener?.("scroll",dismissNearFooter,{passive:true});
  close.addEventListener("click",remove);
  window.requestAnimationFrame(()=>window.requestAnimationFrame(()=>element.classList.add("tle-proof-visible")));
  window.setTimeout(remove,4000);
 }
 async function start(){
  if(!supported.has(safePath())||shownBefore())return;
  let data;
  try{
   const controller=new AbortController();
   const timer=window.setTimeout(()=>controller.abort(),5500);
   try{
    const response=await fetch(endpoint,{method:"GET",mode:"cors",cache:"no-store",signal:controller.signal});
    if(!response.ok)return;
    data=await response.json();
   }finally{window.clearTimeout(timer)}
  }catch{return}
  if(!data||data.show!==true||!["booking","booking_bundle"].includes(data.kind))return;
  window.setTimeout(()=>place(data.kind),7500);
 }
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});
 else start();
})();
