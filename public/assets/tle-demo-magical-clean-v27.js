/* Magic clean sparkles v27 — augment existing v26 bubble layer; no duplicate layer. */
(()=>{
"use strict";
const params=new URLSearchParams(location.search);
if(!/\/lead-private-preview\.html$/.test(location.pathname)||params.has("key")||params.get("owner_preview")==="1")return;
const find=()=>[
 document.querySelector(".tle-client-quicksteps"),
 document.querySelector("#tleDemoBlueRibbon"),
 document.querySelector(".tle-demo-v12-end")
];
let complete=false;
const mount=()=>{
 if(complete)return true;
 const parts=find();
 if(parts.some(p=>!p||!p.querySelector(":scope > .tle-bubble-layer-v25")))return false;
 for(const el of parts){
   const layer=el.querySelector(":scope > .tle-bubble-layer-v25");
   if(layer.querySelector(".tle-magical-spark-v27"))continue;
   for(let i=0;i<4;i++){
     const s=document.createElement("span");
     s.className="tle-magical-spark-v27";
     s.setAttribute("aria-hidden","true");
     layer.appendChild(s);
   }
 }
 complete=true;
 document.documentElement.classList.add("tle-magical-clean-v27");
 return true;
};
if(!mount()){
 const observer=new MutationObserver(()=>{if(mount())observer.disconnect()});
 observer.observe(document.documentElement,{subtree:true,childList:true});
}

window.addEventListener("load",()=>{
 for(const asset of ["tle-demo-segment-v40.js","tle-demo-compare-v40.js","tle-demo-inline-booking-v41.js","tle-demo-frequency-v41.js"]){
  const tag=document.createElement("script");
  tag.src="/assets/"+asset+"?v=20261016-v40a";
  document.head.append(tag);
 }
},{once:true});

})();
