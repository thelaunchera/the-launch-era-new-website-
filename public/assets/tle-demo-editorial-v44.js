/* v44 · Only the public fictional cleaning sample. Keep every booking
   action, estimate, quote and calendar connected to the existing functions. */
(()=>{"use strict";
const q=new URLSearchParams(location.search);
if(!/\/lead-private-preview\.html$/.test(location.pathname)||q.has("key")||q.get("owner_preview")==="1")return;
function enhance(){
 const html=document.documentElement;
 if(!html.classList.contains("demo-editorial")||!html.classList.contains("tle-demo-v42"))return false;
 if(html.classList.contains("tle-demo-v44"))return true;
 const hero=document.getElementById("leadHero");
 const portal=hero?.querySelector(".tle-v42-window");
 const main=document.getElementById("main");
 const panel=document.getElementById("bookingStarter");
 const home=document.getElementById("residentialServiceList");
 const commercial=document.getElementById("commercialServiceList");
 if(!hero||!portal||!main||!panel||!home||!commercial)return false;
 const es=q.get("lang")==="es";
 html.classList.add("tle-demo-v44");
 portal.querySelector("span").textContent=es?"Bienvenidos ↗":"Welcome ↗";
 portal.setAttribute("aria-label",es?"Bienvenidos. Entrar a elegir una limpieza":"Welcome. Enter the cleaning service experience");
 const h=hero.querySelector(".tle-v42-second-scene h2");
 if(h)h.textContent=es?"Bienvenidos a un hogar más fresco.":"Welcome to a fresher home.";
 // One invitation, one short sentence; all real service buttons stay untouched.
 const intro=document.createElement("header");
 intro.className="tle-v44-intro";
 const headline=document.createElement("h2");
 headline.textContent=es?"Elige tu limpieza":"Choose your cleaning";
 const message=document.createElement("p");
 message.textContent=es
  ?"Selecciona el servicio que necesitas. Después podrás personalizar los detalles."
  :"Choose the service you need, then personalize the details.";
 intro.append(headline,message);
 main.prepend(intro);
 // A single clear label is better than competing category labels and side hints.
 for(const heading of main.querySelectorAll(".tle-v42-section-head")){
  const note=heading.querySelector("small");
  if(note)note.remove();
  const kicker=heading.querySelector(".tle-v42-eyebrow");
  if(kicker)kicker.remove();
 }
 // The service section remains a visible gallery (Home then Business).
 // Original onclick actions and real estimate values are never edited.
 return true;
}
if(!enhance()){
 const watcher=new MutationObserver(()=>{if(enhance())watcher.disconnect();});
 watcher.observe(document.documentElement,{attributes:true,attributeFilter:["class"],childList:true,subtree:true});
 window.addEventListener("load",()=>{if(enhance())watcher.disconnect()},{once:true});
}
})();
