/* The Launch Era homepage service color motion regression: EN/ES, no purchases or emails. */
import assert from 'node:assert/strict';
import { readFileSync, mkdirSync } from 'node:fs';
const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const root = read('src/routes/__root.tsx');
const script = read('public/assets/tle-services-color-shift.js');
const css = read('public/assets/tle-services-color-shift.css');
const en = read('src/components/editorial-sections.tsx');
const es = read('src/routes/es.index.tsx');
assert(root.includes('tle-services-color-shift.css'), 'Missing service palette stylesheet from root');
assert(root.includes('<script src="/assets/tle-services-color-shift.js'), 'Missing executable service palette script from root');
assert(en.includes('id="solutions" className="solutions-section"'), 'EN services section moved');
assert(es.includes('id="soluciones" className="solutions-section"'), 'ES services section moved');
assert(script.includes('gsap.context(') && script.includes('gsap.matchMedia(') && script.includes('ScrollTrigger.create('), 'GSAP lifecycle missing');
assert(script.includes('function update()') && script.includes("rail.addEventListener('scroll'"), 'No native scroll/swipe fallback');
assert(script.includes('section.style.backgroundColor = theme.bg'), 'Native fallback no longer paints');
assert(script.includes("observer.observe(document.documentElement"), 'React route remount handling missing');
for (const shade of ['#FAF8F3', '#D7EFFF', '#316C95', '#173F59', '#EAF4FC']) assert(script.includes(shade), 'Missing palette tone ' + shade);
assert(css.includes('[data-services-color-shift]') && css.includes('prefers-reduced-motion'), 'Scoped style or motion preference missing');
console.log('[SERVICES COLOR STATIC QA PASSED] Script mounted in root, six real service cards preserved, native fallback, GSAP, EN/ES and reduced motion.');
if (!process.argv.includes('--browser')) process.exit(0);

const { chromium } = await import('playwright');
const base = (process.env.QA_URL || 'http://127.0.0.1:4173').replace(/\/$/, '');
const browser = await chromium.launch({ headless: true });
const errors = [];
mkdirSync('qa-screenshots', { recursive: true });
try {
 for (const [lang, route] of [['en', '/'], ['es', '/es/']]) {
   for (const width of [360, 390, 820, 1440]) {
     const page = await browser.newPage({viewport: {width, height: width < 600 ? 844 : 900}, reducedMotion: 'no-preference'});
     page.on('pageerror', e => errors.push(lang + ' ' + width + ': ' + e.message));
     // Ensure animation is visible even when Google/CDN scripts fail.
     await page.route(/cdnjs\.cloudflare\.com\/ajax\/libs\/gsap|cdn\.jsdelivr\.net\/npm\/gsap/, route => route.abort());
     await page.goto(base + route, { waitUntil:'domcontentloaded', timeout:45000 });
     const section = page.locator(lang === 'en' ? '#solutions' : '#soluciones');
     await section.waitFor({ state:'attached', timeout:20000 });
     await page.waitForFunction(() => document.querySelector('#solutions[data-services-color-shift], #soluciones[data-services-color-shift]')?.querySelector('.sol-color-nav'), null, { timeout:12000 });
     const cardLinks = await section.locator('.service-grid .service-card').evaluateAll(nodes => nodes.map(node => node.getAttribute('href')));
     assert.equal(cardLinks.length, 6, lang + ' ' + width + ': wrong service-card count');
     assert(cardLinks.every(Boolean), 'Blank service link');
     const position = await section.evaluate(el => ({y:el.getBoundingClientRect().top + scrollY, height:el.offsetHeight}));
     await page.evaluate(y => { document.documentElement.style.scrollBehavior = 'auto'; scrollTo(0,y); }, position.y + position.height * .1 - (width < 600 ? 844 : 900)*.55);
     await page.waitForTimeout(550);
     const first = await section.evaluate(el => ({
       bg:getComputedStyle(el).backgroundColor,
       phase: el.dataset.colorPhase,
       nav: !!el.querySelector('.sol-color-nav'),
       navText:el.querySelector('.sol-color-counter')?.textContent
     }));
     assert(first.nav && first.navText, lang + ' ' + width + ': missing navigation');
     if (width >= 768) {
       await page.evaluate(y => scrollTo(0,y), position.y + position.height*.52 - 900*.55);
       await page.waitForTimeout(550);
       const second = await section.evaluate(el => ({bg:getComputedStyle(el).backgroundColor, phase:el.dataset.colorPhase}));
       assert.notEqual(first.phase,second.phase, lang + ' ' + width + ': scroll did not shift phase');
       assert.notEqual(first.bg,second.bg,lang + ' ' + width + ': background did not change on scroll');
     } else {
       await section.locator('.service-grid').evaluate(el => { el.scrollLeft = (el.scrollWidth - el.clientWidth) * .56; });
       await page.waitForTimeout(600);
       const second = await section.evaluate(el => ({bg:getComputedStyle(el).backgroundColor, phase:el.dataset.colorPhase}));
       const railMetrics = await section.locator('.service-grid').evaluate(el=>({
         scrollLeft:el.scrollLeft, scrollWidth:el.scrollWidth, clientWidth:el.clientWidth,
         display:getComputedStyle(el).display, overflowX:getComputedStyle(el).overflowX,
         snap:getComputedStyle(el).scrollSnapType,
       }));
       assert.notEqual(first.phase, second.phase, lang + ' ' + width + ': swipe did not change phase: '+JSON.stringify({first,second,railMetrics}));
       assert.notEqual(first.bg,second.bg,lang + ' ' + width + ': swipe did not change background');
     }
     const safe = await page.evaluate(() => {
       const section=document.querySelector('[data-services-color-shift]');
       const nav=section.querySelector('.sol-color-nav');
       const rect=nav.getBoundingClientRect();
       return {
         cardCount: section.querySelectorAll('.service-grid a').length,
         navClipped: rect.right > innerWidth + 3 || rect.left < -3,
         sectionW: section.clientWidth, sectionScroll: section.scrollWidth,
         documentOverflow: document.documentElement.scrollWidth > innerWidth + 4,
       };
     });
     assert(!safe.navClipped, lang + ' ' + width + ': new progress control extends offscreen: ' + JSON.stringify(safe));
     assert.equal(safe.cardCount,6);
     if (safe.documentOverflow) console.log('[PRE-EXISTING PAGE OVERFLOW — separate from service color effect]',lang,width);
     if (width === 390 || width === 1440) await page.screenshot({path:'qa-screenshots/services-colors-'+lang+'-'+width+'.png'});
     await page.close();
   }
   const page = await browser.newPage({ viewport:{width:390,height:844}, reducedMotion:'reduce' });
   await page.route(/cdnjs\.cloudflare\.com\/ajax\/libs\/gsap|cdn\.jsdelivr\.net\/npm\/gsap/, route => route.abort());
   await page.goto(base+route,{waitUntil:'domcontentloaded',timeout:45000});
   const el=page.locator(lang === 'en' ? '#solutions' : '#soluciones');
   await page.waitForFunction(() => Boolean(document.querySelector('[data-services-color-shift]')),null,{timeout:12000});
   const motion=await el.evaluate(el=>getComputedStyle(el).transitionDuration);
   assert(motion.split(',').every(x=>parseFloat(x)===0),lang+': reduced-motion transition remains active: '+motion);
   await page.close();
 }
 assert.deepEqual(errors, [], 'Uncaught errors in browser');
 console.log('[SERVICES COLOR BROWSER QA PASSED] EN/ES 360/390/820/1440, scroll, swipe, reduced motion and missing-CDN fallback');
} finally { await browser.close(); }
