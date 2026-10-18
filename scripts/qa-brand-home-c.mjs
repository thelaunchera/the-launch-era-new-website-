/**
 * TLE Home Brand C · static and optional local-build browser QA.
 * Never submits forms, sends email, creates bookings, or touches production.
 */
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const read = (path) => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const css = read('public/assets/tle-editorial-refresh.css');
const homeEN = read('src/components/editorial-sections.tsx');
const homeES = read('src/routes/es.index.tsx');
const app = read('src/routes/__root.tsx');
const marker = 'THE LAUNCH ERA — BRAND SYSTEM C · HOME PHASE 1 (EN + ES)';
assert(css.includes(marker), 'Missing scoped brand home layer');
const layer = css.slice(css.indexOf(marker));
for (const val of ['#D7EFFF', '#C8E5F6', '#191919', '#356E8C']) {
  assert(layer.includes(val), 'Missing brand token ' + val);
}
for (const forbidden of [
  /\btransform\s*:/, /\banimation\s*:/, /\btransition\s*:/,
  /\bobject-position\s*:/, /\bfilter\s*:/, /\bclip-path\s*:/,
  /\bpointer-events\s*:/, /\bposition\s*:/, /\bz-index\s*:/
]) {
  assert(!forbidden.test(layer), 'Brand layer must not override motion/media/position');
}
assert(layer.includes('.sales-home .tle-cta-pulse-shell > a.tle-cta-pulse-button'), 'Pulse CTA colors not scoped');
assert(layer.includes('.sales-home .solutions-section .tle-service-flip__back'), 'Flip CTA missing');
assert(layer.includes('.sales-home .tle-bundle-inline'), 'Bundle CTA missing');
assert(homeEN.includes('src={HOME_HERO_PHOTO}') && homeES.includes('src={HOME_HERO_PHOTO}'), 'Must keep approved hero photos');
assert(homeEN.includes('<StarfieldAccent/>') && homeES.includes('<StarfieldAccent/>'), 'Starfield must remain');
// Starfield is a hero-only decoration. Its iframe has an opaque black
// WebGL backdrop, so a duplicate in FinalCTA creates a black rectangle.
for (const [lang,source] of [['EN',homeEN],['ES',homeES]]) {
  assert.equal((source.match(/<StarfieldAccent\s*\/>/g)||[]).length,1,lang+': exactly one starfield in hero');
  assert(source.includes('hero-scroll-stage--starfield"><StarfieldAccent/>'),lang+': hero scene removed');
  assert(!/<section className="final-section"><StarfieldAccent\s*\/>/.test(source),lang+': closing CTA must not mount WebGL');
}

assert(app.includes('/assets/tle-editorial-refresh.css'), 'Brand layer not included in site');
assert(app.includes('/assets/tle-hero-scroll.css'), 'Hero scroll stylesheet missing');
assert(homeEN.includes('/booking-demo/?lang=en') && homeES.includes('/booking-demo/?lang=es'), 'Demo CTA destinations changed');
let brace = 0;
let comment = false;
for (let i = 0; i < layer.length; i++) {
  const a = layer[i], b = layer[i + 1];
  if (!comment && a === '/' && b === '*') {comment = true; i++; continue;}
  if (comment && a === '*' && b === '/') {comment = false; i++; continue;}
  if (comment) continue;
  if (a === '{') brace++;
  if (a === '}') brace--;
  assert(brace >= 0, 'Unbalanced CSS closing brace');
}
assert(brace === 0 && !comment, 'Unclosed CSS rule or comment');
console.log('PASS Brand Home C: scoped style, syntax, images, motion and booking destinations');

if (!process.argv.includes('--browser')) process.exit(0);

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.QA_URL || 'http://127.0.0.1:4173';
const browser = await chromium.launch({ headless: true });
const sizes = [390, 820, 1440];
try {
  for (const path of ['/', '/es/']) for (const width of sizes) {
    const page = await browser.newPage({viewport:{width,height:860},deviceScaleFactor:1,reducedMotion:'reduce'});
    // Prevent analytics, promotion pricing calls, and any accidental external effects.
    await page.route('**/*.supabase.co/**', async route => {
      if (route.request().method() === 'GET')
        await route.fulfill({status:200,contentType:'application/json',body:'{"percent_off":0,"plans":{}}'});
      else await route.abort();
    });
    await page.route('**/googletagmanager.com/**', route => route.abort());
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(base + path, {waitUntil:'domcontentloaded'});
    await page.locator('.hero-scroll .hero-cta-row a.cta-button').waitFor({state:'visible'});
    const info = await page.evaluate(() => {
      const cta = document.querySelector('.hero-scroll .hero-cta-row a.cta-button');
      const style = getComputedStyle(cta);
      const img = document.querySelector('.hero-scroll .hero-main-image');
      return {
        bg:style.backgroundColor, color:style.color,
        heroPhoto:!!img && img.getAttribute('src')?.length > 0,
        starfield:!!document.querySelector('.hero-scroll-stage--starfield'),
        noOverflow:document.documentElement.scrollWidth <= window.innerWidth + 1,
        href:cta.getAttribute('href')
      };
    });
    assert.equal(info.bg, 'rgb(215, 239, 255)', path+' at '+width+': CTA background mismatch');
    assert.equal(info.color, 'rgb(25, 25, 25)', path+' at '+width+': CTA text contrast mismatch');
    assert(info.heroPhoto && info.starfield, path+' at '+width+': imagery or starfield missing');
    assert.equal(await page.locator('.final-section .tle-starfield-accent').count(),0,path+' at '+width+': final CTA must not host starfield');
    assert(info.noOverflow, path+' at '+width+': horizontal overflow');
    assert(info.href?.startsWith('/booking-demo/?lang='), 'Booking CTA URL changed');
    // Regression reported by owner on iPhone: the old flip-card stylesheet had
    // color:white!important over the soft-blue CTA. Check computed colors.
    const cardInk = await page.locator('.sales-home .solutions-section .tle-service-flip__back a.tle-service-flip__cta').first().evaluate(el => {
      const s=getComputedStyle(el);return {color:s.color,bg:s.backgroundColor,height:parseFloat(s.minHeight)};
    });
    assert.equal(cardInk.color, 'rgb(25, 25, 25)', path+' at '+width+': card CTA invisible ink');
    assert.equal(cardInk.bg, 'rgb(215, 239, 255)', path+' at '+width+': card CTA not soft blue');
    assert(cardInk.height >= 48, path+' at '+width+': card CTA touch target below 48px');
    const marqueeInk = await page.locator('.sales-home .tle-logo-marquee .tle-wordmark').first().evaluate(el => {
      const s=getComputedStyle(el);return {color:s.color,opacity:s.opacity};
    });
    assert.equal(marqueeInk.color, 'rgb(52, 82, 103)', path+' at '+width+': marquee has pale text');
    assert.equal(marqueeInk.opacity, '1', path+' at '+width+': marquee wordmarks faded');
    if(width <= 600) {
      const geometry=await page.locator('.sales-home .tle-logo-marquee .tle-logo-marquee-intro').evaluate(el=>({right:el.getBoundingClientRect().right, viewport:innerWidth}));
      assert(geometry.right <= geometry.viewport - 75, path+' at '+width+': Jessie avatar overlaps marquee intro');
    }

    assert.deepEqual(errors, [], path+' at '+width+': JS page errors');
    await page.close();
    console.log('PASS Brand Home C browser '+path+' '+width+'px');
  }

  // Shared English closing CTA must not mount Starfield on standalone pages.
  for (const path of ['/solutions/','/how-it-works/']) {
    const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'no-preference'});
    await page.goto(base+path,{waitUntil:'domcontentloaded'});
    await page.locator('.final-section').waitFor({state:'attached'});
    await page.locator('.final-section').scrollIntoViewIfNeeded();
    assert.equal(await page.locator('.final-section .tle-starfield-accent').count(),0,path+': stray closing WebGL effect');
    assert.equal(await page.locator('.tle-starfield-accent').count(),0,path+': starfield should appear only in home hero');
    await page.close();
    console.log('PASS Brand hero-only Starfield '+path);
  }
} finally {await browser.close();}
