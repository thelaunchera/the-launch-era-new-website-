/** Bilingual universal website package cards, with legacy service-card implementation preserved for existing clients. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {chromium} from 'playwright';
const read=p=>readFileSync(p,'utf8');
const legacy=read('src/components/service-flip-card.tsx');
const css=read('src/components/service-flip-card.css');
const gate=read('public/booking-demo-reset.html');
const home=read('src/components/official-home.tsx');
assert(legacy.includes('tle-service-static__link') && legacy.includes('href={href}'),'Historical service links must remain accessible');
assert(!legacy.includes('rotateY')&&!legacy.includes('is-flipped'),'Archived cards must not require 3D touch actions');
assert(css.includes('height:auto!important'),'Historical cards should retain mobile usability');
assert(gate.includes('id="authStep"'),'Legacy customer booking demo must remain gated');
assert(home.includes('website-basic')&&home.includes('website-ai-crm'),'Official home must offer exactly the two current packages');
const base=(process.env.QA_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const browser=await chromium.launch({headless:true});
try {
 for(const [lang,route] of [['en','/'],['es','/es/']]){
  for(const width of [360,390,820,1440]){
   const page=await browser.newPage({viewport:{width,height:844},isMobile:width<768,hasTouch:width<768});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto(base+route,{waitUntil:'domcontentloaded',timeout:45000});
   const plans=page.locator('.tle-universal .plan');
   await plans.first().waitFor({state:'visible',timeout:20000});
   assert.equal(await plans.count(),2,lang+' '+width+': the official site must show only two packages');
   const offers=['website-basic','website-ai-crm'];
   for(let i=0;i<2;i++){
     const plan=plans.nth(i);
     assert.equal(await plan.locator('img').count(),1,'A package photo is missing');
     assert(await plan.locator('h3').isVisible(),'A package headline is not visible');
     const link=plan.locator('a[href^="/service-checkout/"]');
     assert.equal(await link.count(),1,'A package checkout link is missing');
     const href=await link.getAttribute('href');
     assert(href?.includes('offer='+offers[i]+'&lang='+lang),'Package CTA points to the wrong plan or locale');
     const box=await plan.boundingBox();
     assert(box && box.width>180,'Package card is squeezed below usable width');
   }
   assert.equal(await page.locator('.sales-home .solutions-section .tle-service-static').count(),0,'Retired five-service marketing cards must not appear');
   assert.equal(await page.locator('.tle-universal .monthly-price').count(),1,'AI monthly fee must be visible exactly once');
   assert(await page.locator('.tle-universal .monthly-price').isVisible(),'Monthly fee is hidden');
   assert((await page.locator('.tle-universal .monthly-price').innerText()).includes('$8'), 'AI package must show $8 per month');
   assert((await page.locator('.tle-universal .monthly-price').innerText()).includes('$33'), 'First AI payment must disclose $33');
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
   assert(overflow<=4,lang+' '+width+': horizontal overflow '+overflow);
   assert.deepEqual(errors,[],lang+' '+width+': browser errors');
   console.log('PASS two website packages '+lang+' '+width);
   await page.close();
  }
 }
}finally{await browser.close();}
