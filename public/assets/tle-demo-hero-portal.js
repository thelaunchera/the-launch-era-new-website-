/* TLE Booking lead magnet: one controlled portal transition + verified gallery.
   No booking/form writes. Existing Sonny and Jessie email handlers remain owner.
*/
(() => {
 "use strict";
 const root=document.getElementById("bookingPortal");
 const front=document.getElementById("bookingPortalFront");
 const windowButton=document.getElementById("bookingPortalEnter");
 const copy=document.getElementById("bookingPortalCopy");
 const reduced=window.matchMedia("(prefers-reduced-motion: reduce)");
 const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
 let raf=0;
 let lastProgress=-1;
 function updatePortal(){
  raf=0;
  if(!root||!front||!copy)return;
  if(reduced.matches){
   copy.classList.add("is-active");
   front.style.setProperty("--portal-opacity","0");
   return;
  }
  const rect=root.getBoundingClientRect();
  const travel=Math.max(1,rect.height-window.innerHeight);
  const progress=clamp(-rect.top/travel,0,1);
  if(Math.abs(progress-lastProgress)<.002)return;
  lastProgress=progress;
  // The measured real window size controls the focal zoom on every breakpoint.
  const portal=windowButton?.getBoundingClientRect();
  // getBoundingClientRect changes as front scales. offsetWidth/Height do not.
  const windowWidth=Math.max(1,windowButton?.offsetWidth||320);
  const windowHeight=Math.max(1,windowButton?.offsetHeight||235);
  const target=clamp(Math.max(window.innerWidth/windowWidth,window.innerHeight/windowHeight)*1.12,1,5.8);
  const t=clamp(progress/.78,0,1);
  // Smooth ease in/out, consistent with the requested cubic-bezier feeling.
  const eased=t*t*(3-2*t);
  front.style.setProperty("--portal-scale",String(1+(target-1)*eased));
  const fade=1-clamp((progress-.71)/.18,0,1);
  front.style.setProperty("--portal-opacity",String(fade));
  const open=progress>.82;
  front.style.pointerEvents=open?"none":"auto";
  copy.classList.toggle("is-active",open);
  root.classList.toggle("is-open",open);
 }
 const schedule=()=>{
  if(!raf)raf=window.requestAnimationFrame(updatePortal);
 };
 if(root&&front&&windowButton&&copy){
  window.addEventListener("scroll",schedule,{passive:true});
  window.addEventListener("resize",()=>{lastProgress=-1;schedule()},{passive:true});
  reduced.addEventListener?.("change",()=>{lastProgress=-1;schedule()});
  windowButton.addEventListener("click",()=>{
    const top=window.scrollY+root.getBoundingClientRect().top;
    const distance=Math.max(0,root.offsetHeight-window.innerHeight);
    window.scrollTo({top:top+distance,behavior:reduced.matches?"instant":"smooth"});
  });
  schedule();
 }
 // Hero Sonny shortcut toggles the existing REAL Sonny conversation.
 document.getElementById("bookingHeroSonny")?.addEventListener("click",()=>{
   const button=document.getElementById("sonnyToggle");
   if(!button)return;
   if(button.getAttribute("aria-expanded")!=="true")button.click();
   document.getElementById("sonnyInput")?.focus({preventScroll:true});
 });
 // Paired real before & after images from the demo's existing library.
 // Never substitute unrelated images as fabricated results.
 const comparisons=[...document.querySelectorAll(".booking-compare-visual")];
 let goodCount=0;
 let checkedCount=0;
 const info=document.getElementById("bookingCompareUnavailable");
 function mark(card,isGood){
   if(card.dataset.checked)return;
   card.dataset.checked="1";
   checkedCount++;
   if(isGood)goodCount++;
   else card.hidden=true;
   if(info)info.hidden=goodCount>0||checkedCount!==comparisons.length;
 }
 comparisons.forEach(card=>{
   const before=card.querySelector("img.before");
   const after=card.querySelector("img.after");
   const slider=card.querySelector('input[type="range"]');
   const images=[before,after].filter(Boolean);
   let failed=false;
   function inspect(){
     if(card.dataset.checked)return;
     if(failed){mark(card,false);return}
     if(images.some(img=>!img.complete))return;
     mark(card,images.length===2&&images.every(img=>img.naturalWidth>0));
   }
   images.forEach(img=>{
     img.addEventListener("error",()=>{failed=true;inspect()},{once:true});
     img.addEventListener("load",inspect,{once:true});
   });
   slider?.addEventListener("input",()=>{
     const value=clamp(Number(slider.value),0,100);
     card.style.setProperty("--compare-split",value+"%");
   });
   inspect();
 });
 // Don't leave an empty proof section if optional paired images aren't built.
 window.addEventListener("load",()=>{
   for(const card of comparisons){
     if(!card.dataset.checked){
       const images=[...card.querySelectorAll("img")];
       mark(card,images.length===2&&images.every(i=>i.complete&&i.naturalWidth>0));
     }
   }
 },{once:true});
})();
