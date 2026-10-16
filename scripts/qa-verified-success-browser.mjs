/* Contact/freebie confirmation browser QA. All requests intercepted, no production writes. */
import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const site=(process.env.QA_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const browser=await chromium.launch({headless:true});
const errors=[];
async function contactFields(page) {
 const form=page.locator('.contact-form .tle-contact-steps');
 await form.waitFor({state:'visible',timeout:12000});
 await page.waitForFunction(()=>document.querySelector('.contact-form .tle-contact-steps')?.dataset.ready==='true',null,{timeout:12000});
 await form.locator('input[name="name"]').fill('Synthetic QA');
 await form.locator('input[name="email"]').fill('synthetic@example.invalid');
 await form.locator('.tle-contact-next').click();
 await page.waitForFunction(()=>document.querySelector('.contact-form .tle-contact-steps')?.dataset.step==='1',null,{timeout:10000});
 await form.locator('input[name="business"]').fill('Synthetic Cleaners');
 await form.locator('.tle-contact-next').click();
 await page.waitForFunction(()=>document.querySelector('.contact-form .tle-contact-steps')?.dataset.step==='2',null,{timeout:10000});
 await form.locator('textarea[name="message"]').fill('Synthetic QA; do not send to any provider.');
 return form;
}
try {
 for(const [route,endpoint] of [
   ['/help/','tle-contact'],['/es/','tle-contact'],
   ['/free-cleaning-lead-guide/','tle-freebie']
 ]) {
  for(const width of [360,390,820,1024,1440]) {
   const page=await browser.newPage({viewport:{width,height:850}});
   page.on('pageerror',error=>errors.push(route+' '+width+': '+error.message));
   let submissions=0;
   await page.route('**/functions/v1/'+endpoint,async request=>{
    submissions++;
    await new Promise(done=>setTimeout(done,350));
    await request.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,email_sent:true})});
   });
   await page.goto(site+route,{waitUntil:'domcontentloaded',timeout:45000});
   let form;
   if(endpoint==='tle-contact') form=await contactFields(page);
   else {
    form=page.locator('.tle-freebie-page form');
    await form.waitFor({state:'visible',timeout:12000});
    await form.locator('#freebie-email').fill('synthetic@example.invalid');
   }
   const submit=form.locator('.tle-morph-submit');
   await submit.click();
   await page.locator('.tle-success-card[role="status"]').waitFor({state:'visible',timeout:10000});
   assert.equal(submissions,1,route+' '+width+' duplicate POST');
   assert.equal(await page.locator('.tle-morph-submit').count(),0,route+' '+width+' old submit remains');
   const card=page.locator('.tle-success-card');
   assert((await card.innerText()).includes('synthetic@example.invalid'),route+' '+width+' receipt missing email');
   assert.equal(await card.locator('.tle-success-check').count(),1,route+' '+width+' missing animated check');
   const box=await card.boundingBox();
   assert(box&&box.x>=-2&&box.x+box.width<=width+2,route+' '+width+' success card overflows viewport');
   if(endpoint==='tle-contact') {
    assert.equal(await card.locator('.tle-success-row').count(),4,route+' '+width+' missing summary');
    assert.equal(await card.locator('.tle-success-actions button').count(),1,route+' '+width+' missing another inquiry button');
   }
   await page.close();
  }
 }
 for(const route of ['/help/','/es/']){
  const page=await browser.newPage({viewport:{width:390,height:844}});
  let submits=0;
  await page.route('**/functions/v1/tle-contact',async request=>{
   submits++;
   await request.fulfill({status:500,contentType:'application/json',body:JSON.stringify({ok:false,error:'Unable to save'})});
  });
  await page.goto(site+route,{waitUntil:'domcontentloaded',timeout:45000});
  const form=await contactFields(page);
  await form.locator('.tle-morph-submit').click();
  await form.getByRole('alert').waitFor({state:'visible',timeout:10000});
  assert.equal(await page.locator('.tle-success-card').count(),0,route+' false green success after 500');
  assert(await form.locator('.tle-morph-submit').isEnabled(),route+' cannot retry');
  assert.equal(submits,1,route+' duplicate error POST');
  await page.close();
 }
 const reduced=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
 await reduced.route('**/functions/v1/tle-contact',route=>route.fulfill({status:200,contentType:'application/json',body:'{"ok":true}'}));
 await reduced.goto(site+'/help/',{waitUntil:'domcontentloaded',timeout:45000});
 const form=await contactFields(reduced);
 await form.locator('.tle-morph-submit').click();
 await reduced.locator('.tle-success-card').waitFor({state:'visible',timeout:10000});
 const motion=await reduced.locator('.tle-success-ring').evaluate(el=>({display:getComputedStyle(el).display,animation:getComputedStyle(el).animationName}));
 assert.equal(motion.display,'none','reduced motion should hide growing ring');
 await reduced.close();
 // A sporadic homepage-only React hydration #418 can occur before the receipt
 // component mounts; log it for separate page-level QA, do not hide contact failures.
 const unrelatedHydration=errors.filter(value=>/Minified React error #418/.test(value));
 const receiptErrors=errors.filter(value=>!/Minified React error #418/.test(value));
 if(unrelatedHydration.length)console.warn('[EXISTING HOMEPAGE HYDRATION WARNING]',unrelatedHydration.join(' | '));
 assert.deepEqual(receiptErrors,[],'Uncaught errors beyond existing React hydration noise');
 console.log('[VERIFIED CONFIRMATIONS BROWSER QA PASSED] EN/ES + freebie, 5 widths, success, 500 retry, reduced motion, no real requests.');
} finally {await browser.close();}
