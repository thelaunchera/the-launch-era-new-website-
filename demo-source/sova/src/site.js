import './styles.css';
import './campaign-carousel.js';

const asset = name => new URL(`./resources/${name}`, document.baseURI).href;
const imageFiles = [
  '01-hero.png', '02-product.png', '03-campaign.png', '04-campaign.png',
  '05-campaign.png', '06-campaign.png', '07-campaign.png', '08-campaign.png',
  '09-campaign.png', '10-campaign.png'
];
const imageNames = [
  'The listening lounge', 'SOVA ONE · Ivory', 'Your own volume.', 'On repeat.',
  'Make room for music.', 'Closer to the music.', 'A little me time.',
  'Find your rhythm.', 'Press play.', 'The art of tuning in.'
];
const products = [
  { id: 'ivory', name: 'Ivory', es: 'Marfil', color: '#eee3ce', image: 1 },
  { id: 'cobalt', name: 'Cobalt', es: 'Cobalto', color: '#1051c5', image: 3 },
  { id: 'black', name: 'Soft Black', es: 'Negro suave', color: '#20232a', image: 7 }
];
const words = {
  en: {
    strip: 'AN ORIGINAL BRAND CONCEPT BY THE LAUNCH ERA', collection: 'The collection',
    experience: 'The feeling', campaign: 'The campaign', bag: 'Demo bag', menu: 'Menu',
    eyebrow: 'HEADPHONES. PERSONALITY INCLUDED.', headline: 'YOUR WORLD.<br>YOUR SOUND.',
    intro: 'Your favorite playlist. Your favorite spot. A little room for you.',
    explore: 'Explore headphones', heroNote: 'THE SOVA LISTENING LOUNGE',
    colorStrip: 'ONE DESIGN. THREE MOODS.', colors: ['Warm ivory', 'Signature cobalt', 'Soft black'],
    collectionLabel: 'MEET SOVA ONE', collectionTitle: 'PICK YOUR<br>PERSONALITY.',
    collectionLead: 'An over-ear silhouette in three considered colors. Find the one that feels like you.',
    colorway: 'COLORWAY', view: 'Explore this color', featureLabel: 'THE EVERYDAY LISTENING RITUAL',
    featureTitle: 'MAKE ROOM<br>FOR MUSIC.',
    featureText: 'The first song of the morning. The album you know by heart. The quiet joy of pressing play.',
    featureLink: 'Find your color', detailLabel: 'A CLOSER LOOK', detailTitle: 'ALL IN<br>THE DETAILS.',
    detailText: 'Soft curves. Brushed silver accents. A palette that belongs in your everyday world.',
    galleryLabel: 'THE SOVA CAMPAIGN', galleryTitle: 'A DIFFERENT<br>KIND OF LOUD.',
    galleryLead: 'Ten individual images. One unmistakable point of view.',
    viewPhoto: 'View photo', photo: 'Photo',
    previous: 'Previous', next: 'Next', close: 'Close',
    faqs: 'A FEW GOOD QUESTIONS', faqTitle: 'GOOD TO KNOW.',
    questions: [
      ['What is SOVA?', 'SOVA is a fictional headphone brand created to demonstrate a complete visual identity and shopping experience.'],
      ['Can I buy these headphones?', 'This is a brand demo. You can explore colors and save a demo bag, but it does not accept orders or payments.'],
      ['Can I open the campaign photos?', 'Yes. Select any of the ten images to view the campaign in the gallery.']
    ],
    ctaLabel: 'YOUR NEXT BRAND COULD FEEL THIS GOOD.', ctaTitle: 'LIKE THE LOOK?<br>LET’S BUILD YOURS.',
    inquire: 'Inquire about this design', demo: 'Fictional brand demo · No orders or payments.',
    productTitle: 'YOUR DAILY<br>PLUS ONE.', productText: 'A sculpted over-ear concept, finished in your favorite shade.',
    choose: 'Choose your color', add: 'Add to demo bag', saved: 'Added to your demo bag',
    bagTitle: 'YOUR DEMO BAG', empty: 'A little room for your next favorite.',
    emptyHelp: 'Explore the collection and add a color to try the demo.', remove: 'Remove',
    quantity: 'Quantity', totalItems: 'items in your selection', bagHelp: 'This selection is saved on this device. No checkout or payment is available in this demo.',
    continue: 'Continue exploring', unavailable: 'Your browser could not retain this selection after reload.',
    skip: 'Skip to content'
  },
  es: {
    strip: 'UN CONCEPTO DE MARCA ORIGINAL DE THE LAUNCH ERA', collection: 'La colección',
    experience: 'La experiencia', campaign: 'La campaña', bag: 'Bolsa demo', menu: 'Menú',
    eyebrow: 'AUDÍFONOS CON PERSONALIDAD.', headline: 'TU MUNDO.<br>TU SONIDO.',
    intro: 'Tu playlist favorita. Tu rincón favorito. Un momento para ti.',
    explore: 'Explorar audífonos', heroNote: 'EL RINCÓN SOVA',
    colorStrip: 'UN DISEÑO. TRES PERSONALIDADES.', colors: ['Marfil cálido', 'Azul cobalto', 'Negro suave'],
    collectionLabel: 'CONOCE SOVA ONE', collectionTitle: 'ELIGE TU<br>PERSONALIDAD.',
    collectionLead: 'Una silueta envolvente en tres colores. Encuentra el que se siente como tú.',
    colorway: 'COLOR', view: 'Explorar este color', featureLabel: 'TU RITUAL DE CADA DÍA',
    featureTitle: 'HAZ ESPACIO<br>PARA LA MÚSICA.',
    featureText: 'La primera canción del día. El álbum que te sabes de memoria. El placer de darle play.',
    featureLink: 'Encuentra tu color', detailLabel: 'MIRA MÁS DE CERCA', detailTitle: 'CADA DETALLE<br>CUENTA.',
    detailText: 'Curvas suaves. Acentos plateados. Una paleta que forma parte de tu mundo.',
    galleryLabel: 'LA CAMPAÑA SOVA · EN INGLÉS', galleryTitle: 'UNA FORMA<br>DE EXPRESARTE.',
    galleryLead: 'Diez imágenes individuales. Una identidad que se reconoce.',
    viewPhoto: 'Ver foto', photo: 'Foto',
    previous: 'Anterior', next: 'Siguiente', close: 'Cerrar',
    faqs: 'ALGUNAS RESPUESTAS', faqTitle: 'BUENO SABERLO.',
    questions: [
      ['¿Qué es SOVA?', 'SOVA es una marca ficticia de audífonos creada para mostrar una identidad visual completa y una experiencia de compra.'],
      ['¿Puedo comprar los audífonos?', 'Esta es una demostración de marca. Puedes explorar los colores y guardar una bolsa demo. No acepta pedidos ni pagos.'],
      ['¿Puedo abrir las fotos de la campaña?', 'Sí. Toca cualquiera de las diez imágenes para ver la campaña en la galería.']
    ],
    ctaLabel: 'TU PRÓXIMA MARCA PUEDE SENTIRSE ASÍ.', ctaTitle: '¿TE GUSTA?<br>CREEMOS LA TUYA.',
    inquire: 'Consultar sobre este diseño', demo: 'Marca ficticia de demostración · Sin pedidos ni pagos.',
    productTitle: 'TU COMPAÑERO<br>DE CADA DÍA.', productText: 'Un concepto de audífonos envolventes, en tu color favorito.',
    choose: 'Elige tu color', add: 'Añadir a la bolsa demo', saved: 'Añadido a tu bolsa demo',
    bagTitle: 'TU BOLSA DEMO', empty: 'Espacio para tu próximo favorito.',
    emptyHelp: 'Explora la colección y añade un color para probar el demo.', remove: 'Quitar',
    quantity: 'Cantidad', totalItems: 'artículos en tu selección', bagHelp: 'Esta selección se guarda en este dispositivo. El demo no tiene checkout ni pagos.',
    continue: 'Seguir explorando', unavailable: 'Tu navegador no pudo conservar la selección después de recargar.',
    skip: 'Saltar al contenido'
  }
};

let language = 'en';
let bag = [];
let storageAvailable = true;
let selectedProduct = 'ivory';
let currentImage = 0;
try {
  language = localStorage.getItem('sova-language') === 'es' ? 'es' : 'en';
  const stored = JSON.parse(localStorage.getItem('sova-bag') || '[]');
  if (Array.isArray(stored)) {
    bag = stored.filter(item => products.some(p => p.id === item.id) && Number.isInteger(item.quantity) && item.quantity > 0 && item.quantity <= 99);
  }
} catch {
  storageAvailable = false;
}
const text = () => words[language];
const colorName = product => language === 'es' ? product.es : product.name;
const count = () => bag.reduce((sum, item) => sum + item.quantity, 0);
const bagIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 8h14l1 13H4L5 8Z"/><path d="M8 8V6a4 4 0 0 1 8 0v2"/></svg>';

function saveBag() {
  try {
    localStorage.setItem('sova-bag', JSON.stringify(bag));
  } catch {
    storageAvailable = false;
  }
  document.querySelectorAll('[data-bag-count]').forEach(node => { node.textContent = String(count()); });
}

function render() {
  const t = text();
  document.documentElement.lang = language;
  document.title = language === 'es' ? 'SOVA — Tu mundo. Tu sonido.' : 'SOVA — Your world. Your sound.';
  document.querySelector('#app').innerHTML = `
    <a class="skip" href="#main">${t.skip}</a>
    <div class="announcement">${t.strip}</div>
    <header class="site-header">
      <a class="wordmark" href="#" aria-label="SOVA home">SOVA<span class="wordmark-dot"></span></a>
      <nav class="desktop-nav" aria-label="${t.menu}">
        <a href="#collection">${t.collection}</a><a href="#feeling">${t.experience}</a><a href="#campaign">${t.campaign}</a>
      </nav>
      <div class="header-actions">
        <div class="language-switch" aria-label="Language / Idioma">
          <button data-language="en" aria-pressed="${language === 'en'}">EN</button>
          <span aria-hidden="true">/</span>
          <button data-language="es" aria-pressed="${language === 'es'}">ES</button>
        </div>
        <button class="bag-button" data-open-bag aria-label="${t.bag}">${bagIcon}<span data-bag-count>${count()}</span></button>
        <button class="menu-button" data-menu aria-label="${t.menu}" aria-expanded="false"><span></span><span></span></button>
      </div>
    </header>
    <nav class="mobile-nav" aria-label="${t.menu}" hidden>
      <a href="#collection">${t.collection}</a><a href="#feeling">${t.experience}</a><a href="#campaign">${t.campaign}</a>
    </nav>
    <main id="main">
      <section class="hero" aria-labelledby="hero-title">
        <div class="hero-media"><img src="${asset(imageFiles[0])}" width="1536" height="1024" alt="${language === 'es' ? 'Dailin con audífonos SOVA marfil, sentada en un sofá azul cobalto' : 'Dailin wearing ivory SOVA headphones on a cobalt blue sofa'}" fetchpriority="high"></div>
        <div class="hero-copy"><p class="eyebrow">${t.eyebrow}</p><h1 id="hero-title">${t.headline}</h1><p class="hero-intro">${t.intro}</p><a class="button button-white" href="#collection">${t.explore}</a></div>
        <div class="hero-bottom"><span>${t.heroNote}</span><span>SOVA ONE / IVORY</span></div>
      </section>
      <div class="mood-strip"><span>${t.colorStrip}</span><div>${products.map((p, i) => `<button data-product="${p.id}"><i style="--swatch:${p.color}"></i>${t.colors[i]}</button>`).join('')}</div></div>
      <section class="collection section" id="collection">
        <div class="section-heading"><div><p class="eyebrow">${t.collectionLabel}</p><h2>${t.collectionTitle}</h2></div><p class="section-lead">${t.collectionLead}</p></div>
        <div class="products">${products.map((p, i) => `
          <article class="product-card"><button class="product-image color-${p.id}" data-product="${p.id}" aria-label="${t.view}: ${colorName(p)}"><img src="${asset(imageFiles[p.image])}" width="1122" height="1402" alt="SOVA ONE · ${colorName(p)}" loading="lazy"><span class="image-number">0${i + 1}</span></button><div class="product-info"><div><p class="eyebrow">SOVA ONE / ${t.colorway} 0${i + 1}</p><h3>${colorName(p)}</h3></div><button class="round-button" data-product="${p.id}" aria-label="${t.view}: ${colorName(p)}">+</button></div></article>`).join('')}
        </div>
      </section>
      <section class="feeling section" id="feeling"><div class="feeling-copy"><p class="eyebrow">${t.featureLabel}</p><h2>${t.featureTitle}</h2><p>${t.featureText}</p><a class="button button-dark" href="#collection">${t.featureLink}</a><span class="small-logo">SOVA / 01</span></div><div class="feeling-photo"><img src="${asset(imageFiles[1])}" width="1122" height="1402" alt="SOVA ONE ivory" loading="lazy"></div></section>
      <section class="detail section"><div class="detail-image"><img src="${asset(imageFiles[5])}" alt="${language === 'es' ? 'Detalle del acabado marfil y el aro plateado de SOVA ONE' : 'Close detail of SOVA ONE ivory finish and brushed silver rim'}" loading="lazy" width="1122" height="1402"></div><div class="detail-copy"><p class="eyebrow">${t.detailLabel}</p><h2>${t.detailTitle}</h2><p>${t.detailText}</p><div class="finish-line"><span>01</span><i></i><span>SOVA ONE</span></div></div></section>
      <section class="campaign section" id="campaign"><div class="section-heading"><div><p class="eyebrow">${t.galleryLabel}</p><h2>${t.galleryTitle}</h2></div><p class="section-lead">${t.galleryLead}</p></div><div class="gallery">${imageFiles.map((file, i) => `<button class="gallery-item gallery-${i}" data-photo="${i}" aria-label="${t.viewPhoto} ${String(i + 1).padStart(2, '0')}"><img src="${asset(file)}" alt="${imageNames[i]}" loading="lazy" width="${i === 0 ? 1536 : 1122}" height="${i === 0 ? 1024 : 1402}"><span>${String(i + 1).padStart(2, '0')} <b>+</b></span></button>`).join('')}</div></section>
      <section class="faq section"><div><p class="eyebrow">${t.faqs}</p><h2>${t.faqTitle}</h2></div><div class="questions">${t.questions.map(q => `<details><summary>${q[0]}<span aria-hidden="true">+</span></summary><p>${q[1]}</p></details>`).join('')}</div></section>
      <section class="design-cta"><p class="eyebrow">${t.ctaLabel}</p><h2>${t.ctaTitle}</h2><a class="button button-white" href="https://thelaunchera.com/" target="_blank" rel="noopener noreferrer">${t.inquire}</a></section>
    </main>
    <footer><div class="footer-top"><a class="wordmark" href="#">SOVA<span class="wordmark-dot"></span></a><nav><a href="#collection">${t.collection}</a><a href="#campaign">${t.campaign}</a></nav></div><div class="footer-bottom"><span>${t.demo}</span><a href="https://thelaunchera.com/" target="_blank" rel="noopener noreferrer">Powered by The Launch Era</a></div></footer>
    <dialog id="product-dialog" class="product-dialog" aria-labelledby="product-name"></dialog>
    <dialog id="bag-dialog" class="bag-dialog" aria-labelledby="bag-title"></dialog>
    <dialog id="photo-dialog" class="photo-dialog" aria-label="${t.galleryLabel}"></dialog>
    <div class="toast" role="status" aria-live="polite"></div>`;
  bindPage();
}

function bindPage() {
  document.querySelectorAll('[data-language]').forEach(button => {
    button.addEventListener('click', () => {
      const position = window.scrollY;
      language = button.dataset.language;
      try { localStorage.setItem('sova-language', language); } catch { /* Session preference still works. */ }
      render();
      window.scrollTo({ top: position, behavior: 'instant' });
    });
  });
  document.querySelectorAll('[data-product]').forEach(button => {
    button.addEventListener('click', () => openProduct(button.dataset.product));
  });
  document.querySelectorAll('[data-photo]').forEach(button => {
    button.addEventListener('click', () => openPhoto(Number(button.dataset.photo)));
  });
  document.querySelector('[data-open-bag]').addEventListener('click', openBag);
  document.querySelector('[data-menu]').addEventListener('click', event => {
    const button = event.currentTarget;
    const open = button.getAttribute('aria-expanded') !== 'true';
    button.setAttribute('aria-expanded', String(open));
    document.querySelector('.mobile-nav').hidden = !open;
  });
  document.querySelectorAll('.mobile-nav a').forEach(link => link.addEventListener('click', () => {
    document.querySelector('.mobile-nav').hidden = true;
    document.querySelector('[data-menu]').setAttribute('aria-expanded', 'false');
  }));
  document.querySelectorAll('dialog').forEach(dialog => {
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const box = dialog.getBoundingClientRect();
      if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
    });
    dialog.addEventListener('close', () => { document.body.classList.remove('modal-open'); });
  });
  document.querySelector('#photo-dialog').addEventListener('keydown', event => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      currentImage = (currentImage + (event.key === 'ArrowRight' ? 1 : -1) + 10) % 10;
      paintPhoto();
    }
  });
}

function showDialog(dialog) {
  if (!dialog.open) dialog.showModal();
  document.body.classList.add('modal-open');
}

function closeButton() {
  return `<button class="close-button" data-close aria-label="${text().close}">×</button>`;
}

function openProduct(id) {
  selectedProduct = id;
  paintProduct();
  showDialog(document.querySelector('#product-dialog'));
}

function paintProduct() {
  const t = text();
  const p = products.find(product => product.id === selectedProduct) || products[0];
  const dialog = document.querySelector('#product-dialog');
  dialog.innerHTML = `${closeButton()}<div class="product-dialog-grid"><img class="modal-product-photo" src="${asset(imageFiles[p.image])}" alt="SOVA ONE ${colorName(p)}"><div class="product-dialog-copy"><p class="eyebrow">SOVA ONE</p><h2>${t.productTitle}</h2><p>${t.productText}</p><h3 id="product-name">SOVA ONE · ${colorName(p)}</h3><p class="eyebrow color-label">${t.choose}</p><div class="color-options">${products.map(color => `<button data-color="${color.id}" aria-pressed="${color.id === p.id}" aria-label="${colorName(color)}"><i style="--swatch:${color.color}"></i><span>${colorName(color)}</span></button>`).join('')}</div><button class="button button-blue add-button" data-add>${t.add}</button><p class="demo-note">${t.demo}</p><p class="added-feedback" role="status"></p></div></div>`;
  dialog.querySelector('[data-close]').addEventListener('click', () => dialog.close());
  dialog.querySelectorAll('[data-color]').forEach(button => button.addEventListener('click', () => {
    selectedProduct = button.dataset.color;
    paintProduct();
    dialog.querySelector(`[data-color="${selectedProduct}"]`).focus();
  }));
  dialog.querySelector('[data-add]').addEventListener('click', () => {
    const item = bag.find(entry => entry.id === p.id);
    if (item) item.quantity = Math.min(99, item.quantity + 1);
    else bag.push({ id: p.id, quantity: 1 });
    saveBag();
    dialog.querySelector('.added-feedback').textContent = t.saved;
    showToast(t.saved);
  });
}

function openBag() {
  paintBag();
  showDialog(document.querySelector('#bag-dialog'));
}

function paintBag() {
  const t = text();
  const dialog = document.querySelector('#bag-dialog');
  dialog.innerHTML = `${closeButton()}<p class="eyebrow">SOVA ONE</p><h2 id="bag-title">${t.bagTitle}</h2>${bag.length ? `<div class="bag-items">${bag.map(item => {
    const p = products.find(product => product.id === item.id);
    return `<article class="bag-item"><img src="${asset(imageFiles[p.image])}" alt="SOVA ONE ${colorName(p)}"><div><h3>SOVA ONE · ${colorName(p)}</h3><p>${t.quantity}: ${item.quantity}</p><button class="text-button" data-remove="${p.id}">${t.remove}</button></div></article>`;
  }).join('')}</div><p class="bag-total"><strong>${count()}</strong> ${t.totalItems}</p>` : `<div class="bag-empty">${bagIcon}<h3>${t.empty}</h3><p>${t.emptyHelp}</p></div>`}<p class="demo-note">${t.bagHelp}</p>${!storageAvailable ? `<p role="status">${t.unavailable}</p>` : ''}<button class="button button-blue" data-continue>${t.continue}</button>`;
  dialog.querySelector('[data-close]').addEventListener('click', () => dialog.close());
  dialog.querySelector('[data-continue]').addEventListener('click', () => {
    dialog.close();
    document.querySelector('#collection').scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  });
  dialog.querySelectorAll('[data-remove]').forEach(button => button.addEventListener('click', () => {
    bag = bag.filter(item => item.id !== button.dataset.remove);
    saveBag();
    paintBag();
    dialog.querySelector('[data-continue]').focus();
  }));
}

function openPhoto(index) {
  currentImage = index;
  paintPhoto();
  showDialog(document.querySelector('#photo-dialog'));
}

function paintPhoto() {
  const t = text();
  const dialog = document.querySelector('#photo-dialog');
  const file = imageFiles[currentImage];
  dialog.innerHTML = `${closeButton()}<div class="photo-stage"><img src="${asset(file)}" alt="${imageNames[currentImage]}"></div><div class="photo-controls"><div><p class="eyebrow">${t.photo} ${String(currentImage + 1).padStart(2, '0')} / 10</p><p>${imageNames[currentImage]}</p></div><div class="photo-navigation"><button data-previous>${t.previous}</button><button data-next>${t.next}</button></div></div>`;
  dialog.querySelector('[data-close]').addEventListener('click', () => dialog.close());
  dialog.querySelector('[data-previous]').addEventListener('click', () => { currentImage = (currentImage + 9) % 10; paintPhoto(); dialog.querySelector('[data-previous]').focus(); });
  dialog.querySelector('[data-next]').addEventListener('click', () => { currentImage = (currentImage + 1) % 10; paintPhoto(); dialog.querySelector('[data-next]').focus(); });
}

let toastTimeout;
function showToast(message) {
  const toast = document.querySelector('.toast');
  toast.textContent = message;
  toast.classList.add('visible');
  window.clearTimeout(toastTimeout);
  toastTimeout = window.setTimeout(() => toast.classList.remove('visible'), 2500);
}

render();
