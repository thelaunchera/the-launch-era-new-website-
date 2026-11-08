/* SOVA | approved photographic hero, no video/animated overlays.
   Refresh only the hero image on React language rerender; preserve all
   product and campaign images. The CSS photographic backdrop prevents
   any flash of the previous still before image decode. */
(() => {
 "use strict";
 if (document.documentElement.dataset.tleOneMotion !== "sova") return;
 const source = new URL("./media/sova-hero-seamless-cobalt-20261108.png",document.baseURI).href;
 function apply(){
   const host=document.querySelector(".hero .hero-media");
   const image=host?.querySelector(":scope > img");
   if(!image)return;
   if(image.getAttribute("src")===source && host.classList.contains("sova-photo-loaded"))return;
   if(image.getAttribute("src")!==source){
     host.classList.remove("sova-photo-loaded");
     image.src=source;
     image.removeAttribute("srcset");
     image.setAttribute("width","1536");
     image.setAttribute("height","1024");
     image.alt="SOVA headphones in ivory, worn by a woman relaxing on a continuous cobalt blue sofa and matching backdrop";
   }
   const current=image;
   const reveal=()=>{if(host.isConnected && current.isConnected && current.naturalWidth>0)host.classList.add("sova-photo-loaded");};
   if(image.complete && image.naturalWidth)reveal();
   else image.addEventListener("load",reveal,{once:true});
 }
 function boot(){
   apply();
   const root=document.querySelector("#app")||document.body;
   let queued=false;
   new MutationObserver(changes=>{
     if(queued)return;
     if(changes.some(c=>[...c.addedNodes,...c.removedNodes].some(n=>
       n.nodeType===1 && (n.matches?.(".hero,.hero-media") || n.querySelector?.(".hero .hero-media"))))){
       queued=true;requestAnimationFrame(()=>{queued=false;apply();});
     }
   }).observe(root,{childList:true,subtree:true});
 }
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});
 else boot();
})();
