/* v24 — typographic continuity, only on unkeyed public cleaning sample.
 * The CSS supplies chapter color hierarchy; this script only marks editorial
 * emphasis in existing text, never changes content, booking or client data.
 */
(()=>{
"use strict";
const params=new URLSearchParams(location.search);
if(!/\/lead-private-preview\.html$/.test(location.pathname)
 ||params.has("key")||params.get("owner_preview")==="1")return;
const init=()=>{
 if(!document.documentElement.classList.contains("tle-editorial-v23"))return;
 document.documentElement.classList.add("tle-editorial-contrast-v24");
 const es=params.get("lang")==="es";
 function emphasize(el,tail){
   if(!el||!tail||el.querySelector("em"))return;
   const source=el.textContent.trim();
   const at=source.toLocaleLowerCase().lastIndexOf(tail.toLocaleLowerCase());
   if(at<0||at+tail.length!==source.length)return;
   const beginning=document.createTextNode(source.slice(0,at));
   const italic=document.createElement("em");
   italic.textContent=source.slice(at);
   el.replaceChildren(beginning,italic);
 }
 emphasize(document.querySelector(".tle-client-quicksteps .tle-steps-intro h3"),es?"sencillo":"simpler");
 emphasize(document.querySelector("#demoHow .demo-bottom-text h2"),es?"una casa en hogar.":"feel like home.");
 emphasize(document.querySelector("#tleDemoAreas #tleAreasTitle"),es?"más cerca.":"closer to you.");
};
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});
else init();
})();
