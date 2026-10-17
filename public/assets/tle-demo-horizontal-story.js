/* Public Booking Demo chapter only. GSAP 3.14.2 and ScrollTrigger are
   checked-in first-party copies of official GreenSock distribution files.
   If JS fails or reduced motion is set: accessible native horizontal scroll. */
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
 const reduce=window.matchMedia('(prefers-reduced-motion: reduce)');
 const short=window.matchMedia('(max-height: 610px) and (orientation: landscape)');
 let controller=null;
 let destroyed=false;

 const showNative=()=>{
  section.classList.remove('is-gsap-ready');
  track.style.removeProperty('transform');
  fill.style.removeProperty('transform');
  progress.setAttribute('aria-valuenow','100');
 };
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
  showNative();
  if(reduce.matches||short.matches)return;
  try{
   await addScript('/assets/vendor/gsap-3.14.2.min.js',()=>!!window.gsap);
   await addScript('/assets/vendor/ScrollTrigger-3.14.2.min.js',()=>!!window.ScrollTrigger);
   if(destroyed)return;
   const gsap=window.gsap,ScrollTrigger=window.ScrollTrigger;
   gsap.registerPlugin(ScrollTrigger);
   const mm=gsap.matchMedia();
   controller=mm;
   mm.add('(min-height: 611px) and (prefers-reduced-motion: no-preference)',()=>{
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
   // The actual booking form remains usable if any motion library is unavailable.
   showNative();
  }
 };
 const ensureNativeOnChange=()=>{
  if(reduce.matches||short.matches)showNative();
 };
 reduce.addEventListener?.('change',ensureNativeOnChange);
 short.addEventListener?.('change',ensureNativeOnChange);
 const dispose=()=>{
  destroyed=true;controller?.revert();
  showNative();
  reduce.removeEventListener?.('change',ensureNativeOnChange);
  short.removeEventListener?.('change',ensureNativeOnChange);
 };
 window.addEventListener('pagehide',dispose,{once:true});
 init();
})();
