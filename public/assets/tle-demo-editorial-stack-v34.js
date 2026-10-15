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
   // A category switch must show ONE service list. Keep the original
   // estimate/quote handlers in the DOM for compatibility, but remove their
   // duplicate visual cards and tab stops. The one custom-quote CTA remains.
   for(const list of [residential,commercial]){
     for(const btn of list.querySelectorAll(":scope > button.tle-service-secondary-v21")){
       btn.hidden=true;
       btn.setAttribute("aria-hidden","true");
       btn.tabIndex=-1;
     }
     const quoteButton=list.querySelector(":scope > .tle-v30-main-custom");
     if(quoteButton){
       const es=q.get("lang")==="es";
       const title=es?"¿Necesitas otra limpieza?":"Need something different?";
       const description=es?"Pide una cotización personalizada.":"Request a custom quote.";
       const words=quoteButton.querySelector("span");
       if(words){
         words.textContent="";
         const eyebrow=document.createElement("small");
         eyebrow.textContent=title;
         const strong=document.createElement("strong");
         strong.textContent=description;
         words.append(eyebrow,strong);
         words.classList.add("tle-v34-custom-text");
       }
       quoteButton.setAttribute("aria-label",title+" "+description);
       quoteButton.classList.add("tle-v34-single-quote");
     }
   }
   // The current construction image shows a wall corner, not cleanup.
   // Leave the working quote path available through the single custom CTA.
   const construction=[...commercial.querySelectorAll(":scope > button.service")]
     .find(button=>/Post-Construction|posconstrucción/i.test(button.textContent));
   if(construction){
     construction.hidden=true;
     construction.setAttribute("aria-hidden","true");
     construction.tabIndex=-1;
   }
   // The fieldset's floating native legend looked like an overlapping square
   // on mobile. Keep it for form semantics but add an in-card visual heading.
   document.querySelectorAll("#bookingStarter fieldset.tle-v30-tasklist").forEach(fieldset=>{
     const legend=fieldset.querySelector(":scope > legend");
     if(!legend||fieldset.querySelector(".tle-v34-task-title"))return;
     const heading=document.createElement("h3");
     heading.className="tle-v34-task-title";
     heading.textContent=legend.textContent;
     legend.insertAdjacentElement("afterend",heading);
   });
   // Keep the Return Home link BELOW the selected category, never between
   // Residential and Commercial where it could break the visual sequence.
   const returnHome=panel.querySelector("#main .tle-return-home-wrap");
   if(returnHome&&returnHome.previousElementSibling!==commercial){
     commercial.insertAdjacentElement("afterend",returnHome);
   }
   // Preserve current routes, anchor links and assistant navigation without
   // creating any duplicate service panels.
   document.querySelectorAll('a[href="#demoServices"]').forEach(a=>a.href="#bookingStarter");
 }
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});
 else init();
})();
