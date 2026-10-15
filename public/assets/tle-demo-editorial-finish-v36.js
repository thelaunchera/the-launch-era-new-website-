/* v36 — cinematic comparisons, honest rotating review ribbon, finishing order.
   Public fictional demo ONLY. Preserve booking, customer data and policy handlers. */
(()=>{
"use strict";
const params=new URLSearchParams(location.search);
if(location.pathname!=="/lead-private-preview.html"||params.has("key")||params.get("owner_preview")==="1")return;
function init(){
  if(!document.documentElement.classList.contains("demo-editorial"))return;
  const footer=document.querySelector("footer.demo-footer.tle-demo-compact-footer");
  const compare=document.getElementById("tleV31Transformations");
  const reviews=document.getElementById("tleDemoReviews");
  const areas=document.getElementById("tleDemoAreas");
  if(!footer||!compare||!reviews||!areas||reviews.classList.contains("tle-v36-reviews"))return;
  document.documentElement.classList.add("tle-demo-v36");
  const es=params.get("lang")==="es";
  // Preserve all existing chapters: place FAQ and booking CTA BEFORE photos.
  // Finish exactly with before/after -> reviews -> service areas -> contact ->
  // legal footer -> thank you, without any other chapter between them.
  const faq=document.getElementById("tleDemoFaq");
  const finalBooking=document.querySelector(".tle-demo-v12-end");
  if(faq)compare.before(faq);
  if(finalBooking)compare.before(finalBooking);
  footer.before(compare,reviews,areas);
  const compareTitle=compare.querySelector("h2");
  if(compareTitle)compareTitle.textContent=es?"Mira la diferencia.":"See the difference.";
  const compareIntro=compare.querySelector(".tle-v31-gallery-top p");
  if(compareIntro)compareIntro.textContent=es
    ?"Dos momentos, un mismo espacio. Desliza para comparar."
    :"A closer look at the little details. Swipe to compare.";
  const compareRail=document.getElementById("tleV31GalleryRail");
  if(compareRail){
    compareRail.setAttribute("aria-roledescription",es?"Galería de comparaciones":"Comparison gallery");
    compareRail.querySelectorAll(".tle-v31-gallery-card").forEach((card,i)=>{
      card.dataset.pair=String(i+1).padStart(2,"0");
    });
  }
  // Do not falsely present invented customer stories as verified testimonials.
  // These are visually realistic placeholder examples, clearly disclosed.
  reviews.classList.add("tle-v36-reviews");
  reviews.querySelector(".tle-demo-v12-reviewgrid")?.remove();
  reviews.querySelector(".tle-review-controls")?.remove();
  const title=reviews.querySelector("#tleReviewsTitle");
  if(title)title.textContent=es?"Palabras que inspiran confianza.":"Kind words make a difference.";
  const eyebrow=reviews.querySelector(".tle-demo-v12-ey");
  if(eyebrow)eyebrow.textContent=es?"OPINIONES · VISTA DE EJEMPLO":"REVIEWS · DESIGN PREVIEW";
  const info=reviews.querySelector(".tle-demo-v12-heading p");
  if(info)info.textContent=es
    ?"Diseño de reseñas ilustrativo. Los comentarios y calificaciones son ejemplos, no opiniones de clientes reales."
    :"Illustrative review layout. Quotes and ratings below are examples, not real customer feedback.";
  const examples=es?[
    ["«Se notó el cuidado en cada rincón. La casa se sentía tranquila y fresca».","01"],
    ["«Todo fue muy claro desde que pedí información. Una experiencia sencilla».","02"],
    ["«Los detalles marcaron la diferencia. Exactamente la sensación que esperaba».","03"],
    ["«Me gustó poder explicar mis necesidades sin tantos mensajes».","04"]
  ]:[
    ["“Every little detail felt considered. The house looked beautifully refreshed.”","01"],
    ["“The process felt simple from the first request. Clear and easy to follow.”","02"],
    ["“It’s the small touches that make coming home feel so good.”","03"],
    ["“I loved how easy it was to explain what my space needed.”","04"]
  ];
  const viewport=document.createElement("div");
  viewport.className="tle-v36-review-viewport";
  viewport.setAttribute("role","region");
  viewport.setAttribute("aria-label",es?"Ejemplos ilustrativos de reseñas":"Illustrative review carousel");
  viewport.setAttribute("aria-roledescription",es?"Carrusel automático":"Auto-advancing carousel");
  viewport.tabIndex=0;
  const track=document.createElement("div");
  track.className="tle-v36-review-track";
  const makeCard=([quote,num])=>{
    const card=document.createElement("article");card.className="tle-v36-review-card";
    const heading=document.createElement("div");heading.className="tle-v36-review-header";
    const avatar=document.createElement("span");avatar.className="tle-v36-review-avatar";
    avatar.setAttribute("aria-hidden","true");avatar.textContent="✿";
    const identity=document.createElement("div");identity.className="tle-v36-review-identity";
    const name=document.createElement("strong");name.textContent=es?"Reseña de ejemplo "+num:"Sample review "+num;
    const secondary=document.createElement("small");secondary.textContent=es?"Contenido ilustrativo":"Illustrative content";
    identity.append(name,secondary);
    const stars=document.createElement("span");stars.className="tle-v36-review-stars";
    stars.setAttribute("aria-label",es?"Calificación de ejemplo":"Illustrative rating");
    stars.textContent="★★★★★";
    heading.append(avatar,identity,stars);
    const body=document.createElement("p");body.textContent=quote;
    const note=document.createElement("small");note.className="tle-v36-review-disclosure";
    note.textContent=es?"EJEMPLO · NO VERIFICADO":"SAMPLE · NOT VERIFIED";
    card.append(heading,body,note);
    return card;
  };
  examples.forEach(example=>track.append(makeCard(example)));
  // The cloned first card makes the last-to-first wrap look continuous.
  const clone=makeCard(examples[0]);clone.setAttribute("aria-hidden","true");
  clone.setAttribute("inert","");track.append(clone);
  viewport.append(track);
  reviews.append(viewport);
  const footerNote=document.createElement("p");footerNote.className="tle-v36-reviews-note";
  footerNote.textContent=es
    ?"Las empresas deben reemplazar estos ejemplos por reseñas auténticas y autorizadas antes de publicar."
    :"Actual businesses replace these samples with genuine, permissioned reviews before launch.";
  reviews.append(footerNote);
  const cards=[...track.children],realCount=examples.length;
  let active=0,inView=false,resetting=false,lastTouch=0;
  const reduce=matchMedia("(prefers-reduced-motion: reduce)");
  const leftFor=i=>cards[i].offsetLeft-cards[0].offsetLeft;
  const go=(i,smooth=true)=>{
    active=i;viewport.scrollTo({left:leftFor(i),behavior:smooth&&!reduce.matches?"smooth":"instant"});
  };
  const observer=("IntersectionObserver" in window)?new IntersectionObserver(entries=>{
    inView=entries.some(entry=>entry.isIntersecting&&entry.intersectionRatio>.1);
  },{threshold:[0,.15,.5]}):null;
  if(observer)observer.observe(reviews);else inView=true;
  viewport.addEventListener("pointerdown",()=>lastTouch=Date.now(),{passive:true});
  viewport.addEventListener("touchstart",()=>lastTouch=Date.now(),{passive:true});
  viewport.addEventListener("scroll",()=>{
    if(resetting||Date.now()-lastTouch>3500)return;
    let nearest=0,delta=Infinity;
    for(let i=0;i<realCount;i++){const d=Math.abs(viewport.scrollLeft-leftFor(i));if(d<delta){delta=d;nearest=i;}}
    active=nearest;
  },{passive:true});
  window.setInterval(()=>{
    if(!inView||document.hidden||reduce.matches||document.documentElement.classList.contains("tle-demo-booking-active")||
       document.body.classList.contains("tle-ai-chat-open")||Date.now()-lastTouch<5500||
       viewport.contains(document.activeElement))return;
    if(active<realCount-1){go(active+1);return;}
    go(realCount);
    window.setTimeout(()=>{
      if(!viewport.isConnected)return;
      resetting=true;go(0,false);
      requestAnimationFrame(()=>resetting=false);
    },900);
  },3900);
  // The sample area must not impersonate an actual company's coverage.
  if(!params.has("area")&&!params.has("business")&&!params.has("rid")){
    const tagBox=areas.querySelector("#tleDemoAreaTags");
    if(tagBox){
      tagBox.replaceChildren();
      const cityNames=["Miami","Coral Gables","Coconut Grove","Doral","Miami Beach","Kendall"];
      for(const city of cityNames){const tag=document.createElement("span");tag.textContent=city;tagBox.append(tag);}
    }
    const areaIntro=areas.querySelector("p");
    if(areaIntro)areaIntro.textContent=es
      ?"Zonas ilustrativas de Miami para mostrar cómo se vería la cobertura del negocio."
      :"Example Miami neighborhoods showing how a cleaning company's service area can appear.";
  }
  const footerContact=footer.querySelector("#demoContact.tle-mini-contact");
  if(footerContact){
    footerContact.open=true;
    const contactChapter=document.createElement("section");contactChapter.id="tleV36Contact";
    contactChapter.className="tle-v36-contact";
    const overline=document.createElement("span");overline.className="tle-v36-kicker";
    overline.textContent=es?"EN CONTACTO":"LET'S CONNECT";
    const h2=document.createElement("h2");h2.textContent=es?"Estamos aquí para ayudarte.":"A little care goes a long way.";
    const p=document.createElement("p");p.textContent=es
      ?"Así se verían los datos de contacto de un negocio. Los de Luna Bloom son ficticios."
      :"A welcoming contact section. Luna Bloom's details here are fictional preview information.";
    contactChapter.append(overline,h2,p,footerContact);
    footer.before(contactChapter);
  }
  const footerNav=footer.querySelector(".tle-mini-footer-links");
  const more=footer.querySelector(".tle-mini-more");
  if(footerNav&&more){
    more.querySelectorAll("a").forEach(link=>footerNav.insertBefore(link,more));
    more.remove();
    footerNav.setAttribute("aria-label",es?"Información legal y políticas":"Legal information and policies");
    const legalTitle=document.createElement("strong");legalTitle.className="tle-v36-footer-legal-title";
    legalTitle.textContent=es?"Información legal":"Legal & policies";
    footerNav.prepend(legalTitle);
  }
  // Last closing chapter comes AFTER legal footer, never between reviews and areas.
  const goodbye=document.createElement("section");
  goodbye.className="tle-v36-goodbye";goodbye.id="tleDemoThankYou";
  const flower=document.createElement("div");flower.className="tle-v36-goodbye-flower";
  flower.setAttribute("aria-hidden","true");flower.textContent="✿";
  const h2=document.createElement("h2");h2.textContent=es?"Gracias por elegirnos.":"Thank you for choosing us.";
  const subtitle=document.createElement("p");subtitle.textContent=es
    ?"Los hogares más bonitos comienzan con pequeños detalles."
    :"Here's to brighter spaces and the feeling of coming home.";
  const fine=document.createElement("small");fine.textContent=es
    ?"Sitio de demostración · no se ha realizado ninguna reserva."
    :"Design preview · no cleaning service has been booked.";
  goodbye.append(flower,h2,subtitle,fine);footer.after(goodbye);
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();