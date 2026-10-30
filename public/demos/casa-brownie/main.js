
/** Hero de video silencioso: el poster original siempre queda debajo del video. */
const heroVideo = document.getElementById('hero-video');
if (heroVideo) {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const classWithoutVideo = document.documentElement.dataset.claseEtapa === 'sin-video';
  const dataSaving = navigator.connection?.saveData;
  if (classWithoutVideo || reduceMotion || dataSaving) {
    heroVideo.pause();
    heroVideo.removeAttribute('autoplay');
    heroVideo.querySelector('source')?.remove();
    heroVideo.load();
  } else {
    heroVideo.addEventListener('loadeddata', () => heroVideo.classList.add('is-ready'), { once: true });
    heroVideo.addEventListener('error', () => heroVideo.classList.remove('is-ready'));
    if (heroVideo.readyState >= 2) heroVideo.classList.add('is-ready');
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        heroVideo.play().catch(() => heroVideo.classList.remove('is-ready'));
      } else {
        heroVideo.pause();
      }
    }, { threshold: 0.01 });
    observer.observe(heroVideo);
  }
}
// El orden editorial es el orden del HTML: producto, ocasión, entrega, decisión.
// No reordenar secciones después de renderizar: evita saltos visuales en móvil.


const catalog = [
  {
    id: 'clasico',
    name: 'Clásico',
    subtitle: 'El original que nunca falla.',
    mark: '▦',
    color: '#6a3f2b',
    image:
      './assets/sabor-clasico.webp?v=aprobado-20261029',
    detail:
      'Chocolate protagonista, centro suave y una capa ligeramente crujiente. Una idea de sabor para la demostración.',
  },
  {
    id: 'nuez',
    name: 'Chocolate con nuez',
    subtitle: 'Crujiente y delicioso.',
    mark: '♧',
    color: '#815e43',
    image:
      './assets/sabor-nuez.webp?v=aprobado-20261029',
    detail:
      'La intensidad del chocolate con el contraste de trozos de nuez. Concepto de receta, no una lista de ingredientes confirmada.',
  },
  {
    id: 'dulce',
    name: 'Dulce de leche',
    subtitle: 'Suave, cremoso e irresistible.',
    mark: '◉',
    color: '#ba784e',
    image:
      './assets/sabor-dulce-de-leche.webp?v=aprobado-20261029',
    detail:
      'Un remolino dulce que crea un contraste con el cacao. Variedad ilustrativa para el ejercicio.',
  },
  {
    id: 'frambuesa',
    name: 'Frambuesa',
    subtitle: 'Un toque frutal que enamora.',
    mark: '✿',
    color: '#a95566',
    image:
      './assets/sabor-frambuesa.webp?v=aprobado-20261029',
    detail:
      'Chocolate intenso acompañado de una nota frutal. Combinación propuesta para mostrar un catálogo.',
  },
  {
    id: 'oreo',
    name: 'Oreo',
    subtitle: 'Para amantes de las galletas.',
    mark: '◎',
    color: '#493228',
    image:
      './assets/sabor-oreo.webp?v=aprobado-20261029',
    detail:
      'Un acabado cremoso con galleta de chocolate. Esta demostración no representa una receta ni un producto a la venta.',
  },
  {
    id: 'especial',
    name: 'Edición especial',
    subtitle: 'Una sorpresa para cada ocasión.',
    mark: '✧',
    color: '#bc916e',
    image:
      './assets/sabor-especial.webp?v=aprobado-20261029',
    detail:
      'Un sabor de temporada imaginario para demostrar que el catálogo puede crecer sin rehacer la web.',
  },
];
const modalRoot = document.getElementById('modal-root');
const modalBody = document.getElementById('modal-body');
const eyebrow = document.getElementById('modal-eyebrow');
const closeButton = document.getElementById('modal-close');
const menu = document.querySelector('.main-nav');
const menuButton = document.getElementById('menu-button');
const toast = document.getElementById('toast');
const cartButton = document.getElementById('demo-order');
const cartCount = document.getElementById('cart-count');
const demoCart = new Map(); // Solo memoria de la pestaña: sin órdenes ni pagos reales.
let lastFocus = null;
let selectedFlavor = 'clasico';
let toastTimer = null;

function notify(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3400);
}
function openModal(title, content, label = 'CASA BROWNIE · DEMOSTRACIÓN') {
  lastFocus = document.activeElement;
  eyebrow.textContent = label;
  modalBody.replaceChildren();
  const heading = document.createElement('h2');
  heading.id = 'modal-title';
  heading.textContent = title;
  modalBody.append(heading);
  if (typeof content === 'string') {
    const paragraph = document.createElement('p');
    paragraph.textContent = content;
    modalBody.append(paragraph);
  } else {
    modalBody.append(content);
  }
  modalRoot.hidden = false;
  document.body.style.overflow = 'hidden';
  closeButton.focus();
}
function closeModal() {
  modalRoot.hidden = true;
  document.body.style.overflow = '';
  if (lastFocus instanceof HTMLElement) lastFocus.focus();
}
closeButton.addEventListener('click', closeModal);
modalRoot.addEventListener('click', event => {
  if (event.target.closest('[data-close]')) closeModal();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !modalRoot.hidden) closeModal();
  if (event.key === 'Escape' && menu.classList.contains('open')) {
    menu.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
  }
  if (event.key === 'Tab' && !modalRoot.hidden) {
    const nodes = [
      ...modalRoot.querySelectorAll('button,[href],select,input,textarea'),
    ].filter(n => !n.disabled);
    if (!nodes.length) return;
    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
});
menuButton.addEventListener('click', () => {
  const isOpen = menu.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(isOpen));
});
document.querySelectorAll('.main-nav a').forEach(link =>
  link.addEventListener('click', () => {
    menu.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
  })
);
function addText(parent, tag, value, className) {
  const el = document.createElement(tag);
  el.textContent = value;
  if (className) el.className = className;
  parent.append(el);
  return el;
}
function addButton(parent, title, callback, className = 'modal-primary') {
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = title;
  button.className = className;
  button.addEventListener('click', callback);
  parent.append(button);
  return button;
}

function totalCartItems() {
  return [...demoCart.values()].reduce((sum, quantity) => sum + quantity, 0);
}
function updateCartBadge() {
  const total = totalCartItems();
  cartCount.textContent = total > 99 ? '99+' : String(total);
  cartButton.setAttribute('aria-label', 'Carrito de muestra: ' + total + ' brownies');
  cartButton.title = 'Ver carrito de muestra (' + total + ')';
}
function addToCart(flavorId) {
  const item = catalog.find(flavor => flavor.id === flavorId);
  if (!item) return;
  demoCart.set(flavorId, (demoCart.get(flavorId) || 0) + 1);
  updateCartBadge();
  notify(item.name + ' añadido al carrito de muestra.');
  viewCart();
}
function changeCartQuantity(flavorId, change) {
  const next = (demoCart.get(flavorId) || 0) + change;
  if (next <= 0) demoCart.delete(flavorId);
  else demoCart.set(flavorId, next);
  updateCartBadge();
  viewCart();
}
function viewCart() {
  const wrapper = document.createElement('div');
  const total = totalCartItems();
  addText(wrapper, 'p',
    'Este carrito es una demostración de la clase. No hay precios, pedidos ni pagos reales.',
    'status-box');
  if (total === 0) {
    addText(wrapper, 'p', 'Tu carrito de muestra está vacío. Explora los sabores y añade tu favorito.');
    addButton(wrapper, 'Explorar sabores', () => {
      closeModal();
      document.getElementById('brownies').scrollIntoView({ behavior: 'smooth' });
    });
  } else {
    const lines = document.createElement('div');
    lines.className = 'cart-lines';
    for (const item of catalog) {
      const quantity = demoCart.get(item.id);
      if (!quantity) continue;
      const line = document.createElement('div');
      line.className = 'cart-line';
      const description = document.createElement('div');
      description.className = 'cart-line-details';
      addText(description, 'strong', item.name);
      addText(description, 'small', 'Sabor ilustrativo · sin precio');
      const controls = document.createElement('div');
      controls.className = 'cart-quantity';
      const minus = addButton(controls, '−', () => changeCartQuantity(item.id, -1), 'cart-less');
      minus.setAttribute('aria-label', 'Quitar un brownie ' + item.name);
      const count = addText(controls, 'output', String(quantity));
      count.setAttribute('aria-label', quantity + ' unidades');
      const plus = addButton(controls, '+', () => changeCartQuantity(item.id, 1), 'cart-more');
      plus.setAttribute('aria-label', 'Añadir otro brownie ' + item.name);
      line.append(description, controls);
      lines.append(line);
    }
    wrapper.append(lines);
    addText(wrapper, 'p', total + ' brownie' + (total === 1 ? '' : 's') + ' en el carrito de muestra.');
    addButton(wrapper, 'Continuar la demostración', () => viewExperience(selectedFlavor));
  }
  openModal('Tu carrito de muestra', wrapper, 'CASA BROWNIE · SIN COMPRAS REALES');
}

function viewFlavor(id) {
  const item = catalog.find(f => f.id === id);
  if (!item) return;
  selectedFlavor = item.id;
  const wrapper = document.createElement('div');
  const img = document.createElement('img');
  img.src = item.image;
  img.alt = 'Fotografía ilustrativa del brownie ' + item.name;
  img.className = 'modal-photo';
  img.loading = 'lazy';
  wrapper.append(img);
  addText(wrapper, 'p', item.detail);
  addText(
    wrapper,
    'p',
    'Este brownie pertenece a una demostración educativa; no está disponible para comprar.',
    'status-box'
  );
  addButton(wrapper, 'Añadir al carrito de muestra', () => addToCart(item.id));
  addButton(wrapper, 'Ver experiencia de pedido', () => viewExperience(item.id), 'text-link');
  openModal(item.name, wrapper, 'NUESTROS BROWNIES · SABOR DE EJEMPLO');
}
function viewExperience(startId) {
  if (catalog.some(item => item.id === startId)) selectedFlavor = startId;
  let step = 1;
  let quantity = 1;
  let packaging = 'Caja sencilla';
  let occasion = 'Para compartir';
  const wrapper = document.createElement('div');
  wrapper.className = 'cb-order-flow';

  function renderStep() {
    const item = catalog.find(flavor => flavor.id === selectedFlavor) || catalog[0];
    const progress = step < 4
      ? '<div class="cb-order-progress" aria-label="Paso ' + step + ' de 3">' +
          [1, 2, 3].map(n => '<span class="' + (n <= step ? 'is-active' : '') + '"></span>').join('') +
        '</div><p class="cb-order-step-label">PASO ' + step + ' DE 3 · SOLO UNA PRUEBA</p>'
      : '';
    wrapper.replaceChildren();
    const layout = document.createElement('div');
    layout.innerHTML = progress;

    if (step === 1) {
      layout.innerHTML +=
        '<p class="cb-order-intro">¿Cuál se te antoja? Toca una fotografía para elegir tu brownie.</p>' +
        '<div class="cb-order-flavors" role="group" aria-label="Elegir un sabor">' +
          catalog.map(flavor =>
            '<button type="button" data-action="flavor" data-value="' + flavor.id +
              '" class="cb-order-flavor ' + (flavor.id === selectedFlavor ? 'is-selected' : '') +
              '" aria-pressed="' + (flavor.id === selectedFlavor) + '">' +
              '<img src="' + flavor.image + '" alt="" loading="lazy" />' +
              '<strong>' + flavor.name + '</strong><small>' + flavor.subtitle + '</small>' +
            '</button>'
          ).join('') +
        '</div>' +
        '<div class="cb-order-footer"><span>Elegiste: <strong>' + item.name + '</strong></span>' +
        '<button type="button" class="cb-order-next" data-action="next">Continuar · Personalizar</button></div>';
    } else if (step === 2) {
      layout.innerHTML +=
        '<div class="cb-order-selected"><img src="' + item.image + '" alt="Brownie ' + item.name +
        ' de demostración" /><div><small>TU ELECCIÓN</small><strong>' + item.name + '</strong>' +
        '<span>' + item.subtitle + '</span></div></div>' +
        '<div class="cb-order-setting"><span class="cb-order-label">¿Cuántos brownies?</span>' +
        '<div class="cb-order-counter"><button type="button" data-action="minus" aria-label="Reducir cantidad" ' +
        (quantity === 1 ? 'disabled' : '') + '>−</button><output aria-live="polite">' +
        quantity + '</output><button type="button" data-action="plus" aria-label="Aumentar cantidad" ' +
        (quantity === 12 ? 'disabled' : '') + '>+</button></div></div>' +
        '<fieldset class="cb-order-setting"><legend>¿Cómo lo presentarías?</legend><div class="cb-order-toggle">' +
        ['Caja sencilla', 'Para regalo'].map(value =>
          '<button type="button" data-action="packaging" data-value="' + value +
          '" aria-pressed="' + (value === packaging) + '" class="' + (value === packaging ? 'is-selected' : '') +
          '">' + value + '</button>'
        ).join('') + '</div></fieldset>' +
        '<fieldset class="cb-order-setting"><legend>¿Para qué ocasión?</legend><div class="cb-order-toggle">' +
        ['Para compartir', 'Para mí', 'Para sorprender'].map(value =>
          '<button type="button" data-action="occasion" data-value="' + value +
          '" aria-pressed="' + (value === occasion) + '" class="' + (value === occasion ? 'is-selected' : '') +
          '">' + value + '</button>'
        ).join('') + '</div></fieldset>' +
        '<div class="cb-order-footer"><button type="button" class="cb-order-back" data-action="back">Volver</button>' +
        '<button type="button" class="cb-order-next" data-action="next">Ver mi resumen</button></div>';
    } else if (step === 3) {
      layout.innerHTML +=
        '<p class="cb-order-intro">Así se vería el resumen antes de confirmar un pedido en una tienda real.</p>' +
        '<div class="cb-order-summary"><img src="' + item.image +
        '" alt="Brownie ' + item.name + '" /><div><small>TU CAJA DE PRUEBA</small>' +
        '<h3>' + item.name + '</h3><p>' + quantity + ' brownie' + (quantity === 1 ? '' : 's') +
        ' · ' + packaging + '</p><p>' + occasion + '</p></div></div>' +
        '<div class="cb-order-delivery"><span>ENTREGA DE EJEMPLO</span><strong>Miami, Florida</strong>' +
        '<p>Zona, disponibilidad, fecha y tarifa sin definir. No solicitamos dirección ni datos de pago.</p></div>' +
        '<p class="cb-order-safety">Esto es una simulación visual. No existe un precio ni se procesa un pedido.</p>' +
        '<div class="cb-order-footer"><button type="button" class="cb-order-back" data-action="back">Editar selección</button>' +
        '<button type="button" class="cb-order-next" data-action="next">Finalizar la prueba</button></div>';
    } else {
      layout.innerHTML +=
        '<div class="cb-order-done"><div class="cb-order-done-icon" aria-hidden="true">♡</div>' +
        '<h3>¡Así podría verse tu pedido!</h3>' +
        '<p>Tu combinación: ' + quantity + ' × ' + item.name + ' · ' + packaging + ' · ' + occasion + '.</p>' +
        '<p class="cb-order-safety">Demo completada. No se creó ningún pedido, no se enviaron datos y no se realizó ningún cobro.</p>' +
        '<div class="cb-order-finish"><button type="button" class="cb-order-back" data-action="restart">Probar otra combinación</button>' +
        '<button type="button" class="cb-order-next" data-action="close">Seguir viendo sabores</button></div></div>';
    }
    wrapper.append(layout);
    const dialog = wrapper.closest('.modal');
    if (dialog) dialog.scrollTop = 0;
  }

  wrapper.addEventListener('click', event => {
    const button = event.target.closest('button[data-action]');
    if (!button || !wrapper.contains(button)) return;
    const action = button.dataset.action;
    if (action === 'flavor' && catalog.some(item => item.id === button.dataset.value)) {
      selectedFlavor = button.dataset.value;
    } else if (action === 'minus') quantity = Math.max(1, quantity - 1);
    else if (action === 'plus') quantity = Math.min(12, quantity + 1);
    else if (action === 'packaging' && ['Caja sencilla', 'Para regalo'].includes(button.dataset.value)) packaging = button.dataset.value;
    else if (action === 'occasion' && ['Para compartir', 'Para mí', 'Para sorprender'].includes(button.dataset.value)) occasion = button.dataset.value;
    else if (action === 'next') step = Math.min(4, step + 1);
    else if (action === 'back') step = Math.max(1, step - 1);
    else if (action === 'restart') { step = 1; quantity = 1; packaging = 'Caja sencilla'; occasion = 'Para compartir'; }
    else if (action === 'close') {
      closeModal();
      document.getElementById('brownies').scrollIntoView({ behavior: 'smooth' });
      return;
    }
    renderStep();
    const focusTarget = wrapper.querySelector('button.is-selected, .cb-order-next, button[data-action="restart"]');
    if (focusTarget) focusTarget.focus({ preventScroll: true });
  });

  renderStep();
  openModal('Prepara tu caja de brownies', wrapper, 'EXPERIENCIA INTERACTIVA · SIN COMPRAS');
}

function viewDelivery() {
  const wrapper = document.createElement('div');
  addText(
    wrapper,
    'p',
    'Territorio elegido para el ejercicio: ciudad de Miami, Florida. No hay envíos nacionales ni entregas reales en este ejemplo.'
  );
  const box = addText(
    wrapper,
    'div',
    'Zonas exactas, códigos postales, horarios, costo de delivery y fechas disponibles: PENDIENTES DE DEFINIR.',
    'status-box'
  );
  box.setAttribute('aria-label', 'Información de entrega pendiente');
  addText(
    wrapper,
    'p',
    'En una web comercial estos datos deben verificarse antes de permitir que una persona realice un pedido.'
  );
  addButton(wrapper, 'Entendido', closeModal);
  openModal('Entrega local en Miami', wrapper, 'CÓMO FUNCIONARÍA LA ENTREGA');
}
function viewStory() {
  const wrapper = document.createElement('div');
  addText(wrapper, 'p', 'La idea nació de un momento sencillo: imaginar una caja de brownies hecha para decir «pensé en ti» cuando no encontramos las palabras.');
  addText(wrapper, 'p', 'Imaginamos una tienda de barrio con olor a chocolate, cajas listas para regalar y pequeñas excusas para reunirse sin prisa.');
  addText(wrapper, 'p', 'Casa Brownie y su dirección en Miami forman parte de un proyecto ficticio. No existe una tienda abierta.', 'status-box');
  addButton(wrapper, 'Seguir explorando', closeModal);
  openModal('La historia de Casa Brownie', wrapper, 'NUESTRA HISTORIA · DEMO');
}

function viewSocialDemo(platform) {
  const previews = {
    instagram: ['Fotos del obrador', 'Ideas para regalar', 'Detrás de una caja'],
    tiktok: ['Brownies recién cortados', 'Así armamos una caja', 'Momentos para compartir'],
    pinterest: ['Mesas dulces', 'Empaques con encanto', 'Ideas para celebrar']
  };
  const titles = { instagram:'Instagram', tiktok:'TikTok', pinterest:'Pinterest' };
  if (!Object.hasOwn(previews, platform)) return;
  const wrapper = document.createElement('div');
  addText(wrapper, 'p', 'Así podría presentarse la cuenta de Casa Brownie en '+titles[platform]+'. Son ideas de contenido, no un perfil real.', 'status-box');
  const grid = document.createElement('div');
  grid.className = 'cb-social-preview';
  for (const [index, idea] of previews[platform].entries()) {
    const tile = document.createElement('div');
    tile.className = 'cb-social-preview-tile';
    const number = document.createElement('span');
    number.textContent = String(index+1).padStart(2,'0');
    const title = document.createElement('strong');
    title.textContent = idea;
    tile.append(number,title);
    grid.append(tile);
  }
  wrapper.append(grid);
  addText(wrapper, 'p', 'Vista previa educativa. No se abre ninguna cuenta ni plataforma externa.');
  addButton(wrapper, 'Cerrar', closeModal);
  openModal(titles[platform]+' · inspiración', wrapper, 'REDES SOCIALES · EJEMPLO');
}

function viewContactDemo() {
  const wrapper = document.createElement('div');
  addText(wrapper, 'p', 'Prueba cómo funcionaría el contacto de una tienda. Usa solo datos inventados: nada de lo que escribas se envía ni se guarda.', 'status-box');
  const form = document.createElement('form');
  form.className = 'cb-demo-contact-form';
  form.id = 'cb-demo-contact-form';
  form.setAttribute('autocomplete', 'off');

  function addField(tag, labelText, key, hint, type = 'text') {
    const label = document.createElement('label');
    label.textContent = labelText;
    label.htmlFor = 'cb-contact-' + key;
    const field = document.createElement(tag);
    field.id = 'cb-contact-' + key;
    field.name = key;
    field.placeholder = hint;
    field.required = true;
    field.autocomplete = 'off';
    if (tag === 'input') field.type = type;
    field.maxLength = key === 'mensaje' ? 320 : key === 'email' ? 100 : 60;
    if (tag === 'textarea') field.rows = 4;
    label.append(field);
    form.append(label);
  }
  addField('input','Nombre de ejemplo','nombre','Ana de prueba');
  addField('input','Correo de ejemplo','email','ana@ejemplo.test','email');
  addField('textarea','¿Qué quisieras preguntar?','mensaje','Quisiera conocer los sabores de muestra...');

  const submit = document.createElement('button');
  submit.type = 'submit';
  submit.className = 'modal-primary cb-demo-submit';
  submit.textContent = 'Simular mensaje';
  form.append(submit);
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    form.reset();
    wrapper.replaceChildren();
    addText(wrapper,'p','Tu simulación se completó. El mensaje no se envió ni quedó guardado.', 'status-box');
    addText(wrapper,'p','En una tienda real, este paso necesitaría un correo o servicio de contacto verificado.');
    addButton(wrapper,'Volver a la tienda', closeModal);
  });
  wrapper.append(form);
  openModal('Contáctanos', wrapper, 'CONTACTO · SOLO DEMOSTRACIÓN');
  form.querySelector('input')?.focus();
}

function viewLegalTopic(topic) {
  const notices = {
    privacidad: {
      title: 'Privacidad · demo',
      body: [
        'El formulario de contacto es una simulación: lo escrito no se envía ni se guarda desde esta web. Utiliza únicamente datos ficticios.',
        'Casa Brownie no tiene registro de usuarios, pagos ni cuentas de cliente. El proveedor que aloja una página web puede procesar información técnica de acceso conforme a sus propias políticas.'
      ]
    },
    terminos: {
      title: 'Términos de uso · demo',
      body: [
        'Puedes explorar los sabores, abrir una caja de muestra y simular un mensaje. Ninguna de estas acciones constituye una compra, reserva o contrato.',
        'Los precios, productos, entregas y perfiles sociales que aparecen son elementos ilustrativos de una clase. No hay pedidos ni servicios reales.'
      ]
    },
    aviso: {
      title: 'Aviso legal · demo',
      body: [
        'Casa Brownie es una marca ficticia y su ubicación en Miami es inventada. No existe una tienda física que visitar ni una empresa de alimentos atendiendo pedidos.',
        'Concepto digital educativo creado por The Launch Era. Este ejemplo no reemplaza los avisos legales, de privacidad, alérgenos o comercio que requeriría una tienda real.'
      ]
    }
  };
  const info = notices[topic];
  if (!info) return;
  const wrapper = document.createElement('div');
  for (const paragraph of info.body) addText(wrapper, 'p', paragraph);
  addText(wrapper, 'p', 'No envíes datos reales ni intentes realizar pagos en esta demostración.', 'status-box');
  addButton(wrapper, 'Cerrar', closeModal);
  openModal(info.title, wrapper, 'INFORMACIÓN EDUCATIVA');
}

function viewLegal() {
  const wrapper = document.createElement('div');
  addText(
    wrapper,
    'p',
    'Esta web es un proyecto de demostración. Sus fotografías ilustran un concepto de producto. No se venden brownies ni se ofrecen entregas.'
  );
  addText(
    wrapper,
    'p',
    'El formulario de contacto es una simulación local: no envía ni guarda lo escrito. No hay cuentas sociales reales, carrito de compra real, analítica personalizada ni cobros. Antes de convertirla en negocio harían falta datos verificables, privacidad, información de alimentos y alérgenos, términos de venta y políticas de entrega adecuadas.'
  );
  addText(
    wrapper,
    'p',
    'No compartas información privada ni intentes pagar en esta demostración.',
    'status-box'
  );
  addButton(wrapper, 'Cerrar', closeModal);
  openModal('Información legal de la demostración', wrapper, 'PIE DE PÁGINA');
}
document
  .querySelectorAll('[data-flavor]')
  .forEach(button =>
    button.addEventListener('click', () => viewFlavor(button.dataset.flavor))
  );
document.getElementById('all-flavors').addEventListener('click', () => viewExperience());
document.getElementById('search-btn').addEventListener('click', () => {
  document.getElementById('brownies').scrollIntoView({ behavior: 'smooth' });
  notify('Elige un sabor para abrir su ficha de demostración.');
});
document.getElementById('coverage-btn').addEventListener('click', viewDelivery);
document.getElementById('see-story').addEventListener('click', viewStory);
document.getElementById('story-more-btn')?.addEventListener('click', viewStory);
document.getElementById('delivery-try-btn')?.addEventListener('click', () => viewExperience());
document
  .getElementById('demo-order')
  .addEventListener('click', viewCart);
document
  .getElementById('experience-btn')
  .addEventListener('click', () => viewExperience());
document.getElementById('legal-btn').addEventListener('click', viewLegal);
document.querySelectorAll('[data-demo-legal]').forEach(button => button.addEventListener('click', () => viewLegalTopic(button.dataset.demoLegal)));
document.getElementById('contact-us-button').addEventListener('click', viewContactDemo);
document.querySelectorAll('[data-social-demo]').forEach(button => button.addEventListener('click', () => viewSocialDemo(button.dataset.socialDemo)));

updateCartBadge();
