/* Golden Grid: sharp full-width approved still, masked motion on larger screens.
   Never request the low-resolution MP4 on phones, reduced motion, or data saver.
   Keep the still visible before playback, while stalled, and after a media error. */
(()=>{
  const video=document.querySelector('[data-gg-approved-hero-video]');
  if(!video)return;
  const art=video.closest('.hero-art');
  if(!art)return;
  const large=window.matchMedia('(min-width:761px)');
  const reduced=window.matchMedia('(prefers-reduced-motion:reduce)');
  const source=video.getAttribute('data-source');
  const saveData=Boolean(navigator.connection?.saveData);
  let inView=true;
  let loaded=false;
  let failed=false;

  function clearMotion(){
    art.removeAttribute('data-gg-video-playing');
  }
  function sync(){
    const allowed=large.matches&&!reduced.matches&&!saveData&&!failed;
    if(!allowed){
      clearMotion();
      video.pause();
      if(video.hasAttribute('src')){
        video.removeAttribute('src');
        video.preload='none';
        video.load();
      }
      loaded=false;
      return;
    }
    if(!inView||document.hidden){
      clearMotion();
      video.pause();
      return;
    }
    if(!loaded){
      loaded=true;
      video.muted=true;
      video.playsInline=true;
      video.preload='metadata';
      video.src=source;
      video.load();
    }
    const play=video.play();
    if(play&&typeof play.catch==='function')play.catch(clearMotion);
  }

  video.addEventListener('playing',()=>art.setAttribute('data-gg-video-playing',''));
  video.addEventListener('waiting',clearMotion);
  video.addEventListener('stalled',clearMotion);
  video.addEventListener('pause',clearMotion);
  video.addEventListener('error',()=>{
    failed=true;
    clearMotion();
    video.pause();
    video.hidden=true;
    art.setAttribute('data-gg-video-error','');
  });
  large.addEventListener('change',sync);
  reduced.addEventListener('change',sync);
  document.addEventListener('visibilitychange',sync);
  if('IntersectionObserver' in window){
    const observer=new IntersectionObserver(([entry])=>{
      inView=Boolean(entry?.isIntersecting);
      sync();
    },{threshold:0});
    observer.observe(art);
  }
  window.addEventListener('pagehide',()=>video.pause());
  sync();
})();
