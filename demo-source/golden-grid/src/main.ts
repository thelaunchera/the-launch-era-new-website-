
import './styles.css';

let language = 'en';
let photoIndex = 0;
let selectedProduct = 0;
const photoTitles = [
  'Morning, but golden.', 'Crisp edges. Soft mornings.', 'Meet your golden hour.',
  'Stay golden.', 'Worth every crumb.', 'Good things. To go.',
  'A square worth sharing.', 'Slow down. Syrup up.', 'The art of a better morning.'
];
const products = [
  { image:2, en:['The golden classic','A square Belgian waffle, with a crisp golden edge, a soft center and a butter-and-syrup finish.'], es:['El clásico dorado','Un waffle belga cuadrado, con bordes dorados y crujientes, centro suave, mantequilla y sirope.'] },
  { image:3, en:['The at-home ritual','The Golden Grid waffle mix concept. A little morning inspiration for your own kitchen.'], es:['El ritual en casa','El concepto de mezcla para waffles Golden Grid. Un poco de inspiración para las mañanas en tu propia cocina.'] },
  { image:6, en:['The morning to go','A golden waffle in its own butter-yellow box. Designed to bring a little morning mood along for the ride.'], es:['Tu mañana para llevar','Un waffle dorado en su caja amarilla. Diseñado para llevar un poquito de esa esencia contigo.'] }
];
const byId = (id: string) => document.getElementById(id)!;
const dialog = (id: string) => byId(id) as HTMLDialogElement;

function translate() {
  document.documentElement.lang = language;
  document.querySelectorAll<HTMLElement>('[data-en]').forEach((element) => {
    element.innerHTML = element.dataset[language] || element.dataset.en || '';
  });
  byId('language').textContent = language === 'en' ? 'ES' : 'EN';
  byId('language').setAttribute('aria-label', language === 'en' ? 'Cambiar a español' : 'Switch to English');
  byId('previous').textContent = language === 'en' ? 'Previous' : 'Anterior';
  byId('next').textContent = language === 'en' ? 'Next' : 'Siguiente';
}
byId('language').addEventListener('click', () => {
  language = language === 'en' ? 'es' : 'en';
  translate();
});

for (let i = 0; i < 9; i++) {
  const button = document.createElement('button');
  button.setAttribute('aria-label', 'View photo ' + (i + 1));
  const image = document.createElement('img');
  image.dataset.originalSrc = './resources/golden-' + (i + 1) + '.png';
  // The featured carousel initially needs only 01, 02 and 09.
  // Keep every full-size URL available for the interactive lightbox.
  if (i === 0 || i === 1 || i === 8) image.src = image.dataset.originalSrc;
  image.alt = photoTitles[i];
  image.loading = 'lazy';
  button.append(image);
  button.addEventListener('click', () => {
    photoIndex = i;
    showPhoto();
    dialog('lightbox').showModal();
  });
  byId('gallery').append(button);
}

function showPhoto() {
  const image = byId('large-image') as HTMLImageElement;
  image.src = './resources/golden-' + (photoIndex + 1) + '.png';
  image.alt = photoTitles[photoIndex];
  byId('photo-count').textContent = (photoIndex + 1) + ' / 9';
}
function changePhoto(direction: number) {
  photoIndex = (photoIndex + direction + 9) % 9;
  showPhoto();
}
byId('previous').addEventListener('click', () => changePhoto(-1));
byId('next').addEventListener('click', () => changePhoto(1));
document.addEventListener('keydown', (event) => {
  if (!dialog('lightbox').open) return;
  if (event.key === 'ArrowLeft') changePhoto(-1);
  if (event.key === 'ArrowRight') changePhoto(1);
});

document.querySelectorAll<HTMLElement>('[data-product]').forEach((button) => {
  button.addEventListener('click', () => {
    selectedProduct = Number(button.dataset.product);
    const item = products[selectedProduct];
    const text = language === 'en' ? item.en : item.es;
    byId('product-name').textContent = text[0];
    byId('product-copy').textContent = text[1];
    const image = byId('product-image') as HTMLImageElement;
    image.src = './resources/golden-' + item.image + '.png';
    image.alt = text[0];
    dialog('product-dialog').showModal();
  });
});
document.querySelectorAll<HTMLElement>('[data-close]').forEach((button) => {
  button.addEventListener('click', () => dialog(button.dataset.close!).close());
});
document.querySelectorAll<HTMLDialogElement>('dialog').forEach((item) => {
  item.addEventListener('click', (event) => {
    if (event.target !== item) return;
    const bounds = item.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) item.close();
  });
});
document.querySelectorAll('.contact').forEach((button) => {
  button.addEventListener('click', () => {
    byId('contact-result').hidden = true;
    (byId('contact-form') as HTMLFormElement).reset();
    dialog('contact-dialog').showModal();
  });
});
byId('contact-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const name = (byId('name') as HTMLInputElement).value.trim();
  const message = (byId('message') as HTMLTextAreaElement).value.trim();
  const result = byId('contact-result');
  result.hidden = false;
  if (!name || !message) {
    result.textContent = language === 'en' ? 'Please enter a name and message.' : 'Escribe tu nombre y mensaje.';
    return;
  }
  result.textContent = language === 'en'
    ? 'Preview ready, ' + name + '. This is a demo. Your message has not been sent or stored.'
    : 'Vista previa lista, ' + name + '. Este es un demo. Tu mensaje no se envió ni se guardó.';
});
translate();
