/* v34 — reference-approved editorial service cascade.
   Use the original button services/onclick functions, prices and images. Public demo only. */
(()=>{
 "use strict";
 const q=new URLSearchParams(location.search);
 if(location.pathname!=="/lead-private-preview.html"||q.has("key")||q.get("owner_preview")==="1")return;
 function init(){
   if(!document.documentElement.classList.contains("demo-editorial"))return;
   const panel=document.getElementById("bookingStarter");
   const showcase=document.getElementById("demoServices");
   const residential=document.getElementById("residentialServiceList");
   const commercial=document.getElementById("commercialServiceList");
   if(!panel||!residential||!commercial)return;
   document.documentElement.classList.add("tle-demo-v34");
   // Remove visual duplication, keeping #demoServices as a scroll anchor for
   // any existing AI assistant actions that reference this target.
   if(showcase){
     showcase.classList.add("tle-v34-retired-showcase");
     showcase.setAttribute("aria-hidden","true");
     showcase.querySelectorAll("a").forEach(a=>a.tabIndex=-1);
     panel.before(showcase);
   }
   // The old wide two-photo slider is replaced by these service photos.
   // This does not remove the Before/After carousel or rotating reviews.
   const obsoleteGallery=document.getElementById("tleDemoEditorialGallery");
   const obsoleteControls=document.getElementById("tleV32EditorialControls");
   if(obsoleteGallery)obsoleteGallery.remove();
   if(obsoleteControls)obsoleteControls.remove();
   // Keep all working action handlers: only add semantic labels for screen readers.
   for(const list of [residential,commercial]){
     list.classList.add("tle-v34-editorial-stack");
     for(const button of list.querySelectorAll(":scope > button.service")){
       const title=button.querySelector(".demo-service-body b")?.textContent?.trim();
       const price=button.querySelector(".price")?.textContent?.trim();
       if(title)button.setAttribute("aria-label",[title,price].filter(Boolean).join(". "));
     }
   }
   // Preserve current routes, anchor links and assistant navigation without
   // creating any duplicate service panels.
   document.querySelectorAll('a[href="#demoServices"]').forEach(a=>a.href="#bookingStarter");
 }
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});
 else init();
})();
