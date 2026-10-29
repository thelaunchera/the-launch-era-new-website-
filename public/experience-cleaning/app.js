/* The Launch Era: isolated illustrative demo. No fetch, storage, form submission or real customer actions. */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const original={};
document.querySelectorAll('[data-t]').forEach(el=>{const key=el.dataset.t;original[key]=el.textContent.trim();});
const es={
 skip:'Ir a la demostración',safeTop:'Demo interactivo · Sin reservas reales',
 heroEyebrow:'UN SISTEMA PARA NO PERDER SOLICITUDES',heroTitle1:'Estás limpiando.',heroTitle2:'Y llega una nueva solicitud.',
 heroBody:'Tu cliente necesita pedir una limpieza sin complicaciones. Tú necesitas saber qué sigue. Prueba los dos lados de una misma reserva.',
 heroAction:'Probar una reserva',heroNote:'Unos cuantos toques. Sin registro.',
 floating1a:'NUEVA SOLICITUD',floating1b:'Limpieza profunda',floating2a:'TU ESPACIO',floating2b:'Lista para revisar',
 heroStamp:'RESERVAS + COMMAND CENTER',band1:'UNA SOLICITUD',band2:'UN ESPACIO CONECTADO',band3:'TODO EN UNA SOLA DEMOSTRACIÓN',
 experienceEyebrow:'01 / VISTA DEL CLIENTE',experienceHeading:'Mira qué fácil es solicitar una limpieza.',
 experienceSub:'Haz una solicitud de prueba como si fueras tu propio cliente. No se envía ni guarda nada.',
 sampleSubtitle:'PÁGINA DE RESERVAS DE EJEMPLO',sampleMode:'Modo de prueba',
 step1:'Servicio',step2:'Detalles',step3:'Horario',
 s1Tag:'ELIGE UN SERVICIO',s1Title:'¿Qué necesita limpieza?',s1Sub:'Toca una opción para comenzar.',
 serviceStandard:'Limpieza regular',serviceStandardHint:'Para el cuidado de siempre',
 serviceDeep:'Limpieza profunda',serviceDeepHint:'Para esos detalles extra',
 serviceMove:'Limpieza de mudanza',serviceMoveHint:'Para empezar de nuevo',
 serviceCustom:'Limpieza especial',serviceCustomHint:'Cotización según el trabajo',
 s2Tag:'SOLO ALGUNOS DETALLES',s2Title:'Cuéntanos sobre el lugar.',s2Sub:'Solo datos de ejemplo. No pedimos dirección ni contacto.',
 propertyLabel:'Tipo de espacio',propertyHouse:'Casa',propertyApartment:'Apartamento',propertyOffice:'Oficina / local',
 frequencyLabel:'¿Cada cuánto?',frequencyOnce:'Una sola vez',frequencyWeekly:'Cada semana',frequencyBiweekly:'Cada dos semanas',frequencyMonthly:'Cada mes',
 bedroomLabel:'Habitaciones',bathroomLabel:'Baños',extrasLabel:'Servicios adicionales',
 extraOven:'Interior del horno',extraFridge:'Interior del refrigerador',
 samplePrices:'Los valores son ilustrativos. Tus precios y servicios se personalizan.',
 s3Tag:'ÚLTIMO PASO',s3Title:'Elige cuándo prefieres la limpieza.',s3Sub:'Tu negocio decide qué horarios confirmar.',
 dateLabel:'Fecha preferida',timeLabel:'Horario preferido',timeMorning:'Mañana · 9–12',timeAfternoon:'Tarde · 12–4',timeFlexible:'Tengo flexibilidad',
 noSend:'Es una prueba interactiva, no una reserva real. No se envía ningún correo ni se cobra nada.',
 back:'Volver',continue:'Continuar',
 livePreviewEyebrow:'VISTA PREVIA EN VIVO',livePreviewTitle:'Tu solicitud, con todos los datos juntos.',
 receiptType:'DETALLES DE LA SOLICITUD',
 rService:'Servicio',rProperty:'Tipo de espacio',rFrequency:'Frecuencia',rExtras:'Adicionales',rDate:'Fecha preferida',rEstimate:'Precio ilustrativo',
 sampleFootnote:'No es una cotización ni una cita confirmada.',
 previewNote:'Los detalles quedan en un lugar, sin perderse entre mensajes.',
 handoffEyebrow:'SOLICITUD DE PRUEBA TERMINADA',handoffTitle:'Ahora mira lo que ve el negocio.',
 handoffBody:'Es la misma solicitud de hace un momento. Sin empezar de cero ni abrir otro demo.',
 ownerEyebrow:'02 / VISTA DEL NEGOCIO · ILUSTRATIVA',
 ownerTitle:'Una solicitud. Todo lo que necesitas, aquí.',
 ownerSub:'Mira cómo avanza una consulta hasta la cotización y el seguimiento. Son vistas de prueba, no mensajes reales.',
 dashRequests:'Solicitudes',dashQuotes:'Cotizaciones',dashFollowups:'Seguimientos',dashMockNote:'Espacio de ejemplo',
 dashToday:'TU COMMAND CENTER',dashHeading:'Acaba de llegar una solicitud.',dashSample:'DATOS DE PRUEBA',
 snapshotLabel:'NUEVA SOLICITUD DE LIMPIEZA',statusNew:'Por revisar',
 dashDate:'Fecha preferida',dashFrequency:'Frecuencia',dashExtras:'Adicionales',
 workflowLabel:'MIRA QUÉ SIGUE',workflowBack:'Paso anterior',
 ownerFootnote:'Demostración interactiva: no se crea ninguna reserva, cotización, correo, seguimiento ni cobro.',
 offerEyebrow:'AHORA, HAZLO TUYO',offerTitle:'Esta fue la prueba. Imagina el sistema con el nombre de tu negocio.',
 offerBody:'Tus servicios. Tus precios. Tu Command Center privado. Lo personalizamos para tu negocio de limpieza.',
 offerPrice:'PAGO ÚNICO · BOOKING SIN MENSUALIDAD',
 purchase:'Quiero mi Booking Page + Command Center',
 offerNote:'La IA es opcional y tiene un precio aparte. Verás todos los cargos antes de pagar.',
 tryAgain:'Probar otra solicitud de ejemplo',
 footerSafety:'Ejemplo interactivo. No se reservó ni se envió nada.',
 backSite:'Volver a The Launch Era',privacy:'Privacidad',terms:'Términos'
};
const names={
 en:{services:{standard:'Standard cleaning',deep:'Deep cleaning',move:'Move-in / move-out',custom:'Special cleaning'},
 properties:{house:'House',apartment:'Apartment',office:'Office / workspace'},
 frequency:{once:'One time',weekly:'Weekly',biweekly:'Every two weeks',monthly:'Monthly'},
 extras:{oven:'Inside oven',fridge:'Inside fridge'},
 time:{morning:'Morning · 9–12',afternoon:'Afternoon · 12–4',flexible:'Flexible'},
 none:'None',choose:'Not chosen',quote:'Custom quote',notSet:'Not selected',
 viewOwner:"See the owner's workspace",followOffer:'See your booking offer',
 phases:[
 {tag:'01 / NEW INQUIRY',title:'You know what just came in.',desc:'The request you completed is here with its service, date and details. You can review it before deciding what to do.',action:'Preview a quote',status:'Needs review'},
 {tag:'02 / QUOTE REVIEW',title:'You review the quote before it goes out.',desc:'Keep the example quote tied to the same request. This preview does not send anything to a customer.',action:'Preview quote sent',status:'Quote to review'},
 {tag:'03 / AUTOMATIC FOLLOW-UP',title:'No unanswered quote gets forgotten.',desc:'Eligible unanswered quotes can receive up to two automatic reminders. Follow-ups stop when the customer replies. No message is sent in this demo.',action:'See your booking offer',status:'Awaiting reply'}
 ]},
 es:{services:{standard:'Limpieza regular',deep:'Limpieza profunda',move:'Limpieza de mudanza',custom:'Limpieza especial'},
 properties:{house:'Casa',apartment:'Apartamento',office:'Oficina / local'},
 frequency:{once:'Una sola vez',weekly:'Cada semana',biweekly:'Cada dos semanas',monthly:'Cada mes'},
 extras:{oven:'Interior del horno',fridge:'Interior del refrigerador'},
 time:{morning:'Mañana · 9–12',afternoon:'Tarde · 12–4',flexible:'Flexible'},
 none:'Ninguno',choose:'Sin elegir',quote:'Cotización personalizada',notSet:'Sin elegir',
 viewOwner:'Ver el Command Center',followOffer:'Ver mi página de reservas',
 phases:[
 {tag:'01 / NUEVA SOLICITUD',title:'Sabes qué acaba de llegar.',desc:'La solicitud que acabas de completar aparece aquí con el servicio, la fecha y los detalles. La revisas antes de decidir.',action:'Ver cotización de ejemplo',status:'Por revisar'},
 {tag:'02 / REVISAR COTIZACIÓN',title:'Revisas el precio antes de enviarlo.',desc:'La cotización de ejemplo queda conectada a la misma solicitud. Esta prueba no envía ningún mensaje al cliente.',action:'Simular cotización enviada',status:'Cotización pendiente'},
 {tag:'03 / SEGUIMIENTO AUTOMÁTICO',title:'Una cotización sin respuesta no queda olvidada.',desc:'Las cotizaciones elegibles pueden recibir hasta dos recordatorios automáticos, que se detienen si el cliente responde. Esta prueba no envía mensajes.',action:'Ver mi página de reservas',status:'Esperando respuesta'}
 ]}
};
const params=new URLSearchParams(location.search);
const currentLang=params.get('lang')==='es'?'es':'en';
function localDate(offset){const d=new Date();d.setHours(12,0,0,0);d.setDate(d.getDate()+offset);return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');}
const state={lang:currentLang,step:1,service:'standard',property:'house',frequency:'once',beds:'2',baths:'2',extras:[],date:localDate(3),time:'morning',sent:false,phase:0};
const servicePrices={standard:120,deep:190,move:240,custom:null};
const extraPrices={oven:30,fridge:25};
$('date').min=localDate(1);$('date').max=localDate(120);$('date').value=state.date;
function namesFor(){return names[state.lang];}
function dateDisplay(){
 if(!state.date)return namesFor().notSet;
 const d=new Date(state.date+'T12:00:00');
 return new Intl.DateTimeFormat(state.lang==='es'?'es-US':'en-US',{month:'short',day:'numeric',year:'numeric'}).format(d);
}
function t(key){return state.lang==='es'?(es[key]||original[key]||key):(original[key]||key);}
function appliedPrice(){
 const base=servicePrices[state.service];if(base===null)return namesFor().quote;
 const room=Math.max(0,Number(state.beds)-2)*20;
 const add=state.extras.reduce((sum,k)=>sum+(extraPrices[k]||0),0);
 return '$'+String(base+room+add);
}
function formatExtras(){return state.extras.length?state.extras.map(k=>namesFor().extras[k]).join(', '):namesFor().none;}
function syncServices(){
 document.querySelectorAll('[data-service]').forEach(el=>{
  const selected=el.dataset.service===state.service;
  el.classList.toggle('is-selected',selected);
  el.setAttribute('aria-checked',String(selected));
 });
}
function syncReceipt(){
 const n=namesFor();
 $('r-service').textContent=n.services[state.service];
 $('r-property').textContent=n.properties[state.property]+(state.property==='office'?'':' · '+state.beds+'/'+state.baths);
 $('r-frequency').textContent=n.frequency[state.frequency];
 $('r-extras').textContent=formatExtras();
 $('r-date').textContent=state.step>=3?dateDisplay():n.choose;
 $('r-price').textContent=appliedPrice();
 if(state.sent)syncOwner();
}
function syncOwner(){
 const n=namesFor();
 $('owner-service').textContent=n.services[state.service];
 $('owner-meta').textContent=n.properties[state.property]+' · '+n.time[state.time];
 $('owner-date').textContent=dateDisplay();
 $('owner-frequency').textContent=n.frequency[state.frequency];
 $('owner-extras').textContent=formatExtras();
 renderPhase();
}
function setStage(step){
 state.step=Math.min(3,Math.max(1,step));
 [1,2,3].forEach(x=>{
  $('stage-'+x).hidden=x!==state.step;
  const label=document.querySelector('[data-step-label="'+x+'"]');
  label.classList.toggle('is-current',x===state.step);
  label.classList.toggle('is-done',x<state.step);
 });
 $('back').hidden=state.step===1;
 $('next').textContent=state.step===3?(state.sent?namesFor().viewOwner:namesFor().viewOwner):t('continue');
 syncReceipt();
}
function renderPhase(){
 const n=namesFor(),info=n.phases[state.phase];
 $('workflow-tag').textContent=info.tag;
 $('workflow-title').textContent=info.title;
 $('workflow-desc').textContent=info.desc;
 $('workflow-next').textContent=info.action;
 $('owner-status').textContent=info.status;
 $('workflow-counter').textContent='0'+(state.phase+1)+' / 03';
 document.querySelectorAll('.workflow-progress span').forEach((el,i)=>el.classList.toggle('is-done',i<=state.phase));
 $('workflow-prev').hidden=state.phase===0;
}
function applyLanguage(){
 document.documentElement.lang=state.lang;
 document.title=state.lang==='es'?'De la reserva al Command Center · The Launch Era':'See the full booking journey · The Launch Era';
 document.querySelectorAll('[data-t]').forEach(el=>{el.textContent=t(el.dataset.t);});
 $('language').textContent=state.lang==='es'?'EN':'ES';
 $('language').setAttribute('aria-label',state.lang==='es'?'Switch to English':'Cambiar a español');
 $('purchase-link').href='/booking-bundle/?lang='+state.lang+'&source=experience-cleaning#choose-plan';
 $('service-grid').setAttribute('aria-label',state.lang==='es'?'Servicios de limpieza':'Cleaning services');
 const q=new URLSearchParams(location.search);q.set('lang',state.lang);
 history.replaceState(null,'',location.pathname+'?'+q.toString()+location.hash);
 setStage(state.step);syncReceipt();if(state.sent)syncOwner();
}
$('language').addEventListener('click',()=>{state.lang=state.lang==='en'?'es':'en';applyLanguage();});
document.querySelectorAll('[data-service]').forEach(button=>button.addEventListener('click',()=>{
 state.service=button.dataset.service;syncServices();syncReceipt();
}));
$('service-grid').addEventListener('keydown',e=>{
 if(!['ArrowLeft','ArrowRight','ArrowDown','ArrowUp'].includes(e.key))return;
 const list=[...document.querySelectorAll('[data-service]')],index=list.findIndex(x=>x===document.activeElement);
 if(index<0)return;e.preventDefault();const next=(index+(['ArrowRight','ArrowDown'].includes(e.key)?1:-1)+list.length)%list.length;
 list[next].focus();list[next].click();
});
['property','frequency','beds','baths'].forEach(id=>$(id).addEventListener('change',()=>{state[id==='property'?'property':id]= $(id).value;syncReceipt();}));
document.querySelectorAll('.extras input').forEach(x=>x.addEventListener('change',()=>{state.extras=[...document.querySelectorAll('.extras input:checked')].map(el=>el.value);syncReceipt();}));
$('date').addEventListener('change',()=>{state.date=$('date').value;syncReceipt();});
document.querySelectorAll('input[name="preferred-time"]').forEach(x=>x.addEventListener('change',()=>{state.time=x.value;syncReceipt();}));
$('back').addEventListener('click',()=>setStage(state.step-1));
$('next').addEventListener('click',()=>{
 if(state.step<3){setStage(state.step+1);if(innerWidth<760)$('experience').scrollIntoView({behavior:'smooth'});return;}
 if(!$('date').value||$('date').value<$('date').min||$('date').value>$('date').max){$('date').focus();$('date').reportValidity();return;}
 state.date=$('date').value;state.sent=true;state.phase=0;
 $('handoff').hidden=false;$('owner').hidden=false;
 syncOwner();
 $('handoff').scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
});
$('workflow-next').addEventListener('click',()=>{
 if(state.phase<2){state.phase++;renderPhase();return;}
 $('get-yours').scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
});
$('workflow-prev').addEventListener('click',()=>{state.phase=Math.max(0,state.phase-1);renderPhase();});
$('restart').addEventListener('click',()=>{
 state.step=1;state.service='standard';state.property='house';state.frequency='once';state.beds='2';state.baths='2';state.extras=[];state.date=localDate(3);state.time='morning';state.sent=false;state.phase=0;
 $('property').value='house';$('frequency').value='once';$('beds').value='2';$('baths').value='2';$('date').value=state.date;
 document.querySelectorAll('.extras input').forEach(x=>{x.checked=false;});
 document.querySelectorAll('input[name="preferred-time"]').forEach(x=>{x.checked=x.value==='morning';});
 $('handoff').hidden=true;$('owner').hidden=true;
 syncServices();setStage(1);
 $('experience').scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
});
syncServices();applyLanguage();
})();