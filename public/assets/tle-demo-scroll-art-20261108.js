/* TLE brand-specific editorial scroll motion | 2026-11-08.
   Inspired by BrewedOps scroll triggered reveal, masked photography and stagger.
   No ScrollTrigger/Lenis dependency, pinned content, scroll hijack or form changes. */
(() => {
 'use strict';
 const root=document.documentElement;
 if(!root.dataset.tleOneMotion)return;
 const media=window.matchMedia?.('(prefers-reduced-motion: reduce)');
 const processed=new WeakSet();
 const tracked=new Set();
 const exclusion='.hero,.site-header,nav,footer,.ticker,.marquee,.banner,.announcement,.modal,.drawer,.cart,.checkout,.preview,.receipt,.form-card,.form-panel,form,dialog,[role="dialog"],[hidden],[aria-hidden="true"]';
 let observer=null,scheduled=false;
 const safe=el=>Boolean(el&&el.isConnected&&!el.closest(exclusion)&&el.getBoundingClientRect().height>0);
 function ensureObserver(){
   if(observer||!('IntersectionObserver' in window))return;
   // Keep observing in BOTH directions. An element resets only after it has
   // fully left the viewport, so reversing scroll never flashes an on-screen card.
   observer=new IntersectionObserver(entries=>{
     for(const entry of entries){
       const el=entry.target;
       if(media?.matches){el.classList.add('tle-scroll-visible');continue;}
       if(entry.isIntersecting){
         el.classList.add('tle-scroll-visible');
       }else if(!el.matches(':focus-within')){
         el.classList.remove('tle-scroll-visible');
       }
     }
   },{root:null,rootMargin:'0px 0px 8% 0px',threshold:0.01});
 }
 const add=(el,part,delay)=>{
   if(!safe(el)||processed.has(el))return;
   processed.add(el);
   el.dataset.tleScrollPart=part;
   if(media?.matches||!observer){
     el.classList.add('tle-scroll-visible');return;
   }
   el.style.setProperty('--tle-scroll-delay',delay+'ms');
   el.classList.add('tle-scroll-pending');
   // Keep initially visible/anchor-targeted content visible with no first-frame flash.
   const rect=el.getBoundingClientRect();
   if(rect.top<window.innerHeight*.94 && rect.bottom>0){
     el.classList.add('tle-scroll-visible');
   }
   tracked.add(el);
   observer.observe(el);
 };
 function scan(){
   ensureObserver();
   for(const el of tracked)if(!el.isConnected){tracked.delete(el);observer?.unobserve(el);}
   if(media?.matches){for(const el of tracked)el.classList.add('tle-scroll-visible');return;}
   const base=document.querySelector('main')||document.querySelector('#app')||document.body;
   const sections=[...base.querySelectorAll('section')].filter(section=>{
     if(!safe(section))return false;
     if(section.matches('.intro-band,.feature-links,.editorial-banner,.hero-strip,.mini-strip,.brand-story-banner,.strip,.handoff,.owner'))return false;
     return true;
   }).slice(0,12);
   let accepted=0;
   for(const section of sections){
     if(accepted>=9)break;
     let title=[...section.querySelectorAll('h2, .section-heading h3, .section-title')]
       .find(el=>el.closest('section')===section&&safe(el));
     let photo=[...section.querySelectorAll('figure, picture, .story-photo, .photo-frame, .editorial-photo, .product-image, .visual-image, .feeling-photo, .detail-image, .story-art, .wedding-moment-photo, .story-images, .flavors-picture, .gallery-left, .vip-image, .editorial-media, .editorial-visual, img')]
       .find(el=>el.closest('section')===section&&safe(el)
         &&!el.closest('a,button,[role="button"],.carousel,.slider,.swiper,.filters,.tabs')
         &&!el.querySelector('input,select,textarea,[role="dialog"]'));
     if(!title&&!photo)continue;
     accepted++;
     if(title)add(title,'headline',0);
     if(photo&&accepted<=6)add(photo,'photo',title?160:0);
   }
 }
 function boot(){
   if(media?.matches)return;
   ensureObserver();scan();
   // Dynamic React demo and language switches reconstruct sections.
   const base=document.querySelector('#app')||document.querySelector('main')||document.body;
   new MutationObserver(records=>{
     if(scheduled||!records.some(r=>[...r.addedNodes].some(n=>n.nodeType===1&&
        (n.matches?.('section,main,#app')||n.querySelector?.('section')))))return;
     scheduled=true;requestAnimationFrame(()=>{scheduled=false;scan()});
   }).observe(base,{subtree:true,childList:true});
   document.addEventListener('focusin',e=>{
     const el=e.target.closest?.('.tle-scroll-pending');
     if(el)el.classList.add('tle-scroll-visible');
   },{passive:true});
   media?.addEventListener?.('change',e=>{
     for(const el of tracked){
       const rect=el.getBoundingClientRect();
       el.classList.toggle('tle-scroll-visible',
         e.matches||(rect.bottom>0&&rect.top<innerHeight*.93));
     }
     if(!e.matches)scan();
   });
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
 else boot();
})();


/* TLE interactive hero depth — 2026-11-08.
   Preserve ORIGINAL approved media; dynamic pointer parallax + scroll depth.
   Never changes checkout, language, interactive UI or browser scroll behavior. */
(() => {
  'use strict';
  const brand=document.documentElement.dataset.tleOneMotion;
  const profiles={
    'sova':['.hero-media img',13,9,17,.35],
    'golden-grid':['.hero-art img',21,14,27,.55],
    'casa-brownie':['.hero-photo',12,9,19,.22],
    'crumb':['.hero picture img',11,8,20,.22],
    'havana-19':['.hero > img',11,8,21,.18],
    'ivory-and-bloom':['.hero-photo img',13,9,17,.25],
    'la-vie-in-pink':['.hero-visual > img',12,9,21,.24],
    'marea-wigs-miami':['.hero-visual > img',11,8,19,.24],
    'aftr':['.hero-image',19,12,28,.44],
    'lavender-edit':['.hero-art > img',11,9,17,.28],
    'experience-cleaning':['.hero-full-photo',11,7,17,.15],
    'seasonal-brew':['.hero-media > img',13,9,21,.24],
    'soluna-yoga':['.hero-visual.has-photo',10,7,16,.18],
    'wok-social':['.hero-photo-frame img',14,9,22,.31],
    'yummm':['.hero-slide img',12,8,20,.18],
    'jaramillo-boutique':['.hero-editorial-image',10,7,16,.18]
  };
  const profile=profiles[brand];
  if(!profile)return;
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  const precise=window.matchMedia('(hover: hover) and (pointer: fine)');
  let hero=null,photos=[],copy=null,dx=0,dy=0,frame=0;
  const clamp=(v,min,max)=>Math.min(max,Math.max(min,v));
  const variables=['--tle-rh-px','--tle-rh-py','--tle-rh-rotation','--tle-rh-copy-x','--tle-rh-copy-y'];
  function reset(){
    if(!hero)return;
    for(const variable of variables)hero.style.removeProperty(variable);
    dx=dy=0;
  }
  function draw(){
    frame=0;
    if(!hero||!hero.isConnected)return;
    if(reduced.matches){reset();return}
    const rect=hero.getBoundingClientRect();
    if(rect.width<1||rect.height<1)return;
    if(rect.top>innerHeight+60||rect.bottom< -60)return;
    const p=clamp(-rect.top/rect.height,0,1);
    const [selector,xStrength,yStrength,scrollStrength,turn]=profile;
    const isMouse=precise.matches;
    const x=isMouse?dx*xStrength:0;
    const y=(isMouse?dy*yStrength:0)+p*scrollStrength;
    const rotation=isMouse?dx*turn:0;
    hero.style.setProperty('--tle-rh-px',x.toFixed(2)+'px');
    hero.style.setProperty('--tle-rh-py',y.toFixed(2)+'px');
    hero.style.setProperty('--tle-rh-rotation',rotation.toFixed(3)+'deg');
    hero.style.setProperty('--tle-rh-copy-x',(isMouse?-dx*3.5:0).toFixed(2)+'px');
    hero.style.setProperty('--tle-rh-copy-y',(-p*10-(isMouse?dy*2:0)).toFixed(2)+'px');
    hero.dataset.tleReactiveProgress=String(Math.round(p*100));
  }
  function schedule(){if(!frame)frame=requestAnimationFrame(draw)}
  function pointerMove(event){
    if(!precise.matches||event.pointerType==='touch'||reduced.matches)return;
    const rect=hero.getBoundingClientRect();
    if(rect.width<1||rect.height<1)return;
    dx=clamp(((event.clientX-rect.left)/rect.width-.5)*2,-1,1);
    dy=clamp(((event.clientY-rect.top)/rect.height-.5)*2,-1,1);
    schedule();
  }
  function pointerOut(){dx=dy=0;schedule()}
  function unbind(){
    if(!hero)return;
    hero.removeEventListener('pointermove',pointerMove);
    hero.removeEventListener('pointerleave',pointerOut);
    hero.removeAttribute('data-tle-reactive-hero');
    for(const photo of photos)photo.removeAttribute('data-tle-reactive-photo');
    if(copy)copy.removeAttribute('data-tle-reactive-copy');
    reset();hero=null;photos=[];copy=null;
  }
  function mount(){
    const target=document.querySelector('main section.hero, #app section.hero, section.hero');
    if(target===hero&&photos.length&&photos.some(photo=>photo.isConnected))return;
    if(hero)unbind();
    if(!target)return;
    const media=[...target.querySelectorAll(profile[0])];
    if(!media.length)return; // Dynamic React heroes can mount later.
    hero=target;photos=media;
    copy=hero.querySelector('.hero-copy,.hero-content,.hero-editorial-content,.hero-text');
    hero.setAttribute('data-tle-reactive-hero',brand);
    for(const photo of photos)photo.setAttribute('data-tle-reactive-photo','');
    if(copy)copy.setAttribute('data-tle-reactive-copy','');
    hero.addEventListener('pointermove',pointerMove,{passive:true});
    hero.addEventListener('pointerleave',pointerOut,{passive:true});
    schedule();
  }
  function boot(){
    mount();
    window.addEventListener('scroll',schedule,{passive:true});
    window.addEventListener('resize',schedule,{passive:true});
    reduced.addEventListener?.('change',schedule);
    precise.addEventListener?.('change',pointerOut);
    // Original dynamic React demo can remount its hero after a language change.
    const root=document.querySelector('#app')||document.querySelector('main')||document.body;
    let queued=false;
    new MutationObserver(records=>{
      if(queued||!records.some(record=>[...record.addedNodes].some(n=>n.nodeType===1&&
        (n.matches?.('.hero,section,#app')||n.querySelector?.('section.hero')))))return;
      queued=true;
      requestAnimationFrame(()=>{queued=false;mount()});
    }).observe(root,{subtree:true,childList:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
