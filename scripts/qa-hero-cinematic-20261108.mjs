import { chromium } from 'playwright';
import { strict as assert } from 'node:assert';
import fs from 'node:fs';

const origin = process.env.QA_URL || 'https://thelaunchera.com';
const cases = [
  ['casa-brownie', '/demos/casa-brownie/'],
  ['havana-19', '/demos/havana-19/'],
  ['ivory-and-bloom', '/demos/ivory-and-bloom/'],
  ['lavender-edit', '/demos/lavender-edit/'],
];
fs.mkdirSync('qa-screenshots/motion-20261108', { recursive: true });
const browser = await chromium.launch({ headless: true });
try {
  for (const [slug, route] of cases) {
    const ctx = await browser.newContext({
      viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true,
      reducedMotion: 'no-preference',
      serviceWorkers: 'block'
    });
    const page = await ctx.newPage();
    const failed = [];
    page.on('pageerror', e => failed.push(e.message));
    await page.goto(origin + route, { waitUntil: 'domcontentloaded', timeout: 40000 });
    await page.locator('section.hero').first().waitFor({ timeout: 12000 });
    await page.waitForFunction(s => {
      const v = document.querySelector('video[data-tle-cinematic-hero="' + s + '"]');
      return !!v && v.readyState >= 2 && v.videoWidth > 0;
    }, slug, { timeout: 20000 });
    await page.waitForFunction(s => {
      const v = document.querySelector('video[data-tle-cinematic-hero="' + s + '"]');
      return !!v && !v.paused && Number(getComputedStyle(v).opacity) > .01;
    }, slug, { timeout: 12000 });
    const data = await page.evaluate(() => {
      const v = document.querySelector('video[data-tle-cinematic-hero]');
      const hero = document.querySelector('section.hero');
      const style = getComputedStyle(v);
      return {
        src: new URL(v.currentSrc).pathname,
        width: v.videoWidth,
        readyState: v.readyState,
        pointerEvents: style.pointerEvents,
        hasReactive: v.hasAttribute('data-tle-reactive-photo'),
        hasHero: !!hero, fallbackPhoto: !!hero?.querySelector('img,picture,.hero-image'),
      };
    });
    assert(data.src.endsWith('/media/hero-motion-20261108.mp4'), slug + ' media path');
    assert(data.pointerEvents === 'none', slug + ' video must not block CTAs');
    assert(data.hasReactive, slug + ' cursor/scroll layer');
    assert(data.fallbackPhoto, slug + ' original photo fallback');
    assert(data.width > 0, slug + ' decoded video');
    if (failed.length) console.log(slug + ' unrelated browser errors: ' + failed.slice(0,3).join(' | '));
    await page.screenshot({path:'qa-screenshots/motion-20261108/'+slug+'-390.png'});
    console.log('PASS mobile cinematic '+slug, data.width);
    await ctx.close();
  }
  for(const slug of ['casa-brownie','lavender-edit']){
    const ctx = await browser.newContext({viewport:{width:1440,height:900}, reducedMotion:'no-preference'});
    const page = await ctx.newPage();
    await page.goto(origin + '/demos/'+slug+'/', {waitUntil:'domcontentloaded',timeout:40000});
    const hero = page.locator('[data-tle-reactive-hero]').first();
    await hero.waitFor({timeout:12000});
    const box = await hero.boundingBox(); assert(box, slug+' hero bounding box');
    await page.mouse.move(box.x+box.width*0.2, box.y+box.height*0.3);
    await page.waitForTimeout(300);
    const before = await hero.evaluate(el=>el.style.getPropertyValue('--tle-rh-px'));
    await page.mouse.move(box.x+box.width*0.8, box.y+box.height*0.7);
    await page.waitForTimeout(300);
    const after = await hero.evaluate(el=>el.style.getPropertyValue('--tle-rh-px'));
    assert(before !== after,slug+' hero cursor must respond: '+before+'/'+after);
    const reactive = await page.locator('video[data-tle-reactive-photo]').count();
    assert(reactive>=1, slug+' cinematic responds to cursor');
    await page.screenshot({path:'qa-screenshots/motion-20261108/'+slug+'-desktop.png'});
    console.log('PASS desktop cursor parallax '+slug,before,after);
    await ctx.close();
  }
  // CRUMB is owner-approved as a static-photo hero in ALL motion preferences.
  for(const motion of ['no-preference','reduce']){
    const ctx=await browser.newContext({viewport:{width:390,height:844},reducedMotion:motion});
    const page=await ctx.newPage();
    await page.goto(origin+'/demos/crumb/',{waitUntil:'domcontentloaded',timeout:40000});
    await page.waitForTimeout(500);
    assert.equal(await page.locator('video[data-tle-cinematic-hero]').count(),0,'CRUMB must never add a cinematic video: '+motion);
    assert((await page.locator('section.hero img').count())>0,'CRUMB must retain its original static photo: '+motion);
    await ctx.close();
  }
  // Active cinematic demos must also honor reduced motion.
  const ctx=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
  const page=await ctx.newPage();
  await page.goto(origin+'/demos/casa-brownie/',{waitUntil:'domcontentloaded',timeout:40000});
  await page.waitForTimeout(500);
  assert.equal(await page.locator('video[data-tle-cinematic-hero]').count(),0,'reduced motion disables cinematic video');
  assert((await page.locator('section.hero img').count())>0,'reduced motion preserves the approved fallback image');
  await ctx.close();
  console.log('PASS CRUMB original static hero and active-demo reduced-motion fallback');
} finally {
  await browser.close();
}
