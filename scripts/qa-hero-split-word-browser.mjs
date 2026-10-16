/* Non-purchasing browser QA for the two-half "See how it works" link.
   Tests both languages and actual same-page scroll rather than a dead demo. */
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
const origin=(process.env.QA_URL || 'http://127.0.0.1:4173').replace(/\/$/,'');
const browser=await chromium.launch({headless:true});
const stories=[['en','/','See how it works'],['es','/es/','Descubre cómo funciona']];
try{
 for(const [lang,path,copy] of stories){
  for(const width of [360,390,414]){
   const page=await browser.newPage({viewport:{width,height:844},hasTouch:true,isMobile:true,reducedMotion:'no-preference'});
   await page.goto(origin+path+'#qa-split-check',{waitUntil:'domcontentloaded',timeout:45000});
   const link=page.locator('.hero-scroll-reveal a.tle-hero-split-link');
   await link.waitFor({state:'visible',timeout:20000});
   assert.equal(await link.getAttribute('href'),'#hero-next');
   assert.match(await link.getAttribute('aria-label')||'',lang==='es'?/reservas/:/booking/);
   assert.equal(await link.locator('.tle-hero-split-front').count(),2);
   assert.equal(await link.locator('.tle-hero-split-reveal').count(),1);
   assert.equal(await link.locator('.tle-hero-split-front').first().innerText(),copy);
   const clip=await link.locator('.tle-hero-split-front').evaluateAll(els=>els.map(el=>getComputedStyle(el).clipPath));
   assert(clip[0].includes('50%')&&clip[1].includes('50%'),lang+': uncut word halves');
   const before=await page.evaluate(()=>({width:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth}));
   assert(before.scroll <= before.width+2,lang+' '+width+': horizontal scroll');
   // Native anchor must respond on the very first tap and retain browser hash/history.
   await link.tap();
   await page.waitForFunction(()=>location.hash==='#hero-next',{timeout:6000});
   const scroll=await page.evaluate(()=>scrollY);
   assert(scroll>20,lang+' '+width+': tap did not scroll to the next section');
   await page.close();
  }

  // Keyboard accessible focus and desktop mouse hover both reveal the label.
  const desktop=await browser.newPage({viewport:{width:1024,height:780},reducedMotion:'no-preference'});
  await desktop.goto(origin+path+'#qa-split-check',{waitUntil:'domcontentloaded',timeout:45000});
  const a=desktop.locator('.hero-scroll-reveal a.tle-hero-split-link');
  await desktop.evaluate(()=>{
   // Position hero at the end of its original sticky reveal to test actual hover.
   const hero=document.querySelector('.hero-scroll');
   if(!hero)throw Error('Missing hero');
   const top=hero.getBoundingClientRect().top + scrollY;
   scrollTo({top:top+hero.offsetHeight-innerHeight+18,behavior:'instant'});
  });
  await a.waitFor({state:'visible',timeout:10000});
  await a.hover({timeout:10000});
  await desktop.waitForTimeout(640);
  const hovered=await a.evaluate(el=>{
   const upper=el.querySelector('.tle-hero-split-upper'),lower=el.querySelector('.tle-hero-split-lower'),reveal=el.querySelector('.tle-hero-split-reveal');
   return {upper:new DOMMatrixReadOnly(getComputedStyle(upper).transform).m42,lower:new DOMMatrixReadOnly(getComputedStyle(lower).transform).m42,opacity:Number(getComputedStyle(reveal).opacity)};
  });
  assert(hovered.upper<-2&&hovered.lower>2&&hovered.opacity>.9,lang+': split-word hover did not reveal accent label '+JSON.stringify(hovered));
  await desktop.close();

  // Motion-reduction users still get the link and a static label switch.
  const reduced=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
  await reduced.goto(origin+path+'#qa-split-check',{waitUntil:'domcontentloaded',timeout:45000});
  const link=reduced.locator('.hero-scroll-reveal a.tle-hero-split-link');
  await link.waitFor({state:'visible'});
  const reducedMotion=await link.locator('.tle-hero-split-upper').evaluate(el=>getComputedStyle(el).transitionDuration);
  assert.equal(reducedMotion,'0s',lang+': prefers-reduced-motion must disable sliding transition');
  await link.click();
  await reduced.waitForFunction(()=>location.hash==='#hero-next',{timeout:6000});
  await reduced.close();
 }
 console.log('[SPLIT-WORD HERO QA PASSED] EN/ES 360/390/414 native tap, desktop hover, reduced-motion click.');
} finally {await browser.close()}
