/* The Launch Era · browser-only website benefits preview.
   Demo only. No fetch, CRM changes, email delivery or storage. */
(() => {
  'use strict';
  const descriptions = {
    en: {
      quote: {label:'Quote request', ack:'Thanks for requesting a quote. Your message has been received; our team will review it.', owner:'New quote request'},
      appointment: {label:'Appointment request', ack:'Thanks for reaching out. Your appointment request has been received, but your time is not confirmed yet.', owner:'New appointment request'},
      question: {label:'General question', ack:'Thanks for your question. We received your message and will follow up.', owner:'New customer question'}
    },
    es: {
      quote: {label:'Solicitud de cotización', ack:'Gracias por solicitar una cotización. Recibimos tu mensaje y el equipo lo revisará.', owner:'Nueva solicitud de cotización'},
      appointment: {label:'Solicitud de cita', ack:'Gracias por escribirnos. Recibimos tu solicitud de cita, pero el horario todavía no está confirmado.', owner:'Nueva solicitud de cita'},
      question: {label:'Pregunta general', ack:'Gracias por tu pregunta. Recibimos tu mensaje y te responderemos.', owner:'Nueva pregunta de cliente'}
    }
  };
  for (const root of document.querySelectorAll('[data-tle-outcome-demo]')) {
    const lang = root.getAttribute('data-lang') === 'es' ? 'es' : 'en';
    const form = root.querySelector('[data-outcome-form]');
    const select = root.querySelector('[data-outcome-kind]');
    const receiptTitle = root.querySelector('[data-outcome-receipt-title]');
    const receiptText = root.querySelector('[data-outcome-receipt-text]');
    const ownerTitle = root.querySelector('[data-outcome-owner-title]');
    const ownerText = root.querySelector('[data-outcome-owner-text]');
    const reset = root.querySelector('[data-outcome-reset]');
    if (!form || !select || !receiptTitle || !receiptText || !ownerTitle || !ownerText || !reset) continue;
    const original = {
      title:receiptTitle.textContent, text:receiptText.textContent,
      ownerTitle:ownerTitle.textContent, ownerText:ownerText.textContent
    };
    form.addEventListener('submit', event => {
      event.preventDefault();
      const entry = descriptions[lang][select.value] || descriptions[lang].quote;
      receiptTitle.textContent = lang === 'es' ? 'Solicitud recibida · Ejemplo' : 'Request received · Sample';
      receiptText.textContent = entry.ack;
      ownerTitle.textContent = entry.owner;
      ownerText.textContent = lang === 'es'
        ? 'Cliente de ejemplo · Pendiente de revisión · Sin reserva confirmada'
        : 'Sample customer · Needs review · No booking confirmed';
      root.dataset.previewState = 'ready';
    });
    reset.addEventListener('click', () => {
      select.value = 'quote';
      receiptTitle.textContent = original.title;
      receiptText.textContent = original.text;
      ownerTitle.textContent = original.ownerTitle;
      ownerText.textContent = original.ownerText;
      root.dataset.previewState = 'idle';
      select.focus();
    });
  }
})();
