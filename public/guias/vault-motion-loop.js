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