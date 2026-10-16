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
