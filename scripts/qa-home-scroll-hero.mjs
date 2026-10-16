/* Homepage split-and-scroll hero regression checks. No booking submission or email. */
import assert from 'node:assert/strict';
import { readFileSync, mkdirSync } from 'node:fs';
const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const en = read('src/components/editorial-sections.tsx');
const es = read('src/routes/es.index.tsx');
const motion = read('src/components/home-motion.tsx');
const observer = read('src/components/use-hero-wipe.ts');
const root = read('src/routes/__root.tsx');
const scrollCSS = read('public/assets/tle-hero-scroll.css');
const styles = read('src/styles.css');
const splitWord = read('src/components/hero-split-word-link.tsx');
const englishHero = en.split('export function HomeHero()')[1]?.split('const services =')[0] || '';
const spanishHero = es.split('function SpanishHome()')[1]?.split('<SmartWelcomeBundle lang="es"/>')[0] || '';

for (const [lang, hero, expected] of [
  ['EN', englishHero, '/booking-demo/?lang=en'],
  ['ES', spanishHero, '/booking-demo/?lang=es'],
]) {
  assert(hero.includes('className="hero-scroll"'), lang + ': scroll stage missing');
  assert(hero.includes('hero-scroll-stage') && hero.includes('hero-scroll-frame'), lang + ': scroll frame missing');
  assert(hero.includes('hero-scroll-reveal') && hero.includes('<HeroSplitWordLink lang="' + lang.toLowerCase() + '"/>'), lang + ': split-word scroll link missing');
  assert(hero.includes('id="hero-next"'), lang + ': next-section target missing');
  assert(hero.includes('className="hero-split-visual"'), lang + ': separate image panel missing');
  assert(hero.includes('className="tle-hero-soft-mesh" aria-hidden="true"'), lang + ': decorative mesh absent or exposed to assistive technology');
  assert(hero.includes('data-wipe-visible={revealed && heroLoaded}'), lang + ': image-ready reveal gate missing');
  assert(hero.includes('ref={heroRef}'), lang + ': IntersectionObserver hero ref missing');
  assert.equal(hero.split('href="' + expected + '"').length - 1, 1, lang + ': duplicate or absent personalized demo CTA');
  assert(hero.indexOf('hero-cta-row') < hero.indexOf('hero-split-visual'), lang + ': copy must lead on desktop');
  assert(hero.indexOf('hero-split-visual') < hero.indexOf('hero-notice-flow'), lang + ': notifications must sit inside image');
}
assert(splitWord.includes('href="#hero-next"') && splitWord.includes('aria-label=') && splitWord.includes('tle-hero-split-upper') && splitWord.includes('tle-hero-split-lower') && splitWord.includes('tle-hero-split-reveal'), 'accessible native scroll anchor or two word halves missing');
assert(observer.includes('IntersectionObserver') && observer.includes('observer.disconnect()'));
assert(scrollCSS.includes('height: 180svh') && scrollCSS.includes('position: sticky'));
assert(scrollCSS.includes('scale(calc(1 - .3 * var(--hero-scroll-progress, 0)))'));
assert(scrollCSS.includes('2026 split-hero extension') && scrollCSS.includes('hero-split-visual'));
assert(scrollCSS.includes('2026-10-16 iPad/tablet parity'), 'portrait iPad responsive override missing');
assert(scrollCSS.includes('@keyframes tle-hero-mesh-a') && scrollCSS.includes('@keyframes tle-hero-mesh-d'), 'four independent mesh animations missing');
assert(scrollCSS.includes('pointer-events:none') && scrollCSS.includes('prefers-reduced-motion:reduce'), 'mesh must be non-interactive and respect reduced motion');
assert(scrollCSS.includes('radial-gradient(circle') && !scrollCSS.includes('filter:blur('), 'soft mesh must not use blur filters');
assert(!scrollCSS.includes('.hero-scroll-stage > .tle-hero-soft-mesh'), 'gradient must not be placed behind the exterior scroll background');
assert(styles.includes('clip-path:inset(0 0 0 100% round 20px)'));
assert(styles.includes('clip-path:inset(0 0 0 0 round 20px)'));
assert(styles.includes('transition:clip-path 900ms cubic-bezier(.32,.72,0,1)'));
assert(styles.includes('@media (prefers-reduced-motion:reduce)'));
assert(motion.includes("addEventListener('scroll', schedule, { passive: true })"));
assert(motion.includes('requestAnimationFrame(update)'));
assert(motion.includes('!splitHero && progress >= 0.5'), 'CTA must stay keyboard-accessible during scroll');
assert(root.indexOf('tle-hero-scroll.css') > root.indexOf('tle-saas-ui-v1.css'), 'Scroll overrides must load after the theme');
console.log('[HERO STATIC QA PASSED] EN/ES split wipe, mobile stack, scroll shrink, intact demo CTA.');

if (!process.argv.includes('--browser')) process.exit(0);
const { chromium } = await import('playwright');
const base = (process.env.QA_URL || 'http://127.0.0.1:4173').replace(/\/$/, '');
const browser = await chromium.launch({ headless: true });
const viewports = [
  { width: 360, height: 780 }, { width: 390, height: 844 },
  { width: 820, height: 1000 }, { width: 834, height: 1194 },
  { width: 1024, height: 1366 }, { width: 1024, height: 768 },
  { width: 1440, height: 768 }, { width: 1440, height: 900 },
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
   await page.waitForFunction(() => document.querySelector('.hero-split')?.getAttribute('data-wipe-visible') === 'true', null, { timeout: 25000 });
   await page.waitForTimeout(1050); // 900ms clip-path + copy's 120ms entrance delay
   const state = await page.evaluate(() => {
    const hero = document.querySelector('.hero-scroll');
    const frame = hero.querySelector('.hero-scroll-frame');
    const stage = hero.querySelector('.hero-scroll-stage');
    const panel = hero.querySelector('.hero-split-visual');
    const photo = panel.querySelector('img');
    const intro = hero.querySelector('.hero-intro');
    const mesh = hero.querySelector('.tle-hero-soft-mesh');
    const blobs = Array.from(mesh.querySelectorAll('span'));
    const a = panel.getBoundingClientRect();
    const b = intro.getBoundingClientRect();
    return {
     clipped: hero.scrollWidth > hero.clientWidth + 3,
     clipPath: getComputedStyle(panel).clipPath,
     imageScale: new DOMMatrixReadOnly(getComputedStyle(photo).transform).a,
     introOpacity: Number(getComputedStyle(intro).opacity),
     mesh: {
       count:blobs.length,
       insideHeroFrame:mesh.parentElement === frame,
       dotsDisplay:getComputedStyle(hero.querySelector('.tle-hero-connection-backdrop')).display,
       frameBackground:getComputedStyle(frame).backgroundImage,
       copyShift:getComputedStyle(intro).top,
       photoShift:getComputedStyle(panel).top,
       display:getComputedStyle(mesh).display,
       pointerEvents:getComputedStyle(mesh).pointerEvents,
       zIndex:Number(getComputedStyle(mesh).zIndex),
       photoZIndex:Number(getComputedStyle(panel).zIndex),
       animations:blobs.map(blob=>getComputedStyle(blob).animationName)
     },
     panel: { top:a.top, left:a.left, width:a.width, height:a.height, bottom:a.bottom },
     copy: { top:b.top, left:b.left, width:b.width },
     stagePosition: getComputedStyle(stage).position,
     framePosition: getComputedStyle(frame).position,
     frameScale: new DOMMatrixReadOnly(getComputedStyle(frame).transform).a,
     travel: hero.offsetHeight - innerHeight,
     top:scrollY + hero.getBoundingClientRect().top,
    };
   });
   assert.equal(await hero.locator('.hero-intro .cta-button').count(), 1, lang + ': CTA missing');
   assert(!state.clipped, lang + ' ' + viewport.width + ': hero horizontal clipping');
   assert(state.panel.width > 160, lang + ' ' + viewport.width + ': image panel compressed');
   if (viewport.width === 1440 && viewport.height === 768) {
     assert(state.panel.bottom < viewport.height - 12, lang + ': hero photo is cut off by short desktop screen: ' + state.panel.bottom);
   }
   assert(!state.clipPath.includes('100%'), lang + ' ' + viewport.width + ': wipe never opened: ' + state.clipPath);
   assert(Math.abs(state.imageScale - 1) < .04, lang + ' ' + viewport.width + ': photo still zoomed');
   assert(state.introOpacity > .96, lang + ' ' + viewport.width + ': copy did not appear');
   assert.equal(state.mesh.count, 4, lang + ': exactly four decorative gradients expected');
   if (viewport.width >= 1024) {
     assert(state.mesh.display !== 'none', lang + ': desktop mesh missing');
     assert(state.mesh.insideHeroFrame, lang + ': gradient must stay INSIDE the hero card, not the outer scroll background');
     assert.notEqual(state.mesh.dotsDisplay, 'none', lang + ': outer dotted/Request/Follow-up background must remain untouched');
     assert(state.mesh.frameBackground.includes('linear-gradient') && /(227, 242, 254|233, 245, 254)/.test(state.mesh.frameBackground), lang + ': blue gradient should be visible inside hero on entry');
     if(viewport.width > 1180){
       assert(state.mesh.copyShift==='-10px' && state.mesh.photoShift==='-10px',lang+': desktop hero content must rise slightly together without moving the outer backdrop');
     }
     assert.equal(state.mesh.pointerEvents, 'none', lang + ': mesh intercepts CTA clicks');
     assert(state.mesh.photoZIndex > state.mesh.zIndex, lang + ': photo must paint above moving gradients');
     assert(state.mesh.animations.every(name=>name.startsWith('tle-hero-mesh-')), lang + ': desktop ambient animations not running');
   } else {
     assert(state.mesh.insideHeroFrame, lang + ': gradient placement must remain inside hero at all sizes');
     assert.equal(state.mesh.display, 'none', lang + ': do not change phone/tablet composition');
   }
   if (viewport.width === 1440) await page.screenshot({ path:`qa-screenshots/home-scroll-${lang}-1440x${viewport.height}-mesh-initial.png`, fullPage:false });
   if (viewport.width < 768) {
    assert(state.panel.top < state.copy.top, lang + ': image must stack above text on phone');
    assert(state.stagePosition !== 'sticky' && state.framePosition !== 'absolute', lang + ': mobile must use natural height');
    assert(Math.abs(state.frameScale - 1) < .04, lang + ': mobile hero cannot shrink');
   } else {
    if (viewport.width <= 1100 && viewport.height > viewport.width) {
     assert(state.panel.top < state.copy.top, lang + ' ' + viewport.width + ': portrait tablet photo must be ABOVE copy');
     assert(state.panel.width > viewport.width * .78, lang + ' ' + viewport.width + ': portrait tablet image too narrow: ' + state.panel.width);
     assert(state.panel.height > viewport.height * .35, lang + ' ' + viewport.width + ': portrait tablet image too short: ' + state.panel.height);
    } else {
     assert(state.panel.left > state.copy.left, lang + ' ' + viewport.width + ': landscape/desktop photo must be on the right');
    }
    assert(state.stagePosition === 'sticky', lang + ': desktop sticky scroll effect removed');
    assert(state.travel > 0.65 * viewport.height, lang + ': scroll stage too short');
    await page.evaluate(y => { document.documentElement.style.scrollBehavior='auto'; window.scrollTo(0,y); }, state.top + state.travel);
    await page.waitForTimeout(180);
    const end = await hero.evaluate(el => ({
     scale:new DOMMatrixReadOnly(getComputedStyle(el.querySelector('.hero-scroll-frame')).transform).a,
     opacity:Number(getComputedStyle(el.querySelector('.hero-intro')).opacity),
     hint:getComputedStyle(el.querySelector('.hero-scroll-reveal')).visibility,
     inert:el.querySelector('.hero-intro').hasAttribute('inert')
    }));
    assert(Math.abs(end.scale - .7) < .045, lang + ' ' + viewport.width + ': expected scroll shrink to .7: ' + JSON.stringify(end));
    assert(end.opacity > .95 && !end.inert, lang + ': visible demo CTA became inaccessible');
    assert(end.hint === 'visible', lang + ': scroll continue hint missing');
   }
   if ([390,820,1440].includes(viewport.width)) await page.screenshot({ path:`qa-screenshots/home-scroll-${lang}-${viewport.width}-final.png`, fullPage:false });
   await page.close();
  }
  // Regress the exact touch-only effect: on iPads its one-time animation must
  // start when the scroll link becomes visible, not before first scroll.
  const ipadTouch = await browser.newPage({
    viewport: { width: 834, height: 1194 },
    hasTouch: true,
    isMobile: true,
    reducedMotion: 'no-preference'
  });
  await ipadTouch.goto(base + route, { waitUntil:'domcontentloaded', timeout:45000 });
  await ipadTouch.waitForFunction(() => document.querySelector('.hero-split')?.getAttribute('data-wipe-visible') === 'true');
  const beforePeek = await ipadTouch.locator('.hero-scroll-reveal .tle-hero-split-upper').evaluate(el=>getComputedStyle(el).animationName);
  assert.equal(beforePeek, 'none', lang + ': iPad touch peek must wait until the link is visible');
  await ipadTouch.evaluate(() => {
    document.documentElement.style.scrollBehavior='auto';
    const hero=document.querySelector('.hero-scroll');
    window.scrollTo(0, scrollY + hero.getBoundingClientRect().top + hero.offsetHeight - innerHeight);
  });
  await ipadTouch.waitForFunction(() => document.querySelector('.hero-scroll')?.classList.contains('hero-scroll-revealed'), null, { timeout: 10000 });
  const afterPeek = await ipadTouch.locator('.hero-scroll-reveal .tle-hero-split-upper').evaluate(el=>getComputedStyle(el).animationName);
  assert(afterPeek.includes('tle-word-peek-upper'), lang + ': iPad touch effect did not restart on reveal');
  await ipadTouch.close();

  const reduced = await browser.newPage({ viewport: { width:390, height:844 }, reducedMotion:'reduce' });
  await reduced.goto(base + route, { waitUntil:'domcontentloaded', timeout:45000 });
  await reduced.locator('.hero-split').waitFor({ state:'visible' });
  const stable = await reduced.evaluate(() => {
   const hero=document.querySelector('.hero-scroll');
   const panel=hero.querySelector('.hero-split-visual');
   const intro=hero.querySelector('.hero-intro');
   return {
    clip:getComputedStyle(panel).clipPath,
    stage:getComputedStyle(hero.querySelector('.hero-scroll-stage')).position,
    transform:getComputedStyle(hero.querySelector('.hero-scroll-frame')).transform,
    opacity:Number(getComputedStyle(intro).opacity),
    imageAbove:panel.getBoundingClientRect().top<intro.getBoundingClientRect().top
   };
  });
  assert(!stable.clip.includes('100%') && stable.stage !== 'sticky' && stable.transform === 'none' && stable.opacity === 1 && stable.imageAbove,
   lang + ': reduced motion must show finished mobile split: ' + JSON.stringify(stable));
  await reduced.close();

  // Static gradient is visible on desktop for reduced-motion preferences.
  const reducedDesktop=await browser.newPage({ viewport:{width:1440,height:900}, reducedMotion:'reduce' });
  await reducedDesktop.goto(base + route,{waitUntil:'domcontentloaded',timeout:45000});
  const meshReduced=await reducedDesktop.locator('.tle-hero-soft-mesh').evaluate(node=>({
    display:getComputedStyle(node).display,
    pointerEvents:getComputedStyle(node).pointerEvents,
    animations:Array.from(node.querySelectorAll('span')).map(el=>getComputedStyle(el).animationName)
  }));
  assert(meshReduced.display!=='none'&&meshReduced.pointerEvents==='none'&&meshReduced.animations.every(name=>name==='none'),lang+': static reduced-motion mesh must not animate or capture taps');
  await reducedDesktop.close();
 }
 assert.deepEqual(errors, [], 'Browser console errors');
 console.log('[HERO BROWSER QA PASSED] EN/ES seven widths incl. large portrait iPad, scroll wipe, sticky tablet/desktop and static reduced-motion mobile.');
} finally {
 await browser.close();
}
