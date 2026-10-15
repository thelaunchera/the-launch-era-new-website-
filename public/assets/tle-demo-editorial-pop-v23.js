/* The Launch Era sample demo v23 — ivory editorial service guide, scroll-pop photography.
 * Public, unkeyed demonstration only. The hero photo, service-card thumbnails,
 * tenant content, booking data and original handlers are intentionally untouched.
 */
(()=>{
 "use strict";
 const q=new URLSearchParams(location.search);
 if(!/\/lead-private-preview\.html$/.test(location.pathname)||q.has("key")||q.get("owner_preview")==="1")return;
 const init=()=>{
   if(!document.documentElement.classList.contains("demo-editorial"))return;
   const why=document.querySelector(".tle-demo-v12-why");
   const content=why?.querySelector(".tle-demo-v12-copy");
   const perks=why?.querySelector(".tle-demo-v12-perks");
   const reviews=document.getElementById("tleDemoReviews");
   if(!why||!content||!perks||!reviews||why.classList.contains("tle-editorial-why-v23"))return;
   const es=q.get("lang")==="es";
   document.documentElement.classList.add("tle-editorial-v23");
   why.classList.add("tle-editorial-why-v23");
   const title=content.querySelector("#tleWhyTitle");
   if(title)title.innerHTML=es
     ?'Una limpieza <br>para <em>cada momento.</em>'
     :'The right clean <br>for <em>your everyday.</em>';
   const copy=content.querySelector("p");
   if(copy)copy.textContent=es
     ?"Desde una limpieza regular hasta una más profunda o para una mudanza, elige lo que mejor se adapta a tu hogar."
     :"From a regular refresh to a deeper clean or a move-in reset, explore the service that feels right for your home.";
   const options=es?[
     ["Limpieza regular","UN HOGAR FRESCO Y CUIDADO"],
     ["Limpieza profunda","UNA LIMPIEZA MÁS COMPLETA"],
     ["Mudanza / cambio de hogar","UN NUEVO COMIENZO"]
   ]:[
     ["Regular cleaning","A FRESH, HEALTHY HOME"],
     ["Deep cleaning","A MORE THOROUGH RESET"],
     ["Move-in / move-out","A CLEAN START, EVERY TIME"]
   ];
   const icons=[
     '<path d="m3 11 9-7 9 7v9h-6v-6H9v6H3z"/><path d="M19 3v4m-2-2h4"/>',
     '<path d="m12 3 2.4 6.6L21 12l-6.6 2.4L12 21l-2.4-6.6L3 12l6.6-2.4z"/>',
     '<path d="m3 7 9-4 9 4v10l-9 4-9-4z"/><path d="m3 7 9 5 9-5M12 12v9"/>'
   ];
   perks.replaceChildren();
   options.forEach(([name,detail],i)=>{
     const link=document.createElement("a");
     link.className="tle-editorial-service-link";
     link.href="#bookingStarter";
     link.dataset.serviceIndex=String(i);
     const symbol=document.createElement("span");symbol.className="tle-editorial-icon";
     symbol.setAttribute("aria-hidden","true");
     symbol.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round">'+icons[i]+'</svg>';
     const words=document.createElement("span");words.className="tle-editorial-service-words";
     const strong=document.createElement("strong");strong.textContent=name;
     const small=document.createElement("small");small.textContent=detail;
     words.append(strong,small);
     const arrow=document.createElement("span");arrow.className="tle-editorial-chevron";
     arrow.setAttribute("aria-hidden","true");arrow.textContent="›";
     link.append(symbol,words,arrow);
     link.addEventListener("click",event=>{
       // Reuse the existing demo option and its original click handler.
       // No new booking logic, prices, requests or integrations.
       const button=[...document.querySelectorAll("#residentialServiceList > button.service")][i];
       if(!button)return; // plain anchor fallback still works
       event.preventDefault();button.click();
     });
     perks.append(link);
   });
   const cue=document.createElement("div");
   cue.className="tle-editorial-scroll-cue";
   cue.setAttribute("aria-hidden","true");
   const caption=document.createElement("span");
   caption.textContent=es?"FOTOS QUE COBRAN VIDA AL DESLIZAR":"PHOTOS COME ALIVE AS YOU SCROLL";
   const chevron=document.createElement("span");
   chevron.className="tle-editorial-scroll-down";chevron.textContent="⌄";
   cue.append(caption,chevron);
   content.append(cue);
   // Two large editorial photographs continue the story, with no additional
   // hero photos and no photos in the tiny service-action pills.
   const gallery=document.createElement("section");
   gallery.id="tleDemoEditorialGallery";
   gallery.className="tle-editorial-gallery-v23";
   gallery.setAttribute("aria-label",es?"Espacios limpios que inspiran":"Beautiful clean spaces");
   const pictures=[
     {
       src:"/assets/lead-demo/sunroom.png",
       alt:es?"Sala luminosa y acogedora con plantas":"Inviting, sunlit living room with green plants",
       heading:es?["Hogares que","se sienten tuyos."]:["Homes that","feel like you."],
       subtitle:es?"ESPACIOS CUIDADOS PARA DISFRUTAR":"BEAUTIFULLY CLEAN SPACES FOR BRIGHTER DAYS"
     },
     {
       src:"/assets/lead-demo/poolside-living.png",
       alt:es?"Sala moderna y relajante con luz natural":"Relaxed, sunlit modern living space",
       heading:es?["Espacios para","volver a disfrutar."]:["A little more room","to feel at home."],
       subtitle:es?"EL ENCANTO DE UN HOGAR FRESCO":"A FRESH SPACE, A CALMER DAY"
     }
   ];
   pictures.forEach((item,i)=>{
     const figure=document.createElement("figure");
     figure.className="tle-editorial-photo-card tle-pop-on-scroll";
     figure.dataset.galleryIndex=String(i);
     const image=document.createElement("img");image.src=item.src;
     image.loading="lazy";image.decoding="async";image.width=1200;image.height=820;
     image.alt=item.alt;
     const overlay=document.createElement("figcaption");
     overlay.className="tle-editorial-photo-caption";
     const heading=document.createElement("strong");heading.className="tle-editorial-photo-title";
     heading.append(document.createTextNode(item.heading[0]+" "));
     const em=document.createElement("em");em.textContent=item.heading[1];heading.append(em);
     const subtitle=document.createElement("span");subtitle.className="tle-editorial-photo-sub";subtitle.textContent=item.subtitle;
     const cta=document.createElement("a");cta.href="#bookingStarter";
     cta.setAttribute("aria-label",es?"Explorar reserva de limpieza":"Explore cleaning booking");
     cta.textContent="→";cta.className="tle-editorial-gallery-arrow";
     overlay.append(heading,subtitle,cta);
     figure.append(image,overlay);gallery.append(figure);
   });
   why.after(gallery);
   // Big editorial media only: hero and service thumbnails are excluded.
   const targets=[
     ...gallery.querySelectorAll(".tle-editorial-photo-card"),
     document.querySelector("#demoCinematicStory .demo-cinematic-photo"),
     document.querySelector("#demoHow .demo-bottom-photo"),
     document.querySelector("#demoServices .demo-showcase-photo"),
     document.querySelector("#tleDemoAreas>img"),
     why.querySelector(":scope > img")
   ].filter(Boolean);
   const motion=window.matchMedia("(prefers-reduced-motion: reduce)");
   if(motion.matches||!("IntersectionObserver" in window)){
     targets.forEach(target=>target.classList.add("tle-pop-on-scroll","tle-pop-visible"));
     return;
   }
   const observer=new IntersectionObserver(entries=>{
     entries.forEach(entry=>{
       if(!entry.isIntersecting)return;
       entry.target.classList.add("tle-pop-visible");
       observer.unobserve(entry.target);
     });
   },{threshold:.12,rootMargin:"0px 0px -4% 0px"});
   targets.forEach(target=>{
     target.classList.add("tle-pop-on-scroll","tle-pop-prepared");
     observer.observe(target);
   });
 };
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});
 else init();
})();
