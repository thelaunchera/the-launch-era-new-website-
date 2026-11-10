/* SOVA / Listening Mode: small original Easter egg; no audio or commerce.
   A visitor can switch only the five-moods editorial chapter between
   cobalt day and midnight ink. Accessible, translated and touch-first. */
(() => {
  'use strict';
  if (document.documentElement.dataset.tleOneMotion !== 'sova') return;
  const selectors = '#sova-moods';
  let queued = false;
  let nightMode = false;
  const dictionary = {
    en: {
      note: 'A different light. The same five moods.',
      on: 'Night listening',
      off: 'Day listening',
      toNight: 'Switch this listening chapter to night colors',
      toDay: 'Switch this listening chapter to day colors'
    },
    es: {
      note: 'Otra luz. Los mismos cinco moods.',
      on: 'Escuchar de noche',
      off: 'Escuchar de día',
      toNight: 'Cambiar esta sección a colores de noche',
      toDay: 'Cambiar esta sección a colores de día'
    }
  };
  function language() {
    const active = Array.from(document.querySelectorAll('.language-switch button'))
      .find(button => button.getAttribute('aria-pressed') === 'true');
    const label = active?.textContent?.trim().toLowerCase();
    if (label === 'es' || label === 'español') return 'es';
    if (label === 'en' || label === 'english') return 'en';
    return (document.documentElement.lang || 'en').startsWith('es') ? 'es' : 'en';
  }
  function sync(section) {
    const button = section.querySelector('.sova-night-toggle');
    const note = section.querySelector('.sova-night-note');
    if (!button || !note) return;
    const night = section.classList.contains('sova-night');
    const copy = dictionary[language()];
    note.textContent = copy.note;
    button.textContent = night ? copy.off : copy.on;
    button.setAttribute('aria-label', night ? copy.toDay : copy.toNight);
    button.setAttribute('aria-pressed', String(night));
  }
  function mount() {
    const section = document.querySelector(selectors);
    if (!section) return;
    if (!section.querySelector('.sova-night-toggle-row')) {
      const row = document.createElement('div');
      row.className = 'sova-night-toggle-row';
      const note = document.createElement('span');
      note.className = 'sova-night-note';
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'sova-night-toggle';
      button.addEventListener('click', () => {
        nightMode = !nightMode;
        section.classList.toggle('sova-night', nightMode);
        sync(section);
      });
      row.append(note, button);
      const swipe = section.querySelector('.sova-people-swipe');
      if (swipe) swipe.before(row);
      else section.querySelector('.sova-people-head')?.after(row);
    }
    section.classList.toggle('sova-night', nightMode);
    sync(section);
  }
  function schedule() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      mount();
    });
  }
  function init() {
    schedule();
    const app = document.getElementById('app');
    if (app) {
      new MutationObserver(records => {
        if (records.some(r => Array.from(r.addedNodes).some(node =>
          node.nodeType === 1 &&
          (node.matches?.('#sova-moods') || node.querySelector?.('#sova-moods'))
        ))) schedule();
      }).observe(app, { childList:true, subtree:true });
    }
    document.addEventListener('click', event => {
      if (event.target.closest?.('.language-switch')) setTimeout(schedule, 0);
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once:true });
  } else init();
})();
