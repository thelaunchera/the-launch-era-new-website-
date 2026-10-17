/* TLE Booking lead magnet: one controlled portal transition + verified gallery.
   No booking/form writes. Existing Sonny and Jessie email handlers remain owner.
*/
(() => {
 "use strict";
 const root=document.getElementById("bookingPortal");
 const front=document.getElementById("bookingPortalFront");
 const windowButton=document.getElementById("bookingPortalEnter");
 const copy=document.getElementById("bookingPortalCopy");
 const reduced=window.matchMedia("(prefers-reduced-motion: reduce)");
 const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
 let raf=0;
 let lastProgress=-1;
 let portalClickFrame=0;
 // Native smooth-scroll can complete almost instantly on iPhone.
 const portalClickDuration=2800;
 const cancelPortalClick=()=>{
  if(portalClickFrame){window.cancelAnimationFrame(portalClickFrame);portalClickFrame=0;}
 };
 function updatePortal(){
  raf=0;
  if(!root||!front||!copy)return;
  if(reduced.matches){
   copy.classList.add("is-active");
   front.style.setProperty("--portal-opacity","0");
   return;
  }
  const rect=root.getBoundingClientRect();
  const travel=Math.max(1,rect.height-window.innerHeight);
  const progress=clamp(-rect.top/travel,0,1);
  if(Math.abs(progress-lastProgress)<.002)return;
  lastProgress=progress;
  // The measured real window size controls the focal zoom on every breakpoint.
  const portal=windowButton?.getBoundingClientRect();
  // getBoundingClientRect changes as front scales. offsetWidth/Height do not.
  const windowWidth=Math.max(1,windowButton?.offsetWidth||320);
  const windowHeight=Math.max(1,windowButton?.offsetHeight||235);
  const target=clamp(Math.max(window.innerWidth/windowWidth,window.innerHeight/windowHeight)*1.06,1,4.35);
  // Give the photographic window a deliberate first beat before the zoom begins.
 const t=clamp((progress-.04)/.74,0,1);
  // Smooth ease in/out, consistent with the requested cubic-bezier feeling.
  const eased=t*t*(3-2*t);
  front.style.setProperty("--portal-scale",String(1+(target-1)*eased));
  const fade=1-clamp((progress-.63)/.19,0,1);
  front.style.setProperty("--portal-opacity",String(fade));
  const open=progress>.82;
  front.style.pointerEvents=open?"none":"auto";
  copy.classList.toggle("is-active",open);
  root.classList.toggle("is-open",open);
 }
 const schedule=()=>{
  if(!raf)raf=window.requestAnimationFrame(updatePortal);
 };
 if(root&&front&&windowButton&&copy){
  window.addEventListener("scroll",schedule,{passive:true});
  window.addEventListener("resize",()=>{lastProgress=-1;schedule()},{passive:true});
  reduced.addEventListener?.("change",()=>{lastProgress=-1;schedule()});
  // A touch, wheel or keyboard scroll cancels the timed entrance naturally.
  window.addEventListener("wheel",cancelPortalClick,{passive:true});
  window.addEventListener("touchstart",cancelPortalClick,{passive:true});
  window.addEventListener("keydown",event=>{
   if(["ArrowDown","ArrowUp","PageDown","PageUp"," ","Home","End"].includes(event.key))cancelPortalClick();
  });
  windowButton.addEventListener("click",()=>{
   cancelPortalClick();
   const top=window.scrollY+root.getBoundingClientRect().top;
   const distance=Math.max(0,root.offsetHeight-window.innerHeight);
   if(reduced.matches){
    window.scrollTo({top:top+distance,behavior:"instant"});
    return;
   }
   const startY=window.scrollY;
   // Stop shortly before the hero exits so the new headline is readable.
   const endY=top+distance*.9;
   const started=performance.now();
   const animate=(now)=>{
    const t=clamp((now-started)/portalClickDuration,0,1);
    const ease=t*t*(3-2*t);
    window.scrollTo({top:startY+(endY-startY)*ease,behavior:"instant"});
    portalClickFrame=t<1?window.requestAnimationFrame(animate):0;
   };
   portalClickFrame=window.requestAnimationFrame(animate);
  });
  schedule();
 }
 // A single language switch controls the SAME hero and proof that email leads see.
 const translations={
   en:{
     bookingPortalKicker:"THE LAUNCH ERA · BOOKING AUTOMATION",
     bookingPortalLine:"Make your booking flow",
     bookingPortalOld:"decent.",
     bookingPortalNew:"remarkable.",
     bookingPortalSub:"A simpler way to turn cleaning inquiries into a clear booking experience.",
     bookingHeroDemo:"Explore booking",bookingHeroSonny:"Ask Sonny",
     bookingPortalEnterText:"Enter the demo ↗",
     bookingPortalIntroKicker:"A CLEARER WAY TO BOOK",
     bookingPortalIntro:"Your next booking experience starts here.",
     bookingPortalCue:"Scroll to explore ↓",
     bookingBubbleKicker:"THE SIMPLE WAY TO BOOK",
     bookingBubbleTitle:"From first hello to a clear next step.",
     bookingBubbleIntro:"A smoother experience for your customers, with everything easy to understand in one place.",
     bookingBubbleStep1Title:"Choose a cleaning service",
     bookingBubbleStep1Text:"Find the right starting point without searching through messages.",
     bookingBubbleStep2Title:"Share the details",
     bookingBubbleStep2Text:"Add the home, date and contact information in a simple flow.",
     bookingBubbleStep3Title:"Choose a preferred time",
     bookingBubbleStep3Text:"Request a date that works for you. The cleaning business confirms availability.",
     bookingBubbleStep4Title:"Review the request",
     bookingBubbleStep4Text:"See your details together before completing the sample preview.",
     bookingStoryHint:"Scroll to follow the booking journey →",
     bookingStoryProgressLabel:"BOOKING JOURNEY",
     bookingBubbleFinish:"Try the demo →",
     bookingBubbleAction:"Explore the booking demo ↓",
     bookingProofKicker:"A BETTER FIRST IMPRESSION",
     bookingProofTitle:"See what a simpler booking flow can do.",
     bookingProofDesc:"These example review cards describe the experience in this demo. They are not published customer testimonials.",
     bookingReview1Mark:"01 — EASY TO EXPLORE",bookingReview2Mark:"02 — EASY TO REQUEST",bookingReview3Mark:"03 — EASY TO FOLLOW",
     bookingReview1Title:"Services, clearly explained",
     bookingReview1Text:"Visitors can see what each type of clean includes and choose the right place to start.",
     bookingReview2Title:"Fewer back-and-forth messages",
     bookingReview2Text:"A straightforward request gathers the basics in one step-by-step flow.",
     bookingReview3Title:"Details together",
     bookingReview3Text:"Your sample Command Center shows how one request can stay organized.",
     bookingCompareKicker:"BEFORE & AFTER",
     bookingCompareTitle:"A fresh perspective on every clean.",
     bookingCompareDesc:"Explore matched illustrative before-and-after photo pairs from the demo library. These are examples, not a claim about any customer's results.",
     bookingPair1Title:"Grout detail",bookingPair2Title:"Bedroom refresh",bookingPair3Title:"Window tracks",
     bookingCompareUnavailable:"Photo comparisons are temporarily unavailable.",
     finalHeadline:"Make your booking flow remarkable.",
     reviewsFoot:"Illustrative demo experience",pairsFoot:"Illustrative matched photo pair",
     before:"Before",after:"After",enter:"Enter the Booking Demo",
     comparisons:["Compare grout before and after","Compare bedroom before and after","Compare window tracks before and after"]
   },
   es:{
     bookingPortalKicker:"THE LAUNCH ERA · RESERVAS AUTOMATIZADAS",
     bookingPortalLine:"Haz que tus reservas sean",
     bookingPortalOld:"aceptables.",
     bookingPortalNew:"extraordinarias.",
     bookingPortalSub:"Convierte las consultas de limpieza en una experiencia de reservas clara y sencilla.",
     bookingHeroDemo:"Explorar reservas",bookingHeroSonny:"Hablar con Sonny",
     bookingPortalEnterText:"Entrar al demo ↗",
     bookingPortalIntroKicker:"RESERVAS MÁS SENCILLAS",
     bookingPortalIntro:"Tu próxima experiencia de reservas empieza aquí.",
     bookingPortalCue:"Desliza para explorar ↓",
     bookingBubbleKicker:"UNA FORMA MÁS SIMPLE DE RESERVAR",
     bookingBubbleTitle:"Del primer mensaje al siguiente paso.",
     bookingBubbleIntro:"Una experiencia más sencilla para tus clientes, con todo claro y organizado en un mismo lugar.",
     bookingBubbleStep1Title:"Elige un servicio",
     bookingBubbleStep1Text:"Encuentra la limpieza adecuada sin buscar entre tantos mensajes.",
     bookingBubbleStep2Title:"Comparte los detalles",
     bookingBubbleStep2Text:"Añade la información del hogar, la fecha y tus datos en pocos pasos.",
     bookingBubbleStep3Title:"Elige una fecha y hora",
     bookingBubbleStep3Text:"Pide la fecha que te venga bien. El negocio de limpieza confirma la disponibilidad.",
     bookingBubbleStep4Title:"Revisa tu solicitud",
     bookingBubbleStep4Text:"Comprueba los detalles antes de terminar esta demostración.",
     bookingStoryHint:"Desliza para seguir el recorrido de la reserva →",
     bookingStoryProgressLabel:"RECORRIDO DE RESERVAS",
     bookingBubbleFinish:"Probar el demo →",
     bookingBubbleAction:"Explorar el demo de reservas ↓",
     bookingProofKicker:"UNA MEJOR PRIMERA IMPRESIÓN",
     bookingProofTitle:"Descubre una forma más fácil de reservar.",
     bookingProofDesc:"Estas tarjetas muestran situaciones de ejemplo del demo. No son reseñas publicadas de clientes reales.",
     bookingReview1Mark:"01 — EXPLORA SIN COMPLICARTE",bookingReview2Mark:"02 — PIDE TU LIMPIEZA FÁCIL",bookingReview3Mark:"03 — TODO BAJO CONTROL",
     bookingReview1Title:"Servicios claros",
     bookingReview1Text:"Los visitantes pueden ver los tipos de limpieza y elegir el servicio adecuado.",
     bookingReview2Title:"Menos mensajes de ida y vuelta",
     bookingReview2Text:"Una solicitud sencilla reúne los detalles necesarios paso a paso.",
     bookingReview3Title:"Todo en un mismo lugar",
     bookingReview3Text:"El Command Center de ejemplo muestra cómo organizar las solicitudes.",
     bookingCompareKicker:"ANTES Y DESPUÉS",
     bookingCompareTitle:"Una nueva perspectiva de cada limpieza.",
     bookingCompareDesc:"Explora pares de fotos ilustrativas del antes y después. Son ejemplos, no resultados atribuidos a clientes.",
     bookingPair1Title:"Detalles de juntas",bookingPair2Title:"Dormitorio renovado",bookingPair3Title:"Rieles de ventana",
     bookingCompareUnavailable:"Las comparaciones no están disponibles temporalmente.",
     finalHeadline:"Haz que tus reservas sean extraordinarias.",
     reviewsFoot:"Ejemplo ilustrativo del demo",pairsFoot:"Par de fotos ilustrativas",
     before:"Antes",after:"Después",enter:"Entrar al demo de reservas",
     comparisons:["Comparar antes y después de las juntas","Comparar antes y después del dormitorio","Comparar antes y después de los rieles de ventana"]
   }
 };
 function updateTranslations(){
  const selected=document.getElementById("language")?.value==="es"?"es":"en";
  const t=translations[selected];
  for(const [id,value] of Object.entries(t)){
   const el=document.getElementById(id);
   if(!el||typeof value!=="string")continue;
   // Preserve the strike line INSIDE only the old word during EN/ES switches.
   if(id==="bookingPortalOld"){
    const word=el.querySelector(".booking-portal-old-word");
    if(word)word.textContent=value;
   }else el.textContent=value;
  }
  document.getElementById("bookingPortalHeadline")?.setAttribute("aria-label",t.finalHeadline);
  document.getElementById("bookingStoryTrack")?.setAttribute("aria-label",selected==="es"?"Recorrido ilustrado para solicitar una limpieza":"Illustrated sample booking journey");
  document.getElementById("bookingStoryProgress")?.setAttribute("aria-label",selected==="es"?"Progreso del recorrido de reservas":"Booking journey progress");
  const altTexts=selected==="es"?[
   "Profesional limpiando una encimera en una cocina moderna y luminosa",
   "Baño familiar luminoso como ejemplo de un espacio residencial",
   "Sala moderna iluminada con sofá limpio y cocina abierta",
   "Dormitorio de invitados preparado con ropa de cama blanca"
  ]:[
   "Professional cleaner wiping a kitchen counter in a bright modern home",
   "Bright family bathroom showing a typical residential space",
   "Sunlit modern living room with a clean sofa and open kitchen",
   "Freshly prepared guest bedroom with neat white bedding"
  ];
  document.querySelectorAll(".booking-story-photo-card img").forEach((img,i)=>img.alt=altTexts[i]||"");
  windowButton?.setAttribute("aria-label",t.enter);
  document.querySelectorAll(".booking-review-foot").forEach(el=>el.textContent=t.reviewsFoot);
  document.querySelectorAll(".booking-pair-caption").forEach(el=>el.textContent=t.pairsFoot);
  document.querySelectorAll(".booking-compare-visual").forEach((el,index)=>{
    el.querySelectorAll(".labels span").forEach((label,i)=>label.textContent=i===0?t.before:t.after);
    el.querySelector('input[type="range"]')?.setAttribute("aria-label",t.comparisons[index]||t.comparisons[0]);
  });
 }
 document.getElementById("language")?.addEventListener("change",updateTranslations);
 updateTranslations();

 // Hero Sonny shortcut toggles the existing REAL Sonny conversation.
 document.getElementById("bookingHeroSonny")?.addEventListener("click",()=>{
   const button=document.getElementById("sonnyToggle");
   if(!button)return;
   if(button.getAttribute("aria-expanded")!=="true")button.click();
   document.getElementById("sonnyInput")?.focus({preventScroll:true});
 });
 // Paired real before & after images from the demo's existing library.
 // Never substitute unrelated images as fabricated results.
 const comparisons=[...document.querySelectorAll(".booking-compare-visual")];
 let goodCount=0;
 let checkedCount=0;
 const info=document.getElementById("bookingCompareUnavailable");
 function mark(card,isGood){
   if(card.dataset.checked)return;
   card.dataset.checked="1";
   checkedCount++;
   if(isGood)goodCount++;
   else card.hidden=true;
   if(info)info.hidden=goodCount>0||checkedCount!==comparisons.length;
 }
 comparisons.forEach(card=>{
   const before=card.querySelector("img.before");
   const after=card.querySelector("img.after");
   const slider=card.querySelector('input[type="range"]');
   const images=[before,after].filter(Boolean);
   let failed=false;
   function inspect(){
     if(card.dataset.checked)return;
     if(failed){mark(card,false);return}
     if(images.some(img=>!img.complete))return;
     mark(card,images.length===2&&images.every(img=>img.naturalWidth>0));
   }
   images.forEach(img=>{
     img.addEventListener("error",()=>{failed=true;inspect()},{once:true});
     img.addEventListener("load",inspect,{once:true});
     // These matched pairs are generated by the existing image build. Never
     // make the route-integrity scanner require build-time optional binaries.
     const photo=img.dataset.photo;
     if(photo)img.src=photo;
     else failed=true;
   });
   slider?.addEventListener("input",()=>{
     const value=clamp(Number(slider.value),0,100);
     card.style.setProperty("--compare-split",value+"%");
   });
   inspect();
 });
 // Lazy photos finalize individually on load/error, preserving usable cards
 // even when some illustrative source pairs cannot be downloaded.
 // Upgrade only this picture-based section. Browser fallback stays natively scrollable.
 import('/assets/tle-demo-horizontal-story.js?v=20261016-drive-hscroll1').catch(()=>{});
})();
