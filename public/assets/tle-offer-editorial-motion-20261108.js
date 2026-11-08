/* Lightweight editorial offer motion. Zero dependencies or network calls.
   Applies only to the two public Website for Your Business marketing pages;
   does not alter demo gallery URLs, pricing, Stripe or live buyer workflows. */
(()=>{
 "use strict";
 const root=document.querySelector(".tle-universal");
 const marketing=document.querySelector(".hero.hero-gallery#inicio");
 if(!root||!marketing||!document.querySelector(".pricing#paquetes"))return;
 const reduce=window.matchMedia("(prefers-reduced-motion: reduce)");
 const targets=Array.from(document.querySelectorAll([
  ".features .feature",
  ".owner-experience-copy",
  ".pricing .section-title",
  ".pricing .website-format-choice",
  ".pricing .plan",
  ".process .section-title",
  ".process .step",
  ".faq .section-title",
  ".faq details"
 ].join(","))).filter(el=>root.contains(el));
 const owner=document.querySelector(".owner-experience");
 if(owner)targets.push(owner);
 const show=el=>el.classList.add("tle-offer-visible");
 if(reduce.matches||!("IntersectionObserver" in window)){
  targets.forEach(show);
  return;
 }
 const observer=new IntersectionObserver(entries=>{
  for(const entry of entries){
   if(entry.isIntersecting){
    show(entry.target);
    observer.unobserve(entry.target);
   }
  }
 },{threshold:.08,rootMargin:"0px 0px -9% 0px"});
 targets.forEach(el=>{
  if(el.getBoundingClientRect().top<window.innerHeight*.9)show(el);
  else observer.observe(el);
 });
 // Activate only after targets are registered, to keep the page usable if JS
 // fails, is disabled or a slow connection delays this script.
 document.documentElement.classList.add("tle-offer-motion");
 const onReduce=event=>{
  if(event.matches){
   observer.disconnect();
   targets.forEach(show);
   document.documentElement.classList.remove("tle-offer-motion");
  }
 };
 if(typeof reduce.addEventListener==="function")reduce.addEventListener("change",onReduce,{once:true});
})();
