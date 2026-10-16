/* v47: Google's Drive home library, served as locally hosted image assets.
   Only the fictional, unkeyed cleaning sample; customer demos stay untouched. */
(()=>{"use strict";
const query=new URLSearchParams(location.search);
if(!/\/lead-private-preview\.html$/.test(location.pathname)||query.has("key")||query.get("owner_preview")==="1")return;
const assets=[
  "/assets/drive-house-gallery/whole-home.png",
  "/assets/drive-house-gallery/pristine-kitchen.png",
  "/assets/drive-house-gallery/miami-condo.png"
];
function apply(){
 const root=document.documentElement;
 if(!root.classList.contains("demo-editorial")||!root.classList.contains("tle-demo-v45"))return false;
 if(root.classList.contains("tle-demo-house-photos-v47"))return true;
 const list=document.getElementById("residentialServiceList");
 const images=[...(list?.querySelectorAll(":scope > button.service.tle-service-has-photo-v21 .tle-service-photo-v21 img")||[])];
 if(images.length<assets.length)return false;
 for(let i=0;i<assets.length;i++){
   const img=images[i];
   img.src=assets[i];
   img.decoding="async";
   img.dataset.sourceCollection="TLE Drive house photos";
   img.removeAttribute("data-drive-photo");
 }
 root.classList.add("tle-demo-house-photos-v47");
 return true;
}
if(!apply()){
 const obs=new MutationObserver(()=>{if(apply())obs.disconnect()});
 obs.observe(document.documentElement,{attributes:true,attributeFilter:["class"],subtree:true,childList:true});
 window.addEventListener("load",()=>{if(apply())obs.disconnect()},{once:true});
}
})();