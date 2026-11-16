/* Search, categories, saved dishes and dish preview for Sweet Lisa's concept menu.
   No checkout, prices or ordering are implied by the interactions. */
document.addEventListener('DOMContentLoaded', () => {
  const cards = [...document.querySelectorAll('#dishGrid .dish-card')];
  const filters = [...document.querySelectorAll('.filter-button[data-filter]')];
  const search = document.getElementById('dishSearch');
  const count = document.getElementById('resultsCount');
  const empty = document.getElementById('menuEmpty');
  const clear = document.getElementById('clearSearch');
  const dialog = document.getElementById('dishDialog');
  const flyer = document.getElementById('breakfastDialog');
  let category = 'all';
  let query = '';
  let favorites = [];
  const storageKey = 'sweet-lisas-cafe-demo-favorites-v1';

  try {
    const stored = JSON.parse(localStorage.getItem(storageKey) || '[]');
    if (Array.isArray(stored)) favorites = stored.filter(item => typeof item === 'string');
  } catch (_) { favorites = []; }

  const getCardId = card => card.dataset.dishId;
  function setSaved() {
    for (const button of document.querySelectorAll('.dish-favorite')) {
      const active = favorites.includes(button.dataset.favorite);
      button.setAttribute('aria-pressed', String(active));
      button.setAttribute('aria-label', (active ? 'Remove ' : 'Save ') + button.dataset.dishName + (active ? ' from favorites' : ' to favorites'));
      button.textContent = active ? '♥' : '♡';
    }
    const favCount = document.getElementById('favoritesCount');
    if (favCount) favCount.textContent = favorites.length > 0 ? ' (' + favorites.length + ')' : '';
  }

  function render() {
    const q = query.trim().toLowerCase();
    let visible = 0;
    for (const card of cards) {
      const matchesCategory = category === 'all'
        || (category === 'saved' ? favorites.includes(getCardId(card)) : card.dataset.kind === category);
      const searchableText = (card.dataset.title + ' ' + card.dataset.description + ' ' + card.dataset.kind).toLowerCase();
      const show = matchesCategory && (!q || searchableText.includes(q));
      card.hidden = !show;
      if (show) visible++;
    }
    filters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === category)));
    if (count) count.textContent = visible + (visible === 1 ? ' dish' : ' dishes') + ' to explore';
    if (empty) empty.hidden = visible > 0;
    setSaved();
  }

  function filterBy(kind, updateUrl = true) {
    category = filters.some(button => button.dataset.filter === kind) ? kind : 'all';
    render();
    if (updateUrl) history.replaceState(null, '', location.pathname + location.search + (category === 'all' ? '#all' : '#' + category));
  }

  filters.forEach(button => button.addEventListener('click', () => filterBy(button.dataset.filter)));
  search?.addEventListener('input', () => { query = search.value; render(); });
  clear?.addEventListener('click', () => { query = ''; if (search) search.value = ''; filterBy('all'); search?.focus(); });
  window.addEventListener('hashchange', () => filterBy(location.hash.slice(1), false));
  document.querySelectorAll('.dish-favorite').forEach(button => button.addEventListener('click', () => {
    const id = button.dataset.favorite;
    favorites = favorites.includes(id) ? favorites.filter(item => item !== id) : [...favorites, id];
    try { localStorage.setItem(storageKey, JSON.stringify(favorites)); } catch (_) {}
    render();
  }));

  function closeDialog(dlg, reason) {
    if (dlg?.open) dlg.close();
    window.SiteScroll?.unlock(reason);
  }
  document.querySelectorAll('.dish-open').forEach(button => button.addEventListener('click', () => {
    const card = button.closest('.dish-card');
    if (!card || !dialog) return;
    dialog.querySelector('#dishDialogImage').src = card.querySelector('img').getAttribute('src');
    dialog.querySelector('#dishDialogImage').alt = card.querySelector('img').alt;
    dialog.querySelector('#dishDialogName').textContent = card.dataset.title;
    dialog.querySelector('#dishDialogDescription').textContent = card.dataset.description;
    dialog.querySelector('#dishDialogCategory').textContent = card.dataset.kind === 'mains' ? 'MAIN PLATES' : card.dataset.kind.toUpperCase();
    dialog.showModal();
    window.SiteScroll?.lock('dish');
    dialog.querySelector('[data-close-dish]')?.focus();
  }));
  dialog?.querySelectorAll('[data-close-dish]').forEach(button => button.addEventListener('click', () => closeDialog(dialog, 'dish')));
  dialog?.addEventListener('close', () => window.SiteScroll?.unlock('dish'));
  dialog?.addEventListener('click', event => { if (event.target === dialog) closeDialog(dialog, 'dish'); });

  const openFlyer = document.getElementById('openBreakfast');
  const closeFlyer = document.getElementById('closeBreakfast');
  openFlyer?.addEventListener('click', () => {
    if (!flyer) return;
    flyer.showModal();
    window.SiteScroll?.lock('flyer');
  });
  closeFlyer?.addEventListener('click', () => closeDialog(flyer, 'flyer'));
  flyer?.addEventListener('close', () => window.SiteScroll?.unlock('flyer'));
  flyer?.addEventListener('click', event => { if (event.target === flyer) closeDialog(flyer, 'flyer'); });

  filterBy(location.hash.slice(1), false);
});
