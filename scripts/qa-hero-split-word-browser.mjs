/* Regression for the now-removed "See how it works" scroll hint.
   The booking CTA, real photo, stable stage, and mobile accessibility remain.
   Read-only browser QA: no bookings, emails, logins, or payments. */
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
const rawBase=process.env.QA_URL||'http://127.0.0.1:4173';
const base=rawBase.endsWith('/')?rawBase.slice(0,-1):rawBase;
const browser=await chromium.launch({headless:true});
try {
 for(const [lang,path] of [['en','/'],['es','/es/']]){
  for(const width of [360,390,414,820,1440]){
   const page=await browser.newPage({viewport:{width,height:844},reducedMotion:'reduce'});
   await page.goto(base+path,{waitUntil:'domcontentloaded',timeout:45000});
   await page.locator('.hero-scroll-stage--starfield').waitFor({state:'visible',timeout:20000});
   assert.equal(await page.locator('.hero-scroll-reveal,.tle-hero-split-link').count(),0,lang+': obsolete scroll hint still visible');
   assert.equal(await page.locator('.hero-scroll-stage--starfield > .tle-starfield-accent').count(),1,lang+': missing stage-wide overlay');
   assert.equal(await page.locator('.hero-scroll .hero-split-visual img.hero-main-image').count(),1,lang+': hero image missing');
   assert.equal(await page.locator('#hero-next').count(),1,lang+': next content section lost');
   assert.equal(await page.locator('.hero-scroll .hero-cta-row a').getAttribute('href'),'/experience-cleaning/?lang='+lang+'&source=homepage',lang+': public sample CTA destination changed');
   const pos=await page.evaluate(()=>{
    const stage=document.querySelector('.hero-scroll-stage--starfield');
    const visual=stage.querySelector('.hero-split-visual');
    const a=stage.getBoundingClientRect(),b=visual.getBoundingClientRect();
    const photo=visual.querySelector('img.hero-main-image');
    const intro=stage.querySelector('.hero-intro');
    const cta=intro.querySelector('.hero-cta-row');
    const tabs=visual.querySelectorAll('.tle-cinema-tabs button');
    return {gap:b.top-a.top,width:b.width,height:b.height,overflow:document.documentElement.scrollWidth-innerWidth,
      photoReady:photo.complete&&photo.naturalWidth>0,
      position:getComputedStyle(stage).position,
      copyBeforeVisual:intro.getBoundingClientRect().top<b.top,
      afterCTA:b.top-cta.getBoundingClientRect().bottom,
      tabsCount:tabs.length};
   });
   assert(pos.photoReady,lang+' '+width+': photo not loaded');
   assert(pos.overflow<3,lang+' '+width+': horizontal overflow');
   if(width<768){
    assert(pos.copyBeforeVisual,lang+' '+width+': hero message and CTA must precede film on phone');
    assert(pos.afterCTA>=0&&pos.afterCTA<130,lang+' '+width+': excessive gap between CTA and visual: '+pos.afterCTA);
    assert(pos.tabsCount===3,lang+' '+width+': interactive story controls missing');
    assert(pos.height>=300,lang+' '+width+': cinematic visual too small');
    assert(pos.width>=width-28,lang+' '+width+': photo too narrow');
    assert.equal(pos.position,'relative',lang+': phone scroll must remain native');
   }
   await page.close();
  }
 }
 console.log('[HERO FIRST-FOLD QA PASS] No obsolete scroll CTA; copy-first EN/ES cinematic hero and native page preserved.');
} finally {await browser.close();}
