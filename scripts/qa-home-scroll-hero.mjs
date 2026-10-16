/* Homepage scroll-hero regression test. No real bookings, emails or checkouts. */
import assert from 'node:assert/strict';
import { readFileSync, mkdirSync } from 'node:fs';
const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const en = read('src/components/editorial-sections.tsx');
const es = read('src/routes/es.index.tsx');
const motion = read('src/components/home-motion.tsx');
const root = read('src/routes/__root.tsx');
const css = read('public/assets/tle-hero-scroll.css');
const englishHero = en.split('export function HomeHero()')[1]?.split('const services =')[0] || '';
const spanishHero = es.split('function SpanishHome()')[1]?.split('<SmartWelcomeBundle lang="es"/>')[0] || '';
for (const [lang, hero, expected] of [
  ['EN', englishHero, '/booking-demo/?lang=en'],
  ['ES', spanishHero, '/booking-demo/?lang=es'],
]) {
  assert(hero.includes('className="hero-scroll"'), lang + ': missing sticky section');
  assert(hero.includes('hero-scroll-stage') && hero.includes('hero-scroll-frame'), lang + ': missing full-screen image wrapper');
  assert(hero.includes('hero-scroll-reveal') && hero.includes('href="#hero-next"'), lang + ': missing underlay anchor');
  assert(hero.includes('id="hero-next"'), lang + ': missing next-section target');
  assert.equal(hero.split('href="' + expected + '"').length - 1, 1, lang + ': demo CTA missing or duplicated');
  assert(hero.indexOf('hero-cta-row') < hero.indexOf('hero-notice-flow'), lang + ': CTA must be inside photo hero');
}
assert(css.includes('height: 180svh') && css.includes('position: sticky') && css.includes('height: 100svh'));
assert(css.includes('transform-origin: 50% 40%') && css.includes('scale(calc(1 - .3 * var(--hero-scroll-progress, 0)))'));
assert(css.includes('border-radius: calc(24px * var(--hero-scroll-progress, 0))'));
assert(css.includes('opacity: clamp(0, calc(1 - 2 * var(--hero-scroll-progress, 0)), 1)'));
assert(css.includes('@media (prefers-reduced-motion: reduce)'));
assert(motion.includes("addEventListener('scroll', schedule, { passive: true })"));
assert(motion.includes('requestAnimationFrame(update)') && motion.includes('Math.max(1, hero.offsetHeight - window.innerHeight)'));
assert(motion.includes("toggleAttribute('inert', progress >= 0.5)"));
assert(root.indexOf('tle-hero-scroll.css') > root.indexOf('tle-saas-ui-v1.css'), 'Hero theme must load last');
console.log('[HERO STATIC QA PASSED] EN/ES layout, unchanged demo destinations, scroll math, reduced motion.');
if (!process.argv.includes('--browser')) process.exit(0);

const { chromium } = await import('playwright');
const base = (process.env.QA_URL || 'http://127.0.0.1:4173').replace(/\/$/, '');
const browser = await chromium.launch({ headless: true });
const viewports = [
  { width: 360, height: 780 }, { width: 390, height: 844 },
  { width: 820, height: 1000 }, { width: 1024, height: 768 },
  { width: 1440, height: 900 },
];
const errors = [];
mkdirSync('qa-screenshots', { recursive: true });
try {
 for (const [lang, route] of [['en', '/'], ['es', '/es/']]) {
  for (const viewport of viewports) {
   const page = await browser.newPage({ viewport, reducedMotion: 'no-preference' });
   page.on('pageerror', err => errors.push(lang + ' ' + viewport.width + ': ' + err.message));
   await page.goto(base + route, { waitUntil: 'domcontentloaded', timeout: 45000 });
   const hero = page.locator('.hero-scroll');
   await hero.waitFor({ state: 'visible', timeout: 20000 });
   await page.waitForTimeout(180);
   const snapshot = await page.evaluate(() => {
    const h = document.querySelector('.hero-scroll');
    return { top: scrollY + h.getBoundingClientRect().top, travel: h.offsetHeight - innerHeight };
   });
   assert(snapshot.travel > 0.65 * viewport.height, lang + ' ' + viewport.width + ': section too short');
   assert.equal(await hero.locator('.hero-intro .cta-button').count(), 1, 'CTA missing inside hero');
   await page.evaluate(y => { document.documentElement.style.scrollBehavior = 'auto'; window.scrollTo(0, y); }, snapshot.top);
   await page.waitForTimeout(130);
   const initial = await hero.locator('.hero-scroll-frame').evaluate(el => new DOMMatrixReadOnly(getComputedStyle(el).transform).a);
   assert(Math.abs(initial - 1) < .04, lang + ' ' + viewport.width + ': initial full-bleed scale incorrect: ' + initial);
   await page.evaluate(y => window.scrollTo(0, y), snapshot.top + snapshot.travel);
   await page.waitForTimeout(180);
   const finish = await hero.evaluate(el => {
    const frame = el.querySelector('.hero-scroll-frame');
    const intro = el.querySelector('.hero-intro');
    const hint = el.querySelector('.hero-scroll-reveal');
    const style = getComputedStyle(frame);
    return {
     progress: Number(el.style.getPropertyValue('--hero-scroll-progress')),
     scale: new DOMMatrixReadOnly(style.transform).a,
     radius: parseFloat(style.borderTopLeftRadius),
     introOpacity: Number(getComputedStyle(intro).opacity),
     hintVisible: getComputedStyle(hint).visibility,
     clipped: el.scrollWidth > el.clientWidth + 3
    };
   });
   assert(finish.progress > .98 && Math.abs(finish.scale - .7) < .04, lang + ' ' + viewport.width + ': final scale: ' + JSON.stringify(finish));
   assert(Math.abs(finish.radius - 24) < 2, lang + ' ' + viewport.width + ': rounded card radius');
   assert(finish.introOpacity < .05 && finish.hintVisible === 'visible' && !finish.clipped, lang + ' ' + viewport.width + ': fade/reveal/overflow');
   if ([390, 820, 1440].includes(viewport.width)) await page.screenshot({ path: `qa-screenshots/home-scroll-${lang}-${viewport.width}-final.png` });
   await page.close();
  }
  const reduced = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  await reduced.goto(base + route, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await reduced.locator('.hero-scroll').waitFor({ state: 'visible' });
  const stable = await reduced.evaluate(() => {
   const frame = document.querySelector('.hero-scroll-frame');
   const stage = document.querySelector('.hero-scroll-stage');
   return { transform: getComputedStyle(frame).transform, radius: parseFloat(getComputedStyle(frame).borderTopLeftRadius),
     sticky: getComputedStyle(stage).position, titleOpacity: Number(getComputedStyle(document.querySelector('.hero-intro')).opacity) };
  });
  assert(stable.transform === 'none' && Math.abs(stable.radius - 24) < 1 && stable.sticky !== 'sticky' && stable.titleOpacity === 1,
   lang + ': reduced-motion card must be static/readable: ' + JSON.stringify(stable));
  await reduced.close();
 }
 assert.deepEqual(errors, [], 'Browser errors');
 console.log('[HERO BROWSER QA PASSED] EN/ES at 360/390/820/1024/1440 + static reduced-motion card.');
} finally { await browser.close(); }
