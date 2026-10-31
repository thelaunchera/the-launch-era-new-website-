const products = [
  { id: 'classic', name: 'Classic Chocolate Chip', priceCents: 350 },
  { id: 'double', name: 'Double Chocolate', priceCents: 450 },
  { id: 'caramel', name: 'Salted Caramel', priceCents: 550 },
  { id: 'raspberry', name: 'White Chocolate Raspberry', priceCents: 600 },
  { id: 'nutty', name: 'Nutty Dream', priceCents: 700 },
  { id: 'brownie', name: 'Brownie Chip', priceCents: 500 }
];
const labels = Object.fromEntries(products.map(p => [p.id, p.name]));
const unitPriceCents = Object.fromEntries(products.map(p => [p.id, p.priceCents]));
const formatPrice = cents => '$' + (cents / 100).toFixed(2);
const ids = products.map(p => p.id);
const qty = Object.fromEntries(ids.map(id => [id, 0]));
let toastTimer;
const photoFor = id => './assets/' + id + '-cutout-v1.webp?v=20261031-real-v1';
const $ = id => document.getElementById(id);
const dialog = $('box-dialog');
const deliveryDialog = $('delivery-dialog');
function closeBuilder() {
  resetBoxMotion();
  dialog.close();
}
const noteViewport = window.matchMedia ? window.matchMedia('(max-width:700px)') : null;
function positionGiftCard() {
  const card = $('gift-card');
  if (noteViewport && noteViewport.matches) $('note-preview-slot').appendChild(card);
  else $('reopen-box').before(card);
}
if (noteViewport && noteViewport.addEventListener) noteViewport.addEventListener('change', positionGiftCard);
function renderGiftCard() {
  const note = $('gift-note').value.trim();
  $('gift-card-message').textContent = note || 'A little something to brighten your day.';
  $('gift-card').classList.toggle('has-note', Boolean(note));
}

let size = 3;
let wrapping = 'Ivory Signature';
const total = () => Object.values(qty).reduce((a, b) => a + b, 0);
const selectionPriceCents = () => ids.reduce((sum, id) => sum + qty[id] * unitPriceCents[id], 0);


function renderLiveBox() {
  const tray = $('box-tray');
  tray.replaceChildren();
  tray.style.setProperty('--box-columns', size === 12 ? '4' : '3');
  const chosen = ids.flatMap(id => Array(qty[id]).fill(id));
  for(let index=0;index<size;index++) {
    const slot = document.createElement('div');
    slot.dataset.flavor = chosen[index] || '';
    slot.className = 'box-cookie-slot ' + (chosen[index] ? 'filled' : 'empty');
    if(chosen[index]) {
      const image = document.createElement('img');
      image.src = photoFor(chosen[index]);
      image.alt = '';
      image.title = labels[chosen[index]];
      image.loading = 'lazy';
      slot.appendChild(image);
    }
    tray.appendChild(slot);
  }
  $('live-box-shell').dataset.wrap = wrapping;
  $('live-box-count').textContent = total() + ' of ' + size + ' cookies';
  tray.setAttribute('aria-label', total() + ' of ' + size + ' cookies selected, ' + wrapping + ' packaging');
}
// The selection stays synchronous; motion is a cancellable decorative layer.
let transferAnimation;
let closeBoxTimer;
function resetBoxMotion() {
  clearTimeout(closeBoxTimer);
  if (transferAnimation) { transferAnimation.cancel(); transferAnimation = null; }
  document.querySelectorAll('.cookie-transfer').forEach(el => el.remove());
  document.querySelectorAll('.box-cookie-slot.arriving').forEach(el => el.classList.remove('arriving'));
  $('live-box-shell').classList.remove('is-closed');
  $('reopen-box').hidden = true;
}
function closeFullBox() {
  if (total() !== size || !dialog.open) return;
  $('live-box-shell').classList.add('is-closed');
  $('reopen-box').hidden = false;
}
function transferCookie(id, source) {
  if (!dialog.open) return;
  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const slots = [...document.querySelectorAll('#box-tray [data-flavor="' + id + '"]')];
  const target = slots[slots.length - 1];
  const origin = source && source.closest('.flavor-row');
  const finish = () => {
    if (total() === size) closeBoxTimer = setTimeout(closeFullBox, reduced ? 0 : 700);
  };
  if (!origin || !target || reduced || !target.animate) { finish(); return; }
  const a = origin.querySelector('img').getBoundingClientRect();
  const b = target.getBoundingClientRect();
  // Never fly a cookie out of sight on a scrolled phone or into a hidden surface.
  if (a.width === 0 || b.width === 0 || b.bottom < 0 || b.top > window.innerHeight || a.bottom < 0 || a.top > window.innerHeight) { finish(); return; }
  const stage = document.createElement('div');
  stage.className = 'cookie-transfer';
  stage.setAttribute('aria-hidden', 'true');
  const cookie = document.createElement('img');
  cookie.src = photoFor(id);
  cookie.alt = '';
  stage.appendChild(cookie);
  const tongs = document.createElementNS('http://www.w3.org/2000/svg','svg');
  tongs.setAttribute('viewBox','0 0 100 150');
  tongs.innerHTML = '<path d="M35 123L25 24Q25 5 42 5Q59 5 59 24L69 123" fill="none" stroke="#626c73" stroke-width="9" stroke-linecap="round"/><path d="M35 116l-9 18m43-18 9 18" stroke="#b3bec5" stroke-width="13" stroke-linecap="round"/>';
  stage.appendChild(tongs);
  Object.assign(stage.style,{left:a.left+'px',top:a.top+'px',width:a.width+'px',height:a.height+'px'});
  (dialog.open ? dialog : document.body).appendChild(stage);
  target.classList.add('arriving');
  const dx = b.left + b.width/2 - a.left - a.width/2;
  const dy = b.top + b.height/2 - a.top - a.height/2;
  const animation = stage.animate([
    {transform:'translate(0,0) scale(1) rotate(-8deg)',opacity:1},
    {transform:`translate(${dx*.45}px,${dy*.45-55}px) scale(1.12) rotate(8deg)`,offset:.48,opacity:1},
    {transform:`translate(${dx}px,${dy}px) scale(${b.width/a.width}) rotate(0deg)`,opacity:1}
  ],{duration:720,easing:'cubic-bezier(.3,.05,.25,1)',fill:'forwards'});
  transferAnimation = animation;
  animation.finished.then(() => {
    stage.remove(); target.classList.remove('arriving');
    if (transferAnimation === animation) { transferAnimation = null; finish(); }
  }).catch(() => { stage.remove(); target.classList.remove('arriving'); });
}
$('reopen-box').addEventListener('click', resetBoxMotion);
dialog.addEventListener('close', resetBoxMotion);
window.addEventListener('scroll', () => { if (transferAnimation) resetBoxMotion(); }, {passive:true});

function showAddedFeedback(id) {
  const toast = $('bag-feedback');
  $('feedback-text').textContent = labels[id] + ' added · ' + total() + '/' + size;
  toast.hidden = false;
  if(toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.hidden = true; }, 3800);
}

function paint() {
  const count = total();
  $('bag-count').textContent = String(count);
  $('open-builder').setAttribute('aria-label', 'Open bag, ' + count + (count === 1 ? ' cookie' : ' cookies'));
  for (const id of ids) $('qty-' + id).textContent = String(qty[id]);
  $('status-count').textContent = count + ' / ' + size;
  $('price-label').textContent = count === size ? 'Your box total' : 'Your selection so far';
  $('price-total').textContent = formatPrice(selectionPriceCents());
  $('status-text').textContent = count === size
    ? 'Your box is ready to preview'
    : count === 0 ? 'Choose ' + size + ' cookies'
    : 'Add ' + (size - count) + ' more cookie' + (size - count === 1 ? '' : 's');
  $('progress-fill').style.width = (100 * count / size) + '%';
  document.querySelectorAll('[data-pack]').forEach(button => {
    const active = Number(button.dataset.pack) === size;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  document.querySelectorAll('[data-wrap]').forEach(button => {
    const active = button.dataset.wrap === wrapping;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  renderLiveBox();
  $('preview').hidden = true;
}

function openDialog() {
  $('preview').hidden = true;
  if (!dialog.open) {
    resetBoxMotion();
    dialog.showModal();
  }
}
function add(id, source) {
  if (total() >= size) {
    openDialog();
    $('status-text').textContent = 'Box is full. Remove a cookie or choose a larger box.';
    return;
  }
  resetBoxMotion();
  qty[id]++;
  paint();
  transferCookie(id, source);
  if (source && source.closest('.cookie-visual')) showAddedFeedback(id);
}
function remove(id) {
  resetBoxMotion();
  qty[id] = Math.max(0, qty[id] - 1);
  paint();
}
function changeSize(next) {
  if (![3, 6, 12].includes(next)) return;
  resetBoxMotion();
  size = next;
  let extra = total() - size;
  for (const id of [...ids].reverse()) {
    if (extra <= 0) break;
    const take = Math.min(extra, qty[id]);
    qty[id] -= take;
    extra -= take;
  }
  paint();
}

document.querySelectorAll('[data-add]').forEach(button => button.addEventListener('click', () => add(button.dataset.add, button)));
$('feedback-open').addEventListener('click', () => { $('bag-feedback').hidden = true; openDialog(); });
document.querySelectorAll('[data-minus]').forEach(button => button.addEventListener('click', () => remove(button.dataset.minus)));
document.querySelectorAll('[data-pack]').forEach(button => button.addEventListener('click', () => changeSize(Number(button.dataset.pack))));
document.querySelectorAll('[data-wrap]').forEach(button => button.addEventListener('click', () => {
  resetBoxMotion();
  wrapping = button.dataset.wrap;
  paint();
}));
$('open-builder').addEventListener('click', openDialog);
document.querySelectorAll('[data-open-builder]').forEach(button => button.addEventListener('click', openDialog));
$('close-builder').addEventListener('click', closeBuilder);
dialog.addEventListener('click', event => { if (event.target === dialog) closeBuilder(); });
$('gift-note').addEventListener('input', () => { $('preview').hidden = true; renderGiftCard(); });
$('preview-button').addEventListener('click', () => {
  if (total() !== size) {
    $('status-text').textContent = 'Add ' + (size - total()) + ' more cookie' + (size - total() === 1 ? '' : 's') + ' to preview your box.';
    return;
  }
  resetBoxMotion();
  closeFullBox();
  const target = $('preview');
  target.replaceChildren();
  const reveal = document.createElement('div');
  reveal.className = 'gift-reveal';
  reveal.dataset.wrap = wrapping;
  const brand = document.createElement('span');
  brand.textContent = 'crumb.';
  const ready = document.createElement('small');
  ready.textContent = 'YOUR BOX IS READY';
  reveal.append(brand, ready);
  target.appendChild(reveal);
  const title = document.createElement('h3');
  title.textContent = 'Good things, beautifully boxed.';
  target.appendChild(title);
  const photos = document.createElement('div');
  photos.className = 'preview-photos';
  const list = document.createElement('ul');
  for (const id of ids.filter(id => qty[id] > 0)) {
    const image = document.createElement('img');
    image.src = photoFor(id);
    image.alt = labels[id];
    photos.appendChild(image);
    const item = document.createElement('li');
    item.textContent = qty[id] + ' × ' + labels[id] + ' · ' + formatPrice(unitPriceCents[id]) + ' each · ' + formatPrice(qty[id] * unitPriceCents[id]);
    list.appendChild(item);
  }
  target.append(photos, list);
  const subtotal = document.createElement('p');
  subtotal.className = 'preview-total';
  subtotal.textContent = 'Sample box total: ' + formatPrice(selectionPriceCents());
  target.appendChild(subtotal);
  const packaging = document.createElement('p');
  packaging.textContent = 'Packaging: ' + wrapping + ' · included';
  target.appendChild(packaging);
  const note = $('gift-note').value.trim();
  if (note) {
    const message = document.createElement('p');
    message.className = 'preview-note';
    message.textContent = 'Message: ' + note;
    target.appendChild(message);
  }
  target.hidden = false;
  target.scrollIntoView({ block: 'nearest', behavior: window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
});
$('open-delivery').addEventListener('click', () => deliveryDialog.showModal());
$('close-delivery').addEventListener('click', () => deliveryDialog.close());
deliveryDialog.addEventListener('click', event => { if (event.target === deliveryDialog) deliveryDialog.close(); });
$('delivery-build').addEventListener('click', () => {
  deliveryDialog.close();
  openDialog();
});

// These interactive previews are deliberately local-only: never send, track, or
// persist contact details. No checkout, customer list, or live social account.
const contactDialog = $('contact-dialog');
const contactForm = $('contact-form');
const contactFeedback = $('contact-feedback');
function openContact() {
  contactForm.reset();
  contactForm.hidden = false;
  contactFeedback.hidden = true;
  if (!contactDialog.open) contactDialog.showModal();
}
function closeContact() {
  contactDialog.close();
  contactForm.reset();
  contactForm.hidden = false;
  contactFeedback.hidden = true;
}
document.querySelectorAll('[data-open-contact]').forEach(button => button.addEventListener('click', openContact));
$('close-contact').addEventListener('click', closeContact);
contactDialog.addEventListener('click', event => { if (event.target === contactDialog) closeContact(); });
contactDialog.addEventListener('close', () => {
  contactForm.reset();
  contactForm.hidden = false;
  contactFeedback.hidden = true;
});
contactForm.addEventListener('submit', event => {
  event.preventDefault();
  if (!contactForm.checkValidity()) {
    contactForm.reportValidity();
    return;
  }
  // Clear everything before showing a simulated confirmation. No values are read.
  contactForm.reset();
  contactForm.hidden = true;
  contactFeedback.hidden = false;
});
$('contact-again').addEventListener('click', () => {
  contactForm.hidden = false;
  contactFeedback.hidden = true;
  $('contact-name').focus();
});

const socialDialog = $('social-dialog');
document.querySelectorAll('[data-social]').forEach(button => {
  button.addEventListener('click', () => {
    $('social-platform').textContent = button.dataset.social + ' · fictional account preview';
    if (!socialDialog.open) socialDialog.showModal();
  });
});
$('close-social').addEventListener('click', () => socialDialog.close());
$('social-back').addEventListener('click', () => socialDialog.close());
socialDialog.addEventListener('click', event => { if (event.target === socialDialog) socialDialog.close(); });
paint();
renderGiftCard();
positionGiftCard();


// CRUMB editorial gallery: phone and tablet use one swipeable three-photo carousel.
// Preserve unique photographs, snapping, keyboard arrows and accessible dot navigation.
{
  const gallery = document.getElementById('crumb-gallery-track');
  const slides = gallery ? [...gallery.querySelectorAll('figure')] : [];
  const dots = [...document.querySelectorAll('.crumb-gallery-dot')];
  const count = document.querySelector('.crumb-gallery-counter');
  if (gallery && slides.length === 3 && dots.length === 3 && count) {
    let current = 0;
    const reducedMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const highlight = (index) => {
      current = Math.max(0, Math.min(slides.length - 1, index));
      dots.forEach((dot, i) => dot.setAttribute('aria-current', String(i === current)));
      count.textContent = `${current + 1} / ${slides.length}`;
    };
    dots.forEach((dot, index) => dot.addEventListener('click', () => {
      highlight(index);
      const targetLeft = slides[index].offsetLeft - slides[0].offsetLeft;
      if (typeof gallery.scrollTo === 'function') {
        gallery.scrollTo({left: targetLeft, behavior: reducedMotion() ? 'auto' : 'smooth'});
      } else {
        gallery.scrollLeft = targetLeft;
      }
    }));
    let scheduled = false;
    gallery.addEventListener('scroll', () => {
      if (scheduled) return;
      scheduled = true;
      window.requestAnimationFrame(() => {
        scheduled = false;
        const snapX = gallery.getBoundingClientRect().left + 18;
        let nearest = 0;
        let distance = Infinity;
        slides.forEach((slide, i) => {
          const d = Math.abs(slide.getBoundingClientRect().left - snapX);
          if (d < distance) { distance = d; nearest = i; }
        });
        highlight(nearest);
      });
    }, {passive:true});
    gallery.addEventListener('keydown', event => {
      if (!window.matchMedia || !window.matchMedia('(max-width:1366px)').matches) return;
      const next = event.key === 'ArrowRight' ? current + 1 : event.key === 'ArrowLeft' ? current - 1 : null;
      if (next === null || next < 0 || next >= slides.length) return;
      event.preventDefault();
      dots[next].click();
    });
  }
}
