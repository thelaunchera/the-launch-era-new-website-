/* v19 — small sample-only carousel and gentle rotating blue ribbon.
   All customer reviews remain clearly marked SAMPLE, never fabricated.
   Paid buyer and owner previews are excluded. */
(()=>{
 "use strict";
 const qs=new URLSearchParams(location.search);
 if(location.pathname!=="/lead-private-preview.html"||qs.has("key")||qs.get("owner_preview")==="1"
    ||!document.documentElement.classList.contains("demo-editorial"))return;
 const es=qs.get("lang")==="es";
 const reduce=window.matchMedia("(prefers-reduced-motion: reduce)");
 const block=document.getElementById("tleDemoReviews");
 const track=block?.querySelector(".tle-demo-v12-reviewgrid");
 const cards=track?[...track.querySelectorAll(":scope > article")]:[];
 const finishedPhoto=document.querySelector(".tle-demo-v12-why");
 if(!block||!track||cards.length<2||!finishedPhoto)return;
 document.documentElement.classList.add("tle-demo-motion-v19");
 const heading=block.querySelector(".tle-demo-v12-heading>p");
 if(heading)heading.textContent=es
   ?"Así se verían las reseñas verificadas cuando un negocio las añada. Estas tarjetas son ejemplos."
   :"A place for verified customer feedback when it's available. These cards are samples.";
 track.setAttribute("aria-label",es?"Desliza para ver ejemplos de reseñas":"Swipe to explore review examples");
 track.setAttribute("tabindex","0");
 track.setAttribute("role","region");
 track.setAttribute("aria-roledescription",es?"Carrusel":"Carousel");
 const controls=document.createElement("div");controls.className="tle-review-controls";
 const dots=document.createElement("div");dots.className="tle-review-dots";dots.setAttribute("role","group");dots.setAttribute("aria-label",es?"Seleccionar reseña":"Select a review");
 const arrows=document.createElement("div");arrows.className="tle-review-arrows";
 const prev=document.createElement("button");prev.type="button";prev.textContent="‹";
 prev.setAttribute("aria-label",es?"Reseña anterior":"Previous review");
 const next=document.createElement("button");next.type="button";next.textContent="›";
 next.setAttribute("aria-label",es?"Reseña siguiente":"Next review");
 arrows.append(prev,next);controls.append(dots,arrows);track.after(controls);
 const markers=cards.map((_,i)=>{
   const dot=document.createElement("button");dot.type="button";
   dot.setAttribute("aria-label",(es?"Ver ejemplo ":"View sample ")+(i+1));
   dot.addEventListener("click",()=>jump(i));dots.append(dot);return dot;
 });
 let active=0,carouselVisible=false,busy=false,changeByUser=false;
 const setCurrent=i=>{active=i;markers.forEach((dot,n)=>dot.setAttribute("aria-current",String(n===i)))};
 const jump=(index,auto=false)=>{
   const i=(index+cards.length)%cards.length;
   if(!auto)changeByUser=true;
   setCurrent(i);
   // Use scrollLeft for exact snap alignment: avoids page-level scroll jumps.
   track.scrollTo({left:cards[i].offsetLeft-cards[0].offsetLeft,behavior:reduce.matches?"instant":"smooth"});
 };
 setCurrent(0);
 prev.addEventListener("click",()=>jump(active-1));
 next.addEventListener("click",()=>jump(active+1));
 track.addEventListener("keydown",event=>{
   if(event.key==="ArrowRight"){event.preventDefault();jump(active+1);}
   if(event.key==="ArrowLeft"){event.preventDefault();jump(active-1);}
 });
 let raf=0;
 track.addEventListener("scroll",()=>{
   if(raf)cancelAnimationFrame(raf);
   raf=requestAnimationFrame(()=>{
     let nearest=0,delta=Infinity;
     cards.forEach((card,i)=>{
       const offset=Math.abs(card.offsetLeft-cards[0].offsetLeft-track.scrollLeft);
       if(offset<delta){delta=offset;nearest=i}
     });
     setCurrent(nearest);
   });
 },{passive:true});
 // Beneath the completed-home photograph, not overlaid on any image or CTA.
 const banner=document.createElement("section");
 banner.className="tle-wave-banner";banner.id="tleDemoBlueRibbon";
 banner.setAttribute("aria-label",es?"Mensajes de limpieza":"A fresher home, made simple");
 const inner=document.createElement("div");inner.className="tle-wave-inner";
 const stars=document.createElement("span");stars.className="tle-wave-sparkles";stars.setAttribute("aria-hidden","true");stars.textContent="✦ ✧ ✦";
 const title=document.createElement("strong");title.className="tle-wave-title";
 const detail=document.createElement("span");detail.className="tle-wave-support";
 const smallDots=document.createElement("div");smallDots.className="tle-wave-dots";
 smallDots.setAttribute("role","group");smallDots.setAttribute("aria-label",es?"Mensajes del banner":"Banner messages");
 inner.append(stars,title,detail,smallDots);banner.append(inner);
 finishedPhoto.after(banner);
 const messages=es?[
   ["¿Lista para sentir tu casa más fresca?","Un poquito de cuidado hace una gran diferencia."],
   ["Menos vueltas. Más tiempo para ti.","Explora la limpieza que encaja contigo."],
   ["Una casa limpia se disfruta más.","Todo comienza con una solicitud sencilla."]
 ]:[
   ["Ready for a fresher home?","A little care makes a lovely difference."],
   ["Less back-and-forth. More time for you.","Explore a clean that fits your space."],
   ["Come home to that fresh feeling.","It starts with one simple request."]
 ];
 let bannerIndex=0,bannerVisible=false;
 const showBanner=index=>{
   bannerIndex=(index+messages.length)%messages.length;
   title.textContent=messages[bannerIndex][0];
   detail.textContent=messages[bannerIndex][1];
   [...smallDots.children].forEach((d,i)=>d.setAttribute("aria-current",String(i===bannerIndex)));
 };
 messages.forEach((_,i)=>{
   const dot=document.createElement("button");dot.type="button";
   dot.setAttribute("aria-label",(es?"Ver mensaje ":"Show message ")+(i+1));
   dot.addEventListener("click",()=>showBanner(i));
   smallDots.append(dot);
 });
 showBanner(0);
 // Do not automatically change content when off-screen, tab hidden, hover/focus,
 // the visitor has interacted, or the OS requests reduced motion.
 const onScreen=new IntersectionObserver(entries=>{
   for(const entry of entries){
     if(entry.target===block)carouselVisible=entry.isIntersecting;
     if(entry.target===banner)bannerVisible=entry.isIntersecting;
   }
 },{threshold:.25});
 onScreen.observe(block);onScreen.observe(banner);
 const canAnimate=()=>!reduce.matches&&!document.hidden&&!document.body.classList.contains("tle-ai-chat-open");
 const idle=node=>!node.matches(":hover")&&!node.contains(document.activeElement);
 window.setInterval(()=>{
   if(carouselVisible&&canAnimate()&&idle(block)&&!changeByUser)jump(active+1,true);
 },5600);
 window.setInterval(()=>{
   if(bannerVisible&&canAnimate()&&idle(banner))showBanner(bannerIndex+1);
 },4700);
 // Touch swipes are native, not intercepted: no third-party dependency.
})();
