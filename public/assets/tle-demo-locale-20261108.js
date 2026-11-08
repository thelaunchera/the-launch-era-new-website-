/* The Launch Era — shared Spanish/English UI for portfolio and simulated Owner Center.
   This script does not change original branded websites, transactions or data.
   ?lang=es enables Spanish; English remains the default. */
(()=>{
"use strict";
const query=new URLSearchParams(location.search);
const isEs=query.get("lang")==="es";
const entries=String.raw`
OWNER CENTER / INTERACTIVE DEMO||PANEL DEL PROPIETARIO / DEMOSTRACIÓN INTERACTIVA
A BETTER WAY TO RUN YOUR DAY||UNA FORMA MÁS SIMPLE DE ORGANIZAR TU DÍA
Back to website preview||Volver a la vista del sitio web
All information is simulated. Edits stay in this browser only. No payments, messages, or bookings are sent.||Toda la información es simulada. Los cambios solo se guardan en este navegador. No se envían pagos, mensajes ni reservas.
BACK TO DEMO||VOLVER AL DEMO
← BACK TO DEMO||← VOLVER AL DEMO
INTERACTIVE DEMO||DEMOSTRACIÓN INTERACTIVA
Reset demo||Restablecer demo
Reset all demo changes||Restablecer todos los cambios del demo
DIGITAL MENU||MENÚ DIGITAL
DIGITAL MENU / OWNER VIEW||MENÚ DIGITAL / VISTA DEL PROPIETARIO
SERVICES + BOOKING / OWNER VIEW||SERVICIOS Y RESERVAS / VISTA DEL PROPIETARIO
Interactive demo — give it a try.||Este es un demo interactivo.
Changes stay in this browser. No real orders, bookings or payments are created.||Los cambios solo se guardan en este navegador. No se crean pedidos, reservas ni pagos reales.
SERVICES + BOOKING||SERVICIOS Y RESERVAS
OWNER VIEW||VISTA DEL PROPIETARIO
Your business.||Tu negocio.
Your menu.||Tu menú.
Your services.||Tus servicios.
Your way.||A tu manera.
Explore how it feels to manage products and prices, without touching a real business.||Explora cómo administrar productos y precios sin modificar un negocio real.
Edit dishes, prices, promotions and availability. See the customer's menu respond instantly.||Edita productos, precios, promociones y disponibilidad. Mira cómo se actualiza el menú para el cliente.
Explore service packages, prices, offers and the booking experience — all with example data.||Explora servicios, precios, ofertas y solicitudes de reserva con datos de ejemplo.
Project||Proyecto
Choose demo brand||Elegir marca del demo
Explore freely — this is a demo.||Explora con libertad: esto es una demostración.
Prices, offers, products, and requests are examples. Your edits are kept locally on this browser only. Nothing changes on the public websites.||Los precios, las ofertas, los productos y las solicitudes son ejemplos. Tus cambios solo se guardan en este navegador; no modifican los sitios publicados.
Menu items||Productos del menú
Active offers||Ofertas activas
Available||Disponible
Unavailable||No disponible
Everything in its place.||Todo en su lugar.
Quick access to your products, services and customer-facing preview.||Accede a productos, servicios y a la vista que verá el cliente.
+ Add item||+ Agregar producto
Quick edits||Edición rápida
View all||Ver todos
Customer preview||Vista del cliente
Expand||Ampliar
Search items||Buscar productos
Search products or services...||Buscar productos o servicios...
Edit item||Editar producto
Close||Cerrar
Name||Nombre
Regular price ($)||Precio habitual ($)
Discount (%)||Descuento (%)
Category||Categoría
Short description||Descripción breve
Image URL (optional)||URL de imagen (opcional)
https://... or /demos/...||https://... o /demos/...
Keep the existing image or paste one you own. No upload or server required.||Conserva la imagen o pega un enlace a una imagen propia. No necesitas subir archivos ni usar un servidor.
Available for customers||Disponible para clientes
Delete item||Eliminar producto
Cancel||Cancelar
Save changes||Guardar cambios
Sample requests.||Solicitudes de ejemplo.
A walkthrough of what a busy day could look like.||Así podría verse un día con solicitudes.
Presentation examples, not actual customer activity.||Son ejemplos de presentación, no actividad de clientes reales.
There are no live orders, service appointments or personal details here. This view is not connected to our Command Center or CRM.||No hay pedidos, citas ni datos personales reales. Esta vista no está conectada al Command Center ni al CRM.
See what customers see.||Mira lo que ven tus clientes.
Live preview of your edits within this local demo.||Vista previa de tus cambios en esta demostración local.
View original website||Ver sitio web original
Customer's screen · preview only||Pantalla del cliente · solo vista previa
The experience, made simple.||Tu experiencia, más sencilla.
Products, prices, discounts and availability update here immediately after you save. These changes do not alter the published demo website. To start fresh, use Reset Demo.||Los productos, precios, descuentos y disponibilidad se actualizan aquí al guardar. No modifican el sitio publicado. Puedes comenzar de nuevo con «Restablecer demo».
Independent design demonstration · No real transactions||Demostración de diseño independiente · Sin transacciones reales
Mobile Owner Center navigation||Navegación móvil del propietario
Owner Center navigation||Navegación del propietario
Dashboard||Inicio
Catalog||Catálogo
Menu||Menú
Services||Servicios
Requests||Solicitudes
Preview||Vista previa
Orders||Pedidos
Bookings||Reservas
Edit||Editar
Edit item||Editar producto
Mark unavailable||Marcar no disponible
Make available||Marcar disponible
No items. Add your first sample item.||No hay productos. Agrega el primero para probar.
No items currently available.||No hay productos disponibles por ahora.
No matching items. Add one or clear your search.||No encontramos coincidencias. Agrega un producto o borra la búsqueda.
YOUR MENU · MADE TO EXPLORE||TU MENÚ · LISTO PARA EXPLORAR
SERVICES · MADE FOR YOU||SERVICIOS · A TU MEDIDA
SIMULATED CUSTOMER VIEW · NO TRANSACTIONS||VISTA SIMULADA DEL CLIENTE · SIN TRANSACCIONES
SIMULATED||SIMULADO
Sample order cards for a fictional day.||Pedidos de ejemplo para un día ficticio.
Sample bookings and quote requests for a fictional day.||Reservas y solicitudes de cotización de ejemplo para un día ficticio.
Order example #001||Pedido de ejemplo #001
Order example #002||Pedido de ejemplo #002
Order example #003||Pedido de ejemplo #003
Two menu items · Takeaway||Dos productos · Para llevar
One menu item · Dine-in||Un producto · Para consumir aquí
Three menu items · Pickup||Tres productos · Para recoger
Example only||Solo ejemplo
Request example #001||Solicitud de ejemplo #001
Booking example #002||Reserva de ejemplo #002
Quote example #003||Cotización de ejemplo #003
New inquiry · Residential||Nueva consulta · Residencial
Consultation requested||Consulta solicitada
Service package inquiry||Consulta sobre paquete de servicios
Specials||Especiales
Please check name, price and discount.||Revisa el nombre, el precio y el descuento.
This demo allows up to 75 items.||Este demo permite hasta 75 productos.
Image must use a The Launch Era demo URL or local image path.||La imagen debe usar una URL de demo de The Launch Era o una ruta local.
Changes saved in this browser||Cambios guardados en este navegador
Browser storage is off. Changes last until you leave.||El navegador no permite guardar datos. Los cambios durarán hasta que salgas.
Delete this sample item?||¿Eliminar este producto de ejemplo?
Sample item deleted||Producto de ejemplo eliminado
Reset this brand's demo? Your browser-only edits for this project will be cleared.||¿Restablecer el demo de esta marca? Se borrarán los cambios guardados en este navegador.
Original demo restored||Se restauró el demo original
Available again||Disponible nuevamente
Marked unavailable||Marcado como no disponible
OWNER VIEW · DEMO||VISTA DEL PROPIETARIO · DEMO
CREATIVE STUDIO · DIGITAL EXPERIENCES||ESTUDIO CREATIVO · EXPERIENCIAS DIGITALES
A collection of independent worlds / 2026||Una colección de mundos únicos / 2026
Explore projects||Explorar proyectos
The Launch Era / Selected work||The Launch Era / Proyectos seleccionados
A world||Un mundo
of||de
ideas.||ideas.
A curated collection of websites and concepts. Each brand has its own voice, visual language and story to tell.||Una colección de sitios web y conceptos originales. Cada marca tiene su propia voz, identidad visual e historia.
16 projects||16 proyectos
Made to explore||Para descubrir
The collection||La colección
EDITORIAL WEBSITES / 2026||SITIOS WEB EDITORIALES / 2026
Explore the projects.||Explora los proyectos.
Original ideas, distinct identities, and details worth looking at.||Ideas originales, identidades únicas y detalles que merecen una mirada.
All projects||Todos los proyectos
Food & Drink||Comida y bebidas
Beauty & Wellness||Belleza y bienestar
Lifestyle||Estilo de vida
Experiences||Experiencias
Find a project...||Buscar un proyecto...
Search projects||Buscar proyectos
Explore demo||Explorar demo
Owner View||Vista del propietario
No demos match this search. Try another category or keyword.||No encontramos demos. Prueba otra categoría o búsqueda.
More than||Más que
just a website.||un sitio web.
Discover The Launch Era||Conoce The Launch Era
THE LAUNCH ERA / PROJECT PREVIEW||THE LAUNCH ERA / VISTA PREVIA DEL PROYECTO
Website demo||Demo del sitio web
Open full site||Abrir sitio completo
Close demo||Cerrar demo
OPENING THE PROJECT||ABRIENDO EL PROYECTO
Website preview||Vista previa del sitio web
Open full website||Abrir sitio web completo
Interactive website preview||Vista previa interactiva del sitio web
THE LAUNCH ERA · ORIGINAL CONCEPTS||THE LAUNCH ERA · CONCEPTOS ORIGINALES
Independent design concepts and educational demonstrations. Brands, addresses, offers, bookings and checkouts may be fictional or simulated. No private Studio materials or customer data are published here.||Conceptos de diseño independientes y demostraciones educativas. Algunas marcas, direcciones, ofertas, reservas y pagos pueden ser ficticios o simulados. No se publica contenido privado del Studio ni datos de clientes.
Privacy Policy||Política de privacidad
Terms of Use||Términos de uso
Cookie Policy||Política de cookies
Refund Policy||Política de reembolsos
Privacy Choices||Preferencias de privacidad
© 2026 The Launch Era. All rights reserved.||© 2026 The Launch Era. Todos los derechos reservados.
Visit The Launch Era||Visitar The Launch Era
The Launch Era home||Inicio de The Launch Era
Featured original demo photography||Fotografías originales destacadas de los demos
Browse demos||Explorar demos
Filter demo category||Filtrar por categoría
Legal and project information||Información legal y de los proyectos
Sound, color and product photography||Fotografía de producto, sonido y color
Waffle Co. · breakfast made editorial||Waffles y desayunos con estilo editorial
European-inspired pâtisserie||Pastelería de inspiración europea
Hair, beauty and personal style||Cabello, belleza y estilo personal
Cuban cuisine, story and atmosphere||Cocina cubana, historia y ambiente
Wedding cake atelier||Atelier de pasteles de boda
Nightlife and VIP concept||Vida nocturna y experiencia VIP
Cookies, gifting and original imagery||Galletas, regalos e imágenes originales
Brownie shop · with photo/video hero variants||Tienda de brownies con portada en foto y video
Soft beauty editorial campaign||Campaña editorial de belleza
Chinese street kitchen, noodles and hibachi||Cocina callejera china, noodles y hibachi
Seasonal coffee and cozy café identity||Café de temporada y ambiente acogedor
Yoga studio with membership concepts||Estudio de yoga con opciones de membresía
Coffee, bakery and sweet treats||Café, repostería y dulces
Fashion editorial and curated looks||Moda editorial y looks seleccionados
Residential booking journey simulation||Simulación de reservas de limpieza residencial
Waffles||Waffles
Grab & Go||Para llevar
Pâtisserie||Pastelería
Coffee||Café
Breakfast||Desayuno
Entrées||Platos principales
Desserts||Postres
Wedding Cakes||Pasteles de boda
Dessert Tables||Mesas de postres
Cookies||Galletas
Brownies||Brownies
Noodles||Fideos
Bowls||Bowls
Hibachi||Hibachi
Consultation||Consulta
Styling||Estilismo
Care||Cuidado
Wellness||Bienestar
Classes||Clases
Private Sessions||Sesiones privadas
Residential||Residencial
Specialty||Especialidades
The Golden Classic||El clásico Golden
The At-Home Ritual||El ritual en casa
Morning To Go||Desayuno para llevar
Crisp edges, slow mornings||Bordes crujientes para mañanas sin prisa
A breakfast moment worth keeping||Un desayuno para recordar
Little ritual, big flavor||Pequeño ritual, mucho sabor
Butter Croissant||Croissant de mantequilla
Café Crème||Café crème
Weekend Brunch||Brunch del fin de semana
A buttery morning classic||Un clásico de mantequilla recién horneado
Made for slow conversations||Para conversaciones sin prisa
A beautiful start to the day||Un comienzo delicioso
Ropa Vieja||Ropa Vieja
Camarones Enchilados||Camarones enchilados
Flan de la Casa||Flan de la casa
A comforting Cuban classic||Un clásico cubano lleno de sabor
A little heat, a lot of character||Un toque picante con mucho carácter
Sweet finish||Un final dulce
Blush Garden||Jardín rosa
Midnight Ribbon||Lazo de medianoche
Sweet Table||Mesa dulce
An elegant floral wedding cake||Pastel de boda elegante con flores
A statement cake for a special day||Un pastel inolvidable para un día especial
Little details for the celebration||Detalles dulces para celebrar
Classic Chocolate Chip||Clásica con chispas de chocolate
Double Chocolate||Doble chocolate
Salted Caramel||Caramelo salado
White Chocolate Raspberry||Chocolate blanco y frambuesa
Soft center, crisp edges||Centro suave y bordes crujientes
Rich and deeply chocolate||Mucho chocolate en cada bocado
Sweet meets salty||El equilibrio entre dulce y salado
A bright little surprise||Una sorpresa llena de sabor
Brownie Clásico||Brownie clásico
Brownie con Nuez||Brownie con nuez
Dulce de Leche||Dulce de leche
Chocolate y mucho cariño||Chocolate y mucho cariño
Textura irresistible||Textura irresistible
Una combinación especial||Una combinación especial
Signature Chili Beef Noodles||Fideos de res con chile de la casa
Slow-Braised Beef Bowl||Bowl de res a fuego lento
Hibachi Shrimp||Camarones hibachi
Bold flavors, fresh from the wok||Sabores intensos y recién hechos al wok
A new kind of comfort||Comida reconfortante, reinventada
Made for the table||Para compartir en la mesa
Sugar Cookie Latte||Latte de galleta de azúcar
Gingerbread Latte||Latte de jengibre
Peppermint Mocha||Moca de menta
Your cozy moment||Tu momento acogedor
Warm seasonal spice||Especias de temporada
Chocolate and winter magic||Chocolate y magia de invierno
Signature Iced Latte||Latte helado de la casa
Chocolate Chunk Cookie||Galleta con trozos de chocolate
Pistachio Morning Roll||Rollito matutino de pistacho
A little treat for every day||Un antojo para cada día
Made for cookie lovers||Para quienes aman las galletas
A sweet morning ritual||Un ritual dulce para comenzar el día
Private Consultation||Consulta privada
Personal Styling Session||Sesión de estilismo personal
Wig Care Session||Sesión de cuidado de pelucas
Find a style that feels like you||Encuentra un estilo que te represente
An appointment made for you||Una cita pensada para ti
A gentle refresh||Una renovación delicada
Lavender Ritual||Ritual de lavanda
Signature Experience||Experiencia de la casa
Gifting Appointment||Cita para regalos
A softer way to reset||Una pausa para renovar energías
A little space for yourself||Un espacio solo para ti
Curated with care||Elegido con mucho cuidado
Morning Flow||Flujo matutino
Private Yoga Session||Sesión privada de yoga
Gentle Stretch||Estiramientos suaves
Find your rhythm||Encuentra tu ritmo
Space to reconnect||Un espacio para reconectar
Move at your own pace||Muévete a tu ritmo
Standard Home Cleaning||Limpieza residencial estándar
Deep Cleaning||Limpieza profunda
Move-In / Move-Out||Limpieza de mudanza
A refresh for the whole home||Una renovación para todo el hogar
Extra attention for every corner||Atención especial en cada rincón
Start your new chapter fresh||Empieza esta nueva etapa con frescura
`.trim().split("\n").map(line=>line.split("||"));
const es=Object.fromEntries(entries.filter(p=>p.length===2));
const en=Object.fromEntries(entries.filter(p=>p.length===2).map(([a,b])=>[b,a]));
const target=isEs?es:en;
function tr(value){
 if(typeof value!=="string")return value;
 const raw=value.trim();
 if(Object.prototype.hasOwnProperty.call(target,raw))return target[raw];
 if(isEs&&/^\d+% OFF$/.test(raw))return raw.replace("% OFF"," % de descuento");
 if(isEs&&raw.startsWith("Edit "))return "Editar "+tr(raw.slice(5));
 if(isEs&&raw.startsWith("Add "))return "Agregar "+tr(raw.slice(4));
 if(!isEs&&raw.startsWith("Editar "))return "Edit "+tr(raw.slice(7));
 if(!isEs&&raw.startsWith("Agregar "))return "Add "+tr(raw.slice(8));
 return value;
}
function apply(root=document.body){
 if(!root)return;
 const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
 let node;
 while((node=walker.nextNode())){
  const parent=node.parentElement;
  if(!parent||parent.closest("script,style,svg,noscript"))continue;
  const val=node.nodeValue,word=val.trim();
  if(!word)continue;
  const translated=tr(word);
  if(translated!==word)node.nodeValue=val.replace(word,translated);
 }
 for(const element of root.querySelectorAll("[placeholder],[aria-label],[title]")){
  for(const name of ["placeholder","aria-label","title"]){
   const value=element.getAttribute(name);
   if(!value)continue;
   let translation=tr(value);
   if(isEs&&value.startsWith("Explore ")&&value.endsWith(" owner dashboard"))translation="Explorar el panel del propietario de "+value.slice(8,-16);
   if(isEs&&value.startsWith("Preview ")&&value.includes("; close to return to the gallery"))translation="Vista previa de "+value.slice(8).split(";")[0]+"; cerrar para volver a la galería";
   if(translation!==value)element.setAttribute(name,translation);
  }
 }
}
function languageLink(code){
 const targetUrl=new URL(location.href);
 targetUrl.searchParams.set("lang",code);
 return targetUrl.pathname+targetUrl.search+targetUrl.hash;
}
function init(kind){
 document.documentElement.lang=isEs?"es":"en";
 if(kind==="library")document.title=isEs?"Biblioteca de demos · The Launch Era":"Demo Library · The Launch Era";
 if(kind==="library"&&isEs){
  for(const link of document.querySelectorAll("a.owner-view")){
   const u=new URL(link.getAttribute("href"),location.origin);
   u.searchParams.set("lang","es");link.href=u.pathname+u.search;
  }
  for(const link of document.querySelectorAll("a.wordmark,.closing a,.library-footer-bottom a")){
   if(link.getAttribute("href")==="/")link.href="/es/";
  }
 }
 const host=kind==="library"?document.querySelector(".header-right"):document.querySelector(".top-actions");
 if(host&&!host.querySelector(".tle-demo-lang")){
  const nav=document.createElement("nav");
  nav.className="tle-demo-lang";
  nav.setAttribute("aria-label",isEs?"Idioma":"Language");
  for(const [code,label] of [["es","Español"],["en","English"]]){
   const a=document.createElement("a");
   a.textContent=label;a.href=languageLink(code);
   a.lang=code;
   if(code===(isEs?"es":"en"))a.setAttribute("aria-current","page");
   nav.append(a);
  }
  host.prepend(nav);
 }
 if(!document.getElementById("tle-demo-lang-style")){
  const css=document.createElement("style");css.id="tle-demo-lang-style";
  css.textContent=".tle-demo-lang{display:inline-flex;align-items:center;gap:3px;flex-shrink:0;padding:3px;border:1px solid #D5D1C8;border-radius:99px;background:#FAF8F3}.tle-demo-lang a{font:600 10px/1.3 Prompt,Arial,sans-serif;text-decoration:none;padding:8px 10px;border-radius:99px;color:#4A4844;white-space:nowrap;min-height:34px;display:inline-flex;align-items:center}.tle-demo-lang a[aria-current=page]{background:#191919;color:white}.tle-demo-lang a:focus-visible{outline:2px solid #41779e;outline-offset:2px}@media(max-width:650px){.tle-demo-lang a{padding:8px 7px;font-size:9px}.header-right .header-note,.header-right .header-link{display:none}.top-actions{gap:5px}.top-actions .badge{display:none}.header-right{gap:8px}}";
  document.head.append(css);
 }
 apply(document.body);
 if(typeof MutationObserver!=="undefined"){
  // Dynamic catalog/navigation is recreated by menu edits and brand switches.
  let queued=false;
  const observer=new MutationObserver(()=>{
   if(queued)return;
   queued=true;
   queueMicrotask(()=>{queued=false;apply(document.body)});
  });
  observer.observe(document.body,{childList:true,subtree:true,characterData:true});
 }
}
window.TLELocale={isEs,tr,apply,init,localizeInput:tr};
})();
