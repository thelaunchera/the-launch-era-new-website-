/* Experience Cleaning | Booking Atelier (2026-11-09)
   Progressive enhancement only. No network, persistence, quote creation or bookings.
   The existing app.js remains the source of truth for all demo prices/state. */
(() => {
 'use strict';
 if(document.body?.dataset.tleExperience!=='cleaning')return;
 const $=id=>document.getElementById(id);
 const texts={
  en:{
   inclKicker:'EXAMPLE SERVICE CHECKLIST',inclDisclaimer:'Illustrative inclusions — each cleaning business sets its own service scope.',
   reviewTitle:'Your request, at a glance',reviewNote:'Review your preferences before seeing how the request appears to the owner.',
   reviewDisclosure:'Preview only — no appointment is booked and no payment is made.',
   total:'Sample estimate',quote:'Estimate after review',sample:'Sample total',sampleFrom:'Sample from',estimate:'Request estimate',
   service:'Service',property:'Space',frequency:'Frequency',extras:'Extras',date:'Preferred date',time:'Arrival window',
   editService:'Change service',editDetails:'Edit details',picked:'Selected service',
   next1:'Continue to details',next2:'Choose preferred time',next3:'Preview the request',next3commercial:'Preview estimate request',
   timeHelp:'Preferred arrival windows only — live availability is not being checked.',
   inclusions:{
    standard:['Kitchen and visible surfaces','Bathrooms and mirrors','Floors and shared spaces'],
    deep:['Detailed bathroom care','Extra attention to buildup','Hard-to-reach areas'],
    move:['Empty-space refresh','Kitchen and cabinet fronts','Floors and final details'],
    custom:['A service tailored to the space','A personalized scope review','Quote prepared after review'],
    office:['Office surfaces and desks','Shared spaces and floors','Business-friendly cleaning plan'],
    customCommercial:['Custom property review','Service scope by business type','Estimate prepared after review']
   }
  },
  es:{
   inclKicker:'EJEMPLO DE LO QUE INCLUYE',inclDisclaimer:'Servicios ilustrativos. Cada negocio define exactamente qué incluye cada limpieza.',
   reviewTitle:'Revisa tu solicitud',reviewNote:'Comprueba tus preferencias antes de ver cómo recibe la solicitud el negocio.',
   reviewDisclosure:'Vista de ejemplo: no se programa ninguna cita ni se realiza un pago.',
   total:'Estimado de ejemplo',quote:'Cotización por revisar',sample:'Total ilustrativo',sampleFrom:'Desde (ejemplo)',estimate:'Solicitar estimado',
   service:'Servicio',property:'Espacio',frequency:'Frecuencia',extras:'Adicionales',date:'Fecha preferida',time:'Horario preferido',
   editService:'Cambiar servicio',editDetails:'Editar detalles',picked:'Servicio seleccionado',
   next1:'Continuar con detalles',next2:'Elegir horario preferido',next3:'Ver solicitud de ejemplo',next3commercial:'Ver solicitud de estimado',
   timeHelp:'Son horarios de preferencia; esta demostración no consulta disponibilidad real.',
   inclusions:{
    standard:['Cocina y superficies visibles','Baños y espejos','Pisos y áreas comunes'],
    deep:['Limpieza detallada de baños','Atención extra a manchas','Áreas difíciles de alcanzar'],
    move:['Espacios vacíos','Cocina y frentes de gabinetes','Pisos y detalles finales'],
    custom:['Servicio adaptado al espacio','Revisión personalizada','Cotización después de revisar'],
    office:['Escritorios y superficies','Áreas comunes y pisos','Plan para espacios de trabajo'],
    customCommercial:['Revisión del local','Alcance según el negocio','Estimado después de revisar']
   }
  }
 };
 const startingPrice={standard:120,deep:190,move:240,custom:null};
 const cards=[...document.querySelectorAll('#service-grid .service-card,#commercial-service-grid .service-card')];
 for(const card of cards){
  if(card.querySelector('.booking-card-price'))continue;
  const badge=document.createElement('span');
  badge.className='booking-card-price';
  badge.dataset.priceFor=card.dataset.service||card.dataset.commercialService||'custom';
  card.appendChild(badge);
 }
 let queued=false;
 function schedule(){
  if(queued)return;
  queued=true;
  const next=()=>{queued=false;sync()};
  if(typeof requestAnimationFrame==='function')requestAnimationFrame(next);
  else queueMicrotask(next);
 }
 function selected(){
  const commercial=document.querySelector('.booking-category-tab.is-active')?.dataset.category==='commercial';
  const grid=$(commercial?'commercial-service-grid':'service-grid');
  const card=grid?.querySelector('.service-card.is-selected')||grid?.querySelector('.service-card');
  return {commercial,card,service:card?.dataset.service||card?.dataset.commercialService||'standard'};
 }
 function read(id){return $(id)?.textContent?.trim()||'—';}
 function put(id,value){const node=$(id);if(node&&node.textContent!==value)node.textContent=value;}
 function sync(){
  const lang=document.documentElement.lang==='es'?'es':'en';
  const t=texts[lang];
  const {commercial,service}=selected();
  const price=read('r-price');
  const estimate=commercial||service==='custom'||!/^\$[\d,.]+$/.test(price);
  for(const card of cards){
   const badge=card.querySelector('.booking-card-price');
   const base=startingPrice[card.dataset.service];
   badge.textContent=base!=null?t.sampleFrom+' $'+base:t.estimate;
  }
  const inclusion=t.inclusions[service]||t.inclusions.custom;
  put('booking-inclusions-kicker',t.inclKicker);
  put('booking-inclusions-title',read('r-service'));
  put('booking-inclusions-disclaimer',t.inclDisclaimer);
  document.querySelectorAll('#booking-inclusions-list li').forEach((item,i)=>{item.textContent=inclusion[i]||''});
  put('booking-inline-kicker',estimate?t.quote:t.sample);
  put('booking-inline-service',read('r-service'));
  put('booking-inline-value',price);
  put('booking-inline-caption',estimate?t.estimate:t.total);
  $('booking-inline-value')?.setAttribute('data-estimate',String(estimate));
  put('booking-review-title',t.reviewTitle);
  put('booking-review-desc',t.reviewNote);
  put('booking-review-service',read('r-service'));
  put('booking-review-property',read('r-property'));
  put('booking-review-frequency',read('r-frequency'));
  put('booking-review-extras',read('r-extras'));
  put('booking-review-date',read('r-date'));
  const time=document.querySelector('input[name="preferred-time"]:checked')?.closest('label')?.querySelector('span')?.textContent?.trim();
  put('booking-review-time',time||'—');
  put('booking-review-total-label',estimate?t.quote:t.total);
  put('booking-review-total',price);
  $('booking-review-total')?.setAttribute('data-estimate',String(estimate));
  put('booking-review-note',t.reviewDisclosure);
  put('booking-review-edit-service',t.editService);
  put('booking-review-edit-details',t.editDetails);
  put('booking-time-help',t.timeHelp);
  for(const field of ['service','property','frequency','extras','date','time']){
   put('booking-review-label-'+field,t[field]);
  }
  for(const label of document.querySelectorAll('.steps [data-step-label]')){
   if(label.classList.contains('is-current')) label.setAttribute('aria-current','step');
   else label.removeAttribute('aria-current');
  }
  const current=document.querySelector('.steps .step.is-current')?.dataset.stepLabel||'1';
  const action=$('next');
  if(action)action.textContent=current==='1'?t.next1:current==='2'?t.next2:commercial?t.next3commercial:t.next3;
  // The inactive owner dashboard is never a real confirmation or email notice.
 }
 document.addEventListener('click',event=>{
  if(event.target.closest('#service-grid .service-card,#commercial-service-grid .service-card,.booking-category-tab,#next,#back,#restart,#language'))sync();
 });
 document.addEventListener('change',event=>{
  if(event.target.closest('#stage-2,#stage-3'))sync();
 });
 const watch=new MutationObserver(schedule);
 for(const id of ['r-price','r-service','r-property','r-frequency','r-extras','r-date']){
  const node=$(id);
  if(node)watch.observe(node,{subtree:true,childList:true,characterData:true});
 }
 for(const sel of ['.steps','.booking-category','#service-grid','#commercial-service-grid']){
  const node=document.querySelector(sel);
  if(node)watch.observe(node,{subtree:true,attributes:true,attributeFilter:['class','aria-checked']});
 }
 // Complete navigation remains owned by app.js; these edit shortcuts use its Back button.
 function backTo(target){
  let current=Number(document.querySelector('.steps .step.is-current')?.dataset.stepLabel||1);
  while(current>target){
   $('back')?.click();
   current--;
  }
  schedule();
 }
 $('booking-review-edit-service')?.addEventListener('click',()=>backTo(1));
 $('booking-review-edit-details')?.addEventListener('click',()=>backTo(2));
 sync();
})();
