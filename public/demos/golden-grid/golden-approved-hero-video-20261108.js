/* Golden Grid - desktop/tablet only. The iPhone WebView never requests the MP4. */
(()=>{
  const video=document.querySelector('[data-gg-approved-hero-video]');
  if(!video) return;
  const desktop=window.matchMedia('(min-width:761px)');
  const reduce=window.matchMedia('(prefers-reduced-motion:reduce)');
  const src=video.getAttribute('data-source');
  let ready=false;
  function sync(){
    const allowed=desktop.matches&&!reduce.matches;
    if(!allowed){
      video.pause();
      if(video.hasAttribute('src')) {
        video.removeAttribute('src');
        video.removeAttribute('preload');
        video.load();
      }
      ready=false;
      return;
    }
    if(!ready){
      video.muted=true;
      video.playsInline=true;
      video.preload='auto';
      video.src=src;
      video.load();
      ready=true;
    }
    if(document.hidden){ video.pause();return; }
    const play=video.play();
    if(play&&typeof play.catch==='function')play.catch(()=>{ /* first frame stays visible */ });
  }
  video.addEventListener('error',()=>{
    video.pause();
    video.hidden=true;
    video.closest('.hero-art')?.setAttribute('data-gg-video-error','');
  });
  desktop.addEventListener('change',sync);
  reduce.addEventListener('change',sync);
  document.addEventListener('visibilitychange',sync);
  window.addEventListener('pagehide',()=>video.pause());
  sync();
})();
