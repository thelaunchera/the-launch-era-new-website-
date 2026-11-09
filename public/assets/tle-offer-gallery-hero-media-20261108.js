/* Real demo hero media in the bilingual public Website offer.
   Every eligible brand uses its own approved MP4 and matching first-frame poster.
   Playback starts only in the visible gallery, remains muted/inline,
   and never hides the actual photograph if video fails or is blocked. */
(()=>{
 'use strict';
 const stage=document.querySelector('.tle-universal .hero-gallery-stage');
 if(!stage)return;

 // Reuse the corresponding approved hero clip for every eligible portfolio cover.
 // Existing YUMMM markup is preserved; static-only brands are never upgraded.
 const heroMedia={
  'ivory-and-bloom':['/demos/ivory-and-bloom/media/hero-motion-20261108.mp4','/demos/ivory-and-bloom/media/hero-motion-poster-hq.webp'],
  'casa-brownie':['/demos/casa-brownie/media/hero-motion-20261108.mp4','/demos/casa-brownie/media/hero-motion-poster-hq.webp'],
  'havana-19':['/demos/havana-19/media/hero-motion-20261108.mp4','/demos/havana-19/media/hero-motion-poster-hq.webp'],
  'soluna-yoga':['https://thelaunchera.github.io/demo-booking-landing-/soluna-yoga/media/hero-motion-20261108.mp4','https://thelaunchera.github.io/demo-booking-landing-/soluna-yoga/media/hero-motion-poster-hq.webp'],
  'wok-social':['https://thelaunchera.github.io/demo-booking-landing-/wok-social/media/hero-motion-20261108.mp4','https://thelaunchera.github.io/demo-booking-landing-/wok-social/media/hero-motion-poster-hq.webp']
 };
 for(const card of stage.querySelectorAll('.hero-gallery-card[data-demo]')){
  const pair=heroMedia[card.dataset.demo],link=card.querySelector('.hero-gallery-hit');
  if(!pair||!link||link.querySelector('video'))continue;
  const photo=link.querySelector('img'),oldSrc=photo?.getAttribute('src');
  if(photo&&oldSrc){
   photo.addEventListener('error',()=>{if(photo.getAttribute('src')!==oldSrc)photo.src=oldSrc;},{once:true});
   photo.src=pair[1];
  }
  const video=document.createElement('video');
  video.className='hero-gallery-motion';
  video.dataset.motionSrc=pair[0];
  video.poster=pair[1];
  video.muted=true;video.defaultMuted=true;video.playsInline=true;video.loop=true;
  video.setAttribute('muted','');video.setAttribute('playsinline','');video.setAttribute('loop','');
  video.setAttribute('aria-hidden','true');video.tabIndex=-1;video.preload='none';video.disablePictureInPicture=true;
  link.appendChild(video);
 }
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
  video.addEventListener('canplay',()=>{if(active.has(video))start(video);});
  video.addEventListener('ended',()=>{video.currentTime=0;if(active.has(video))start(video);});
  video.addEventListener('stalled',()=>{if(active.has(video)&&!document.hidden)video.play().catch(()=>{});});
 }
 if('IntersectionObserver' in window){
  const observer=new IntersectionObserver(entries=>{
   for(const entry of entries){
    const video=entry.target;
    if(entry.isIntersecting&&entry.intersectionRatio>=.01){
     active.add(video);start(video);
    }else{
     active.delete(video);stop(video);
    }
   }
  },{root:stage,threshold:[0,.01,.25,.65]});
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
