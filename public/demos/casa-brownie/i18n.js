/* Casa Brownie localized interface — visual text only; recipe names and simulated
   order values stay unchanged so demo behavior is identical in both languages. */
(() => {
  'use strict';
  const english = {
  "PROYECTO DE EJEMPLO": "SAMPLE PROJECT",
  "CASA BROWNIE · PROYECTO DE EJEMPLO": "CASA BROWNIE · SAMPLE PROJECT",
  "DEMO EDUCATIVA · SIN PEDIDOS NI PAGOS REALES": "EDUCATIONAL DEMO · NO REAL ORDERS OR PAYMENTS",
  "PEQUEÑOS PLACERES · GRANDES MOMENTOS": "SMALL PLEASURES · BIG MOMENTS",
  "Inicio": "Home",
  "Sabores": "Flavors",
  "Nuestra historia": "Our story",
  "Entrega en Miami": "Miami delivery",
  "Delivery Miami": "Miami delivery",
  "CAJAS DE BROWNIES PARA REGALAR · MIAMI": "BROWNIE GIFT BOXES · MIAMI",
  "¿Qué llevo": "What should I bring",
  "de regalo?": "as a gift?",
  "Para cenas, visitas y pequeños detalles: una caja de seis sabores para compartir y regalar con cariño.": "For dinners, visits, and thoughtful gestures: a box of six flavors, made to share and give with love.",
  "Ver los seis sabores": "Explore all six flavors",
  "DETALLES": "THOUGHTFUL",
  "CON CARIÑO": "GESTURES",
  "PARA": "MADE TO",
  "COMPARTIR": "SHARE",
  "IDEALES": "PERFECT",
  "PARA REGALAR": "FOR GIFTING",
  "MIAMI": "MIAMI",
  "LOCAL": "LOCAL",
  "Un momento": "A moment",
  "para ti.": "for you.",
  "HECHOS PARA COMPARTIR": "MADE FOR SHARING",
  "UN DETALLE PARA ALGUIEN ESPECIAL": "A LITTLE SOMETHING FOR SOMEONE SPECIAL",
  "PEQUEÑOS PLACERES, GRANDES MOMENTOS": "SMALL PLEASURES, BIG MOMENTS",
  "MIAMI · DEMO EDUCATIVA": "MIAMI · EDUCATIONAL DEMO",
  "Un sabor para cada ocasión": "A flavor for every occasion",
  "SEIS SABORES, UNA DECISIÓN MÁS FÁCIL": "SIX FLAVORS, ONE EASY CHOICE",
  "Elegir mi favorito": "Pick my favorite",
  "¿Clásico o algo diferente? Toca un sabor para conocerlo mejor.": "Classic or something different? Tap a flavor to learn more.",
  "El original que nunca falla.": "The timeless original.",
  "Crujiente y delicioso.": "Crunchy and delicious.",
  "Suave, cremoso e irresistible.": "Smooth, creamy, and irresistible.",
  "Un toque frutal que enamora.": "A fruity twist to fall for.",
  "Para amantes de las galletas.": "For cookie lovers.",
  "Una sorpresa para cada ocasión.": "A surprise for every occasion.",
  "Fotografías ilustrativas y sabores de muestra. No representan\n            productos disponibles para comprar.": "Illustrative photographs and sample flavors. These are not products available for purchase.",
  "Fotografías ilustrativas y sabores de muestra. No representan productos disponibles para comprar.": "Illustrative photos and sample flavors. Not available for purchase.",
  "EL DETALLE PERFECTO PARA CADA MOMENTO": "A THOUGHTFUL GIFT FOR EVERY MOMENT",
  "Una forma bonita de decir": "A lovely way to say",
  "pensé en ti.": "I thought of you.",
  "No quieres llegar con las manos vacías, pero tampoco llevar cualquier cosa. Una caja bonita, brownies para compartir y un gesto que dice mucho sin explicarlo.": "You don't want to show up empty-handed, but you don't want to bring just anything. A beautiful box, brownies to share, and a gesture that says it all.",
  "Conoce la idea": "Discover the idea",
  "Brownies para compartir": "Brownies made to share",
  "Regalos con cariño": "Thoughtful gifts",
  "Pequeños momentos": "Little moments",
  "Un detalle especial": "A special treat",
  "Cajas de regalo": "Gift boxes",
  "Hechos para conectar": "Made to bring people together",
  "Chocolate y buenos momentos": "Chocolate and good moments",
  "NUESTRA HISTORIA · UNA IDEA CON SABOR A HOGAR": "OUR STORY · AN IDEA THAT FEELS LIKE HOME",
  "A veces, un brownie dice": "Sometimes, a brownie says",
  "todo.": "everything.",
  "Imagina llegar con una cajita de chocolate a casa de alguien. No hace falta una ocasión especial: solo las ganas de compartir un ratito.": "Imagine showing up at someone's door with a little box of chocolate. No special occasion needed—just a reason to spend time together.",
  "Así nació la idea de Casa Brownie: brownies para regalar, llevar a una visita o disfrutar sin prisa. Una marca de barrio imaginada en Miami, con pequeños gestos como protagonistas.": "That's how Casa Brownie began: brownies to gift, bring along, or enjoy slowly. An imaginary Miami neighborhood brand built around small gestures.",
  "Un detalle pequeño. Un momento grande.": "A little gesture. A big moment.",
  "Historia creada para un proyecto educativo; Casa Brownie no es una tienda real.": "This story was created for an educational project. Casa Brownie is not a real store.",
  "UNA IDEA NACIDA PARA COMPARTIR": "AN IDEA MADE FOR SHARING",
  "Hecho para decir «pensé en ti».": "Made to say “I thought of you.”",
  "EL RINCÓN IMAGINARIO": "OUR IMAGINARY CORNER",
  "123 Calle del Cacao · Miami, FL": "123 Calle del Cacao · Miami, FL",
  "Dirección inventada · no visitable": "Fictional address · not open to visitors",
  "ASÍ SERÍA LA EXPERIENCIA": "HOW THE EXPERIENCE WOULD WORK",
  "De nuestra idea": "From our idea",
  "a tu puerta.": "to your doorstep.",
  "Tres pasos sencillos para imaginar un pedido local, sin compras ni entregas reales.": "Three simple steps to imagine a local order—no real purchases or deliveries.",
  "Elige tu sabor": "Choose your flavor",
  "¿Clásico, nuez o frambuesa? Empieza por tu favorito.": "Classic, walnut, or raspberry? Start with your favorite.",
  "Hazlo tuyo": "Make it your own",
  "Escoge cuántos quieres y si sería un regalo.": "Choose how many you'd like and whether it's a gift.",
  "Visualiza el detalle": "Picture the experience",
  "Mira el resumen y cómo se explicaría la entrega en Miami.": "See the summary and how delivery in Miami would be explained.",
  "Crear mi pedido de prueba": "Try a sample order",
  "ENTREGA LOCAL · MIAMI · DEMO": "LOCAL DELIVERY · MIAMI · DEMO",
  "Un detalle que": "A thoughtful gift that",
  "llega bonito.": "arrives beautifully.",
  "Ya elegiste el detalle. ¿Cómo llegaría? Este ejemplo muestra cómo se explicaría la entrega local en Miami. No hay zonas, tarifas ni fechas confirmadas.": "You've chosen your gift. How would it arrive? This example shows how local Miami delivery might be explained. No delivery areas, rates, or dates are confirmed.",
  "Cómo sería la entrega": "How delivery would work",
  "Demostración educativa. No hay repartos ni tienda física.": "Educational demo. No actual deliveries or physical store.",
  "¿Ya tienes un favorito?": "Have a favorite yet?",
  "Haz la prueba.": "Give it a try.",
  "Probar la experiencia": "Try the experience",
  "DEMO EDUCATIVA · MIAMI": "EDUCATIONAL DEMO · MIAMI",
  "Avisos de la demo": "Demo notices",
  "EN NUESTRAS REDES · EJEMPLOS": "OUR SOCIALS · SAMPLE PROFILES",
  "¿QUIERES ESCRIBIRNOS?": "WANT TO REACH OUT?",
  "Contáctanos": "Contact us",
  "Formulario interactivo de prueba; no se envían mensajes.": "Interactive sample form; messages are not sent.",
  "123 Calle del Cacao · Miami, Florida · dirección ficticia, no visitar.\n          Marca, cuentas sociales y productos de demostración. No existen pedidos, pagos ni entregas reales.": "123 Calle del Cacao · Miami, Florida · fictional address, not open to visitors. Sample brand, social accounts, and products. No real orders, payments, or deliveries.",
  "123 Calle del Cacao · Miami, Florida · dirección ficticia, no visitar. Marca, cuentas sociales y productos de demostración. No existen pedidos, pagos ni entregas reales.": "123 Calle del Cacao · Miami, Florida · fictional address, not open to visitors. Sample brand, social accounts, and products. No real orders, payments, or deliveries.",
  "Privacidad": "Privacy",
  "Términos de uso": "Terms of use",
  "Aviso legal": "Legal notice",
  "© 2026 The Launch Era. Todos los derechos reservados.": "© 2026 The Launch Era. All rights reserved.",
  "Casa Brownie es una marca ficticia creada para fines educativos.": "Casa Brownie is a fictional brand created for educational purposes.",
  "CASA BROWNIE · DEMOSTRACIÓN": "CASA BROWNIE · DEMO",
  "Carrito de muestra: 0 brownies": "Sample cart: 0 brownies",
  "Ver carrito de muestra": "View sample cart",
  "Buscar sabor": "Search flavors",
  "Abrir menú": "Open menu",
  "Cerrar ventana": "Close dialog",
  "Volver arriba, al inicio de Casa Brownie": "Back to the top of Casa Brownie",
  "Volver arriba": "Back to top",
  "Navegación principal": "Main navigation",
  "Información legal de este demo": "Legal information about this demo",
  "Redes sociales ficticias de Casa Brownie": "Casa Brownie fictional social profiles",
  "Ver vista previa ficticia de Instagram": "Preview fictional Instagram profile",
  "Ver vista previa ficticia de TikTok": "Preview fictional TikTok profile",
  "Ver vista previa ficticia de Pinterest": "Preview fictional Pinterest profile",
  "Dos filas animadas con ideas de regalos, momentos compartidos y brownies de Casa Brownie.": "Two animated rows featuring gift ideas, shared moments, and Casa Brownie brownies.",
  "Hecho para compartir. Un detalle para alguien especial. Entrega local de ejemplo en Miami.": "Made for sharing. A thoughtful gift for someone special. Sample local delivery in Miami.",
  "Persona de Casa Brownie presentando brownies artesanales sobre un plato": "Casa Brownie presentation featuring handmade brownies on a plate",
  "Varios brownies de chocolate apilados, con textura cremosa; fotografía ilustrativa": "Stacked chocolate brownies with a fudgy texture; illustrative photo",
  "Caja kraft de Casa Brownie con lazo de satén rosa y etiqueta de agradecimiento": "Casa Brownie kraft gift box with a pink satin ribbon and thank-you tag",
  "Caja de regalo Casa Brownie y brownies de chocolate": "Casa Brownie gift box and chocolate brownies",
  "Bolsa de Casa Brownie, cajas de regalo con lazo y brownies de chocolate sobre una mesa cálida": "Casa Brownie bag, ribboned gift boxes and chocolate brownies on a warm-toned table",
  "Una presentación editorial de una caja de brownies para compartir": "Editorial presentation of a brownie box made for sharing",
  "Concepto visual de una caja Casa Brownie preparada para entregar": "Illustration of a Casa Brownie gift box ready for delivery",
  "Brownies de chocolate servidos en plato de cerámica": "Chocolate brownies served on a ceramic plate",
  "Conocer brownie Clásico": "Explore brownie Clásico",
  "Conocer brownie Chocolate con nuez": "Explore brownie Chocolate con nuez",
  "Conocer brownie Dulce de leche": "Explore brownie Dulce de leche",
  "Conocer brownie Frambuesa": "Explore brownie Frambuesa",
  "Conocer brownie Oreo": "Explore brownie Oreo",
  "Conocer brownie Edición especial": "Explore brownie Edición especial",
  "Fotografía ilustrativa de brownie Clásico": "Illustrative photo of brownie Clásico",
  "Fotografía ilustrativa de brownie Chocolate con nuez": "Illustrative photo of brownie Chocolate con nuez",
  "Fotografía ilustrativa de brownie Dulce de leche": "Illustrative photo of brownie Dulce de leche",
  "Fotografía ilustrativa de brownie Frambuesa": "Illustrative photo of brownie Frambuesa",
  "Fotografía ilustrativa de brownie Oreo": "Illustrative photo of brownie Oreo",
  "Fotografía ilustrativa de brownie Edición especial": "Illustrative photo of brownie Edición especial",
  "Chocolate protagonista, centro suave y una capa ligeramente crujiente. Una idea de sabor para la demostración.": "Rich chocolate, a soft center, and a slightly crisp top. A flavor concept for this demo.",
  "La intensidad del chocolate con el contraste de trozos de nuez. Concepto de receta, no una lista de ingredientes confirmada.": "Rich chocolate meets crunchy walnut pieces. Recipe concept only; ingredients are not confirmed.",
  "Un remolino dulce que crea un contraste con el cacao. Variedad ilustrativa para el ejercicio.": "A sweet swirl that contrasts with the cocoa. An illustrative flavor for this exercise.",
  "Chocolate intenso acompañado de una nota frutal. Combinación propuesta para mostrar un catálogo.": "Intense chocolate with a fruity note. A sample combination used to showcase the catalog.",
  "Un acabado cremoso con galleta de chocolate. Esta demostración no representa una receta ni un producto a la venta.": "Creamy chocolate-cookie topping. This demo is not a recipe or a product for sale.",
  "Un sabor de temporada imaginario para demostrar que el catálogo puede crecer sin rehacer la web.": "An imaginary seasonal flavor showing how a catalog can grow without rebuilding the site.",
  "Este carrito es una demostración de la clase. No hay precios, pedidos ni pagos reales.": "This cart is part of a class demonstration. There are no real prices, orders, or payments.",
  "Tu carrito de muestra está vacío. Explora los sabores y añade tu favorito.": "Your sample cart is empty. Explore the flavors and add your favorite.",
  "Explorar sabores": "Browse flavors",
  "Sabor ilustrativo · sin precio": "Sample flavor · no price",
  "Continuar la demostración": "Continue the demo",
  "Tu carrito de muestra": "Your sample cart",
  "CASA BROWNIE · SIN COMPRAS REALES": "CASA BROWNIE · NO REAL PURCHASES",
  "Este brownie pertenece a una demostración educativa; no está disponible para comprar.": "This brownie is part of an educational demo; it is not available to purchase.",
  "Añadir al carrito de muestra": "Add to sample cart",
  "Ver experiencia de pedido": "View sample order",
  "NUESTROS BROWNIES · SABOR DE EJEMPLO": "OUR BROWNIES · SAMPLE FLAVOR",
  "¿Cuál se te antoja? Toca una fotografía para elegir tu brownie.": "Which one looks good? Tap a photo to choose your brownie.",
  "Elegir un sabor": "Choose a flavor",
  "Elegiste:": "You chose:",
  "Continuar · Personalizar": "Continue · Customize",
  "TU ELECCIÓN": "YOUR CHOICE",
  "¿Cuántos brownies?": "How many brownies?",
  "Reducir cantidad": "Decrease quantity",
  "Aumentar cantidad": "Increase quantity",
  "¿Cómo lo presentarías?": "How would you package it?",
  "Caja sencilla": "Simple box",
  "Para regalo": "As a gift",
  "¿Para qué ocasión?": "What's the occasion?",
  "Para compartir": "To share",
  "Para mí": "For myself",
  "Para sorprender": "To surprise someone",
  "Volver": "Back",
  "Ver mi resumen": "View my summary",
  "Así se vería el resumen antes de confirmar un pedido en una tienda real.": "This is how a summary might look before placing an order at a real shop.",
  "TU CAJA DE PRUEBA": "YOUR SAMPLE BOX",
  "ENTREGA DE EJEMPLO": "SAMPLE DELIVERY",
  "Zona, disponibilidad, fecha y tarifa sin definir. No solicitamos dirección ni datos de pago.": "Delivery area, availability, date, and cost are not defined. We do not ask for your address or payment details.",
  "Esto es una simulación visual. No existe un precio ni se procesa un pedido.": "This is a visual simulation. No pricing or orders are processed.",
  "Editar selección": "Edit selection",
  "Finalizar la prueba": "Finish the demo",
  "¡Así podría verse tu pedido!": "Here's how your order might look!",
  "Demo completada. No se creó ningún pedido, no se enviaron datos y no se realizó ningún cobro.": "Demo complete. No order was created, no data was sent, and no payment was charged.",
  "Probar otra combinación": "Try another combination",
  "Seguir viendo sabores": "Keep exploring flavors",
  "Prepara tu caja de brownies": "Build your brownie box",
  "EXPERIENCIA INTERACTIVA · SIN COMPRAS": "INTERACTIVE EXPERIENCE · NO PURCHASES",
  "Territorio elegido para el ejercicio: ciudad de Miami, Florida. No hay envíos nacionales ni entregas reales en este ejemplo.": "Sample service area: Miami, Florida. No nationwide shipping or real deliveries are offered here.",
  "Zonas exactas, códigos postales, horarios, costo de delivery y fechas disponibles: PENDIENTES DE DEFINIR.": "Exact areas, ZIP codes, hours, delivery cost, and available dates: NOT DEFINED.",
  "Información de entrega pendiente": "Delivery details not defined",
  "En una web comercial estos datos deben verificarse antes de permitir que una persona realice un pedido.": "On a real commercial site, these details must be confirmed before accepting orders.",
  "Entendido": "Got it",
  "Entrega local en Miami": "Local delivery in Miami",
  "CÓMO FUNCIONARÍA LA ENTREGA": "HOW DELIVERY WOULD WORK",
  "La idea nació de un momento sencillo: imaginar una caja de brownies hecha para decir «pensé en ti» cuando no encontramos las palabras.": "It started with a simple idea: a brownie box that says “I thought of you” when words aren't enough.",
  "Imaginamos una tienda de barrio con olor a chocolate, cajas listas para regalar y pequeñas excusas para reunirse sin prisa.": "We imagined a neighborhood shop that smells like chocolate, gift boxes ready to go, and little reasons to get together.",
  "Casa Brownie y su dirección en Miami forman parte de un proyecto ficticio. No existe una tienda abierta.": "Casa Brownie and its Miami address are fictional. No physical store is open.",
  "Seguir explorando": "Keep exploring",
  "La historia de Casa Brownie": "The Casa Brownie story",
  "NUESTRA HISTORIA · DEMO": "OUR STORY · DEMO",
  "Fotos del obrador": "Behind-the-scenes photos",
  "Ideas para regalar": "Gift ideas",
  "Detrás de una caja": "Behind a brownie box",
  "Brownies recién cortados": "Freshly sliced brownies",
  "Así armamos una caja": "How we put a box together",
  "Momentos para compartir": "Moments worth sharing",
  "Mesas dulces": "Dessert tables",
  "Empaques con encanto": "Charming packaging",
  "Ideas para celebrar": "Ideas for celebrating",
  "Vista previa educativa. No se abre ninguna cuenta ni plataforma externa.": "Educational preview only. No external profile or platform will open.",
  "Cerrar": "Close",
  "REDES SOCIALES · EJEMPLO": "SOCIAL MEDIA · SAMPLE",
  "Prueba cómo funcionaría el contacto de una tienda. Usa solo datos inventados: nada de lo que escribas se envía ni se guarda.": "Try a sample store contact form. Use fake information only: nothing you enter is sent or saved.",
  "Nombre de ejemplo": "Sample name",
  "Ana de prueba": "Sample Ana",
  "Correo de ejemplo": "Sample email",
  "ana@ejemplo.test": "ana@example.test",
  "¿Qué quisieras preguntar?": "What would you like to ask?",
  "Quisiera conocer los sabores de muestra...": "I'd love to learn more about the sample flavors...",
  "Simular mensaje": "Simulate message",
  "Tu simulación se completó. El mensaje no se envió ni quedó guardado.": "Your simulation is complete. The message wasn't sent or stored.",
  "En una tienda real, este paso necesitaría un correo o servicio de contacto verificado.": "A real store would need a verified email or contact service for this step.",
  "Volver a la tienda": "Back to the store",
  "CONTACTO · SOLO DEMOSTRACIÓN": "CONTACT · DEMO ONLY",
  "Privacidad · demo": "Privacy · demo",
  "Términos de uso · demo": "Terms of use · demo",
  "Aviso legal · demo": "Legal notice · demo",
  "El formulario de contacto es una simulación: lo escrito no se envía ni se guarda desde esta web. Utiliza únicamente datos ficticios.": "The contact form is a simulation: your input is not sent or saved by this site. Use fictional details only.",
  "Casa Brownie no tiene registro de usuarios, pagos ni cuentas de cliente. El proveedor que aloja una página web puede procesar información técnica de acceso conforme a sus propias políticas.": "Casa Brownie has no user registration, payment system, or customer accounts. A web-hosting provider may process technical access data under its own policies.",
  "Puedes explorar los sabores, abrir una caja de muestra y simular un mensaje. Ninguna de estas acciones constituye una compra, reserva o contrato.": "You can explore flavors, open a sample box, and simulate a message. None of these actions constitutes a purchase, booking, or contract.",
  "Los precios, productos, entregas y perfiles sociales que aparecen son elementos ilustrativos de una clase. No hay pedidos ni servicios reales.": "Prices, products, delivery details, and social profiles are classroom examples. There are no real orders or services.",
  "Casa Brownie es una marca ficticia y su ubicación en Miami es inventada. No existe una tienda física que visitar ni una empresa de alimentos atendiendo pedidos.": "Casa Brownie is a fictional brand with an invented Miami location. There is no physical store to visit or food business fulfilling orders.",
  "Concepto digital educativo creado por The Launch Era. Este ejemplo no reemplaza los avisos legales, de privacidad, alérgenos o comercio que requeriría una tienda real.": "Educational digital concept created by The Launch Era. It does not replace the legal, privacy, allergen, or commercial notices a real shop would need.",
  "No envíes datos reales ni intentes realizar pagos en esta demostración.": "Do not share real personal information or attempt payments in this demo.",
  "INFORMACIÓN EDUCATIVA": "EDUCATIONAL INFORMATION",
  "Esta web es un proyecto de demostración. Sus fotografías ilustran un concepto de producto. No se venden brownies ni se ofrecen entregas.": "This website is an educational demo. Its images illustrate a product concept. No brownies are sold and no deliveries are offered.",
  "El formulario de contacto es una simulación local: no envía ni guarda lo escrito. No hay cuentas sociales reales, carrito de compra real, analítica personalizada ni cobros. Antes de convertirla en negocio harían falta datos verificables, privacidad, información de alimentos y alérgenos, términos de venta y políticas de entrega adecuadas.": "The contact form is a local simulation: it does not send or save input. There are no real social profiles, checkout, personalized analytics, or charges. A real business would need verified business information, privacy notices, food and allergen details, sales terms, and delivery policies.",
  "No compartas información privada ni intentes pagar en esta demostración.": "Do not share private information or attempt payment in this demo.",
  "Información legal de la demostración": "Demo legal information",
  "PIE DE PÁGINA": "FOOTER",
  "Elige un sabor para abrir su ficha de demostración.": "Choose a flavor to open its sample details.",
  "Fotografía ilustrativa del brownie": "Illustrative brownie photo",
  "Quitar un brownie": "Remove one brownie",
  "Añadir otro brownie": "Add another brownie"
};
  const savedTexts = new WeakMap();
  const savedAttrs = new WeakMap();
  const watchedAttrs = ['aria-label','title','alt','placeholder','content'];
  const clean = s => String(s || '').replace(/\s+/g,' ').trim();

  function translate(input) {
    const original = clean(input);
    if (Object.hasOwn(english, original)) return english[original];
    let value = original;
    // Dynamic quantities and flavor names are translated without changing values/IDs.
    value = value.replace(/^Carrito de muestra: (\d+) brownies$/, 'Sample cart: $1 brownies')
      .replace(/^Ver carrito de muestra \((\d+)\)$/, 'View sample cart ($1)')
      .replace(/^(.+) añadido al carrito de muestra\.$/, '$1 added to the sample cart.')
      .replace(/^(\d+) brownies? en el carrito de muestra\.$/, '$1 brownies in your sample cart.')
      .replace(/^(\d+) unidades$/, '$1 items')
      .replace(/^Quitar un brownie (.+)$/, 'Remove one $1 brownie')
      .replace(/^Añadir otro brownie (.+)$/, 'Add another $1 brownie')
      .replace(/^Fotografía ilustrativa del brownie (.+)$/, 'Illustrative photo of $1 brownie')
      .replace(/^Paso (\d+) de 3$/, 'Step $1 of 3')
      .replace(/^PASO (\d+) DE 3 · SOLO UNA PRUEBA$/, 'STEP $1 OF 3 · DEMO ONLY')
      .replace(/^(\d+) brownies? en el carrito de muestra\.$/, '$1 brownies in your sample cart.')
      .replace(/^Tu combinación: (.*)\.$/, 'Your combination: $1.')
      .replace(/^(\d+) brownies? · (.+)$/, (_, n, pkg) => n+' brownies · '+(english[pkg]||pkg))
      .replace(/^Así podría presentarse la cuenta de Casa Brownie en (.+)\. Son ideas de contenido, no un perfil real\.$/, 'Here is how Casa Brownie could look on $1. These are content ideas, not a real account.')
      .replace(/^(.+) · inspiración$/, '$1 · inspiration');
    // Dynamic copy may embed Spanish option labels; translate just those phrases.
    for (const key of ['Caja sencilla','Para regalo','Para compartir','Para mí','Para sorprender']) {
      value = value.replaceAll(key, english[key]);
    }
    return value;
  }
  let locale = new URLSearchParams(location.search).get('lang') === 'en' ? 'en' : 'es';
  function applyNode(node) {
    if (!node || node.nodeType !== Node.TEXT_NODE || node.parentElement?.closest('script,style,svg,[data-lang-option]')) return;
    const current = node.nodeValue;
    if (!clean(current)) return;
    if (!savedTexts.has(node)) savedTexts.set(node, current);
    const spanish = savedTexts.get(node);
    const next = locale === 'en' ? translate(spanish) : spanish;
    if (clean(next) !== clean(current)) node.nodeValue = next;
  }
  function applyAttributes(element) {
    if (!(element instanceof Element) || element.matches('[data-lang-option]')) return;
    let original = savedAttrs.get(element);
    if (!original) { original = {}; savedAttrs.set(element, original); }
    for (const attr of watchedAttrs) {
      if (!element.hasAttribute(attr)) continue;
      if (!(attr in original)) original[attr] = element.getAttribute(attr);
      const next = locale === 'en' ? translate(original[attr]) : original[attr];
      if (element.getAttribute(attr) !== next) element.setAttribute(attr, next);
    }
  }
  function applyTree(root) {
    if (root.nodeType === Node.TEXT_NODE) { applyNode(root); return; }
    if (!(root instanceof Element)) return;
    applyAttributes(root);
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) applyNode(walker.currentNode);
    root.querySelectorAll('*').forEach(applyAttributes);
  }
  let translating = false;
  function render() {
    if (translating) return;
    translating = true;
    document.documentElement.lang = locale;
    document.title = locale === 'en' ? 'Casa Brownie · Small Pleasures, Big Moments · Demo' : 'Casa Brownie · Pequeños placeres, grandes momentos · Demo';
    const description = document.querySelector('meta[name="description"]');
    if (description) description.content = locale === 'en'
      ? 'Casa Brownie, an educational sample brownie website with fictional local delivery in Miami. No real orders or payments.'
      : 'Casa Brownie, demostración educativa de una web editorial de brownies con entrega local ficticia en Miami. Sin pedidos ni pagos reales.';
    applyTree(document.body);
    document.querySelectorAll('[data-lang-option]').forEach(btn => {
      btn.setAttribute('aria-pressed', String(btn.dataset.langOption === locale));
      btn.classList.toggle('is-current', btn.dataset.langOption === locale);
    });
    translating = false;
  }
  function switchLocale(next) {
    if (next !== 'en' && next !== 'es') return;
    locale = next;
    const url = new URL(location.href);
    if (next === 'en') url.searchParams.set('lang','en');
    else url.searchParams.delete('lang');
    history.replaceState(history.state,'',url);
    render();
  }
  const boot = () => {
    document.querySelectorAll('[data-lang-option]').forEach(button => {
      button.addEventListener('click', () => switchLocale(button.dataset.langOption));
    });
    render();
    const observer = new MutationObserver(records => {
      if (translating) return;
      let changed = false;
      for (const record of records) {
        if (record.type === 'childList' && record.addedNodes.length) {
          for (const node of record.addedNodes) applyTree(node);
          changed = true;
        } else if (record.type === 'attributes' && watchedAttrs.includes(record.attributeName)) {
          const target = record.target;
          const previous = savedAttrs.get(target);
          if (previous && target.getAttribute(record.attributeName) !== translate(previous[record.attributeName] || '')) {
            previous[record.attributeName] = target.getAttribute(record.attributeName);
          }
          applyAttributes(target);
        }
      }
      if (changed) document.querySelectorAll('[data-lang-option]').forEach(btn => {
        btn.setAttribute('aria-pressed', String(btn.dataset.langOption === locale));
      });
    });
    observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:watchedAttrs});
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
