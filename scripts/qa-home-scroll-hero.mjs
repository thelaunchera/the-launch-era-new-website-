/* Homepage split-and-scroll hero regression checks. No booking submission or email. */
import assert from 'node:assert/strict';
import { readFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const en = read('src/components/editorial-sections.tsx');
const es = read('src/routes/es.index.tsx');
const motion = read('src/components/home-motion.tsx');
const observer = read('src/components/use-hero-wipe.ts');
const root = read('src/routes/__root.tsx');
const scrollCSS = read('public/assets/tle-hero-scroll.css');
const styles = read('src/styles.css');
const heroPhoto = read('src/lib/home-hero-photo.ts');
const homeRoute = read('src/routes/index.tsx');
const photoBytes = readFileSync(new URL('../public/assets/hero-cleaner-lights-20261017.jpg', import.meta.url));
assert.equal(createHash('sha256').update(photoBytes).digest('hex'),'d8f17885281acb7893bfa21270c45e946d22c8b1222b6438afd546fbaf743e6f','Original approved hero photo must stay byte-for-byte intact');
assert(heroPhoto.includes("HOME_HERO_PHOTO = '/assets/hero-cleaner-lights-20261017.jpg'"),'Shared approved hero image missing');
assert(homeRoute.includes('href:HOME_HERO_PHOTO'),'English homepage must preload selected image');
const englishHero = en.split('export function HomeHero()')[1]?.split('const services =')[0] || '';
const spanishHero = es.split('function SpanishHome()')[1]?.split('<SmartWelcomeBundle lang="es"/>')[0] || '';

for (const [lang, hero, expected] of [
  ['EN', englishHero, '/booking-demo/?lang=en'],
  ['ES', spanishHero, '/booking-demo/?lang=es'],
]) {
  assert(hero.includes('className="hero-scroll"'), lang + ': scroll stage missing');
  assert(hero.includes('hero-scroll-stage') && hero.includes('hero-scroll-frame'), lang + ': scroll frame missing');
  assert(hero.includes('hero-scroll-stage--starfield') && hero.includes('<StarfieldAccent/>'), lang + ': full-hero starfield missing');
  assert(!hero.includes('hero-scroll-reveal') && !hero.includes('HeroSplitWordLink'), lang + ': removed scroll hint returned');
  assert(hero.includes('id="hero-next"'), lang + ': next-section target missing');
  assert(hero.includes('className="hero-split-visual"'), lang + ': separate image panel missing');
  assert(hero.includes('className="tle-hero-soft-mesh" aria-hidden="true"'), lang + ': decorative mesh absent or exposed to assistive technology');
  assert(hero.includes('data-wipe-visible={revealed && heroLoaded}'), lang + ': image-ready reveal gate missing');
  assert(hero.includes('src={HOME_HERO_PHOTO}'), lang + ': selected photo not installed on real hero');
  assert(hero.includes('<h1 className="tle-hero-heading-shine">'),lang+': shine must decorate the original H1');
  assert(!hero.match(/<h1 className="tle-hero-heading-shine">[^<]*<br\s*\/?\s*>/),lang+': do not forcibly break the heading into stacked blocks');

  assert(hero.includes('width={1122} height={1402}'), lang + ': portrait hero dimensions changed');
  assert(hero.includes('ref={heroRef}'), lang + ': IntersectionObserver hero ref missing');
  assert.equal(hero.split('href="' + expected + '"').length - 1, 1, lang + ': duplicate or absent personalized demo CTA');
  assert(hero.indexOf('hero-cta-row') < hero.indexOf('hero-split-visual'), lang + ': copy must lead on desktop');
  assert(hero.indexOf('hero-split-visual') < hero.indexOf('hero-notice-flow'), lang + ': notifications must sit inside image');
}
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
assert(scrollCSS.includes('tle-mobile-hero-photo-balance-20261017'),'Mobile hero composition must keep the compact-photo override');
assert(scrollCSS.includes('tle-home-heading-horizontal-flow-20261017'),'Long-form heading mobile typography missing');
for(const marker of ['tle-home-hero-text-shine-20261017','background-size:260% 100%','background-position:130% 0','70%,100% {background-position:-30% 0}','animation:tle-home-hero-ink-shine 3.8s linear infinite','background-position:50% 0 !important']) assert(scrollCSS.includes(marker),'Heading shine CSS missing '+marker);
assert(root.includes('tle-hero-scroll.css?v=20261018-fullscreen-starfield1'),'New hero CSS must bypass previous iPhone cache');
assert(scrollCSS.includes('2026-10-18: One continuous starfield') && scrollCSS.includes('height: clamp(390px, 72svh, 620px)'), 'new first-fold styling absent');
// Localized marketing activity floats (illustrative only, never real customer records).
assert.equal((en.match(/app:'(?:BOOKING PAGE|COMMAND CENTER|QUOTES)'/g)||[]).length,4,'EN four marketing notices missing');
assert(es.includes("'Cotización lista'") && es.includes("'Reserva confirmada'"),'ES localized activity notices missing');
assert(englishHero.includes('className="hero-notice-flow" aria-hidden="true"') && spanishHero.includes('className="hero-notice-flow" aria-hidden="true"'),'Decorative hero notices must be hidden from screen readers');
for(const marker of ['tle-home-notification-bob-v1','@keyframes tle-home-notification-bob','@keyframes tle-home-notification-enter','max-width:767px','prefers-reduced-motion:reduce']) assert(scrollCSS.includes(marker),'Hero chip CSS missing '+marker);

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
     image: {src:photo.currentSrc,loaded:photo.complete && photo.naturalWidth===1122 && photo.naturalHeight===1402,position:getComputedStyle(photo).objectPosition},
     phoneGeometry: {
       visual: { width:a.width,height:a.height,left:a.left,right:a.right,top:a.top },
       screenWidth:innerWidth,
       photoGap:a.top-stage.getBoundingClientRect().top,
       cards:Array.from(panel.querySelectorAll('.hero-notice-flow .notification')).filter(el=>getComputedStyle(el).display!=='none').map(el=>{const r=el.getBoundingClientRect();return {width:r.width,top:r.top,bottom:r.bottom,left:r.left,right:r.right}}),
     },
     introOpacity: Number(getComputedStyle(intro).opacity),
     heading:(()=>{const h=intro.querySelector('h1'),c=getComputedStyle(h),r=h.getBoundingClientRect();return {text:h.innerText,width:r.width,left:r.left,right:r.right,height:r.height,font:parseFloat(c.fontSize),weight:c.fontWeight,lineHeight:parseFloat(c.lineHeight),lines:Math.round(r.height/parseFloat(c.lineHeight)),forcedBreaks:h.querySelectorAll('br').length,animation:c.animationName,clip:c.backgroundClip,fill:c.webkitTextFillColor}})(),
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
     notices: {
       count:panel.querySelectorAll('.hero-notice-flow .notification').length,
       visible:Array.from(panel.querySelectorAll('.hero-notice-flow .notification')).filter(el=>getComputedStyle(el).display!=='none').length,
       animated:Array.from(panel.querySelectorAll('.hero-notice-flow .notification')).filter(el=>getComputedStyle(el).display!=='none' && getComputedStyle(el).animationName.includes('tle-home-notification-bob')).length,
       hitTest:getComputedStyle(panel.querySelector('.hero-notice-flow')).pointerEvents
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
   assert(state.image.loaded && state.image.src.includes('hero-cleaner-lights-20261017.jpg'),lang+' '+viewport.width+': approved photo not loaded');
   assert.equal(state.notices.count,4,lang+': four illustrative notices expected');
   assert.equal(state.notices.visible,viewport.width<768?2:4,lang+' '+viewport.width+': wrong responsive notice count');
   assert.equal(state.notices.hitTest,'none',lang+': chips must not block hero taps');
   assert.equal(state.notices.animated,state.notices.visible,lang+' '+viewport.width+': visible chips must bob independently');
   if (viewport.width === 1440 && viewport.height === 768) {
     assert(state.panel.bottom < viewport.height - 12, lang + ': hero photo is cut off by short desktop screen: ' + state.panel.bottom);
   }
   assert(!state.clipPath.includes('100%'), lang + ' ' + viewport.width + ': wipe never opened: ' + state.clipPath);
   assert(Math.abs(state.imageScale - 1) < .04, lang + ' ' + viewport.width + ': photo still zoomed');
   assert(state.introOpacity > .96, lang + ' ' + viewport.width + ': copy did not appear');
   assert(state.heading.text.includes(lang==='en'?'Less time chasing messages.':'Menos tiempo buscando mensajes.'),lang+': headline text changed');
   assert(state.heading.animation.includes('tle-home-hero-ink-shine'),lang+' '+viewport.width+': headline shine not running');
   assert(state.heading.clip==='text',lang+' '+viewport.width+': headline text clip missing');
   if(viewport.width<768){
     assert(state.heading.width>=viewport.width-38,lang+' '+viewport.width+': headline still too narrow '+JSON.stringify(state.heading));
     assert(state.heading.forcedBreaks===0,lang+': heading should wrap naturally');
     assert(state.heading.lines<=3,lang+' '+viewport.width+': heading still appears in stacked blocks '+JSON.stringify(state.heading));
     assert(state.heading.font>=23 && state.heading.weight<=550,lang+': headline type remains overly heavy '+JSON.stringify(state.heading));
     assert(state.heading.left>=-2 && state.heading.right<=viewport.width+2,lang+': headline spills off phone '+JSON.stringify(state.heading));
   }
   assert.equal(state.mesh.count, 4, lang + ': exactly four decorative gradients expected');
   if (viewport.width >= 1024) {
     assert(state.mesh.display !== 'none', lang + ': desktop mesh missing');
     assert(state.mesh.insideHeroFrame, lang + ': gradient must stay INSIDE the hero card, not the outer scroll background');
     assert.notEqual(state.mesh.dotsDisplay, 'none', lang + ': outer dotted/Request/Follow-up background must remain untouched');
     assert(state.mesh.frameBackground.includes('linear-gradient') && /(227, 242, 254|233, 245, 254)/.test(state.mesh.frameBackground), lang + ': blue gradient should be visible inside hero on entry');
     if(viewport.width > 1180){
       assert(state.mesh.copyShift==='-72px' && state.mesh.photoShift==='-72px',lang+': desktop hero content must rise slightly together without moving the outer backdrop');
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
    assert(state.phoneGeometry.visual.height >= 339, lang + ' ' + viewport.width + ': photo still too short');
    assert(state.phoneGeometry.visual.width >= viewport.width - 26, lang + ' ' + viewport.width + ': photo not wide enough');
    assert(state.phoneGeometry.visual.left >= -1 && state.phoneGeometry.visual.right <= viewport.width + 1, lang + ': picture escapes viewport');
    assert(state.phoneGeometry.photoGap >= -3 && state.phoneGeometry.photoGap < 32, lang + ': photo starts too far below stage: ' + state.phoneGeometry.photoGap);
    assert(state.phoneGeometry.visual.height >= Math.min(390,viewport.height*.60), lang + ': first-fold photo too short');
    assert(state.phoneGeometry.cards.length === 2, lang + ': mobile shows wrong number of notification chips');
    assert(state.phoneGeometry.cards.every(c=>c.width <= 211), lang + ': mobile chips still oversized');
    assert(state.phoneGeometry.cards[0].bottom + 4 < state.phoneGeometry.cards[1].top, lang + ': mobile notification chips overlap');
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
     inert:el.querySelector('.hero-intro').hasAttribute('inert')
    }));
    assert(Math.abs(end.scale - .7) < .045, lang + ' ' + viewport.width + ': expected scroll shrink to .7: ' + JSON.stringify(end));
    assert(end.opacity > .95 && !end.inert, lang + ': visible demo CTA became inaccessible');
   }
   if ([390,820,1440].includes(viewport.width)) await page.screenshot({ path:`qa-screenshots/home-scroll-${lang}-${viewport.width}-final.png`, fullPage:false });
   await page.close();
  }
  // Portrait tablet composition has been verified in the viewport matrix above.
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
    imageAbove:panel.getBoundingClientRect().top<intro.getBoundingClientRect().top,
    heading:(()=>{const c=getComputedStyle(intro.querySelector('h1'));return {animation:c.animationName,fill:c.webkitTextFillColor,position:c.backgroundPosition}})()
   };
  });
  assert(stable.heading.animation==='none' && stable.heading.fill==='rgb(25, 25, 25)' && stable.heading.position.startsWith('50% 0'),lang+': reduced-motion shine not legible and frozen '+JSON.stringify(stable.heading));
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
