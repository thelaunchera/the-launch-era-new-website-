/* v41 inline calendar: decorative sample selection, never a real booking. */
(()=>{"use strict";
const qs=new URLSearchParams(location.search);
if(!/\/lead-private-preview\.html$/.test(location.pathname)||qs.has("key")||qs.get("owner_preview")==="1")return;
function init(){
 const hero=document.getElementById("leadHero");
 if(!hero||!document.documentElement.classList.contains("demo-editorial")||document.getElementById("tle41HeroBooking"))return;
 const es=qs.get("lang")==="es";
 const t=es?{tag:"PRUEBA DE RESERVA",title:"Elige una fecha",note:"Solo una simulación. No se envía ni confirma ninguna reserva.",confirm:"Confirmar horario",done:"✓ Reservado en el demo",next:"Continuar con los servicios ↗",pick:"Selecciona fecha y hora",prev:"Mes anterior",following:"Mes siguiente"}:{tag:"BOOKING PREVIEW",title:"Pick a sample time",note:"Interactive preview only. No booking or message is sent.",confirm:"Confirm demo slot",done:"✓ Booked in demo",next:"Continue to services ↗",pick:"Choose a day and time",prev:"Previous month",following:"Next month"};
 const shell=document.createElement("div");shell.className="tle41-hero-shell";
 hero.before(shell);shell.append(hero);
 const card=document.createElement("aside");card.id="tle41HeroBooking";card.className="tle41-hero-card";
 card.setAttribute("aria-label",es?"Calendario interactivo de ejemplo":"Sample booking calendar");
 card.innerHTML='<div class="tle41-card-head"><div><span class="tle41-overline"></span><strong></strong></div><span aria-hidden="true">✦</span></div><div class="tle41-monthbar"><strong></strong><div class="tle41-month-controls"><button type="button" data-dir="-1">‹</button><button type="button" data-dir="1">›</button></div></div><div class="tle41-calendar-grid"></div><div class="tle41-times"></div><button type="button" class="tle41-confirm" disabled></button><p class="tle41-note"></p><a class="tle41-open" href="#bookingStarter"></a><span class="tle-focus-screenreader" role="status" aria-live="polite"></span>';
 shell.append(card);
 card.querySelector(".tle41-overline").textContent=t.tag;
 card.querySelector(".tle41-card-head strong").textContent=t.title;
 card.querySelector(".tle41-note").textContent=t.note;
 card.querySelector(".tle41-open").textContent=t.next;
 const monthText=card.querySelector(".tle41-monthbar strong");
 const days=card.querySelector(".tle41-calendar-grid");
 const times=card.querySelector(".tle41-times");
 const confirm=card.querySelector(".tle41-confirm");
 const live=card.querySelector('[role="status"]');
 const buttons=[...card.querySelectorAll("[data-dir]")];
 const now=new Date(),today=new Date(now.getFullYear(),now.getMonth(),now.getDate());
 let offset=0,day=null,slot=null;
 const dateFormat=new Intl.DateTimeFormat(es?"es-US":"en-US",{year:"numeric",month:"long"});
 const dayFormat=new Intl.DateTimeFormat(es?"es-US":"en-US",{weekday:"long",month:"long",day:"numeric"});
 function chooseSlot(value){
  slot=value;times.querySelectorAll("button").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.slot===slot)));
  confirm.disabled=!day||!slot;confirm.textContent=t.confirm;
 }
 function renderSlots(){
  times.classList.remove("ready");times.replaceChildren();
  for(const [i,value] of ["9:00 AM","11:30 AM","2:00 PM"].entries()){
   const b=document.createElement("button");b.type="button";b.dataset.slot=value;b.textContent=value;
   b.setAttribute("aria-pressed","false");b.style.setProperty("--i",String(i));
   b.addEventListener("click",()=>chooseSlot(value));times.append(b);
  }
  if(day)requestAnimationFrame(()=>times.classList.add("ready"));
 }
 function selectDay(date){
  day=date;slot=null;confirm.disabled=true;confirm.textContent=t.confirm;
  days.querySelectorAll("button").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.day===day)));
  renderSlots();live.textContent=dayFormat.format(new Date(day+"T12:00:00"));
 }
 function renderMonth(){
  const m=new Date(today.getFullYear(),today.getMonth()+offset,1);
  monthText.textContent=dateFormat.format(m);days.replaceChildren();
  for(const d of (es?["D","L","M","X","J","V","S"]:["S","M","T","W","T","F","S"])){
   const label=document.createElement("span");label.textContent=d;days.append(label);
  }
  for(let i=0;i<m.getDay();i++)days.append(document.createElement("span"));
  const number=new Date(m.getFullYear(),m.getMonth()+1,0).getDate();
  for(let d=1;d<=number;d++){
   const date=new Date(m.getFullYear(),m.getMonth(),d);
   const ymd=[date.getFullYear(),String(date.getMonth()+1).padStart(2,"0"),String(d).padStart(2,"0")].join("-");
   const b=document.createElement("button");b.type="button";b.className="tle41-day";
   b.textContent=String(d);b.dataset.day=ymd;b.disabled=date<today;
   b.setAttribute("aria-pressed",String(day===ymd));
   b.setAttribute("aria-label",dayFormat.format(date));
   b.addEventListener("click",()=>selectDay(ymd));days.append(b);
  }
  buttons.forEach(b=>{b.disabled=Number(b.dataset.dir)<0?offset===0:offset===5;b.setAttribute("aria-label",Number(b.dataset.dir)<0?t.prev:t.following);});
  confirm.disabled=true;confirm.textContent=t.confirm;
  day=null;slot=null;renderSlots();
 }
 buttons.forEach(b=>b.addEventListener("click",()=>{offset+=Number(b.dataset.dir);renderMonth();}));
 confirm.addEventListener("click",()=>{
  if(!day||!slot)return;
  const d=document.getElementById("date"),s=document.getElementById("time");
  if(d)d.value=day;if(s&&[...s.options].some(o=>o.value===slot))s.value=slot;
  confirm.textContent=t.done;live.textContent=t.done+" · "+dayFormat.format(new Date(day+"T12:00:00"))+" · "+slot;
 });
 renderMonth();
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();
