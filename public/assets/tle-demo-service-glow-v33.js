/* v33 — sample-only finishing order and viewport spotlight for service cards.
   Keep existing booking handlers, sample disclosures, bubbles and footer intact. */
(()=>{
  "use strict";
  const query=new URLSearchParams(location.search);
  if(location.pathname!=="/lead-private-preview.html" ||
     query.has("key") || query.get("owner_preview")==="1")return;
  function init(){
    if(!document.documentElement.classList.contains("demo-editorial"))return;
    const residential=document.getElementById("residentialServiceList");
    const commercial=document.getElementById("commercialServiceList");
    const footer=document.querySelector("footer.demo-footer");
    if(!residential||!commercial||!footer)return;
    document.documentElement.classList.add("tle-demo-v33");
    // Keep all existing chapters/bubble layers in place, then close with
    // Before & After, followed by customer reviews, and finally the footer.
    const transformations=document.getElementById("tleV31Transformations");
    const reviews=document.getElementById("tleDemoReviews");
    if(transformations&&reviews){
      footer.before(transformations,reviews);
    }
    const cards=[...residential.querySelectorAll(":scope > button.service"),
                 ...commercial.querySelectorAll(":scope > button.service")];
    if(!("IntersectionObserver" in window)){
      cards.forEach(card=>card.classList.add("tle-v33-seen"));
      return;
    }
    const visible=new Map();
    const reduced=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const observer=new IntersectionObserver(entries=>{
      for(const entry of entries){
        const ratio=entry.isIntersecting?entry.intersectionRatio:0;
        visible.set(entry.target,ratio);
        if(ratio>.12||reduced)entry.target.classList.add("tle-v33-seen");
      }
      let best=null,score=.2;
      for(const [card,ratio] of visible){
        if(ratio>score && card.getClientRects().length){
          score=ratio;best=card;
        }
      }
      for(const card of cards)card.classList.toggle("tle-v33-focus",card===best&&!reduced);
    },{threshold:[0,.12,.25,.4,.6,.8],rootMargin:"-8% 0px -8% 0px"});
    cards.forEach(card=>observer.observe(card));
    document.addEventListener("visibilitychange",()=>{
      if(document.hidden)cards.forEach(card=>card.classList.remove("tle-v33-focus"));
    });
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});
  else init();
})();
