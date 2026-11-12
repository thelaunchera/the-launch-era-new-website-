
/* Progressive-enhancement-only editorial scroll system for the TLE guides pages. */
(function(){
  "use strict";
  const doc=document.documentElement,body=document.body;
  const progress=document.getElementById("reading-progress");
  const portrait=document.querySelector(".hero-media");
  const heroVideo=document.querySelector(".hero-video");
  const reduceMotion=window.matchMedia("(prefers-reduced-motion: reduce)");
  function syncHeroVideo(){
    if(!heroVideo)return;
    if(reduceMotion.matches){
      heroVideo.pause();
      try{heroVideo.currentTime=0;}catch(_error){}
      portrait&&portrait.classList.remove("is-playing");
      return;
    }
    const playAttempt=heroVideo.play();
    if(playAttempt&&typeof playAttempt.catch==="function")playAttempt.catch(()=>portrait&&portrait.classList.remove("is-playing"));
  }
  if(heroVideo){
    heroVideo.addEventListener("playing",()=>portrait&&portrait.classList.add("is-playing"));
    heroVideo.addEventListener("error",()=>portrait&&portrait.classList.remove("is-playing"));
    heroVideo.addEventListener("stalled",()=>portrait&&portrait.classList.remove("is-playing"));
    syncHeroVideo();
    if(typeof reduceMotion.addEventListener==="function")reduceMotion.addEventListener("change",syncHeroVideo);
  }
  let rafPending=false;
  function updateScroll(){
    rafPending=false;
    const max=Math.max(0,doc.scrollHeight-window.innerHeight);
    const ratio=max>0?Math.max(0,Math.min(1,window.scrollY/max)):0;
    if(progress)progress.style.transform="scaleX("+ratio+")";
    body.classList.toggle("is-scrolled",window.scrollY>28);
    if(portrait&&window.innerWidth>760&&!reduceMotion.matches){
      const shift=Math.max(-13,Math.min(13,window.scrollY*.028));
      portrait.style.setProperty("--portrait-offset",shift+"px");
    }else if(portrait){portrait.style.setProperty("--portrait-offset","0px");}
  }
  function requestScroll(){if(rafPending)return;rafPending=true;window.requestAnimationFrame(updateScroll);}
  window.addEventListener("scroll",requestScroll,{passive:true});
  window.addEventListener("resize",requestScroll,{passive:true});
  updateScroll();

  const revealTargets=()=>Array.from(document.querySelectorAll("[data-reveal],.guide"));
  let revealObserver=null;
  if("IntersectionObserver" in window&&!reduceMotion.matches){
    doc.classList.add("scroll-ready");
    revealObserver=new IntersectionObserver(entries=>{
      for(const entry of entries)if(entry.isIntersecting){entry.target.classList.add("is-visible");revealObserver.unobserve(entry.target);}
    },{rootMargin:"0px 0px 0px 0px",threshold:0.04});
  }
  function track(element){
    if(!element||element.dataset.scrollTracked==="1")return;
    element.dataset.scrollTracked="1";
    if(revealObserver){element.dataset.reveal="";revealObserver.observe(element);}
  }
  revealTargets().forEach(track);
  const guideList=document.getElementById("guide-list");
  if(guideList&&"MutationObserver" in window){
    new MutationObserver(()=>{
      Array.from(guideList.querySelectorAll(".guide")).forEach(track);
    }).observe(guideList,{childList:true});
  }
  // Do not interfere with existing search/filter/deep-link/modals.
  const anchors=Array.from(document.querySelectorAll('.nav a[href^="#"]'));
  if("IntersectionObserver" in window){
    const sections=anchors.map(a=>document.querySelector(a.getAttribute("href"))).filter(Boolean);
    const activeObserver=new IntersectionObserver(entries=>{
      const visible=entries.filter(entry=>entry.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio);
      if(!visible.length)return;
      const id=visible[0].target.id;
      anchors.forEach(a=>{if(a.getAttribute("href")==="#"+id)a.dataset.active="true";else delete a.dataset.active;});
    },{rootMargin:"-20% 0px -55% 0px",threshold:0});
    sections.forEach(section=>activeObserver.observe(section));
  }
})();
