import { industries, industryOrder } from '../data/industries.js';

const text = (lang, en, es) => lang === 'es' ? es : en;
const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

export function createBookingDemo({ getLanguage, getIndustry, setIndustry }) {
  const form = document.querySelector('#bookingForm');
  const content = document.querySelector('#bookingContent');
  const actions = document.querySelector('#bookingActions');
  const state = { step: 1, industry: getIndustry(), serviceId: 'standard', details: {}, date: '', time: '', name: '', email: '', errors: '' };

  const getItem = () => industries[state.industry];
  const getService = () => getItem().services.find((service) => service.id === state.serviceId) || getItem().services[0];
  const renderStepper = () => {
    document.querySelectorAll('#bookingStepper [data-step-label]').forEach((node) => {
      const step = Number(node.dataset.stepLabel);
      node.classList.toggle('is-current', step === state.step);
      node.classList.toggle('is-done', state.step > step);
      if (step === state.step) node.setAttribute('aria-current', 'step');
      else node.removeAttribute('aria-current');
    });
  };
  const errorBlock = () => state.errors ? `<p class="booking-error" role="alert">${escapeHtml(state.errors)}</p>` : '';
  const button = (en, es, type = 'submit', cls = 'button button-olive') => `<button class="${cls}" type="${type}"><span>${text(getLanguage(), en, es)}</span>${type === 'submit' ? '<svg class="icon"><use href="#i-arrow"/></svg>' : ''}</button>`;

  function saveVisibleValues() {
    content.querySelectorAll('[data-detail]').forEach((field) => { state.details[field.dataset.detail] = field.value; });
    const name = content.querySelector('#sampleName');
    const email = content.querySelector('#sampleEmail');
    if (name) state.name = name.value;
    if (email) state.email = email.value;
  }

  function renderStepOne() {
    const lang = getLanguage();
    const item = getItem();
    const selector = industryOrder.map((id) => `<option value="${id}" ${id === state.industry ? 'selected' : ''}>${industries[id].label[lang]}</option>`).join('');
    const services = item.services.map((service) => `<button type="button" class="service-choice${service.id === state.serviceId ? ' is-selected' : ''}" data-service="${service.id}" aria-pressed="${service.id === state.serviceId}"><span class="service-check">${service.id === state.serviceId ? '✓' : ''}</span><b>${service[lang]}</b><small>${service.note[lang]}</small></button>`).join('');
    content.innerHTML = `<div class="form-step-heading"><span class="mini-label">${text(lang, 'STEP 1 OF 3', 'PASO 1 DE 3')}</span><h4>${text(lang, 'What would you like help with?', '¿Con qué necesitas ayuda?')}</h4><p>${text(lang, 'Choose a sample business type and service.', 'Elige un tipo de negocio y servicio de ejemplo.')}</p></div><label class="field-label" for="bookingIndustry">${text(lang, 'Business type', 'Tipo de negocio')}</label><select class="form-control" id="bookingIndustry">${selector}</select><fieldset class="service-fieldset"><legend>${text(lang, 'Choose a service', 'Elige un servicio')}</legend><div class="service-choice-grid">${services}</div></fieldset>${errorBlock()}`;
    content.querySelector('#bookingIndustry').addEventListener('change', (event) => {
      const nextIndustry = event.target.value;
      const nextService = industries[nextIndustry].services[0].id;
      state.industry = nextIndustry;
      state.serviceId = nextService;
      state.details = {};
      state.errors = '';
      setIndustry(nextIndustry, { fromBooking: true });
      render();
    });
    content.querySelectorAll('[data-service]').forEach((serviceButton) => serviceButton.addEventListener('click', () => {
      state.serviceId = serviceButton.dataset.service;
      state.errors = '';
      render();
    }));
    actions.innerHTML = `<span class="action-note">${text(lang, 'Sample only · no reservation is created', 'Solo ejemplo · no se crea ninguna reserva')}</span>${button('Continue', 'Continuar')}`;
  }

  function renderStepTwo() {
    const lang = getLanguage();
    const item = getItem();
    const service = getService();
    const fields = item.details.map((field, index) => {
      const label = field.label[lang];
      const id = `detail-${field.id}`;
      if (field.type === 'select') {
        const current = state.details[field.id] || '';
        const options = field.options.map((option, optionIndex) => {
          const value = String(optionIndex);
          return `<option value="${value}" ${current === value ? 'selected' : ''}>${option[lang]}</option>`;
        }).join('');
        return `<label class="field-label" for="${id}">${label}${index === 0 ? '<span class="required-mark">*</span>' : ''}</label><select class="form-control" id="${id}" data-detail="${field.id}" ${index === 0 ? 'required' : ''}><option value="">${text(lang, 'Choose one…', 'Elige una opción…')}</option>${options}</select>`;
      }
      return `<label class="field-label" for="${id}">${label}</label><textarea class="form-control form-textarea" id="${id}" data-detail="${field.id}" maxlength="180" placeholder="${field.placeholder[lang]}">${escapeHtml(state.details[field.id] || '')}</textarea>`;
    }).join('');
    content.innerHTML = `<div class="form-step-heading"><span class="mini-label">${text(lang, 'STEP 2 OF 3', 'PASO 2 DE 3')}</span><h4>${text(lang, 'Tell us about the job.', 'Cuéntanos sobre el trabajo.')}</h4><p>${text(lang, 'A few details help the business understand what you need.', 'Algunos detalles ayudan al negocio a entender lo que necesitas.')}</p><div class="selected-service-summary"><span class="summary-dot"></span><span>${item.label[lang]}</span><b>·</b><strong>${service[lang]}</strong></div></div><div class="details-fields">${fields}</div>${errorBlock()}`;
    actions.innerHTML = `${button('Back', 'Atrás', 'button', 'button button-ghost back-button')}${button('Continue', 'Continuar')}`;
    actions.querySelector('.back-button').addEventListener('click', () => { saveVisibleValues(); state.step = 1; state.errors = ''; render(); });
  }

  function futureDays() {
    const days = [];
    const today = new Date();
    for (let offset = 1; days.length < 5 && offset < 12; offset += 1) {
      const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset);
      if (date.getDay() === 0) continue;
      days.push(date);
    }
    return days;
  }

  function renderStepThree() {
    const lang = getLanguage();
    const locale = lang === 'es' ? 'es-US' : 'en-US';
    const dates = futureDays().map((date) => {
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      return `<button type="button" class="date-choice${state.date === key ? ' is-selected' : ''}" data-date="${key}" aria-pressed="${state.date === key}"><small>${new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(date)}</small><b>${date.getDate()}</b><small>${new Intl.DateTimeFormat(locale, { month: 'short' }).format(date)}</small></button>`;
    }).join('');
    const slots = [
      { id: 'morning', en: 'Morning · 8–11', es: 'Mañana · 8–11' },
      { id: 'midday', en: 'Midday · 11–2', es: 'Mediodía · 11–2' },
      { id: 'afternoon', en: 'Afternoon · 2–5', es: 'Tarde · 2–5' }
    ].map((slot) => `<button type="button" class="time-choice${state.time === slot.id ? ' is-selected' : ''}" data-time="${slot.id}" aria-pressed="${state.time === slot.id}">${text(lang, slot.en, slot.es)}</button>`).join('');
    content.innerHTML = `<div class="form-step-heading"><span class="mini-label">${text(lang, 'STEP 3 OF 3', 'PASO 3 DE 3')}</span><h4>${text(lang, 'Choose a day and share sample contact details.', 'Elige un día y agrega datos de contacto de ejemplo.')}</h4><p>${text(lang, 'These are illustrative sample dates, not real availability.', 'Estas fechas son de ejemplo; no indican disponibilidad real.')}</p></div><div class="date-area"><span class="field-label">${text(lang, 'Pick a sample day', 'Elige un día de ejemplo')}</span><div class="date-grid">${dates}</div><span class="field-label time-label">${text(lang, 'Preferred time window', 'Horario preferido')}</span><div class="time-grid">${slots}</div></div><div class="contact-fields"><label class="field-label" for="sampleName">${text(lang, 'Your name', 'Tu nombre')}<span class="required-mark">*</span><input class="form-control" id="sampleName" name="sampleName" required maxlength="60" autocomplete="off" value="${escapeHtml(state.name)}" placeholder="${text(lang, 'Sample name', 'Nombre de ejemplo')}"></label><label class="field-label" for="sampleEmail">${text(lang, 'Email address', 'Correo electrónico')}<span class="required-mark">*</span><input class="form-control" id="sampleEmail" name="sampleEmail" type="email" required maxlength="120" autocomplete="off" value="${escapeHtml(state.email)}" placeholder="${text(lang, 'sample@example.com', 'ejemplo@correo.com')}"></label></div><p class="contact-sample-note"><svg class="icon"><use href="#i-spark"/></svg>${text(lang, 'Use sample details only. Nothing is submitted, sent, or saved.', 'Usa solo datos de ejemplo. No se envía ni guarda nada.')}</p>${errorBlock()}`;
    actions.innerHTML = `${button('Back', 'Atrás', 'button', 'button button-ghost back-button')}${button('Review sample request', 'Revisar solicitud de ejemplo')}`;
    actions.querySelector('.back-button').addEventListener('click', () => { saveVisibleValues(); state.step = 2; state.errors = ''; render(); });
    content.querySelectorAll('[data-date]').forEach((node) => node.addEventListener('click', () => { state.date = node.dataset.date; state.errors = ''; renderStepThree(); }));
    content.querySelectorAll('[data-time]').forEach((node) => node.addEventListener('click', () => { state.time = node.dataset.time; state.errors = ''; renderStepThree(); }));
  }

  function renderComplete() {
    const lang = getLanguage();
    const item = getItem();
    const service = getService();
    const date = state.date ? new Date(`${state.date}T12:00:00`) : null;
    const locale = lang === 'es' ? 'es-US' : 'en-US';
    const dateLabel = date ? new Intl.DateTimeFormat(locale, { weekday: 'long', month: 'long', day: 'numeric' }).format(date) : text(lang, 'Sample date', 'Fecha de ejemplo');
    const timeLabel = { morning: text(lang, 'Morning · 8–11', 'Mañana · 8–11'), midday: text(lang, 'Midday · 11–2', 'Mediodía · 11–2'), afternoon: text(lang, 'Afternoon · 2–5', 'Tarde · 2–5') }[state.time] || text(lang, 'Sample time', 'Horario de ejemplo');
    content.innerHTML = `<div class="completion-state"><div class="complete-check"><svg class="icon"><use href="#i-check"/></svg></div><span class="mini-label">${text(lang, 'SAMPLE REQUEST COMPLETE', 'SOLICITUD DE EJEMPLO COMPLETA')}</span><h4>${text(lang, 'You’ve seen the next step.', 'Ya viste el siguiente paso.')}</h4><p>${text(lang, 'This was only a preview. No booking was created and no information was sent or saved.', 'Esto fue solo una demostración. No se creó ninguna reserva ni se envió o guardó información.')}</p><div class="completion-summary"><div><small>${text(lang, 'BUSINESS TYPE', 'TIPO DE NEGOCIO')}</small><b>${item.label[lang]}</b></div><div><small>${text(lang, 'SERVICE', 'SERVICIO')}</small><b>${service[lang]}</b></div><div><small>${text(lang, 'SAMPLE PREFERENCE', 'PREFERENCIA DE EJEMPLO')}</small><b>${dateLabel} · ${timeLabel}</b></div></div><button type="button" class="restart-link" id="restartBooking">${text(lang, 'Try another sample →', 'Probar otro ejemplo →')}</button></div>`;
    actions.innerHTML = `<span class="action-note">${text(lang, 'No real reservation was made', 'No se realizó ninguna reserva real')}</span><a class="button button-olive" href="#offer"><span>${text(lang, 'Explore the offer', 'Ver la oferta')}</span><svg class="icon"><use href="#i-arrow"/></svg></a>`;
    content.querySelector('#restartBooking').addEventListener('click', () => { state.step = 1; state.serviceId = getItem().services[0].id; state.details = {}; state.date = ''; state.time = ''; state.name = ''; state.email = ''; state.errors = ''; render(); });
  }

  function render() {
    if (!content || !actions || !form) return;
    renderStepper();
    if (state.step === 1) renderStepOne();
    else if (state.step === 2) renderStepTwo();
    else if (state.step === 3) renderStepThree();
    else renderComplete();
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    saveVisibleValues();
    state.errors = '';
    if (state.step === 1) { state.step = 2; render(); return; }
    if (state.step === 2) {
      const firstDetail = getItem().details.find((field) => field.type === 'select');
      if (firstDetail && !state.details[firstDetail.id]) {
        state.errors = text(getLanguage(), 'Choose an option to continue.', 'Elige una opción para continuar.');
        render();
        content.querySelector('[data-detail]')?.focus();
        return;
      }
      state.step = 3; render(); return;
    }
    if (state.step === 3) {
      if (!state.date || !state.time) state.errors = text(getLanguage(), 'Choose an illustrative date and time window.', 'Elige una fecha y un horario de ejemplo.');
      else if (!state.name.trim()) state.errors = text(getLanguage(), 'Add a sample name to continue.', 'Agrega un nombre de ejemplo para continuar.');
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email.trim())) state.errors = text(getLanguage(), 'Enter a valid sample email address.', 'Ingresa un correo electrónico de ejemplo válido.');
      if (state.errors) {
        render();
        content.querySelector('#sampleName')?.focus();
        return;
      }
      state.step = 4;
      // Intentional demo-only completion: no fetch, form POST, localStorage, or booking write.
      render();
    }
  });

  return {
    render,
    refreshLanguage() {
      saveVisibleValues();
      render();
    },
    setIndustry(id) {
      if (!industries[id]) return;
      const previousItem = getItem();
      const currentService = previousItem.services.find((service) => service.id === state.serviceId);
      state.industry = id;
      state.serviceId = industries[id].services.some((service) => service.id === currentService?.id) ? currentService.id : industries[id].services[0].id;
      state.details = {};
      state.errors = '';
      render();
    },
    getState: () => ({ ...state })
  };
}
