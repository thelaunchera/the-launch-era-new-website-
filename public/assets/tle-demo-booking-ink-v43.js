/* v43 ink guard: public sample only, no booking or private customer changes. */
(()=>{
 "use strict";
 const q=new URLSearchParams(location.search);
 if(!/\/lead-private-preview\.html$/.test(location.pathname)||q.has("key")||q.get("owner_preview")==="1")return;
 const selectors=[
  "#bookingStarter #title",
  "#bookingStarter .head .demo-panel-desc",
  "#bookingStarter .tle-client-progress-step",
  "#bookingStarter .tle-client-progress small",
  "#bookingStarter #count"
 ];
 const old=new Map();
 function refresh(){
  const html=document.documentElement;
  const active=html.classList.contains("tle-demo-v42")&&html.classList.contains("tle-demo-booking-active");
  for(const selector of selectors){
   const el=document.querySelector(selector);
   if(!el)continue;
   if(active){
    if(!old.has(el))old.set(el,{color:el.style.getPropertyValue("color"),priority:el.style.getPropertyPriority("color")});
    el.style.setProperty("color","#194761","important");
   }else if(old.has(el)){
    const previous=old.get(el);
    if(previous.color)el.style.setProperty("color",previous.color,previous.priority);
    else el.style.removeProperty("color");
    old.delete(el);
   }
  }
 }
 new MutationObserver(refresh).observe(document.documentElement,{attributes:true,attributeFilter:["class"]});
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",refresh,{once:true});else refresh();
})();
