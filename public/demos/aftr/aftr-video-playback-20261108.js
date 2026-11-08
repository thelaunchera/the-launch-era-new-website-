/* AFTR-only native cinematic playback. One video per hero; no shared mount race. */
(()=>{'use strict';
  const video=document.getElementById('aftrHeroVideo');
  if(!video)return;
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  const saveData=()=>Boolean(navigator.connection?.saveData);
  const sync=()=>{
    if(document.hidden||reduced.matches||saveData()){video.pause();return}
    if(video.error){video.classList.add('aftr-video-unavailable');return}
    const attempt=video.play();
    if(attempt&&typeof attempt.catch==='function')attempt.catch(()=>{/* Keep poster visible; retry on gesture. */});
  };
  video.addEventListener('error',()=>video.classList.add('aftr-video-unavailable'));
  video.addEventListener('loadeddata',()=>video.classList.remove('aftr-video-unavailable'));
  video.addEventListener('canplay',sync);
  window.addEventListener('pageshow',sync);
  document.addEventListener('visibilitychange',sync);
  reduced.addEventListener?.('change',sync);
  document.addEventListener('pointerdown',sync,{once:true,passive:true});
  video.muted=true;
  video.defaultMuted=true;
  sync();
})();