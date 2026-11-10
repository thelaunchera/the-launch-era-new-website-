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
  // Light 720ms button-to-bag arc. App state remains owned by the storefront.
  function flyDot(button,target,opts={}){
    const badge=opts.badge||target?.querySelector?.('[aria-live], .bag-count, .count');
    const done=()=>{
      try{if(typeof opts.onLand==='function')opts.onLand();}
      finally{pulse(badge||target);}
    };
    if(!button?.isConnected||!target?.isConnected||reduced.matches||active>=12||!document.body.animate){
      done();return Promise.resolve();
    }
    const from=button.getBoundingClientRect();
    const anchor=opts.anchor||target.querySelector?.('svg')||target;
    const to=anchor.getBoundingClientRect();
    if(!from.width||!from.height||!to.width||!to.height){done();return Promise.resolve();}
    const x=from.left+from.width/2,y=from.top+from.height/2;
    const dx=to.left+to.width/2-x,dy=to.top+to.height/2-y;
    const duration=720;
    const arc=Math.max(55,Math.min(190,Math.abs(dx)*.22+Math.abs(dy)*.14));
    const dot=document.createElement('span');
    dot.setAttribute('aria-hidden','true');
    const brandColor=opts.color||getComputedStyle(button).getPropertyValue('--tle-cart-dot-color').trim()||'#F2D85B';
    dot.style.cssText='position:fixed;z-index:2147483001;pointer-events:none;width:12px;height:12px;border-radius:50%;box-shadow:0 3px 12px rgba(0,0,0,.22);will-change:transform,opacity;';
    dot.style.left=(x-6)+'px';dot.style.top=(y-6)+'px';dot.style.backgroundColor=brandColor;
    (opts.portal?.isConnected?opts.portal:document.body).append(dot);active++;
    let animation;
    try{
      animation=dot.animate([
        {transform:'translate3d(0,0,0) scale(.8)',opacity:.96,offset:0},
        {transform:'translate3d('+(dx*.32)+'px,'+(dy*.32-arc)+'px,0) scale(1.3)',opacity:1,offset:.32},
        {transform:'translate3d('+(dx*.72)+'px,'+(dy*.72-arc*.7)+'px,0) scale(.95)',opacity:1,offset:.72},
        {transform:'translate3d('+dx+'px,'+dy+'px,0) scale(.3)',opacity:.4,offset:1}
      ],{duration,easing:'cubic-bezier(.25,.7,.25,1)',fill:'forwards'});
    }catch(e){dot.remove();active--;done();return Promise.resolve();}
    return Promise.race([animation.finished.catch(()=>{}),new Promise(resolve=>setTimeout(resolve,duration+120))])
      .then(()=>{animation.cancel();dot.remove();active--;done();});
  }
  window.TLECartMotion={fly,flyDot};
})();