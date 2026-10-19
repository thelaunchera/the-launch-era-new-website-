/* Bundle storytelling demos are deliberately offline sample data.
   This file does not create inquiries, bookings, messages or payment sessions. */
(() => {
 'use strict';
 const qs=new URLSearchParams(location.search), es=qs.get('lang')==='es';
 const t=(en,sp)=>es?sp:en;
 if(es){
   document.documentElement.lang='es';
   document.title='Booking + Command Center + AI Assistant | The Launch Era';
 }
 document.querySelectorAll('[data-en]').forEach(el=>{
   // All localized copy is authored in the same trusted static HTML document.
   // Only the hero headline needs its intentional <em> styling.
   const value=el.getAttribute(es?'data-es':'data-en');
   if(value===null)return;
   if(el.id==='heroTitle')el.innerHTML=value;
   else el.textContent=value;
 });
 document.querySelectorAll('img[data-alt-es]').forEach(img=>{if(es)img.alt=img.getAttribute('data-alt-es')});
 const langLink=document.getElementById('localeToggle');
 if(langLink){
   const next=new URLSearchParams(location.search);
   next.set('lang',es?'en':'es');
   langLink.setAttribute('href','?'+next.toString());
   langLink.lang=es?'en':'es';
   langLink.textContent=es?'EN':'ES';
 }
 if(es){
   const publicDemo=document.querySelector('a[href="/booking-demo/"]');
   if(publicDemo)publicDemo.href='/booking-demo/?lang=es';
   const fullSample=document.querySelector('a[href="/try-booking/?source=bundle"]');
   if(fullSample)fullSample.href='/try-booking/?lang=es&source=bundle';
   const aiInfo=document.querySelector('a[href="/ai-booking-assistant/#demo"]');
   if(aiInfo)aiInfo.href='/es/ai-booking-assistant/#demo';
 }
 const service=document.getElementById('bookingService');
 const bookingResult=document.getElementById('bookingSampleResult');
 const request=document.getElementById('previewRequest');
 if(service&&bookingResult&&request){
   request.addEventListener('click',()=>{
     const selected=service.selectedOptions[0]?.textContent||'';
     const title=t('Sample inquiry ready','Solicitud de ejemplo lista');
     const desc=t(
       'A customer interested in '+selected+' would send you the details to review. No real request was sent or confirmed.',
       'Una persona interesada en '+selected+' enviaría los detalles para que los revises. No se envió ni confirmó ninguna reserva.'
     );
     bookingResult.replaceChildren();
     const strong=document.createElement('strong');strong.textContent='✓ '+title;
     const span=document.createElement('span');span.textContent=desc;span.style.display='block';
     bookingResult.append(strong,span);bookingResult.hidden=false;
   });
 }
 const viewCopy={
  new:{en:['New cleaning inquiry','A customer asked about a standard cleaning. Open the details, review their request, and decide the next step.'],es:['Nueva consulta de limpieza','Una persona preguntó por una limpieza regular. Abre los detalles, revisa lo que necesita y decide el siguiente paso.']},
  quote:{en:['Quote sent · Waiting for response','You can see which customer already received an estimate instead of looking back through DMs.'],es:['Cotización enviada · Esperando respuesta','Puedes ver quién recibió un estimado sin buscar entre tus mensajes.']},
  follow:{en:['Follow-up · Needs attention','Keep track of customers who need a reminder, respecting their communication preferences.'],es:['Seguimiento · Necesita atención','Organiza a los clientes que necesitan un recordatorio, respetando sus preferencias de comunicación.']}
 };
 const dashboard=document.getElementById('dashboardPreview');
 const updateDashboard=(name)=>{
   const v=viewCopy[name]?.[es?'es':'en'];if(!dashboard||!v)return;
   dashboard.replaceChildren();
   const heading=document.createElement('strong');heading.textContent=v[0];
   const message=document.createElement('span');message.textContent=v[1];
   dashboard.append(heading,message);
   document.querySelectorAll('.tle-demo-tabs button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===name)));
 };
 document.querySelectorAll('.tle-demo-tabs button').forEach(button=>button.addEventListener('click',()=>updateDashboard(button.dataset.view)));
 updateDashboard('new');
 const customer=document.getElementById('sampleCustomerQuestion');
 const answer=document.getElementById('sampleAssistantReply');
 const questions={
   price:{
     en:['How much is a deep cleaning?','I can help you request an estimate. Tell me a little about your space and the team can review the details.'],
     es:['¿Cuánto cuesta una limpieza profunda?','Puedo ayudarte a solicitar un estimado. Cuéntame un poco sobre tu espacio y el equipo revisará los detalles.']
   },
   booking:{
     en:['I want to book a cleaning.','Of course! I can help you share what you need so the business can review your preferred time.'],
     es:['Quiero reservar una limpieza.','¡Claro! Puedo ayudarte a enviar tu solicitud para que el negocio revise el horario que prefieres.']
   }
 };
 const updateChat=name=>{
   const v=questions[name]?.[es?'es':'en'];if(!v||!customer||!answer)return;
   customer.textContent=v[0];answer.textContent=v[1];
   document.querySelectorAll('.tle-demo-chips button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.question===name)));
 };
 document.querySelectorAll('.tle-demo-chips button').forEach(b=>b.addEventListener('click',()=>updateChat(b.dataset.question)));
 updateChat('price');
 // Only claim an active promotion after reading the authoritative bundle-pricing API.
 const signal=new AbortController();
 const timeout=setTimeout(()=>signal.abort(),6000);
 fetch('https://bowacxhmjvrqixtwaikv.supabase.co/functions/v1/tle-booking-bundle-checkout',{method:'GET',headers:{Accept:'application/json'},cache:'no-store',signal:signal.signal})
  .then(r=>{if(!r.ok)throw Error('pricing unavailable');return r.json()})
  .then(data=>{
    if(data?.percent_off!==40||!data?.plans?.['ai-booking'])return;
    const badge=document.getElementById('bundleOffer');
    if(badge)badge.hidden=false;
  })
  .catch(()=>{/* marketing fails closed; checkout independently validates prices */})
  .finally(()=>clearTimeout(timeout));
})();