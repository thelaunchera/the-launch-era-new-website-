import './styles.css';

type Lang = 'es' | 'en';
type Product = { id: string; name: string; category: string; photo: string; crop?: string; es: string; en: string; detailEs: string; detailEn: string };
const products: Product[] = [
  { id: 'espresso', name: 'Espresso Waves', category: 'waves', photo: '10-waves.png', es: 'Ondas largas · Espresso', en: 'Long waves · Espresso', detailEs: 'Ondas amplias, largo protagonista y un tono oscuro profundo. Un look con movimiento para explorar otra versión de ti.', detailEn: 'Generous waves, statement length and a deep espresso shade. A look with movement, made to explore another side of you.' },
  { id: 'bob', name: 'The Miami Bob', category: 'bob', photo: '05-bob-product.png', crop: 'bob-crop', es: 'Bob liso · Espresso', en: 'Sleek bob · Espresso', detailEs: 'Un corte a la altura de la mandíbula, líneas limpias y puntas rectas. Sencillo, expresivo y con toda la intención.', detailEn: 'A jaw-length cut, clean lines and blunt ends. Simple, expressive and entirely intentional.' },
  { id: 'caramel', name: 'Caramel Hours', category: 'waves', photo: '09-caramel.png', es: 'Ondas suaves · Caramelo', en: 'Soft waves · Caramel', detailEs: 'Reflejos cálidos y ondas sueltas que dejan que el color haga su parte. Inspirado en esa última luz de Miami.', detailEn: 'Warm highlights and loose waves that let the color have its moment. Inspired by that last light in Miami.' },
  { id: 'curls', name: 'After Hours Curls', category: 'curls', photo: '07-curls.png', crop: 'curl-crop', es: 'Rizos definidos · Espresso', en: 'Defined curls · Espresso', detailEs: 'Rizos con forma, volumen y mucha personalidad. Una silueta que convierte la textura en el punto de atención.', detailEn: 'Defined curls, volume and plenty of personality. A silhouette that makes texture the main event.' },
];

const copy = {
  es: {
    announcement: 'Miami state of mind. Un look para cada mood.', concept: 'Concepto de marca', collection: 'La colección', ritual: 'El ritual', journal: 'Moodboard', saved: 'Mis looks', menu: 'Menú', close: 'Cerrar',
    eyebrow: 'WIGS · MIAMI / THE LOOK EDIT', hero: 'Un nuevo look.<br><em>Muy tú.</em>', lead: 'Ondas, cortes y texturas para cambiar de look sin dejar de ser tú.', find: 'Encuentra tu look', explore: 'Explorar la colección', heroNote: 'NUEVO MOOD. MISMA ESENCIA.',
    strip: 'LARGO. CORTO. RIZADO. MUY TÚ.', collectionEye: '01 / LA COLECCIÓN', collectionTitle: 'El look cambia.<br><em>La actitud es tuya.</em>', collectionLead: 'Cuatro estilos. Elige el que va con tu próximo plan.', all: 'Todos', waves: 'Ondas', bob: 'Bob', curls: 'Rizos', looks: 'looks para explorar', view: 'Ver look', save: 'Guardar look', savedAction: 'Look guardado', remove: 'Quitar', use: 'Preparar consulta', details: 'EL EDIT DE MAREA',
    ritualEye: '02 / EL RITUAL', ritualTitle: 'Tu look,<br><em>a tu manera.</em>', ritualLead: 'A veces quieres un cambio completo. A veces, solo probar algo distinto. Empieza por lo que te hace sentir tú.', ritualOne: 'Sigue tu mood', ritualOneText: 'Largo, bob o textura: deja que tu próximo look empiece con lo que te gusta.', ritualTwo: 'Mira más de cerca', ritualTwoText: 'Explora el corte, el color y los detalles de cada propuesta.', ritualThree: 'Hazlo tuyo', ritualThreeText: 'Guarda tus favoritos y prepara las preguntas que quieres hacer antes de elegir.',
    editEye: '03 / EL MOODBOARD', editTitle: 'Una ciudad.<br><em>Muchas versiones de ti.</em>', editLead: 'Luz de Miami, textura y un poco de actitud. El universo visual de Marea.', previous: 'Anterior', next: 'Siguiente', enlarge: 'Ver imagen',
    storyEye: 'THE MAREA STATE OF MIND', storyTitle: 'Cambia el look.<br>Quédate contigo.', storyText: 'No hace falta esperar a una ocasión especial para descubrir otro lado de ti.', packagingEye: 'EL DETALLE TAMBIÉN CUENTA', packagingTitle: 'El mood empieza<br>antes de salir.',
    faqEye: 'UN POCO MÁS DE CERCA', faqTitle: 'Antes de elegir.', questions: [
      ['¿Puedo comprar o reservar desde este demo?', 'Este es un concepto de website. Puedes explorar los looks, guardar favoritos y preparar una consulta de muestra. Aquí no se procesan compras ni reservas reales.'],
      ['¿Cómo encuentro un estilo para mí?', 'Prueba el buscador de looks. Elige una silueta, un color y tu mood; te mostraremos una propuesta de esta colección.'],
      ['¿Dónde quedan mis favoritos?', 'Tus looks se conservan en este navegador para que puedas volver a revisarlos. Puedes quitarlos cuando quieras desde Mis looks.'],
      ['¿Las fotos representan un catálogo real?', 'Las imágenes y los estilos son propuestas visuales creadas para esta marca de demostración. No representan inventario, precios o características de un producto a la venta.'],
    ],
    contactEye: 'TU PRÓXIMO MOOD EMPIEZA AQUÍ', contactTitle: '¿Y si pruebas<br><em>otra versión?</em>', contactText: 'Arma una selección, anota tus dudas y mira cómo sería tu consulta.', contactCta: 'Prepara tu consulta', footer: 'Concepto de website · Miami · Sin compras ni reservas reales',
    emptyTitle: 'Tu próximo look empieza aquí.', empty: 'Guarda los estilos que te llaman la atención y compáralos con calma.', savedTitle: 'Tu selección', countSaved: 'looks guardados', consultTitle: 'Prepara tu consulta', demoNote: 'Consulta de demostración. Se guarda en este navegador y no se envía a una tienda.', name: 'Tu nombre', optional: 'opcional', message: '¿Qué te gustaría preguntar?', required: 'Escribe una pregunta para preparar tu consulta.', pick: 'Look que te interesa', choose: 'Elige un look', summaryButton: 'Crear mi consulta de muestra', summaryTitle: 'Tu consulta está preparada.', summaryNote: 'Es una vista previa. No se ha enviado ni reservado una cita.', summaryLabel: 'TU CONSULTA DE MUESTRA', edit: 'Editar consulta', copy: 'Copiar resumen', copied: 'Resumen copiado', copyFallback: 'Selecciona el resumen para copiarlo.',
    quizTitle: 'Tu próximo look, en tres pasos.', step: 'PASO', back: 'Volver', restart: 'Empezar de nuevo', quizQuestions: ['¿Qué silueta te llama?', '¿Qué color va con tu mood?', '¿Cuál es tu plan?'], quizChoices: [['Ondas largas', 'Un bob liso', 'Rizos con presencia'], ['Oscuro y profundo', 'Reflejos cálidos'], ['Todos los días', 'Una ocasión especial', 'Solo quiero experimentar']], resultEye: 'TU MATCH DE MAREA', resultTitle: 'Empieza por este look.', resultNote: 'Una sugerencia visual para explorar, basada en tus preferencias. El corte tiene prioridad cuando tu color no aparece en esta colección.', resultSelection: 'Tu mood', toastSaved: 'Look añadido a tu selección', toastRemoved: 'Look quitado de tu selección', noImages: 'Imagen no disponible', galleryTitle: 'El moodboard de Marea',
  },
  en: {
    announcement: 'Miami state of mind. A look for every mood.', concept: 'Brand concept', collection: 'The collection', ritual: 'The ritual', journal: 'Moodboard', saved: 'My looks', menu: 'Menu', close: 'Close',
    eyebrow: 'WIGS · MIAMI / THE LOOK EDIT', hero: 'A new look.<br><em>Still you.</em>', lead: 'Waves, cuts and textures to change your look and keep your sense of self.', find: 'Find your look', explore: 'Explore the collection', heroNote: 'NEW MOOD. SAME YOU.',
    strip: 'LONG. SHORT. CURLY. ALL YOU.', collectionEye: '01 / THE COLLECTION', collectionTitle: 'The look changes.<br><em>The attitude is yours.</em>', collectionLead: 'Four styles. Find the one for your next plan.', all: 'All', waves: 'Waves', bob: 'Bob', curls: 'Curls', looks: 'looks to explore', view: 'View look', save: 'Save look', savedAction: 'Look saved', remove: 'Remove', use: 'Prepare a consultation', details: 'THE MAREA EDIT',
    ritualEye: '02 / THE RITUAL', ritualTitle: 'Your look,<br><em>your way.</em>', ritualLead: 'Sometimes you want a whole new look. Sometimes, just something different. Start with what feels like you.', ritualOne: 'Follow your mood', ritualOneText: 'Length, a bob or texture: let your next look start with what you love.', ritualTwo: 'Look a little closer', ritualTwoText: 'Explore the cut, color and details of every look.', ritualThree: 'Make it yours', ritualThreeText: 'Save your favorites and prepare the questions you want to ask before choosing.',
    editEye: '03 / THE MOODBOARD', editTitle: 'One city.<br><em>Many sides of you.</em>', editLead: 'Miami light, texture and a little attitude. The visual world of Marea.', previous: 'Previous', next: 'Next', enlarge: 'View image',
    storyEye: 'THE MAREA STATE OF MIND', storyTitle: 'Change the look.<br>Keep yourself.', storyText: 'You do not need a special occasion to discover another side of you.', packagingEye: 'THE DETAILS HAVE THEIR MOMENT', packagingTitle: 'The mood starts<br>before you go out.',
    faqEye: 'A LITTLE CLOSER', faqTitle: 'Before you choose.', questions: [
      ['Can I purchase or book through this demo?', 'This is a website concept. You can explore looks, save favorites and prepare a sample consultation. No real purchases or appointments are processed here.'],
      ['How do I find a style for me?', 'Try the look finder. Choose a silhouette, color and mood; we will suggest one style from this collection.'],
      ['Where are my favorites saved?', 'Your looks stay in this browser so you can revisit them. Remove them whenever you want from My looks.'],
      ['Do the photos represent a real catalog?', 'The images and styles are visual concepts created for this demo brand. They do not represent inventory, prices or specifications of products for sale.'],
    ],
    contactEye: 'YOUR NEXT MOOD STARTS HERE', contactTitle: 'What about<br><em>another side of you?</em>', contactText: 'Put a selection together, note your questions and preview your consultation.', contactCta: 'Prepare your consultation', footer: 'Website concept · Miami · No real purchases or appointments',
    emptyTitle: 'Your next look starts here.', empty: 'Save the styles that catch your eye and take your time comparing them.', savedTitle: 'Your selection', countSaved: 'saved looks', consultTitle: 'Prepare your consultation', demoNote: 'Demo consultation. Saved in this browser, never sent to a store.', name: 'Your name', optional: 'optional', message: 'What would you like to ask?', required: 'Write a question to prepare your consultation.', pick: 'The look you are interested in', choose: 'Choose a look', summaryButton: 'Create my sample consultation', summaryTitle: 'Your consultation is prepared.', summaryNote: 'This is a preview. Nothing has been sent and no appointment has been booked.', summaryLabel: 'YOUR SAMPLE CONSULTATION', edit: 'Edit consultation', copy: 'Copy summary', copied: 'Summary copied', copyFallback: 'Select the summary to copy it.',
    quizTitle: 'Your next look, in three steps.', step: 'STEP', back: 'Back', restart: 'Start again', quizQuestions: ['Which silhouette calls to you?', 'Which color fits your mood?', 'What is the plan?'], quizChoices: [['Long waves', 'A sleek bob', 'Statement curls'], ['Deep and dark', 'Warm highlights'], ['Every day', 'A special occasion', 'Just experimenting']], resultEye: 'YOUR MAREA MATCH', resultTitle: 'Start with this look.', resultNote: 'A visual starting point based on your preferences. The cut takes priority when your chosen color is not in this collection.', resultSelection: 'Your mood', toastSaved: 'Look added to your selection', toastRemoved: 'Look removed from your selection', noImages: 'Image unavailable', galleryTitle: 'The Marea moodboard',
  },
};

const escape = (value: string) => value.replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' } as Record<string, string>)[character]);
function read<T>(key: string, fallback: T): T {
  try { return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback; } catch { return fallback; }
}
function persist(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* The site remains usable without browser storage. */ }
}
let lang: Lang = read<string>('marea-language', 'es') === 'en' ? 'en' : 'es';
const saved = new Set<string>(read<string[]>('marea-looks', []).filter(id => products.some(product => product.id === id)));
let filter = 'all';
let quizStep = 0;
let quizAnswers = [0, 0, 0];
let activeDialog: 'product' | 'saved' | 'quiz' | 'consult' | 'summary' | 'gallery' | '' = '';
let activeProduct = 'espresso';
let galleryIndex = 0;
let consultDraft = read('marea-consultation', { name: '', message: '', product: '' });
let lastFocus: HTMLElement | null = null;
const app = document.querySelector<HTMLDivElement>('#app')!;
const dialog = document.createElement('dialog');
dialog.className = 'marea-dialog';
dialog.setAttribute('aria-labelledby', 'dialog-title');
document.body.append(dialog);
const toast = document.createElement('div');
toast.className = 'toast';
toast.setAttribute('role', 'status');
document.body.append(toast);
const asset = (filename: string) => `./resources/${filename}`;
const t = () => copy[lang];
const heart = (filled = false) => `<svg width="20" height="20" viewBox="0 0 24 24" fill="${filled ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/></svg>`;
const picture = (filename: string, alt: string, classes = '', eager = false) => `<img src="${asset(filename)}" alt="${escape(alt)}" class="${classes}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async" width="1122" height="1402">`;
const gallery = ['01-hero.png', '02-long.png', '03-bob.png', '04-detail.png', '05-bob-product.png', '06-campaign.png', '07-curls.png', '08-editorial.png'];
const productById = (id: string) => products.find(product => product.id === id) || products[0];

function renderCards() {
  const list = products.filter(product => filter === 'all' || product.category === filter);
  return list.map(product => `<article class="product-card">
    <div class="product-photo ${product.crop || ''}">
      <button class="photo-open" data-action="product" data-id="${product.id}" aria-label="${t().view}: ${product.name}">${picture(product.photo, `${product.name} — ${product[lang]}`)}</button>
      <span class="product-index">0${products.indexOf(product) + 1}</span>
      <button class="heart-button" data-action="save" data-id="${product.id}" aria-pressed="${saved.has(product.id)}" aria-label="${saved.has(product.id) ? t().remove : t().save}: ${product.name}">${heart(saved.has(product.id))}</button>
    </div>
    <div class="product-meta"><p>${product[lang]}</p><h3>${product.name}</h3><button class="text-button" data-action="product" data-id="${product.id}">${t().view}</button></div>
  </article>`).join('');
}

function render() {
  const c = t();
  document.documentElement.lang = lang;
  document.title = lang === 'es' ? 'Marea Wigs · Miami — Un nuevo look. Muy tú.' : 'Marea Wigs · Miami — A new look. Still you.';
  app.innerHTML = `
    <div class="announcement"><span>${c.announcement}</span><span class="concept-label">${c.concept}</span></div>
    <header class="header">
      <a class="wordmark" href="#home" aria-label="Marea Wigs Miami"><span>marea<span class="wordmark-dot">.</span></span><small>WIGS · MIAMI</small></a>
      <nav class="desktop-nav" aria-label="${lang === 'es' ? 'Navegación principal' : 'Main navigation'}"><a href="#collection">${c.collection}</a><a href="#ritual">${c.ritual}</a><a href="#moodboard">${c.journal}</a></nav>
      <div class="header-actions"><div class="language-switch" aria-label="Idioma / Language"><button data-action="language" data-lang="es" aria-pressed="${lang === 'es'}">ES</button><span>/</span><button data-action="language" data-lang="en" aria-pressed="${lang === 'en'}">EN</button></div><button class="saved-nav" data-action="saved" aria-label="${c.saved} (${saved.size})">${heart()}<span class="saved-label">${c.saved}</span><span class="saved-count">${saved.size}</span></button><button class="menu-button" data-action="menu" aria-expanded="false" aria-controls="mobile-nav">${c.menu}</button></div>
      <nav id="mobile-nav" class="mobile-nav" hidden><a href="#collection">${c.collection}</a><a href="#ritual">${c.ritual}</a><a href="#moodboard">${c.journal}</a><button data-action="quiz">${c.find}</button></nav>
    </header>
    <main id="home">
      <section class="hero" aria-labelledby="hero-title"><div class="hero-copy"><p class="eyebrow">${c.eyebrow}</p><h1 id="hero-title">${c.hero}</h1><p class="hero-lead">${c.lead}</p><button class="button button-dark" data-action="quiz">${c.find}<span class="button-dot"></span></button><a class="hero-link" href="#collection">${c.explore}</a><div class="hero-footnote"><span>THE MAREA EDIT</span><span>EST. AS A MOOD.</span></div></div><div class="hero-visual">${picture('13-miami.png', lang === 'es' ? 'Look de ondas caramelo frente a una fachada Art Déco de Miami' : 'Caramel waves against a Miami Art Deco facade', '', true)}<span class="hero-stamp">MIAMI<br><i>on your terms.</i></span><span class="hero-image-note">${c.heroNote}</span></div></section>
      <div class="type-strip" aria-hidden="true"><span>${c.strip}</span><span class="strip-star">✳</span><span>${c.strip}</span></div>
      <section id="collection" class="section collection" aria-labelledby="collection-title"><div class="section-heading"><div><p class="eyebrow">${c.collectionEye}</p><h2 id="collection-title">${c.collectionTitle}</h2></div><p class="section-lead">${c.collectionLead}</p></div><div class="collection-toolbar"><div class="filters" aria-label="${c.collection}">${['all', 'waves', 'bob', 'curls'].map(key => `<button data-action="filter" data-filter="${key}" aria-pressed="${filter === key}">${c[key as 'all' | 'waves' | 'bob' | 'curls']}</button>`).join('')}</div><span id="result-count" class="result-count" aria-live="polite">${products.filter(product => filter === 'all' || product.category === filter).length} ${c.looks}</span></div><div class="product-grid" id="product-grid">${renderCards()}</div></section>
      <section id="ritual" class="ritual" aria-labelledby="ritual-title"><div class="ritual-photo">${picture('11-studio.png', lang === 'es' ? 'Consulta de estilo en un estudio de belleza luminoso' : 'A style consultation in a sunlit beauty studio')}<span class="photo-caption">A LITTLE CHANGE. A WHOLE MOOD.</span></div><div class="ritual-copy"><p class="eyebrow">${c.ritualEye}</p><h2 id="ritual-title">${c.ritualTitle}</h2><p class="ritual-lead">${c.ritualLead}</p><ol class="ritual-steps">${[[c.ritualOne, c.ritualOneText], [c.ritualTwo, c.ritualTwoText], [c.ritualThree, c.ritualThreeText]].map(([title, text], index) => `<li><span>0${index + 1}</span><div><h3>${title}</h3><p>${text}</p></div></li>`).join('')}</ol><button class="text-button" data-action="consult">${c.contactCta}</button></div></section>
      <section id="moodboard" class="section moodboard" aria-labelledby="moodboard-title"><div class="section-heading"><div><p class="eyebrow">${c.editEye}</p><h2 id="moodboard-title">${c.editTitle}</h2></div><div class="moodboard-intro"><p class="section-lead">${c.editLead}</p><div class="gallery-controls"><button data-action="gallery-scroll" data-direction="-1">${c.previous}</button><span>/</span><button data-action="gallery-scroll" data-direction="1">${c.next}</button></div></div></div><div class="editorial-track" id="editorial-track">${gallery.map((photo, index) => `<button class="editorial-card" data-action="gallery" data-index="${index}" aria-label="${c.enlarge} ${index + 1}">${picture(photo, `Marea Wigs Miami — editorial ${index + 1}`)}<span>THE LOOK EDIT / 0${index + 1}</span></button>`).join('')}</div></section>
      <section class="state-of-mind"><div class="state-image">${picture('14-community.png', lang === 'es' ? 'Tres mujeres con diferentes cortes y texturas de la colección' : 'Three women wearing different cuts and textures from the collection')}</div><div class="state-copy"><p class="eyebrow">${c.storyEye}</p><h2>${c.storyTitle}</h2><p>${c.storyText}</p><button class="button button-light" data-action="quiz">${c.find}<span class="button-dot"></span></button></div></section>
      <section class="packaging"><div><p class="eyebrow">${c.packagingEye}</p><h2>${c.packagingTitle}</h2><span class="mini-wordmark">marea.</span></div>${picture('12-packaging.png', lang === 'es' ? 'Peluca de ondas caramelo con empaque ivory' : 'Caramel wave wig with ivory packaging')}</section>
      <section class="section faq" aria-labelledby="faq-title"><div><p class="eyebrow">${c.faqEye}</p><h2 id="faq-title">${c.faqTitle}</h2></div><div class="faq-list">${c.questions.map(([question, answer]) => `<details><summary>${question}<span aria-hidden="true">+</span></summary><p>${answer}</p></details>`).join('')}</div></section>
      <section class="contact"><p class="eyebrow">${c.contactEye}</p><h2>${c.contactTitle}</h2><p>${c.contactText}</p><button class="button button-dark" data-action="consult">${c.contactCta}<span class="button-dot"></span></button><span class="contact-line">MIAMI, FL / A LOOK FOR EVERY MOOD</span></section>
    </main><footer class="footer"><div class="footer-top"><a href="#home" class="footer-wordmark">marea.</a><div><a href="#collection">${c.collection}</a><button data-action="quiz">${c.find}</button><button data-action="saved">${c.saved}</button></div><span class="footer-location">WIGS · MIAMI<br>THE LOOK EDIT</span></div><div class="footer-bottom"><span>${c.footer}</span><span>Powered by The Launch Era</span></div></footer>`;
}

function showToast(message: string) {
  toast.textContent = message;
  toast.classList.add('visible');
  window.setTimeout(() => toast.classList.remove('visible'), 2200);
}

function updateSavedButtons() {
  document.querySelectorAll<HTMLButtonElement>('[data-action="save"]').forEach(button => {
    const product = productById(button.dataset.id || '');
    const selected = saved.has(product.id);
    button.setAttribute('aria-pressed', String(selected));
    if (button.classList.contains('heart-button')) {
      button.innerHTML = heart(selected);
      button.setAttribute('aria-label', `${selected ? t().remove : t().save}: ${product.name}`);
    } else button.textContent = selected ? t().savedAction : t().save;
  });
  document.querySelectorAll('.saved-count').forEach(node => node.textContent = String(saved.size));
  document.querySelector('.saved-nav')?.setAttribute('aria-label', `${t().saved} (${saved.size})`);
}

function toggleSave(id: string) {
  const existing = saved.has(id);
  if (existing) saved.delete(id); else saved.add(id);
  persist('marea-looks', Array.from(saved));
  updateSavedButtons();
  showToast(existing ? t().toastRemoved : t().toastSaved);
  if (activeDialog === 'saved') renderDialog();
}

function openDialog(type: typeof activeDialog, id?: string) {
  if (!dialog.open) lastFocus = document.activeElement as HTMLElement;
  activeDialog = type;
  if (id) activeProduct = id;
  renderDialog();
  if (!dialog.open) dialog.showModal();
  document.body.classList.add('dialog-open');
}

function closeDialog() {
  dialog.close();
  activeDialog = '';
  document.body.classList.remove('dialog-open');
  lastFocus?.focus();
}

function dialogHeader(title: string) {
  return `<div class="dialog-header"><span class="dialog-brand">marea.</span><button class="close-button" data-action="close" aria-label="${t().close}">${t().close} <span aria-hidden="true">×</span></button></div><h2 id="dialog-title" class="dialog-title">${title}</h2>`;
}

function renderDialog() {
  const c = t();
  const product = productById(activeProduct);
  dialog.className = `marea-dialog ${activeDialog === 'gallery' ? 'gallery-dialog' : ''}`;
  if (activeDialog === 'product') {
    dialog.innerHTML = dialogHeader(product.name) + `<div class="product-detail"><div class="detail-photo ${product.crop || ''}">${picture(product.photo, product.name)}</div><div class="detail-copy"><p class="eyebrow">${c.details}</p><p class="detail-tag">${product[lang]}</p><p>${lang === 'es' ? product.detailEs : product.detailEn}</p><button class="button button-dark" data-action="save" data-id="${product.id}" aria-pressed="${saved.has(product.id)}">${saved.has(product.id) ? c.savedAction : c.save}</button><button class="text-button" data-action="consult" data-id="${product.id}">${c.use}</button></div></div>`;
  } else if (activeDialog === 'saved') {
    const selected = products.filter(item => saved.has(item.id));
    dialog.innerHTML = dialogHeader(c.savedTitle) + (selected.length ? `<p class="dialog-subtitle">${selected.length} ${c.countSaved}</p><div class="saved-list">${selected.map(item => `<article class="saved-item"><div class="saved-thumbnail ${item.crop || ''}">${picture(item.photo, item.name)}</div><div><h3>${item.name}</h3><p>${item[lang]}</p><button class="text-button" data-action="product" data-id="${item.id}">${c.view}</button></div><button class="remove-button" data-action="save" data-id="${item.id}" aria-label="${c.remove}: ${item.name}">${c.remove}</button></article>`).join('')}</div><button class="button button-dark" data-action="consult">${c.contactCta}</button>` : `<div class="empty-selection">${heart()}<h3>${c.emptyTitle}</h3><p>${c.empty}</p><button class="button button-dark" data-action="explore">${c.explore}</button></div>`);
  } else if (activeDialog === 'quiz') {
    if (quizStep < 3) {
      dialog.innerHTML = dialogHeader(c.quizTitle) + `<div class="quiz"><p class="eyebrow">${c.step} ${quizStep + 1} / 3</p><div class="quiz-progress">${[0, 1, 2].map(step => `<span class="${step <= quizStep ? 'active' : ''}"></span>`).join('')}</div><h3>${c.quizQuestions[quizStep]}</h3><div class="quiz-options">${c.quizChoices[quizStep].map((label, index) => `<button data-action="quiz-answer" data-choice="${index}"><span>0${index + 1}</span>${label}</button>`).join('')}</div>${quizStep > 0 ? `<button class="text-button" data-action="quiz-back">${c.back}</button>` : ''}</div>`;
    } else {
      const match = productById(quizAnswers[0] === 1 ? 'bob' : quizAnswers[0] === 2 ? 'curls' : quizAnswers[1] === 1 ? 'caramel' : 'espresso');
      dialog.innerHTML = dialogHeader(c.resultTitle) + `<div class="quiz-result"><div class="detail-photo ${match.crop || ''}">${picture(match.photo, match.name)}</div><div><p class="eyebrow">${c.resultEye}</p><h3>${match.name}</h3><p>${c.resultSelection}: ${quizAnswers.map((answer, step) => c.quizChoices[step][answer]).join(' · ')}</p><p class="fine-print">${c.resultNote}</p><button class="button button-dark" data-action="product" data-id="${match.id}">${c.view}</button><button class="text-button" data-action="quiz-restart">${c.restart}</button></div></div>`;
    }
  } else if (activeDialog === 'consult') {
    const proposed = consultDraft.product || Array.from(saved)[0] || '';
    dialog.innerHTML = dialogHeader(c.consultTitle) + `<p class="demo-notice">${c.demoNote}</p><form id="consult-form" novalidate><label>${c.name} <span>(${c.optional})</span><input name="name" maxlength="80" value="${escape(consultDraft.name)}" autocomplete="given-name"></label><label>${c.pick}<select name="product"><option value="">${c.choose}</option>${products.map(item => `<option value="${item.id}" ${item.id === proposed ? 'selected' : ''}>${item.name}</option>`).join('')}</select></label><label>${c.message}<textarea name="message" rows="4" maxlength="1200" aria-describedby="form-error" required>${escape(consultDraft.message)}</textarea></label><p id="form-error" class="form-error" role="alert"></p><button class="button button-dark" type="submit">${c.summaryButton}</button></form>`;
  } else if (activeDialog === 'summary') {
    dialog.innerHTML = dialogHeader(c.summaryTitle) + `<p class="demo-notice">${c.summaryNote}</p><div class="consultation-summary" id="consultation-summary"><p class="eyebrow">${c.summaryLabel}</p>${consultDraft.name ? `<p><strong>${c.name}:</strong> ${escape(consultDraft.name)}</p>` : ''}${consultDraft.product ? `<p><strong>${c.pick}:</strong> ${productById(consultDraft.product).name}</p>` : ''}${saved.size ? `<p><strong>${c.saved}:</strong> ${products.filter(item => saved.has(item.id)).map(item => item.name).join(', ')}</p>` : ''}<p class="summary-message">${escape(consultDraft.message)}</p></div><div class="summary-actions"><button class="button button-dark" data-action="copy-summary">${c.copy}</button><button class="text-button" data-action="consult">${c.edit}</button></div>`;
  } else if (activeDialog === 'gallery') {
    dialog.innerHTML = dialogHeader(`${c.galleryTitle} / ${galleryIndex + 1}`) + `<div class="gallery-full">${picture(gallery[galleryIndex], `Marea editorial ${galleryIndex + 1}`)}</div><div class="gallery-modal-controls"><button class="text-button" data-action="gallery-previous">${c.previous}</button><span>${galleryIndex + 1} / ${gallery.length}</span><button class="text-button" data-action="gallery-next">${c.next}</button></div>`;
  }
}

document.addEventListener('click', event => {
  const target = (event.target as HTMLElement).closest<HTMLElement>('[data-action]');
  if (!target) {
    if ((event.target as HTMLElement).closest('#mobile-nav a')) { document.querySelector('#mobile-nav')?.setAttribute('hidden', ''); document.querySelector('[data-action="menu"]')?.setAttribute('aria-expanded', 'false'); }
    return;
  }
  const action = target.dataset.action;
  const id = target.dataset.id || '';
  if (action === 'language') {
    lang = target.dataset.lang === 'en' ? 'en' : 'es';
    persist('marea-language', lang); render(); if (dialog.open) renderDialog();
  } else if (action === 'filter') {
    filter = target.dataset.filter || 'all';
    document.querySelectorAll('[data-action="filter"]').forEach(button => button.setAttribute('aria-pressed', String((button as HTMLElement).dataset.filter === filter)));
    document.querySelector('#product-grid')!.innerHTML = renderCards();
    document.querySelector('#result-count')!.textContent = `${products.filter(item => filter === 'all' || item.category === filter).length} ${t().looks}`;
  } else if (action === 'product') openDialog('product', id);
  else if (action === 'save') toggleSave(id);
  else if (action === 'saved') openDialog('saved');
  else if (action === 'close') closeDialog();
  else if (action === 'explore') { closeDialog(); document.querySelector('#collection')?.scrollIntoView({ behavior: 'smooth' }); }
  else if (action === 'quiz') { quizStep = 0; quizAnswers = [0, 0, 0]; openDialog('quiz'); }
  else if (action === 'quiz-answer') { quizAnswers[quizStep] = Number(target.dataset.choice); quizStep++; renderDialog(); }
  else if (action === 'quiz-back') { quizStep = Math.max(0, quizStep - 1); renderDialog(); }
  else if (action === 'quiz-restart') { quizStep = 0; renderDialog(); }
  else if (action === 'consult') { if (id) consultDraft.product = id; openDialog('consult'); }
  else if (action === 'gallery') { galleryIndex = Number(target.dataset.index); openDialog('gallery'); }
  else if (action === 'gallery-previous' || action === 'gallery-next') { galleryIndex = (galleryIndex + (action === 'gallery-next' ? 1 : -1) + gallery.length) % gallery.length; renderDialog(); }
  else if (action === 'gallery-scroll') { document.querySelector('#editorial-track')?.scrollBy({ left: Number(target.dataset.direction) * 550, behavior: 'smooth' }); }
  else if (action === 'menu') { const expanded = target.getAttribute('aria-expanded') === 'true'; target.setAttribute('aria-expanded', String(!expanded)); document.querySelector('#mobile-nav')?.toggleAttribute('hidden', expanded); }
  else if (action === 'copy-summary') {
    const text = document.querySelector('#consultation-summary')?.textContent || '';
    if (navigator.clipboard) navigator.clipboard.writeText(text).then(() => showToast(t().copied)).catch(() => showToast(t().copyFallback));
    else showToast(t().copyFallback);
  }
});

document.addEventListener('submit', event => {
  if ((event.target as HTMLFormElement).id !== 'consult-form') return;
  event.preventDefault();
  const form = event.target as HTMLFormElement;
  const data = new FormData(form);
  const message = String(data.get('message') || '').trim();
  if (!message) { form.querySelector('#form-error')!.textContent = t().required; form.querySelector<HTMLTextAreaElement>('textarea')!.focus(); return; }
  const selectedProduct = String(data.get('product') || '');
  consultDraft = { name: String(data.get('name') || '').trim(), message, product: products.some(item => item.id === selectedProduct) ? selectedProduct : '' };
  persist('marea-consultation', consultDraft);
  openDialog('summary');
});

dialog.addEventListener('cancel', event => { event.preventDefault(); closeDialog(); });
dialog.addEventListener('click', event => { if (event.target === dialog) { const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeDialog(); } });
render();
