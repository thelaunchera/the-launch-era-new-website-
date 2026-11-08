/* Golden Grid: retain the HD photo at all sizes.
   Tablet/desktop: crisp original still with lightweight SVG syrup shine; standalone phones <=520px:
   512px video at native-or-smaller width, only a small top/bottom safe-edge crop.
   In-app iframe previews, data saver, reduced motion and degraded media: still. */
(()=>{
  const video=document.querySelector('[data-gg-approved-hero-video]');
  if(!video)return;
  const art=video.closest('.hero-art');
  if(!art)return;
  const photo=art.querySelector(':scope > img');
  const large=window.matchMedia('(min-width:761px)');
  const phone=window.matchMedia('(max-width:520px)');
  const reduced=window.matchMedia('(prefers-reduced-motion:reduce)');
  const standalone=window.self===window.top;
  const source=video.getAttribute('data-source');
  const saveData=Boolean(navigator.connection?.saveData);
  let inView=true;
  let loaded=false;
  let failed=false;
  let mobileRejected=false;

  function clearMotion(){
    art.removeAttribute('data-gg-video-playing');
  }
  function validatePhoneQuality(){
    if(!phone.matches||!video.videoWidth||!video.videoHeight)return;
    const width=art.getBoundingClientRect().width;
    const ratio=video.videoWidth/video.videoHeight;
    const originalRatio=photo?.naturalWidth&&photo?.naturalHeight
      ? photo.naturalWidth/photo.naturalHeight
      : ratio;
    // Reject material upscaling or large framing differences; the small 3:4-to-4:5
    // crop stays within the approved poster's empty top/bottom margins.
    if(video.videoWidth<width*.98||Math.abs(ratio-originalRatio)>.07){
      mobileRejected=true;
      sync();
    }
  }
  function sync(){
    const phoneAllowed=phone.matches&&standalone&&!mobileRejected;
    // The original 512px movie is for eligible standalone phones only.
    // Never decode or overlay it across iPad/tablet/desktop.
    const allowed=phoneAllowed&&!reduced.matches&&!saveData&&!failed;
    const sheen=large.matches&&!reduced.matches&&inView&&!document.hidden;
    if(sheen)art.setAttribute('data-gg-sheen-active','');
    else art.removeAttribute('data-gg-sheen-active');
    if(phoneAllowed&&allowed)art.setAttribute('data-gg-mobile-video-eligible','');
    else art.removeAttribute('data-gg-mobile-video-eligible');
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
    validatePhoneQuality();
    if(mobileRejected&&phone.matches)return;
    const playback=video.play();
    if(playback&&typeof playback.catch==='function')playback.catch(clearMotion);
  }

  video.addEventListener('loadedmetadata',validatePhoneQuality);
  photo?.addEventListener('load',validatePhoneQuality);
  video.addEventListener('playing',()=>{
    validatePhoneQuality();
    if(!mobileRejected||!phone.matches)art.setAttribute('data-gg-video-playing','');
  });
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
  phone.addEventListener('change',sync);
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
