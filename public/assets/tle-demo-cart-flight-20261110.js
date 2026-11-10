/* The Launch Era: brand-friendly fly-to-bag effect.
   Decorative only: existing demo cart code owns product data and state. */
(function(){
  'use strict';
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  let active=0;
  function pulse(target){
    if(reduced.matches||!target?.isConnected||!target.animate)return;
    target.animate(
      [{transform:'scale(1)'},{transform:'scale(1.12)'},{transform:'scale(1)'}],
      {duration:320,easing:'ease-out'}
    );
  }
  function fly(image,target,opts={}){
    if(reduced.matches||!image?.isConnected||!target?.isConnected||!image.animate||active>=3){
      pulse(target);
      return Promise.resolve();
    }
    const origin=image.getBoundingClientRect();
    const dest=target.getBoundingClientRect();
    if(origin.width<10||origin.height<10||dest.width<5||dest.height<5){
      pulse(target);
      return Promise.resolve();
    }
    const src=image.currentSrc||image.src;
    if(!src){pulse(target);return Promise.resolve();}
    const ghost=document.createElement('img');
    ghost.src=src;
    ghost.alt='';
    ghost.setAttribute('aria-hidden','true');
    ghost.style.cssText='position:fixed;inset:auto;z-index:2147483000;pointer-events:none;user-select:none;object-fit:cover;border-radius:18px;box-shadow:0 14px 40px rgba(0,0,0,.14);';
    ghost.style.left=origin.left+'px';
    ghost.style.top=origin.top+'px';
    ghost.style.width=origin.width+'px';
    ghost.style.height=origin.height+'px';
    document.body.append(ghost);
    active++;
    const dx=dest.left+dest.width/2-(origin.left+origin.width/2);
    const dy=dest.top+dest.height/2-(origin.top+origin.height/2);
    const duration=Math.max(300,Math.min(850,Number(opts.duration)||610));
    const animation=ghost.animate(
      [{transform:'translate3d(0,0,0) scale(1) rotate(0deg)',opacity:1,offset:0},
       {transform:'translate3d('+(dx*.68)+'px,'+(dy*.6)+'px,0) scale(.57) rotate(-6deg)',opacity:.92,offset:.64},
       {transform:'translate3d('+dx+'px,'+dy+'px,0) scale(.12) rotate(10deg)',opacity:.1,offset:1}],
      {duration,easing:'cubic-bezier(.2,.8,.2,1)',fill:'forwards'}
    );
    // A suspended WebKit animation must never block the underlying sample cart.
    const done=Promise.race([
      animation.finished.catch(()=>{}),
      new Promise(resolve=>setTimeout(resolve,duration+160))
    ]);
    return done.then(()=>{animation.cancel();ghost.remove();active--;pulse(target);});
  }
  window.TLECartMotion={fly};
})();