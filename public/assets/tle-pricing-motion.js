/* TLE public marketing pricing motion. Pure DOM/CSS; no libraries, no
   checkout mutations, server-side discount inference or demo instrumentation. */
(()=>{
 'use strict';
 const reduce=window.matchMedia('(prefers-reduced-motion: reduce)');
 document.documentElement.classList.add('tle-pricing-ready');
 const isReduced=()=>reduce.matches;
 const seen=new WeakSet();
 const visible=new WeakSet();
 const active=new Set();
 const observer=('IntersectionObserver' in window)
   ?new IntersectionObserver(entries=>{
     for(const entry of entries){
       if(entry.isIntersecting){
         const el=entry.target;
         if(el.classList.contains('cards'))el.classList.add('is-visible');
         else el.classList.add('is-price-visible');
         visible.add(el);active.delete(el);observer.unobserve(el);
       }
     }
   },{threshold:0.16,rootMargin:'0px 0px -8% 0px'})
   :null;
 const observe=el=>{
   if(!el||seen.has(el))return;
   seen.add(el);
   if(!observer||isReduced()){
     el.classList.add(el.classList.contains('cards')?'is-visible':'is-price-visible');
     visible.add(el);return;
   }
   active.add(el);observer.observe(el);
 };
 const discountsSelector=[
  '.sales-home .booking-offer-tag',
  '.service-hero .booking-offer-tag',
  '.service-sales .booking-offer-tag',
  '.tle-bundle-inline .tle-bundle-inline-discount',
  '.sales-home .service-discount-offer',
  '.service-hero .service-discount-offer',
  '.service-sales .service-discount-offer',
  '.sales-home .booking-offer-line',
  '.service-hero .booking-offer-line',
  '.service-sales .booking-offer-line'
 ].join(',');
 function scan(){
   document.querySelectorAll('#plans.tle-price-motion .cards,'+discountsSelector)
     .forEach(el=>{if(el.hidden||el.closest('[hidden]'))return;observe(el);});
 }
 let pending=false;
 const schedule=()=>{
   if(pending)return;pending=true;
   requestAnimationFrame(()=>{pending=false;scan();});
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',scan,{once:true});
 else scan();
 // JSX offers may hydrate later and a price badge may only appear after an
 // independently verified server read. Never reveal a hidden/ineligible offer.
 new MutationObserver(records=>{
   if(records.some(r=>r.addedNodes.length||r.type==='attributes'))schedule();
 }).observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden']});
 if(reduce.addEventListener)reduce.addEventListener('change',()=>{
   if(!isReduced())return;
   for(const el of active){
     el.classList.add(el.classList.contains('cards')?'is-visible':'is-price-visible');
     observer?.unobserve(el);
   }
   active.clear();
 });
 const group=document.querySelector('#plans .tle-plan-toggle[role="radiogroup"]');
 if(!group)return;
 const radios=Array.from(group.querySelectorAll('[role="radio"]'));
 const selectedCard=document.querySelector('#plans .tle-plan-selected');
 if(!selectedCard||radios.length!==3)return;
 const name=selectedCard.querySelector('[data-selected-name]');
 const price=selectedCard.querySelector('[data-selected-setup]');
 const cadence=selectedCard.querySelector('[data-selected-monthly]');
 const desc=selectedCard.querySelector('[data-selected-description]');
 const checkout=selectedCard.querySelector('[data-selected-checkout]');
 const badge=selectedCard.querySelector('.tle-savings-badge');
 const live=selectedCard.querySelector('[aria-live="polite"]');
 const fineprint=document.querySelector('#plans .tle-plan-picker .tle-plan-savings-fineprint');
 if(!fineprint||!name||!price||!cadence||!desc||!checkout||!badge||!live)return;
 const choiceMap={
  booking:{en:['AI Booking Assistant','$49','$19/month','Answers booking questions.','Choose Booking AI →'],es:['AI Booking Assistant','$49','$19/mes','Responde preguntas de reservas.','Elegir IA de reservas →']},
  business:{en:['AI Business Assistant','$69','$25/month','Booking and follow-up assistants together.','Choose both agents →'],es:['AI Business Assistant','$69','$25/mes','Reservas y seguimiento en un solo plan.','Elegir ambos agentes →']},
  followup:{en:['AI Follow-Up Assistant','$29','$12/month','Follows up with leads who gave consent.','Choose Follow-Up AI →'],es:['AI Follow-Up Assistant','$29','$12/mes','Da seguimiento a contactos que dieron su consentimiento.','Elegir seguimiento →']}
 };
 const es=document.documentElement.lang.toLowerCase().startsWith('es');
 const l=es?'es':'en';
 const hrefs={
  booking:'/service-checkout/?offer=ai-booking&lang='+l,
  business:'/service-checkout/?offer=ai-business&lang='+l,
  followup:'/service-checkout/?offer=ai-followup&lang='+l
 };
 function choose(i,focus=false,initial=false){
  i=Math.min(radios.length-1,Math.max(0,i));
  const activeRadio=radios[i],key=activeRadio.dataset.plan;
  const choice=choiceMap[key]?.[l];
  if(!choice)return;
  radios.forEach((r,j)=>{
   r.setAttribute('aria-checked',String(i===j));
   r.tabIndex=i===j?0:-1;
  });
  group.style.setProperty('--i',String(i));
  name.textContent=choice[0];price.textContent=choice[1];cadence.textContent=choice[2];
  desc.textContent=choice[3];checkout.textContent=choice[4];
  checkout.setAttribute('href',hrefs[key]);
  const saves=key==='business';
  badge.hidden=!saves;
  fineprint.hidden=!saves;
  if(saves&&!initial&&!isReduced()){
   badge.classList.remove('is-popping');
   void badge.offsetWidth; // restart only for real selected combined-plan savings
   badge.classList.add('is-popping');
  }else badge.classList.remove('is-popping');
  live.textContent=saves
   ?(es?'Ahorra $72 en 12 meses de mensualidades al elegir ambos agentes juntos frente a contratarlos por separado.':'Save $72 over 12 months of monthly charges compared with buying both assistants separately.')
   :(es?'Plan '+choice[0]+'. Instalación '+choice[1]+'; luego '+choice[2]+'.':'Plan '+choice[0]+'. '+choice[1]+' setup, then '+choice[2]+'.');
  if(focus)activeRadio.focus();
 }
 radios.forEach((r,i)=>{
  r.addEventListener('click',()=>choose(i));
  r.addEventListener('keydown',e=>{
   let next=i;
   if(e.key==='ArrowRight'||e.key==='ArrowDown')next=(i+1)%radios.length;
   else if(e.key==='ArrowLeft'||e.key==='ArrowUp')next=(i+radios.length-1)%radios.length;
   else if(e.key==='Home')next=0;
   else if(e.key==='End')next=radios.length-1;
   else return;
   e.preventDefault();choose(next,true);
  });
 });
 choose(Math.max(0,radios.findIndex(r=>r.getAttribute('aria-checked')==='true')),false,true);
})();
