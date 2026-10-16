/* v42: public sample editorial service flow and date selection.
   No real-booking writes, no customer/owner page effects. */
(()=>{"use strict";
const q=new URLSearchParams(location.search);
if(!/\/lead-private-preview\.html$/.test(location.pathname)||q.has("key")||q.get("owner_preview")==="1")return;
function init(){
 if(!document.documentElement.classList.contains("demo-editorial"))return;
 if(document.documentElement.classList.contains("tle-demo-v42"))return;
 document.documentElement.classList.add("tle-demo-v42");
 const es=q.get("lang")==="es";
 const main=document.getElementById("main");
 const home=document.getElementById("residentialServiceList");
 const business=document.getElementById("commercialServiceList");
 const hero=document.getElementById("leadHero");
 if(!main||!home||!business||!hero)return;
 // Retire the original category toggle entirely, but retain both real service lists
 // and each existing button/route/quote function.
 document.getElementById("categoryTabs")?.remove();
 document.getElementById("tle41Frequency")?.remove();
 document.getElementById("tle41HeroBooking")?.remove();
 const oldShell=document.querySelector(".tle41-hero-shell");
 if(oldShell && oldShell.contains(hero)){oldShell.before(hero);oldShell.remove();}
 const label=main.querySelector(":scope > .label");
 if(label)label.textContent=es?"ELIGE TU LIMPIEZA":"EXPLORE THE SERVICES";
 const description=main.querySelector(".demo-services-note");
 if(description)description.textContent=es?"Elige el servicio que necesitas. Cada opción abre su propia solicitud.":"Browse the available services. Each opens its own simple request.";
 function makeHead(title,kicker,hint){
  const el=document.createElement("div");el.className="tle-v42-section-head";
  const block=document.createElement("div");
  const small=document.createElement("span");small.className="tle-v42-eyebrow";small.textContent=kicker;
  const h=document.createElement("h3");h.textContent=title;block.append(small,h);
  const note=document.createElement("small");note.textContent=hint;
  el.append(block,note);return el;
 }
 if(!main.querySelector(".tle-v42-home-head")){const heading=makeHead(es?"Para tu hogar":"For your home",es?"LIMPIEZA RESIDENCIAL":"HOME CLEANING",es?"Elige un servicio":"Choose a service");heading.classList.add("tle-v42-home-head");home.before(heading);}
 if(!main.querySelector(".tle-v42-business-head")){const heading=makeHead(es?"Para tu negocio":"For your business",es?"LIMPIEZA COMERCIAL":"BUSINESS CLEANING",es?"Solicita un estimado":"Request an estimate");heading.classList.add("tle-v42-business-head");business.before(heading);}
 for(const list of [home,business]){
  list.classList.add("tle-v42-grid");
  list.hidden=false;
  new MutationObserver(()=>{if(list.hidden)list.hidden=false;}).observe(list,{attributes:true,attributeFilter:["hidden"]});
 }
 // The page's original setCategory still updates state for AI links.
 // The two editorial service collections stay visible after that state update.
 if(typeof window.setCategory==="function"){
  const old=window.setCategory;
  window.setCategory=function(category){old(category);home.hidden=false;business.hidden=false;};
 }
 const portal=document.createElement("button");portal.type="button";portal.className="tle-v42-window";
 portal.setAttribute("aria-label",es?"Entrar al demo de servicios con transición de zoom":"Zoom through the window to explore services");
 portal.innerHTML='<span></span>';
 portal.querySelector("span").textContent=es?"Explorar servicios ↗":"Explore services ↗";
 const second=document.createElement("div");second.className="tle-v42-second-scene";
 second.setAttribute("aria-hidden","true");
 const headline=document.createElement("h2");headline.textContent=es?"Espacios más frescos. Reservas más fáciles.":"Brighter spaces. Easier booking.";
 second.append(headline);
 hero.classList.add("tle-v42-portal");hero.append(second,portal);
 const reduce=matchMedia("(prefers-reduced-motion: reduce)");
 let moving=false;
 portal.addEventListener("click",()=>{
  if(moving)return;moving=true;
  const cta=hero.querySelector(".demo-hero-cta");
  if(!reduce.matches)hero.classList.add("tle-v42-travel");
  portal.disabled=true;
  window.setTimeout(()=>{
   if(cta)cta.click();else document.getElementById("bookingStarter")?.scrollIntoView({block:"start",behavior:"auto"});
   window.setTimeout(()=>{hero.classList.remove("tle-v42-travel");portal.disabled=false;moving=false;},260);
  },reduce.matches?0:1470);
 });
 function calendar(dateId,timeId){
  const input=document.getElementById(dateId),time=document.getElementById(timeId);
  if(!input||!time||document.getElementById("tle-v42-picker-"+dateId))return;
  const box=document.createElement("div");box.className="tle-v42-date-picker";box.id="tle-v42-picker-"+dateId;
  const trigger=document.createElement("button");trigger.type="button";trigger.className="tle-v42-date-trigger";
  trigger.setAttribute("aria-expanded","false");trigger.setAttribute("aria-controls",dateId+"-calendar");
  const text=document.createElement("span");
  const icon=document.createElement("span");icon.className="tle-v42-date-symbol";icon.setAttribute("aria-hidden","true");icon.textContent="▦";
  trigger.append(text,icon);
  const cal=document.createElement("div");cal.className="tle-v42-cal";cal.id=dateId+"-calendar";cal.hidden=true;
  const top=document.createElement("div");top.className="tle-v42-cal-head";
  const month=document.createElement("strong");
  const controls=document.createElement("div");
  const prev=document.createElement("button"),next=document.createElement("button");
  prev.type=next.type="button";prev.textContent="‹";next.textContent="›";
  prev.setAttribute("aria-label",es?"Mes anterior":"Previous month");
  next.setAttribute("aria-label",es?"Mes siguiente":"Next month");
  controls.append(prev,next);top.append(month,controls);
  const grid=document.createElement("div");grid.className="tle-v42-cal-grid";
  const slots=document.createElement("div");slots.className="tle-v42-time-slots";
  const save=document.createElement("button");save.type="button";save.className="tle-v42-cal-save";save.disabled=true;
  save.textContent=es?"Usar fecha seleccionada":"Use selected date";
  const note=document.createElement("p");note.className="tle-v42-cal-note";
  note.textContent=es?"Preferencia de fecha y hora · no se confirma ninguna reserva.":"Preferred date and time only · no booking is confirmed.";
  cal.append(top,grid,slots,save,note);box.append(trigger,cal);input.after(box);
  input.classList.add("tle-v42-native-date");input.tabIndex=-1;input.setAttribute("aria-hidden","true");
  const today=new Date();today.setHours(0,0,0,0);
  let offset=0,chosen=input.value||"",chosenSlot="";
  const monthFmt=new Intl.DateTimeFormat(es?"es":"en-US",{month:"long",year:"numeric"});
  const dayFmt=new Intl.DateTimeFormat(es?"es":"en-US",{month:"short",day:"numeric",year:"numeric"});
  const options=time.tagName==="SELECT"?[...time.options].filter(o=>o.value).map(o=>({label:o.textContent.trim(),value:o.value})):[
    {label:"9:00 AM",value:"09:00"},{label:"11:30 AM",value:"11:30"},{label:"2:00 PM",value:"14:00"}];
  function label(){text.textContent=chosen?(es?"Fecha: ":"Date: ")+dayFmt.format(new Date(chosen+"T12:00:00"))+(chosenSlot?" · "+(options.find(o=>o.value===chosenSlot)?.label||chosenSlot):""):(es?"Seleccionar fecha":"Select a preferred date");}
  function render(){
   const view=new Date(today.getFullYear(),today.getMonth()+offset,1);
   month.textContent=monthFmt.format(view);grid.replaceChildren();
   const names=es?["D","L","M","X","J","V","S"]:["S","M","T","W","T","F","S"];
   for(const n of names){const cell=document.createElement("span");cell.textContent=n;grid.append(cell);}
   for(let i=0;i<view.getDay();i++)grid.append(document.createElement("span"));
   const count=new Date(view.getFullYear(),view.getMonth()+1,0).getDate();
   for(let i=1;i<=count;i++){
    const d=new Date(view.getFullYear(),view.getMonth(),i);
    const id=[d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(i).padStart(2,"0")].join("-");
    const btn=document.createElement("button");btn.type="button";btn.textContent=String(i);btn.disabled=d<today;
    btn.setAttribute("aria-label",dayFmt.format(d));
    btn.setAttribute("aria-pressed",String(chosen===id));
    btn.addEventListener("click",()=>{
     chosen=id;input.value=chosen;
     input.dispatchEvent(new Event("input",{bubbles:true}));
     input.dispatchEvent(new Event("change",{bubbles:true}));
     save.disabled=false;label();render();
    });
    grid.append(btn);
   }
   prev.disabled=offset===0;next.disabled=offset===11;
   slots.replaceChildren();
   for(const entry of options){
    const b=document.createElement("button");b.type="button";b.textContent=entry.label;
    b.setAttribute("aria-pressed",String(chosenSlot===entry.value));
    b.addEventListener("click",()=>{
     chosenSlot=entry.value;time.value=entry.value;
     time.dispatchEvent(new Event("change",{bubbles:true}));label();render();
    });
    slots.append(b);
   }
  }
  prev.addEventListener("click",()=>{offset--;render();});next.addEventListener("click",()=>{offset++;render();});
  trigger.addEventListener("click",()=>{
   const nextOpen=cal.hidden;
   document.querySelectorAll(".tle-v42-cal").forEach(x=>x.hidden=true);
   document.querySelectorAll(".tle-v42-date-trigger").forEach(x=>x.setAttribute("aria-expanded","false"));
   cal.hidden=!nextOpen;trigger.setAttribute("aria-expanded",String(nextOpen));
   if(nextOpen)render();
  });
  save.addEventListener("click",()=>{if(!chosen)return;cal.hidden=true;trigger.setAttribute("aria-expanded","false");trigger.focus();});
  box.addEventListener("keydown",e=>{if(e.key==="Escape"){cal.hidden=true;trigger.setAttribute("aria-expanded","false");trigger.focus();}});
  input.addEventListener("change",()=>{chosen=input.value;label();});
  label();render();
 }
 for(const pair of [["date","time"],["qdate","qtime"],["cdate","ctime"]])calendar(...pair);
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();