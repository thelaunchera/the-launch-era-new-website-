/* TLE Motion Heroes · seven approved brand heroes only · 2026-11-08
   The video and initial poster share the SAME first frame to prevent scene switching.
   Never change forms, orders, galleries, or links. No video on CRUMB. */
(()=>{"use strict";
 const brand=document.documentElement.dataset.tleOneMotion;
 const heroSlots={
  "casa-brownie":".hero-photo",
  "golden-grid":".hero-art",
  "yummm":'.hero-slide[data-slide="1"]',
  "aftr":".hero-image",
  "ivory-and-bloom":".hero .hero-photo",
  "marea-wigs-miami":".hero-visual",
  "sova":".hero-media"
 };
 const selector=heroSlots[brand];
 if(!selector)return;
 const reduce=matchMedia("(prefers-reduced-motion: reduce)");
 const slow=!!navigator.connection?.saveData;
 let host=null,video=null,queued=false;
 const preferred={ "sova":"media/hero-motion-framed-HD-20261108.mp4","marea-wigs-miami":"media/hero-motion-hq-20261108.mp4","casa-brownie":"media/hero-motion-hq-20261108.mp4" };
 const source=new URL(preferred[brand]||"media/hero-motion-20261108.mp4",document.baseURI).href;
 const poster=new URL(brand==="sova"?"resources/01-hero.png":brand==="marea-wigs-miami"?"resources/01-hero.png":"media/hero-motion-poster-hq.webp",document.baseURI).href;
 function visible(){
  if(!host||!video||!host.isConnected||document.hidden||reduce.matches)return false;
  const r=host.getBoundingClientRect();
  return r.width>0&&r.height>0&&r.bottom>=-100&&r.top<=innerHeight+100;
 }
 function reveal(){
  if(!video||!video.isConnected||!video.readyState||!visible())return;
  const v=video;
  const commit=()=>{if(v===video&&v.isConnected&&visible())v.style.opacity="1";};
  if(typeof v.requestVideoFrameCallback==="function"){
   v.requestVideoFrameCallback(commit);
  }else requestAnimationFrame(()=>requestAnimationFrame(commit));
 }
 function update(){
  if(!video)return;
  if(!visible()){video.pause();if(reduce.matches)video.style.opacity="0";return;}
  const result=video.play();
  if(result&&typeof result.then==="function")result.then(reveal).catch(()=>{});
 }
 function unmount(){
  if(video){video.pause();video.remove();}
  video=null;host=null;
 }
 function mount(){
  if(slow||reduce.matches){if(video)unmount();return;}
  const target=document.querySelector(selector);
  if(!target){if(host&&!host.isConnected)unmount();return;}
  if(target===host&&video?.isConnected){update();return;}
  if(video)unmount();
  host=target;
  if(getComputedStyle(host).position==="static")host.style.position="relative";
  const v=document.createElement("video");
  v.setAttribute("data-tle-cinematic-hero",brand);
  v.setAttribute("data-tle-reactive-photo","");
  v.setAttribute("aria-hidden","true");
  v.playsInline=true;v.muted=true;v.defaultMuted=true;v.loop=true;v.autoplay=true;
  v.setAttribute("playsinline","");v.setAttribute("muted","");v.setAttribute("loop","");
  v.preload="auto";v.controls=false;v.tabIndex=-1;
  v.disablePictureInPicture=true;v.disableRemotePlayback=true;
  v.poster=poster;
  v.style.cssText="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center;z-index:1;opacity:0;pointer-events:none;transition:opacity .24s ease;transform:translateZ(0);";
  if(brand==="casa-brownie"||brand==="marea-wigs-miami"){
    v.style.setProperty("object-fit","contain","important");
    v.style.setProperty("scale","1","important");
  }
  if(brand==="sova"){
    v.style.setProperty("object-fit","cover","important");
    v.style.setProperty("scale","1","important");
  }
  v.addEventListener("loadeddata",reveal);
  v.addEventListener("playing",reveal);
  v.addEventListener("error",()=>{v.pause();v.remove();if(video===v){video=null;host=null;}});
  host.append(v);video=v;
  v.src=source;
  update();
 }
 function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;mount();});}
 function boot(){
  mount();
  window.addEventListener("scroll",update,{passive:true});
  window.addEventListener("resize",schedule,{passive:true});
  document.addEventListener("visibilitychange",update);
  reduce.addEventListener?.("change",schedule);
  // React heroes may mount after page load or rerender after a language change.
  const root=document.querySelector("#app")||document.querySelector("main")||document.body;
  new MutationObserver(changes=>{
    if(changes.some(c=>[...c.addedNodes,...c.removedNodes].some(n=>
      n.nodeType===1&&(n.matches?.(".hero,.hero-media,.hero-visual,.hero-art,.hero-photo,.hero-slide")||
      n.querySelector?.(selector)))))schedule();
  }).observe(root,{childList:true,subtree:true});
 }
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();
})();
/* Approved original hero photos receive their own editorial section in the matching demo. */
(()=>{const s=document.createElement("script");s.defer=true;s.src="/assets/tle-original-hero-moments-20261108.js?v=1";document.head.appendChild(s)})();
