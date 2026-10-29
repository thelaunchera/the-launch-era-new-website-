/* The Launch Era: isolated illustrative demo. No fetch, storage, form submission or real customer actions. */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const original={};
document.querySelectorAll('[data-t]').forEach(el=>{const key=el.dataset.t;original[key]=el.textContent.trim();});
const es={
 skip:'Ir a la demostración',safeTop:'Demo interactivo · Sin reservas reales',
 heroEyebrow:'MIENTRAS ESTÁS TRABAJANDO',heroTitle1:'Estás limpiando.',heroTitle2:'Y te escriben para reservar.',
 heroBody:'No puedes contestar cada mensaje mientras limpias. Prueba una reserva y mira dónde llega la solicitud.',
 heroAction:'Probar una reserva',heroNote:'Una sola solicitud. Sin registro.',
 floating1a:'NUEVA SOLICITUD',floating1b:'Limpieza profunda',floating2a:'TU ESPACIO',floating2b:'Lista para revisar',
 heroStamp:'RESERVAS + COMMAND CENTER',band1:'UNA SOLICITUD',band2:'UN ESPACIO CONECTADO',band3:'TODO EN UNA SOLA DEMOSTRACIÓN',
 experienceEyebrow:'01 / VISTA DEL CLIENTE',experienceHeading:'Tu clienta solo quiere reservar sin complicaciones.',
 experienceSub:'Tres pasos para ver cómo funciona. No se envía ni se guarda nada.',
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
 handoffEyebrow:'SOLICITUD DE PRUEBA TERMINADA',handoffTitle:'Y así, la solicitud llega a tus manos.',
 handoffBody:'La misma solicitud, con todos sus detalles en tu espacio de trabajo.',
 ownerEyebrow:'02 / VISTA DEL NEGOCIO · ILUSTRATIVA',
 ownerTitle:'Lo que tu clienta no ve, pero tú sí.',
 ownerSub:'La misma solicitud llega lista para revisar, cotizar y dar seguimiento, sin buscar entre mensajes.',
 dashRequests:'Solicitudes',dashQuotes:'Cotizaciones',dashFollowups:'Seguimientos',dashMockNote:'Espacio de ejemplo',
 dashToday:'TU COMMAND CENTER',dashHeading:'Acaba de llegar una solicitud.',dashSample:'EJEMPLO INTERACTIVO · SIN DATOS REALES',
 dashBrandSmall:'COMMAND CENTER',dashSideLabel:'MI ESPACIO',dashWelcome:'Sin buscar entre mensajes. Aquí ves lo que sigue.',
 metricOne:'Nueva solicitud',metricOneNote:'Desde tu página de reservas',metricTwo:'Valor ilustrativo',metricTwoNote:'Según la selección de ejemplo',metricThree:'Próxima acción',metricThreeNote:'Mira cómo avanza',
 inboxTitle:'SOLICITUDES',inboxNew:'Nueva desde tu página de reservas',inboxSample:'EJEMPLO #001',requestPriceLabel:'Valor ilustrativo',
 activityTitle:'ACTIVIDAD',activityRequest:'Solicitud recibida',activityRequestHint:'Todos los detalles juntos',activityQuote:'Vista previa de cotización',activityQuoteHint:'Lista para revisar',activityFollow:'Vista previa de seguimiento',activityFollowHint:'Solo cuando corresponde',
 actionTitle:'PRÓXIMO PASO',actionAuto:'Recorrido de prueba',visualPreviewLabel:'VISTA DE EJEMPLO',
 snapshotLabel:'NUEVA SOLICITUD DE LIMPIEZA',statusNew:'Por revisar',
 dashDate:'Fecha preferida',dashFrequency:'Frecuencia',dashExtras:'Adicionales',
 workflowLabel:'MIRA QUÉ SIGUE',workflowBack:'Paso anterior',
 ownerFootnote:'Demostración interactiva: no se crea ninguna reserva, cotización, correo, seguimiento ni cobro.',
 offerEyebrow:'AHORA, HAZLO TUYO',offerTitle:'Esta fue una prueba. La próxima solicitud puede ser tuya.',
 offerBody:'Tu nombre, tus servicios y tu propio Command Center. Un sistema preparado para cuando lleguen tus clientes.',
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
const visuals={
 en:[
  {title:'Request received',detail:'All selected services, room details and the preferred date are together in one request.',status:'Ready for owner review',action:'Review'},
  {title:'Quote ready to review',detail:'The estimated value stays connected to this request. You decide whether a real quote goes out.',status:'Illustrative quote · not sent',action:'Quote'},
  {title:'Follow-up handled',detail:'For eligible unanswered quotes, up to two automatic reminders can be scheduled and stop when the customer responds.',status:'Illustrative reminders · not sent',action:'Follow-up'}
 ],
 es:[
  {title:'Solicitud recibida',detail:'El servicio, los detalles y la fecha elegida quedan juntos en una sola solicitud.',status:'Lista para que la revises',action:'Revisar'},
  {title:'Cotización lista para revisar',detail:'El precio estimado queda conectado a esta solicitud. Tú decides si se envía una cotización real.',status:'Cotización de ejemplo · no enviada',action:'Cotización'},
  {title:'El sistema da seguimiento',detail:'Para cotizaciones elegibles sin respuesta, se pueden programar hasta dos recordatorios automáticos que se detienen cuando el cliente responde.',status:'Recordatorios de ejemplo · no enviados',action:'Seguimiento'}
 ]
};
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
 $('owner-price').textContent=appliedPrice();
 $('metric-value').textContent=appliedPrice();
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
 const dashboard=document.querySelector('.owner-dashboard');
 dashboard.dataset.phase=String(state.phase);
 document.querySelectorAll('.dash-nav button[data-phase]').forEach(button=>{
  const active=Number(button.dataset.phase)===state.phase;
  button.classList.toggle('active',active);
  button.setAttribute('aria-pressed',String(active));
 });
 const preview=visuals[state.lang][state.phase];
 $('metric-action').textContent=preview.action;
 $('visual-title').textContent=preview.title;
 $('visual-detail').textContent=preview.detail;
 $('visual-status').textContent=preview.status;
 $('activity-quote-hint').textContent=state.phase>=1?(state.lang==='es'?'Vista previa revisada':'Preview reviewed'):(state.lang==='es'?'Lista para revisar':'Ready to review');
 $('activity-follow-hint').textContent=state.phase>=2?(state.lang==='es'?'Vista previa del recordatorio':'Reminder preview'):(state.lang==='es'?'Solo cuando corresponde':'Only when eligible');
 // Re-trigger a subtle animation without changing the booking data.
 const card=document.querySelector('.workflow-visual');
 if(card){card.style.animation='none';void card.offsetWidth;card.style.animation='';}
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
// Keep the visitor within the booking panel instead of jumping back to the large heading.
function scrollToCurrentBookingStep(){
 if(window.innerWidth>760)return;
 const target=document.querySelector('.steps');
 if(!target)return;
 const reduce=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
 target.scrollIntoView({behavior:reduce?'auto':'smooth',block:'start'});
}
$('back').addEventListener('click',()=>{setStage(state.step-1);scrollToCurrentBookingStep();});
$('next').addEventListener('click',()=>{
 if(state.step<3){setStage(state.step+1);scrollToCurrentBookingStep();return;}
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
document.querySelectorAll('.dash-nav button[data-phase]').forEach(button=>button.addEventListener('click',()=>{
 if(!state.sent)return;
 state.phase=Number(button.dataset.phase);
 renderPhase();
}));
$('restart').addEventListener('click',()=>{
 state.step=1;state.service='standard';state.property='house';state.frequency='once';state.beds='2';state.baths='2';state.extras=[];state.date=localDate(3);state.time='morning';state.sent=false;state.phase=0;
 $('property').value='house';$('frequency').value='once';$('beds').value='2';$('baths').value='2';$('date').value=state.date;
 document.querySelectorAll('.extras input').forEach(x=>{x.checked=false;});
 document.querySelectorAll('input[name="preferred-time"]').forEach(x=>{x.checked=x.value==='morning';});
 $('handoff').hidden=true;$('owner').hidden=true;
 syncServices();setStage(1);
 $('experience').scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
});
// Demo mode switch: local-only residential bookings and commercial estimates.
// No network calls, customer records, payments or messages.
state.category='residential';state.commercialService='office';state.commercialArea='under2000';
Object.assign(es,{
 navNote:'CUIDAMOS TU HOGAR',navCta:'Ver servicios',heroPhotoNote:'LIMPIEZA CON DETALLE',
 heroEyebrow:'UNA CASA LIMPIA SE SIENTE DISTINTO',heroTitle1:'Tu casa impecable.',heroTitle2:'Reservar, sin complicaciones.',
 heroBody:'Descubre nuestros servicios, elige lo que necesitas y solicita tu fecha preferida. Así de sencillo.',
 heroAction:'Ver servicios de limpieza',heroNote:'Vista interactiva · No se hacen reservas reales',
 experienceHeadingTop:'Reserva tu limpieza residencial.',experienceHeadingBottom:'O solicita un estimado comercial.',experienceSub:'Elige el servicio, prueba cómo funciona y mira cómo la solicitud llega al negocio. Sin registrarte.',
 band1:'Reservas residenciales',band2:'Estimados comerciales',band3:'Todo en un mismo espacio',
 categoryHome:'Residencial',categoryHomeHint:'Reserva de ejemplo',categoryCommercial:'Comercial',categoryCommercialHint:'Solo estimados',
 officeService:'Limpieza de oficinas',officeServiceHint:'Oficinas y espacios compartidos',
 customCommercialService:'Locales comerciales',customCommercialHint:'Estimado personalizado',
 commercialOnlyNote:'Para limpieza comercial se prepara un estimado. No hay precio automático ni reserva confirmada.',
 commercialAreaLabel:'Área aproximada',areaUnder:'Menos de 2,000 pies²',areaMid:'2,000–5,000 pies²',areaOver:'Más de 5,000 pies²',
 commercialDetailsNote:'El negocio revisa los detalles antes de preparar el estimado.',
 livePreviewTitle:'Tu solicitud, en un solo lugar.',
 sampleFootnote:'Solo una prueba · No se hizo ninguna reserva ni se confirmó un precio',
 workEyebrow:'LOS DETALLES HACEN LA DIFERENCIA',workTitle:'La limpieza se siente.',workIntro:'Desde un baño impecable hasta una casa donde también viven mascotas, los pequeños detalles hacen que todo se sienta distinto.',
 workKitchen:'Cocina impecable',workBathroom:'Baños cuidados',workBedroom:'Habitaciones frescas',
 workLiving:'Salas y entradas',workDetails:'Limpieza en acción',workPets:'Espacios para mascotas',
 workBanner:'NUESTROS TRABAJOS',workDisclaimer:'Fotografías ilustrativas para mostrar el diseño del portafolio; no son trabajos reales realizados para clientes.',
 workPause:'Pausar carrusel',workPlay:'Reanudar carrusel',
 teamImageTag:'EL LADO HUMANO DE LA LIMPIEZA',teamEyebrow:'CONOCE A QUIEN CUIDA TU HOGAR',
 teamTitle:'Una persona de confianza. Tu casa bien cuidada.',
 teamLead:'Abres tu puerta a alguien en quien puedas confiar. Atención a cada espacio, respeto por tu familia y cuidado también cuando hay mascotas.',
 teamValue1:'Cuidado en cada habitación',teamValue2:'Respeto por tu espacio',teamValue3:'Comodidad con mascotas',
 teamDisclaimer:'Presentación ilustrativa para esta demostración. Cada negocio añade la foto y la historia reales de su dueña o equipo.',
 reviewsEyebrow:'DETRÁS DE CADA HOGAR HAY UNA HISTORIA',reviewsTitle:'Que lo cuenten tus clientes.',
 reviewsIntro:'Aquí van las reseñas reales de tus clientes, para que otras personas conozcan la calidad y confianza de tu trabajo.',
 reviewSampleLabel:'RESEÑA DE EJEMPLO · NO ES UNA VALORACIÓN REAL',
 reviewQuote1:'“Cada habitación quedó fresca y muy bien cuidada.”',
 reviewQuote2:'“La cocina y los baños quedaron preciosos.”',
 reviewQuote3:'“Una casa acogedora, con cuidado también para las mascotas.”',
 reviewTheme1:'Atención al detalle',reviewTheme2:'Frescura en casa',reviewTheme3:'Cuidado con mascotas',
 reviewsDisclaimer:'Los textos y las cinco estrellas son solamente ejemplos de diseño, no opiniones ni calificaciones reales. Se sustituyen por reseñas verificadas.'
});
const legacyPrice=appliedPrice;
appliedPrice=function(){return state.category==='commercial'?(state.lang==='es'?'Solicitar estimado':'Request estimate'):legacyPrice();};
const legacySyncServices=syncServices;
syncServices=function(){
 legacySyncServices();
 document.querySelectorAll('[data-commercial-service]').forEach(button=>{
  const active=button.dataset.commercialService===state.commercialService;
  button.classList.toggle('is-selected',active);button.setAttribute('aria-checked',String(active));
 });
};
const originalSyncReceipt=syncReceipt;
function commercialLabel(){return state.lang==='es'?(state.commercialService==='office'?'Limpieza de oficinas':'Locales comerciales'):(state.commercialService==='office'?'Office cleaning':'Business spaces');}
syncReceipt=function(){
 originalSyncReceipt();
 if(state.category==='commercial'){
  $('r-service').textContent=commercialLabel();
  $('r-property').textContent=$('commercial-area').selectedOptions[0].textContent;
  $('r-extras').textContent=state.lang==='es'?'No aplica':'Not applicable';
 }
};
const originalSyncOwner=syncOwner;
syncOwner=function(){
 originalSyncOwner();
 if(state.category==='commercial'){
  $('owner-service').textContent=commercialLabel();
  $('owner-meta').textContent=(state.lang==='es'?'Estimado comercial · ':'Commercial estimate · ')+names[state.lang].time[state.time];
  $('owner-extras').textContent=state.lang==='es'?'No aplica':'Not applicable';
 }
};
const originalRenderPhase=renderPhase;
renderPhase=function(){
 originalRenderPhase();
 if(state.category!=='commercial')return;
 const phases=state.lang==='es'?[
 ['SOLICITUD DE ESTIMADO','Un negocio solicita limpieza','Revisa el área y los horarios antes de preparar cualquier precio.','Estimado por revisar','Solicitud recibida','La información comercial se guarda junta en la solicitud de muestra.','Revisión comercial'],
 ['PREPARAR ESTIMADO','Aquí no se cobra automáticamente','El dueño revisa el tipo de local, tamaño y frecuencia antes de preparar su estimado.','Estimado por preparar','Estimado personalizado','No se genera una tarifa fija para espacios comerciales.','Estimar'],
 ['SEGUIMIENTO','Tu estimado no queda olvidado','Si después existe una cotización elegible sin respuesta, pueden enviarse hasta dos recordatorios automáticos, que se detienen al responder el cliente.','Esperando respuesta','Seguimiento de ejemplo','No se envía ningún mensaje durante esta demostración.','Seguimiento']
 ]:[
 ['ESTIMATE REQUEST','Commercial request received','Review the space and schedule before preparing any price.','Estimate needs review','Request received','Commercial information stays together in this local demo.','Review'],
 ['PREPARE ESTIMATE','No automatic commercial charge','The owner reviews the premises, size and frequency before preparing an estimate.','Estimate to prepare','Custom estimate','Commercial projects do not receive a fixed price automatically.','Estimate'],
 ['FOLLOW-UP','Keep track of the estimate','If an eligible quote later goes unanswered, up to two automatic reminders can go out and stop when the customer responds.','Awaiting reply','Follow-up preview','No reminder is sent during this demo.','Follow-up']
 ];
 const p=phases[state.phase];
 $('workflow-tag').textContent=p[0];$('workflow-title').textContent=p[1];$('workflow-desc').textContent=p[2];
 $('owner-status').textContent=p[3];$('visual-title').textContent=p[4];$('visual-detail').textContent=p[5];$('metric-action').textContent=p[6];
 $('visual-status').textContent=state.lang==='es'?'Vista ilustrativa · sin mensajes':'Illustrative preview · no messages';
};
function syncCategory(){
 const commercial=state.category==='commercial';
 $('service-grid').hidden=commercial;$('commercial-service-grid').hidden=!commercial;
 $('commercial-estimate-note').hidden=!commercial;$('commercial-details').hidden=!commercial;
 document.querySelectorAll('.residential-only').forEach(el=>{el.hidden=commercial;});
 $('property').disabled=commercial;
 $('property').value=commercial?'office':state.property;
 document.querySelectorAll('.booking-category-tab').forEach(button=>{
  const active=button.dataset.category===state.category;
  button.classList.toggle('is-active',active);button.setAttribute('aria-pressed',String(active));
 });
 $('r-price').classList.toggle('is-estimate',commercial);
 $('metric-value').classList.toggle('is-estimate',commercial);
 syncServices();syncReceipt();
 if(state.sent)syncOwner();
}
const oldApplyLanguage=applyLanguage;
applyLanguage=function(){
 oldApplyLanguage();
 $('commercial-service-grid').setAttribute('aria-label',state.lang==='es'?'Servicios comerciales para estimado':'Commercial estimate services');
 syncCategory();
};
document.querySelectorAll('.booking-category-tab').forEach(btn=>btn.addEventListener('click',()=>{
 if(state.category===btn.dataset.category)return;
 state.category=btn.dataset.category;state.step=1;state.sent=false;state.phase=0;
 $('owner').hidden=true;$('handoff').hidden=true;
 syncCategory();setStage(1);
}));
document.querySelectorAll('[data-commercial-service]').forEach(btn=>btn.addEventListener('click',()=>{
 state.commercialService=btn.dataset.commercialService;syncServices();syncReceipt();
}));
$('commercial-area').addEventListener('change',()=>{state.commercialArea=$('commercial-area').value;syncReceipt();});
$('restart').addEventListener('click',()=>{state.category='residential';state.commercialService='office';state.commercialArea='under2000';$('commercial-area').value='under2000';syncCategory();});

// User-controlled pause for the continuously moving portfolio gallery.
const workPause=$('work-pause');
const workRunner=$('work-runner');
let workIsPaused=false;
function syncWorkPause(){
 const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
 if(workPause){
  workPause.setAttribute('aria-pressed',String(workIsPaused));
  workPause.textContent=workIsPaused?(state.lang==='es'?'Reanudar carrusel':'Resume gallery'):(state.lang==='es'?'Pausar carrusel':'Pause gallery');
  workPause.disabled=Boolean(reduced);
  if(reduced)workPause.textContent=state.lang==='es'?'Carrusel sin movimiento':'Gallery motion disabled';
 }
 if(workRunner)workRunner.classList.toggle('is-paused',workIsPaused);
}
workPause?.addEventListener('click',()=>{workIsPaused=!workIsPaused;syncWorkPause();});
const originalApplyLanguage=applyLanguage;
applyLanguage=function(){
 originalApplyLanguage();syncWorkPause();
 document.querySelectorAll('.review-stars').forEach(el=>{
  el.setAttribute('aria-label',state.lang==='es'?'Cinco estrellas ilustrativas, no es una calificación real':'Illustrative five stars, not a real customer rating');
 });
};
syncServices();applyLanguage();
})();