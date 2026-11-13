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
    if (subscriberLanguage) subscriberLanguage.value = locale;
    if (subscriberStatus && !subscriberStatus.hidden) subscriberStatus.textContent = previewMessage();
  });
})();
