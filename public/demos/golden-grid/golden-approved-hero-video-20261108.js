/* Golden Grid HD photo-first motion: no low-resolution video requests.
   Only a tiny SVG syrup sheen is toggled on larger visible viewports. */
(()=>{
  const art=document.querySelector('html[data-tle-one-motion="golden-grid"] .hero .hero-art');
  if(!art)return;
  const wide=window.matchMedia('(min-width:761px)');
  const reduced=window.matchMedia('(prefers-reduced-motion:reduce)');
  let visible=true;
  function sync(){
    const active=wide.matches&&!reduced.matches&&visible&&!document.hidden;
    if(active)art.setAttribute('data-gg-sheen-active','');
    else art.removeAttribute('data-gg-sheen-active');
  }
  wide.addEventListener('change',sync);
  reduced.addEventListener('change',sync);
  document.addEventListener('visibilitychange',sync);
  if('IntersectionObserver' in window){
    new IntersectionObserver(([entry])=>{
      visible=Boolean(entry?.isIntersecting);
      sync();
    },{threshold:0}).observe(art);
  }
  sync();
})();
