/** Standalone visual QA for approved public/email lead magnet hero only. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {chromium} from 'playwright';
const base=(process.env.QA_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const html=readFileSync('public/booking-demo-reset.html','utf8');
const js=readFileSync('public/assets/tle-booking-hero-window.js','utf8');
const css=readFileSync('public/assets/tle-booking-hero-window.css','utf8');
assert.match(html,/tle-booking-hero-window\.avif/,'Approved image not referenced');
assert.equal((html.match(/tle-window-scene/g)||[]).length,2,'Need exactly two hero scenes');
assert(!/gsap|Flip\./i.test(js),'No third party animation');
assert.match(css,/@media\(prefers-reduced-motion:reduce\)/,'Reduced-motion styles required');
assert.match(html,/SAMPLE REVIEW/,'Never invent real customer testimonials');
const browser=await chromium.launch({headless:true});
try{
 for(const [locale,width] of [['en',360],['es',390],['en',820],['es',1440]]){
  const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'no-preference'});
  const failures=[];page.on('pageerror',e=>failures.push(e.message));
  const url=base+'/lead-private-preview.html?lang='+locale+'&business=Sunrise+Cleaning&area=Miami&source=jessie_email';
  await page.goto(url,{waitUntil:'load'});
  await page.waitForURL('**/booking-demo-reset.html?*');
  await page.locator('#tleBookingHero').waitFor({state:'visible'});
  const imgs=await page.locator('#tleBookingHero img').evaluateAll(items=>items.map(img=>({naturalWidth:img.naturalWidth,src:img.currentSrc,complete:img.complete})));
  assert(imgs.length===3,locale+' must share one original photo across window stages');
  await page.waitForFunction(()=>[...document.querySelectorAll('#tleBookingHero img')].every(img=>img.complete&&img.naturalWidth>=600),null,{timeout:14000});
  assert.equal(await page.locator('#tleDemoProof .tle-review-card').count(),3,'Sample review cards missing');
  assert.equal(await page.locator('#tleBeforeAfter .tle-compare-card').count(),3,'Original before-after gallery missing');
  assert.equal(await page.locator('#sonnyToggle .sonny-avatar').count(),1,'Sonny bubble missing');
  assert.equal(await page.locator('#leadBusiness').innerText(),'Sunrise Cleaning','Emailed lead branding lost');
  const label=await page.locator('#tleBookingHeadline').getAttribute('aria-label');
  assert.match(label,/remarkable|extraordinario/);
  const panel=await page.locator('.tle-window-stage').boundingBox();
  assert(panel && panel.width<=width+1,'No viewport zoom/overflow');
  await page.locator('#tleWindowEnter').click();
  await page.waitForFunction(()=>document.getElementById('tleBookingHero')?.classList.contains('is-complete'),null,{timeout:11000});
  const heroState=await page.evaluate(()=>{
    const el=document.getElementById('tleBookingHero');
    return {scale:Number(el.style.getPropertyValue('--hero-zoom')),opacity:Number(el.style.getPropertyValue('--hero-front-opacity')),scrollWidth:document.documentElement.scrollWidth,viewport:innerWidth};
  });
  assert(heroState.scale>1.5&&heroState.opacity<.15,locale+' '+width+' zoom not finished '+JSON.stringify(heroState));
  assert(heroState.scrollWidth<=width+2,'Horizontal overflow');
  await page.locator('#sonnyToggle').click();
  assert(await page.locator('#sonnyBody').isVisible(),'Sonny original chat must remain functional');
  await page.locator('#sonnyToggle').click();
  assert(!await page.locator('#sonnyBody').isVisible(),'Sonny chat must close');
  assert.deepEqual(failures,[],locale+' '+width+' console/page errors');
  await page.close();

  const rm=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});
  await rm.goto(base+'/booking-demo-reset.html?lang='+locale,{waitUntil:'load'});
  await rm.waitForFunction(()=>document.getElementById('tleBookingHero')?.classList.contains('reduced'),null,{timeout:8000});
  assert.equal(await rm.locator('.tle-window-front').evaluate(x=>getComputedStyle(x).display),'none','Reduce motion must jump to second scene');
  assert.equal(await rm.locator('.tle-swap-new').evaluate(x=>getComputedStyle(x).opacity),'1','Final phrase must remain visible');
  assert.equal(await rm.locator('#tleWindowContinue').getAttribute('href'),'#bookingPage');
  await rm.close();
  console.log('PASS BOOKING_HERO_WINDOW '+locale+' '+width);
 }
 console.log('[BOOKING HERO WINDOW QA PASSED] Same emailed sample, photo, headline, Sonny, proofs, responsive and reduced motion.');
}finally{await browser.close()}
