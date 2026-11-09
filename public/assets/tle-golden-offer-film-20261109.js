/* Golden Grid: in-view inline loop in the Website for Your Business customer preview.
   Reuses the original demo MP4; photo stays readable before playback and on errors. */
(() => {
  'use strict';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const saveData = Boolean(navigator.connection && navigator.connection.saveData);
  for (const box of document.querySelectorAll('[data-gg-offer-video]')) {
    const video = box.querySelector('video.owner-customer-motion');
    const playButton = box.querySelector('button.owner-customer-play');
    if (!video || !playButton) continue;
    let inView = !('IntersectionObserver' in window);
    let loaded = false;
    let failed = false;
    const disabled = () => reduced.matches || saveData;
    const attempt = () => {
      if (failed || disabled() || !inView || document.hidden) return;
      if (!loaded) {
        loaded = true;
        video.src = video.dataset.src;
        video.load();
      }
      const result = video.play();
      if (result && typeof result.catch === 'function') {
        result.catch(() => {
          if (!failed && !disabled() && inView) playButton.hidden = false;
        });
      }
    };
    const update = () => {
      if (disabled()) {
        video.pause();
        video.classList.remove('is-playing');
        playButton.hidden = true;
        return;
      }
      if (!inView || document.hidden) { video.pause(); return; }
      attempt();
    };
    video.addEventListener('playing', () => {
      video.classList.add('is-playing');
      playButton.hidden = true;
    });
    video.addEventListener('error', () => {
      failed = true;
      video.classList.remove('is-playing');
      playButton.hidden = true;
    });
    playButton.addEventListener('click', attempt);
    document.addEventListener('visibilitychange', update);
    reduced.addEventListener('change', update);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([entry]) => {
        inView = Boolean(entry && entry.isIntersecting);
        update();
      }, { rootMargin:'80px 0px', threshold:0.01 }).observe(box);
    }
    update();
  }
})();
