/* v48 — luxury editorial layout for fictional unkeyed Booking Page demo.
   Deliberately presentation-only: original pricing, quote and booking listeners own all actions. */
(()=>{
"use strict";
const query=new URLSearchParams(location.search);
if(!/\/lead-private-preview\.html$/.test(location.pathname) ||
   query.has("key") || query.get("owner_preview")==="1") return;
const es=query.get("lang")==="es";
const path="/assets/drive-house-gallery/";
let mounted=false;
function mount(){
  if(mounted) return true;
  const root=document.documentElement;
  const hero=document.getElementById("leadHero");
  const gallery=hero?.querySelector(".tle46-gallery");
  const stage=gallery?.querySelector(".tle46-hero-slot");
  const form=document.getElementById("bookingStarter");
  if(!root.classList.contains("demo-editorial") || !gallery || !stage || !form) return false;
  if(root.classList.contains("tle-demo-v48")){mounted=true;return true;}
  const floating=document.createElement("div");
  floating.className="tle48-floating-photo";
  floating.setAttribute("aria-hidden","true");
  const feature=document.createElement("img");
  feature.src=path+"guest-ready-dining-nook.png";
  feature.alt="";
  feature.width=360;feature.height=450;feature.decoding="async";feature.loading="eager";
  const label=document.createElement("span");
  label.className="tle48-photo-label";
  label.textContent=es?"Los detalles importan":"Every detail matters";
  floating.append(feature,label);
  stage.append(floating);

  // Curved transition is an independent decorative layer, not a booking control.
  const wave=document.createElement("div");
  wave.className="tle48-wave";
  wave.setAttribute("aria-hidden","true");
  wave.innerHTML='<svg viewBox="0 0 1440 120" preserveAspectRatio="none" focusable="false"><path d="M0 54C240 2 416 116 718 69C1031 21 1245 26 1440 76V120H0Z"/></svg>';
  hero.insertAdjacentElement("afterend",wave);
  const story=document.createElement("section");
  story.className="tle48-story";
  story.setAttribute("aria-label",es?"La experiencia de limpieza":"The cleaning experience");
  story.innerHTML=es
    ? '<div class="tle48-photos"><figure><img src="'+path+'deep-cleaned-kitchen.png" loading="lazy" width="560" height="700" alt="Cocina impecable"><figcaption>Cocinas impecables</figcaption></figure><figure><img src="'+path+'editorial-entryway.png" loading="lazy" width="560" height="700" alt="Entrada y sala cuidadosamente preparada"><figcaption>Espacios listos para disfrutar</figcaption></figure></div><div class="tle48-copy"><span class="tle48-kicker">EL CONFORT EMPIEZA EN CASA</span><h2>Tu hogar limpio. Tu día más fácil.</h2><p>Elige el servicio que necesitas, revisa los detalles y continúa con tu solicitud. Todo claro desde el principio.</p><div class="tle48-points"><span>Encuentra la limpieza adecuada</span><span>Consulta los precios de ejemplo</span><span>Explora la reserva sin compromiso</span></div></div>'
    : '<div class="tle48-photos"><figure><img src="'+path+'deep-cleaned-kitchen.png" loading="lazy" width="560" height="700" alt="Freshly cleaned kitchen"><figcaption>Beautifully cared-for kitchens</figcaption></figure><figure><img src="'+path+'editorial-entryway.png" loading="lazy" width="560" height="700" alt="Welcoming, spotless home entryway"><figcaption>Rooms ready to enjoy</figcaption></figure></div><div class="tle48-copy"><span class="tle48-kicker">COMFORT STARTS AT HOME</span><h2>A cleaner home. An easier day.</h2><p>Find the right service, review the details and continue with your request. Clear and simple from the start.</p><div class="tle48-points"><span>Find the cleaning that fits</span><span>See transparent sample pricing</span><span>Try the booking flow, no commitment</span></div></div>';
  wave.insertAdjacentElement("afterend",story);

  // Use three different, locally hosted Drive photographs on the existing
  // REAL demo buttons. Never replace their text, price or click handlers.
  const residential=document.getElementById("residentialServiceList");
  const images=[
    "whole-home.png","pristine-kitchen.png","miami-condo.png"
  ];
  const buttons=[...(residential?.querySelectorAll(":scope > button.service")||[])];
  buttons.slice(0,3).forEach((button,index)=>{
    const photo=button.querySelector(".tle-service-photo-v21 img");
    if(photo){
      photo.src=path+images[index];
      photo.dataset.sourceCollection="TLE Drive";
      photo.onerror=null;
      photo.removeAttribute("data-fallback");
    }
  });
  root.classList.add("tle-demo-v48");
  mounted=true;
  return true;
}
if(!mount()){
  const observer=new MutationObserver(()=>{if(mount())observer.disconnect();});
  observer.observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:["class"]});
  window.addEventListener("load",()=>{if(mount())observer.disconnect()},{once:true});
}
})();