/* SOVA's original photo is the verified poster. A generated 1536x1024
   brand-matched loop replaces the old 1024x1364 portrait export.
   Other demo cinematic loaders are intentionally untouched. */
(() => {
  'use strict';
  if (document.documentElement.dataset.tleOneMotion !== 'sova') return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const saveData = navigator.connection?.saveData === true;
  const source = new URL('./media/hero-motion-hq-20261108.mp4', document.baseURI).href;
  const photo = new URL('./resources/01-hero.png', document.baseURI).href;
  let host = null;
  let video = null;
  let queued = false;
  const inView = () => {
    if (!host || !host.isConnected || document.hidden) return false;
    const r = host.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && r.bottom >= -60 && r.top <= innerHeight + 60;
  };
  function clear() {
    if (video) {
      video.pause();
      video.remove();
    }
    video = null;
    host = null;
  }
  function showOnFrame(v) {
    if (v !== video || !v.isConnected || !inView() || reduced.matches) return;
    const reveal = () => {
      if (v === video && !v.paused && inView()) v.classList.add('sova-motion-playing');
    };
    if (typeof v.requestVideoFrameCallback === 'function') v.requestVideoFrameCallback(reveal);
    else requestAnimationFrame(() => requestAnimationFrame(reveal));
  }
  function update() {
    if (!video) return;
    if (!inView() || reduced.matches || saveData) {
      video.pause();
      if (reduced.matches) video.classList.remove('sova-motion-playing');
      return;
    }
    const v = video;
    const p = v.play();
    if (p?.then) p.then(() => showOnFrame(v)).catch(() => {});
  }
  function mount() {
    if (saveData || reduced.matches) { clear(); return; }
    const candidate = document.querySelector('.hero .hero-media');
    if (!candidate) { if (host && !host.isConnected) clear(); return; }
    if (candidate === host && video?.isConnected) { update(); return; }
    clear();
    host = candidate;
    if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
    const v = document.createElement('video');
    v.dataset.sovaHqMotion = '';
    v.setAttribute('data-tle-reactive-photo', '');
    v.setAttribute('aria-hidden', 'true');
    v.muted = true;
    v.defaultMuted = true;
    v.playsInline = true;
    v.loop = true;
    v.autoplay = true;
    v.controls = false;
    v.disablePictureInPicture = true;
    v.disableRemotePlayback = true;
    v.tabIndex = -1;
    v.preload = 'metadata';
    v.poster = photo;
    v.addEventListener('loadedmetadata', () => {
      /* Never display the old, enlarged vertical export or a low-resolution clip. */
      if (v.videoWidth < 1400 || v.videoHeight < 900 ||
          Math.abs(v.videoWidth / v.videoHeight - 1.5) > 0.12) {
        if (v === video) clear();
        return;
      }
      update();
    });
    v.addEventListener('loadeddata', () => showOnFrame(v));
    v.addEventListener('playing', () => showOnFrame(v));
    v.addEventListener('error', () => { if (v === video) clear(); });
    host.append(v);
    video = v;
    v.src = source;
    update();
  }
  function schedule() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; mount(); });
  }
  function boot() {
    mount();
    window.addEventListener('scroll', update, {passive: true});
    window.addEventListener('resize', schedule, {passive: true});
    document.addEventListener('visibilitychange', update);
    reduced.addEventListener?.('change', schedule);
    const root = document.querySelector('#app') || document.body;
    new MutationObserver(changes => {
      if (changes.some(c => [...c.addedNodes, ...c.removedNodes].some(n =>
        n.nodeType === 1 && (n.matches?.('.hero, .hero-media') ||
          n.querySelector?.('.hero .hero-media'))))) schedule();
    }).observe(root, {childList: true, subtree: true});
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, {once: true});
  else boot();
})();
