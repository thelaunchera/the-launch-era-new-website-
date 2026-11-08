/* Original hero-motion films in the official bilingual portfolio.
   One film per selected brand, never for CRUMB. Progressive enhancement only:
   first image always remains; failed/blocked/slow video never blanks a card. */
(() => {
 "use strict";
 const stage=document.querySelector(".tle-universal .hero-gallery-stage");
 if(!stage || !("IntersectionObserver" in window)) return;
 const reduce=window.matchMedia("(prefers-reduced-motion: reduce)");
 const network=navigator.connection || navigator.mozConnection || navigator.webkitConnection;
 if(reduce.matches || network?.saveData || /(^|\b)(slow-2g|2g)(\b|$)/.test(network?.effectiveType||"")) return;
 const cards=Array.from(stage.querySelectorAll(".hero-gallery-card[data-hero-video]"))
  .filter(card=>card.dataset.demo!=="crumb");
 if(!cards.length) return;
 const slots=new Map();
 const getPlayer=card=>{
  if(slots.has(card)) return slots.get(card);
  const link=card.querySelector(".hero-gallery-hit");
  const img=link?.querySelector("img");
  const src=card.dataset.heroVideo;
  if(!link||!img||!src) return null;
  const video=document.createElement("video");
  video.className="tle-gallery-motion-video";
  video.muted=true;video.defaultMuted=true;video.autoplay=true;
  video.loop=true;video.playsInline=true;
  video.setAttribute("muted","");
  video.setAttribute("playsinline","");
  video.setAttribute("webkit-playsinline","");
  video.setAttribute("aria-hidden","true");
  video.tabIndex=-1;
  video.controls=false;
  video.preload="none";
  video.poster=img.currentSrc||img.src;
  video.addEventListener("playing",()=>card.classList.add("tle-gallery-video-playing"));
  video.addEventListener("error",()=>{card.classList.remove("tle-gallery-video-playing");video.pause();},{once:true});
  link.appendChild(video);
  slots.set(card,video);
  video.src=src;
  video.load();
  return video;
 };
 const play=card=>{
  if(document.hidden||reduce.matches) return;
  const video=getPlayer(card);
  if(!video) return;
  const promise=video.play();
  if(promise&&typeof promise.catch==="function") promise.catch(()=>{ /* Leave image visible if mobile autoplay is blocked. */ });
 };
 const pause=card=>{const video=slots.get(card);if(video&&!video.paused)video.pause();};
 const observer=new IntersectionObserver(entries=>{
  for(const entry of entries){
   if(entry.isIntersecting) play(entry.target);
   else pause(entry.target);
  }
 },{root:null,threshold:.28,rootMargin:"0px 0px -3% 0px"});
 cards.forEach(card=>observer.observe(card));
 const onVisibility=()=>{if(document.hidden)cards.forEach(pause);else cards.forEach(card=>{
  const rect=card.getBoundingClientRect();
  if(rect.bottom>0&&rect.top<innerHeight)play(card);
 });};
 const onMotion=()=>{if(reduce.matches)cards.forEach(card=>{
  pause(card);card.classList.remove("tle-gallery-video-playing");
  const video=slots.get(card);if(video){video.removeAttribute("src");video.load();}
 })};
 document.addEventListener("visibilitychange",onVisibility);
 reduce.addEventListener?.("change",onMotion);
 window.addEventListener("pagehide",()=>cards.forEach(pause),{once:true});
})();