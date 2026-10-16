/* v41 optional cleaning-frequency estimate: public fictional demo, no invoices. */
(()=>{"use strict";
const query=new URLSearchParams(location.search);
if(!/\/lead-private-preview\.html$/.test(location.pathname)||query.has("key")||query.get("owner_preview")==="1")return;
function init(){
 if(!document.documentElement.classList.contains("demo-editorial"))return;
 const main=document.getElementById("main"),home=document.getElementById("residentialServiceList");
 if(!main||!home||document.getElementById("tle41Frequency"))return;
 const es=query.get("lang")==="es";
 const labels=es?{
 kicker:"AHORROS ILUSTRATIVOS",heading:"¿Con qué frecuencia necesitas limpieza?",
 options:["Una vez","Semanal","Quincenal"],title:"Limpieza habitual",unit:"por visita",
 badge:["Sin compromiso","Ahorra $936/año","Ahorra $312/año"],
 detail:["Precio base ilustrativo, sin descuento.","15 % de descuento por visita.","10 % de descuento por visita."],
 note:"Cálculo de ejemplo sobre $120/visita: semanal = 52 visitas/año; quincenal = 26. Los precios finales, disponibilidad y descuentos los confirma cada negocio.",
 action:"Personalizar esta limpieza →",announce:"Ahorro ilustrativo"
 }:{
 kicker:"ILLUSTRATIVE SAVINGS",heading:"How often would you like cleaning?",
 options:["One time","Weekly","Biweekly"],title:"Standard cleaning",unit:"per visit",
 badge:["No commitment","Save $936/year","Save $312/year"],
 detail:["Illustrative starting price with no discount.","15% off each weekly visit.","10% off each biweekly visit."],
 note:"Example based on $120 per visit: weekly assumes 52 visits/year, biweekly 26. The business confirms final pricing, discounts and availability.",
 action:"Customize this cleaning →",announce:"Illustrative savings"
 };
 const root=document.createElement("section");root.id="tle41Frequency";root.className="tle41-frequency";
 root.setAttribute("aria-label",es?"Comparación de frecuencia de limpieza":"Cleaning frequency comparison");
 root.innerHTML='<span class="tle41-frequency-kicker"></span><h3 class="tle41-frequency-heading"></h3><div class="tle41-frequency-control" role="radiogroup"></div><div class="tle41-frequency-card"><span class="tle41-frequency-badge"></span><h3></h3><p class="tle41-frequency-price"><span></span><small></small></p><p class="tle41-frequency-detail"></p><button type="button"></button></div><p class="tle41-frequency-note"></p><span class="tle41-sr" role="status" aria-live="polite"></span>';
 home.before(root);
 root.querySelector(".tle41-frequency-kicker").textContent=labels.kicker;
 root.querySelector(".tle41-frequency-heading").textContent=labels.heading;
 root.querySelector(".tle41-frequency-card h3").textContent=labels.title;
 root.querySelector(".tle41-frequency-price small").textContent=" / "+labels.unit;
 root.querySelector(".tle41-frequency-note").textContent=labels.note;
 const control=root.querySelector('[role="radiogroup"]'),badge=root.querySelector(".tle41-frequency-badge");
 const price=root.querySelector(".tle41-frequency-price span"),detail=root.querySelector(".tle41-frequency-detail");
 const announce=root.querySelector('[role="status"]'),action=root.querySelector(".tle41-frequency-card button");
 action.textContent=labels.action;
 const rates=[1,.85,.90],values=[120,102,108],options=[];
 let chosen=0;
 function select(n,focus=false){
  chosen=(n+options.length)%options.length;
  control.style.setProperty("--i",String(chosen));
  options.forEach((b,i)=>{b.tabIndex=i===chosen?0:-1;b.setAttribute("aria-checked",String(i===chosen));});
  price.textContent="$"+values[chosen].toFixed(2);
  detail.textContent=labels.detail[chosen];
  badge.textContent=labels.badge[chosen];
  badge.classList.remove("pop");void badge.offsetWidth;badge.classList.add("pop");
  announce.textContent=labels.announce+": "+labels.badge[chosen];
  if(focus)options[chosen].focus();
 }
 labels.options.forEach((name,i)=>{
  const b=document.createElement("button");b.type="button";b.textContent=name;
  b.setAttribute("role","radio");b.setAttribute("aria-checked","false");b.tabIndex=-1;
  b.addEventListener("click",()=>select(i));
  b.addEventListener("keydown",event=>{
   const next=event.key==="ArrowRight"||event.key==="ArrowDown"?i+1:
              event.key==="ArrowLeft"||event.key==="ArrowUp"?i-1:
              event.key==="Home"?0:event.key==="End"?options.length-1:null;
   if(next===null)return;event.preventDefault();select(next,true);
  });
  control.append(b);options.push(b);
 });
 action.addEventListener("click",()=>{
  if(typeof window.startResidential!=="function")return;
  window.startResidential("Standard Cleaning",120);
  const frequency=document.getElementById("freq");
  if(frequency){frequency.selectedIndex=chosen;frequency.dispatchEvent(new Event("change",{bubbles:true}));}
 });
 const observe=new MutationObserver(()=>root.hidden=home.hidden);
 observe.observe(home,{attributes:true,attributeFilter:["hidden"]});
 root.hidden=home.hidden;select(0);
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();
