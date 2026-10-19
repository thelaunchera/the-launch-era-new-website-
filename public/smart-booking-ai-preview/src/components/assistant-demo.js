import { industries } from '../data/industries.js';

const copy = {
  en: {
    greeting: 'Hi there. What can I help you with today?',
    suggestions: [ ['services', 'What services do you offer?'], ['quote', 'I’d like a quote'], ['booking', 'How do I request a booking?'] ],
    services: (name) => `This sample ${name.toLowerCase()} business can show its services and ask a few helpful questions. In a real setup, the business reviews the details and confirms the next step.`,
    quote: 'I can help you start a quote request. Before any details are shared with a business, a connected assistant should explain what will be shared and ask for your permission.',
    booking: 'You can choose a service, add a few job details, and share a preferred time. The business reviews the request before confirming anything.',
    next: 'A business team can review the request and follow up with the next step. This sample is not connected to a team or calendar.',
    price: 'Pricing can depend on the scope of the service. A connected business can explain its pricing or review the details for a quote; no live prices are available in this preview.',
    default: 'Thanks for asking. In a connected setup, the assistant would use the business’s approved service information and guide you to a useful next step.',
    consentPrompt: 'Would you like to see how a consent step could work before sharing sample inquiry details?',
    consentYes: 'Yes, show me the consent step',
    consentNo: 'Not now',
    consentInfo: 'A connected assistant should say what details it plans to share and ask before sending them. This preview will not collect or send contact details.',
    consentContinue: 'Continue with sample only',
    consentDeclined: 'No problem. You can continue exploring without sharing anything.',
    consentApproved: 'Consent example selected. In a real setup, the approved details would be shared only through a verified connection. Nothing was sent here.',
    promptLabel: 'TRY A SAMPLE QUESTION',
    empty: 'Type a sample question…',
    sampleOnly: 'Preview only — no messages or contact details are sent or stored.'
  },
  es: {
    greeting: 'Hola. ¿En qué puedo ayudarte hoy?',
    suggestions: [ ['services', '¿Qué servicios ofreces?'], ['quote', 'Quisiera una cotización'], ['booking', '¿Cómo solicito una reserva?'] ],
    services: (name) => `Este negocio de ${name.toLowerCase()} de ejemplo puede mostrar sus servicios y hacer algunas preguntas útiles. En una configuración real, el negocio revisa los detalles y confirma el siguiente paso.`,
    quote: 'Puedo ayudarte a iniciar una solicitud de cotización. Antes de compartir datos con un negocio, un asistente conectado debe explicar qué se compartirá y pedirte permiso.',
    booking: 'Puedes elegir un servicio, agregar algunos detalles y compartir un horario preferido. El negocio revisa la solicitud antes de confirmar cualquier cosa.',
    next: 'El equipo del negocio puede revisar la solicitud y responder con el siguiente paso. Este ejemplo no está conectado a un equipo ni a un calendario.',
    price: 'El precio puede depender del alcance del servicio. Un negocio conectado puede explicar sus precios o revisar los detalles de una cotización; esta vista no muestra precios reales.',
    default: 'Gracias por preguntar. En una configuración conectada, el asistente usaría la información aprobada del negocio y te guiaría al siguiente paso.',
    consentPrompt: '¿Quieres ver cómo podría funcionar un paso de consentimiento antes de compartir datos de ejemplo?',
    consentYes: 'Sí, muéstrame el paso de consentimiento',
    consentNo: 'Ahora no',
    consentInfo: 'Un asistente conectado debe explicar qué datos quiere compartir y pedir permiso antes de enviarlos. Esta vista no recopilará ni enviará datos de contacto.',
    consentContinue: 'Continuar solo con el ejemplo',
    consentDeclined: 'No hay problema. Puedes seguir explorando sin compartir nada.',
    consentApproved: 'Elegiste el ejemplo de consentimiento. En una configuración real, los datos aprobados se compartirían solo mediante una conexión verificada. Aquí no se envió nada.',
    promptLabel: 'PRUEBA UNA PREGUNTA DE EJEMPLO',
    empty: 'Escribe una pregunta de ejemplo…',
    sampleOnly: 'Solo una vista previa: no se envían ni guardan mensajes o datos de contacto.'
  }
};

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}

export function createAssistantDemo({ getLanguage, getIndustry }) {
  const thread = document.querySelector('#chatThread');
  const suggestions = document.querySelector('#chatSuggestions');
  const form = document.querySelector('#chatForm');
  const input = document.querySelector('#chatInput');
  const consent = document.querySelector('#consentDemo');
  const history = [];

  function add(role, message, special = '', translateKey = '', industryId = getIndustry()) {
    const detectedKey = translateKey || (role === 'assistant'
      ? Object.keys(copy[getLanguage()]).find((key) => typeof copy[getLanguage()][key] === 'string' && copy[getLanguage()][key] === message) || ''
      : '');
    history.push({ role, message, special, translateKey: detectedKey, industryId });
    renderThread();
  }

  function localizedMessage(entry, lang) {
    if (entry.role !== 'assistant' || !entry.translateKey) return entry.message;
    if (entry.translateKey === 'services') return copy[lang].services(industries[entry.industryId]?.label[lang] || '');
    return copy[lang][entry.translateKey] || entry.message;
  }

  function renderThread() {
    if (!thread) return;
    const lang = getLanguage();
    thread.innerHTML = history.map((entry) => `<div class="chat-bubble ${entry.role}">${escapeHtml(localizedMessage(entry, lang))}${entry.special === 'consent' ? `<button class="consent-choice" type="button" data-consent-open>${copy[lang].consentYes}<svg class="icon"><use href="#i-arrow-up"/></svg></button><button class="consent-skip" type="button" data-consent-skip>${copy[lang].consentNo}</button>` : ''}</div>`).join('');
    thread.scrollTop = thread.scrollHeight;
    thread.querySelector('[data-consent-open]')?.addEventListener('click', showConsent);
    thread.querySelector('[data-consent-skip]')?.addEventListener('click', () => {
      consent.hidden = true;
      add('assistant', copy[getLanguage()].consentDeclined);
    });
  }

  function renderSuggestions() {
    if (!suggestions) return;
    const lang = getLanguage();
    suggestions.innerHTML = copy[lang].suggestions.map(([intent, label]) => `<button type="button" class="chat-chip" data-intent="${intent}">${label}</button>`).join('');
    suggestions.querySelectorAll('[data-intent]').forEach((button) => button.addEventListener('click', () => respond(button.dataset.intent, button.textContent)));
    const promptLabel = document.querySelector('.chat-prompt-label');
    if (promptLabel) promptLabel.textContent = copy[lang].promptLabel;
    if (input) input.placeholder = copy[lang].empty;
  }

  function showConsent() {
    const lang = getLanguage();
    consent.hidden = false;
    consent.innerHTML = `<p>${copy[lang].consentInfo}</p><div class="consent-actions"><button type="button" class="consent-allow">${copy[lang].consentContinue}</button><button type="button" class="consent-decline">${copy[lang].consentNo}</button></div>`;
    consent.querySelector('.consent-allow').addEventListener('click', () => {
      consent.hidden = true;
      add('assistant', copy[getLanguage()].consentApproved);
    });
    consent.querySelector('.consent-decline').addEventListener('click', () => {
      consent.hidden = true;
      add('assistant', copy[getLanguage()].consentDeclined);
    });
  }

  function classify(value) {
    const query = value.toLowerCase();
    if (/quote|estimate|cotiz|presupuesto/.test(query)) return 'quote';
    if (/book|booking|appointment|reserv|cita|agenda/.test(query)) return 'booking';
    if (/price|pricing|cost|how much|precio|cu[aá]nto/.test(query)) return 'price';
    if (/service|offer|do you|servicio|ofrece/.test(query)) return 'services';
    if (/next|what now|paso|ahora/.test(query)) return 'next';
    return 'default';
  }

  function respond(intent, visibleText) {
    const lang = getLanguage();
    const words = copy[lang];
    add('visitor', visibleText);
    const item = industries[getIndustry()];
    let answer;
    if (intent === 'services') answer = words.services(item.label[lang]);
    else answer = words[intent] || words.default;
    window.setTimeout(() => {
      add('assistant', answer, intent === 'quote' ? 'consent' : '', intent, item.id);
      if (intent === 'quote') {
        // A consent choice is shown; no personal details are requested or transmitted in this preview.
      }
    }, 180);
  }

  function render() {
    if (!history.length) history.push({ role: 'assistant', message: copy[getLanguage()].greeting, special: '', translateKey: 'greeting', industryId: getIndustry() });
    renderThread();
    renderSuggestions();
    if (consent && !consent.hidden) showConsent();
  }

  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    const value = input.value.trim();
    if (!value) return;
    input.value = '';
    respond(classify(value), value);
  });

  render();
  return { render, respond };
}
