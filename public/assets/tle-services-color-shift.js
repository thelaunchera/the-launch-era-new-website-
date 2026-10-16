/* The Launch Era — public services color shift. Independent of React card markup. */
(function () {
  'use strict';
  var selector = '#solutions.solutions-section, #soluciones.solutions-section';
  var themes = [
    { bg: '#FAF8F3', ink: '#191919' },
    { bg: '#D7EFFF', ink: '#173B56' },
    { bg: '#316C95', ink: '#FFFFFF' },
    { bg: '#173F59', ink: '#EAF4FC' },
    { bg: '#FAF8F3', ink: '#191919' }
  ];
  var state = null, scheduled = false, observer = null;
  var clamp = function (number, low, high) { return Math.max(low, Math.min(high, number)); };
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var gsapPromise = null;

  function loadOnce(url, label) {
    return new Promise(function (resolve, reject) {
      var tag = document.createElement('script');
      tag.src = url;
      tag.async = true;
      tag.setAttribute('data-tle-gsap', label);
      tag.onload = function () { resolve(); };
      tag.onerror = function () { tag.remove(); reject(new Error(label + ' unavailable')); };
      document.head.appendChild(tag);
    });
  }
  function loadWithBackup(urls, label) {
    return loadOnce(urls[0], label).catch(function () { return loadOnce(urls[1], label); });
  }
  function ensureGsap() {
    if (window.gsap && window.ScrollTrigger) return Promise.resolve(true);
    if (!gsapPromise) {
      gsapPromise = loadWithBackup([
        'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js',
        'https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js'
      ], 'gsap').then(function () {
        return loadWithBackup([
          'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js',
          'https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js'
        ], 'scroll-trigger');
      }).then(function () { return Boolean(window.gsap && window.ScrollTrigger); })
        .catch(function () { return false; });
    }
    return gsapPromise;
  }

  function setup(section) {
    var container = section.querySelector(':scope > .container');
    var rail = section.querySelector('.service-grid');
    if (!container || !rail) return null;
    var es = section.id === 'soluciones';
    var nav = document.createElement('div');
    nav.className = 'sol-color-nav';
    nav.setAttribute('aria-label', es ? 'Progreso de colores de servicios' : 'Services color progress');
    nav.innerHTML = '<span class="sol-color-brand">THE LAUNCH ERA</span>' +
      '<span class="sol-color-counter" data-service-theme-counter>01 / 05</span>' +
      '<span class="sol-color-bars" aria-hidden="true"><i data-service-theme-bar data-active="true"></i><i data-service-theme-bar></i><i data-service-theme-bar></i></span>' +
      '<a class="sol-color-link" href="#' + (es ? 'service-rail-es' : 'service-rail-en') +
      '"><span>' + (es ? 'Explorar' : 'Explore') + '</span></a>';
    container.prepend(nav);
    var originalRailId = rail.id;
    if (!originalRailId) rail.id = es ? 'service-rail-es' : 'service-rail-en';
    section.setAttribute('data-services-color-shift', '');
    section.setAttribute('data-color-phase', '1');
    var counter = nav.querySelector('[data-service-theme-counter]');
    var bars = Array.from(nav.querySelectorAll('[data-service-theme-bar]'));
    var cards = Array.from(rail.querySelectorAll('.service-card'));
    var current = -1, touched = false, gsapReady = false, ctx = null;
    var starting = {
      bg: section.style.backgroundColor,
      ink: section.style.color,
      bgc: section.style.getPropertyValue('--bgc'),
      inkc: section.style.getPropertyValue('--inkc')
    };
    function paint(index, immediate) {
      var next = clamp(index, 0, themes.length - 1);
      if (next === current && !immediate) return;
      current = next;
      var theme = themes[next];
      section.dataset.colorPhase = String(next + 1);
      counter.textContent = String(next + 1).padStart(2, '0') + ' / 05';
      bars.forEach(function (bar, index) { bar.dataset.active = String(index <= Math.floor(next * 3 / 5)); });
      var values = { backgroundColor: theme.bg, color: theme.ink, '--bgc': theme.bg, '--inkc': theme.ink };
      if (gsapReady && window.gsap) {
        window.gsap.killTweensOf(section);
        if (reducedMotion.matches || immediate) window.gsap.set(section, values);
        else window.gsap.to(section, Object.assign(values, { duration: .45, ease: 'power2.out', overwrite: true }));
      } else {
        section.style.setProperty('--bgc', theme.bg);
        section.style.setProperty('--inkc', theme.ink);
        section.style.backgroundColor = theme.bg;
        section.style.color = theme.ink;
      }
    }
    function cardIndex() {
      var midpoint = rail.getBoundingClientRect().left + rail.clientWidth / 2;
      var best = 0, distance = Infinity;
      cards.forEach(function (card, index) {
        var box = card.getBoundingClientRect();
        var gap = Math.abs(box.left + box.width / 2 - midpoint);
        if (gap < distance) { distance = gap; best = index; }
      });
      return Math.round(best * (themes.length - 1) / Math.max(cards.length - 1, 1));
    }
    function update() {
      if (!section.isConnected) return;
      var rect = section.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;
      if (window.innerWidth < 768 && touched && rail.scrollWidth > rail.clientWidth + 5) {
        paint(cardIndex());
      } else {
        var progress = clamp((window.innerHeight * .55 - rect.top) / Math.max(rect.height, 1), 0, 1);
        paint(Math.min(themes.length - 1, Math.floor(progress * themes.length)));
      }
    }
    var frame = 0;
    function schedule() {
      if (!frame) frame = window.requestAnimationFrame(function () { frame = 0; update(); });
    }
    function onRailScroll() {
      if (window.innerWidth < 768 && rail.scrollLeft > 8) touched = true;
      schedule();
    }
    function onResize() { if (window.innerWidth >= 768) touched = false; schedule(); }
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', onResize);
    rail.addEventListener('scroll', onRailScroll, { passive: true });
    var mediaUpdate = function () { paint(current, true); schedule(); };
    reducedMotion.addEventListener('change', mediaUpdate);
    paint(0, true);
    schedule();
    if (!reducedMotion.matches) {
      ensureGsap().then(function (available) {
        if (!available || !section.isConnected || (!state || state.cleanup !== cleanup)) return;
        var gsap = window.gsap, ScrollTrigger = window.ScrollTrigger;
        gsap.registerPlugin(ScrollTrigger);
        gsapReady = true;
        section.classList.add('gsap-ready');
        ctx = gsap.context(function () {
          var mm = gsap.matchMedia();
          mm.add('(prefers-reduced-motion: no-preference) and (min-width: 768px)', function () {
            cards.forEach(function (card) {
              gsap.from(Array.from(card.children), {
                y: 24, opacity: 0, stagger: .08, duration: .7, ease: 'power3.out',
                scrollTrigger: { trigger: card, start: 'top 72%', toggleActions: 'play none none reverse' }
              });
            });
          });
          ScrollTrigger.create({
            trigger: section, start: 'top 55%', end: 'bottom 55%',
            onToggle: function (self) { if (self.isActive) schedule(); },
            onUpdate: function () { schedule(); }
          });
        }, section);
        paint(current, true);
      });
    }

    function cleanup() {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', onResize);
      rail.removeEventListener('scroll', onRailScroll);
      reducedMotion.removeEventListener('change', mediaUpdate);
      if (window.gsap) window.gsap.killTweensOf(section);
      if (ctx) ctx.revert();
      nav.remove();
      section.removeAttribute('data-services-color-shift');
      section.removeAttribute('data-color-phase');
      section.classList.remove('gsap-ready');
      if (!originalRailId) rail.removeAttribute('id');
      section.style.backgroundColor = starting.bg;
      section.style.color = starting.ink;
      if (starting.bgc) section.style.setProperty('--bgc', starting.bgc);
      else section.style.removeProperty('--bgc');
      if (starting.inkc) section.style.setProperty('--inkc', starting.inkc);
      else section.style.removeProperty('--inkc');
    }
    return cleanup;
  }
  function reconcile() {
    scheduled = false;
    var target = document.querySelector(selector);
    if (state && (!state.element.isConnected || state.element !== target)) {
      state.cleanup();
      state = null;
    }
    if (target && !state) {
      var cleanup = setup(target);
      if (cleanup) { state = { element: target, cleanup: cleanup }; }
    }
  }
  function queueReconcile() {
    if (!scheduled) {
      scheduled = true;
      window.requestAnimationFrame(reconcile);
    }
  }
  // Route-aware: the TanStack Router can swap homepage sections without reloading.
  observer = new MutationObserver(queueReconcile);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', queueReconcile, { once: true });
  else queueReconcile();
})();
