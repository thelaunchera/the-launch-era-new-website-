/* Spanish copy for the one shared email-demo / buyer Booking Page template.
   The account language from checkout is added to the buyer URL by booking-template-live.js. */
(function(){
 const params=new URLSearchParams(location.search);
 if(params.get("lang")!=="es")return;
 document.documentElement.lang="es";
 const d={
"Send Demo Request a Quote":"Probar solicitud de cotización",
"Send Demo Request an Estimate":"Probar solicitud de estimado",
"← Choose another service":"← Elegir otro servicio",
"← Edit":"← Editar",
"Large home":"Vivienda grande",
"Special cleaning request":"Solicitud de limpieza especial",
"Post-renovation cleaning":"Limpieza después de remodelación",
"Detailed one-time cleaning":"Limpieza detallada por una vez",
"Other residential request":"Otra solicitud residencial",
"Not sure / Other":"No sé / Otro",
"Office":"Oficina",
"Retail store":"Tienda",
"Salon / Studio":"Salón / Estudio",
"Medical / Professional office":"Consultorio / Oficina profesional",
"Other business space":"Otro espacio comercial",
"Under 1,500 sq ft":"Menos de 1,500 pies cuadrados",
"1,500–3,000 sq ft":"1,500–3,000 pies cuadrados",
"3,000–5,000 sq ft":"3,000–5,000 pies cuadrados",
"5,000+ sq ft":"Más de 5,000 pies cuadrados",
"Weekly":"Semanal",
"2–3 times per week":"2–3 veces por semana",
"5 days per week":"5 días por semana",
"Custom schedule":"Horario personalizado",
"2 bedrooms":"2 habitaciones",
"3 bedrooms":"3 habitaciones",
"4 bedrooms":"4 habitaciones",
"5 bedrooms":"5 habitaciones",
"5+ bedrooms":"Más de 5 habitaciones",
"6+ bedrooms":"Más de 6 habitaciones",
"1 bathroom":"1 baño",
"2 bathrooms":"2 baños",
"3 bathrooms":"3 baños",
"4+ bathrooms":"Más de 4 baños",
"Weekly — save 15%":"Semanal — ahorra 15%",
"Biweekly — save 10%":"Cada dos semanas — ahorra 10%",
"Monthly — save 5%":"Mensual — ahorra 5%",
"Home type":"Tipo de vivienda",
"Home":"Vivienda",
"Preferred time":"Horario preferido",
"Preferred date":"Fecha preferida",
"Estimated price":"Precio estimado",
"Your services · your pricing · your workflow":"Tus servicios · tus precios · tu forma de trabajar",
"Your demo request":"Tu solicitud de prueba",
"Residential Quote":"Cotización residencial",
"Residential Estimate":"Estimado residencial",
"Commercial quote":"Cotización comercial",
"Commercial estimate":"Estimado comercial",
"Custom quote":"Cotización personalizada",
"Custom estimate":"Estimado personalizado",

"DEMO PREVIEW • NO REAL BOOKINGS OR EMAILS":"DEMO · SIN RESERVAS NI CORREOS REALES",
"This sample stays in your browser. No booking or email was sent. Open the demo Command Center to see the next step.":"Este ejemplo queda en tu navegador. No se envió ninguna reserva ni correo. Abre la demo del Command Center para ver el siguiente paso.",
"DEMO COMMAND CENTER • SAMPLE DATA ONLY":"DEMO DEL COMMAND CENTER · DATOS DE EJEMPLO",
"Your Requests — Demo":"Tus solicitudes — Demo",
"A simplified preview of how incoming requests can stay organized. This is not the live Lead Tracker.":"Una vista previa de cómo se organizan las solicitudes. Esta demo usa datos de ejemplo.",
"Demo data":"Datos de ejemplo",
"Request received → Price reviewed → Confirmation → Reminder → Follow-up":"Solicitud recibida → Precio revisado → Confirmación → Recordatorio → Seguimiento",
"🔒 This is only a preview":"🔒 Esta es una vista previa",
"This demo shows one example of how your booking and follow-up flow could work. Your final setup will depend on your business needs and selected service.":"Esta demo muestra cómo podrían funcionar tus reservas y seguimientos. Tu configuración final depende de tu negocio y del servicio elegido.",
"THE LAUNCH ERA DEMO ↓ YOUR CLEANING BUSINESS":"DEMO DE THE LAUNCH ERA ↓ TU NEGOCIO DE LIMPIEZA",
"Built around your business.":"Hecho para tu negocio.",
"Your logo · your services · your pricing · your workflow":"Tu logo · tus servicios · tus precios · tu forma de trabajar",
"Now imagine this built around your business.":"Ahora imagina esto adaptado a tu negocio.",
"✨ In your personalized system":"✨ En tu sistema personalizado",
"The owner reviews the estimate, controls the final price, and the customer can confirm from the email without back-and-forth.":"La dueña revisa el estimado, decide el precio final y el cliente confirma desde el correo.",
"Try the booking demo":"Probar la demo de reservas",
"Open request":"Abrir solicitud",
"Customer":"Cliente",
"Service":"Servicio",
"Frequency":"Frecuencia",
"Service ZIP":"Código postal del servicio",
"Online estimate":"Estimado en línea",
"No email":"Sin correo",
"Not entered":"Sin datos",
"Edit final price":"Editar precio final",
"ONLINE ESTIMATE":"ESTIMADO EN LÍNEA",
"DISCOUNT / ADJUSTMENT":"DESCUENTO / AJUSTE",
"ZIP / TRAVEL ADJUSTMENT":"AJUSTE POR DISTANCIA",
"FINAL PRICE":"PRECIO FINAL",
"Preview customer confirmation":"Ver confirmación del cliente",
"Simulation only. No email or real booking will be created.":"Solo simulación. No se crearán correos ni reservas reales.",
"Simulate customer confirmation":"Simular confirmación del cliente",
"✓ Demo cleaning confirmed":"✓ Limpieza de prueba confirmada",
"CONFIRMED":"CONFIRMADA",
"NEW":"NUEVA",
"Sample demo request":"Solicitud de ejemplo",
"Sample residential cleaning":"Limpieza residencial de ejemplo",
"House":"Casa",
"Apartment":"Apartamento",
"Condo":"Condominio",
"Townhouse":"Casa adosada",
"One time":"Una vez",
"Biweekly":"Cada dos semanas",
"Monthly":"Mensual",
"Deep Cleaning · Biweekly · Est. $214":"Limpieza profunda · Cada dos semanas · Est. $214",
"Standard Cleaning · Monthly · Est. $152":"Limpieza regular · Mensual · Est. $152",
"Move In / Move Out · One time · Est. $270":"Limpieza de mudanza · Una vez · Est. $270",

 "PRIVATE PREVIEW • LIVE BOOKINGS DISABLED":"VISTA PRIVADA · NO SE CREAN RESERVAS",
 "A smoother way to book your cleaning.":"Reserva tu limpieza de manera sencilla.",
 "✓ Easy mobile booking":"✓ Reservas fáciles desde el móvil",
 "✓ Clear service choices":"✓ Servicios fáciles de elegir",
 "✓ Organized requests":"✓ Solicitudes organizadas",
 "BOOKING PREVIEW":"VISTA DE RESERVAS",
 "Choose a service":"Elige un servicio",
 "WHAT KIND OF SPACE?":"¿QUÉ TIPO DE ESPACIO?",
 "Home / Residential":"Casa / Residencial",
 "Business / Commercial":"Negocio / Comercial",
 "Every business has its own services and prices. Try a residential or commercial request.":"Cada negocio tiene sus servicios y precios. Prueba una solicitud residencial o comercial.",
 "Standard Cleaning":"Limpieza regular",
 "Deep Cleaning":"Limpieza profunda",
 "Move In / Move Out":"Limpieza de mudanza",
 "Request a Home Estimate":"Pedir estimado residencial",
 "Request a Custom Quote":"Pedir cotización personalizada",
 "Office Cleaning":"Limpieza de oficinas",
 "Retail & Showrooms":"Tiendas y locales comerciales",
 "Medical & Professional Spaces":"Espacios médicos y profesionales",
 "Post-Construction":"Después de construcción",
 "Request Commercial Estimate":"Pedir estimado comercial",
 "Request Commercial Quote":"Pedir cotización comercial",
 "Routine home cleaning":"Limpieza habitual del hogar",
 "Detailed top-to-bottom clean":"Limpieza profunda y detallada",
 "Empty-home reset":"Limpieza de vivienda vacía",
 "A tailored estimate for your property":"Un estimado adaptado a tu propiedad",
 "Special residential services or large homes":"Servicios especiales o viviendas grandes",
 "Offices, conference rooms, shared spaces":"Oficinas, salas de reuniones y espacios compartidos",
 "Sales floors, fitting rooms and displays":"Tiendas, probadores y exhibidores",
 "Specialized professional environments":"Entornos profesionales especializados",
 "Project-based detailed cleaning":"Limpieza detallada por proyecto",
 "Describe your space and frequency":"Describe tu espacio y frecuencia",
 "Custom projects and specialist requirements":"Proyectos personalizados y servicios especiales",
 "Estimate →":"Estimado →",
 "Quote →":"Cotizar →",
 "WHAT TYPE OF HOME?":"¿QUÉ TIPO DE VIVIENDA?",
 "HOME DETAILS":"DATOS DE LA VIVIENDA",
 "HOW OFTEN?":"¿CON QUÉ FRECUENCIA?",
 "OPTIONAL EXTRAS":"EXTRAS OPCIONALES",
 "Inside fridge":"Dentro del refrigerador",
 "Inside oven":"Dentro del horno",
 "PREFERRED DATE & TIME":"FECHA Y HORA PREFERIDAS",
 "YOUR DETAILS":"TUS DATOS",
 "Review request":"Revisar solicitud",
 "Send Demo Request":"Enviar solicitud de prueba",
 "Send Demo Quote Request":"Enviar cotización de prueba",
 "Edit":"Editar",
 "Choose another service":"Elegir otro servicio",
 "Estimated price only.":"Solo precio estimado.",
 "The business reviews the request and confirms the final price before the service is confirmed.":"El negocio revisa la solicitud y confirma el precio final antes de confirmar el servicio.",
 "RESIDENTIAL ESTIMATE / QUOTE":"ESTIMADO / COTIZACIÓN RESIDENCIAL",
 "COMMERCIAL ESTIMATE / QUOTE":"ESTIMADO / COTIZACIÓN COMERCIAL",
 "Commercial Quote / Estimate":"Estimado / cotización comercial",
 "Residential Quote / Estimate":"Estimado / cotización residencial",
 "Tell us about your home":"Cuéntanos sobre tu vivienda",
 "RESIDENTIAL":"RESIDENCIAL",
 "COMMERCIAL":"COMERCIAL",
 "I WOULD LIKE TO…":"QUIERO…",
 "Get an estimate":"Obtener un estimado",
 "Request a quote":"Pedir una cotización",
 "WHAT TYPE OF REQUEST?":"TIPO DE SOLICITUD",
 "APPROXIMATE HOME SIZE":"TAMAÑO APROXIMADO DE LA VIVIENDA",
 "OPTIONAL RESIDENTIAL ADD-ONS":"EXTRAS RESIDENCIALES OPCIONALES",
 "Interior windows":"Cristales interiores",
 "Inside refrigerator":"Dentro del refrigerador",
 "Baseboards":"Zócalos",
 "PREFERRED DATE":"FECHA PREFERIDA",
 "PREFERRED TIME":"HORA PREFERIDA",
 "TELL US ABOUT THE JOB":"CUÉNTANOS SOBRE EL TRABAJO",
 "CONTACT DETAILS":"DATOS DE CONTACTO",
 "TYPE OF PROPERTY":"TIPO DE PROPIEDAD",
 "APPROXIMATE SIZE":"TAMAÑO APROXIMADO",
 "FREQUENCY":"FRECUENCIA",
 "COMMERCIAL ADD-ONS":"EXTRAS COMERCIALES",
 "Interior glass & partitions":"Cristales y divisiones interiores",
 "Restroom deep cleaning":"Limpieza profunda de baños",
 "Floor scrubbing / detailing":"Fregado y detalle de pisos",
 "Breakroom / kitchenette":"Área de descanso / cocina",
 "High-touch disinfection":"Desinfección de superficies de contacto",
 "After-hours cleaning":"Limpieza fuera de horario",
 "BUSINESS DETAILS":"DATOS DEL NEGOCIO",
 "Open Demo Command Center":"Abrir demo del Command Center",
 "Try another service":"Probar otro servicio",
 "Where should we send your demo messages?":"¿A qué correo enviamos tu demostración?",
 "Use any email you can check right now. We’ll verify it before sending anything.":"Utiliza un correo al que tengas acceso. Lo verificaremos antes de enviar nada.",
 "Send verification code":"Enviar código",
 "Verify":"Verificar",
 "Send me practical tips from The Launch Era to make bookings and follow-ups easier. Optional.":"Quiero recibir consejos de The Launch Era para mejorar las reservas y los seguimientos. Opcional.",
 "Full name":"Nombre completo",
 "Email address":"Correo electrónico",
 "Service address · Street, city, state":"Dirección del servicio · Calle, ciudad y estado",
 "Phone number":"Teléfono",
 "Service ZIP code":"Código postal del servicio",
 "Business phone (optional)":"Teléfono del negocio (opcional)",
 "Phone number (optional)":"Teléfono (opcional)",
 "Business service address":"Dirección del negocio donde se prestará el servicio",
 "Tell us what the space needs...":"Cuéntanos qué necesita el espacio...",
 "What needs extra attention?":"¿Qué necesita atención especial?",
 "6-digit code":"Código de 6 dígitos",
 "REVIEW":"REVISAR",
 "START":"EMPEZAR",
 "Choose a property type first.":"Primero elige un tipo de propiedad.",
 "Request received.":"Solicitud recibida.",
 "Demo request ready":"Solicitud de prueba lista",
 "Now see how this request looks from the business side.":"Ahora mira cómo aparece esta solicitud del lado del negocio."
 };
 for(const x of document.querySelectorAll("select option:not([value])"))x.value=x.textContent;
 const translate=text=>{
  const t=(text||"").trim();
  if(!t)return text;
  if(Object.hasOwn(d,t))return text.replace(t,d[t]);
  if(/^Customer preview: review your cleaning estimate of \$/.test(t))return text.replace('Customer preview: review your cleaning estimate of ','Vista del cliente: revisa tu estimado de limpieza de ').replace('. No email was sent.','. No se envió ningún correo.');
  if(/^Final confirmed price: /.test(t))return text.replace('Final confirmed price: ','Precio final confirmado: ');
  if(/^Sample request — /.test(t))return text.replace('Sample request — ','Solicitud de ejemplo — ');
  if(/^PRIVATE DEMO • /.test(t))return text.replace('PRIVATE DEMO • ','DEMO PRIVADA · ');
  if(/^PERSONALIZED FOR /.test(t))return text.replace('PERSONALIZED FOR ','PERSONALIZADO PARA ');
  if(/^Serving /.test(t))return text.replace('Serving ','Atendemos ');
  if(/^Built around /.test(t))return text.replace('Built around ','Hecho para ');
  if(/^COMMERCIAL · /.test(t))return text.replace("COMMERCIAL · ","COMERCIAL · ").replace("REQUEST AN ESTIMATE","SOLICITAR ESTIMADO").replace("REQUEST A QUOTE","SOLICITAR COTIZACIÓN");
  if(/^RESIDENTIAL · /.test(t))return text.replace("RESIDENTIAL · ","RESIDENCIAL · ").replace("REQUEST AN ESTIMATE","SOLICITAR ESTIMADO").replace("REQUEST A QUOTE","SOLICITAR COTIZACIÓN");
  if(/^est\. from \$/i.test(t))return text.replace("est. from ","est. desde ");
  if(/^New booking request — /.test(t))return text.replace("New booking request — ","Nueva reserva — ");
  if(/^Send Demo /.test(t))return text.replace("Send Demo ","Enviar prueba: ");
  return text
 };
 const render=root=>{
  if(root.nodeType===3){
   if(["SCRIPT","STYLE"].includes(root.parentElement?.tagName))return;
   const r=translate(root.nodeValue);
   if(r!==root.nodeValue)root.nodeValue=r;
   return
  }
  if(root.nodeType!==1)return;
  for(const attr of ["placeholder","aria-label"]){
   const raw=root.getAttribute(attr);
   if(raw){const v=translate(raw);if(v!==raw)root.setAttribute(attr,v)}
  }
  for(const child of [...root.childNodes])render(child)
 };
 render(document.body);
 let pending=false;
 new MutationObserver(()=>{
  if(pending)return;pending=true;
  queueMicrotask(()=>{pending=false;render(document.body)})
 }).observe(document.body,{subtree:true,childList:true,characterData:true});
})();
