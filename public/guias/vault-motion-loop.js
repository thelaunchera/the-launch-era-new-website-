/* Dailin Vault: visually bridge the last recorded frame to the first.
 * Does not alter the approved footage or load a second video. */
(function(){
 "use strict";
 const video=document.querySelector(".hero-vault .hero-video");
 const media=document.querySelector(".hero-vault .hero-media");
 if(!video||!media)return;
 const reduced=window.matchMedia("(prefers-reduced-motion: reduce)");
 let bridging=false;
 let releaseTimer=0;
 function bridge(next){
   if(reduced.matches){media.classList.remove("is-loop-bridging");bridging=false;return;}
   if(next===bridging)return;
   bridging=next;
   media.classList.toggle("is-loop-bridging",next);
 }
 function check(){
   const duration=video.duration,current=video.currentTime;
   if(reduced.matches||!Number.isFinite(duration)||duration<1||video.paused||video.readyState<2)return;
   if(duration-current<0.58)bridge(true);
   else if(current<0.34&&bridging){
     clearTimeout(releaseTimer);
     releaseTimer=setTimeout(()=>bridge(false),90);
   }
 }
 video.addEventListener("timeupdate",check,{passive:true});
 video.addEventListener("seeked",()=>{if(video.currentTime<0.6&&bridging){clearTimeout(releaseTimer);releaseTimer=setTimeout(()=>bridge(false),90);}},{passive:true});
 video.addEventListener("playing",()=>{if(video.currentTime<0.5)bridge(false);},{passive:true});
 video.addEventListener("error",()=>bridge(true),{passive:true});
 video.addEventListener("stalled",()=>bridge(true),{passive:true});
 reduced.addEventListener?.("change",()=>bridge(false));
 document.addEventListener("visibilitychange",()=>{if(document.hidden)bridge(false);});
})();

/* Interaction adapted from a living-portrait reference. The original MP4 remains
 * the ONLY moving face; no unrelated portrait swaps, double faces or overlays.
 * Pointer input is deliberately visual only. Touch must retain native scrolling. */
(function(){
 "use strict";
 const art=document.querySelector(".hero-vault .hero-art");
 const portrait=art?.querySelector(".hero-media");
 if(!art||!portrait)return;
 const reduced=window.matchMedia("(prefers-reduced-motion: reduce)");
 const fine=window.matchMedia("(hover:hover) and (pointer:fine)");
 const clamp=(n,min,max)=>Math.min(max,Math.max(min,n));
 let raf=0,tapTimer=0,active=false,lastX=0,lastY=0;
 function render(){
   raf=0;
   if(!active||!fine.matches||reduced.matches)return;
   const box=art.getBoundingClientRect();
   if(!box.width||!box.height)return;
   const x=clamp(((lastX-box.left)/box.width-.5)*2,-1,1);
   const y=clamp(((lastY-box.top)/box.height-.5)*2,-1,1);
   // Very restrained parallax: the person's head stays inside the portrait.
   art.style.setProperty("--vault-pan-x",(x*4).toFixed(2)+"px");
   art.style.setProperty("--vault-pan-y",(y*3).toFixed(2)+"px");
   art.style.setProperty("--vault-card-x",(-x*2.4).toFixed(2)+"px");
   art.style.setProperty("--vault-card-y",(-y*2).toFixed(2)+"px");
   art.style.setProperty("--vault-turn-x",(-y*1.4).toFixed(2)+"deg");
   art.style.setProperty("--vault-turn-y",(x*1.8).toFixed(2)+"deg");
 }
 function reset(){
   active=false;
   if(raf){cancelAnimationFrame(raf);raf=0;}
   for(const property of ["--vault-pan-x","--vault-pan-y","--vault-card-x","--vault-card-y","--vault-turn-x","--vault-turn-y"]){
     art.style.removeProperty(property);
   }
   art.classList.remove("is-portrait-hovering");
 }
 art.addEventListener("pointerenter",event=>{
   if(reduced.matches||!fine.matches||event.pointerType==="touch")return;
   active=true;art.classList.add("is-portrait-hovering");
 });
 art.addEventListener("pointermove",event=>{
   if(!fine.matches||reduced.matches||event.pointerType==="touch")return;
   active=true;lastX=event.clientX;lastY=event.clientY;
   if(!raf)raf=requestAnimationFrame(render);
 });
 art.addEventListener("pointerleave",reset);
 art.addEventListener("pointerdown",event=>{
   if(reduced.matches)return;
   if(event.pointerType!=="touch"&&event.pointerType!=="pen")return;
   clearTimeout(tapTimer);
   art.classList.remove("is-portrait-tapped");
   // Restart the spring transition on the next frame without swallowing taps.
   requestAnimationFrame(()=>art.classList.add("is-portrait-tapped"));
   tapTimer=setTimeout(()=>art.classList.remove("is-portrait-tapped"),360);
 },{passive:true});
 reduced.addEventListener?.("change",reset);
 window.addEventListener("blur",reset);
 document.addEventListener("visibilitychange",()=>{if(document.hidden)reset();});
})();