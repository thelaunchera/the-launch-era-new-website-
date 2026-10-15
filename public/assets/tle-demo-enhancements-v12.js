(function demoEnhancements(){
"use strict";
const qs=new URLSearchParams(location.search);
const isProspect=/\/lead-private-preview\.html$/.test(location.pathname);
const isSales=/\/booking-demo(?:\/|\/index\.html)?$/.test(location.pathname);
if(!isProspect&&!isSales)return;
const isLive=qs.has("key")||qs.get("owner_preview")==="1";
if(isProspect&&isLive)return;
const es=qs.get("lang")==="es"||(isSales&&document.querySelector("#language")?.value==="es");
const image="/assets/lead-demo/ai-demo-robot.webp";
const home="/assets/lead-demo/hero-luxury-home.png";
const kitchen="/assets/lead-demo/pristine-kitchen.png";
const cleaner="/assets/lead-demo/drive-cleaner-kitchen.webp";
const servicesTarget=isProspect?"#demoServices":"#demoForm";
const safe=s=>String(s||"").replace(/[<>\u0000-\u001f]/g,"").trim().slice(0,100);
const labels=es?{
  reviews:"Opiniones de clientes",reviewsSub:"Así se mostrarán las reseñas reales de cada negocio. Los siguientes textos son ejemplos de diseño, no testimonios.",
  reviewBadge:"EJEMPLO · REEMPLAZAR POR RESEÑA REAL",
  reviewText:["La opinión verificada de un cliente aparecerá aquí.","Una segunda reseña auténtica puede describir la experiencia.","Aquí podremos mostrar otro comentario real, con autorización."],
  areas:"Áreas que atendemos",areasSub:"La cobertura real la define el negocio. Este ejemplo se personaliza con sus ciudades y códigos postales.",
  areaUnknown:"Área de servicio por confirmar",serviceArea:"Zonas cercanas",postcodes:"Cobertura por ZIP",
  why:"ELIGE TU LIMPIEZA",whyTitle:"Una limpieza para cada momento.",whyCopy:"Desde el mantenimiento de cada semana hasta una limpieza profunda o antes de mudarte. Elige lo que mejor se adapte a tu hogar.",
  whyItems:["Limpieza regular","Limpieza profunda","Mudanzas y cambios de hogar"],faq:"Preguntas frecuentes",faqSub:"Respuestas rápidas antes de solicitar una limpieza.",
  faqItems:[["¿Puedo solicitar un estimado?","Sí. En esta demostración puedes conocer el proceso. Los precios son de ejemplo y el negocio confirma la cotización final."],["¿Puedo elegir limpieza recurrente?","La experiencia muestra opciones de una sola visita, semanal, quincenal o mensual."],["¿Esta prueba envía una reserva real?","No. Es una demostración y no se envían solicitudes, correos ni pagos."],["¿Me puede ayudar el asistente con IA?","Sí. Puedes explorar los servicios y preparar los datos para revisar el formulario. La IA es un servicio opcional que se contrata por separado."]],
  finalTitle:"¿Lista para probarlo?",finalText:"Explora los servicios y descubre cómo sería la experiencia de tus clientes.",finalCta:"Probar solicitud de limpieza",
  salesTitle:"Una landing que se siente como tu negocio",salesText:"Un ejemplo visual con fotografía, reseñas reales aprobadas, áreas de servicio y una reserva fácil de explorar.",
  helper:"Conoce a Sonny, el agente de reservas del demo. Jessy sigue disponible para hablar de The Launch Era.",helperServices:"Probar con Sonny",helperForm:"Ayuda con el formulario",helperAi:"La IA es un servicio adicional",
  welcome:"¡Hola! Soy Sonny 👋 ¿Te ayudo a probar una reserva?",ask:"Hablar con Sonny",separate:"Asistente con IA · complemento opcional; no incluido en la reserva."
}:{
  reviews:"Customer reviews",reviewsSub:"This is where each business's genuine customer reviews appear. The cards below are layout samples, not actual testimonials.",
  reviewBadge:"SAMPLE · REPLACE WITH A REAL REVIEW",
  reviewText:["An approved customer review will appear here.","A second genuine review can highlight the experience.","Add another verified customer comment with permission."],
  areas:"Areas we serve",areasSub:"Service coverage belongs to the business. Its actual cities and ZIP codes personalize this section.",
  areaUnknown:"Service area to be confirmed",serviceArea:"Nearby communities",postcodes:"ZIP coverage",
  why:"FIND YOUR CLEANING",whyTitle:"The right clean for your everyday.",whyCopy:"From a regular refresh to a deeper clean or a move-in reset, explore the service that feels right for your home.",
  whyItems:["Regular cleaning","Deep cleaning","Move-in / move-out"],faq:"Frequently asked questions",faqSub:"Helpful answers before making a cleaning request.",
  faqItems:[["Can I request an estimate?","Yes. In this preview you can try the request process. Prices are illustrative; the business confirms final estimates."],["Can I request recurring cleanings?","The sample includes one-time, weekly, biweekly and monthly choices."],["Does this demo place a real booking?","No. This is an interactive sample; nothing is booked, charged or emailed."],["Can the AI help with the form?","Yes. It can explain services and prepare sample details for your review. AI assistance is an optional service sold separately."]],
  finalTitle:"Ready to give it a try?",finalText:"Explore the services and see how the booking experience can work for your customers.",finalCta:"Try the cleaning request",
  salesTitle:"A website that feels like your business",salesText:"See a visual example with beautiful imagery, verified customer reviews, service areas and a simple booking experience.",
  helper:"Meet Sonny in the interactive booking demo. Jessy still answers questions about The Launch Era.",helperServices:"Try with Sonny",helperForm:"Help with the form",helperAi:"AI is a separate add-on",
  welcome:"Hi! I’m Sonny 👋 Want to try a booking together?",ask:"Chat with Sonny",separate:"AI Assistant · optional separate service, not included in basic booking."
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
  <img src="${kitchen}" alt="Sunlit, freshly cleaned kitchen ready to enjoy" loading="lazy" width="1200" height="820">
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
 const proof=h("section","tle-demo-v12-sales-proof");
 proof.id="tleDemoSalesProof";
 proof.innerHTML='<div><span class="tle-demo-v12-ey">CUSTOMER TRUST</span><h3>'+labels.reviews+'</h3><p>'+labels.reviewsSub+'</p><div class="tle-demo-v12-sales-proofcards"><span>'+labels.reviewBadge+'</span><span>'+labels.reviewBadge+'</span></div></div><div><span class="tle-demo-v12-ey">LOCAL COVERAGE</span><h3>'+labels.areas+'</h3><p>'+labels.areasSub+'</p><span class="tle-demo-v12-sales-local">'+labels.areaUnknown+'</span></div>';
 wrap.appendChild(proof);
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
   const url=new URL("/lead-private-preview.html",location.origin);const business=form.elements.namedItem("business")?.value?.trim();const area=form.elements.namedItem("serviceArea")?.value?.trim();if(business)url.searchParams.set("business",business.slice(0,90));if(area)url.searchParams.set("area",area.slice(0,80));url.searchParams.set("lang",document.querySelector("#language")?.value||"en");url.searchParams.set("sonny","1");location.assign(url.pathname+url.search);
  });
  buttons.appendChild(b);
 });
 const aiNote=h("p","tle-demo-v12-addon",labels.separate);aiNote.id="tleDemoSalesAiNote";aiNote.hidden=true;
 form.prepend(guide,buttons,aiNote);
 const l=document.querySelector("#language");
 l?.addEventListener("change",()=>{
   const isSpanish=l.value==="es";
   const local=isSpanish?{
     helper:"Prueba una reserva con Sonny en el demo interactivo. Jessy sigue disponible para consultas sobre The Launch Era.",
     buttons:["Probar con Sonny","Ayuda con formulario","IA: servicio aparte"],
     note:"El asistente con IA es un servicio opcional que se contrata por separado.",
     title:"Una landing que representa a tu negocio",
     text:"Una demo visual con fotos, reseñas aprobadas, zonas de servicio y un formulario sencillo.",
     review:"Opiniones de clientes",area:"Áreas atendidas",
     reviewInfo:"Diseño de ejemplo; mostrar solo reseñas auténticas y autorizadas.",
     areaInfo:"Las ciudades y códigos ZIP se configuran con cada negocio."
   }:{
     helper:"Try a sample booking with Sonny in the interactive demo. Jessy remains available for questions about The Launch Era.",
     buttons:["Try with Sonny","Help with form","AI: separate service"],
     note:"The AI assistant is an optional service purchased separately.",
     title:"A website that feels like your business",
     text:"A visual preview with photos, approved customer reviews, service areas and a simple form.",
     review:"Customer reviews",area:"Areas we serve",
     reviewInfo:"Design example only; show authentic, authorized reviews.",
     areaInfo:"Cities and ZIP codes are customized for each business."
   };
   const guideText=document.querySelector("#tleDemoFormGuide p");if(guideText)guideText.textContent=local.helper;
   document.querySelectorAll(".tle-demo-v12-formactions button").forEach((b,i)=>b.textContent=local.buttons[i]||b.textContent);
   const note=document.getElementById("tleDemoSalesAiNote");if(note)note.textContent=local.note;
   const title=document.querySelector("#tleDemoSalesExperience h2");if(title)title.textContent=local.title;
   const descr=document.querySelector("#tleDemoSalesExperience .tle-demo-v12-salescopy>p");if(descr)descr.textContent=local.text;
   const proofHeads=document.querySelectorAll("#tleDemoSalesProof h3");if(proofHeads[0])proofHeads[0].textContent=local.review;if(proofHeads[1])proofHeads[1].textContent=local.area;
   const proofParas=document.querySelectorAll("#tleDemoSalesProof p");if(proofParas[0])proofParas[0].textContent=local.reviewInfo;if(proofParas[1])proofParas[1].textContent=local.areaInfo;
 });
}
function customizeChat(){
 if(isProspect){
  const launch=document.querySelector(".tle-ai-launch"),head=document.querySelector(".tle-ai-head"),log=document.querySelector(".tle-ai-log");
  if(!launch||!head||!log)return;
  const v=document.createElement("span");v.className="tle-demo-ai-label";v.textContent=matchMedia("(max-width:700px)").matches?(es?"¡Hola! Soy Sonny 👋":"Hi! I’m Sonny 👋"):labels.ask;
  launch.replaceChildren(avatar(),v);launch.setAttribute("aria-label",labels.ask+" — "+labels.separate);
  head.prepend(avatar());
  const subtitle=head.querySelector("small");if(subtitle)subtitle.textContent=labels.separate;
  const intro=log.querySelector(".tle-ai-msg.bot");
  if(intro)intro.textContent=labels.welcome+" "+(es?"La IA puede ayudarte a preparar una solicitud para revisarla.":"The AI can help prepare a sample request for your review.");
  const chips=h("div","tle-demo-v12-chat-actions");chips.innerHTML=`<button type="button" data-action="services">${labels.helperServices}</button><button type="button" data-action="form">${labels.helperForm}</button><a href="/ai-booking-assistant/">${labels.helperAi} ↗</a>`;
  chips.addEventListener("click",e=>{const btn=e.target.closest("button");if(!btn)return;if(btn.dataset.action==="services"){document.querySelector("#demoServices")?.scrollIntoView({behavior:"smooth"});document.querySelector(".tle-ai-head button")?.click()}else if(btn.dataset.action==="form"){const input=document.querySelector(".tle-ai-form textarea");if(input){input.value=es?"Ayúdame a completar una solicitud de limpieza de ejemplo paso a paso.":"Help me fill out a sample cleaning request step by step.";input.focus()}}});
  log.prepend(chips);
  // One assistant = one launcher. Previous versions created a second floating
  // welcome button which looked like another AI and obscured the mobile page.
  document.getElementById("tleDemoRobotWelcome")?.remove();
  // Only one small Sonny launcher; a temporary dark message pops up beside it.
  // The notification is not another assistant and never opens a chat automatically.
  document.getElementById("tleSonnyInlineHello")?.remove();
  document.getElementById("tleSonnyInlineGreeting")?.remove();
  if(!document.getElementById("tleSonnyGreetingPopup")){
    const popup=h("button","tle-sonny-greeting-popup");
    popup.id="tleSonnyGreetingPopup";
    popup.type="button";
    popup.setAttribute("aria-label",labels.ask);
    popup.textContent=es?"¡Hola! Soy Sonny 👋 ¿Te ayudo a reservar?":"Hi! I'm Sonny 👋 Need help booking?";
    popup.addEventListener("click",()=>{popup.hidden=true;window.tleOpenSonnyDemo?.();});
    document.body.appendChild(popup);
    const dismiss=()=>{popup.hidden=true;};
    launch.addEventListener("click",dismiss,{once:true});
    window.addEventListener("scroll",()=>{if(window.scrollY>90)dismiss();},{passive:true});
    window.setTimeout(dismiss,5200);
    if(window.scrollY>90||document.body.classList.contains("tle-ai-chat-open"))dismiss();
  }
  // Compact from first paint; no full-width CTA-shaped second banner.
  launch.classList.add("tle-demo-condensed");
 }
 // Jessy is unchanged on the sales demo. Sonny operates only in the interactive sample.
}
function addSonnyRetry(){
 if(!isProspect||isLive)return;
 const done=document.querySelector("#done .success");
 if(!done||document.getElementById("tleTrySonny"))return;
 const button=document.createElement("button");button.type="button";button.id="tleTrySonny";button.className="tle-demo-v12-retry";
 button.append(avatar());
 const group=document.createElement("span");group.className="tle-demo-v12-retry-copy";
 const strong=document.createElement("strong");strong.textContent=es?"Volver a probar con Sonny, el agente de reservas":"Try it again with the booking agent";
 const note=document.createElement("small");note.textContent=es?"Sonny te guía desde el inicio · No es una reserva real":"Start over with Sonny · Demo only, no real booking";
 group.append(strong,note);button.append(group);
 button.addEventListener("click",()=>{
   // Start a brand-new sample request without submitting an email, payment or booking.
   window.setCategory?.("residential");
   window.showMain?.();
   const starter=document.getElementById("bookingStarter");
   if(starter){starter.scrollIntoView({block:"start",behavior:"auto"});starter.focus({preventScroll:true});}
   const opened=window.tleOpenSonnyDemo?.({restart:true});
   if(!opened){const launch=document.querySelector(".tle-ai-launch");if(launch&&launch.getAttribute("aria-expanded")==="false")launch.click();}
 });
 const other=done.querySelector(".back");if(other)other.before(button);else done.appendChild(button);
}
function run(){
 if(isProspect){
   document.documentElement.classList.add("tle-demo-story-v13","tle-demo-story-v15");
   addSections();
   // The images follow one visual story: cleaner → careful work → fresh room → home.
   // This edits public sample copy only; buyer/owner pages keep their original UI.
   const story=document.getElementById("demoCinematicStory");
   if(story){
     const title=story.querySelector(".demo-cinematic-copy h2");
     if(title)title.innerHTML=es?"El valor está<br><em>en los detalles.</em>":"The difference<br><em>is in the details.</em>";
     const desc=story.querySelector(".demo-cinematic-copy>p");
     if(desc)desc.textContent=es?"Desde las superficies que usas a diario hasta los rincones que a veces se olvidan.":"From everyday surfaces to the little corners that are easy to miss.";
   }
   addSonnyRetry();customizeChat();
   // Do not auto-open from ?sonny=1: visitor sees the inline greeting first.
 }else addSalesPreview();
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",run,{once:true});else run();
})();
