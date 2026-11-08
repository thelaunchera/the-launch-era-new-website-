/* SOVA cobalt-blue Canva animation, iPad/Safari playback without controls.
   Apple browsers use a real frame-by-frame animated WebP extracted from the
   approved Canva MP4, avoiding automatic-video playback blocks. Everywhere
   else: inline silent MP4 with an animated fallback if autoplay is denied.
   Reduced-motion users receive the matching still poster instead. */
(() => {
  "use strict";
  if (document.documentElement.dataset.tleOneMotion !== "sova") return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  const source = new URL("./media/hero-canva-blue-20261108.mp4", document.baseURI).href;
  const animation = new URL("./media/hero-canva-blue-safari-loop-20261108.webp", document.baseURI).href;
  const poster = new URL("./media/hero-canva-blue-poster-20261108.webp", document.baseURI).href;
  const ua = navigator.userAgent || "";
  const apple = /iPhone|iPad|iPod/i.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1) ||
    (/Safari/i.test(ua) && !/Chrome|Chromium|Edg|OPR|SamsungBrowser/i.test(ua));
  let host=null,video=null,loop=null,queued=false,watchdog=null,entered=false;

  function inView() {
    if (!host || !host.isConnected || document.hidden) return false;
    const rect=host.getBoundingClientRect();
    return rect.width>0 && rect.height>0 && rect.bottom>=-80 && rect.top<=innerHeight+80;
  }
  function clear() {
    if (watchdog) { clearTimeout(watchdog); watchdog=null; }
    if (video) { video.pause(); video.remove(); }
    if (loop) loop.remove();
    if (host) host.classList.remove("sova-motion-ready","sova-loop-ready");
    video=null;loop=null;host=null;entered=false;
  }
  function posterReady(target) {
    const img=target.querySelector(":scope > img:not([data-sova-animated-loop])");
    if (!img) return;
    const done=()=>{if (target.isConnected && img.getAttribute("src")===poster) target.classList.add("sova-poster-ready");};
    target.classList.remove("sova-poster-ready");
    if (img.getAttribute("src")!==poster) {
      img.addEventListener("load",done,{once:true});
      img.src=poster;img.removeAttribute("srcset");
    }
    if (img.complete && img.naturalWidth) done();
  }
  function showFrameLoop() {
    if (reduce.matches || !host || !host.isConnected || loop?.isConnected) return;
    const current=host;
    if (video) {video.pause();video.remove();video=null;}
    const img=document.createElement("img");
    img.dataset.sovaAnimatedLoop="";
    img.setAttribute("aria-hidden","true");
    img.setAttribute("alt","");
    img.decoding="async";
    img.loading="eager";
    img.fetchPriority="high";
    img.addEventListener("load",()=>{
      if (img!==loop || current!==host) return;
      img.classList.add("sova-loop-playing");
      current.classList.add("sova-loop-ready","sova-motion-ready");
    },{once:true});
    img.addEventListener("error",()=>{
      if (img!==loop) return;
      img.remove();loop=null;current.classList.remove("sova-loop-ready");
    },{once:true});
    current.append(img);loop=img;img.src=animation;
    if (img.complete && img.naturalWidth) {
      img.classList.add("sova-loop-playing");
      current.classList.add("sova-loop-ready","sova-motion-ready");
    }
  }
  function reveal(v) {
    if (v!==video || !v.isConnected || v.readyState<2 || v.paused) return;
    const apply=()=>{
      if(v===video && v.isConnected && !v.paused) {
        entered=true;v.classList.add("sova-motion-playing");host?.classList.add("sova-motion-ready");
      }
    };
    if (typeof v.requestVideoFrameCallback==="function") v.requestVideoFrameCallback(apply);
    else requestAnimationFrame(()=>requestAnimationFrame(apply));
  }
  function autoPlay() {
    if (!video || reduce.matches || !inView()) {if(video && !video.paused) video.pause();return;}
    if (!video.paused){reveal(video);return;}
    const v=video, request=v.play();
    if (request?.then) request.then(()=>reveal(v)).catch(()=>{
      if(v===video) showFrameLoop();
    });
  }
  function mount() {
    const found=document.querySelector(".hero .hero-media");
    if (!found) {if(host && !host.isConnected) clear();return;}
    if(found===host) {if(video) autoPlay();return;}
    clear();host=found;
    if(getComputedStyle(host).position==="static") host.style.position="relative";
    posterReady(host);
    if (reduce.matches) return;
    if (apple) {showFrameLoop();return;}
    const v=document.createElement("video");
    v.dataset.sovaHqMotion="";
    v.setAttribute("data-tle-cinematic-hero","sova");
    v.setAttribute("aria-hidden","true");
    v.muted=true;v.defaultMuted=true;v.setAttribute("muted","");
    v.playsInline=true;v.setAttribute("playsinline","");v.setAttribute("webkit-playsinline","");
    v.autoplay=true;v.setAttribute("autoplay","");
    v.loop=true;v.setAttribute("loop","");
    v.controls=false;v.tabIndex=-1;v.preload="auto";
    v.disablePictureInPicture=true;v.disableRemotePlayback=true;
    v.poster=poster;
    v.addEventListener("loadedmetadata",()=>{
      if(v!==video)return;
      const ratio=v.videoWidth/Math.max(v.videoHeight,1);
      if(v.videoWidth<1200||v.videoHeight<850||ratio<1.32||ratio>1.48) {showFrameLoop();return;}
      autoPlay();
    });
    v.addEventListener("loadeddata",()=>reveal(v));
    v.addEventListener("playing",()=>reveal(v));
    v.addEventListener("error",()=>{if(v===video)showFrameLoop();});
    host.append(v);video=v;v.src=source;autoPlay();
    watchdog=setTimeout(()=>{
      if(v===video && inView() && (v.paused || v.readyState<2 || (v.currentTime<0.06 && !entered))) showFrameLoop();
    },1800);
  }
  function schedule(){
    if(queued)return;
    queued=true;requestAnimationFrame(()=>{queued=false;mount();});
  }
  function boot(){
    mount();
    window.addEventListener("scroll",autoPlay,{passive:true});
    window.addEventListener("resize",schedule,{passive:true});
    document.addEventListener("visibilitychange",autoPlay);
    reduce.addEventListener?.("change",()=>{if(host)clear();schedule();});
    const root=document.querySelector("#app")||document.body;
    new MutationObserver(changes=>{
      if(changes.some(c=>[...c.addedNodes,...c.removedNodes].some(n=>
        n.nodeType===1 && (n.matches?.(".hero,.hero-media") || n.querySelector?.(".hero .hero-media"))))) schedule();
    }).observe(root,{childList:true,subtree:true});
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});
  else boot();
})();
