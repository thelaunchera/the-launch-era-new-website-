/* v46 · GSAP 3 + Flip: real Google Drive house photos, locally served.
 * Fictional unkeyed cleaning demo ONLY. All service and calendar actions intact. */
(()=>{
"use strict";
const q=new URLSearchParams(location.search);
if(!/\/lead-private-preview\.html$/.test(location.pathname)||q.has("key")||q.get("owner_preview")==="1")return;
const photos=[
 {src:"/assets/drive-house-gallery/quiet-luxury.png",en:"Quiet luxury living",es:"Sala luminosa",alt:"Warm minimal living room with a marble kitchen behind"},
 {src:"/assets/drive-house-gallery/whole-home.png",en:"The whole-home feeling",es:"Espacios para vivir",alt:"Warm family room connected to a sunlit kitchen"},
 {src:"/assets/drive-house-gallery/miami-condo.png",en:"Modern condo living",es:"Condominio en Miami",alt:"Beautifully cared-for condominium living space in Miami"},
 {src:"/assets/drive-house-gallery/pristine-kitchen.png",en:"Kitchen, perfectly fresh",es:"Cocina impecable",alt:"Pristine modern kitchen with clean counters"},
 {src:"/assets/drive-house-gallery/dining-room.png",en:"Ready to welcome",es:"Comedor preparado",alt:"Bright polished dining room"}
];
const es=q.get("lang")==="es";
const reduced=window.matchMedia("(prefers-reduced-motion: reduce)");
let attached=false;
function mount(){
 if(attached)return true;
 const html=document.documentElement,hero=document.getElementById("leadHero");
 if(!html.classList.contains("demo-editorial")||!html.classList.contains("tle-demo-v44")||!hero)return false;
 if(hero.querySelector(".tle46-gallery")){attached=true;return true}
 const text=hero.querySelector(".heroText"),oldMedia=hero.querySelector(".demo-cb-hero-media");
 if(!text||!oldMedia)return false;
 const gallery=document.createElement("div");gallery.className="tle46-gallery";
 gallery.setAttribute("aria-label",es?"Galería de interiores de casas":"Home interior photo gallery");
 const stage=document.createElement("div");stage.className="tle46-hero-slot";
 const strip=document.createElement("div");strip.className="tle46-thumb-strip";
 strip.setAttribute("role","group");strip.setAttribute("aria-label",es?"Otras casas":"More home photos");
 const caption=document.createElement("div");caption.className="tle46-caption";caption.setAttribute("aria-live","polite");
 caption.innerHTML='<span class="tle46-caption-text"></span><span class="tle46-caption-counter"></span>';
 const img=photoImg(0,true);stage.append(img,text,caption);
 const buttons=[];
 for(let i=1;i<photos.length;i++){
  const btn=document.createElement("button");btn.type="button";
  btn.className="tle46-thumb-slot";
  btn.dataset.slot=String(i);
  btn.append(photoImg(i,false));
  strip.append(btn);buttons.push(btn);
 }
 gallery.append(stage,strip);
 // Keep the old media node for legacy code but remove its visible empty layer.
 oldMedia.hidden=true;
 hero.prepend(gallery);
 hero.classList.add("tle46-gallery-hero");
 html.classList.add("tle-demo-v46");
 // Retire the competing zoom-through-window layer; actual CTA remains.
 hero.querySelector(".tle-v42-window")?.remove();
 hero.querySelector(".tle-v42-second-scene")?.remove();
 hero.classList.remove("tle-v42-travel");
 let current=img;
 let animating=false,captionTween=null;
 const context=window.gsap?.context?.(()=>{},gallery)||null;
 const gsap=window.gsap;
 const Flip=window.Flip;
 if(gsap&&Flip)gsap.registerPlugin(Flip);
 function label(node){
  const idx=Number(node.dataset.photoIndex);
  return photos[idx][es?"es":"en"];
 }
 function updateButtonLabels(){
  buttons.forEach((btn,i)=>{
   const child=btn.querySelector("img");
   btn.setAttribute("aria-label",(es?"Mostrar foto: ":"Show photo: ")+label(child));
   btn.setAttribute("aria-pressed","false");
   btn.tabIndex=0;
  });
 }
 function updateCaption(){
  caption.querySelector(".tle46-caption-text").textContent=label(current);
  caption.querySelector(".tle46-caption-counter").textContent=(Number(current.dataset.photoIndex)+1)+" / "+photos.length;
 }
 function captionAnimate(){
  if(reduced.matches||!gsap){updateCaption();return}
  if(captionTween)captionTween.kill();
  captionTween=gsap.timeline().to(caption,{opacity:0,duration:.18,ease:"power1.in"},0)
    .call(updateCaption,[],.25).to(caption,{opacity:1,duration:.3,ease:"power2.out"},.25);
 }
 function swap(button){
  if(animating)return;
  const next=button.querySelector("img");
  if(!next||next===current)return;
  const previous=current;
  animating=true;
  // Capture positions BEFORE changing parent nodes; Flip reflows from state.
  const state=!reduced.matches&&gsap&&Flip?Flip.getState([next,previous]):null;
  button.appendChild(previous);
  stage.insertBefore(next,text);
  current=next;
  updateButtonLabels();captionAnimate();
  if(state){
   const run=()=>Flip.from(state,{
     duration:.9,ease:"power3.inOut",scale:true,zIndex:5,toggleClass:"fly",
     onComplete:()=>{animating=false;updateButtonLabels()}
   });
   if(context)context.add(run);else run();
  }else{animating=false}
 }
 buttons.forEach((button,index)=>{
  button.addEventListener("click",()=>swap(button));
  button.addEventListener("keydown",event=>{
   const keys={ArrowRight:1,ArrowDown:1,ArrowLeft:-1,ArrowUp:-1};
   if(keys[event.key]!=null){
    event.preventDefault();buttons[(index+keys[event.key]+buttons.length)%buttons.length].focus();
   }else if(event.key==="Home"){event.preventDefault();buttons[0].focus()}
   else if(event.key==="End"){event.preventDefault();buttons[buttons.length-1].focus()}
  });
 });
 function cleanup(){
  captionTween?.kill();context?.revert();
  window.removeEventListener("pagehide",cleanup);
 }
 window.addEventListener("pagehide",cleanup,{once:true});
 updateButtonLabels();updateCaption();
 attached=true;
 return true;
}
function photoImg(index,main){
 const item=photos[index],image=document.createElement("img");
 image.className="tle46-gallery-img";
 image.src=item.src;image.alt=item.alt;
 image.dataset.photoIndex=String(index);
 image.decoding="async";
 image.loading=main?"eager":"lazy";
 if(main)image.fetchPriority="high";
 image.draggable=false;
 return image;
}
if(!mount()){
 const watcher=new MutationObserver(()=>{if(mount())watcher.disconnect()});
 watcher.observe(document.documentElement,{attributes:true,attributeFilter:["class"],childList:true,subtree:true});
 window.addEventListener("load",()=>{if(mount())watcher.disconnect()},{once:true});
}
})();