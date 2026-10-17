/* Public sample only: no analytics, bookings, network writes or tenant data. */
(()=>{
  'use strict';
  const deck=document.getElementById('tleWorkDeck');
  if(!deck)return;
  const cards=[...deck.querySelectorAll('.tle-work-card')];
  if(cards.length!==10)return;
  const gallery=document.getElementById('tleWorkGallery');
  const status=document.getElementById('tleWorkGalleryStatus');
  const counter=document.getElementById('tleWorkGalleryCounter');
  const left=document.getElementById('tleWorkGalleryLeft');
  const right=document.getElementById('tleWorkGalleryRight');
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  const order=[...cards];
  let current=0, busy=false, drag=null;
  let cleanupTimer=0;
  const spanish=()=>document.documentElement.lang==='es';

  function loadAhead(){
    // The original project photos are large. Load only the current and the
    // two approaching images, never all ten as a hidden mobile slideshow.
    order.slice(0,3).forEach(card=>{
      const img=card.querySelector('img');
      if(!img||img.dataset.photoReady==='true')return;
      img.dataset.photoReady='true';
      const original=img.getAttribute('src')||img.dataset.src;
      const optimized=img.dataset.optimized;
      if(!original)return;
      if(optimized){
        img.addEventListener('error',()=>{
          // Non-Pages previews may not run the build-time WebP optimizer.
          if(img.dataset.galleryFallback!=='true'){
            img.dataset.galleryFallback='true';
            img.src=original;
          }
        },{once:true});
      }
      img.src=optimized||original;
    });
  }

  function localize(){
    gallery.querySelectorAll('[data-gallery-en][data-gallery-es]').forEach(el=>{
      el.textContent=spanish()?el.dataset.galleryEs:el.dataset.galleryEn;
    });
    cards.forEach(card=>{
      const img=card.querySelector('img');
      img.alt=spanish()?img.dataset.altEs:img.dataset.altEn;
    });
    left.setAttribute('aria-label',spanish()?'Deslizar la foto hacia la izquierda':'Swipe photo left');
    right.setAttribute('aria-label',spanish()?'Deslizar la foto hacia la derecha':'Swipe photo right');
    deck.setAttribute('aria-label',spanish()?'Galería de fotos de limpieza, diez ejemplos':'Cleaning photo gallery, ten examples');
    announce();
  }
  function announce(){
    counter.textContent=String(current+1).padStart(2,'0')+' / '+String(cards.length).padStart(2,'0');
    const title=order[0]?.querySelector('.tle-work-card__label h3')?.textContent||'';
    status.textContent=spanish()
      ?'Foto '+(current+1)+' de '+cards.length+': '+title
      :'Photo '+(current+1)+' of '+cards.length+': '+title;
  }
  function layout(){
    order.forEach((card,i)=>{
      card.style.transition='';
      card.style.transform='';
      card.style.opacity='';
      card.style.setProperty('--tle-work-y',(i*10)+'px');
      card.style.setProperty('--tle-work-scale',String(1-i*.055));
      card.style.setProperty('--tle-work-z',String(15-i));
      card.dataset.visible=i<4?'true':'false';
      card.dataset.active=i===0?'true':'false';
      card.setAttribute('aria-hidden',i===0?'false':'true');
      card.inert=i!==0;
    });
    loadAhead();
    announce();
  }
  function complete(){
    clearTimeout(cleanupTimer);
    const first=order.shift();
    order.push(first);
    current=(current+1)%order.length;
    busy=false;
    layout();
  }
  function swipe(direction){
    if(busy)return;
    if(reduced.matches){
      const first=order.shift();order.push(first);
      current=(current+1)%order.length;
      layout();return;
    }
    busy=true;
    const top=order[0];
    // Reveal the fourth underlying card as the others rise into place.
    order.slice(1,5).forEach((card,i)=>{
      card.dataset.visible='true';
      card.style.setProperty('--tle-work-y',(i*10)+'px');
      card.style.setProperty('--tle-work-scale',String(1-i*.055));
      card.style.setProperty('--tle-work-z',String(15-i));
    });
    top.style.transition='transform 520ms cubic-bezier(.3,.7,.2,1), opacity 520ms ease';
    // Flush the dragged transform before the exit frame.
    void top.offsetWidth;
    top.style.transform='translate('+((direction>0)?'130%':'-130%')+', -6%) rotate('+((direction>0)?'20deg':'-20deg')+')';
    top.style.opacity='0';
    let done=false;
    const finish=e=>{
      if(done||(e&&e.propertyName!=='transform'))return;
      done=true;top.removeEventListener('transitionend',finish);complete();
    };
    top.addEventListener('transitionend',finish);
    cleanupTimer=window.setTimeout(()=>finish(),630);
  }

  function stopDrag(ev,cancelled=false){
    if(!drag||ev.pointerId!==drag.id)return;
    const d=drag;drag=null;
    const top=order[0];
    if(top.hasPointerCapture?.(ev.pointerId))top.releasePointerCapture(ev.pointerId);
    const elapsed=Math.max(16,performance.now()-d.start);
    const velocity=d.dx/elapsed;
    if(!cancelled&&(Math.abs(d.dx)>50||(Math.abs(d.dx)>25&&Math.abs(velocity)>.48))){
      swipe(d.dx>=0?1:-1);
    }else{
      top.style.transition='';
      top.style.transform='';
    }
  }
  deck.addEventListener('pointerdown',ev=>{
    const top=order[0];
    if(busy||drag||!ev.isPrimary||ev.target!==top||(ev.pointerType==='mouse'&&ev.button!==0))return;
    ev.preventDefault();
    drag={id:ev.pointerId,x:ev.clientX,y:ev.clientY,dx:0,start:performance.now()};
    top.setPointerCapture(ev.pointerId);
    top.style.transition='none';
  });
  deck.addEventListener('pointermove',ev=>{
    if(!drag||ev.pointerId!==drag.id||busy)return;
    const top=order[0];
    const dx=ev.clientX-drag.x,dy=ev.clientY-drag.y;
    drag.dx=dx;
    top.style.transform='translate('+dx+'px,'+(dy*.3)+'px) rotate('+(dx*.07)+'deg)';
  });
  deck.addEventListener('pointerup',ev=>stopDrag(ev));
  deck.addEventListener('pointercancel',ev=>stopDrag(ev,true));
  deck.addEventListener('lostpointercapture',ev=>stopDrag(ev,true));
  deck.addEventListener('keydown',ev=>{
    if(ev.key==='ArrowLeft'||ev.key==='ArrowRight'){
      ev.preventDefault();swipe(ev.key==='ArrowLeft'?-1:1);
    }
  });
  left.addEventListener('click',()=>swipe(-1));
  right.addEventListener('click',()=>swipe(1));
  document.getElementById('language')?.addEventListener('change',()=>queueMicrotask(localize));
  deck.dataset.enhanced='true';
  layout();
  localize();
})();
