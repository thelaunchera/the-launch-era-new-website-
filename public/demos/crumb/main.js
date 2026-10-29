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
const photoFor = id => './assets/' + id + '.webp?v=20261029-crumb-v7';
const $ = id => document.getElementById(id);
const dialog = $('box-dialog');
const deliveryDialog = $('delivery-dialog');
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
  if (!dialog.open) dialog.showModal();
}
function add(id, source) {
  if (total() >= size) {
    openDialog();
    $('status-text').textContent = 'Box is full. Remove a cookie or choose a larger box.';
    return;
  }
  qty[id]++;
  paint();
  if (source && source.closest('.cookie-visual')) showAddedFeedback(id);
}
function remove(id) {
  qty[id] = Math.max(0, qty[id] - 1);
  paint();
}
function changeSize(next) {
  if (![3, 6, 12].includes(next)) return;
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
  wrapping = button.dataset.wrap;
  paint();
}));
$('open-builder').addEventListener('click', openDialog);
document.querySelectorAll('[data-open-builder]').forEach(button => button.addEventListener('click', openDialog));
$('close-builder').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
$('gift-note').addEventListener('input', () => { $('preview').hidden = true; });
$('preview-button').addEventListener('click', () => {
  if (total() !== size) {
    $('status-text').textContent = 'Add ' + (size - total()) + ' more cookie' + (size - total() === 1 ? '' : 's') + ' to preview your box.';
    return;
  }
  const target = $('preview');
  target.replaceChildren();
  const title = document.createElement('h3');
  title.textContent = 'Your gift box';
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
  target.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
});
$('open-delivery').addEventListener('click', () => deliveryDialog.showModal());
$('close-delivery').addEventListener('click', () => deliveryDialog.close());
deliveryDialog.addEventListener('click', event => { if (event.target === deliveryDialog) deliveryDialog.close(); });
$('delivery-build').addEventListener('click', () => {
  deliveryDialog.close();
  openDialog();
});
paint();
