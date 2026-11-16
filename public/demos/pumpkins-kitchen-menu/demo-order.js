/* Pumpkin's Kitchen — ephemeral, browser-only simulated pickup flow.
   Never submits an order, sends mail/SMS, stores personal details, or charges money. */
(() => {
  'use strict';
  const byId = (id) => document.getElementById(id);
  const money = (amount) => '$' + amount.toFixed(2);
  const priceOptions = (item) => item.p.split('/').map((value, index) => ({
    label: item.p.includes('/') ? `Option ${index + 1}` : 'Standard',
    amount: Number(value.replace(/[^\d.]/g, '')),
    index
  })).filter((option) => Number.isFinite(option.amount) && option.amount > 0);
  const cart = new Map();
  const cartDialog = byId('cartDialog');
  const orderDialog = byId('orderDialog');
  const dishDialog = byId('dishModal');
  let currentItem = null;
  let stage = 0;
  let orderCounter = 1000;
  const toast = document.createElement('div');
  toast.className = 'demo-toast';
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  toast.hidden = true;
  document.body.append(toast);
  let toastTimer;
  const announce = (message) => {
    toast.textContent = message;
    toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.hidden = true, 1800);
  };
  const cartTotal = () => [...cart.values()].reduce((sum, entry) => sum + entry.price * entry.quantity, 0);
  const cartCount = () => [...cart.values()].reduce((sum, entry) => sum + entry.quantity, 0);
  function updateCartIndicator() {
    const quantity = cartCount();
    byId('cartCount').textContent = String(quantity);
    byId('cartOpen').setAttribute('aria-label', `Open sample cart, ${quantity} item${quantity === 1 ? '' : 's'}`);
    byId('cartBar').hidden = quantity === 0;
    byId('cartBarCount').textContent = String(quantity);
    byId('cartBarTotal').textContent = money(cartTotal());
  }
  function prepareItem(item) {
    currentItem = item;
    const options = priceOptions(item);
    const wrap = byId('modalOptions');
    const select = byId('variantSelect');
    select.replaceChildren();
    options.forEach((option) => {
      const choice = document.createElement('option');
      choice.value = String(option.index);
      choice.textContent = `${option.label} — ${money(option.amount)}`;
      select.append(choice);
    });
    wrap.hidden = options.length <= 1;
    const setPrice = () => {
      const selected = options[Number(select.value) || 0];
      byId('modalPrice').textContent = selected ? money(selected.amount) : item.p;
    };
    select.onchange = setPrice;
    setPrice();
  }
  function addItem(item, selectedIndex) {
    const options = priceOptions(item);
    if (options.length === 0) return announce('This menu price cannot be added yet.');
    if (options.length > 1 && selectedIndex === undefined) {
      showItem(item); // Original details dialog includes a price-option chooser.
      return;
    }
    const option = options[selectedIndex ?? 0];
    if (!option) return;
    const id = `${items.indexOf(item)}:${option.index}`;
    const existing = cart.get(id);
    if (existing) existing.quantity += 1;
    else cart.set(id, { id, item, variant: option.label, price: option.amount, quantity: 1, multiple: options.length > 1 });
    updateCartIndicator();
    if (cartDialog.open) renderCart();
    announce(`${item.n} added to demo cart`);
  }
  function changeQuantity(id, difference) {
    const entry = cart.get(id);
    if (!entry) return;
    entry.quantity += difference;
    if (entry.quantity <= 0) cart.delete(id);
    updateCartIndicator();
    renderCart();
  }
  function renderCart() {
    const host = byId('cartItems');
    host.replaceChildren();
    for (const entry of cart.values()) {
      const row = document.createElement('div');
      row.className = 'cart-row';
      const info = document.createElement('div');
      const name = document.createElement('strong');
      name.textContent = entry.item.n;
      info.append(name);
      if (entry.multiple) {
        const variant = document.createElement('small');
        variant.textContent = `${entry.variant} · ${money(entry.price)} each`;
        info.append(variant);
      }
      const qty = document.createElement('div');
      qty.className = 'cart-qty';
      const minus = document.createElement('button');
      minus.type = 'button';
      minus.textContent = '−';
      minus.setAttribute('aria-label', `Remove one ${entry.item.n}`);
      minus.addEventListener('click', () => changeQuantity(entry.id, -1));
      const value = document.createElement('span');
      value.textContent = String(entry.quantity);
      const plus = document.createElement('button');
      plus.type = 'button';
      plus.textContent = '+';
      plus.setAttribute('aria-label', `Add one more ${entry.item.n}`);
      plus.addEventListener('click', () => changeQuantity(entry.id, 1));
      qty.append(minus, value, plus);
      info.append(qty);
      const amount = document.createElement('div');
      amount.className = 'cart-row-price';
      amount.textContent = money(entry.quantity * entry.price);
      row.append(info, amount);
      host.append(row);
    }
    byId('cartEmpty').hidden = cart.size > 0;
    byId('cartCheckout').hidden = cart.size === 0;
    byId('cartTotal').textContent = money(cartTotal());
  }
  function openCart() {
    if (dishDialog.open) dishDialog.close();
    renderCart();
    if (!cartDialog.open) cartDialog.showModal();
    document.body.classList.add('no-scroll');
  }
  function renderStatus() {
    const titles = ['Received', 'Preparing', 'Ready for pickup'];
    const messages = [
      'We’ve received your sample order.',
      'Your sample order is now being prepared.',
      'Your sample order is ready for pickup.'
    ];
    byId('orderStatusPill').textContent = titles[stage];
    byId('mockNotification').textContent = messages[stage];
    [...byId('orderTrack').children].forEach((step, index) => {
      step.classList.toggle('is-complete', index < stage);
      step.classList.toggle('is-current', index === stage);
    });
    const advance = byId('advanceOrder');
    advance.hidden = stage === 2;
    if (stage < 2) advance.textContent = stage === 0 ? 'Mark as Preparing' : 'Mark as Ready for Pickup';
    byId('orderTitle').innerHTML = stage === 0 ? 'Sample order <em>received.</em>' : stage === 1 ? 'Now <em>preparing.</em>' : 'Ready for <em>pickup.</em>';
  }
  function placeDemoOrder(event) {
    event.preventDefault();
    if (!cart.size) return;
    const subtotal = cartTotal();
    const summary = [...cart.values()].map((entry) => ({ ...entry }));
    const name = byId('demoGuestName').value.trim() || 'Demo Guest';
    byId('orderNumber').textContent = 'DEMO-' + (++orderCounter);
    byId('orderGuest').textContent = name;
    const receipt = byId('orderSummary');
    receipt.replaceChildren();
    for (const entry of summary) {
      const line = document.createElement('div');
      line.className = 'receipt-row';
      const label = document.createElement('span');
      label.textContent = `${entry.quantity} × ${entry.item.n}${entry.multiple ? ' (' + entry.variant + ')' : ''}`;
      const price = document.createElement('strong');
      price.textContent = money(entry.quantity * entry.price);
      line.append(label, price);
      receipt.append(line);
    }
    byId('orderTotal').textContent = money(subtotal);
    // Never read/store the note after this ephemeral form interaction.
    byId('demoOrderForm').reset();
    cart.clear();
    updateCartIndicator();
    renderCart();
    cartDialog.close();
    stage = 0;
    renderStatus();
    orderDialog.showModal();
    document.body.classList.add('no-scroll');
  }
  byId('cartOpen').addEventListener('click', openCart);
  byId('cartBar').addEventListener('click', openCart);
  byId('cartClose').addEventListener('click', () => cartDialog.close());
  cartDialog.addEventListener('close', () => { if (!orderDialog.open && !dishDialog.open) document.body.classList.remove('no-scroll'); });
  orderDialog.addEventListener('close', () => { if (!cartDialog.open && !dishDialog.open) document.body.classList.remove('no-scroll'); });
  byId('modalAdd').addEventListener('click', () => {
    if (!currentItem) return;
    const selectedIndex = Number(byId('variantSelect').value || 0);
    const item = currentItem;
    dishDialog.close();
    addItem(item, selectedIndex);
  });
  byId('demoOrderForm').addEventListener('submit', placeDemoOrder);
  byId('advanceOrder').addEventListener('click', () => { if (stage < 2) { stage += 1; renderStatus(); } });
  byId('closeOrder').addEventListener('click', () => orderDialog.close());
  byId('resetOrder').addEventListener('click', () => {
    orderDialog.close();
    search.value = '';
    active = 'all';
    render();
    byId('categoryTabs').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  window.DemoOrder = { addItem, prepareItem, openCart, getCount: cartCount, getTotal: cartTotal };
  updateCartIndicator();
})();
