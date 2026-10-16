/** New public Booking Demo visual reset: no animation, no zoom, no writes.
 * Original keyed/owner preview HTML stays intact on the old route.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { chromium } from 'playwright';
const html=readFileSync('public/booking-demo-reset.html','utf8');
const original=readFileSync('public/lead-private-preview.html','utf8');
assert.match(original,/p\.has\('key'\)\|\|p\.get\('owner_preview'\)==='1'/,'Buyer/private preview gate must stay intact');
assert.match(original,/location\.replace\('\/booking-demo-reset\.html'/,'Public sample must leave legacy effect stack');
assert.match(original,/startResidential\('Standard Cleaning',120\)/,'Original source forms remain for keyed clients');
assert(!/gsap|Flip\.min|cdn\.jsdelivr|animation\s*:|transition\s*:|transform\s*:|scroll-behavior\s*:\s*smooth|mix-blend-mode/i.test(html),'New public demo must have no effects or third-party motion');
const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)];
assert.equal(scripts.length,1,'New demo must have one minimal controller');
new vm.Script(scripts[0][1]);
for(const tag of ['id="resServices"','id="comServices"','id="detailsPanel"','id="reviewPanel"','id="completePanel"','id="customerName"','id="customerEmail"'])assert(html.includes(tag),'Missing service/booking field '+tag);
assert(!/Post-Construction|posconstrucción/i.test(html),'Removed construction tile must stay removed');
const base=(process.env.QA_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const browser=await chromium.launch({headless:true});
try{
 for(const [lang,width] of [['en',360],['es',390],['en',820],['es',1440]]){
   const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'no-preference'});
   const errors=[],writes=[];
   page.on('pageerror',err=>errors.push(err.message));
   page.on('request',request=>{if(['POST','PATCH','PUT','DELETE'].includes(request.method()))writes.push(request.url())});
   await page.goto(base+'/lead-private-preview.html?lang='+lang,{waitUntil:'load',timeout:45000});
   await page.waitForURL('**/booking-demo-reset.html?lang='+lang,{timeout:15000});
   assert.equal(await page.locator('html').getAttribute('lang'),lang);
   assert.equal(await page.locator('.service').count(),6,'Expected six real service choices');
   assert.equal(await page.locator('img,video,canvas').count(),0,'No cinematic/photo layers during clean rebuild');
   assert.equal(await page.locator('button[data-id="standard"]').count(),1);
   await page.locator('button[data-id="standard"]').click();
   assert.equal(await page.locator('#chooseNext').isEnabled(),true);
   await page.locator('#chooseNext').click();
   await page.locator('#customerName').fill('Sample Customer');
   await page.locator('#customerEmail').fill('sample@example.test');
   await page.locator('#customerZip').fill('33101');
   await page.locator('#preferredDate').fill('2026-11-18');
   await page.locator('#reviewNext').click();
   await page.locator('#reviewPanel').waitFor({state:'visible'});
   assert.match(await page.locator('#reviewList').innerText(),/Sample Customer/);
   await page.locator('#finish').click();
   await page.locator('#completePanel').waitFor({state:'visible'});
   await page.locator('#restart').click();
   await page.locator('#comTab').click();
   await page.locator('button[data-id="office"]').click();
   await page.locator('#chooseNext').click();
   assert.equal(await page.locator('#comDetails').isVisible(),true);
   await page.locator('#backDetails').click();
   const layout=await page.evaluate(()=>{
     const rect=document.querySelector('.flow').getBoundingClientRect();
     return {bodyOverflow:document.documentElement.scrollWidth-innerWidth,flowWidth:rect.width,
       slide:document.querySelectorAll('[style*="transform"],[style*="animation"],[class*="carousel"],[class*="glow"]').length,
       images:document.images.length,nav:location.pathname};
   });
   assert(layout.bodyOverflow<=2,lang+' '+width+' horizontal overflow '+JSON.stringify(layout));
   assert(layout.flowWidth>290,'Booking flow too narrow '+JSON.stringify(layout));
   assert.equal(layout.slide,0,'Motion fragments remain');
   assert.deepEqual(writes,[],'Pure demo must not send emails, create bookings or submit to backend');
   assert.deepEqual(errors,[],lang+' '+width+' JS errors');
   console.log('PASS clean booking demo '+lang+' '+width+' '+JSON.stringify(layout));
   await page.close();
 }
 const page=await browser.newPage({viewport:{width:390,height:844}});
 await page.goto(base+'/lead-private-preview.html?owner_preview=1&lang=en',{waitUntil:'domcontentloaded'});
 assert(!page.url().includes('booking-demo-reset.html'),'Owner preview redirected away from original');
 await page.close();
 console.log('[BOOKING VISUAL RESET QA PASSED] No legacy effect assets, EN/ES service flow, 4 widths, no writes, owner isolation.');
}finally{await browser.close()}
