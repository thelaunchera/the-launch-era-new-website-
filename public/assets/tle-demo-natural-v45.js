/* v45: normalize the public sample's editorial content, leave service
   onclick handlers, booking fields, calendar and tenant data untouched. */
(()=>{"use strict";
const q=new URLSearchParams(location.search);
if(!/\/lead-private-preview\.html$/.test(location.pathname)||q.has("key")||q.get("owner_preview")==="1")return;
function init(){
 const root=document.documentElement,main=document.getElementById("main");
 if(!root.classList.contains("demo-editorial")||!root.classList.contains("tle-demo-v44")||!main)return false;
 if(root.classList.contains("tle-demo-v45"))return true;
 root.classList.add("tle-demo-v45");
 // The previous editorial releases duplicated notices and quote descriptions.
 // Remove only inert text; never remove any button, request control or form field.
 for(const el of main.querySelectorAll(":scope > .demo-services-note,:scope > .tle-client-notice,:scope > .tle-services-disclaimer-v21,.tle-service-subsection")){
  el.remove();
 }
 const logo=document.querySelector("#demoEditorialNav #demoBrandName .tle-bloom-name");
 if(logo){
  logo.style.setProperty("background","transparent","important");
  logo.style.setProperty("background-image","none","important");
  logo.style.setProperty("color","#173e5a","important");
  logo.style.setProperty("-webkit-text-fill-color","#173e5a","important");
  logo.style.setProperty("text-shadow","none","important");
  logo.style.setProperty("transition","none","important");
 }
 // The original photo service and quote button click handlers remain in place.
 // The business confirmation disclaimer stays in the actual request steps.
 return true;
}
if(!init()){
 const ob=new MutationObserver(()=>{if(init())ob.disconnect();});
 ob.observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:["class"]});
 window.addEventListener("load",()=>{if(init())ob.disconnect()},{once:true});
}
})();
