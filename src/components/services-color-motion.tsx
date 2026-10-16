import { useEffect } from 'react';

/**
 * Five accessible color beats, scoped to the public services section.
 * Keeps the approved six service cards, links, prices and mobile swipe rail intact.
 */
const themes = [
  { bg: '#FAF8F3', ink: '#191919' },
  { bg: '#D7EFFF', ink: '#173B56' },
  { bg: '#316C95', ink: '#FFFFFF' },
  { bg: '#173F59', ink: '#EAF4FC' },
  { bg: '#FAF8F3', ink: '#191919' },
] as const;

type TriggerState = { progress: number; isActive: boolean };
type TriggerApi = { create: (vars: Record<string, unknown>) => { kill: () => void } };
type GsapApi = {
  registerPlugin: (plugin: TriggerApi) => void;
  context: (callback: () => void, scope: HTMLElement) => { revert: () => void };
  set: (target: HTMLElement, vars: Record<string, unknown>) => void;
  to: (target: HTMLElement, vars: Record<string, unknown>) => void;
  from: (target: Element[], vars: Record<string, unknown>) => void;
  matchMedia: () => { add: (condition: string, callback: () => void) => void; revert: () => void };
};
type GsapWindow = Window & { gsap?: GsapApi; ScrollTrigger?: TriggerApi };

let loading: Promise<void> | undefined;
function script(src: string, id: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const current = document.querySelector<HTMLScriptElement>(`script[data-tle-motion="${id}"]`);
    const el = current || document.createElement('script');
    if (el.dataset.loaded === 'true') { resolve(); return; }
    el.addEventListener('load', () => { el.dataset.loaded = 'true'; resolve(); }, { once: true });
    el.addEventListener('error', () => reject(new Error(`Unable to load ${id}`)), { once: true });
    if (!current) {
      el.src = src;
      el.async = true;
      el.dataset.tleMotion = id;
      document.head.appendChild(el);
    }
  });
}
function ensureGsap() {
  const win = window as GsapWindow;
  if (win.gsap && win.ScrollTrigger) return Promise.resolve();
  if (!loading) {
    loading = script('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.14.2/gsap.min.js', 'gsap')
      .then(() => script('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.14.2/ScrollTrigger.min.js', 'scroll-trigger'))
      .catch((error: unknown) => { loading = undefined; throw error; });
  }
  return loading;
}

export function ServicesColorMotion() {
  useEffect(() => {
    const section = document.querySelector<HTMLElement>('.solutions-section[data-services-color-shift]');
    if (!section) return;
    let disposed = false;
    let scope: { revert: () => void } | undefined;
    let detachRail = () => {};
    const original = {
      backgroundColor: section.style.backgroundColor,
      color: section.style.color,
      bgc: section.style.getPropertyValue('--bgc'),
      inkc: section.style.getPropertyValue('--inkc'),
    };

    ensureGsap().then(() => {
      if (disposed || !section.isConnected) return;
      const { gsap, ScrollTrigger } = window as GsapWindow;
      if (!gsap || !ScrollTrigger) return;
      gsap.registerPlugin(ScrollTrigger);
      const rail = section.querySelector<HTMLElement>('.service-grid');
      const cards = Array.from(rail?.querySelectorAll<HTMLElement>('.service-card') || []);
      const counter = section.querySelector<HTMLElement>('[data-service-theme-counter]');
      const bars = Array.from(section.querySelectorAll<HTMLElement>('[data-service-theme-bar]'));
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
      let current = -1;
      let touchedRail = false;
      const paint = (index: number, immediate = false) => {
        const next = Math.max(0, Math.min(themes.length - 1, index));
        if (next === current) return;
        current = next;
        const theme = themes[next];
        if (counter) counter.textContent = `${String(next + 1).padStart(2, '0')} / 05`;
        bars.forEach((bar, i) => bar.dataset.active = String(i <= Math.floor(next * 3 / themes.length));
        const vars = {
          backgroundColor: theme.bg,
          color: theme.ink,
          '--bgc': theme.bg,
          '--inkc': theme.ink,
        };
        if (reduced.matches || immediate) gsap.set(section, vars);
        else gsap.to(section, { ...vars, duration: 0.45, ease: 'power2.out', overwrite: true });
      };
      scope = gsap.context(() => {
        const mm = gsap.matchMedia();
        mm.add('(prefers-reduced-motion: no-preference) and (min-width: 768px)', () => {
          cards.forEach(card => {
            gsap.from(Array.from(card.children), {
              y: 24, opacity: 0, stagger: 0.08, duration: 0.7, ease: 'power3.out',
              scrollTrigger: { trigger: card, start: 'top 72%', toggleActions: 'play none none reverse' },
            });
          });
        });
        // The mobile cards are horizontally scrollable, so never leave later cards
        // opacity:0 waiting for a vertical ScrollTrigger that cannot reach them.
        ScrollTrigger.create({
          trigger: section,
          start: 'top 55%',
          end: 'bottom 55%',
          onToggle: (self: TriggerState) => {
            if (self.isActive && !touchedRail) paint(Math.min(4, Math.floor(self.progress * 5)));
          },
          onUpdate: (self: TriggerState) => {
            if (!touchedRail || window.innerWidth >= 768) paint(Math.min(4, Math.floor(self.progress * 5)));
          },
        });
        // matchMedia contexts and ScrollTrigger instances are automatically
        // reverted by the parent gsap.context on route unmount.
      }, section);
      const onRailScroll = () => {
        if (window.innerWidth >= 768 || !rail || !cards.length) return;
        touchedRail = true;
        const middle = rail.scrollLeft + rail.clientWidth / 2;
        let best = 0;
        let distance = Number.POSITIVE_INFINITY;
        cards.forEach((card, i) => {
          const center = card.offsetLeft - rail.offsetLeft + card.offsetWidth / 2;
          if (Math.abs(center - middle) < distance) {
            best = i;
            distance = Math.abs(center - middle);
          }
        });
        paint(Math.round((best / Math.max(1, cards.length - 1)) * 4));
      };
      rail?.addEventListener('scroll', onRailScroll, { passive: true });
      detachRail = () => rail?.removeEventListener('scroll', onRailScroll);
      paint(0, true);
    }).catch(() => {
      // Keep the static, legible existing design if third-party scripts are blocked.
    });
    return () => {
      disposed = true;
      detachRail();
      scope?.revert();
      section.style.backgroundColor = original.backgroundColor;
      section.style.color = original.color;
      if (original.bgc) section.style.setProperty('--bgc', original.bgc);
      else section.style.removeProperty('--bgc');
      if (original.inkc) section.style.setProperty('--inkc', original.inkc);
      else section.style.removeProperty('--inkc');
    };
  }, []);
  return null;
}
