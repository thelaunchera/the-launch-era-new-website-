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
  lang?.addEventListener('click', () => {
    locale = locale === 'en' ? 'es' : 'en';
    document.documentElement.lang = locale;
    document.querySelectorAll('[data-en][data-es]').forEach(el => { el.innerHTML = el.getAttribute('data-'+locale); });
    lang.textContent = locale === 'en' ? 'ES' : 'EN';
    lang.setAttribute('aria-label',locale === 'en' ? 'Switch to Spanish' : 'Switch to English');
  });
})();
