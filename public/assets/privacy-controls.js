/* Optional statistics are off until a deliberate choice. No dependencies. */
(() => {
  'use strict';
  if (window.TLEPrivacy) return;
  const script = document.currentScript;
  const site = script?.dataset.site || 'tle';
  const key = site + '_privacy_choice_v1';
  const gaId = script?.dataset.gaId || '';
  const manual = script?.hasAttribute('data-manual-mount');
  const signal = () => navigator.globalPrivacyControl === true || navigator.doNotTrack === '1';
  let choice = null;
  let panel, opener, returnFocus;
  let gaLoaded = false;
  function read() {
    try {
      const value = JSON.parse(localStorage.getItem(key) || 'null');
      return value?.version === 1 && typeof value.analytics === 'boolean' && value.expires > Date.now() ? value : null;
    } catch { return null; }
  }
  choice = read();
  const allowed = () => choice?.analytics === true && !signal();
  function clearStatistics() {
    // Do not clear authentication, business records, language or accessibility settings.
    for (const cookie of document.cookie.split(';')) {
      const name = cookie.split('=')[0].trim();
      if (!/^(_ga|_gid|_gat)(_|$)/.test(name)) continue;
      const domains = ['', location.hostname, '.' + location.hostname, '.thelaunchera.com'];
      domains.forEach(domain => {
        document.cookie = name + '=; Max-Age=0; path=/; SameSite=Lax' + (domain ? '; domain=' + domain : '');
      });
    }
    try {
      ['tleTrafficSource', 'tleTrafficCampaign', 'tleTrafficMedium', 'tleLandingPath', 'podcast_audio_session_v1'].forEach(name => sessionStorage.removeItem(name));
      localStorage.removeItem('tle_visitor_id');
    } catch {}
  }
  function updateAnalytics() {
    if (!gaId) { if (!allowed()) clearStatistics(); return; }
    window['ga-disable-' + gaId] = !allowed();
    if (!allowed()) {
      clearStatistics();
      if (gaLoaded && window.gtag) window.gtag('consent', 'update', {analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied'});
      return;
    }
    if (gaLoaded) {
      window.gtag('consent', 'update', {analytics_storage: 'granted'});
      return;
    }
    if (!/^(thelaunchera\.com|www\.thelaunchera\.com|app\.thelaunchera\.com|thelaunchera\.github\.io)$/.test(location.hostname) || navigator.webdriver) return;
    gaLoaded = true;
    window.dataLayer = [];
    window.gtag = function () { if (allowed() || arguments[0] === 'consent') window.dataLayer.push(arguments); };
    window.gtag('consent', 'default', {analytics_storage: 'granted', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied'});
    window.gtag('js', new Date());
    let referrer = '';
    try { referrer = document.referrer ? new URL(document.referrer).origin : ''; } catch {}
    window.gtag('config', gaId, {
      send_page_view: !script?.hasAttribute('data-manual-page'),
      page_location: location.origin + location.pathname,
      page_referrer: referrer,
      allow_google_signals: false,
      allow_ad_personalization_signals: false
    });
    const tag = document.createElement('script');
    tag.async = true;
    tag.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(gaId);
    tag.dataset.tleGa = '1';
    document.head.appendChild(tag);
  }
  function hide() {
    if (panel) panel.hidden = true;
    document.documentElement.removeAttribute('data-privacy-pending');
    returnFocus?.focus?.({preventScroll: true});
  }
  function save(analytics) {
    choice = {version: 1, analytics: Boolean(analytics) && !signal(), updated: new Date().toISOString(), expires: Date.now() + 180 * 86400000};
    try { localStorage.setItem(key, JSON.stringify(choice)); } catch { /* Choice still works for this page. */ }
    updateAnalytics();
    hide();
    window.dispatchEvent(new CustomEvent('tle:privacy-change', {detail: {analytics: allowed()}}));
  }
  function language() {
    const value = new URLSearchParams(location.search).get('lang') || document.documentElement.lang || 'en';
    return ['es', 'fr', 'ht'].includes(value.slice(0, 2)) ? value.slice(0, 2) : 'en';
  }
  const words = {
    en: ['Your privacy choices', 'Required storage keeps sign-in and your settings working. Optional statistics stay off until you allow them. Your choice does not affect bookings, purchases or listening.', 'Reject optional', 'Allow statistics', 'Cookie settings', 'Cookie policy', 'Your browser privacy signal is on. Optional statistics are disabled.'],
    es: ['Tú eliges tu privacidad', 'El almacenamiento necesario permite iniciar sesión y recordar tus ajustes. Las estadísticas opcionales están apagadas hasta que las permitas. Tu elección no afecta reservas, compras ni la reproducción.', 'Rechazar opcionales', 'Permitir estadísticas', 'Ajustes de cookies', 'Política de cookies', 'La señal de privacidad del navegador está activa. Las estadísticas opcionales están desactivadas.'],
    fr: ['Vos choix de confidentialité', 'Le stockage nécessaire permet la connexion et conserve vos réglages. Les statistiques facultatives restent désactivées sans votre accord. Votre choix ne bloque pas les réservations ni les achats.', 'Refuser les options', 'Autoriser les statistiques', 'Réglages des cookies', 'Politique de cookies', 'Le signal de confidentialité de votre navigateur est actif. Les statistiques facultatives sont désactivées.'],
    ht: ['Chwa konfidansyalite ou', 'Depo ki nesesè a pèmèt ou konekte epi kenbe reglaj ou yo. Estatistik opsyonèl yo rete fèmen jiskaske ou pèmèt yo. Chwa ou pa bloke rezèvasyon oswa acha.', 'Refize opsyonèl yo', 'Pèmèt estatistik', 'Reglaj cookies', 'Politik cookies', 'Siyal konfidansyalite navigatè ou a aktif. Estatistik opsyonèl yo fèmen.']
  };
  function open() {
    mount();
    returnFocus = document.activeElement;
    const w = words[language()];
    panel.querySelector('h2').textContent = w[0];
    panel.querySelector('p').textContent = signal() ? w[6] : w[1];
    panel.querySelector('[data-reject]').textContent = w[2];
    panel.querySelector('[data-accept]').textContent = w[3];
    panel.querySelector('[data-accept]').disabled = signal();
    panel.querySelector('a').textContent = w[5];
    panel.hidden = false;
    document.documentElement.setAttribute('data-privacy-pending', '');
  }
  function mount() {
    if (panel || !document.body) return;
    const w = words[language()];
    const css = document.createElement('style');
    css.textContent = '.privacy-notice{position:fixed;z-index:2147483000;left:16px;bottom:16px;width:min(560px,calc(100vw - 32px));box-sizing:border-box;max-height:55svh;overflow:auto;padding:20px;background:#faf8f3;color:#191919;border:1px solid #596c7c;border-radius:18px;box-shadow:0 12px 40px #19191930;font:15px/1.5 system-ui,sans-serif;text-align:left}.privacy-notice[hidden]{display:none!important}.privacy-notice h2{font:600 20px/1.2 system-ui,sans-serif;margin:0 0 10px;color:#191919}.privacy-notice p{margin:0 0 14px;color:#333}.privacy-actions{display:flex;gap:10px;flex-wrap:wrap}.privacy-notice button{flex:1;min-height:44px;padding:10px 14px;background:#d5e6f1;color:#191919;border:1px solid #596c7c;border-radius:10px;cursor:pointer;font:600 14px/1.3 system-ui,sans-serif}.privacy-notice button:disabled{opacity:.6;cursor:default}.privacy-notice a{display:inline-block;margin-top:12px;color:#234f6d;text-decoration:underline}.privacy-settings{min-height:44px;min-width:44px;font:inherit;color:inherit;background:transparent;border:0;text-decoration:underline;cursor:pointer}.privacy-settings-float{position:fixed;bottom:10px;left:10px;z-index:1000;background:#faf8f3;color:#191919;border:1px solid #596c7c;border-radius:10px;padding:8px 12px;font:13px system-ui,sans-serif}.privacy-notice :focus-visible,.privacy-settings:focus-visible{outline:3px solid #234f6d;outline-offset:3px}@media(max-width:480px){.privacy-notice{left:10px;bottom:10px;width:calc(100vw - 20px);padding:16px;font-size:14px}.privacy-actions button{min-width:130px}}';
    document.head.appendChild(css);
    panel = document.createElement('section');
    panel.className = 'privacy-notice';
    panel.id = 'privacy-notice';
    panel.setAttribute('role', 'region');
    panel.setAttribute('aria-labelledby', 'privacy-notice-title');
    panel.hidden = true;
    panel.innerHTML = '<h2 id="privacy-notice-title"></h2><p></p><div class="privacy-actions"><button type="button" data-reject></button><button type="button" data-accept></button></div><a></a>';
    const policy = site === 'podcast' ? '/cookies.html' : (language() === 'es' ? 'https://thelaunchera.com/es/cookies.html' : 'https://thelaunchera.com/cookies.html');
    panel.querySelector('a').href = policy;
    panel.querySelector('[data-reject]').addEventListener('click', () => save(false));
    panel.querySelector('[data-accept]').addEventListener('click', () => save(true));
    document.body.appendChild(panel);
    if (!document.querySelector('[data-privacy-settings]')) {
      opener = document.createElement('button');
      opener.type = 'button';
      opener.className = 'privacy-settings privacy-settings-float';
      opener.dataset.privacySettings = '';
      opener.textContent = w[4];
      document.body.appendChild(opener);
    }
    document.addEventListener('click', event => {
      if (event.target.closest?.('[data-privacy-settings]')) { open(); panel.querySelector('button').focus(); }
    });
    panel.addEventListener('keydown', event => { if (event.key === 'Escape') hide(); });
    if (!choice && !signal()) open();
  }
  window.TLEPrivacy = Object.freeze({allowed, open, mount});
  window.addEventListener('storage', event => {
    if (event.key !== key && event.key !== null) return;
    choice = read();
    updateAnalytics();
    window.dispatchEvent(new CustomEvent('tle:privacy-change', {detail: {analytics: allowed()}}));
  });
  updateAnalytics();
  if (!manual) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, {once: true});
    else mount();
  }
})();
