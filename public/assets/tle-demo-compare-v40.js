/* Accessible comparison on already-existing matched sample photos. */
(()=>{"use strict";
function init(){
 if(!document.documentElement.classList.contains("demo-editorial"))return;
 const rail=document.getElementById("tleV31GalleryRail");if(!rail)return;
 const es=new URLSearchParams(location.search).get("lang")==="es";
 rail.querySelectorAll(".tle-v31-gallery-card").forEach(card=>{
  const pair=card.querySelector(".tle-v31-compare-pair");
  if(!pair||pair.querySelectorAll("figure img").length!==2)return;
  pair.classList.add("tle-v40-wipe");
  const divider=document.createElement("span");
  divider.className="tle-v40-divider";divider.setAttribute("aria-hidden","true");
  const handle=document.createElement("span");
  handle.className="tle-v40-handle";handle.setAttribute("aria-hidden","true");
  handle.textContent="↔";
  const slider=document.createElement("input");
  slider.type="range";slider.min="0";slider.max="100";slider.value="50";
  slider.className="tle-v40-slider";
  slider.setAttribute("aria-label",es?"Comparar antes y después":"Compare before and after");
  slider.addEventListener("input",()=>pair.style.setProperty("--tle-v40-split",slider.value+"%"));
  pair.append(divider,handle,slider);
 });
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();