/* The Launch Era — fictional Luna Bloom sample identity + contact/legal v17.
 * Public sample route only. Never alters paid client bookings or their pages.
 * All contact data is fabricated, phone is in reserved 555-01xx range,
 * and .example email cannot receive mail. Nothing is sent.
 */
(()=>{
 "use strict";
 const p=new URLSearchParams(location.search);
 if(location.pathname!=="/lead-private-preview.html"||p.has("key")||p.get("owner_preview")==="1"
    ||!document.documentElement.classList.contains("demo-editorial"))return;
 const es=p.get("lang")==="es";
 const clean=v=>String(v||"").replace(/[<>\u0000-\u001f]/g,"").trim().slice(0,85);
 const inputBusiness=clean(p.get("business"));
 const supplied=!p.has("rid")&&/^Coastal Home Cleaning$/i.test(inputBusiness)?"":inputBusiness;
 const business=supplied||"Luna Bloom Home Cleaning";
 const demoEmail=supplied?"hello@samplecleaning.example":"hello@lunabloom.example";
 const phone="(305) 555-0148";
 const address="125 Sample Lane, Miami, FL 33131";
 const text=es?{
   label:"LIMPIEZA RESIDENCIAL",navContact:"Contacto",
   contactEy:"ESTAMOS AQUÍ PARA AYUDAR",contactTitle:"Un hogar bonito empieza aquí.",
   contactIntro:"¿Tienes preguntas sobre la limpieza? Explora los servicios y descubre cómo sería solicitar una visita. Los datos de contacto aquí son ficticios.",
   contactCTA:"Explorar servicios",tel:"Teléfono de ejemplo",email:"Correo de ejemplo",
   address:"Dirección de ejemplo",area:"Zona de servicio de ejemplo",hours:"Horario de ejemplo",
   areasText:"Miami · Miami Beach · Brickell · Coral Gables · Doral · Kendall",
   schedule:"Lun.–Vie. 9:00 a. m.–5:00 p. m. · Sáb. 8:00 a. m.–12:00 p. m.",
   fake:"Datos ficticios de demostración — no atienden llamadas, visitas ni correos.",
   footerDesc:"Un hogar cuidado y una forma más sencilla de organizar tu limpieza.",
   quick:"Explorar",contact:"Contacto",legal:"Información legal",home:"Inicio",services:"Servicios",
   request:"Solicitar limpieza",privacy:"Política de privacidad",terms:"Términos del servicio",
   cookies:"Política de cookies",access:"Accesibilidad",
   rights:"© 2026. Demostración ficticia.",powered:"Powered by The Launch Era",
   notice:"SITIO DE EJEMPLO — Este negocio, su dirección, teléfono y correo son ficticios. Las políticas son textos ilustrativos, no documentos legales para clientes reales.",
   policyEy:"POLÍTICA DE EJEMPLO · NO ES ASESORÍA LEGAL",
   close:"Cerrar política"
 }:{
   label:"RESIDENTIAL CLEANING",navContact:"Contact",
   contactEy:"WE'RE HERE TO HELP",contactTitle:"A lovelier home starts here.",
   contactIntro:"Have a question about cleaning? Explore the services and see how simple a request can feel. Contact details are fictional examples.",
   contactCTA:"Explore cleaning services",tel:"Sample phone",email:"Sample email",
   address:"Sample address",area:"Sample service area",hours:"Sample business hours",
   areasText:"Miami · Miami Beach · Brickell · Coral Gables · Doral · Kendall",
   schedule:"Mon–Fri 9:00 AM–5:00 PM · Sat 8:00 AM–12:00 PM",
   fake:"Fictional demo details — no calls, visits, or emails are handled.",
   footerDesc:"Thoughtful home care, with a simpler way to plan your next clean.",
   quick:"Explore",contact:"Contact",legal:"Legal",home:"Home",services:"Services",
   request:"Request cleaning",privacy:"Privacy Policy",terms:"Terms of Service",
   cookies:"Cookie Policy",access:"Accessibility",
   rights:"© 2026. Fictional demo business.",powered:"Powered by The Launch Era",
   notice:"SAMPLE WEBSITE — This business name, address, phone number and email are fictional. Policies are illustrative templates, not approved legal documents for actual clients.",
   policyEy:"SAMPLE POLICY · NOT LEGAL ADVICE",
   close:"Close policy"
 };
 document.documentElement.classList.add("tle-demo-brand-v17");
 document.title=business+" · "+(es?"Demostración de reservas":"Cleaning Booking Demo");
 const $=s=>document.querySelector(s);
 const brand=$("#demoBrandName");
 if(brand){
   brand.classList.add("tle-sample-wordmark");
   brand.replaceChildren();
   const mark=document.createElement("span");
   mark.className="tle-bloom-emblem";mark.setAttribute("aria-hidden","true");mark.textContent="✿";
   const lockup=document.createElement("span");lockup.className="tle-bloom-lockup";
   const name=document.createElement("strong");name.className="tle-bloom-name";name.textContent=business;
   // The public sample logo uses its business name only. Do not add a
   // RESIDENTIAL CLEANING descriptor: the demo also shows commercial services.
   lockup.append(name);brand.append(mark,lockup);
   brand.setAttribute("aria-label",business+" — "+(es?"volver al inicio":"back to top"));
 }
 const nav=$(".demo-editorial-nav .demo-navlinks");
 if(nav&&!nav.querySelector('a[href="#demoContact"]')){
   const a=document.createElement("a");a.href="#demoContact";a.textContent=text.navContact;nav.append(a);
 }
 const footer=$("footer.demo-footer");
 if(!footer)return;
 const section=document.createElement("section");
 section.id="demoContact";section.className="tle-sample-contact";
 section.setAttribute("aria-label",text.contact);
 // Templates contain only authored markup. Business and area enter as textContent.
 section.innerHTML='<div class="tle-contact-copy"><p class="tle-footer-overline"></p><h2></h2><p class="tle-contact-intro"></p><a class="tle-contact-cta" href="#bookingStarter"></a></div>'+
 '<dl class="tle-contact-list">'+
 '<div><dt data-l="tel"></dt><dd class="tle-sample-phone"></dd></div>'+
 '<div><dt data-l="email"></dt><dd class="tle-sample-email"></dd></div>'+
 '<div><dt data-l="address"></dt><dd class="tle-sample-address"></dd></div>'+
 '<div><dt data-l="hours"></dt><dd class="tle-sample-hours"></dd></div>'+
 '<div style="grid-column:1/-1"><dt data-l="area"></dt><dd class="tle-sample-areas"></dd><small class="tle-demo-fake-note"></small></div>'+
 '</dl>';
 section.querySelector(".tle-footer-overline").textContent=text.contactEy;
 section.querySelector("h2").textContent=text.contactTitle;
 section.querySelector(".tle-contact-intro").textContent=text.contactIntro;
 section.querySelector(".tle-contact-cta").textContent=text.contactCTA;
 for(const el of section.querySelectorAll("[data-l]"))el.textContent=text[el.dataset.l]||"";
 section.querySelector(".tle-sample-phone").textContent=phone;
 section.querySelector(".tle-sample-email").textContent=demoEmail;
 section.querySelector(".tle-sample-address").textContent=address;
 section.querySelector(".tle-sample-hours").textContent=text.schedule;
 section.querySelector(".tle-sample-areas").textContent=text.areasText;
 section.querySelector(".tle-demo-fake-note").textContent=text.fake;
 footer.before(section);
 footer.classList.add("tle-demo-full-footer");
 footer.innerHTML='<div class="tle-footer-grid">'+
 '<div class="tle-footer-about"><strong class="tle-footer-name"></strong><p></p></div>'+
 '<div><h3 data-label="quick"></h3><nav aria-label="Explore"><a href="#leadHero" data-label="home"></a><a href="#demoServices" data-label="services"></a><a href="#bookingStarter" data-label="request"></a></nav></div>'+
 '<div><h3 data-label="contact"></h3><nav aria-label="Contact"><a href="#demoContact" data-label="contact"></a><span class="tle-footer-phone"></span><span class="tle-footer-email"></span><span>Miami, Florida · DEMO</span></nav></div>'+
 '<div><h3 data-label="legal"></h3><nav aria-label="Sample legal policies"><a href="#demoPrivacy" data-demo-policy="privacy" data-label="privacy"></a><a href="#demoTerms" data-demo-policy="terms" data-label="terms"></a><a href="#demoCookies" data-demo-policy="cookies" data-label="cookies"></a><a href="#demoAccessibility" data-demo-policy="access" data-label="access"></a></nav></div>'+
 '</div><div class="tle-footer-bottom"><span class="tle-footer-copyright"></span><a href="https://thelaunchera.com/" rel="noopener noreferrer" class="tle-footer-powered"></a></div><p class="tle-footer-disclaimer"></p>';
 footer.querySelector(".tle-footer-name").textContent=business;
 footer.querySelector(".tle-footer-about p").textContent=text.footerDesc;
 for(const el of footer.querySelectorAll("[data-label]"))el.textContent=text[el.dataset.label]||"";
 footer.querySelector(".tle-footer-phone").textContent=phone;
 footer.querySelector(".tle-footer-email").textContent=demoEmail;
 footer.querySelector(".tle-footer-copyright").textContent=text.rights;
 footer.querySelector(".tle-footer-powered").textContent=text.powered;
 footer.querySelector(".tle-footer-disclaimer").textContent=text.notice;
 const policies=es?{
  privacy:{title:text.privacy,sections:[
   ["Sobre esta demostración","Este sitio es una demostración interactiva con información ficticia. No confirma citas ni envía solicitudes de limpieza."],
   ["Información del formulario","El formulario ilustra los datos que puede necesitar un servicio de limpieza: nombre, dirección, teléfono, fechas y preferencias. En esta experiencia de prueba no se realiza una reserva real."],
   ["Sitios de clientes reales","Cada negocio debe explicar cómo recopila, utiliza, protege y conserva los datos, qué proveedores externos utiliza y cómo atender solicitudes de privacidad. Este texto no sustituye la política de un negocio operativo."],
   ["Contacto","El teléfono, dirección y correo mostrados son datos ficticios y no están supervisados."]]},
  terms:{title:text.terms,sections:[
   ["Uso de la vista previa","La página solo ilustra la experiencia de solicitar una limpieza. No se prestan servicios ni se crea una relación contractual."],
   ["Precios y disponibilidad","Los estimados, descuentos, horarios, áreas y servicios son ejemplos. Nada de lo mostrado garantiza un precio o cita."],
   ["Solicitudes","Probar el formulario no envía información a una empresa ni confirma un trabajo. Las páginas reales necesitan términos específicos aprobados por su propietario."],
   ["Responsabilidad","El contenido se entrega como muestra de diseño y no como una oferta comercial real."]]},
  cookies:{title:text.cookies,sections:[
   ["Sobre el uso de tecnología","Esta página puede cargar recursos externos y utilizar almacenamiento del navegador para ofrecer una demostración interactiva."],
   ["Configuración real","Un negocio real debe comprobar sus herramientas de analítica, integraciones y cookies y ofrecer los avisos y controles que correspondan."],
   ["Preferencias","Este demo no es un panel de consentimiento para una empresa real."]]},
  access:{title:text.access,sections:[
   ["Nuestro objetivo","Esta muestra procura mantener textos legibles, controles accesibles desde teclado y una navegación adaptable a teléfonos y computadoras."],
   ["Necesitas ayuda","Si un control del demo no funciona, puedes explorar los demás elementos. El teléfono y correo ficticios no son canales de soporte."],
   ["Sitios reales","Cada empresa debe probar la accesibilidad de su sitio publicado y habilitar canales de asistencia reales."]]}
 }:{
  privacy:{title:text.privacy,sections:[
   ["About this sample","This is an interactive sample with fictional company and contact information. It does not confirm appointments or send cleaning requests."],
   ["Information shown in forms","Forms demonstrate the kinds of information a cleaning company might request: your name, contact details, service address, timing and cleaning preferences. This sample does not place a real booking."],
   ["For live business sites","Each actual company needs its own approved privacy notice describing information collection, uses, security, retention, service providers, and privacy requests. This sample is not its legal policy."],
   ["Contact details","The address, phone number and email displayed here are fictional and are not monitored."]]},
  terms:{title:text.terms,sections:[
   ["Using the preview","This site demonstrates what a cleaning-service booking experience could look like. No real service, order or contractual agreement is created."],
   ["Pricing and availability","Prices, estimates, frequency discounts, service areas and time slots are sample values only and are subject to real-business confirmation."],
   ["Submitting a sample request","Trying the preview form does not contact a cleaning business, send email or reserve a visit. Real service terms must be approved for each company."],
   ["Disclaimer","The information on this page is a design sample and not an actual service offer."]]},
  cookies:{title:text.cookies,sections:[
   ["About site technologies","This preview may load third-party assets and use browser storage to provide an interactive experience."],
   ["Real company websites","A real business should audit the analytics tools, integrations and cookies it actually uses, explain their purposes and offer applicable consent controls."],
   ["Your choice","This example is not a functioning cookie-consent portal for a real business."]]},
  access:{title:text.access,sections:[
   ["Our aim","This sample is designed for readable text, keyboard-accessible controls and responsive viewing on phones, tablets and desktops."],
   ["Having difficulty?","You can try other demo controls, but the fictional phone and email are not support channels."],
   ["For live sites","Each business must test its deployed website for accessibility and provide a real assistance contact."]]}
 };
 const dialog=document.createElement("dialog");
 dialog.id="tleDemoLegalDialog";dialog.className="tle-demo-policy-dialog";
 dialog.setAttribute("aria-label",text.legal);
 dialog.innerHTML='<button class="tle-policy-close" type="button" aria-label="Close">×</button>'+
 '<p class="tle-policy-kicker"></p><h2 class="tle-policy-heading"></h2><div class="tle-policy-content"></div>';
 footer.after(dialog);
 const close=dialog.querySelector("button");
 close.setAttribute("aria-label",text.close);
 close.addEventListener("click",()=>dialog.close());
 dialog.addEventListener("click",event=>{if(event.target===dialog)dialog.close()});
 footer.querySelectorAll("[data-demo-policy]").forEach(link=>link.addEventListener("click",event=>{
   event.preventDefault();
   const doc=policies[link.dataset.demoPolicy];if(!doc)return;
   dialog.querySelector(".tle-policy-kicker").textContent=text.policyEy;
   dialog.querySelector(".tle-policy-heading").textContent=doc.title;
   const body=dialog.querySelector(".tle-policy-content");body.replaceChildren();
   for(const [heading,copy] of doc.sections){
     const h=document.createElement("h3"),paragraph=document.createElement("p");
     h.textContent=heading;paragraph.textContent=copy;body.append(h,paragraph);
   }
   if(typeof dialog.showModal==="function"){dialog.showModal();close.focus();}
   else{dialog.setAttribute("open","");close.focus();}
 }));
})();
