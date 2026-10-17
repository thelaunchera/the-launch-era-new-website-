/* Public Booking Demo cinematic chapter. GSAP 3 + ScrollTrigger only for this section.
   Native swipe/scroll-snap stays fully usable when offline or under reduced motion. */
(()=>{
 'use strict';
 const section=document.getElementById('bookingBubbleStory');
 const track=document.getElementById('bookingHorizontalTrack');
 const bar=document.getElementById('bookingHorizontalProgressFill');
 if(!section||!track||!bar)return;
 const images=[...track.querySelectorAll('img')];
 const cards=[...track.querySelectorAll('[data-horizontal-card]')];
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
 let disposed=false,mm=null;
 function updateLabel(){
  track.setAttribute('aria-label',document.documentElement.lang==='es'?'Recorrido de cuatro etapas del demo de reservas':'Four-part cleaning booking journey');
 }
 updateLabel();
 document.getElementById('language')?.addEventListener('change',()=>requestAnimationFrame(updateLabel));
 function updateNativeProgress(){
  if(section.classList.contains('is-gsap-active'))return;
  const max=track.scrollWidth-track.clientWidth;
  bar.style.transform='scaleX('+(max>0?Math.max(0,Math.min(1,track.scrollLeft/max)):1)+')';
 }
 track.addEventListener('scroll',updateNativeProgress,{passive:true});
 updateNativeProgress();
 function fetchScript(src){
  return new Promise(resolve=>{
   let done=false;
   const tag=document.createElement('script');
   const finish=ok=>{if(done)return;done=true;resolve(ok)};
   tag.src=src;tag.async=true;tag.crossOrigin='anonymous';
   tag.onload=()=>finish(true);tag.onerror=()=>finish(false);
   document.head.appendChild(tag);
   window.setTimeout(()=>finish(false),6500);
  });
 }
 async function start(){
  if(reduced.matches)return;
  try {
   if(!window.gsap){
    if(!await fetchScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js'))return;
   }
   if(!window.ScrollTrigger){
    if(!await fetchScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js'))return;
   }
   if(disposed||!window.gsap||!window.ScrollTrigger)return;
   const gsap=window.gsap,ScrollTrigger=window.ScrollTrigger;
   gsap.registerPlugin(ScrollTrigger);
   mm=gsap.matchMedia();
   mm.add('(prefers-reduced-motion: no-preference)',()=>{
    const duration=()=>Math.max(0,track.scrollWidth-section.clientWidth);
    if(duration()<40)return;
    section.classList.add('is-gsap-active');
    track.scrollLeft=0;
    const context=gsap.context(()=>{
     const horizontal=gsap.to(track,{
      x:()=>-duration(),ease:'none',
      scrollTrigger:{
       trigger:section,start:'top top',end:()=>'+='+duration(),
       pin:true,scrub:0.6,invalidateOnRefresh:true,
       onUpdate:self=>gsap.set(bar,{scaleX:self.progress})
      }
     });
     for(const card of cards){
      const art=card.querySelector('.booking-horizontal-art img');
      const number=card.querySelector('.booking-horizontal-outline-number');
      if(art)gsap.fromTo(art,{scale:0.78,opacity:0.35},{
       scale:1,opacity:1,ease:'none',
       scrollTrigger:{trigger:card,containerAnimation:horizontal,start:'left 92%',end:'left 46%',scrub:true}
      });
      if(number)gsap.fromTo(number,{xPercent:70},{xPercent:-30,ease:'none',
       scrollTrigger:{trigger:card,containerAnimation:horizontal,start:'left right',end:'right left',scrub:true}
      });
     }
    },section);
    const reflow=()=>ScrollTrigger.refresh();
    images.forEach(im=>{if(!im.complete)im.addEventListener('load',reflow,{once:true})});
    return ()=>{context.revert();section.classList.remove('is-gsap-active');updateNativeProgress()};
   });
   ScrollTrigger.refresh();
  }catch(e){
   section.classList.remove('is-gsap-active');
   updateNativeProgress();
  }
 }
 start();
 window.addEventListener('pagehide',()=>{
  disposed=true;
  if(mm)mm.revert();
  section.classList.remove('is-gsap-active');
 },{once:true});
})();
