/* The Launch Era | interactive typography pilot inspired by BrewedOps effects.
   Original, dependency-free implementation; no hero, form or checkout touched. */
(() => {
  'use strict';
  const targets=[...document.querySelectorAll('[data-tle-text-effect]')];
  if(!targets.length || !('IntersectionObserver' in window))return;
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)');
  const states=new Map(targets.map(el=>[el,{active:false,done:false,frame:0,layer:null}]));
  const letters='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const maxDuration=900;
  function clear(el){
    const state=states.get(el);if(!state)return;
    if(state.frame)cancelAnimationFrame(state.frame);
    state.frame=0;state.layer?.remove();state.layer=null;
    el.classList.remove('tle-text-active');
    state.active=false;state.done=false;
  }
  function start(el){
    const state=states.get(el);
    if(!state||reduce.matches||document.hidden||state.active)return;
    const full=el.textContent.trim();
    if(!full||full.length>90)return;
    state.active=true;state.done=false;
    const ink=getComputedStyle(el).color;
    const layer=document.createElement('span');
    layer.className='tle-text-effect-layer';
    layer.setAttribute('aria-hidden','true');
    layer.style.color=ink;
    const effect=el.dataset.tleTextEffect;
    if(effect==='typewriter')layer.classList.add('tle-text-effect-caret');
    el.append(layer);state.layer=layer;
    el.classList.add('tle-text-active');
    let began=null, lastTick=-1;
    function draw(now){
      if(!state.active||reduce.matches||!layer.isConnected)return;
      if(began===null)began=now;
      const progress=Math.min(1,(now-began)/maxDuration);
      const tick=Math.floor((now-began)/40);
      if(tick!==lastTick){
        lastTick=tick;
        const settled=Math.min(full.length,Math.floor(progress*full.length));
        if(effect==='scramble'){
          layer.textContent=[...full].map((char,i)=>
            i<settled||/[^a-zA-Z0-9]/.test(char)?char:letters[(i*13+tick*7)%letters.length]
          ).join('');
        }else{
          layer.textContent=full.slice(0,settled);
        }
      }
      if(progress<1)state.frame=requestAnimationFrame(draw);
      else{
        layer.textContent=full;
        state.done=true;state.frame=0;
        // Keep the real semantic text intact and remove the temporary overlay.
        layer.remove();state.layer=null;el.classList.remove('tle-text-active');
      }
    }
    state.frame=requestAnimationFrame(draw);
  }
  function inView(el){const r=el.getBoundingClientRect();return r.height>0&&r.top<innerHeight*.90&&r.bottom>innerHeight*.10;}
  const watcher=new IntersectionObserver(entries=>{
    for(const entry of entries){
      if(entry.isIntersecting&&entry.intersectionRatio>.35)start(entry.target);
      else if(!entry.isIntersecting||entry.intersectionRatio<.15)clear(entry.target);
    }
  },{threshold:[0,.15,.36,.65,1],rootMargin:'0px 0px -6% 0px'});
  for(const el of targets)watcher.observe(el);
  // The demos translate into EN/ES. Remove the overlay before language updates.
  document.addEventListener('click',event=>{
    if(!event.target.closest?.('[data-lang],#langToggle'))return;
    for(const el of targets)clear(el);
    requestAnimationFrame(()=>{if(!reduce.matches)for(const el of targets)if(inView(el))start(el)});
  },true);
  reduce.addEventListener?.('change',()=>{
    for(const el of targets)clear(el);
    if(!reduce.matches)for(const el of targets)if(inView(el))start(el);
  });
  document.addEventListener('visibilitychange',()=>{if(document.hidden)for(const el of targets)clear(el)});
})();
