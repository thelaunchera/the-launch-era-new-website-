/* Read-only EN/ES iPhone, tablet and desktop QA for the public booking story.
 * Does NOT click checkout or create bookings, emails, leads or payments. */
import assert from 'node:assert/strict';
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright';

const base = (process.env.QA_URL || 'http://127.0.0.1:4173').replace(/\/$/, '');
const browser = await chromium.launch({headless:true});
const results = [];
mkdirSync('qa-screenshots', {recursive:true});

async function afterHydration(page) {
  // SSR is visible before React's interactive listeners attach.
  await page.waitForFunction(() => {
    const el = document.querySelector('.booking-section .product-tabs button');
    return Boolean(el && Object.keys(el).some(key =>
      key.startsWith('__reactProps') && typeof el[key]?.onClick === 'function'));
  }, null, {timeout:30000});
}
async function scrollToChapter(page, selector, offset = .34) {
  await page.evaluate(({selector, offset}) => {
    const target = document.querySelector(selector);
    if (!target) throw new Error('Missing chapter: ' + selector);
    const rect = target.getBoundingClientRect();
    window.scrollTo({top: window.scrollY + rect.top - window.innerHeight * offset, behavior:'instant'});
    window.dispatchEvent(new Event('scroll'));
  }, {selector,offset});
  await page.waitForTimeout(800);
}
const cases=[['en','/'],['es','/es/']];
try {
  for (const [lang,path] of cases) {
    for (const width of [360,390,820,1440]) {
      const page=await browser.newPage({viewport:{width,height:844},reducedMotion:'no-preference'});
      const errors=[];
      page.on('pageerror',error=>errors.push(error.message));
      await page.goto(base+path+'#booking-lead-automation',{waitUntil:'domcontentloaded',timeout:45000});
      await afterHydration(page);
      const section=page.locator('.sales-home .booking-section');
      const preview=section.locator('.home-booking-explorer');
      assert.equal(await preview.locator('.product-tabs button').count(),3,lang+' '+width+': missing interactive tabs');
      assert.equal(await section.locator('.booking-tone-dots span').count(),2,lang+' '+width+': missing two discreet orientation dots');
      const checkout=await section.locator('a[href*="/booking-bundle/"]').first().getAttribute('href');
      assert.equal(checkout,`/booking-bundle/?lang=${lang}`,lang+' '+width+': checkout destination changed');
      assert.match(await section.locator('.booking-hero-offer').innerText(), /\$19\.99/,lang+' '+width+': offer price changed');

      // Click real React-controlled tabs, no mock or forced clicks.
      await preview.locator('.product-tabs button').nth(1).click();
      assert.equal(await preview.locator('.product-tabs button').nth(1).getAttribute('aria-pressed'),'true');
      await preview.locator('.product-tabs button').nth(2).click();
      assert.equal(await preview.locator('.product-tabs button').nth(2).getAttribute('aria-pressed'),'true');
      assert.equal(await preview.locator('.followup-preview li').count(),3,lang+' '+width+': first/second/owner next steps missing');

      await scrollToChapter(page,'.booking-section .booking-copy',.36);
      const introTone=await section.getAttribute('data-tone');
      // Phone chapters are stacked. The intro must remain warm ivory.
      if(width<768) assert.equal(introTone,'1',lang+' '+width+': intro tone should be 1, got '+introTone);
      await scrollToChapter(page,'.booking-section .home-booking-explorer',.19);
      assert.equal(await section.getAttribute('data-tone'),'2',lang+' '+width+': preview did not trigger soft blue tone');
      const state=await section.evaluate(el=>{
        const bg=getComputedStyle(el,'::before').backgroundColor;
        const intro=el.querySelector('.booking-copy').getBoundingClientRect();
        const exp=el.querySelector('.home-booking-explorer').getBoundingClientRect();
        return {bg,windowWidth:innerWidth,sectionWidth:el.scrollWidth,sectionClient:el.clientWidth,previewLeft:exp.left,previewRight:exp.right,copyRight:intro.right};
      });
      assert.equal(state.bg,'rgb(234, 244, 252)',lang+' '+width+': not the approved ice blue');
      assert(state.sectionWidth<=state.sectionClient+3,lang+' '+width+': booking section horizontal overflow '+JSON.stringify(state));
      assert(state.previewLeft>=-3&&state.previewRight<=width+3,lang+' '+width+': preview cropped '+JSON.stringify(state));
      if(width===390){await section.screenshot({path:`qa-screenshots/booking-tones-${lang}-390.png`});}
      results.push({lang,width,tone:introTone+'→2',tabs:3,checkout,errors:errors.length});
      await page.close();
    }
  }
  for(const [lang,path] of cases){
    const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
    await page.goto(base+path+'#booking-lead-automation',{waitUntil:'domcontentloaded',timeout:45000});
    await afterHydration(page);
    await scrollToChapter(page,'.booking-section .home-booking-explorer',.19);
    const durations=await page.locator('.booking-section').evaluate(el=>[
      getComputedStyle(el,'::before').transitionDuration,
      getComputedStyle(el.querySelector('.booking-tone-dots')).transitionDuration
    ]);
    assert(durations.every(x=>x==='0s'),lang+' reduced motion leaves transitions on: '+durations.join(','));
    await page.close();
  }
  console.log('[BOOKING STORY BROWSER QA PASS]',JSON.stringify(results));
}finally{await browser.close();}
