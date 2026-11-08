/* Golden Grid: only load the owner-approved muted hero video when in view.
   Never hide the still poster until a playable frame exists; pause when hidden.
   No other demo's motion or checkout logic is touched. */
(()=>{
  'use strict';
  const hero=document.querySelector('html[data-tle-one-motion="golden-grid"] .hero-art');
  if(!hero)return;
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)');
  const saveData=Boolean(navigator.connection?.saveData);
  const file='./media/hero-syrup-20261108.mp4';
  const poster='./media/hero-syrup-poster-20261108.webp';
  let visible=false,video=null,framePending=false;
  const active=()=>visible&&!document.hidden&&!reduce.matches&&!saveData&&hero.isConnected;
  function ready(){
    if(!video||!active()||video.readyState<2||video.paused)return;
    if(framePending)return;
    framePending=true;
    const v=video;
    const show=()=>{
      framePending=false;
      if(v===video&&active()&&!v.paused)v.dataset.frameReady='true';
    };
    if(typeof v.requestVideoFrameCallback==='function'){
      v.requestVideoFrameCallback(show);
    }else{
      requestAnimationFrame(()=>requestAnimationFrame(show));
    }
  }
  function mount(){
    if(video||!active())return;
    const v=document.createElement('video');
    v.className='golden-hero-video';
    v.setAttribute('aria-hidden','true');
    v.setAttribute('data-tle-reactive-photo','');
    v.muted=true;v.defaultMuted=true;v.playsInline=true;v.loop=true;
    v.autoplay=true;v.preload='metadata';v.controls=false;
    v.disablePictureInPicture=true;v.disableRemotePlayback=true;
    v.setAttribute('playsinline','');v.setAttribute('muted','');
    v.poster=poster;
    v.addEventListener('loadeddata',ready);
    v.addEventListener('playing',ready);
    v.addEventListener('error',()=>{
      v.pause();v.remove();if(video===v)video=null;
    },{once:true});
    hero.appendChild(v);
    video=v;
    v.src=file;
  }
  function update(){
    if(!active()){
      if(video){video.pause();delete video.dataset.frameReady;}
      return;
    }
    mount();
    if(!video)return;
    const playing=video.play();
    if(playing&&typeof playing.then==='function')playing.then(ready).catch(()=>{
      // On restrictive iOS webviews the matched still poster remains visible.
      if(video)delete video.dataset.frameReady;
    });
  }
  const observer='IntersectionObserver' in window?
    new IntersectionObserver(entries=>{
      visible=Boolean(entries[0]?.isIntersecting);update();
    },{rootMargin:'160px 0px',threshold:0}):null;
  if(observer)observer.observe(hero);
  else{visible=true;update();}
  document.addEventListener('visibilitychange',update,{passive:true});
  reduce.addEventListener?.('change',update);
  window.addEventListener('pagehide',()=>{
    if(video)video.pause();
  },{once:true});
  // Retry blocked inline autoplay after an intentional touch, never intercept UI.
  hero.addEventListener('pointerdown',()=>{
    if(active()&&video?.paused)update();
  },{passive:true});
})();
