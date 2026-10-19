import { industries, industryOrder, iconMarkup } from '../data/industries.js';

export function renderIndustrySelector({ selected, lang, onSelect }) {
  const mount = document.querySelector('#industrySelector');
  if (!mount) return;
  mount.innerHTML = industryOrder.map((id) => {
    const item = industries[id];
    const active = id === selected;
    return `<button class="industry-tab${active ? ' is-selected' : ''}" id="industry-tab-${id}" type="button" role="tab" aria-selected="${active}" aria-controls="industryPreview" tabindex="${active ? '0' : '-1'}" data-industry="${id}">${iconMarkup(item.icon)}<span>${item.label[lang]}</span></button>`;
  }).join('');
  mount.querySelectorAll('[data-industry]').forEach((button) => {
    button.addEventListener('click', () => onSelect(button.dataset.industry));
    button.addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const current = industryOrder.indexOf(button.dataset.industry);
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? industryOrder.length - 1 : (current + (event.key === 'ArrowRight' ? 1 : -1) + industryOrder.length) % industryOrder.length;
      const nextId = industryOrder[next];
      onSelect(nextId);
      window.requestAnimationFrame(() => mount.querySelector(`[data-industry="${nextId}"]`)?.focus());
    });
  });
}

export function renderIndustryPreview({ selected, lang }) {
  const mount = document.querySelector('#industryPreview');
  if (!mount) return;
  const item = industries[selected];
  mount.innerHTML = `<div class="industry-preview-copy"><span class="preview-mark">${iconMarkup(item.icon)}</span><div><span class="mini-label">${lang === 'es' ? 'VISTA DE EJEMPLO' : 'SAMPLE PREVIEW'}</span><h3>${item.label[lang]}</h3><p>${item.intro[lang]}</p></div></div><div class="industry-service-list">${item.services.map((service, index) => `<div class="industry-service"><span class="service-index">0${index + 1}</span><div><b>${service[lang]}</b><small>${service.note[lang]}</small></div><span class="service-arrow" aria-hidden="true">↗</span></div>`).join('')}</div>`;
}
