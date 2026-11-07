/* The Launch Era — original gallery motions, Nov 2026.
   Progressive enhancement only: approved photos, links, filters, lightboxes and
   brand animations stay owned by their original pages. No cloned image nodes. */
(() => {
  'use strict';
  const path=location.pathname.toLowerCase();
  const contexts=[
    {path:/\/demos\/havana-19\//,selector:'.gallery-grid.gallery-unique',mode:'duet',interval:4700},
    {path:/\/demos\/ivory-and-bloom\//,selector:'#cake-gallery .cake-grid',mode:'filmstrip',interval:4400},
    {path:/\/demos\/lavender-edit\//,selector:'#gallery .look-grid',mode:'stack',interval:5500},
    {path:/\/demos\/la-vie-in-pink\//,selector:'.gallery-section .gallery-grid',mode:'accordion',interval:4900},
    {path:/\/demos\/marea-wigs-miami\//,selector:'#editorial-track',mode:'native-rail',interval:5100},
    {path:/\/demos\/crumb\//,selector:'#crumb-gallery-track',mode:'original-dots',interval:6200},
    {path:/\/yummm\/|\/demos\/yummm\//,selector:'.moments-grid',mode:'triptych',interval:4900},
    {path:/\/seasonal-brew\/|\/demos\/seasonal-brew\//,selector:'.moments-gallery',mode:'duet',interval:5900},
    {path:/\/soluna-yoga\/|\/demos\/soluna-yoga\//,selector:'.studio-gallery-grid',mode:'filmstrip',interval:6300},
    {path:/\/wok-social\/|\/demos\/wok-social\//,selector:'.moments-grid',mode:'accordion',interval:4800}
  ];
  const cfg=contexts.find(x=>x.path.test(path));
  if(!cfg)return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const initialized=new WeakSet();
  const timers=new Map();
  const t=()=>{
    const es=document.documentElement.lang.toLowerCase().startsWith('es');
    return es ? {before:'Anterior',after:'Siguiente',count:'Foto',controls:'Controles de la galería',name:'Galería interactiva'} :
      {before:'Previous',after:'Next',count:'Photo',controls:'Gallery navigation',name:'Interactive gallery'};
  };
  function mount(el) {
    if(initialized.has(el))return;
    const cards=Array.from(el.children).filter(node=>node.nodeType===1 && (node.matches('figure,article,button,.gallery-photo')||node.classList.contains('editorial-card')));
    const real=cfg.mode==='original-dots' ? Array.from(el.querySelectorAll('figure')) : cards.filter(node=>node.matches('figure,article,button,.gallery-photo')||node.classList.contains('editorial-card'));
    if(real.length<2)return;
    initialized.add(el);
    el.classList.add('tle-motion-gallery','tle-motion-'+cfg.mode);
    el.setAttribute('role','region');
    el.setAttribute('aria-roledescription',t().name);
    let index=0,dir=1,visible=typeof IntersectionObserver==='undefined',holdUntil=0,drag=null,toolbar=null,readout=null,autoDot=false;
    const io=typeof IntersectionObserver==='undefined' ? null :
      new IntersectionObserver(entries=>{visible=!!entries[0]?.isIntersecting;},{threshold:0.15});
    io?.observe(el);
    const isInactive=()=>reduced.matches||!visible||document.hidden||Date.now()<holdUntil||
      el.matches(':hover')||el.contains(document.activeElement)||(toolbar&&(toolbar.matches(':hover')||toolbar.contains(document.activeElement)))||
      !!document.querySelector('dialog[open],[role=dialog][aria-modal=true]:not([hidden])');
    const available=()=>real.filter(n=>n.isConnected && !n.hidden && getComputedStyle(n).display!=='none');
    function paint(){
      if(cfg.mode==='original-dots'||cfg.mode==='native-rail')return;
      const shown=available();
      if(!shown.length)return;
      index=(index+shown.length)%shown.length;
      shown.forEach((card,i)=>{
        card.classList.toggle('tle-spot-active',i===index);
        card.classList.toggle('tle-spot-before',i===(index-1+shown.length)%shown.length);
        card.classList.toggle('tle-spot-after',i===(index+1)%shown.length);
      });
      if(readout)readout.textContent=String(index+1).padStart(2,'0')+' / '+String(shown.length).padStart(2,'0');
    }
    function advance(delta,manual){
      if(manual)holdUntil=Date.now()+6000;
      if(cfg.mode==='original-dots'){
        const dots=[...document.querySelectorAll('[data-crumb-slide]')];
        if(dots.length) {index=(index+delta+dots.length)%dots.length; autoDot=!manual; dots[index].click(); autoDot=false;}
        return;
      }
      if(cfg.mode==='native-rail'){
        const max=Math.max(0,el.scrollWidth-el.clientWidth);
        if(max<=2)return;
        const step=el.firstElementChild?.getBoundingClientRect().width||240;
        let next=el.scrollLeft+delta*(step+20);
        if(next>=max-3){next=max;dir=-1;}
        else if(next<=3){next=0;dir=1;}
        el.scrollTo({left:Math.min(max,Math.max(0,next)),behavior:reduced.matches?'auto':'smooth'});
        return;
      }
      const shown=available();
      if(shown.length<2)return;
      if(cfg.mode==='filmstrip'){
        const nearest=shown.reduce((best,card,i)=>{
          const d=Math.abs(card.offsetLeft-el.offsetLeft-el.scrollLeft);
          return d<best.d?{d,i}:best;
        },{d:Infinity,i:0});
        index=(nearest.i+delta+shown.length)%shown.length;
        el.scrollTo({left:Math.max(0,shown[index].offsetLeft-el.offsetLeft),behavior:reduced.matches?'auto':'smooth'});
      }else index=(index+delta+shown.length)%shown.length;
      paint();
    }
    if(cfg.mode!=='original-dots' && cfg.mode!=='native-rail'){
      toolbar=document.createElement('div');
      toolbar.className='tle-gallery-controls';
      toolbar.innerHTML='<span class="tle-gallery-wordmark" aria-hidden="true">THE EDIT / '+String(real.length).padStart(2,'0')+'</span><div class="tle-gallery-actions">' +
        '<button class="tle-gallery-back" type="button">‹</button><span class="tle-gallery-count" aria-live="off">01 / '+String(real.length).padStart(2,'0')+'</span><button class="tle-gallery-next" type="button">›</button></div>';
      toolbar.setAttribute('role','group');
      toolbar.setAttribute('aria-label',t().controls);
      const back=toolbar.querySelector('.tle-gallery-back'),next=toolbar.querySelector('.tle-gallery-next');
      back.setAttribute('aria-label',t().before);
      next.setAttribute('aria-label',t().after);
      back.addEventListener('click',()=>advance(-1,true));
      next.addEventListener('click',()=>advance(1,true));
      readout=toolbar.querySelector('.tle-gallery-count');
      el.before(toolbar);
      el.setAttribute('tabindex','0');
      el.addEventListener('keydown',ev=>{
        if(ev.target!==el)return;
        if(ev.key==='ArrowLeft'){ev.preventDefault();advance(-1,true);}
        if(ev.key==='ArrowRight'){ev.preventDefault();advance(1,true);}
      });
    }
    // Respect original touch behavior. Only free-standing image displays
    // get swipe-to-change; native rails keep their natural horizontal swipe.
    if(['stack','duet','triptych','accordion'].includes(cfg.mode)){
      el.addEventListener('pointerdown',ev=>{drag={id:ev.pointerId,x:ev.clientX,y:ev.clientY};},{passive:true});
      el.addEventListener('pointerup',ev=>{
        if(!drag||drag.id!==ev.pointerId)return;
        const dx=ev.clientX-drag.x,dy=ev.clientY-drag.y;drag=null;
        if(Math.abs(dx)>55 && Math.abs(dx)>Math.abs(dy)*1.3)advance(dx<0?1:-1,true);
      },{passive:true});
      el.addEventListener('pointercancel',()=>{drag=null});
    }
    if(cfg.mode==='filmstrip'){
      el.addEventListener('pointerdown',()=>{holdUntil=Date.now()+6500;},{passive:true});
      el.addEventListener('scroll',()=>{holdUntil=Date.now()+2200;},{passive:true});
      if(cfg.selector.includes('cake-grid')){
        const mo=new MutationObserver(()=>{index=0;paint();});
        mo.observe(el,{subtree:false,attributes:true,attributeFilter:['hidden']});
        real.forEach(card=>mo.observe(card,{attributes:true,attributeFilter:['hidden','style']}));
      }
    }
    if(cfg.mode==='original-dots'){
      document.querySelectorAll('[data-crumb-slide]').forEach(btn=>btn.addEventListener('click',()=>{
        index=Number(btn.dataset.crumbSlide)||0;if(!autoDot)holdUntil=Date.now()+6500;
      }));
    }
    if(cfg.mode==='native-rail'){
      // Marea's existing arrow buttons and image dialogs remain authoritative.
      el.addEventListener('pointerdown',()=>{holdUntil=Date.now()+6500;},{passive:true});
      el.addEventListener('scroll',()=>{holdUntil=Date.now()+3500;},{passive:true});
      const parent=el.closest('section');
      parent?.querySelectorAll('[data-action="gallery-scroll"]').forEach(b=>b.addEventListener('click',()=>{holdUntil=Date.now()+6500;}));
    }
    paint();
    const timer=setInterval(()=>{
      if(!el.isConnected){clearInterval(timer);io?.disconnect();timers.delete(el);toolbar?.remove();return;}
      if(isInactive())return;
      advance(cfg.mode==='native-rail'?dir:1,false);
    },cfg.interval);
    timers.set(el,timer);
  }
  function tryMount(){
    const el=document.querySelector(cfg.selector);
    if(el)mount(el);
  }
  let queued=false;
  function schedule(){
    if(queued)return;
    queued=true;
    requestAnimationFrame(()=>{queued=false;tryMount();});
  }
  function ready(){
    schedule();
    // React demos can remount galleries on language/product state changes.
    const watcher=new MutationObserver(schedule);
    watcher.observe(document.querySelector('#app')||document.body,{childList:true,subtree:true});
    addEventListener('pagehide',()=>{for(const timer of timers.values())clearInterval(timer);timers.clear();watcher.disconnect();},{once:true});
  }
  if(document.readyState==='loading')addEventListener('DOMContentLoaded',ready,{once:true});else ready();
})();