/* Golden Grid / 2026-11-07: cinematic spotlight carousel.
   Preserve all nine original, interactive gallery buttons and lightbox handlers. */
(() => {
  let done = false;
  function start() {
    if(done) return;
    const gallery = document.querySelector('#campaign #gallery');
    if(!gallery) return;
    const cards = Array.from(gallery.querySelectorAll(':scope > button'));
    if(cards.length !== 9) return;
    done = true;
    // Only decode current and two neighboring original PNGs at once.
    // Full-size originals remain available to the existing lightbox.
    const originalSources=cards.map(card=>card.querySelector('img')?.getAttribute('src')||'');
    const lowMemoryView=window.matchMedia('(max-width:760px)').matches||window.self!==window.top;
    const manageImages=(active)=>{
      const needed=new Set([active,(active+cards.length-1)%cards.length,(active+1)%cards.length]);
      cards.forEach((card,i)=>{
        const img=card.querySelector('img');if(!img)return;
        img.loading='lazy';img.decoding='async';
        if(needed.has(i)){
          if(img.getAttribute('src')!==originalSources[i])img.setAttribute('src',originalSources[i]);
        }else if(img.hasAttribute('src'))img.removeAttribute('src');
      });
    };

    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const toolbar = document.createElement('div');
    toolbar.className = 'golden-gallery-toolbar';
    toolbar.innerHTML = '<span class="golden-gallery-label">THE GOLDEN EDIT / 09</span>' +
      '<div class="golden-gallery-actions">' +
      '<button type="button" data-golden-back aria-label="Previous photo">‹</button>' +
      '<span class="golden-gallery-count" aria-live="off">01 / 09</span>' +
      '<button type="button" data-golden-next aria-label="Next photo">›</button></div>';
    gallery.before(toolbar);
    gallery.classList.add('golden-featured-carousel');
    gallery.setAttribute('role','region');
    gallery.setAttribute('aria-roledescription','carousel');
    gallery.setAttribute('aria-label','Golden Grid campaign photographs');
    const back = toolbar.querySelector('[data-golden-back]');
    const next = toolbar.querySelector('[data-golden-next]');
    const count = toolbar.querySelector('.golden-gallery-count');
    let current = 0;
    let pointer = null;
    let holdUntil = 0;
    let suppressClickUntil = 0;
    let seen = !('IntersectionObserver' in window);
    const observer = 'IntersectionObserver' in window
      ? new IntersectionObserver(entries => {seen = !!entries[0]?.isIntersecting;},{threshold:.15})
      : null;
    observer?.observe(gallery);
    function languageIsSpanish() {
      // The original language button displays the language it will switch TO.
      return document.querySelector('#language')?.textContent.trim() === 'EN';
    }
    function translate() {
      const es=languageIsSpanish();
      back.setAttribute('aria-label',es?'Foto anterior':'Previous photo');
      next.setAttribute('aria-label',es?'Foto siguiente':'Next photo');
      gallery.setAttribute('aria-label',es?'Galería Golden Grid':'Golden Grid campaign photographs');
      gallery.setAttribute('aria-roledescription',es?'carrusel':'carousel');
    }
    function paint() {
      manageImages(current);
      const previous=(current+cards.length-1)%cards.length;
      const following=(current+1)%cards.length;
      cards.forEach((card,i)=>{
        const active=i===current, left=i===previous, right=i===following;
        card.classList.toggle('is-golden-current',active);
        card.classList.toggle('is-golden-prev',left);
        card.classList.toggle('is-golden-next',right);
        card.tabIndex=active?0:-1;
        card.setAttribute('aria-hidden',active?'false':'true');
      });
      count.textContent=String(current+1).padStart(2,'0')+' / '+String(cards.length).padStart(2,'0');
      translate();
    }
    function go(index,manual) {
      current=(index+cards.length)%cards.length;
      if(manual)holdUntil=Date.now()+6500;
      paint();
    }
    back.addEventListener('click',()=>go(current-1,true));
    next.addEventListener('click',()=>go(current+1,true));
    gallery.addEventListener('click',event=>{
      if(Date.now()<suppressClickUntil){event.preventDefault();event.stopImmediatePropagation();return;}
      const button=event.target.closest('button');
      if(!button||!gallery.contains(button))return;
      const index=cards.indexOf(button);
      if(index!==-1&&index!==current){
        event.preventDefault();
        event.stopImmediatePropagation();
        go(index,true);
      } else holdUntil=Date.now()+6500;
    },true);
    gallery.addEventListener('keydown',event=>{
      if(event.key==='ArrowLeft'){event.preventDefault();go(current-1,true);}
      if(event.key==='ArrowRight'){event.preventDefault();go(current+1,true);}
    });
    gallery.addEventListener('pointerdown',event=>{
      if(event.pointerType==='mouse'&&event.button!==0)return;
      pointer={id:event.pointerId,x:event.clientX,y:event.clientY};
    },{passive:true});
    gallery.addEventListener('pointerup',event=>{
      if(!pointer||pointer.id!==event.pointerId)return;
      const delta=event.clientX-pointer.x,dy=event.clientY-pointer.y;
      pointer=null;
      if(Math.abs(delta)>55&&Math.abs(delta)>Math.abs(dy)*1.35){
        suppressClickUntil=Date.now()+650;
        go(current+(delta<0?1:-1),true);
      }
    },{passive:true});
    gallery.addEventListener('pointercancel',()=>{pointer=null;});
    const languageButton=document.querySelector('#language');
    languageButton?.addEventListener('click',()=>window.setTimeout(translate,0));
    const timer=lowMemoryView?null:window.setInterval(()=>{
      if(motion.matches||!seen||document.hidden||Date.now()<holdUntil)return;
      if(gallery.matches(':hover')||toolbar.matches(':hover'))return;
      if(gallery.contains(document.activeElement)||toolbar.contains(document.activeElement))return;
      if(document.querySelector('dialog[open]'))return;
      go(current+1,false);
    },4700);
    if(timer!==null)window.addEventListener('pagehide',()=>window.clearInterval(timer),{once:true});
    paint();
  }
  function ready(){
    start();
    if(!document.querySelector('#gallery')) return;
    if(document.querySelector('#gallery.golden-featured-carousel'))return;
    const obs=new MutationObserver(()=>{start();if(document.querySelector('#gallery.golden-featured-carousel'))obs.disconnect()});
    obs.observe(document.querySelector('#gallery'),{childList:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready,{once:true});
  else ready();
})();