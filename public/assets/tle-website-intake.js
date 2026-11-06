(() => {
 const root=document.documentElement,body=document.body,plan=body.dataset.package,advanced=plan==='website-ai-crm';
 const params=new URLSearchParams(location.search);
 let lang=params.get('lang')==='es'?'es':'en';
 const paid=params.get('stage')==='onboarding' || params.get('stage')==='paid';
 const appTopic=params.get('topic')==='app';
 const text={
 en:{
  back:'Back to packages',start:'START YOUR PROJECT',packageBasic:'Website for Your Business',packageAdvanced:'Website + AI Assistant + Automated CRM',
  headBasic:'Tell us about your website.',headAdvanced:'Let’s connect your website, AI and leads.',lead:'A few details help us understand your business and prepare the right website experience.',
  packageScope:'A website, customer inquiry path and notifications delivered to your preferred inbox.',
  packageScopeAdvanced:'A website, on-page AI assistant, lead management and an agreed follow-up workflow.',
  init:'Initial setup price · USD',reminder:'Any required domain, hosting or AI provider fees are explained before work begins.',
  boxLabel:'YOUR BUSINESS · YOUR WEBSITE',formTitle:'Your project details',formLead:'This is an inquiry, not a purchase confirmation. We’ll review your request and contact you by email.',
  formLeadPaid:'Please provide your setup details. Payment status is verified separately; submitting this form does not establish a paid order.',
  group1:'01 / About your business',group2:'02 / Your new website',group3:'03 / Automations and preferences',
  name:'Your name *',email:'Contact email *',phone:'Phone (optional)',business:'Business name *',industry:'Industry *',website:'Existing website (optional)',action:'What should customers do? *',
  inbox:'Email to receive new inquiries *',goals:'What do you need your website to do? *',brand:'Brand style, colors or references (optional)',
  automation:'What would you like automated?',ai:'What questions should the AI assistant answer?',consent:'I agree to be contacted about this inquiry and have read the',
  privacy:'Privacy Policy',send:'Send my website inquiry',sending:'Sending securely…',
  security:'Please do not include passwords, payment card details or verification codes. Sending this form does not create a paid order.',
  doneTitle:'Your inquiry is in!',doneBody:'Thank you — your details have been received in our private Studio. We’ll review your request and respond to your contact email; this is not a payment confirmation.',
  again:'See the packages',failed:'We could not receive your request right now. Your details have not been confirmed as sent; please try again.',
  other:'Something else',contact:'Contact request',quote:'Request a quote',appointment:'Appointment request',purchase:'Purchase / order',industryPlace:'e.g., beauty salon, food business, consulting…',
  goalsPlace:'Your services, who your customers are, and the next step you want people to take…',autoPlace:'e.g., email notifications, lead reminders, follow-up after an inquiry…',aiPlace:'Frequently asked questions, opening hours, services, policies, and when to refer to you…',
  mockNote:'Illustrative example from our website portfolio',additional:'We review the final workflow before setup; additional integrations may need a separate scope.',
  appInterest:'I’m interested in a custom app and would like to discuss the options.'
 },
 es:{
  back:'Volver a los paquetes',start:'COMIENZA TU PROYECTO',packageBasic:'Website para tu negocio',packageAdvanced:'Website + Asistente IA + CRM automatizado',
  headBasic:'Cuéntanos cómo será tu website.',headAdvanced:'Conectemos tu website, la IA y tus leads.',lead:'Unos detalles nos ayudan a entender tu negocio y preparar la experiencia adecuada.',
  packageScope:'Website, formulario de solicitudes y avisos al correo que tú elijas.',
  packageScopeAdvanced:'Website, asistente IA en la página, organización de leads y un flujo acordado de seguimiento.',
  init:'Precio de configuración inicial · USD',reminder:'Te informamos antes de comenzar si necesitas dominio, hosting o herramientas de IA de pago.',
  boxLabel:'TU NEGOCIO · TU WEBSITE',formTitle:'Detalles de tu proyecto',formLead:'Esto es una consulta, no confirma una compra. Revisaremos tus datos y te responderemos por correo.',
  formLeadPaid:'Comparte los datos para preparar tu website. El pago se verifica por separado; este formulario no confirma una compra pagada.',
  group1:'01 / Sobre tu negocio',group2:'02 / Tu nuevo website',group3:'03 / Automatizaciones y preferencias',
  name:'Tu nombre *',email:'Correo de contacto *',phone:'Teléfono (opcional)',business:'Nombre del negocio *',industry:'Industria *',website:'Website actual (opcional)',action:'¿Qué deben hacer tus clientes? *',
  inbox:'Correo que recibirá las solicitudes *',goals:'¿Qué necesitas que haga tu website? *',brand:'Colores, estilo y referencias (opcional)',
  automation:'¿Qué te gustaría automatizar?',ai:'¿Qué preguntas debe responder el asistente IA?',consent:'Acepto que me contacten para responder esta consulta y he leído la',
  privacy:'Política de privacidad',send:'Enviar solicitud de website',sending:'Enviando de forma segura…',
  security:'No incluyas contraseñas, tarjetas ni códigos de verificación. Este formulario no crea una compra pagada.',
  doneTitle:'¡Recibimos tu consulta!',doneBody:'Gracias. Tus datos llegaron a nuestro Studio privado. Revisaremos tu solicitud y responderemos al correo de contacto; esto no confirma ningún pago.',
  again:'Ver los paquetes',failed:'No pudimos confirmar el envío. Inténtalo de nuevo; no damos tu solicitud por recibida.',
  other:'Otra cosa',contact:'Solicitud de contacto',quote:'Pedir cotización',appointment:'Solicitar cita',purchase:'Compra o pedido',industryPlace:'Ej. salón de belleza, restaurante, consultoría…',
  goalsPlace:'Qué ofreces, a quién ayudas y qué quieres que haga el visitante…',autoPlace:'Ej. avisos por correo, recordatorios, seguimiento después de una consulta…',aiPlace:'Preguntas frecuentes, servicios, horarios y cuándo pasarte la conversación…',
  mockNote:'Ejemplo ilustrativo de nuestro portafolio web',additional:'Confirmamos el flujo antes de comenzar; integraciones adicionales pueden requerir un acuerdo aparte.',
  appInterest:'Me interesa una app personalizada y quisiera conocer las opciones.'
 }};
 const $=id=>document.getElementById(id);
 const form=$('intake-form'),submit=$('send'),feedback=$('feedback');
 const begin=Date.now(),submissionId=(crypto.randomUUID?crypto.randomUUID():'00000000-0000-4000-8000-'+Array.from(crypto.getRandomValues(new Uint8Array(6))).map(n=>n.toString(16).padStart(2,'0')).join(''));
 const originalName=document.title;
 function translate(){
  root.lang=lang;const t=text[lang];document.title=(advanced?t.packageAdvanced:t.packageBasic)+' · The Launch Era';
  $('complete').querySelector('a').href=lang==='es'?'/es/website-for-your-business/':'/website-for-your-business/';
  for(const node of document.querySelectorAll('[data-i18n]')){const key=node.getAttribute('data-i18n');if(t[key])node.textContent=t[key];}
  for(const node of document.querySelectorAll('[data-placeholder]')){const key=node.getAttribute('data-placeholder');if(t[key])node.placeholder=t[key];}
  $('package-name').textContent=advanced?t.packageAdvanced:t.packageBasic;
  $('intro-title').textContent=advanced?t.headAdvanced:t.headBasic;
  $('intro-scope').textContent=advanced?t.packageScopeAdvanced:t.packageScope;
  $('form-lead').textContent=paid?t.formLeadPaid:t.formLead;
  $('price').textContent=advanced?'$25':'$15';
  $('locale').textContent=lang==='es'?'English':'Español';
  $('return').href=(lang==='es'?'/es/website-for-your-business/':'/website-for-your-business/');
  const select=form.elements.namedItem('customer_action');
  const labels=['contact','quote','appointment','purchase','other'];for(let i=0;i<select.options.length;i++)select.options[i].textContent=t[labels[i]];
  $('privacy').href=lang==='es'?'/es/privacy.html':'/privacy.html';
  if(appTopic) $('goals').placeholder=t.appInterest;
 }
 $('locale').addEventListener('click',()=>{lang=lang==='es'?'en':'es';const url=new URL(location.href);url.searchParams.set('lang',lang);history.replaceState(null,'',url);translate()});
 translate();
 if(advanced)$('advanced-fields').hidden=false;
 if(appTopic)$('goals').value=text[lang].appInterest;
 form.addEventListener('submit',async e=>{
  e.preventDefault();if(submit.disabled||!form.reportValidity())return;
  const fd=new FormData(form);submit.disabled=true;submit.textContent=text[lang].sending;feedback.hidden=true;
  const payload={submission_id:submissionId,elapsed_ms:Date.now()-begin,website_check:String(fd.get('website_check')||''),package_slug:plan,kind:paid?'intake':'inquiry',
   name:String(fd.get('name')||''),email:String(fd.get('email')||''),phone:String(fd.get('phone')||''),business_name:String(fd.get('business_name')||''),
   industry:String(fd.get('industry')||''),existing_website:String(fd.get('existing_website')||''),preferred_email:String(fd.get('preferred_email')||''),
   customer_action:String(fd.get('customer_action')||''),goals:String(fd.get('goals')||''),brand_notes:String(fd.get('brand_notes')||''),
   automation_goals:String(fd.get('automation_goals')||''),ai_brief:advanced?String(fd.get('ai_brief')||''):'',language:lang,contact_consent:fd.get('consent')==='yes',
   checkout_reference:paid?String(params.get('session_id')||''):'',source:paid?'checkout':'landing'};
  if(appTopic)payload.goals=text[lang].appInterest+'\n'+payload.goals;
  try{
   const r=await fetch('https://fhrvuhikrybobidxpvnh.supabase.co/functions/v1/tle-studio-website-intake',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
   const data=await r.json().catch(()=>({}));
   if(!r.ok||!data.ok)throw Error(data.error||'Not received');
   form.hidden=true;$('complete').hidden=false;$('complete-title').textContent=text[lang].doneTitle;$('complete-message').textContent=text[lang].doneBody;
   window.scrollTo({top:0,behavior:'smooth'});
  }catch{
   feedback.textContent=text[lang].failed;feedback.className='feedback error';feedback.hidden=false;submit.disabled=false;submit.textContent=text[lang].send;
  }
 });
})();
