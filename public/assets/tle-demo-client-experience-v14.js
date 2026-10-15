/* The Launch Era · customer-first sample experience v14.
 * Deliberately affects only the PUBLIC, browser-only demo (no key/owner_preview).
 * Never submit, send emails, mutate CRM, imply confirmed slots or invent reviews.
 */
(()=>{
 "use strict";
 const path=location.pathname.replace(/\/+$/,"");
 const params=new URLSearchParams(location.search);
 if(path!=="/lead-private-preview.html"||params.has("key")||params.get("owner_preview")==="1")return;
 if(!document.documentElement.classList.contains("demo-editorial"))return;
 const es=params.get("lang")==="es";
 const tidy=s=>String(s??"").replace(/[<>\u0000-\u001f]/g,"").trim().slice(0,85);
 const business=tidy(params.get("business"))||"Coastal Home Cleaning";
 const area=tidy(params.get("area"));
 document.documentElement.classList.add("tle-demo-client-v14");
 const tr=es?{
  top:"VISTA DE EJEMPLO · NO SE REALIZAN RESERVAS",
  heroTitle:"Llegar a casa y sentir que todo está en su lugar.",
  heroSub:"Cuéntanos qué necesita tu espacio. Explora los servicios y elige cómo te gustaría cuidarlo.",
  heroCta:"Explorar limpiezas",
  brandNote:"EMPRESA DE EJEMPLO",
  servicesEy:"SERVICIOS DE LIMPIEZA",
  serviceDesc:"Elige el servicio que mejor se adapte a tu espacio. Puedes revisar todos los detalles antes de terminar.",
  stepLabels:["Elige tu servicio","Cuéntanos los detalles","Revisa la solicitud","Solicitud de ejemplo lista"],
  processTitle:"Así de sencillo",
  processSteps:["Elige el tipo de limpieza","Añade los detalles de tu espacio","Revisa todo antes de finalizar"],
  progress:"Paso",
  footer:"Vista de demostración · Los precios, zonas y horarios son ejemplos; no se realizan reservas ni pagos.",
  doneTitle:"Así se verá tu solicitud",
  doneText:"Ya puedes ver un ejemplo de confirmación. No hemos reservado ningún horario ni enviado ningún mensaje.",
  sticky:"Solicitar limpieza",
  photoAlt:"Una casa luminosa preparada para disfrutar",
  compare:"El negocio confirma servicios y precio final antes de cualquier reserva.",
  offer:"Las opciones y precios aquí son ilustrativos. La empresa confirma los detalles antes de la visita.",
  careTitle:"Cuidamos los detalles que convierten una casa en hogar.",
  careText:"Cada espacio merece atención, desde los pequeños rincones hasta esa sensación de limpieza al abrir la puerta."
 }:{
  top:"SAMPLE WEBSITE · NO LIVE BOOKINGS",
  heroTitle:"Come home to a space that feels just right.",
  heroSub:"Tell us about your space. Explore our cleaning services and choose the care that suits your home.",
  heroCta:"Explore cleaning services",
  brandNote:"SAMPLE BUSINESS",
  servicesEy:"CLEANING SERVICES",
  serviceDesc:"Pick the cleaning that fits your space. You can review every detail before finishing.",
  stepLabels:["Choose a cleaning","Tell us the details","Review your request","Sample request complete"],
  processTitle:"Cleaning made simpler",
  processSteps:["Choose your cleaning service","Tell us about your space","Review the details before finishing"],
  progress:"Step",
  footer:"Interactive sample · Prices, service areas and times are illustrative. No booking or payment is made.",
  doneTitle:"Here’s how your request would look",
  doneText:"Your sample confirmation is ready. No time has been reserved and no message has been sent.",
  sticky:"Request cleaning",
  photoAlt:"A bright home ready to enjoy",
  compare:"Each business confirms its own services and final pricing before a booking.",
  offer:"Options and prices are illustrative. The cleaning provider confirms the details before any visit.",
  careTitle:"The little details make a house feel like home.",
  careText:"A thoughtful cleaning experience should feel personal, from your first question to the final finishing touch."
 };
 const $=selector=>document.querySelector(selector);
 const label=$(".demo-top-label");if(label)label.textContent=tr.top;
 const brand=$(".demo-logo");
 if(brand) {
   const b=brand.querySelector(".demo-brand-pink"),other=brand.querySelector("span:not(.demo-brand-pink):not(.demo-logo-spark)");
   if(b){b.textContent=business.length>29?business.slice(0,28)+"…":business;b.style.letterSpacing="-.045em"}
   if(other)other.textContent="";
   brand.setAttribute("aria-label",es?"Ir al inicio de la página":"Back to the top");
 }
 const heroName=$("#leadName");if(heroName)heroName.textContent=(business+" · "+tr.brandNote).toUpperCase();
 const tagline=$(".demo-hero-tagline");if(tagline)tagline.textContent=tr.heroTitle;
 const description=$(".demo-hero-description");if(description)description.textContent=tr.heroSub;
 const action=$(".demo-hero-cta");
 if(action){const child=[...action.childNodes].find(n=>n.nodeType===Node.TEXT_NODE);if(child)child.nodeValue=tr.heroCta+" ";}
 const areaLabel=$("#demoHeroArea");
 if(areaLabel)areaLabel.textContent=area?(es?"Zonas de ejemplo: ":"Sample service area: ")+area:(es?"Zonas de servicio personalizadas":"Personalized service areas");
 const panel=$("#bookingStarter");
 if(!panel)return;
 const head=$("#ey");if(head)head.textContent=tr.servicesEy;
 const desc=$(".demo-panel-desc");if(desc)desc.textContent=tr.serviceDesc;
 const note=$(".demo-services-note");if(note)note.textContent=tr.offer;
 const progress=document.createElement("div");progress.className="tle-client-progress";progress.id="tleClientProgress";progress.setAttribute("aria-live","polite");
 progress.innerHTML='<span class="tle-client-progress-step"></span><div class="tle-client-progress-bar" aria-hidden="true"><span></span></div><small></small>';
 const panelHeader=panel.querySelector(".head");panelHeader?.insertAdjacentElement("afterend",progress);
 function refresh(){
  const screens=["main","res","quote","commercial","resReview","done"];
  const active=screens.find(id=>document.getElementById(id)?.classList.contains("on"))||"main";
  const number=active==="main"?1:active==="done"?3:active==="resReview"?3:2;
  const stage=active==="done"?3:number;
  const p=progress.querySelector(".tle-client-progress-step"),bar=progress.querySelector(".tle-client-progress-bar span"),small=progress.querySelector("small");
  if(p)p.textContent=tr.stepLabels[stage-1];
  if(bar)bar.style.width=(stage/3*100)+"%";
  if(small)small.textContent=tr.progress+" "+stage+" / 3";
  const notice=$("#tleClientSmallNotice");if(notice)notice.hidden=active!=="main";
 }
 const notice=document.createElement("p");notice.id="tleClientSmallNotice";notice.className="tle-client-notice";notice.textContent=tr.compare;
 panel.querySelector("#main .demo-services-note")?.insertAdjacentElement("afterend",notice);
 const observer=new MutationObserver(refresh);
 panel.querySelectorAll(".screen").forEach(el=>observer.observe(el,{attributes:true,attributeFilter:["class"]}));
 refresh();
 const done=$("#done .success");
 if(done){
  const title=done.querySelector("h2"),sub=done.querySelector("p.muted");
  if(title)title.textContent=tr.doneTitle;
  if(sub)sub.textContent=tr.doneText;
 }
 // Use the existing editorial photograph and the three established highlights;
 // no unrelated stock images or new nested cards.
 const bottom=$("#demoHow .demo-bottom-text");
 if(bottom){const title=bottom.querySelector("h2"),p=bottom.querySelector("p"),ey=bottom.querySelector("span");
  if(ey)ey.textContent=es?"UNA EXPERIENCIA MÁS PERSONAL":"A MORE PERSONAL EXPERIENCE";
  if(title)title.textContent=tr.careTitle;
  if(p)p.textContent=tr.careText;
 }
 const footer=$(".demo-footer");
 if(footer){const status=footer.querySelector("span");if(status)status.textContent=tr.footer;}
 const mini=document.createElement("div");mini.className="tle-client-quicksteps";
 mini.setAttribute("aria-label",tr.processTitle);
 const h=document.createElement("h3");h.textContent=tr.processTitle;mini.append(h);
 const ul=document.createElement("ol");
 tr.processSteps.forEach(s=>{const li=document.createElement("li");li.textContent=s;ul.append(li)});
 mini.append(ul);panel.insertAdjacentElement("afterend",mini);
 // A discreet companion to Sonny, shown only away from the actual booking panel.
 const sticky=document.createElement("a");sticky.className="tle-client-sticky-cta";sticky.href="#bookingStarter";
 sticky.textContent=tr.sticky+"  ↗";sticky.hidden=true;sticky.setAttribute("aria-label",tr.sticky);
 document.body.appendChild(sticky);
 let panelVisible=true;
 const watcher=new IntersectionObserver(entries=>{panelVisible=entries.some(e=>e.isIntersecting);updateSticky()},{rootMargin:"-12% 0px -10% 0px"});
 watcher.observe(panel);
 const updateSticky=()=>{sticky.hidden=!(matchMedia("(max-width:650px)").matches&&scrollY>350&&!panelVisible)};
 window.addEventListener("scroll",updateSticky,{passive:true});
 window.addEventListener("resize",updateSticky,{passive:true});
 sticky.addEventListener("click",()=>{sticky.hidden=true;panel.focus({preventScroll:true})});
})();
