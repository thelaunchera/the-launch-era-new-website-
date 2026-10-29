/* Adapted from existing Casa Brownie reveal/photo-pop motion in this repository.
   No analytics, requests, storage, contact info or artificial navigation. */
(() => {
  'use strict';
  // Self-hosted fallback keeps the booking usable if a licensed stock-image CDN is blocked.
  document.querySelectorAll('.service-card img[data-fallback]').forEach(img=>{
    img.addEventListener('error',()=>{
      const fallback=img.dataset.fallback;
      if(fallback && img.getAttribute('src')!==fallback){
        img.src=fallback;
      }
    },{once:true});
  });
  const reduce=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const saveData=window.navigator?.connection?.saveData;
  if(reduce||saveData||!('IntersectionObserver' in window)) return;
  const selectors=['.experience .section-heading','.window-head','.booking-category','.owner .section-heading','.owner-dashboard','.offer-copy'];
  const nodes=[...document.querySelectorAll(selectors.join(','))];
  // Enhance only after identifying nodes, so the static site always remains usable.
  nodes.forEach(node=>node.setAttribute('data-tle-reveal',''));
  document.documentElement.classList.add('tle-clean-motion-ready');
  const observer=new IntersectionObserver(entries=>{
    for(const e of entries){
      if(e.isIntersecting){
        e.target.classList.add('tle-clean-in-view');
        observer.unobserve(e.target);
      }
    }
  },{rootMargin:'0px 0px -6% 0px',threshold:.07});
  nodes.forEach(node=>observer.observe(node));
})();