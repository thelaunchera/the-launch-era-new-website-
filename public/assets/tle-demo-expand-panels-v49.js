/* Booking demo v49 — human headline hook + expandable service image gallery.
   Public sample only; no writes, no booking handler changes, no customer preview. */
(()=>{
"use strict";
const q=new URLSearchParams(location.search);
if(location.pathname!=="/lead-private-preview.html"||q.has("key")||q.get("owner_preview")==="1")return;
const es=q.get("lang")==="es";
let finished=false;
function setup(){
 if(finished)return true;
 const root=document.documentElement;
 const hero=document.querySelector("#leadHero .tle46-hero-slot");
 const headline=hero?.querySelector(".heroText h1.demo-headline");
 const res=document.getElementById("residentialServiceList");
 const com=document.getElementById("commercialServiceList");
 if(!root.classList.contains("tle-demo-v48")||!headline||!res||!com||
 res.querySelectorAll(":scope>button.service.tle-service-has-photo-v21").length<3)return false;
 const text=es?{intro:"Más tiempo para",words:["vivir.","descansar.","disfrutar."],photo:[
  "Sala luminosa recién limpiada para limpieza regular",
  "Cocina moderna y limpia para limpieza profunda",
  "Interior impecable listo para una mudanza",
  "Oficina limpia y organizada",
  "Tienda y sala de exhibición cuidadas",
  "Instalaciones profesionales limpias",
  "Suelo limpio y brillante"
 ]}:{intro:"More time to",words:["live.","relax.","enjoy."],photo:[
  "Spotless sunlit living room for standard cleaning",
  "Beautiful fresh kitchen for deep cleaning",
  "Clean modern home ready for a move",
  "Bright organized office",
  "Clean retail space and showroom",
  "Fresh professional care facility",
  "Newly cleaned floor detail"
 ]};
 // Replace the old static H1 with an animated headline IN the actual H1.
 // The previous tiny rotating image caption stays in the DOM for v47 Flip sync,
 // but is hidden from visual and assistive output to avoid two competing hooks.
 headline.replaceChildren();
 headline.classList.add("tle49-hook");
 headline.setAttribute("aria-label",text.intro+" "+text.words[0]);
 const lead=document.createElement("span");lead.className="tle49-hook-prefix";lead.textContent=text.intro;
 const rotator=document.createElement("span");rotator.className="tle49-hook-rotator";rotator.setAttribute("aria-hidden","true");
 text.words.forEach((word,i)=>{
  const span=document.createElement("span");span.className="tle49-hook-word";
  span.style.setProperty("--delay",i*2+"s");
  span.textContent=word;
  rotator.append(span);
 });
 headline.append(lead,rotator);
 const caption=document.querySelector("#leadHero .tle46-caption");
 if(caption)caption.setAttribute("aria-hidden","true");
 const names=es?[
  ["Limpieza regular","Limpieza profunda","Limpieza de mudanza"],
  ["Oficinas","Tiendas","Espacios profesionales","Suelos"]
 ]:[
  ["Standard cleaning","Deep cleaning","Move-in / move-out"],
  ["Office cleaning","Retail and showrooms","Professional spaces","Floor care"]
 ];
 [res,com].forEach((list,group)=>{
  list.classList.add("tle49-panel-gallery");
  const panels=[...list.querySelectorAll(":scope > button.service.tle-service-has-photo-v21")];
  function activate(target){
   panels.forEach(panel=>{
    const active=panel===target;
    panel.classList.toggle("tle49-panel-active",active);
    panel.setAttribute("aria-expanded",String(active));
   });
  }
  panels.forEach((button,index)=>{
   button.classList.add("tle49-panel");
   const pic=button.querySelector(".tle-service-photo-v21");
   const image=pic?.querySelector("img");
   if(pic)pic.removeAttribute("aria-hidden");
   if(image){image.alt=text.photo[group===0?index:3+index]||names[group][index]||"";image.loading="lazy";}
   const count=document.createElement("span");count.className="tle49-panel-number";
   count.textContent=String(index+1).padStart(2,"0");
   count.setAttribute("aria-hidden","true");
   button.append(count);
   const body=button.querySelector(".demo-service-body");
   if(body&&names[group][index])body.setAttribute("data-panel-label",names[group][index]);
   button.addEventListener("pointerenter",()=>activate(button),{passive:true});
   button.addEventListener("focus",()=>activate(button));
   button.addEventListener("click",()=>activate(button)); // native onclick still books
   button.addEventListener("keydown",event=>{
    if(event.key==="Enter"||event.key===" ")activate(button);
   });
  });
  if(panels[0])activate(panels[0]);
 });
 root.classList.add("tle-demo-v49");
 finished=true;
 return true;
}
if(!setup()){
 const observer=new MutationObserver(()=>{if(setup())observer.disconnect()});
 observer.observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:["class"]});
 window.addEventListener("load",()=>{if(setup())observer.disconnect();},{once:true});
}
})();
