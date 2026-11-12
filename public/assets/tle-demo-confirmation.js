/* Optional Motion enhancement for browser-only demo receipts. */
(() => {
  if (window.TLEDemoConfirmation) return;
  const asset = new URL(document.currentScript.src);
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const active = new WeakMap();
  const entrances = {
    bloom: { transform: ['translateY(13px) scale(.975)', 'translateY(0) scale(1)'], duration: .48 },
    pop: { transform: ['scale(.96)', 'scale(1.012)', 'scale(1)'], duration: .42 },
    slide: { transform: ['translateX(-14px)', 'translateX(0)'], duration: .37 },
    lift: { transform: ['translateY(12px)', 'translateY(0)'], duration: .38 },
    reveal: { transform: ['translateY(6px)', 'translateY(0)'], duration: .44 }
  };
  let motion;

  function play(panel) {
    if (!panel || reducedMotion.matches) return;
    const run = {};
    active.set(panel, run);
    motion ??= import(new URL('./vendor/motion-mini-12.23.24.js', asset));
    motion.then(({ animate }) => {
      if (active.get(panel) !== run || reducedMotion.matches || !panel.getClientRects().length) return;
      const effect = entrances[getComputedStyle(panel).getPropertyValue('--tle-receipt-motion').trim()] || entrances.lift;
      animate(panel, { opacity: [.5, 1], transform: effect.transform }, {
        duration: effect.duration, ease: [.22, .8, .28, 1]
      });
      const rows = panel.querySelectorAll('[data-receipt-line]');
      rows.forEach((row, index) => animate(row, { opacity: [.45, 1], transform: ['translateY(6px)', 'translateY(0)'] }, {
        duration: .25, delay: .07 + Math.min(index, 5) * .035, ease: [.2, .75, .3, 1]
      }));
    }).catch(() => {});
  }

  document.addEventListener('toggle', event => {
    const details = event.target;
    if (!details.matches?.('[data-receipt-disclosure]') || !details.open) return;
    play(details.querySelector('[data-receipt-items]'));
  }, true);

  window.TLEDemoConfirmation = { play };
})();
