/* Spanish copy for the one shared email-demo / buyer Booking Page template.
   The account language from checkout is added to the buyer URL by booking-template-live.js. */
(function(){
 const params=new URLSearchParams(location.search);
 if(params.get("lang")!=="es")return;
 document.documentElement.lang="es";
 const d={
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
 "Open Demo Tracker":"Abrir demo del Command Center",
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
