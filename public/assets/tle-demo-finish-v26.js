/* Luna Bloom public sample v26 — refresh stabilization + a real bubbly CTA.
 * This never touches owner/keyed previews, bookings, messages or client records.
 */
(()=>{
 "use strict";
 const p=new URLSearchParams(location.search);
 if(location.pathname!=="/lead-private-preview.html"||p.has("key")||p.get("owner_preview")==="1")return;
 const navigation=performance.getEntriesByType?.("navigation")?.[0];
 const restoringReload=navigation?.type==="reload"&&!location.hash;
 // Safari otherwise restores a moving scroll offset while late page sections
 // mount, producing the up/down hero jump seen in the user's recording.
 if("scrollRestoration" in history)history.scrollRestoration="manual";
 if(restoringReload){
   const reset=()=>window.scrollTo({top:0,left:0,behavior:"instant"});
   window.addEventListener("pageshow",reset,{once:true});
 }
 const init=()=>{
   if(!document.documentElement.classList.contains("demo-editorial"))return;
   const steps=document.querySelector(".tle-client-quicksteps");
   const ribbon=document.querySelector("#tleDemoBlueRibbon");
   const end=document.querySelector(".tle-demo-v12-end");
   if(!end||!steps||!ribbon)return;
   const chapters=[steps,ribbon,end];
   end.classList.add("tle-cta-bubbles-v26");
   document.documentElement.classList.add("tle-demo-bubbles-v25");
   for(const section of chapters){
     section.classList.add("tle-bubble-chapter-v25");
     if(section.querySelector(":scope > .tle-bubble-layer-v25"))continue;
     const layer=document.createElement("div");
     layer.className="tle-bubble-layer-v25";
     layer.setAttribute("aria-hidden","true");
     for(let i=0;i<7;i++){
       const bubble=document.createElement("span");
       bubble.className="tle-bubble-v25";
       layer.append(bubble);
     }
     section.prepend(layer);
   }
   const reduced=matchMedia("(prefers-reduced-motion: reduce)");
   if(!("IntersectionObserver" in window)){
     chapters.forEach(ch=>ch.classList.add("tle-bubbles-visible-v25"));
   }else{
     const observer=new IntersectionObserver(entries=>{
       entries.forEach(entry=>entry.target.classList.toggle(
         "tle-bubbles-visible-v25",entry.isIntersecting));
     },{threshold:.06});
     chapters.forEach(ch=>observer.observe(ch));
   }
   if(restoringReload){
     requestAnimationFrame(()=>window.scrollTo(0,0));
   }
 };
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});
 else init();
})();
