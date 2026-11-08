
// @ts-nocheck
// Photo galleries used by the seven sections of the Brand Board.
// Image bytes live in IndexedDB; brand metadata remains in the existing localStorage model.
export const SECTION_DEFS = [
  { id: 'hero', label: 'Portada', note: 'Fotografías junto al encabezado' },
  { id: 'identity', label: 'Identidad', note: 'Logos, símbolos y detalles de marca' },
  { id: 'palette', label: 'Colores', note: 'Referencias fotográficas de la paleta' },
  { id: 'typography', label: 'Tipografía', note: 'Referencias de títulos y composición' },
  { id: 'pattern', label: 'Patrones', note: 'Texturas, ilustraciones y superficies' },
  { id: 'applications', label: 'Aplicaciones', note: 'Packaging, website y piezas reales' },
  { id: 'universe', label: 'Universo visual', note: 'Moodboard de la marca' },
];

const MAX_PER_SECTION = 10;
const cache = new Map();
const sectionNames = new Set(SECTION_DEFS.map(item => item.id));
let dbPromise = null;

const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]
));
function database() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error('El navegador no permite guardar fotos'));
      return;
    }
    const request = indexedDB.open('tle-brand-board-gallery', 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains('photos')) {
        request.result.createObjectStore('photos');
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error('No se pudo abrir la biblioteca de imágenes'));
  });
  return dbPromise;
}
async function readPhoto(id) {
  if (cache.has(id)) return cache.get(id);
  try {
    const db = await database();
    const url = await new Promise((resolve, reject) => {
      const request = db.transaction('photos', 'readonly').objectStore('photos').get(id);
      request.onsuccess = () => resolve(request.result || '');
      request.onerror = () => reject(request.error);
    });
    cache.set(id, url);
    return url;
  } catch {
    return '';
  }
}
async function putPhoto(id, url) {
  const db = await database();
  await new Promise((resolve, reject) => {
    const tx = db.transaction('photos', 'readwrite');
    tx.objectStore('photos').put(url, id);
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
  cache.set(id, url);
}
async function dropPhoto(id) {
  cache.delete(id);
  try {
    const db = await database();
    await new Promise((resolve, reject) => {
      const tx = db.transaction('photos', 'readwrite');
      tx.objectStore('photos').delete(id);
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  } catch { /* Removing metadata still hides the photo. */ }
}
export async function getGalleryPhotoSource(id) {
  if(typeof id!=='string'||!(/^[a-f0-9]{8}-[a-f0-9-]{27,40}$/i.test(id)||/^photo-[a-z0-9-]{5,140}$/i.test(id)))return '';
  return cache.get(id)||await readPhoto(id)||'';
}
export function ensureGallery(brand) {
  if (!brand.sectionPhotos || typeof brand.sectionPhotos !== 'object' || Array.isArray(brand.sectionPhotos)) {
    brand.sectionPhotos = {};
  }
  for (const section of SECTION_DEFS) {
    if (!Array.isArray(brand.sectionPhotos[section.id])) brand.sectionPhotos[section.id] = [];
  }
  return brand.sectionPhotos;
}
export function sectionCount(brand, section) {
  return ensureGallery(brand)[section]?.length || 0;
}
export function addControl(section, label = '＋ Añadir fotos') {
  if (!sectionNames.has(section)) return '';
  return '<button type="button" class="gallery-add-control" data-action="section-add" data-section="' +
    section + '" aria-label="Añadir fotos a ' + section + '">' + escapeHtml(label) + '</button>';
}
export function galleryHTML(brand, section) {
  if (!sectionNames.has(section)) return '';
  const photos = ensureGallery(brand)[section];
  if (!photos.length) return '<div class="gallery-dropzone gallery-empty" data-section-drop="' + section + '">' +
    '<span>Arrastra fotos aquí o usa «Añadir fotos»</span></div>';
  const tiles = photos.map((photo, index) => {
    const source = cache.get(photo.id) || '';
    const picture = source
      ? '<img src="' + escapeHtml(source) + '" alt="Imagen ' + (index + 1) + ' de ' + section + '" style="object-fit:' +
        (photo.fit === 'contain' ? 'contain' : 'cover') + ';object-position:' +
        Math.max(0, Math.min(100, Number(photo.x ?? 50))) + '% ' +
        Math.max(0, Math.min(100, Number(photo.y ?? 50))) + '%;">'
      : '<div class="gallery-image-loading">Cargando foto…</div>';
    return '<div class="gallery-photo-card" data-section="' + section + '" data-image-id="' +
      escapeHtml(photo.id) + '" draggable="true">' +
      '<div class="gallery-photo-media">' + picture + '</div>' +
      '<div class="gallery-photo-bar"><span class="gallery-photo-number">Foto ' + (index + 1) + '</span>' +
      '<div class="gallery-photo-actions">' +
      '<button type="button" data-action="gallery-left" data-section="' + section + '" data-id="' + escapeHtml(photo.id) +
      '" aria-label="Mover foto a la izquierda" title="Mover a la izquierda">←</button>' +
      '<button type="button" data-action="gallery-right" data-section="' + section + '" data-id="' + escapeHtml(photo.id) +
      '" aria-label="Mover foto a la derecha" title="Mover a la derecha">→</button>' +
      '<button type="button" data-action="gallery-fit" data-section="' + section + '" data-id="' + escapeHtml(photo.id) +
      '" aria-label="Cambiar ajuste de foto" title="Alternar llenar o ajustar">⊡</button>' +
      '<button type="button" class="gallery-replace-label" data-action="gallery-replace" data-section="' + section + '" data-id="' + escapeHtml(photo.id) +
      '" aria-label="Cambiar foto" title="Cambiar fotografía">Cambiar foto</button>' +
      '<button type="button" data-action="gallery-review" data-section="' + section + '" data-id="' + escapeHtml(photo.id) +
      '" aria-label="Revisar fotografía en grande" title="Revisar detalles">◎</button>' +
      '<button type="button" class="gallery-remove" data-action="gallery-delete" data-section="' + section + '" data-id="' +
      escapeHtml(photo.id) + '" aria-label="Eliminar foto" title="Eliminar fotografía">Eliminar foto</button></div></div></div>';
  }).join('');
  return '<div class="gallery-dropzone" data-section-drop="' + section + '">' +
    '<div class="section-photo-grid gallery-count-' + Math.min(3,photos.length) + '">' + tiles + '</div></div>';
}
export function galleryManagerHTML(brand) {
  const gallery = ensureGallery(brand);
  return '<div class="gallery-manager"><div class="gallery-manager-title">Fotos por sección</div>' +
    '<p>Selecciona una sección o añade fotos directamente desde el tablero.</p>' +
    SECTION_DEFS.map(section => '<div class="gallery-manager-row"><div><strong>' +
      escapeHtml(section.label) + '</strong><small>' + gallery[section.id].length + ' fotos · ' +
      escapeHtml(section.note) + '</small></div>' + addControl(section.id, '＋ Añadir') +
      '</div>').join('') +
    '<p class="gallery-storage-note">Las imágenes se guardan en este dispositivo. Haz un respaldo al terminar.</p></div>';
}
export async function loadGallery(brand) {
  const ids = Object.values(ensureGallery(brand)).flatMap(items => items.map(item => item.id));
  const missing = ids.filter(id => !cache.has(id));
  if (!missing.length) return false;
  await Promise.all(missing.map(readPhoto));
  return true;
}
function freshId() {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : 'photo-' + Date.now() + '-' + Math.random().toString(36).slice(2);
}
async function fileToDataURL(file) {
  if (!file.type.startsWith('image/')) throw new Error('Selecciona una foto o imagen compatible.');
  if (file.size > 25 * 1024 * 1024) throw new Error('Cada archivo debe pesar menos de 25 MB.');
  // Keep the exact original pixels and compression; do not downsample or convert to JPEG.
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('No se pudo leer la imagen original.'));
    reader.onload = () => resolve(String(reader.result || ''));
    reader.readAsDataURL(file);
  });
}
export async function addFiles(brand, section, files, persist, replacementId = '') {
  if (!sectionNames.has(section)) throw new Error('Sección no válida.');
  const gallery = ensureGallery(brand);
  const incoming = Array.from(files).filter(file => file && file.type.startsWith('image/'));
  if (!incoming.length) throw new Error('Selecciona imágenes JPG, PNG o WEBP.');
  if (!replacementId && gallery[section].length + incoming.length > MAX_PER_SECTION) {
    throw new Error('Puedes añadir hasta ' + MAX_PER_SECTION + ' fotos por sección.');
  }
  let added = 0;
  for (const file of replacementId ? incoming.slice(0, 1) : incoming) {
    const data = await fileToDataURL(file);
    if (replacementId) {
      if (!gallery[section].some(item => item.id === replacementId)) throw new Error('No encontramos la foto que deseas reemplazar.');
      await putPhoto(replacementId, data);
      added++;
    } else {
      const id = freshId();
      await putPhoto(id, data);
      gallery[section].push({ id, fit: 'contain', x: 50, y: 50 });
      if (!persist()) {
        gallery[section].pop();
        await dropPhoto(id);
        throw new Error('No hay espacio para guardar los cambios de la marca.');
      }
      added++;
    }
  }
  persist();
  return added;
}
export async function removePhoto(brand, section, id, persist) {
  const items = ensureGallery(brand)[section];
  if (!items) return;
  const index = items.findIndex(item => item.id === id);
  if (index < 0) return;
  const [removed] = items.splice(index, 1);
  if (!persist()) {
    items.splice(index, 0, removed);
    throw new Error('No se pudo guardar el cambio.');
  }
  await dropPhoto(id);
}
export function movePhoto(brand, section, id, direction, persist) {
  const items = ensureGallery(brand)[section] || [];
  const i = items.findIndex(item => item.id === id);
  const to = i + direction;
  if (i < 0 || to < 0 || to >= items.length) return;
  const [item] = items.splice(i, 1);
  items.splice(to, 0, item);
  persist();
}
export function movePhotoTo(brand, section, id, targetId, persist) {
  const items = ensureGallery(brand)[section] || [];
  const from = items.findIndex(item => item.id === id);
  const to = items.findIndex(item => item.id === targetId);
  if (from < 0 || to < 0 || from === to) return;
  const [item] = items.splice(from, 1);
  items.splice(to, 0, item);
  persist();
}
export function toggleFit(brand, section, id, persist) {
  const item = (ensureGallery(brand)[section] || []).find(v => v.id === id);
  if (!item) return;
  item.fit = item.fit === 'contain' ? 'cover' : 'contain';
  persist();
}
export async function duplicateGallery(original, copied) {
  const source = ensureGallery(original);
  const target = ensureGallery(copied);
  for (const section of SECTION_DEFS) {
    target[section.id] = [];
    for (const item of source[section.id]) {
      const data = await readPhoto(item.id);
      if (!data) continue;
      const id = freshId();
      await putPhoto(id, data);
      target[section.id].push({ ...item, id });
    }
  }
}
export async function galleryBackup(brands) {
  const backup = {};
  for (const brand of brands) {
    for (const items of Object.values(ensureGallery(brand))) {
      for (const item of items) {
        const data = await readPhoto(item.id);
        if (data) backup[item.id] = data;
      }
    }
  }
  return backup;
}
export async function galleryRestore(pictures) {
  if (!pictures || typeof pictures !== 'object') return;
  for (const [id, data] of Object.entries(pictures)) {
    if (id.length < 150 && typeof data === 'string' && data.startsWith('data:image/')) {
      await putPhoto(id, data);
    }
  }
}
export async function appendixRows(brand) {
  const out = [];
  for (const section of SECTION_DEFS) {
    const items = ensureGallery(brand)[section.id];
    if (!items.length) continue;
    const photos = [];
    for (const item of items) {
      const src = await readPhoto(item.id);
      if (src) photos.push({ src, fit: item.fit || 'cover', x: item.x || 50, y: item.y || 50 });
    }
    if (photos.length) out.push({ title: section.label, photos });
  }
  return out;
}
