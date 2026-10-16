/* Zero-dependency footer newsletter; delegated so SPA route changes remain safe. */
(function () {
  'use strict';
  var endpoint = 'https://bowacxhmjvrqixtwaikv.supabase.co/functions/v1/tle-newsletter-subscribe';
  function setup() {
    document.querySelectorAll('[data-tle-newsletter]').forEach(function (form) {
      if (!form.dataset.startedAt) form.dataset.startedAt = String(Date.now());
    });
  }
  function fail(form, input, message) {
    var error = form.querySelector('[data-newsletter-error]');
    if (error) error.textContent = message;
    if (input) input.setAttribute('aria-invalid', 'true');
  }
  document.addEventListener('submit', async function (event) {
    var form = event.target;
    if (!(form instanceof HTMLFormElement) || !form.matches('[data-tle-newsletter]')) return;
    event.preventDefault();
    if (form.classList.contains('done') || form.dataset.sending === 'true') return;
    var input = form.querySelector('[data-newsletter-email]');
    var button = form.querySelector('button[type="submit"]');
    var error = form.querySelector('[data-newsletter-error]');
    var label = button && button.querySelector('[data-newsletter-button-label]');
    if (!input || !button || !label) return;
    var es = form.dataset.language === 'es';
    var email = input.value.trim();
    if (error) error.textContent = '';
    input.removeAttribute('aria-invalid');
    if (!input.validity.valid || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      fail(form, input, es ? 'Escribe un correo electrónico válido.' : 'Enter a valid email address.');
      input.focus();
      return;
    }

    form.dataset.sending = 'true';
    form.setAttribute('aria-busy', 'true');
    input.disabled = true;
    button.disabled = true;
    label.textContent = es ? 'Enviando…' : 'Sending…';
    try {
      var response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email,
          language: es ? 'es' : 'en',
          source: 'site_footer',
          consent: true,
          company_web: form.querySelector('[data-newsletter-website]')?.value || '',
          started_at: Number(form.dataset.startedAt || 0)
        })
      });
      var result = await response.json().catch(function () { return null; });
      if (!response.ok || !result || result.ok !== true) throw new Error('Subscription not saved');
      var confirmation = form.querySelector('[data-newsletter-confirmation]');
      var confirmationLabel = form.querySelector('[data-newsletter-confirmation-label]');
      if (confirmationLabel) confirmationLabel.textContent = es ? '¡Listo!' : "You're in";
      if (confirmation) confirmation.setAttribute('aria-hidden', 'false');
      form.classList.add('done'); // Persistent success; never auto-reset.
      button.disabled = true;
      input.disabled = true;
    } catch (err) {
      input.disabled = false;
      button.disabled = false;
      label.textContent = es ? 'Suscribirme' : 'Subscribe';
      fail(form, input, es ? 'No se pudo guardar tu suscripción. Inténtalo otra vez.' : "We couldn't save your subscription. Please try again.");
    } finally {
      delete form.dataset.sending;
      form.removeAttribute('aria-busy');
    }
  });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup);
  else setup();
  document.addEventListener('focusin', function (event) {
    var form = event.target?.closest?.('[data-tle-newsletter]');
    if (form && !form.dataset.startedAt) form.dataset.startedAt = String(Date.now());
  });
})();
