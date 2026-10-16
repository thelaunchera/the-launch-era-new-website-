/* Native service navigation v38: sample preview only, no booking logic changes. */
(()=>{
"use strict";
const q=new URLSearchParams(location.search);
if(!/\/lead-private-preview\.html$/.test(location.pathname)||q.has("key")||q.get("owner_preview")==="1")return;
function init(){
 if(!document.documentElement.classList.contains("demo-editorial"))return;
 const panel=document.getElementById("bookingStarter"),title=document.getElementById("title"),count=document.getElementById("count");
 if(!panel||!title||!count)return;
 const pages=[...panel.querySelectorAll(":scope > .screen")];
 if(pages.length<3)return;
 const stage=document.createElement("div");stage.className="tle-stack-stage";
 stage.setAttribute("aria-label",q.get("lang")==="es"?"Pasos de reserva":"Booking steps");
 pages[0].before(stage);
 const byId=new Map();
 for(const p of pages){
   stage.append(p);byId.set(p.id,p);
   const shade=document.createElement("span");
   shade.className="tle-stack-shade";shade.setAttribute("aria-hidden","true");
   p.append(shade);
   p.classList.toggle("tle-stack-visible",p.classList.contains("on"));
   p.inert=!p.classList.contains("on");
   if(p.inert)p.setAttribute("aria-hidden","true");
 }
 title.tabIndex=-1;
 document.documentElement.classList.add("tle-demo-stack-v38");
 const reduce=matchMedia("(prefers-reduced-motion: reduce)");
 const easing="cubic-bezier(0.32, 0.72, 0, 1)";
 let active=pages.find(p=>p.classList.contains("on"))||byId.get("main");
 let stack=[{id:active.id,title:title.textContent,count:count.textContent}];
 let busy=false,queued=null,swipe=null,skip=false;
 const sh=p=>p.querySelector(":scope > .tle-stack-shade");
 const height=p=>Math.ceil(p.scrollHeight||p.getBoundingClientRect().height||1);
 const size=(a,b)=>stage.style.height=Math.max(height(a),b?height(b):0,1)+"px";
 const motion=(p,d)=>{
   p.style.transition=reduce.matches?"opacity 130ms linear":`transform ${d}ms ${easing},opacity ${d}ms ${easing}`;
   sh(p).style.transition=reduce.matches?"opacity 130ms linear":`opacity ${d}ms ${easing}`;
 };
 const reset=p=>{
   p.style.transition="";p.style.transform="";p.style.opacity="";p.style.zIndex="";
   sh(p).style.transition="";sh(p).style.opacity="";
   p.classList.remove("tle-stack-moving","tle-stack-foreground");
 };
 const focus=()=>{try{title.focus({preventScroll:true})}catch{title.focus()}};
 const settle=p=>{
   for(const el of pages){
     const selected=el===p;
     reset(el);
     el.classList.toggle("on",selected);
     el.classList.toggle("tle-stack-visible",selected);
     el.inert=!selected;
     if(selected)el.removeAttribute("aria-hidden");else el.setAttribute("aria-hidden","true");
   }
   active=p;size(p);
 };
 function navigate(id,label,step){
   const next=byId.get(id);if(!next)return false;
   if(busy){queued={id,label,step};return true}
   const found=stack.findIndex(item=>item.id===id);
   const goingBack=found>=0&&found<stack.length-1;
   const newStack=goingBack?stack.slice(0,found+1):found===stack.length-1?stack:[...stack,{id,title:label,count:step}];
   title.textContent=label;count.textContent=step;
   if(next===active||skip){stack=newStack;settle(next);focus();return true}
   busy=true;
   const old=active,duration=reduce.matches?130:450;
   for(const p of pages){
     const painted=p===next||p===old;
     reset(p);p.classList.toggle("tle-stack-visible",painted);
     p.classList.toggle("on",p===next);p.inert=p!==next;
     if(p===next)p.removeAttribute("aria-hidden");else p.setAttribute("aria-hidden","true");
   }
   old.style.zIndex=goingBack?"2":"1";
   next.style.zIndex=goingBack?"1":"2";
   (goingBack?old:next).classList.add("tle-stack-foreground");
   old.classList.add("tle-stack-moving");next.classList.add("tle-stack-moving");
   if(reduce.matches){next.style.opacity="0"}
   else if(goingBack){
     next.style.transform="translate3d(-28%,0,0)";sh(next).style.opacity=".16";
   }else next.style.transform="translate3d(100%,0,0)";
   size(old,next);void stage.offsetWidth;
   requestAnimationFrame(()=>{
     motion(old,duration);motion(next,duration);
     if(reduce.matches){old.style.opacity="0";next.style.opacity="1"}
     else if(goingBack){
       old.style.transform="translate3d(100%,0,0)";
       next.style.transform="translate3d(0,0,0)";sh(next).style.opacity="0";
     }else{
       old.style.transform="translate3d(-28%,0,0)";sh(old).style.opacity=".16";
       next.style.transform="translate3d(0,0,0)";
     }
   });
   setTimeout(()=>{
     busy=false;stack=newStack;settle(next);focus();
     const todo=queued;queued=null;
     if(todo)navigate(todo.id,todo.label,todo.step);
   },duration+55);
   try{panel.scrollIntoView({block:"start",behavior:"instant"})}catch{}
   return true;
 }
 size(active);
 window.tleStackShow=navigate;
 const goBack=()=>{
   const prior=stack[stack.length-2];if(!prior)return;
   if(prior.id==="main"&&typeof window.showMain==="function")window.showMain();
   else window.show(prior.id,prior.title,prior.count);
 };
 function endSwipe(commit){
   const d=swipe;if(!d)return;
   swipe=null;
   const progress=Math.max(0,Math.min(1,d.distance/d.width));
   const duration=reduce.matches?130:Math.max(120,Math.round(450*(commit?1-progress:progress)));
   motion(d.top,duration);motion(d.below,duration);
   if(reduce.matches){
     d.top.style.opacity=commit?"0":"1";d.below.style.opacity=commit?"1":"0";
   }else{
     d.top.style.transform=commit?"translate3d(100%,0,0)":"translate3d(0,0,0)";
     d.below.style.transform=commit?"translate3d(0,0,0)":"translate3d(-28%,0,0)";
     sh(d.below).style.opacity=commit?"0":".16";
   }
   setTimeout(()=>{
     if(commit){skip=true;goBack();skip=false}
     else{
       d.below.classList.remove("tle-stack-visible");
       d.below.inert=true;d.below.setAttribute("aria-hidden","true");
       reset(d.top);reset(d.below);size(active);
     }
   },duration+30);
 }
 stage.addEventListener("pointerdown",e=>{
   if(busy||swipe||stack.length<2||e.pointerType==="mouse"||!e.isPrimary)return;
   if(e.clientX>40||e.button!==0)return;
   if(e.target.closest("input,select,textarea,button,a,label,[contenteditable=true]"))return;
   const below=byId.get(stack[stack.length-2].id);
   if(!below||below===active)return;
   const width=Math.max(1,stage.getBoundingClientRect().width);
   swipe={pointer:e.pointerId,x:e.clientX,y:e.clientY,lastX:e.clientX,
      lastTime:performance.now(),velocity:0,distance:0,width,top:active,below,engaged:false};
   below.classList.add("tle-stack-visible","tle-stack-moving");
   below.inert=true;below.setAttribute("aria-hidden","true");
   below.style.zIndex="1";active.style.zIndex="2";
   active.classList.add("tle-stack-foreground","tle-stack-moving");
   below.style.transform="translate3d(-28%,0,0)";
   sh(below).style.opacity=".16";size(active,below);
 });
 stage.addEventListener("pointermove",e=>{
   const d=swipe;if(!d||d.pointer!==e.pointerId)return;
   const dx=e.clientX-d.x,dy=e.clientY-d.y;
   if(!d.engaged){
     if(Math.abs(dy)>Math.max(9,Math.abs(dx)))return;
     if(dx<8)return;
     d.engaged=true;
     try{stage.setPointerCapture(e.pointerId)}catch{}
   }
   if(e.cancelable)e.preventDefault();
   const t=performance.now(),dt=Math.max(1,t-d.lastTime);
   d.velocity=.7*d.velocity+.3*(e.clientX-d.lastX)/dt;
   d.lastX=e.clientX;d.lastTime=t;d.distance=Math.max(0,Math.min(d.width,dx));
   d.top.style.transition="none";d.below.style.transition="none";
   sh(d.below).style.transition="none";
   d.top.style.transform="translate3d("+d.distance+"px,0,0)";
   d.below.style.transform="translate3d("+(-.28*(d.width-d.distance))+"px,0,0)";
   sh(d.below).style.opacity=String(.16*(1-d.distance/d.width));
 },{passive:false});
 stage.addEventListener("pointerup",e=>{
   const d=swipe;if(!d||e.pointerId!==d.pointer)return;
   if(!d.engaged){endSwipe(false);return}
   endSwipe(d.distance+d.velocity*220>=d.width/2);
 });
 stage.addEventListener("pointercancel",()=>endSwipe(false));
 if("ResizeObserver" in window){
   const ro=new ResizeObserver(()=>{if(!busy&&!swipe)size(active)});
   pages.forEach(page=>ro.observe(page));
 }
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});
else init();
})();
