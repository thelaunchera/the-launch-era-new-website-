/* Real demo hero media in the bilingual public Website offer.
   YUMMM uses the approved MP4 and matching first-frame poster.
   Playback starts only in the visible gallery, remains muted/inline,
   and never hides the actual photograph if video fails or is blocked. */
(()=>{
 'use strict';
 const stage=document.querySelector('.tle-universal .hero-gallery-stage');
 if(!stage)return;
 const media=[...stage.querySelectorAll('video.hero-gallery-motion[data-motion-src]')];
 if(!media.length)return;
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');
 const active=new Set();
 const allowed=()=>!document.hidden&&!reduce.matches&&!navigator.connection?.saveData;
 function stop(video){
  video.pause();
  video.classList.remove('is-playing');
 }
 function showFirstFrame(video){
  if(!active.has(video)||!allowed()||video.paused||video.readyState<2)return;
  const reveal=()=>{
   if(active.has(video)&&allowed()&&!video.paused&&video.readyState>=2){
    video.classList.add('is-playing');
   }
  };
  if(typeof video.requestVideoFrameCallback==='function'){
   video.requestVideoFrameCallback(reveal);
  }else{
   requestAnimationFrame(()=>requestAnimationFrame(reveal));
  }
 }
 function start(video){
  const card=video.closest('.hero-gallery-card');
  if(!allowed()||!card||card.hidden||getComputedStyle(card).display==='none'){
   stop(video);return;
  }
  if(!video.getAttribute('src')){
   video.src=video.dataset.motionSrc;
  }
  video.muted=true;
  video.defaultMuted=true;
  const result=video.play();
  if(result?.then)result.then(()=>showFirstFrame(video)).catch(()=>stop(video));
 }
 for(const video of media){
  video.addEventListener('playing',()=>showFirstFrame(video));
  video.addEventListener('error',()=>stop(video));
  video.addEventListener('stalled',()=>video.classList.remove('is-playing'));
 }
 if('IntersectionObserver' in window){
  const observer=new IntersectionObserver(entries=>{
   for(const entry of entries){
    const video=entry.target;
    if(entry.isIntersecting&&entry.intersectionRatio>=.45){
     active.add(video);start(video);
    }else{
     active.delete(video);stop(video);
    }
   }
  },{root:stage,threshold:[0,.45,.65]});
  media.forEach(video=>observer.observe(video));
 }
 // If supported playback was blocked, retain the real matching poster.
 document.addEventListener('visibilitychange',()=>{
  for(const video of media){
   if(document.hidden)stop(video);
   else if(active.has(video))start(video);
  }
 });
 reduce.addEventListener?.('change',()=>{
  for(const video of media){
   if(reduce.matches)stop(video);
   else if(active.has(video))start(video);
  }
 });
})();
