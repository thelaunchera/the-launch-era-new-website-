/* Protected views never carry the demo-editorial class. */
(()=>{ "use strict";
function init(){
 if(!document.documentElement.classList.contains("demo-editorial"))return;
 const tabs=document.getElementById("categoryTabs");if(!tabs)return;
 tabs.classList.add("tle-v40-segment");
 const items=[...tabs.querySelectorAll("button[data-category]")];
 function sync(){
   const business=items.find(x=>x.dataset.category==="commercial");
   tabs.style.setProperty("--tle-v40-index",business&&business.classList.contains("sel")?"1":"0");
   items.forEach(x=>x.setAttribute("aria-pressed",String(x.classList.contains("sel"))));
 }
 items.forEach(x=>x.addEventListener("click",sync));
 new MutationObserver(sync).observe(tabs,{subtree:true,attributes:true,attributeFilter:["class"]});
 sync();
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();
