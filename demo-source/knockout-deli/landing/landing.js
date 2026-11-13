'use strict';
(() => {
  const toggle = document.getElementById('menu-toggle');
  const mobile = document.getElementById('mobile-nav');
  const lang = document.getElementById('language-toggle');
  const closeNav = () => { mobile.hidden = true; toggle.setAttribute('aria-expanded','false'); toggle.setAttribute('aria-label','Open navigation'); };
  toggle?.addEventListener('click', () => { const open = mobile.hidden; mobile.hidden = !open; toggle.setAttribute('aria-expanded', String(open)); toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation'); });
  mobile?.querySelectorAll('a').forEach(a => a.addEventListener('click', closeNav));
  document.addEventListener('keydown', (e) => { if(e.key === 'Escape') closeNav(); });
  let locale = 'en';
  const cateringDialog = document.getElementById('catering-dialog');
  const cateringOpen = document.getElementById('open-catering-form');
  const cateringClose = document.getElementById('catering-close');
  const cateringForm = document.getElementById('knockout-catering-demo');
  const cateringStatus = document.getElementById('catering-preview-status');
  const cateringDate = document.getElementById('catering-date');
  const cateringDemoMessage = () => locale === 'es'
    ? 'Vista previa completada. No se envió ninguna solicitud, no se guardaron datos y no se reservó el evento.'
    : 'Preview complete. No request was sent, no information was saved, and no event was booked.';
  if (cateringDate) {
    const today = new Date();
    cateringDate.min = [today.getFullYear(), String(today.getMonth()+1).padStart(2, '0'), String(today.getDate()).padStart(2, '0')].join('-');
  }
  cateringOpen?.addEventListener('click', () => cateringDialog?.showModal());
  cateringClose?.addEventListener('click', () => cateringDialog?.close());
  cateringDialog?.addEventListener('click', (event) => {
    if (event.target === cateringDialog) cateringDialog.close();
  });
  cateringDialog?.addEventListener('close', () => cateringOpen?.focus());
  cateringForm?.addEventListener('submit', event => {
    event.preventDefault();
    if (!cateringForm.reportValidity()) return;
    cateringStatus.textContent = cateringDemoMessage();
    cateringStatus.hidden = false;
    cateringForm.reset();
  });
  const subscriberForm = document.getElementById('knockout-signup-demo');
  const subscriberLanguage = document.getElementById('subscriber-language');
  const subscriberStatus = document.getElementById('signup-preview-status');
  const previewMessage = () => locale === 'es'
    ? 'Vista previa completada. No guardamos tu correo, no creamos una suscripción ni enviamos mensajes.'
    : 'Preview complete. Your email was not saved, no subscription was created, and no messages were sent.';
  subscriberForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!subscriberForm.reportValidity()) return;
    subscriberStatus.textContent = previewMessage();
    subscriberStatus.hidden = false;
    subscriberForm.reset();
    subscriberLanguage.value = locale;
  });
    lang?.addEventListener('click', () => {
    locale = locale === 'en' ? 'es' : 'en';
    document.documentElement.lang = locale;
    document.querySelectorAll('[data-en][data-es]').forEach(el => { el.innerHTML = el.getAttribute('data-'+locale); });
    lang.textContent = locale === 'en' ? 'ES' : 'EN';
    lang.setAttribute('aria-label',locale === 'en' ? 'Switch to Spanish' : 'Switch to English');
    if (cateringClose) cateringClose.setAttribute('aria-label', locale === 'en' ? 'Close catering form' : 'Cerrar formulario de catering');
    document.querySelectorAll('[data-placeholder-en][data-placeholder-es]').forEach(el => { el.placeholder = el.getAttribute('data-placeholder-' + locale); });
    if (cateringStatus && !cateringStatus.hidden) cateringStatus.textContent = cateringDemoMessage();
    if (subscriberLanguage) subscriberLanguage.value = locale;
    if (subscriberStatus && !subscriberStatus.hidden) subscriberStatus.textContent = previewMessage();
  });
})();
