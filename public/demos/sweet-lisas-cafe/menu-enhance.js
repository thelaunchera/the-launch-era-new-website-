/* Sweet Lisa's view-only digital menu: search, category filters, photo previews.
   No favorites, cart, checkout, payments, online orders or fabricated prices. */
document.addEventListener('DOMContentLoaded', () => {
  const cards = Array.from(document.querySelectorAll('#dishGrid .dish-card'));
  const filters = Array.from(document.querySelectorAll('.filter-button[data-filter]'));
  const search = document.getElementById('dishSearch');
  const count = document.getElementById('resultsCount');
  const empty = document.getElementById('menuEmpty');
  const clear = document.getElementById('clearSearch');
  const dishDialog = document.getElementById('dishDialog');
  const breakfastDialog = document.getElementById('breakfastDialog');
  let category = 'all';
  let query = '';
  let lastFocusedDish = null;

  const knownCategories = new Set(filters.map(button => button.dataset.filter));

  function render() {
    const phrase = query.trim().toLocaleLowerCase();
    let visible = 0;

    cards.forEach(card => {
      const text = [card.dataset.title, card.dataset.description, card.dataset.kind]
        .filter(Boolean).join(' ').toLocaleLowerCase();
      const show = (category === 'all' || card.dataset.kind === category)
        && (!phrase || text.includes(phrase));
      card.hidden = !show;
      if (show) visible += 1;
    });

    filters.forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.filter === category));
    });
    if (count) count.textContent = visible + (visible === 1 ? ' dish' : ' dishes');
    if (empty) empty.hidden = visible > 0;
  }

  function setCategory(next, updateHash = true) {
    category = knownCategories.has(next) ? next : 'all';
    render();
    if (updateHash) {
      history.replaceState(null, '', location.pathname + location.search + '#' + category);
    }
  }

  filters.forEach(button => {
    button.addEventListener('click', () => setCategory(button.dataset.filter));
  });

  search?.addEventListener('input', () => {
    query = search.value;
    render();
  });

  clear?.addEventListener('click', () => {
    query = '';
    if (search) search.value = '';
    setCategory('all');
    search?.focus();
  });

  window.addEventListener('hashchange', () => {
    setCategory(location.hash.slice(1), false);
  });

  function closeDialog(dialog, reason) {
    if (dialog?.open) dialog.close();
    window.SiteScroll?.unlock(reason);
  }

  document.querySelectorAll('.dish-open').forEach(button => {
    button.setAttribute('aria-label', button.getAttribute('aria-label')?.replace('View details for', 'See photo and description of') || 'View dish');
    button.addEventListener('click', () => {
      const card = button.closest('.dish-card');
      if (!card || !dishDialog) return;
      const image = card.querySelector('img');
      if (!image) return;
      lastFocusedDish = button;
      const dialogImage = dishDialog.querySelector('#dishDialogImage');
      dialogImage.src = image.getAttribute('src');
      dialogImage.alt = image.alt;
      dishDialog.querySelector('#dishDialogName').textContent = card.dataset.title;
      dishDialog.querySelector('#dishDialogDescription').textContent = card.dataset.description;
      dishDialog.querySelector('#dishDialogCategory').textContent =
        card.dataset.kind === 'mains' ? 'MAIN PLATES' : card.dataset.kind.toUpperCase();
      dishDialog.showModal();
      window.SiteScroll?.lock('dish');
      dishDialog.querySelector('[data-close-dish]')?.focus();
    });
  });

  dishDialog?.querySelectorAll('[data-close-dish]').forEach(button =>
    button.addEventListener('click', () => closeDialog(dishDialog, 'dish'))
  );
  dishDialog?.addEventListener('close', () => {
    window.SiteScroll?.unlock('dish');
    lastFocusedDish?.focus({ preventScroll: true });
  });
  dishDialog?.addEventListener('click', e => {
    if (e.target === dishDialog) closeDialog(dishDialog, 'dish');
  });

  document.getElementById('openBreakfast')?.addEventListener('click', () => {
    breakfastDialog?.showModal();
    if (breakfastDialog?.open) window.SiteScroll?.lock('flyer');
  });
  document.getElementById('closeBreakfast')?.addEventListener('click', () =>
    closeDialog(breakfastDialog, 'flyer')
  );
  breakfastDialog?.addEventListener('close', () => window.SiteScroll?.unlock('flyer'));
  breakfastDialog?.addEventListener('click', e => {
    if (e.target === breakfastDialog) closeDialog(breakfastDialog, 'flyer');
  });

  setCategory(location.hash.slice(1), false);
});
