/* SOVA Campaign — editorial auto-carousel (2026-11-07)
   Progressive enhancement: never clones or replaces approved campaign cards.
   Original image-dialog controls and downloads remain bound to original buttons. */
(() => {
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let activeGallery = null;
  let teardown = null;
  let scheduled = false;

  function init() {
    const gallery = document.querySelector('#campaign .gallery');
    if (!gallery || gallery === activeGallery) return;
    if (teardown) teardown();
    activeGallery = gallery;

    const cards = Array.from(gallery.querySelectorAll('.gallery-item[data-photo]'));
    if (cards.length < 2) return;
    const spanish = document.documentElement.lang === 'es';
    const copy = spanish
      ? {previous:'Anterior',next:'Siguiente',pause:'Pausar',play:'Reanudar',label:'Controles del carrusel de SOVA',count:'Fotografía'}
      : {previous:'Previous',next:'Next',pause:'Pause',play:'Play',label:'SOVA campaign carousel controls',count:'Photo'};
    const toolbar = document.createElement('div');
    toolbar.className = 'sova-carousel-toolbar';
    toolbar.setAttribute('role','group');
    toolbar.setAttribute('aria-label',copy.label);
    toolbar.innerHTML = '<span class="sova-carousel-caption" aria-hidden="true">THE SOVA EDIT / 01—10</span>' +
      '<div class="sova-carousel-actions">' +
      '<button type="button" data-sova-prev aria-label="'+copy.previous+'">‹</button>' +
      '<span class="sova-carousel-count" aria-live="off">01 / 10</span>' +
      '<button type="button" data-sova-next aria-label="'+copy.next+'">›</button>' +
      '<button type="button" class="sova-carousel-pause" data-sova-pause aria-pressed="false">'+copy.pause+'</button>' +
      '</div>';
    gallery.before(toolbar);
    gallery.classList.add('sova-carousel-active');
    gallery.setAttribute('role','region');
    gallery.setAttribute('aria-roledescription',spanish ? 'carrusel' : 'carousel');
    gallery.setAttribute('aria-label',spanish ? 'Diez fotografías de la campaña SOVA' : 'Ten SOVA campaign photographs');
    gallery.setAttribute('tabindex','0');
    const previous = toolbar.querySelector('[data-sova-prev]');
    const next = toolbar.querySelector('[data-sova-next]');
    const pauseButton = toolbar.querySelector('[data-sova-pause]');
    const counter = toolbar.querySelector('.sova-carousel-count');

    let paused = motion.matches;
    let hovering = false;
    let focused = false;
    let visible = false;
    let direction = 1;
    let userHoldUntil = 0;

    function step() {
      if (cards.length < 2) return 240;
      return Math.max(1,cards[1].offsetLeft-cards[0].offsetLeft);
    }
    function maxScroll() { return Math.max(0,gallery.scrollWidth-gallery.clientWidth); }
    function closestIndex() {
      const left = gallery.scrollLeft;
      const size = step();
      return Math.min(cards.length-1,Math.max(0,Math.round(left/size)));
    }
    function updateCount() {
      counter.textContent = String(closestIndex()+1).padStart(2,'0')+' / '+String(cards.length).padStart(2,'0');
    }
    function move(amount) {
      const max = maxScroll();
      if(max < 2) return;
      const left = Math.min(max,Math.max(0,gallery.scrollLeft + amount*step()));
      gallery.scrollTo({left,behavior:motion.matches?'auto':'smooth'});
      userHoldUntil=Date.now()+450;
    }
    function syncPause() {
      pauseButton.textContent = paused ? copy.play : copy.pause;
      pauseButton.setAttribute('aria-pressed',String(paused));
      pauseButton.setAttribute('aria-label',paused ? copy.play : copy.pause);
    }
    function manuallyMove(delta) { userHoldUntil=Date.now()+6500; move(delta); direction=delta; }
    const prevClick=()=>manuallyMove(-1);
    const nextClick=()=>manuallyMove(1);
    const togglePause=()=>{paused=!paused;syncPause();};
    const onScroll=()=>updateCount();
    const onEnter=()=>{hovering=true;};
    const onLeave=()=>{hovering=false;};
    const onFocusIn=()=>{focused=true;};
    const onFocusOut=()=>{
      window.requestAnimationFrame(()=>{focused=gallery.contains(document.activeElement);});
    };
    const onUserInput=()=>{userHoldUntil=Date.now()+7000;};
    const onKeys=event=>{
      if(event.key==='ArrowRight'){event.preventDefault();manuallyMove(1);}
      if(event.key==='ArrowLeft'){event.preventDefault();manuallyMove(-1);}
    };
    const onMotionChange=()=>{if(motion.matches){paused=true;syncPause();}};
    previous.addEventListener('click',prevClick);
    next.addEventListener('click',nextClick);
    pauseButton.addEventListener('click',togglePause);
    gallery.addEventListener('scroll',onScroll,{passive:true});
    gallery.addEventListener('mouseenter',onEnter);
    gallery.addEventListener('mouseleave',onLeave);
    gallery.addEventListener('focusin',onFocusIn);
    gallery.addEventListener('focusout',onFocusOut);
    gallery.addEventListener('pointerdown',onUserInput,{passive:true});
    gallery.addEventListener('wheel',onUserInput,{passive:true});
    gallery.addEventListener('keydown',onKeys);
    if(motion.addEventListener) motion.addEventListener('change',onMotionChange);
    const observer = 'IntersectionObserver' in window
      ? new IntersectionObserver(entries=>{visible=!!entries[0]?.isIntersecting;},{threshold:0.18}) : null;
    if(observer) observer.observe(gallery);
    else visible=true;
    syncPause();
    updateCount();
    const timer=window.setInterval(()=>{
      if(paused||motion.matches||!visible||hovering||focused||document.hidden||
         document.body.classList.contains('modal-open')||Date.now()<userHoldUntil) return;
      const max=maxScroll();
      if(max<2)return;
      if(gallery.scrollLeft>=max-3)direction=-1;
      if(gallery.scrollLeft<=3)direction=1;
      move(direction);
    },3200);
    teardown=()=>{
      window.clearInterval(timer);
      if(observer)observer.disconnect();
      previous.removeEventListener('click',prevClick);
      next.removeEventListener('click',nextClick);
      pauseButton.removeEventListener('click',togglePause);
      gallery.removeEventListener('scroll',onScroll);
      gallery.removeEventListener('mouseenter',onEnter);
      gallery.removeEventListener('mouseleave',onLeave);
      gallery.removeEventListener('focusin',onFocusIn);
      gallery.removeEventListener('focusout',onFocusOut);
      gallery.removeEventListener('pointerdown',onUserInput);
      gallery.removeEventListener('wheel',onUserInput);
      gallery.removeEventListener('keydown',onKeys);
      if(motion.removeEventListener)motion.removeEventListener('change',onMotionChange);
      toolbar.remove();
      activeGallery=null;
    };
  }
  function schedule() {
    if(scheduled)return;
    scheduled=true;
    window.requestAnimationFrame(()=>{scheduled=false;init();});
  }
  function start(){
    schedule();
    const app=document.querySelector('#app');
    if(app){const observer=new MutationObserver(schedule);observer.observe(app,{childList:true,subtree:false});}
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();