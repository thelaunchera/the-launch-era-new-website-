import { chromium } from 'playwright';
import { strict as assert } from 'node:assert';
import fs from 'node:fs';

const origin = process.env.QA_URL || 'https://thelaunchera.com';
const cases = [
  ['casa-brownie', '/demos/casa-brownie/'],
  ['ivory-and-bloom', '/demos/ivory-and-bloom/'],
  ['marea-wigs-miami', '/demos/marea-wigs-miami/'],
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
    assert.equal(await page.locator('html').getAttribute('data-tle-one-motion'),slug,'Expected approved motion controller '+slug);
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
      const host = v?.parentElement;
      const style = getComputedStyle(v);
      return {
        src: new URL(v.currentSrc).pathname,
        width: v.videoWidth,
        readyState: v.readyState,
        pointerEvents: style.pointerEvents,
        hasReactive: v.hasAttribute('data-tle-reactive-photo'),
        hasHero: !!host, fallbackPhoto: !!host?.querySelector('img,picture,.hero-image'),
      };
    });
    assert(data.src.endsWith('/media/hero-motion-20261108.mp4'), slug + ' media path');
    assert(data.pointerEvents === 'none', slug + ' video must not block CTAs');
    assert(data.hasReactive, slug + ' controlled hero-media layer');
    assert(data.fallbackPhoto, slug + ' original photo fallback');
    assert(data.width > 0, slug + ' decoded video');
    if (failed.length) console.log(slug + ' unrelated browser errors: ' + failed.slice(0,3).join(' | '));
    await page.screenshot({path:'qa-screenshots/motion-20261108/'+slug+'-390.png'});
    console.log('PASS mobile cinematic '+slug, data.width);
    await ctx.close();
  }
  // Desktop evidence checks video decode and nonblocking interaction rather
  // than asserting nonexistent cursor-parallax code in archived demos.
  for(const slug of ['casa-brownie','marea-wigs-miami']){
    const ctx=await browser.newContext({viewport:{width:1440,height:900},reducedMotion:'no-preference'});
    const page=await ctx.newPage();
    await page.goto(origin+'/demos/'+slug+'/',{waitUntil:'domcontentloaded',timeout:40000});
    await page.waitForFunction(s=>{
      const v=document.querySelector('video[data-tle-cinematic-hero="'+s+'"]');
      return !!v && v.videoWidth>0 && v.readyState>=2;
    },slug,{timeout:20000});
    const video=page.locator('video[data-tle-cinematic-hero="'+slug+'"]');
    const layout=await video.evaluate(el=>{
      const r=el.getBoundingClientRect(),style=getComputedStyle(el);
      return {width:r.width,height:r.height,pointerEvents:style.pointerEvents,fit:style.objectFit};
    });
    assert(layout.width>100&&layout.height>100,slug+' full-size desktop video layout');
    assert.equal(layout.pointerEvents,'none',slug+' must not obstruct buttons');
    assert.equal(layout.fit,'cover',slug+' preserves approved hero styling');
    await page.screenshot({path:'qa-screenshots/motion-20261108/'+slug+'-desktop.png'});
    console.log('PASS desktop decoded and nonblocking cinematic '+slug,layout.width,layout.height);
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
