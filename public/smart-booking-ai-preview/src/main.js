import { industries } from './data/industries.js';
import { displayPrice, offerConfig } from './data/offer-config.js';
import { renderIndustrySelector, renderIndustryPreview } from './components/industry-selector.js';
import { createBookingDemo } from './components/booking-demo.js';
import { createAssistantDemo } from './components/assistant-demo.js';
import { renderProductCards } from './components/product-cards.js';

const params = new URLSearchParams(window.location.search);
let language = params.get('lang') === 'es' ? 'es' : 'en';
let selectedIndustry = 'cleaning';
let bookingDemo;
let assistantDemo;

const staticLocale = (lang) => {
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-en][data-es]').forEach((element) => {
    const translated = element.getAttribute(`data-${lang}`);
    if (translated !== null) element.innerHTML = translated;
  });
  document.querySelectorAll('[data-en-placeholder][data-es-placeholder]').forEach((element) => {
    element.placeholder = element.getAttribute(`data-${lang}-placeholder`) || '';
  });
  document.querySelectorAll('[data-en-alt][data-es-alt]').forEach((element) => {
    element.alt = element.getAttribute(`data-${lang}-alt`) || '';
  });
  document.title = lang === 'es' ? 'Reservas inteligentes + IA — The Launch Era' : 'Smart Booking + AI Bundle — The Launch Era';
  const toggle = document.querySelector('#languageToggle');
  if (toggle) {
    toggle.textContent = lang === 'en' ? 'ES' : 'EN';
    toggle.setAttribute('aria-label', lang === 'en' ? 'Switch language to Spanish' : 'Cambiar idioma a inglés');
  }
  const bookingStepper = document.querySelector('#bookingStepper');
  if (bookingStepper) bookingStepper.setAttribute('aria-label', lang === 'en' ? 'Booking demonstration progress' : 'Progreso de la demostración de reserva');
  const sendButton = document.querySelector('.chat-send');
  if (sendButton) sendButton.setAttribute('aria-label', lang === 'en' ? 'Send sample message' : 'Enviar mensaje de ejemplo');
};

function renderIndustry() {
  renderIndustrySelector({ selected: selectedIndustry, lang: language, onSelect: (id) => changeIndustry(id) });
  renderIndustryPreview({ selected: selectedIndustry, lang: language });
}

function changeIndustry(id, { fromBooking = false } = {}) {
  if (!industries[id]) return;
  selectedIndustry = id;
  renderIndustry();
  if (!fromBooking) bookingDemo?.setIndustry(id);
  assistantDemo?.render();
}

function setLanguage(next) {
  if (!['en', 'es'].includes(next) || next === language) return;
  language = next;
  const nextParams = new URLSearchParams(window.location.search);
  if (language === 'es') nextParams.set('lang', 'es');
  else nextParams.delete('lang');
  const query = nextParams.toString();
  window.history.replaceState({}, '', `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`);
  staticLocale(language);
  renderIndustry();
  renderProductCards({ lang: language });
  bookingDemo?.refreshLanguage();
  assistantDemo?.render();
  updateOfferUI();
}

function initializeProblemCards() {
  document.querySelectorAll('.problem-card').forEach((card) => card.addEventListener('click', () => {
    const expanded = card.getAttribute('aria-expanded') === 'true';
    card.setAttribute('aria-expanded', String(!expanded));
    card.classList.toggle('is-expanded', !expanded);
  }));
}

function initializeReveals() {
  const elements = document.querySelectorAll('[data-reveal]');
  if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    elements.forEach((element) => element.classList.add('is-visible'));
    return;
  }
  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      currentObserver.unobserve(entry.target);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -32px 0px' });
  elements.forEach((element) => observer.observe(element));
}

function initializeParallax() {
  const photo = document.querySelector('.hero-photo');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!photo || reduceMotion.matches) return;
  let pending = false;
  const update = () => {
    if (pending) return;
    pending = true;
    window.requestAnimationFrame(() => {
      const bounds = photo.getBoundingClientRect();
      const progress = Math.max(-1, Math.min(1, (window.innerHeight - bounds.top) / (window.innerHeight + bounds.height) - 0.45));
      photo.style.setProperty('--photo-shift', `${Math.round(progress * 10)}px`);
      pending = false;
    });
  };
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update, { passive: true });
  update();
  reduceMotion.addEventListener?.('change', (event) => {
    if (event.matches) {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      photo.style.removeProperty('--photo-shift');
    }
  });
}

function initializeNavigation() {
  document.querySelector('#languageToggle')?.addEventListener('click', () => setLanguage(language === 'en' ? 'es' : 'en'));
  document.querySelectorAll('a[href^="#"]').forEach((link) => link.addEventListener('click', (event) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
    if (link.getAttribute('href') !== '#top') window.history.replaceState({}, '', `${window.location.pathname}${window.location.search}${link.getAttribute('href')}`);
  }));
}

document.documentElement.classList.add('js');
staticLocale(language);
renderIndustry();
renderProductCards({ lang: language });
bookingDemo = createBookingDemo({
  getLanguage: () => language,
  getIndustry: () => selectedIndustry,
  setIndustry: (id, options) => changeIndustry(id, options)
});
bookingDemo.render();
assistantDemo = createAssistantDemo({ getLanguage: () => language, getIndustry: () => selectedIndustry });
initializeProblemCards();
initializeNavigation();
initializeReveals();
initializeParallax();

function updateOfferUI() {
  const offerPercent = document.querySelector('.offer-sticker b');
  if (offerPercent) offerPercent.textContent = `${offerConfig.discountPercent}%`;
  const setupPrice = document.querySelector('.price-placeholder b');
  if (setupPrice) setupPrice.textContent = displayPrice(offerConfig.setupPrice, language);
}

// This is intentionally a display-only snapshot. The current record was checked read-only;
// re-confirm eligibility and current price configuration before any public release.
updateOfferUI();
