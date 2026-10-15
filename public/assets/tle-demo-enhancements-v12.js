(function demoEnhancements(){
"use strict";
const qs=new URLSearchParams(location.search);
const isProspect=/\/lead-private-preview\.html$/.test(location.pathname);
const isSales=/\/booking-demo\/?$/.test(location.pathname);
if(!isProspect&&!isSales)return;
const isLive=qs.has("key")||qs.get("owner_preview")==="1";
if(isProspect&&isLive)return;
const es=qs.get("lang")==="es"||(isSales&&document.querySelector("#language")?.value==="es");
const image="/assets/lead-demo/ai-demo-robot.webp";
const home="/assets/lead-demo/hero-luxury-home.png";
const kitchen="/assets/lead-demo/pristine-kitchen.png";
const cleaner="/assets/lead-demo/cleaner-in-home.png";
const servicesTarget=isProspect?"#demoServices":"#demoForm";
const safe=s=>String(s||"").replace(/[<>\u0000-\u001f]/g,"").trim().slice(0,100);
const labels=es?{
  reviews:"Opiniones de clientes",reviewsSub:"Así se mostrarán las reseñas reales de cada negocio. Los siguientes textos son ejemplos de diseño, no testimonios.",
  reviewBadge:"EJEMPLO · REEMPLAZAR POR RESEÑA REAL",
  reviewText:["La opinión verificada de un cliente aparecerá aquí.","Una segunda reseña auténtica puede describir la experiencia.","Aquí podremos mostrar otro comentario real, con autorización."],
  areas:"Áreas que atendemos",areasSub:"La cobertura real la define el negocio. Este ejemplo se personaliza con sus ciudades y códigos postales.",
  areaUnknown:"Área de servicio por confirmar",serviceArea:"Zonas cercanas",postcodes:"Cobertura por ZIP",
  why:"Por qué elegir este servicio",whyTitle:"Detalles claros. Una experiencia sencilla.",whyCopy:"Servicios fáciles de explorar, solicitudes organizadas y seguimiento de cada consulta.",
  whyItems:["Solicitudes fáciles","Servicios a tu medida","Seguimiento claro"],faq:"Preguntas frecuentes",faqSub:"Respuestas rápidas antes de solicitar una limpieza.",
  faqItems:[["¿Puedo solicitar un estimado?","Sí. En esta demostración puedes conocer el proceso. Los precios son de ejemplo y el negocio confirma la cotización final."],["¿Puedo elegir limpieza recurrente?","La experiencia muestra opciones de una sola visita, semanal, quincenal o mensual."],["¿Esta prueba envía una reserva real?","No. Es una demostración y no se envían solicitudes, correos ni pagos."],["¿Me puede ayudar el asistente con IA?","Sí. Puedes explorar los servicios y preparar los datos para revisar el formulario. La IA es un servicio opcional que se contrata por separado."]],
  finalTitle:"¿Lista para probarlo?",finalText:"Explora los servicios y descubre cómo sería la experiencia de tus clientes.",finalCta:"Probar solicitud de limpieza",
  salesTitle:"Una landing que se siente como tu negocio",salesText:"Un ejemplo visual con fotografía, reseñas reales aprobadas, áreas de servicio y una reserva fácil de explorar.",
  helper:"¡Hola! Puedo explicarte nuestros servicios y ayudarte a completar el formulario, sin enviarlo por ti.",helperServices:"Preguntar por servicios",helperForm:"Ayudarme con el formulario",helperAi:"La IA es un servicio adicional",
  welcome:"¡Hola! 👋 ¿Te ayudo a elegir un servicio o a completar el formulario?",ask:"Abrir asistente IA",separate:"Asistente con IA · complemento opcional; no incluido en la reserva."
}:{
  reviews:"Customer reviews",reviewsSub:"This is where each business's genuine customer reviews appear. The cards below are layout samples, not actual testimonials.",
  reviewBadge:"SAMPLE · REPLACE WITH A REAL REVIEW",
  reviewText:["An approved customer review will appear here.","A second genuine review can highlight the experience.","Add another verified customer comment with permission."],
  areas:"Areas we serve",areasSub:"Service coverage belongs to the business. Its actual cities and ZIP codes personalize this section.",
  areaUnknown:"Service area to be confirmed",serviceArea:"Nearby communities",postcodes:"ZIP coverage",
  why:"Why choose us",whyTitle:"Thoughtful details. A simpler experience.",whyCopy:"Clear service choices, straightforward requests and every important detail in one place.",
  whyItems:["Simple requests","Services for your space","Clear next steps"],faq:"Frequently asked questions",faqSub:"Helpful answers before making a cleaning request.",
  faqItems:[["Can I request an estimate?","Yes. In this preview you can try the request process. Prices are illustrative; the business confirms final estimates."],["Can I request recurring cleanings?","The sample includes one-time, weekly, biweekly and monthly choices."],["Does this demo place a real booking?","No. This is an interactive sample; nothing is booked, charged or emailed."],["Can the AI help with the form?","Yes. It can explain services and prepare sample details for your review. AI assistance is an optional service sold separately."]],
  finalTitle:"Ready to give it a try?",finalText:"Explore the services and see how the booking experience can work for your customers.",finalCta:"Try the cleaning request",
  salesTitle:"A website that feels like your business",salesText:"See a visual example with beautiful imagery, verified customer reviews, service areas and a simple booking experience.",
  helper:"Hi! I can explain the services and guide you through your demo request without submitting it for you.",helperServices:"Explore the services",helperForm:"Help with the form",helperAi:"AI is a separate add-on",
  welcome:"Hi! 👋 Want help choosing a service or filling out the form?",ask:"Ask AI",separate:"AI Assistant · optional separate service, not included in basic booking."
};
function h(tag,cl,html){const x=document.createElement(tag);if(cl)x.className=cl;if(html!==undefined)x.innerHTML=html;return x}
function avatar(){const im=document.createElement("img");im.src=image;im.alt="";im.width=50;im.height=50;im.decoding="async";im.className="tle-demo-ai-avatar";return im}
function addSections(){
 const anchor=document.getElementById("demoCinematicStory");
 if(!anchor||!document.documentElement.classList.contains("demo-editorial"))return;
 if(document.getElementById("tleDemoReviews"))return;
 const brand=safe(qs.get("business"));
 const areaText=safe(qs.get("area"));
 const parts=areaText.split(/[,;|]/).map(s=>safe(s)).filter(Boolean).slice(0,6);
 let area=parts.length?parts:[labels.areaUnknown,labels.serviceArea,labels.postcodes];
 const block=h("div","tle-demo-v12-sections");
 block.innerHTML=`
<section class="tle-demo-v12-why" aria-labelledby="tleWhyTitle">
  <div class="tle-demo-v12-copy"><span class="tle-demo-v12-ey">${labels.why}</span><h2 id="tleWhyTitle">${labels.whyTitle}</h2><p>${labels.whyCopy}</p>
    <div class="tle-demo-v12-perks">${labels.whyItems.map(t=>`<span>✓ ${t}</span>`).join("")}</div></div>
  <img src="${kitchen}" alt="Freshly cleaned modern kitchen" loading="lazy" width="1100" height="700">
</section>
<section class="tle-demo-v12-review" id="tleDemoReviews" aria-labelledby="tleReviewsTitle">
 <div class="tle-demo-v12-heading"><span class="tle-demo-v12-ey">01 / TRUST</span><h2 id="tleReviewsTitle">${labels.reviews}</h2><p>${labels.reviewsSub}</p></div>
 <div class="tle-demo-v12-reviewgrid">${labels.reviewText.map((t,i)=>`<article><span class="tle-demo-v12-tag">${labels.reviewBadge}</span><p>${t}</p><small>REVIEW ${String(i+1).padStart(2,"0")} · DEMO ONLY</small></article>`).join("")}</div>
</section>
<section class="tle-demo-v12-areas" id="tleDemoAreas" aria-labelledby="tleAreasTitle">
 <img src="${home}" loading="lazy" width="1200" height="820" alt="Bright, beautifully prepared home">
 <div><span class="tle-demo-v12-ey">02 / LOCAL SERVICE</span><h2 id="tleAreasTitle">${labels.areas}</h2><p>${labels.areasSub}</p><div class="tle-demo-v12-areatags" id="tleDemoAreaTags"></div><small class="tle-demo-v12-disclaimer">${brand?brand+" · ":""}${es?"Cobertura de ejemplo: verifica los lugares antes de publicar.":"Preview coverage only: confirm locations before publishing."}</small></div>
</section>
<section class="tle-demo-v12-faq" id="tleDemoFaq" aria-labelledby="tleFaqTitle">
 <div class="tle-demo-v12-heading"><span class="tle-demo-v12-ey">03 / GOOD TO KNOW</span><h2 id="tleFaqTitle">${labels.faq}</h2><p>${labels.faqSub}</p></div>
 <div class="tle-demo-v12-faqgrid">${labels.faqItems.map(([q,a])=>`<details><summary>${q}<span aria-hidden="true">+</span></summary><p>${a}</p></details>`).join("")}</div>
</section>
<div class="tle-demo-v12-end"><div><h2>${labels.finalTitle}</h2><p>${labels.finalText}</p></div><a href="#bookingStarter">${labels.finalCta} <span aria-hidden="true">↗</span></a></div>`;
 anchor.insertAdjacentElement("afterend",block);
 const tags=document.getElementById("tleDemoAreaTags");
 area.forEach(s=>{const el=document.createElement("span");el.textContent=s;tags.appendChild(el)});
 const nav=document.querySelector(".demo-navlinks");
 if(nav){const links=[[labels.reviews,"#tleDemoReviews"],[labels.areas,"#tleDemoAreas"],["FAQ","#tleDemoFaq"]];links.forEach(([label,url])=>{const a=document.createElement("a");a.href=url;a.textContent=label;nav.appendChild(a)})}
}
function addSalesPreview(){
 const wrap=document.querySelector("main.wrap");
 if(!wrap||document.getElementById("tleDemoSalesExperience"))return;
 const block=h("section","tle-demo-v12-sales");
 block.id="tleDemoSalesExperience";
 block.innerHTML=`<div class="tle-demo-v12-salescopy"><span class="tle-demo-v12-ey">PERSONALIZED CLEANING DEMO</span><h2>${labels.salesTitle}</h2><p>${labels.salesText}</p><div class="tle-demo-v12-perks"><span>✓ ${labels.reviews}</span><span>✓ ${labels.areas}</span><span>✓ ${labels.faq}</span></div><a href="#demoForm">${labels.finalCta} →</a></div><div class="tle-demo-v12-salesphotos"><img src="${cleaner}" alt="Professional cleaner working in a modern home" loading="lazy" width="800" height="550"><img src="${home}" alt="Bright, comfortable living space after cleaning" loading="lazy" width="800" height="550"></div>`;
 wrap.appendChild(block);
 const form=document.getElementById("demoForm");
 if(!form)return;
 const guide=h("div","tle-demo-v12-formguide");guide.id="tleDemoFormGuide";
 const text=document.createElement("p");text.textContent=labels.helper;guide.append(avatar(),text);
 const buttons=h("div","tle-demo-v12-formactions");
 [["services",labels.helperServices],["form",labels.helperForm],["ai",labels.helperAi]].forEach(([action,title])=>{
  const b=document.createElement("button");b.type="button";b.textContent=title;b.dataset.action=action;
  b.addEventListener("click",()=>{
   if(action==="form"){form.elements.namedItem("business")?.focus();form.scrollIntoView({behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",block:"center"});return}
   if(action==="ai"){const p=document.getElementById("tleDemoSalesAiNote");if(p){p.hidden=!p.hidden;}return}
   const fab=document.querySelector(".tle-jessy-fab");if(fab)fab.click();else location.href="/booking-lead-automation/";
  });
  buttons.appendChild(b);
 });
 const aiNote=h("p","tle-demo-v12-addon",labels.separate);aiNote.id="tleDemoSalesAiNote";aiNote.hidden=true;
 form.prepend(guide,buttons,aiNote);
 const l=document.querySelector("#language");l?.addEventListener("change",()=>{const current=l.value==="es";if(current===es)return;document.querySelector("#tleDemoSalesExperience")?.remove();document.querySelector("#tleDemoFormGuide")?.remove();document.querySelector(".tle-demo-v12-formactions")?.remove();document.querySelector("#tleDemoSalesAiNote")?.remove();location.search= new URLSearchParams({...Object.fromEntries(qs),lang:l.value}).toString()});
}
function customizeChat(){
 if(isProspect){
  const launch=document.querySelector(".tle-ai-launch"),head=document.querySelector(".tle-ai-head"),log=document.querySelector(".tle-ai-log");
  if(!launch||!head||!log)return;
  const v=document.createElement("span");v.className="tle-demo-ai-label";v.textContent=labels.ask;
  launch.replaceChildren(avatar(),v);launch.setAttribute("aria-label",labels.ask+" — "+labels.separate);
  head.prepend(avatar());
  const subtitle=head.querySelector("small");if(subtitle)subtitle.textContent=labels.separate;
  const intro=log.querySelector(".tle-ai-msg.bot");
  if(intro)intro.textContent=labels.welcome+" "+(es?"La IA puede ayudarte a preparar una solicitud para revisarla.":"The AI can help prepare a sample request for your review.");
  const chips=h("div","tle-demo-v12-chat-actions");chips.innerHTML=`<button type="button" data-action="services">${labels.helperServices}</button><button type="button" data-action="form">${labels.helperForm}</button><a href="/ai-booking-assistant/">${labels.helperAi} ↗</a>`;
  chips.addEventListener("click",e=>{const btn=e.target.closest("button");if(!btn)return;if(btn.dataset.action==="services"){document.querySelector("#demoServices")?.scrollIntoView({behavior:"smooth"});document.querySelector(".tle-ai-head button")?.click()}else if(btn.dataset.action==="form"){const input=document.querySelector(".tle-ai-form textarea");if(input){input.value=es?"Ayúdame a completar una solicitud de limpieza de ejemplo paso a paso.":"Help me fill out a sample cleaning request step by step.";input.focus()}}});
  log.prepend(chips);
  welcome(launch);
  window.addEventListener("scroll",()=>{launch.classList.toggle("tle-demo-condensed",scrollY>180)},{passive:true});
 } else {
  const fab=document.querySelector(".tle-jessy-fab");
  if(!fab)return;
  const current=fab.querySelector("img");if(current)current.src=image;else fab.prepend(avatar());
  document.querySelectorAll(".tle-jessy-head img").forEach(img=>{img.src=image});
  const label=fab.querySelector(".tle-jessy-fab-label");if(label)label.textContent=labels.ask;
  const title=document.querySelector(".tle-jessy-title small");if(title)title.textContent=labels.separate;
  welcome(fab);
 }
}
function welcome(button){
 if(document.getElementById("tleDemoRobotWelcome"))return;
 const n=document.createElement("button");n.type="button";n.id="tleDemoRobotWelcome";n.className="tle-demo-v12-welcome";n.append(avatar(),document.createTextNode(labels.welcome));
 n.addEventListener("click",()=>{n.remove();button.click()});
 document.body.appendChild(n);
 button.addEventListener("click",()=>n.remove(),{once:true});
 window.addEventListener("scroll",()=>{if(scrollY>140)n.remove()},{once:true,passive:true});
 setTimeout(()=>n.remove(),11000);
}
function run(){if(isProspect)addSections();else addSalesPreview();customizeChat()}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",run,{once:true});else run();
})();
