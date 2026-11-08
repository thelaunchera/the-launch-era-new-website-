(() => {
 'use strict';
 const body=document.body,root=document.documentElement,plan=body.dataset.package;
 const advanced=plan==='website-ai-crm',params=new URLSearchParams(location.search);
 const session=String(params.get('session_id')||'');
 let lang=params.get('lang')==='es'?'es':'en',paid=false,verifying=false;
 const $=id=>document.getElementById(id);
 const form=$('intake-form'),submit=$('send'),feedback=$('feedback'),status=$('payment-status'),retry=$('verify-retry');
 const start=Date.now(),submissionId=crypto.randomUUID();
 const endpoint='https://fhrvuhikrybobidxpvnh.supabase.co/functions/v1/';
 const copy={
 en:{
  back:'View packages',start:'STEP 2 OF 2 · YOUR WEBSITE SETUP',
  headBasic:'Tell us about your business.',headAdvanced:'Let’s set up your website and CRM.',
  lead:'We have your package. These are the details we need to build and configure your system.',
  packageBasic:'Website + Command Center',packageAdvanced:'Website + AI Command Center',
  init:'Setup package · USD',reminderBasic:'Estimated 48-hour production after approved kickoff, with one review round.',
  reminderAdvanced:'$25 due today for setup. Your first AI + CRM service month starts when the completed website is delivered; $8/month billing starts after that first service month. Estimated 48-hour production after approved kickoff; one review round.',
  scopeBasic:'Website, private basic Command Center for inquiries, customers and catalog edits, plus email alerts. Private access is activated after delivery.',
  scopeAdvanced:'Everything in the basic Command Center plus an on-page AI assistant and approved email automations.',
  boxLabel:'PROJECT SETUP',formTitle:'Your business details',
  formLead:'Complete this once using the same email address used at checkout.',
  waiting:'Verifying your Stripe payment…',required:'Complete secure checkout first to access setup.',
  failedVerify:'Payment could not be confirmed. If you paid, check again or contact us.',
  retry:'Check payment again',verified:'Payment confirmed. You can complete your setup.',
  group1:'01 / Business details',group2:'02 / Website content',group3:'03 / Brand and automation',
  websiteFormat:'Which website format do you need? *',websiteFormatChoose:'Choose your website format',
  websiteFormatMenu:'Digital Menu · Restaurants & Cafés',websiteFormatCatalog:'Product Catalog · Stores & Products',
  websiteFormatServices:'Services + Booking Requests',websiteFormatHelp:'All packages include a private basic Command Center after secure activation at delivery.',
  menuPdf:'Existing menu PDF or product list link (optional)',menuPdfHelp:'Share your existing PDF through Drive or another link. We will review the content before setting up products and prices.',
  emailOnlyNote:'Customer requests and notifications use email. SMS is not included.',
  name:'Your name *',email:'Email used at checkout *',business:'Business name *',industry:'Type of business *',
  phone:'Business phone (optional)',location:'City or service area (optional)',website:'Existing website (optional)',
  action:'What should visitors do? *',inbox:'Email to receive customer requests *',
  services:'Your services or products *',goals:'What should your website communicate or do? *',
  domain:'Domain or preferred business link (optional)',domainOption:'Do you already have a domain? *',domainHelp:'No domain? We can publish your website at an available hosted link. A custom domain is optional.',haveDomain:'I already have a domain',needLink:'I need a website link — no domain yet',wantCustom:'Help me choose a custom domain (extra cost)',hours:'Business hours (optional)',social:'Social links (optional)',
  brand:'Brand colors, fonts or style (optional)',assets:'Link to your logo and photos (optional)',
  references:'Websites you like (optional)',automation:'What follow-ups or tasks should we automate?',
  ai:'What should the AI assistant know and answer?',
  consent:'I confirm that I am authorized to use the business information provided and have read the',
  privacy:'Privacy Policy',send:'Submit setup details',sending:'Sending setup…',
  security:'Do not include passwords, card numbers or verification codes. Share assets using a link.',
  doneTitle:'Your setup details are in!',doneBody:'Your paid project information has been received. We will review your materials and confirm the production kickoff by email.',
  again:'Back to packages',failed:'We could not save your setup details. Please try again or contact us.',
  already:'We already received the setup for this payment. Contact us if you need to change something.',
  other:'Other',contact:'Contact request',quote:'Request a quote',appointment:'Reservation or appointment request',purchase:'Purchase or order',
  servicesPlace:'List your main services or products and any important details.',
  goalsPlace:'Describe your business, your audience and the result you want from your website.',
  assetsPlace:'https://drive.google.com/... or another shared link',
  autoPlace:'Examples: email notifications, approved booking confirmations, email reminders or service follow-ups.',
  aiPlace:'FAQ, services, prices, policies and when the AI should hand off to you.',websitePhotos:'Upload photos you want on your website (optional)',referencePhotos:'Upload reference photos and visual inspiration (optional)',photoHelp:'Up to 10 images per category · JPG, PNG, WebP or HEIC · 8 MB each.',requestCall:"I'd like to request a 1:1 call to review my website project.",callTime:'Preferred day, time and time zone (optional)',callTimeHint:'e.g. Thursday 3 PM, Eastern Time',callNote:'Calls are coordinated by email. Any cost is confirmed before scheduling.',uploadProgress:'Uploading image',uploadDone:'Photos uploaded securely.',uploadFailed:'Could not upload your photos. Please use the email from checkout and try again.',uploadTooMany:'Up to 10 images are allowed for each category.',uploadTooLarge:'Each photo must be 8 MB or less.'
 },
 es:{
  back:'Ver paquetes',start:'PASO 2 DE 2 · CONFIGURACIÓN DE TU WEBSITE',
  headBasic:'Cuéntanos sobre tu negocio.',headAdvanced:'Configuremos tu website y CRM.',
  lead:'Ya tenemos tu paquete. Necesitamos estos detalles para construir tu website y configurar tu sistema.',
  packageBasic:'Website + Command Center',packageAdvanced:'Website + IA Command Center',
  init:'Paquete de configuración · USD',reminderBasic:'Producción estimada en 48 horas desde el inicio aprobado, con una ronda de revisión.',
  reminderAdvanced:'Pagas $25 hoy por la configuración. El primer mes de IA + CRM empieza con la entrega del website terminado; los $8 mensuales se cobran al finalizar ese primer mes. Producción estimada en 48 horas desde el inicio aprobado, con una ronda de revisión.',
  scopeBasic:'Website, Command Center privado básico para solicitudes, clientes y edición del catálogo, más avisos por correo. Se activa tras la entrega.',
  scopeAdvanced:'Todo lo del Command Center básico, con asistente IA y automatizaciones por correo aprobadas.',
  boxLabel:'CONFIGURACIÓN DEL PROYECTO',formTitle:'Datos de tu negocio',
  formLead:'Completa esto una vez con el mismo correo que usaste para pagar.',
  waiting:'Verificando tu pago con Stripe…',required:'Completa primero el pago seguro para configurar tu proyecto.',
  failedVerify:'No pudimos confirmar tu pago. Si ya pagaste, intenta nuevamente o escríbenos.',
  retry:'Volver a verificar el pago',verified:'Pago confirmado. Ya puedes completar tu configuración.',
  group1:'01 / Datos del negocio',group2:'02 / Contenido del website',group3:'03 / Marca y automatizaciones',
  websiteFormat:'¿Qué tipo de website necesitas? *',websiteFormatChoose:'Elige el formato de tu website',
  websiteFormatMenu:'Menú digital · Restaurantes y cafeterías',websiteFormatCatalog:'Catálogo de productos · Tiendas',
  websiteFormatServices:'Servicios + solicitudes de reservas',websiteFormatHelp:'Todos los paquetes incluyen Command Center básico privado, con activación segura después de la entrega.',
  menuPdf:'Enlace a menú PDF o lista de productos (opcional)',menuPdfHelp:'Comparte tu PDF con un enlace de Drive u otro medio. Revisaremos el contenido antes de cargar productos y precios.',
  emailOnlyNote:'Las consultas y notificaciones se gestionan por correo. No incluimos SMS.',
  name:'Tu nombre *',email:'Correo usado para pagar *',business:'Nombre del negocio *',industry:'Tipo de negocio *',
  phone:'Teléfono del negocio (opcional)',location:'Ciudad o área de servicio (opcional)',website:'Website actual (opcional)',
  action:'¿Qué deben hacer los visitantes? *',inbox:'Correo que recibirá solicitudes de clientes *',
  services:'Servicios o productos que ofreces *',goals:'¿Qué quieres comunicar o lograr con tu website? *',
  domain:'Dominio o nombre deseado para tu enlace (opcional)',domainOption:'¿Ya tienes dominio? *',domainHelp:'Si no tienes dominio, podemos publicar tu website con un enlace disponible. El dominio propio es opcional.',haveDomain:'Ya tengo un dominio',needLink:'Necesito un enlace para mi website; todavía no tengo dominio',wantCustom:'Ayúdame a elegir un dominio propio (costo adicional)',hours:'Horario de atención (opcional)',social:'Redes sociales (opcional)',
  brand:'Colores, tipografías o estilo de marca (opcional)',assets:'Enlace a tu logo y fotos (opcional)',
  references:'Websites que te inspiran (opcional)',automation:'¿Qué seguimientos o tareas quieres automatizar?',
  ai:'¿Qué necesita saber y responder el asistente IA?',
  consent:'Confirmo que tengo permiso para usar la información del negocio y he leído la',
  privacy:'Política de Privacidad',send:'Enviar datos de configuración',sending:'Enviando configuración…',
  security:'No incluyas contraseñas, números de tarjeta ni códigos de verificación. Comparte tus fotos mediante un enlace.',
  doneTitle:'¡Recibimos tu configuración!',doneBody:'Recibimos los datos de tu proyecto pagado. Revisaremos tus materiales y confirmaremos por correo el inicio de producción.',
  again:'Volver a paquetes',failed:'No pudimos guardar tu configuración. Inténtalo de nuevo o contáctanos.',
  already:'Ya recibimos la configuración de este pago. Contáctanos si necesitas cambiar algo.',
  other:'Otro',contact:'Contacto',quote:'Solicitar cotización',appointment:'Solicitar mesa o cita',purchase:'Comprar o hacer pedido',
  servicesPlace:'Enumera tus principales servicios o productos y sus detalles importantes.',
  goalsPlace:'Describe tu negocio, a quién ayudas y qué quieres lograr con el website.',
  assetsPlace:'https://drive.google.com/... u otro enlace compartido',
  autoPlace:'Ejemplos: avisos por correo, confirmaciones aprobadas, recordatorios por correo o seguimiento de servicios.',
  aiPlace:'Preguntas frecuentes, servicios, precios, políticas y cuándo pasarte la conversación.',websitePhotos:'Sube las fotos que quieres poner en tu website (opcional)',referencePhotos:'Sube fotos de referencia e inspiración visual (opcional)',photoHelp:'Hasta 10 imágenes por categoría · JPG, PNG, WebP o HEIC · máximo 8 MB cada una.',requestCall:'Quiero solicitar una llamada 1:1 para revisar mi proyecto de website.',callTime:'Día, hora y zona horaria preferidos (opcional)',callTimeHint:'Ej. jueves a las 3 PM, hora del Este',callNote:'Coordinamos las llamadas por correo. Cualquier costo se confirma antes de agendar.',uploadProgress:'Subiendo imagen',uploadDone:'Fotos subidas de forma segura.',uploadFailed:'No pudimos subir tus fotos. Usa el correo del checkout e inténtalo de nuevo.',uploadTooMany:'Puedes subir hasta 10 imágenes por categoría.',uploadTooLarge:'Cada foto debe ser de 8 MB o menos.'
 }};
 function translate(){
  const t=copy[lang];root.lang=lang;
  document.title=(advanced?t.packageAdvanced:t.packageBasic)+' · '+(lang==='es'?'Configuración':'Setup')+' | The Launch Era';
  for(const node of document.querySelectorAll('[data-i18n]')){const label=t[node.dataset.i18n];if(label!==undefined)node.textContent=label}
  for(const node of document.querySelectorAll('[data-placeholder]')){const label=t[node.dataset.placeholder];if(label!==undefined)node.placeholder=label}
  $('package-name').textContent=advanced?t.packageAdvanced:t.packageBasic;
  $('intro-title').textContent=advanced?t.headAdvanced:t.headBasic;
  $('intro-scope').textContent=advanced?t.scopeAdvanced:t.scopeBasic;
  $('price').textContent=advanced?'$25':'$15';
  $('ongoing').textContent=advanced?t.reminderAdvanced:t.reminderBasic;
  $('locale').textContent=lang==='es'?'English':'Español';
  $('return').href=lang==='es'?'/es/website-for-your-business/':'/website-for-your-business/';
  $('complete').querySelector('a').href=$('return').href;
  $('privacy').href=lang==='es'?'/es/privacy.html':'/privacy.html';
  const select=form.elements.namedItem('customer_action');
  const names=['contact','quote','appointment','purchase','other'];
  Array.from(select.options).forEach((o,i)=>o.textContent=t[names[i]]);
  const domain=form.elements.namedItem('domain_option');
  Array.from(domain.options).forEach((option,i)=>option.textContent=t[['needLink','haveDomain','wantCustom'][i]]);
  retry.textContent=t.retry;
  if(paid){status.textContent=t.verified}
  else if(!/^cs_live_[A-Za-z0-9]+$/.test(session)){status.textContent=t.required}
  else status.textContent=t.waiting;
 }
 $('locale').addEventListener('click',()=>{
  lang=lang==='en'?'es':'en';
  const u=new URL(location.href);u.searchParams.set('lang',lang);history.replaceState(null,'',u);
  translate();
 });
 if(advanced)$('advanced-fields').hidden=false;
 form.hidden=true;translate();
 async function verify(){
  if(verifying)return;
  if(!/^cs_live_[A-Za-z0-9]+$/.test(session)){$('verify-retry').hidden=true;return}
  verifying=true;retry.hidden=true;status.textContent=copy[lang].waiting;
  try{
   const ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),20000);
   let r;try{
    r=await fetch(endpoint+'tle-studio-website-confirm-payment',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({session_id:session,offer:plan}),signal:ctrl.signal});
   }finally{clearTimeout(timer)}
   const d=await r.json().catch(()=>({}));
   if(!r.ok||d.ok!==true||d.paid!==true||d.offer!==plan)throw Error('Unconfirmed');
   paid=true;$('payment-status').textContent=copy[lang].verified;
   $('form-lead').textContent=copy[lang].formLead;
   form.hidden=false;retry.hidden=true;
  }catch{
   paid=false;form.hidden=true;status.textContent=copy[lang].failedVerify;retry.hidden=false;
  }finally{verifying=false}
 }
 retry.addEventListener('click',verify);
 verify();
 const uploaded=new Set();
 async function uploadPhotos(inputName,category,email){
   const input=form.elements.namedItem(inputName);
   const files=Array.from(input.files||[]);
   if(files.length>10)throw Error('uploadTooMany');
   for(let i=0;i<files.length;i++){
     const file=files[i],fingerprint=category+'|'+file.name+'|'+file.size+'|'+file.lastModified;
     if(uploaded.has(fingerprint))continue;
     if(file.size>8000000)throw Error('uploadTooLarge');
     $('upload-status').textContent=copy[lang].uploadProgress+' '+(i+1)+'/'+files.length+'…';
     const body=new FormData();body.append('session_id',session);body.append('offer',plan);
     body.append('email',email);body.append('category',category);
     const type=file.type||(/\.heic$/i.test(file.name)?'image/heic':/\.heif$/i.test(file.name)?'image/heif':'');
     const actual=type===file.type?file:new File([file],file.name,{type,lastModified:file.lastModified});
     body.append('file',actual);
     const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),30000);
     let r;
     try{r=await fetch(endpoint+'tle-studio-website-upload-photo',{method:'POST',body,signal:controller.signal})}
     finally{clearTimeout(timer)}
     const result=await r.json().catch(()=>({}));
     if(!r.ok||result.ok!==true)throw Error('uploadFailed');
     uploaded.add(fingerprint);
   }
 }
 function get(formData,name){return String(formData.get(name)||'').trim()}
 function note(label,value){return value?label+': '+value:''}
 form.addEventListener('submit',async event=>{
  event.preventDefault();
  if(!paid||submit.disabled||!form.reportValidity())return;
  const f=new FormData(form),t=copy[lang];
  const goals=[
   get(f,'goals'),note('Chosen website format',get(f,'website_format')),note('Existing menu PDF/product list',get(f,'menu_pdf_url')),note('Customer notifications','email only; no SMS'),note('Command Center access','activate private buyer workspace after verified delivery'),note('Services/products',get(f,'services')),
   note('AI-enhanced photo request',f.get('ai_photo_request')==='yes'?'Yes · '+(get(f,'ai_photo_goal')||'enhance_existing'):'Not requested'),
   note('Preferred AI photo example',f.get('ai_photo_request')==='yes'?get(f,'ai_photo_reference'):''),
   note('AI photo handling',f.get('ai_photo_request')==='yes'?'Review requested; no automatic image generation or automatic extra charge':''),
   
   note('Business location/service area',get(f,'business_location')),
   note('Business hours',get(f,'business_hours')),
   note('Domain arrangement',get(f,'domain_option')),
   note('Preferred domain',get(f,'domain_preference')),
   note('Social profiles',get(f,'social_links')),
   note('Request 1:1 call',f.get('request_call')==='yes'?'yes — '+get(f,'call_time'):'no')
  ].filter(Boolean).join('\n').slice(0,3500);
  const brand=[
   get(f,'brand_notes'),note('Brand photo/logo folder',get(f,'brand_assets_url')),
   note('Website inspirations',get(f,'reference_sites')),
   note('Preferred photo look',f.get('ai_photo_request')==='yes'?get(f,'ai_photo_reference'):'')
  ].filter(Boolean).join('\n').slice(0,2000);
  const payload={
   submission_id:submissionId,elapsed_ms:Date.now()-start,
   website_check:get(f,'website_check'),package_slug:plan,kind:'intake',source:'checkout',
   name:get(f,'name'),email:get(f,'email'),phone:get(f,'phone'),
   business_name:get(f,'business_name'),industry:get(f,'industry')==='other'?('Other: '+get(f,'industry_other')).slice(0,120):get(f,'industry'),
   existing_website:get(f,'existing_website'),preferred_email:get(f,'preferred_email'),
   customer_action:get(f,'customer_action'),goals,brand_notes:brand,
   automation_goals:get(f,'automation_goals'),ai_brief:advanced?get(f,'ai_brief'):'',
   language:lang,contact_consent:f.get('consent')==='yes',
   checkout_reference:session
  };
  submit.disabled=true;submit.textContent=t.sending;feedback.hidden=true;
  try{
   await uploadPhotos('website_photos','website_photos',get(f,'email').toLowerCase());
   await uploadPhotos('reference_photos','reference_photos',get(f,'email').toLowerCase());
   $('upload-status').textContent=uploaded.size?copy[lang].uploadDone:'';
   const r=await fetch(endpoint+'tle-studio-website-intake',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
   const result=await r.json().catch(()=>({}));
   if(!r.ok||result.ok!==true){
    if(r.status===409)throw Error('already');
    throw Error('failed');
   }
   form.hidden=true;$('complete').hidden=false;
   $('complete-title').textContent=t.doneTitle;
   $('complete-message').textContent=t.doneBody;
   window.scrollTo({top:0,behavior:'smooth'});
  }catch(e){
   feedback.textContent=String(e.message)==='already'?t.already:(['uploadFailed','uploadTooMany','uploadTooLarge'].includes(String(e.message))?t[String(e.message)]:t.failed);
   feedback.hidden=false;feedback.className='feedback error';
   submit.disabled=false;submit.textContent=t.send;
  }
 });
})();
