/* Sweet Lisa's demo: Lenis scroll + accessible, iOS-safe mobile-navigation lock. */
document.addEventListener('DOMContentLoaded', () => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const lenis = !reducedMotion && typeof window.Lenis === 'function'
    ? new window.Lenis({ autoRaf: true, anchors: true, duration: 1.1, smoothWheel: true })
    : null;
  window.siteLenis = lenis;

  const lockReasons = new Set();
  let savedScrollY = 0;
  const body = document.body;
  const root = document.documentElement;

  function syncScrollLock() {
    const shouldLock = lockReasons.size > 0;
    if (shouldLock && !body.classList.contains('ui-scroll-locked')) {
      savedScrollY = window.scrollY || lenis?.scroll || 0;
      lenis?.stop();
      root.classList.add('ui-scroll-locked');
      body.classList.add('ui-scroll-locked');
      body.style.top = '-' + savedScrollY + 'px';
      body.style.position = 'fixed';
      body.style.width = '100%';
    } else if (!shouldLock && body.classList.contains('ui-scroll-locked')) {
      body.classList.remove('ui-scroll-locked');
      root.classList.remove('ui-scroll-locked');
      body.style.position = '';
      body.style.top = '';
      body.style.width = '';
      window.scrollTo(0, savedScrollY);
      if (lenis) {
        lenis.start();
        lenis.scrollTo(savedScrollY, { immediate: true });
      }
    }
  }
  window.SiteScroll = {
    lock(reason) { lockReasons.add(reason); syncScrollLock(); },
    unlock(reason) { lockReasons.delete(reason); syncScrollLock(); },
    lenis
  };

  const toggle = document.getElementById('navToggle');
  const nav = document.getElementById('mobileNav');
  const backdrop = document.getElementById('navBackdrop');
  if (!toggle || !nav) return;

  const isOpen = () => toggle.getAttribute('aria-expanded') === 'true';
  function setNavigation(open) {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    nav.hidden = !open;
    if (backdrop) backdrop.hidden = !open;
    body.classList.toggle('mobile-navigation-open', open);
    if (open) window.SiteScroll.lock('nav');
    else window.SiteScroll.unlock('nav');
  }

  toggle.addEventListener('click', () => setNavigation(!isOpen()));
  backdrop?.addEventListener('click', () => setNavigation(false));
  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setNavigation(false)));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && isOpen()) {
      setNavigation(false);
      toggle.focus();
    }
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 820 && isOpen()) setNavigation(false);
  });
});
