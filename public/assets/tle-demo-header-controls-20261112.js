/* TLE demo header refinements. Existing per-brand language/cart logic remains authoritative. */
(() => {
  "use strict";
  const entry = document.currentScript;
  const brand = entry && entry.getAttribute("data-tle-demo-brand");
  if (!brand || !document.body) return;
  document.documentElement.setAttribute("data-tle-demo-brand", brand);

  const common = {
    "Home":"Inicio","Shop":"Comprar","Menu":"Menú","Our Story":"Nuestra historia","Our story":"Nuestra historia",
    "The menu":"El menú","The Menu":"El menú","Our café":"Nuestro café","Our kitchen":"Nuestra cocina",
    "Explore the menu":"Explorar el menú","Explore menu":"Explorar menú","See the menu":"Ver el menú",
    "Explore the Menu":"Explorar el menú","Explore the collection":"Explorar la colección",
    "About":"Nosotros","Services":"Servicios","Book now":"Reservar","Book":"Reservar",
    "Contact Us":"Contáctanos","Contact":"Contacto","Email":"Correo electrónico","Email address":"Correo electrónico",
    "Your name":"Tu nombre","First name":"Nombre","Last name (optional)":"Apellido (opcional)",
    "Full name *":"Nombre completo *","Email address *":"Correo electrónico *",
    "View":"Ver","Back to top":"Volver arriba","BACK TO TOP":"VOLVER ARRIBA","BACK TO THE TOP ↑":"VOLVER ARRIBA ↑",
    "Keep exploring":"Seguir explorando","Get inspired":"Inspírate","All":"Todos",
    "Choose +":"Elegir +","Preview":"Vista previa","Explore":"Explorar",
    "Our world":"Nuestro mundo","Our World":"Nuestro mundo","Our approach":"Nuestra filosofía",
    "Our Process":"Nuestro proceso","Flavors":"Sabores","The experience":"La experiencia",
    "Gifts":"Regalos","Explore the menu.":"Explora el menú.","Explore our cakes":"Explorar nuestros pasteles"
  };
  const labels = {
    "aftr":{
      "THE NIGHT STARTS HERE.":"LA NOCHE EMPIEZA AQUÍ.","YES, I'M 21+":"SÍ, TENGO 21+","NOT YET":"TODAVÍA NO",
      "TONIGHT":"ESTA NOCHE","LINEUP":"CARTELERA","THE EXPERIENCE":"LA EXPERIENCIA","OFFERS":"OFERTAS",
      "RESERVE VIP":"RESERVAR VIP","WEEKLY LINEUP":"CARTELERA SEMANAL","SPECIAL OFFERS":"OFERTAS ESPECIALES",
      "JOIN GUEST LIST":"UNIRME A LA LISTA","A HIGHER REALITY AWAITS.":"TE ESPERA OTRA REALIDAD.",
      "EXPLORE EVENTS":"VER EVENTOS","VIP TABLES":"MESAS VIP","WHAT'S ON TONIGHT.":"QUÉ PASA ESTA NOCHE.",
      "EXPLORE TICKETS":"EXPLORAR ENTRADAS","THE LINEUP.":"LA CARTELERA.",
      "THIS IS YOUR AFTR.":"ESTA ES TU NOCHE.","GET ON THE LIST":"ENTRAR EN LA LISTA",
      "GO ALL THE WAY VIP.":"VIVE LA EXPERIENCIA VIP.","REQUEST A VIP TABLE":"SOLICITAR MESA VIP",
      "EXCLUSIVE ACCESS.":"ACCESO EXCLUSIVO.","THE GUEST LIST":"LA LISTA DE INVITADOS",
      "JOIN THE LIST":"UNIRME A LA LISTA","VIEW OFFERS":"VER OFERTAS",
      "TICKETS & EXPERIENCES":"ENTRADAS Y EXPERIENCIAS","EXPLORE ENTRY":"VER ENTRADAS",
      "THE NIGHT IS YOURS.":"LA NOCHE ES TUYA.","RESERVE A TABLE":"RESERVAR MESA",
      "Tonight's Events":"Eventos de hoy","Weekly Lineup":"Cartelera semanal","Special Offers":"Ofertas especiales",
      "Guest List":"Lista de invitados","VIP Reservations":"Reservas VIP",
      "Tickets & Experiences":"Entradas y experiencias"
    },
    "crumb":{
      "Cookies":"Galletas","Gifts":"Regalos","Miami":"Miami","Bag":"Bolsa",
      "What should I bring? Cookies.":"¿Qué llevo? Galletas.","Explore Six Flavors":"Explorar seis sabores",
      "Start with their favorite.":"Empieza con su favorito.","Classic Chocolate Chip":"Clásica con chispas de chocolate",
      "Double Chocolate":"Doble chocolate","Salted Caramel":"Caramelo salado",
      "White Chocolate Raspberry":"Chocolate blanco y frambuesa","Nutty Dream":"Sueño de nueces",
      "Brownie Chip":"Brownie con chispas","Thoughtful, without overthinking it.":"Un detalle bonito, sin complicaciones.",
      "Build Your Gift Box":"Arma tu caja de regalo","Inside CRUMB.":"Dentro de CRUMB.",
      "We're in your area.":"Estamos cerca de ti.","Explore Local Delivery":"Ver entregas locales",
      "It started with a cookie.":"Todo comenzó con una galleta.",
      "Say hello to CRUMB":"Conoce a CRUMB","Next time, bring CRUMB.":"La próxima vez, lleva CRUMB.",
      "Build Your Box":"Arma tu caja","Our Cookies":"Nuestras galletas",
      "Gift Boxes":"Cajas de regalo","Local Delivery":"Entrega local","Our Miami corner":"Nuestro rincón en Miami",
      "View box":"Ver caja","Build your box":"Arma tu caja","Open your box":"Abre tu caja",
      "Gift note Optional":"Nota de regalo (opcional)","Preview my box":"Ver mi caja",
      "A little closer to cookie time.":"Cada vez más cerca de tus galletas.",
      "Explore a Gift Box":"Explorar caja de regalo","Say hello.":"Salúdanos.",
      "What can we help with?":"¿En qué podemos ayudarte?","Our cookies":"Nuestras galletas",
      "Gift boxes":"Cajas de regalo","Local delivery":"Entrega local",
      "Something else":"Otra cosa","Your message":"Tu mensaje","Preview message":"Vista previa del mensaje",
      "Message preview complete.":"Vista previa lista.","Try another message":"Probar otro mensaje",
      "CRUMB on social":"CRUMB en redes","Back to CRUMB":"Volver a CRUMB"
    },
    "ivory-and-bloom":{
      "Our Cakes":"Nuestros pasteles","Our Process":"Nuestro proceso","Request a Cake":"Solicitar un pastel",
      "Contact the Atelier":"Contactar al atelier","Baked for the beautiful beginnings.":"Horneado para los comienzos más bonitos.",
      "Every love story deserves its own cake.":"Cada historia de amor merece su pastel.",
      "Floral Wedding Cakes":"Pasteles florales de boda","Garden & Rustic Cakes":"Pasteles rústicos y de jardín",
      "Dessert Tables":"Mesas de postres","The cake gallery.":"Galería de pasteles.",
      "All designs":"Todos los diseños","Wedding cakes":"Pasteles de boda",
      "Romantic":"Románticos","Modern":"Modernos","Dessert & tasting":"Postres y degustación",
      "Inquire":"Consultar","Inquire about this design":"Consultar este diseño",
      "A cake worth remembering.":"Un pastel inolvidable.","Begin your wedding cake inquiry":"Cuéntanos sobre tu pastel de boda",
      "A beautiful part of the celebration.":"Una parte hermosa de la celebración.",
      "Made slowly. Made with love.":"Hecho con calma. Hecho con amor.",
      "Let's talk about your cake":"Hablemos de tu pastel","Your vision. Our craft.":"Tu visión. Nuestro arte.",
      "Tell us your story":"Cuéntanos tu historia","We get in touch":"Nos pondremos en contacto",
      "Make it yours":"Lo hacemos tuyo",
      "Beautiful on the outside. Better on the inside.":"Hermoso por fuera. Delicioso por dentro.",
      "Classic Vanilla Bean":"Vainilla clásica","Rich Chocolate":"Chocolate intenso",
      "Raspberry & Cream":"Frambuesa y crema","Pistachio Delight":"Delicia de pistacho",
      "Ask about cake tastings":"Pregunta por las degustaciones",
      "Let's make something unforgettable.":"Hagamos algo inolvidable.",
      "Choose your wedding date":"Elige la fecha de tu boda",
      "Wedding date":"Fecha de boda","Event city / venue *":"Ciudad o lugar del evento *",
      "Your inspiration or special requests":"Inspiración o solicitudes especiales",
      "Preview My Inquiry":"Ver mi solicitud","Your inquiry preview is ready":"Tu solicitud está lista",
      "Copy inquiry details":"Copiar detalles","Edit details":"Editar detalles",
      "A few sweet details.":"Unos dulces detalles."
    },
    "nail-room":{
      "The inspo wall":"Muro de inspiración","Our vibe":"Nuestra esencia","Book your nails":"Reserva tus uñas",
      "It's giving nail crush.":"Amor a primera manicura.","Choose your nail look":"Elige tu estilo",
      "Fresh & fearless":"Fresco y sin miedo","Made for you":"Hecho para ti",
      "Pick your pink.":"Elige tu rosa.","Find your next nail crush.":"Encuentra tu próxima manicura favorita.",
      "The French Edit":"Estilo francés","Glossy Gel":"Gel brillante","Nail Art Studio":"Arte en uñas",
      "Builder Gel":"Gel constructor","The inspo wall. ♡":"Muro de inspiración. ♡",
      "Made with care. Worn with confidence.":"Hecho con cariño. Lúcelo con confianza.",
      "Plan your nail date":"Planea tu cita de uñas","Life’s too short for boring nails.":"La vida es corta para uñas aburridas.",
      "Explore the nail looks":"Explorar diseños","Let's make it a date. ♡":"Hagamos una cita. ♡",
      "Find your moment":"Encuentra tu momento","Selected service":"Servicio seleccionado",
      "Change look":"Cambiar diseño","Your nail vision (optional)":"Tu idea de uñas (opcional)",
      "Preview my nail date":"Ver mi cita","Small details. Big energy.":"Pequeños detalles. Gran actitud.",
      "Plan the next nail date":"Planea tu próxima cita","Your nail date":"Tu cita de uñas",
      "This is a preview only.":"Esto es solo una vista previa.",
      "Edit appointment":"Editar cita","Nail Inspiration":"Inspiración de uñas",
      "♡ Save this look":"♡ Guardar este diseño"
    },
    "seasonal-brew":{
      "Our flavors":"Nuestros sabores","Little moments":"Pequeños momentos",
      "A season in every sip.":"Una temporada en cada sorbo.",
      "Discover the flavors":"Descubre los sabores","Step inside":"Entra y conoce",
      "Sugar Cookie Latte":"Latte de galleta de azúcar","Add to bag +":"Añadir a la bolsa +",
      "Gingerbread Latte":"Latte de jengibre","Toasted Marshmallow Latte":"Latte de malvavisco tostado",
      "Snickerdoodle Latte":"Latte Snickerdoodle","Chestnut Praline Latte":"Latte de praliné de castañas",
      "Peppermint Mocha":"Moca de menta","View your bag":"Ver tu bolsa",
      "Coffee tastes better when you slow down.":"El café sabe mejor cuando bajas el ritmo.",
      "Take a little look around":"Descubre nuestro espacio",
      "A little sweetness goes a long way.":"Un poco de dulzura lo cambia todo.",
      "Explore our seasonal favorites":"Descubre los favoritos de temporada",
      "Stay for the feeling.":"Quédate por cómo te hace sentir.",
      "Whatever the season, make it yours.":"Sea cual sea la temporada, hazla tuya.",
      "Find your flavor":"Encuentra tu sabor","Back to flavors":"Volver a sabores"
    },
    "soluna-yoga":{
      "Get early access":"Acceso anticipado","The practice":"La práctica","Memberships":"Membresías",
      "Shop preview":"Vista previa de tienda","JOIN THE EARLY LIST":"ÚNETE A LA LISTA",
      "Join the early list":"Únete a la lista","Yoga that feels like you.":"Yoga que se siente como tú.",
      "View memberships":"Ver membresías","New here? We have something for you.":"¿Primera vez? Tenemos algo para ti.",
      "Join for welcome updates":"Recibe novedades","How does the offer work? +":"¿Cómo funciona la oferta? +",
      "Come for the movement. Stay for how it feels.":"Ven por el movimiento. Quédate por cómo te sientes.",
      "Come as you are.":"Ven tal como eres.","Move with intention.":"Muévete con intención.",
      "Find your people.":"Encuentra tu comunidad.","Every practice begins somewhere.":"Toda práctica empieza en algún lugar.",
      "Explore our practices":"Explora nuestras prácticas",
      "A space to feel at home.":"Un espacio para sentirte en casa.",
      "Find your kind of movement.":"Encuentra tu forma de moverte.",
      "Slow Flow":"Flujo suave","Discover this practice":"Descubre esta práctica",
      "Deep Rest":"Descanso profundo","Morning Ritual":"Ritual de mañana",
      "A little more SOLUNA.":"Un poco más de SOLUNA.",
      "Explore this idea":"Explora esta idea","Made to move":"Hecho para moverte",
      "Explore this look":"Explora este look","Soft essentials":"Esenciales suaves",
      "The studio edit":"Selección del estudio",
      "A membership on your terms.":"Una membresía a tu medida.",
      "Explore Breathe":"Explorar Breathe","Explore Flow":"Explorar Flow","Explore Rise":"Explorar Rise",
      "Be first on the mat.":"Sé de las primeras en llegar al mat.",
      "Join the early list.":"Únete a la lista anticipada.",
      "What sounds good to you?":"¿Qué te interesa?","Opening updates":"Novedades de apertura",
      "Trying my first class":"Probar mi primera clase",
      "Before we open.":"Antes de abrir.","Early list":"Lista anticipada",
      "Your rhythm begins here.":"Tu ritmo comienza aquí.","Not now":"Ahora no"
    },
    "velmora":{
      "Shade Room":"Sala de tonos","Campaign":"Campaña","Red after dark.":"Rojo después del anochecer.",
      "Shop the edit":"Comprar la selección","View the campaign ↓":"Ver la campaña ↓",
      "Your after-dark beauty counter.":"Tu tocador para después del anochecer.",
      "The after-hours lineup.":"La selección nocturna.","Lips":"Labios","Eyes":"Ojos","Face":"Rostro",
      "One shade. After hours.":"Un tono. Después del anochecer.",
      "Shop Ruby 08":"Comprar Ruby 08","See red up close.":"Mira el rojo de cerca.",
      "On lips":"En labios","On skin":"En piel","Explore Ruby 08 +":"Explorar Ruby 08 +",
      "Red in eight frames.":"Rojo en ocho escenas.",
      "A little drama. Delivered.":"Un toque de drama, entregado.",
      "Back to the edit +":"Volver a la selección +"
    },
    "wok-social":{
      "OUR VIBE":"NUESTRA ESENCIA","THE MENU":"EL MENÚ","OUR TABLE":"NUESTRA MESA",
      "WHAT'S COOKING":"QUÉ SE COCINA","GOOD FOOD. LOUD FLAVOR.":"BUENA COMIDA. MUCHO SABOR.",
      "DISCOVER THE MENU":"DESCUBRE EL MENÚ",
      "COME AS YOU ARE. STAY FOR THE VIBE.":"VEN COMO ERES. QUÉDATE POR EL AMBIENTE.",
      "A LITTLE HEAT. A LOT OF HEART.":"UN POCO DE PICANTE. MUCHO CORAZÓN.",
      "MEET THE BOWLS":"CONOCE LOS BOWLS","Choose your craving.":"Elige tu antojo.",
      "ALL DISHES":"TODOS LOS PLATOS","NOODLES":"FIDEOS","HIBACHI GRILL":"PARRILLA HIBACHI",
      "Signature Chili Beef Noodles":"Fideos de res con chile",
      "Slow-Braised Beef Bowl":"Bowl de res cocinada lentamente",
      "Chili Oil Noodles":"Fideos con aceite de chile","Wok-Tossed Noodles":"Fideos al wok",
      "Hibachi Shrimp":"Camarones hibachi","Hibachi Steak":"Filete hibachi",
      "THE MOMENTS BETWEEN BITES.":"LOS MOMENTOS ENTRE BOCADOS.",
      "LESS FORMAL. MORE FLAVOR.":"MENOS FORMAL. MÁS SABOR.",
      "EXPLORE THE MENU":"EXPLORA EL MENÚ",
      "MADE WITH A LITTLE FIRE.":"HECHO CON UN POCO DE FUEGO.",
      "GOOD FOOD. GREAT COMPANY.":"BUENA COMIDA. GRAN COMPAÑÍA.",
      "BACK TO MENU":"VOLVER AL MENÚ"
    },
    "yummm":{
      "Boxes to go":"Cajas para llevar","Menu & sweets":"Menú y dulces",
      "Your coffee break. Made sweeter.":"Tu pausa para el café, más dulce.",
      "Behind the scenes":"Detrás de cámaras",
      "Step up to the counter.":"Acércate al mostrador.",
      "All favorites":"Todos los favoritos","Coffee":"Café","Cookies":"Galletas",
      "Bakery & sweets":"Panadería y dulces",
      "Made with a little more love.":"Hecho con un poco más de amor.",
      "It starts with the dough.":"Todo comienza con la masa.",
      "One sweet scoop at a time.":"Una cucharada dulce a la vez.",
      "Warm from the oven.":"Recién salido del horno.",
      "Ready to make your day.":"Listo para alegrarte el día.",
      "Sweet things come in boxes.":"Las cosas dulces vienen en cajas.",
      "Single treat":"Dulce individual","Cookie box":"Caja de galletas",
      "Gift assortment":"Surtido para regalar","Make a sample box":"Armar caja de muestra",
      "Meet the YUMMM world.":"Conoce el mundo YUMMM.",
      "Life's better with a little YUMMM.":"La vida sabe mejor con un poco de YUMMM.",
      "Find your next favorite":"Encuentra tu próximo favorito",
      "Your YUMMM box.":"Tu caja YUMMM.","Pick your favorites":"Elige tus favoritos",
      "Your picks":"Tus elecciones","Just for me":"Solo para mí",
      "Box of 4":"Caja de 4","Box of 6":"Caja de 6",
      "Gift box":"Caja de regalo","Preview my box":"Ver mi caja",
      "Your box is looking YUMMM.":"Tu caja se ve deliciosa."
    }
  };
  const dictionary = Object.assign({}, common, labels[brand] || {});
  const tracked = new WeakMap();
  const attributes = new WeakMap();
  let active = "en";
  try { active = localStorage.getItem("tle-demo-locale-" + brand) === "es" ? "es" : "en"; } catch (_) {}

  function translateText(node) {
    const parent = node.parentElement;
    if (!parent || parent.closest("script,style,noscript,svg,code,pre,textarea,[contenteditable],.tle-demo-lang-control")) return;
    let record = tracked.get(node);
    if (!record || (node.nodeValue !== record.rendered && node.nodeValue !== record.original)) {
      record = { original: node.nodeValue, rendered: node.nodeValue };
      tracked.set(node, record);
    }
    const original = record.original;
    const key = original.trim().replace(/\s+/g, " ");
    const translation = dictionary[key];
    const next = active === "es" && translation
      ? original.slice(0, original.indexOf(original.trim())) + translation + (original.match(/\s*$/) || [""])[0]
      : original;
    if (node.nodeValue !== next) node.nodeValue = next;
    record.rendered = next;
  }
  function translateAttrs(element) {
    if (element.closest(".tle-demo-lang-control")) return;
    for (const name of ["placeholder", "aria-label", "title"]) {
      if (!element.hasAttribute(name)) continue;
      let rec = attributes.get(element);
      if (!rec) { rec = {}; attributes.set(element, rec); }
      const current = element.getAttribute(name);
      if (!rec[name] || (current !== rec[name].rendered && current !== rec[name].original)) {
        rec[name] = { original: current, rendered: current };
      }
      const orig = rec[name].original;
      const next = active === "es" ? dictionary[orig] || orig : orig;
      if (current !== next) element.setAttribute(name, next);
      rec[name].rendered = next;
    }
  }
  function translateTree(root) {
    if (!root || root.nodeType !== 1) return;
    translateAttrs(root);
    root.querySelectorAll("[placeholder],[aria-label],[title]").forEach(translateAttrs);
    const walk = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walk.nextNode())) translateText(node);
  }
  function isLight(color) {
    const parts = String(color).match(/\d+(?:\.\d+)?/g) || [];
    if (parts.length < 3) return false;
    const rgb = parts.slice(0, 3).map(Number);
    return (rgb[0]*299 + rgb[1]*587 + rgb[2]*114)/1000 > 150;
  }
  function setLocale(locale) {
    active = locale;
    try { localStorage.setItem("tle-demo-locale-" + brand, active); } catch (_) {}
    document.documentElement.lang = active;
    document.querySelectorAll(".tle-demo-lang-control").forEach(control => {
      control.classList.toggle("is-es", active === "es");
      control.querySelectorAll("button[data-tle-lang]").forEach(button => {
        button.setAttribute("aria-pressed", String(button.dataset.tleLang === active));
      });
    });
    translateTree(document.body);
  }
  const css = String.raw`
    .tle-demo-compact-header :is(a,button):is(.header-cta,.nav-cta,.head-btn,.btn-header,.contact,.header-c){
      font-size:clamp(10px,0.76vw,12px)!important;
      padding:8px 12px!important;
      min-height:38px;
      line-height:1.25!important;
      letter-spacing:.045em;
    }
    .tle-demo-compact-header :is(.language,.lang-btn,.language-btn,#language,#lang,#langToggle,#languageBtn){
      font-size:11px!important;padding:7px 10px!important;min-width:36px;
    }
    .tle-demo-compact-header :is(.language-toggle,.language-switch,.lang-switch,.cb-language-selector){
      transform:scale(.94);transform-origin:center;
    }
    .tle-demo-lang-control{
      --tle-demo-ink:#191919;--tle-demo-contrast:#fff;
      display:inline-grid;grid-template-columns:repeat(2,minmax(0,1fr));align-items:center;
      position:relative;isolation:isolate;width:84px;height:36px;flex:0 0 auto;
      border:1px solid currentColor;border-radius:999px;padding:2px;
      background:transparent;color:inherit;font-family:inherit;box-sizing:border-box;
    }
    .tle-demo-lang-control::before{
      content:"";position:absolute;z-index:-1;left:2px;top:2px;
      width:calc(50% - 2px);height:calc(100% - 4px);
      border-radius:999px;background:var(--tle-demo-ink);transform:translateX(0);
      transition:transform .32s cubic-bezier(.18,1.5,.36,1);
    }
    .tle-demo-lang-control.is-es::before{transform:translateX(100%)}
    .tle-demo-lang-control button{
      position:relative;appearance:none;border:0!important;background:transparent!important;
      color:inherit!important;font-size:10px!important;font-weight:600!important;font-family:inherit!important;line-height:1!important;letter-spacing:.03em;
      padding:0!important;margin:0!important;min-width:0!important;min-height:30px!important;
      cursor:pointer;outline-offset:3px;z-index:1;box-shadow:none!important;
    }
    .tle-demo-lang-control button[aria-pressed="true"]{color:var(--tle-demo-contrast)!important}
    .tle-demo-lang-control button:focus-visible{outline:2px solid currentColor}
    @media(max-width:600px){
      .tle-demo-compact-header :is(a,button):is(.header-cta,.nav-cta,.head-btn,.btn-header,.contact,.header-c){
        padding:7px 8px!important;font-size:10px!important;min-height:44px;
      }
      .tle-demo-compact-header :is(.header-inner,.nav-inner,.nav-actions,.header-actions,.head-actions,.header-tools,.tools,.inner){
        column-gap:6px!important;
      }
      .tle-demo-lang-control{width:78px;height:44px}
      .tle-demo-lang-control button{min-height:38px!important}
    }
    @media(max-width:480px){
      html[data-tle-demo-brand="havana-19"] .tle-demo-compact-header .logo{font-size:28px;letter-spacing:.07em;white-space:nowrap}
      html[data-tle-demo-brand="havana-19"] .tle-demo-compact-header .head-actions{gap:3px!important}
      html[data-tle-demo-brand="ivory-and-bloom"] .tle-demo-compact-header .header-inner{gap:2px!important;min-width:0!important}
      html[data-tle-demo-brand="ivory-and-bloom"] .tle-demo-compact-header .logo{font-size:13px;letter-spacing:.035em}
      html[data-tle-demo-brand="ivory-and-bloom"] .tle-demo-compact-header .header-cta{
        width:64px;min-width:64px;max-width:64px;margin-left:auto!important;
        padding:4px!important;font-size:0!important;flex:0 0 64px;
      }
      html[data-tle-demo-brand="ivory-and-bloom"] .tle-demo-compact-header .header-cta::after{
        content:"Inquire";font-size:10px;font-weight:600;line-height:1.2;letter-spacing:.01em;
      }
      html[lang="es"][data-tle-demo-brand="ivory-and-bloom"] .tle-demo-compact-header .header-cta::after{content:"Consultar"}
    }
    @media(prefers-reduced-motion:reduce){
      .tle-demo-lang-control::before{transition:none}
    }
  `;
  const style = document.createElement("style");
  style.id = "tle-demo-header-controls-style";
  style.textContent = css;
  document.head.appendChild(style);
  const nativeLocaleSelector = ".cb-language-selector,.lang-switch,.language-toggle,.language-switch,.language-btn,#languageBtn,button[data-language],button[data-lang],#language,#lang,#langToggle,.lang-btn,.language";
  let header = null;
  function enhanceHeader() {
    const next = document.querySelector("body header");
    if (!next) return;
    header = next;
    header.classList.add("tle-demo-compact-header");
    if (header.querySelector(nativeLocaleSelector) || header.querySelector(".tle-demo-lang-control")) return;
    const container = header.querySelector(".nav-actions,.header-actions,.head-actions,.header-tools,.tools,.actions,.header-inner,.nav-inner,.inner") || header;
    const toggle = document.createElement("div");
    toggle.className = "tle-demo-lang-control";
    toggle.setAttribute("role", "group");
    toggle.setAttribute("aria-label", "Language / Idioma");
    toggle.innerHTML = '<button type="button" data-tle-lang="en" aria-pressed="true">EN</button><button type="button" data-tle-lang="es" aria-pressed="false">ES</button>';
    const color = getComputedStyle(header).color;
    toggle.style.setProperty("--tle-demo-ink", color);
    toggle.style.setProperty("--tle-demo-contrast", isLight(color) ? "#191919" : "#fff");
    toggle.addEventListener("click", event => {
      const button = event.target.closest("button[data-tle-lang]");
      if (button) setLocale(button.dataset.tleLang);
    });
    const target = [...container.children].find(element =>
      element.matches(".header-cta,.nav-cta,.head-btn,.btn-header,.header-bag,.menu-toggle,.menu-btn,.pill,.contact,.header-c")
    );
    if (target) container.insertBefore(toggle, target);
    else container.appendChild(toggle);
    toggle.classList.toggle("is-es", active === "es");
    toggle.querySelectorAll("button").forEach(button => {
      button.setAttribute("aria-pressed", String(button.dataset.tleLang === active));
    });
    document.documentElement.lang = active;
    translateTree(document.body);
  }
  enhanceHeader();
  let queued = false;
  const observer = new MutationObserver(records => {
    if (queued) return;
    const added = records.flatMap(record => [...record.addedNodes]).filter(node => node.nodeType === 1);
    if (!added.length) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      enhanceHeader();
      if (active === "es" && !(header && header.querySelector(nativeLocaleSelector))) {
        added.forEach(node => translateTree(node));
      }
    });
  });
  observer.observe(document.body, { childList:true, subtree:true });
})();
