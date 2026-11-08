(()=>{
'use strict';
/* One short, payment-gated intake for both website packages.
   Enhances the existing verified intake; never submits directly or bypasses payment. */
const form=document.getElementById('intake-form');
if(!form)return;
const field=n=>form.elements.namedItem(n);
const $=id=>document.getElementById(id);
const lang=()=>document.documentElement.lang==='es'?'es':'en';
const copy={
en:{
 fewQuestions:'Just the essentials. We will handle the rest during your website build.',
 group1:'01 / Your business',group2:'02 / What you sell',group3:'03 / Your photos & style',
 industry:'What kind of business is it? *',chooseIndustry:'Choose your type of business',
 industryRestaurant:'Restaurant',industryCafe:'Café / bakery',industryRetail:'Store / products',
 industryCleaning:'Residential cleaning',industryBeauty:'Beauty / salon',industryWellness:'Wellness / fitness',
 industryProfessional:'Other services',industryOther:'Something else',
 industryOtherLabel:'Describe your business *',industryOtherPlace:'e.g., event planning, tutoring, pet care',
 otherFormatLabel:'What should your website feature? *',
 area:'City, address or service area *',areaPlace:'Miami, FL or Online only',
 areaHint:'For online-only businesses, enter “Online”.',
 offerIntro:'Names and prices, or “Request a quote”. No long descriptions required.',
 services:'Your products or services *',
 offerRestaurant:'Menu dishes and prices *',offerCafe:'Drinks, pastries and prices *',
 offerRetail:'Products and prices *',offerCleaning:'Cleaning packages and prices *',
 offerBeauty:'Treatments and prices *',offerWellness:'Classes, sessions and prices *',
 offerProfessional:'Services and starting prices *',offerOther:'What you sell and prices *',
 offersHint:'Example: Standard cleaning — from $120; Deep clean — request a quote.',
 placeRestaurant:'Brunch — $22; Pasta — $19; Dessert — $9.',
 placeCafe:'Latte — $6; Croissant — $5; Breakfast combo — $12.',
 placeRetail:'Signature candle — $24; Gift box — $48.',
 placeCleaning:'Standard clean — from $120; Deep clean — from $220.',
 placeBeauty:'Haircut — $55; Color — from $120.',
 placeWellness:'Yoga class — $22; Private session — $85.',
 placeProfessional:'Consultation — $80; Package — request a quote.',
 menuPdfShort:'Already have a menu or product list? Share the link (optional)',
 menuPdfShortcut:'If your document includes all items and prices, you can skip typing the list. We will review it.',
 actionShort:'What should visitors do? *',actionHint:'Requests come by email. No instant confirmed tables, appointments or payments.',
 inbox:'Email to receive customer requests *',emailOnlyNote:'Email notifications only. No SMS.',
 inboxOptional:'Customer inquiry email (same as checkout unless changed)',
 setupExtrasSummary:'Another inquiry email, opening hours or custom domain? (optional)',
 siteLangLabel:'Website language',siteLangEnglish:'English',siteLangSpanish:'Spanish',siteLangBoth:'English + Spanish',
 publicPhoneOptional:'Business phone to display (optional)',
 hoursShort:'Opening hours or availability (optional)',hoursPlace:'Mon–Sat 9 AM–6 PM',
 domainOptionShort:'Website link',needLink:'Use the included website link',
 haveDomain:'I already own a domain',wantCustom:'I want to buy my own domain',
 domainHelpNote:'A hosted website link is included — no domain purchase needed. A custom domain is optional: you purchase it directly from a provider such as Namecheap and pay that provider for registration and renewals. We can help you connect it.',
 photosIntro:'Upload your logo or photos if available. You do not need to design the page.',
 websitePhotosShort:'Upload your logo or photos (optional)',
 assetsShort:'Or share a Drive link to your logo/photos (optional)',
 advancedTitle:'Optional AI & email preferences',automationChoice:'Which email workflow matters most?',
 autoAlerts:'New inquiry alerts',autoConfirm:'Confirmation emails after approval',
 autoReminder:'Appointment / reservation reminder emails',autoFollowup:'Quote follow-up emails',
 automationReview:'We will review the workflow before activation. Email only.',
 aiShort:'What should your AI assistant answer? (optional)',
 optionalDetails:'Optional · style, social links & inspiration',
 goalsShort:'What makes your business special? (optional)',
 aiPhotoQuestion:'Would you like your product photos enhanced with AI?',
 aiPhotoHint:'Optional image styling for your products or services; no long brief needed.',
 aiPhotoBrowse:'Explore our photo inspiration catalog',
 aiPhotoGoal:'What would you like improved?',
 aiPhotoExisting:'Enhance my existing product photography',
 aiPhotoBackdrop:'Clean background / premium studio look',
 aiPhotoCampaign:'Editorial product campaign concept',
 aiPhotoReference:'Example code from the gallery (optional)',
 aiPhotoReview:'Request only — no automatic generation. We will confirm the scope before creating images. Add an original product photo above or share a Drive link.',
 photoPickerTitle:'Choose your photo style',photoPickerHelp:'Your website setup stays on this page. Choose a photo or close to continue editing.',photoPickerClose:'Close',
  security:'Do not send passwords, credit card details or security codes.'
},
es:{
 fewQuestions:'Solo lo esencial. El resto lo preparamos al construir tu website.',
 group1:'01 / Tu negocio',group2:'02 / Qué vendes',group3:'03 / Tus fotos y estilo',
 industry:'¿Qué tipo de negocio tienes? *',chooseIndustry:'Selecciona tu negocio',
 industryRestaurant:'Restaurante',industryCafe:'Cafetería / panadería',industryRetail:'Tienda / productos',
 industryCleaning:'Limpieza residencial',industryBeauty:'Belleza / salón',industryWellness:'Bienestar / fitness',
 industryProfessional:'Otros servicios',industryOther:'Otro negocio',
 industryOtherLabel:'Describe tu negocio *',industryOtherPlace:'Ej. eventos, tutorías, mascotas',
 otherFormatLabel:'¿Qué debe mostrar tu website? *',
 area:'Ciudad, dirección o zona de servicio *',areaPlace:'Miami, FL o Solo online',
 areaHint:'Si vendes solo por internet, escribe «Online».',
 offerIntro:'Nombres y precios, o «Solicitar cotización». No necesitas escribir textos largos.',
 services:'Tus productos o servicios *',
 offerRestaurant:'Platos y precios *',offerCafe:'Bebidas, comidas y precios *',
 offerRetail:'Productos y precios *',offerCleaning:'Paquetes de limpieza y precios *',
 offerBeauty:'Tratamientos y precios *',offerWellness:'Clases, sesiones y precios *',
 offerProfessional:'Servicios y precios iniciales *',offerOther:'Qué vendes y precios *',
 offersHint:'Ej. Limpieza estándar — desde $120; profunda — solicitar cotización.',
 placeRestaurant:'Brunch — $22; Pasta — $19; Postre — $9.',
 placeCafe:'Latte — $6; Croissant — $5; Combo — $12.',
 placeRetail:'Vela aromática — $24; Set de regalo — $48.',
 placeCleaning:'Limpieza estándar — desde $120; profunda — desde $220.',
 placeBeauty:'Corte — $55; Color — desde $120.',
 placeWellness:'Yoga — $22; Sesión privada — $85.',
 placeProfessional:'Consulta — $80; Paquete — solicitar cotización.',
 menuPdfShort:'¿Ya tienes menú o lista de productos? Comparte el enlace (opcional)',
 menuPdfShortcut:'Si el documento incluye productos y precios, puedes omitir la lista. Lo revisaremos.',
 actionShort:'¿Qué deben hacer los visitantes? *',actionHint:'Las solicitudes llegan por correo. No confirman automáticamente mesas, citas ni pagos.',
 inbox:'Correo para recibir consultas de clientes *',emailOnlyNote:'Avisos solo por correo. Sin SMS.',
 inboxOptional:'Correo de consultas (usaremos el del pago si no lo cambias)',
 setupExtrasSummary:'¿Otro correo, horarios o dominio propio? (opcional)',
 siteLangLabel:'Idioma del website',siteLangEnglish:'Inglés',siteLangSpanish:'Español',siteLangBoth:'Inglés + Español',
 publicPhoneOptional:'Teléfono público del negocio (opcional)',
 hoursShort:'Horarios o disponibilidad (opcional)',hoursPlace:'Lun–Sáb 9–6',
 domainOptionShort:'Enlace de tu website',needLink:'Usar el enlace incluido para mi website',
 haveDomain:'Ya tengo un dominio',wantCustom:'Quiero comprar mi propio dominio',
 domainHelpNote:'Tu website incluye un enlace listo para compartir; no necesitas comprar un dominio. Si prefieres uno propio, puedes comprarlo directamente en un proveedor como Namecheap y pagarle a ese proveedor el registro y las renovaciones. Podemos ayudarte a conectarlo.',
 photosIntro:'Sube tu logo o fotos si los tienes. No necesitas diseñar tú la web.',
 websitePhotosShort:'Sube tu logo o fotos (opcional)',
 assetsShort:'O comparte un enlace de Drive con tus fotos/logo (opcional)',
 advancedTitle:'Preferencias opcionales de IA y correo',automationChoice:'¿Qué correo te importa más?',
 autoAlerts:'Avisos de nuevas solicitudes',autoConfirm:'Confirmaciones después de aprobar',
 autoReminder:'Recordatorios de citas o mesas por correo',autoFollowup:'Seguimiento de cotizaciones por correo',
 automationReview:'Revisaremos el flujo antes de activarlo. Solo correo.',
 aiShort:'¿Qué debe responder tu asistente de IA? (opcional)',
 optionalDetails:'Opcional · estilo, redes e inspiración',
 goalsShort:'¿Qué hace especial a tu negocio? (opcional)',
 aiPhotoQuestion:'¿Quieres mejorar las fotos de tus productos con IA?',
 aiPhotoHint:'Opcional: imágenes más profesionales de tus productos o servicios, sin escribir un brief largo.',
 aiPhotoBrowse:'Ver nuestro catálogo de inspiración de fotos',
 aiPhotoGoal:'¿Qué quieres mejorar?',
 aiPhotoExisting:'Mejorar mis fotos actuales de productos',
 aiPhotoBackdrop:'Fondo limpio / fotografía de estudio premium',
 aiPhotoCampaign:'Crear un concepto editorial de campaña',
 aiPhotoReference:'Código de ejemplo de la galería (opcional)',
 aiPhotoReview:'Es una solicitud de revisión, no una generación automática. Confirmaremos el alcance antes de crear imágenes. Sube una foto original arriba o comparte un enlace de Drive.',
 photoPickerTitle:'Elige el estilo de tus fotos',photoPickerHelp:'Tu formulario permanece aquí. Elige una foto o cierra la galería para seguir editando.',photoPickerClose:'Cerrar',
  security:'No compartas contraseñas, tarjetas ni códigos de seguridad.'
}};
const formatFor={restaurant:'digital_menu',cafe:'digital_menu',retail:'product_catalog',cleaning:'services_requests',beauty:'services_requests',wellness:'services_requests',professional:'services_requests'};
const actions={
 restaurant:[['appointment','Request a table','Solicitar mesa'],['contact','View menu & ask a question','Ver menú y consultar']],
 cafe:[['contact','Browse menu & ask a question','Ver menú y consultar'],['appointment','Request a table','Solicitar mesa']],
 retail:[['contact','Ask about a product','Consultar un producto'],['quote','Request a product quote','Solicitar cotización']],
 cleaning:[['quote','Request a cleaning quote','Solicitar cotización de limpieza'],['appointment','Request a cleaning date','Solicitar fecha de limpieza']],
 beauty:[['appointment','Request an appointment','Solicitar cita'],['contact','Ask a question','Hacer consulta']],
 wellness:[['appointment','Request a session','Solicitar sesión'],['contact','Ask a question','Hacer consulta']],
 professional:[['contact','Contact the business','Contactar'],['appointment','Request a consultation','Solicitar consulta'],['quote','Request a quote','Solicitar cotización']],
 other:[['contact','Send an inquiry','Enviar consulta'],['quote','Request a quote','Solicitar cotización'],['appointment','Request an appointment','Solicitar cita']]
};
const offerNames={restaurant:'offerRestaurant',cafe:'offerCafe',retail:'offerRetail',cleaning:'offerCleaning',beauty:'offerBeauty',wellness:'offerWellness',professional:'offerProfessional',other:'offerOther'};
const offersExamples={restaurant:'placeRestaurant',cafe:'placeCafe',retail:'placeRetail',cleaning:'placeCleaning',beauty:'placeBeauty',wellness:'placeWellness',professional:'placeProfessional',other:'placeProfessional'};
function refreshOffers(){
 const input=field('menu_pdf_url'),listing=field('services');
 listing.required=!(input&&!$('menu-pdf-field').hidden&&input.value.trim());
}
function refreshDomain(){
 const domain=field('domain_option').value,show=domain!=='need_link';
 $('domain-field').hidden=!show;
 field('domain_preference').required=domain==='have_domain';
 if(!show)field('domain_preference').value='';
}
function refreshIndustry(){
 const kind=field('industry').value;
 const other=kind==='other';
 $('industry-other-field').hidden=!other;
 field('industry_other').required=other;
 $('other-format-field').hidden=!other;
 $('website-format').value=other?field('other_format').value:(formatFor[kind]||'services_requests');
 const listable=['digital_menu','product_catalog'].includes($('website-format').value);
 $('menu-pdf-field').hidden=!listable;
 if(!listable)field('menu_pdf_url').value='';
 refreshOffers();
 const words=copy[lang()];
 $('offers-label').textContent=words[offerNames[kind]||'services'];
 field('services').placeholder=words[offersExamples[kind]||'placeProfessional'];
 const selector=$('customer-action'),previous=selector.value;
 const choices=actions[kind]||actions.other;
 selector.replaceChildren(...choices.map(([value,en,es])=>new Option(lang()==='es'?es:en,value)));
 if(choices.some(([value])=>value===previous))selector.value=previous;
}
function translateBrief(){
 const words=copy[lang()];
 form.querySelectorAll('[data-i18n]').forEach(node=>{
  const content=words[node.dataset.i18n];
  if(content!==undefined)node.textContent=content;
 });
 const pickerCopy=$('photo-picker-dialog');
 if(pickerCopy)pickerCopy.querySelectorAll('[data-i18n]').forEach(node=>{
  const content=words[node.dataset.i18n];
  if(content!==undefined)node.textContent=content;
 });
  form.querySelectorAll('[data-placeholder]').forEach(node=>{
  const content=words[node.dataset.placeholder];
  if(content!==undefined)node.placeholder=content;
 });
 refreshIndustry();refreshDomain();updatePhotoChoice();
}
let inboxTouched=false,lastEmail='';
const buyer=field('email'),inbox=field('preferred_email');
buyer.addEventListener('input',()=>{
 const next=buyer.value.trim();
 if(!inboxTouched||!inbox.value||inbox.value===lastEmail)inbox.value=next;
 lastEmail=next;
});
inbox.addEventListener('input',()=>{inboxTouched=true});
field('industry').addEventListener('change',refreshIndustry);
field('other_format').addEventListener('change',refreshIndustry);
field('menu_pdf_url').addEventListener('input',refreshOffers);
field('domain_option').addEventListener('change',refreshDomain);
function updatePhotoChoice(){
 const checked=$('ai-photo-optin')?.checked===true;
 const panel=$('ai-photo-details');
 if(panel)panel.hidden=!checked;
 const field= form.elements.namedItem('ai_photo_reference');
 if(!checked&&field)field.value='';
 const kind=form.elements.namedItem('industry')?.value||'';
 const category={restaurant:'food',cafe:'bakery',retail:'retail',cleaning:'cleaning',beauty:'beauty',wellness:'beauty',professional:'services'}[kind]||'all';
 const gallery=$('ai-photo-gallery-link');
 if(gallery)gallery.href='/demos/photo-gallery/?category='+encodeURIComponent(category)+'&lang='+encodeURIComponent(lang());
}

/* Photo gallery appears *over* the paid intake; users never leave its URL.
 * Image selection is posted only between same-origin gallery and intake iframe.
 */
const pickerDialog=$('photo-picker-dialog');
const pickerFrame=$('photo-picker-frame');
const pickerLink=$('ai-photo-gallery-link');
const pickerClose=$('photo-picker-close');
let previousPickerFocus=null,previousScrollLock=null;
function closePhotoPicker(){
 if(!pickerDialog?.open)return;
 pickerDialog.close();
}
if(pickerDialog&&pickerFrame&&pickerLink&&pickerClose){
 pickerLink.addEventListener('click',event=>{
  // The ordinary link remains a usable new-tab fallback if <dialog> isn't supported.
  if(typeof pickerDialog.showModal!=='function')return;
  event.preventDefault();
  previousPickerFocus=document.activeElement;
  const url=new URL(pickerLink.href,location.origin);
  if(url.origin!==location.origin||url.pathname!=='/demos/photo-gallery/')return;
  url.searchParams.set('picker','1');
  url.searchParams.set('lang',lang());
  pickerFrame.src=url.pathname+url.search;
  previousScrollLock=document.documentElement.style.overflow;
  document.documentElement.style.overflow='hidden';
  pickerDialog.showModal();
  pickerClose.focus({preventScroll:true});
 });
 pickerClose.addEventListener('click',closePhotoPicker);
 pickerDialog.addEventListener('click',event=>{if(event.target===pickerDialog)closePhotoPicker()});
 pickerDialog.addEventListener('close',()=>{
  document.documentElement.style.overflow=previousScrollLock??'';
  pickerFrame.src='about:blank';
  if(previousPickerFocus&&previousPickerFocus.isConnected)previousPickerFocus.focus({preventScroll:true});
  previousPickerFocus=null;previousScrollLock=null;
 });
 window.addEventListener('message',event=>{
  if(event.origin!==location.origin||event.source!==pickerFrame.contentWindow)return;
  const data=event.data;
  if(!data||data.type!=='tle:photo-gallery:select'||!(/^(?:FD|BK|PR|BT|CL|SV)-\d{2}$/.test(String(data.code||''))))return;
  if(!pickerDialog.open)return;
  const code=String(data.code);
  const ref=field('ai_photo_reference');
  if(ref)ref.value=code;
  const checkbox=$('ai-photo-optin');
  if(checkbox&&!checkbox.checked)checkbox.checked=true;
  updatePhotoChoice();
  closePhotoPicker();
 });
}

$('ai-photo-optin')?.addEventListener('change',updatePhotoChoice);
$('business-industry')?.addEventListener('change',updatePhotoChoice);
$('locale').addEventListener('click',()=>queueMicrotask(translateBrief));
form.addEventListener('submit',()=>{
 if($('ai-photo-optin')?.checked&&$('ai-photo-details')?.hidden)updatePhotoChoice();

 // Capture-phase enhancement runs before the already verified intake submission handler.
 refreshIndustry();refreshDomain();refreshOffers();
 const extra=field('industry').value==='other'?' · '+field('industry_other').value.trim():'';
 const list=field('services').value.trim(),menu=field('menu_pdf_url').value.trim();
 const goal=field('goals');
 if(!goal.value.trim()){
  goal.value=('Create a '+$('website-format').value+' website for '+field('business_name').value.trim()+
   '. Business type: '+field('industry').value+extra+
   '. Main visitor action: '+field('customer_action').value+
   '. '+(list?'Items and prices supplied.':'Items and prices supplied by linked menu or product list.')+
   ' Email inquiries only.').slice(0,500);
 }
 if(!form.elements.namedItem('automation_goals')){
  const newInput=document.createElement('input');newInput.type='hidden';newInput.name='automation_goals';form.appendChild(newInput);
 }
 field('automation_goals').value=document.body.dataset.package==='website-ai-crm'?'Preferred email workflow (not active until approved): '+field('automation_workflow').value:'';
},true);
translateBrief();
})();