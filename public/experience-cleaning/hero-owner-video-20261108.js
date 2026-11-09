/* Keep the owner-approved cleaning video looping whenever this page is active.
   Native video loops; the first-frame poster never flashes an unrelated scene. */
(()=>{"use strict";
 const video=document.querySelector(".cleaning-motion-video");
 const frame=document.querySelector(".cleaning-motion-portrait");
 if(!video||!frame)return;
 const reduce=matchMedia("(prefers-reduced-motion: reduce)");
 const saveData=Boolean(navigator.connection?.saveData);
 let alive=true;
 const allowed=()=>alive&&!document.hidden&&!reduce.matches&&!saveData;
 function showFrame(){
  const reveal=()=>{if(allowed()&&!video.paused&&video.readyState>=2)frame.classList.add("is-playing");};
  if(typeof video.requestVideoFrameCallback==="function")video.requestVideoFrameCallback(reveal);
  else requestAnimationFrame(()=>requestAnimationFrame(reveal));
 }
 function start(){
  if(!allowed()){video.pause();frame.classList.remove("is-playing");return;}
  video.muted=true;video.defaultMuted=true;video.loop=true;
  const result=video.play();
  if(result?.catch)result.catch(()=>frame.classList.remove("is-playing"));
 }
 video.addEventListener("playing",showFrame);
 video.addEventListener("loadeddata",showFrame);
 video.addEventListener("error",()=>{frame.classList.remove("is-playing");});
 video.addEventListener("ended",()=>{video.currentTime=0;start();});
 document.addEventListener("visibilitychange",start);
 reduce.addEventListener?.("change",start);
 window.addEventListener("pageshow",start);
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});
 else start();
})();
