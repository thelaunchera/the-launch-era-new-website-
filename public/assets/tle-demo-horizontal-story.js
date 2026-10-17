/* Public Booking Demo chapter only. Desktop uses GSAP pinned storytelling.
   Phone uses a compact, native swipe gallery so there is never a long, empty
   scroll-pinned section. The real booking form and tenant routes are untouched. */
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

 const updateHint=()=>{
  if(!hint)return;
  const es=document.documentElement.lang.toLowerCase().startsWith('es');
  if(mobile.matches)hint.textContent=es?'Desliza las cuatro tarjetas →':'Swipe through all four cards →';
  else hint.textContent=es?'Desliza para seguir el recorrido →':'Scroll to follow the booking journey →';
 };
 const updateNativeProgress=()=>{
  if(section.classList.contains('is-gsap-ready'))return;
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
  // Pinning a horizontal track on iPhone produces an empty vertical tail.
  // Keep the 4 distinct photos reachable with finger swipe, no GSAP on phones.
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
  if(reduce.matches||short.matches||mobile.matches){
   if(controller){controller.revert();controller=null;}
   showNative();
  }else if(!controller&&!booting){
   init();
  }
 };
 reduce.addEventListener?.('change',onViewportChange);
 short.addEventListener?.('change',onViewportChange);
 mobile.addEventListener?.('change',onViewportChange);
 const dispose=()=>{
  destroyed=true;
  controller?.revert();
  showNative();
  windowEl.removeEventListener('scroll',updateNativeProgress);
  reduce.removeEventListener?.('change',onViewportChange);
  short.removeEventListener?.('change',onViewportChange);
  mobile.removeEventListener?.('change',onViewportChange);
 };
 window.addEventListener('pagehide',dispose,{once:true});
 init();
})();
