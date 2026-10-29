
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
      ...modalRoot.querySelectorAll('button,[href],select,input'),
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
  addButton(wrapper, 'Simular que elijo este sabor', () =>
    viewExperience(item.id)
  );
  openModal(item.name, wrapper, 'NUESTROS BROWNIES · SABOR DE EJEMPLO');
}
function viewExperience(startId) {
  selectedFlavor = startId || selectedFlavor;
  const wrapper = document.createElement('div');
  addText(
    wrapper,
    'p',
    'Así sería el primer paso de una experiencia de pedido. Elige un sabor y comprueba cómo se presenta la entrega. No se pedirán dirección, tarjeta ni correo.'
  );
  const choices = document.createElement('div');
  choices.className = 'modal-choice';
  catalog.forEach(item => {
    const button = addButton(
      choices,
      item.name,
      () => {
        selectedFlavor = item.id;
        choices
          .querySelectorAll('button')
          .forEach(b => b.classList.remove('active'));
        button.classList.add('active');
        selected.textContent =
          'Elegiste: ' +
          item.name +
          ' · territorio de entrega ilustrativo: Miami.';
      },
      ''
    );
    if (item.id === selectedFlavor) button.classList.add('active');
  });
  wrapper.append(choices);
  const selected = addText(
    wrapper,
    'p',
    'Elegiste: ' +
      (catalog.find(f => f.id === selectedFlavor)?.name || 'Clásico') +
      ' · territorio de entrega ilustrativo: Miami.',
    'status-box'
  );
  addButton(wrapper, 'Continuar con la simulación', () => {
    const end = document.createElement('div');
    addText(
      end,
      'p',
      'Tu experiencia de muestra ha terminado. Esto es lo que una web real tendría que confirmar antes de recibir un pedido: cobertura por código postal, disponibilidad, fecha, tarifa, precio y pago seguro.'
    );
    addText(
      end,
      'p',
      'DEMO EDUCATIVA · No se generó ni envió ningún pedido. No se cobró ni guardó ningún dato.',
      'status-box'
    );
    addButton(end, 'Volver a explorar', () => {
      closeModal();
      document
        .getElementById('brownies')
        .scrollIntoView({ behavior: 'smooth' });
    });
    openModal(
      'Una experiencia sin compras reales',
      end,
      'SIMULACIÓN COMPLETADA'
    );
  });
  openModal(
    'Elige tu brownie',
    wrapper,
    'EXPERIENCIA DE PEDIDO · SOLO SIMULACIÓN'
  );
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
  addText(
    wrapper,
    'p',
    'Esta marca es el ejemplo ficticio de la clase «Tu primera web con IA». Su sitio muestra cómo presentar un producto con fotos claras, explicar su entrega y ofrecer una experiencia sencilla, sin activar ventas.'
  );
  addText(
    wrapper,
    'p',
    'No es una panadería abierta y no ofrece producción, entregas, reseñas, precios ni venta de alimentos.',
    'status-box'
  );
  addButton(wrapper, 'Seguir explorando', closeModal);
  openModal('Una idea que conecta', wrapper, 'SOBRE CASA BROWNIE');
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
    'No hay registro de usuarios, formularios, carrito real, analítica personalizada ni cobros. Antes de convertir esta demo en un negocio real habría que añadir datos de contacto verificables, privacidad, información de alimentos y alérgenos, términos de venta y políticas de entrega y devolución adecuadas a la actividad y la ley aplicable.'
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
document
  .getElementById('demo-order')
  .addEventListener('click', () => viewExperience());
document
  .getElementById('experience-btn')
  .addEventListener('click', () => viewExperience());
document.getElementById('legal-btn').addEventListener('click', viewLegal);
