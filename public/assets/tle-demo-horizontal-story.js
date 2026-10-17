/* Public Booking Demo chapter only. Desktop keeps GSAP horizontal pinning.
   On phones vertical scroll moves the same photos horizontally through a
   shorter sticky scene. Reduced motion retains accessible native swipe. */
(() => {
 'use strict';
 const section=document.getElementById('bookingBubbleStory');
 const track=document.getElementById('bookingStoryTrack');
 const windowEl=section?.querySelector('.booking-story-window');
 const progress=document.getElementById('bookingStoryProgress');
 const fill=document.getElementById('bookingStoryProgressFill');
 if(!section||!track||!windowEl||!progress||!fill||section.dataset.storyBound)return;
 section.dataset.storyBound='true';
 const cards=[...track.querySelectorAll('[data-booking-story-card]')];
 const hint=document.getElementById('bookingStoryHint');
 const reduce=window.matchMedia('(prefers-reduced-motion: reduce)');
 const short=window.matchMedia('(max-height: 610px) and (orientation: landscape)');
 const mobile=window.matchMedia('(max-width: 760px)');
 let controller=null;
 let destroyed=false;
 let booting=false;
 let mobileActive=false;
 let mobileFrame=0;
 const pinStage=section.querySelector('.booking-story-pin-stage');

 const updateHint=()=>{
  if(!hint)return;
  const es=document.documentElement.lang.toLowerCase().startsWith('es');
  if(mobile.matches)hint.textContent=es?'Desliza para ver cada foto a tu ritmo →':'Swipe through the photos at your own pace →';
  else hint.textContent=es?'Desliza para seguir el recorrido →':'Scroll to follow the booking journey →';
 };
 const updateNativeProgress=()=>{
  if(section.classList.contains('is-gsap-ready')||mobileActive)return;
  const total=Math.max(0,windowEl.scrollWidth-windowEl.clientWidth);
  const percent=total>1?Math.max(0,Math.min(100,Math.round(100*windowEl.scrollLeft/total))):100;
  fill.style.transform='scaleX('+(percent/100)+')';
  progress.setAttribute('aria-valuenow',String(percent));
 };
 const showNative=()=>{
  section.classList.remove('is-gsap-ready');
  track.style.removeProperty('transform');
  updateHint();
  updateNativeProgress();
 };
 windowEl.addEventListener('scroll',updateNativeProgress,{passive:true});

 // On phones the journey is one compact swipe gallery, rather than a long
 // pinned scroll chapter. Each photo waits for an intentional swipe or click.
 const slides=[track.querySelector('.booking-story-intro-panel'),...cards].filter(Boolean);
 const prev=document.getElementById('bookingStoryPrev');
 const next=document.getElementById('bookingStoryNext');
 const count=document.getElementById('bookingStoryCount');
 let navFrame=0;
 let activeSlide=0;
 const closestSlide=()=>{
  const left=windowEl.getBoundingClientRect().left+16;
  let best=0,dist=Infinity;
  slides.forEach((slide,i)=>{
   const d=Math.abs(slide.getBoundingClientRect().left-left);
   if(d<dist){dist=d;best=i;}
  });
  return best;
 };
 const updateNav=()=>{
  if(!mobile.matches||!slides.length)return;
  activeSlide=closestSlide();
  if(count)count.textContent=(activeSlide+1)+' / '+slides.length;
  if(prev)prev.disabled=activeSlide===0;
  if(next)next.disabled=activeSlide===slides.length-1;
 };
 const cancelNav=()=>{
  if(navFrame){cancelAnimationFrame(navFrame);navFrame=0;}
  windowEl.style.removeProperty('scroll-snap-type');
 };
 const goSlide=index=>{
  if(!mobile.matches||!slides.length)return;
  const i=Math.max(0,Math.min(slides.length-1,index));
  const rect=windowEl.getBoundingClientRect();
  const dx=slides[i].getBoundingClientRect().left-rect.left-16;
  const start=windowEl.scrollLeft;
  const max=Math.max(0,windowEl.scrollWidth-windowEl.clientWidth);
  const target=Math.max(0,Math.min(max,start+dx));
  cancelNav();
  if(reduce.matches){windowEl.scrollLeft=target;updateNav();return;}
  windowEl.style.setProperty('scroll-snap-type','none','important');
  const began=performance.now();
  const duration=850;
  const tick=now=>{
   const p=Math.max(0,Math.min(1,(now-began)/duration));
   const eased=1-Math.pow(1-p,3);
   windowEl.scrollLeft=start+(target-start)*eased;
   if(p<1){navFrame=requestAnimationFrame(tick);}
   else{navFrame=0;windowEl.style.removeProperty('scroll-snap-type');updateNav();}
  };
  navFrame=requestAnimationFrame(tick);
 };
 prev?.addEventListener('click',()=>goSlide(closestSlide()-1));
 next?.addEventListener('click',()=>goSlide(closestSlide()+1));
 windowEl.addEventListener('touchstart',cancelNav,{passive:true});
 windowEl.addEventListener('pointerdown',cancelNav,{passive:true});
 windowEl.addEventListener('scroll',updateNav,{passive:true});
 window.addEventListener('resize',updateNav,{passive:true});

 // Calculate horizontal translation from the REAL card track width. The last
 // card must still occupy the stage when vertical progress reaches 100%.
 const renderMobile=()=>{
  mobileFrame=0;
  if(!mobileActive||destroyed)return;
  const travel=Math.max(1,section.offsetHeight-pinStage.clientHeight);
  const fraction=Math.max(0,Math.min(1,-section.getBoundingClientRect().top/travel));
  const maxX=Math.max(0,track.scrollWidth-windowEl.clientWidth);
  const x=maxX*fraction;
  track.style.transform='translate3d('+-x+'px,0,0)';
  fill.style.transform='scaleX('+fraction+')';
  progress.setAttribute('aria-valuenow',String(Math.round(fraction*100)));
  cards.forEach(card=>{
   const art=card.querySelector('.booking-story-card-art');
   if(!art)return;
   const r=card.getBoundingClientRect();
   const dx=Math.min(1,Math.abs((r.left+r.right)*.5-windowEl.clientWidth*.5)/windowEl.clientWidth);
   const prominence=1-dx;
   art.style.transform='scale('+(0.93+0.07*prominence)+')';
   art.style.opacity=String(0.82+0.18*prominence);
  });
 };
 const scheduleMobile=()=>{
  if(mobileActive&&!mobileFrame)mobileFrame=requestAnimationFrame(renderMobile);
 };
 const enableMobile=()=>{
  if(mobileActive||!pinStage)return;
  mobileActive=true;
  section.classList.add('is-mobile-scroll-story');
  windowEl.scrollLeft=0;
  updateHint();
  renderMobile();
 };
 const disableMobile=()=>{
  if(!mobileActive)return;
  mobileActive=false;
  if(mobileFrame){cancelAnimationFrame(mobileFrame);mobileFrame=0;}
  section.classList.remove('is-mobile-scroll-story');
  track.style.removeProperty('transform');
  cards.forEach(card=>{
   const art=card.querySelector('.booking-story-card-art');
   art?.style.removeProperty('transform');
   art?.style.removeProperty('opacity');
  });
  showNative();
 };
 window.addEventListener('scroll',scheduleMobile,{passive:true});
 window.addEventListener('resize',scheduleMobile,{passive:true});

 const addScript=(src,ready)=>{
  if(ready())return Promise.resolve();
  return new Promise((resolve,reject)=>{
   const script=document.createElement('script');
   script.src=src;script.async=true;script.dataset.tleStoryVendor='true';
   script.addEventListener('load',()=>ready()?resolve():reject(new Error('GSAP export missing')),{once:true});
   script.addEventListener('error',()=>reject(new Error('GSAP vendor unavailable')),{once:true});
   document.head.appendChild(script);
  });
 };
 const init=async()=>{
  if(destroyed)return;
  showNative();
  // Mobile uses a compact CSS-sticky stage controlled by vertical scrolling,
  // preserving the original cinematic direction without a long GSAP spacer.
  if(mobile.matches){showNative();return;}
  if(reduce.matches||short.matches||mobile.matches||controller||booting)return;
  booting=true;
  try{
   await addScript('/assets/vendor/gsap-3.14.2.min.js',()=>!!window.gsap);
   await addScript('/assets/vendor/ScrollTrigger-3.14.2.min.js',()=>!!window.ScrollTrigger);
   if(destroyed||reduce.matches||short.matches||mobile.matches)return;
   const gsap=window.gsap,ScrollTrigger=window.ScrollTrigger;
   gsap.registerPlugin(ScrollTrigger);
   const mm=gsap.matchMedia();
   controller=mm;
   mm.add('(min-width: 761px) and (min-height: 611px) and (prefers-reduced-motion: no-preference)',()=>{
    const ctx=gsap.context(()=>{
     section.classList.add('is-gsap-ready');
     const width=()=>Math.max(1,track.scrollWidth-section.clientWidth);
     gsap.set(fill,{scaleX:0});
     const h=gsap.to(track,{
      x:()=>-width(),
      ease:'none',
      scrollTrigger:{
       id:'booking-demo-horizontal-journey',
       trigger:section,start:'top top',end:()=>'+='+width(),
       pin:true,scrub:0.6,invalidateOnRefresh:true,anticipatePin:1,
       onUpdate:self=>{
        gsap.set(fill,{scaleX:self.progress});
        progress.setAttribute('aria-valuenow',String(Math.round(self.progress*100)));
       }
      }
     });
     cards.forEach(card=>{
      const art=card.querySelector('.booking-story-card-art');
      const number=card.querySelector('.story-step-outline');
      if(art)gsap.fromTo(art,{scale:.78,opacity:.35},{
       scale:1,opacity:1,ease:'none',
       scrollTrigger:{
        trigger:card,containerAnimation:h,
        start:'left 92%',end:'left 46%',scrub:true
       }
      });
      if(number)gsap.fromTo(number,{xPercent:70},{
       xPercent:-30,ease:'none',
       scrollTrigger:{
        trigger:card,containerAnimation:h,
        start:'left right',end:'right left',scrub:true
       }
      });
     });
    },section);
    ScrollTrigger.refresh();
    return ()=>{ctx.revert();showNative()};
   });
  }catch(e){
   // Photo browsing and the sample booking form still work offline/without GSAP.
   showNative();
  }finally{booting=false;}
 };
 const onViewportChange=()=>{
  if(destroyed)return;
  if(mobile.matches){
   if(controller){controller.revert();controller=null;}
   disableMobile();
   showNative();
  }else{
   disableMobile();
   if(reduce.matches||short.matches){
    if(controller){controller.revert();controller=null;}
    showNative();
   }else if(!controller&&!booting){
    init();
   }
  }
 };
 reduce.addEventListener?.('change',onViewportChange);
 short.addEventListener?.('change',onViewportChange);
 mobile.addEventListener?.('change',onViewportChange);
 const dispose=()=>{
  cancelNav();
  window.removeEventListener('resize',updateNav);
  destroyed=true;
  controller?.revert();
  disableMobile();
  showNative();
  windowEl.removeEventListener('scroll',updateNativeProgress);
  window.removeEventListener('scroll',scheduleMobile);
  window.removeEventListener('resize',scheduleMobile);
  reduce.removeEventListener?.('change',onViewportChange);
  short.removeEventListener?.('change',onViewportChange);
  mobile.removeEventListener?.('change',onViewportChange);
 };
 window.addEventListener('pagehide',dispose,{once:true});
 init();
 updateNav();
})();
