/* Strict read-only SSR hydration release gate.
 * 16 fresh browser loads across both language routes and viewport classes.
 * Wait long enough for Jessie, purchase proof and footer enhancement to initialize.
 * Checks the currently mounted Solutions service flip cards, not a removed BookingSection.\n * No bookings, forms, emails, payments or customer records. */
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const base=(process.env.QA_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const browser=await chromium.launch({headless:true});
const results=[];
try{
 for(const lang of ['en','es']){
  for(const width of [360,390,820,1440]){
   for(const repeat of [1,2]){
    const page=await browser.newPage({viewport:{width,height:844}});
    const errors=[];
    page.on('pageerror',err=>errors.push(err.message));
    await page.goto(base+(lang==='es'?'/es/':'/'),{waitUntil:'domcontentloaded',timeout:45000});
    // Test the live current homepage, not removed BookingSection content.
    // A flip card must respond to keyboard focus (hydrated React interaction).
    const flipCards=page.locator('.sales-home .tle-service-flip');
    await flipCards.first().waitFor({state:'visible',timeout:15000});
    assert.equal(await flipCards.count(),6,'Six actual service cards expected');
    await flipCards.first().locator('.tle-service-flip__front-button').evaluate(el=>el.focus());
    await page.waitForFunction(()=>document.querySelector('.sales-home .tle-service-flip')?.classList.contains('is-flipped'),null,{timeout:12000});
    assert.equal(await flipCards.first().locator('.tle-service-flip__back').getAttribute('aria-hidden'),'false');
    await page.keyboard.press('Escape');
    await page.waitForFunction(()=>!document.querySelector('.sales-home .tle-service-flip')?.classList.contains('is-flipped'),null,{timeout:12000});
    await page.waitForTimeout(1850);
    const details=await page.evaluate(()=>({
      assistant:!!document.querySelector('.tle-jessy-root'),
      heading:!!document.querySelector('.problem-section .tle-mask-headline__base'),
      buttons:document.querySelectorAll('.sales-home .tle-service-flip').length,
      overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth
    }));
    const result={lang,width,repeat,errors,details};
    results.push(result);
    console.log('HYDRATION_STRESS '+JSON.stringify(result));
    await page.close();
   }
  }
 }
 const bad=results.filter(x=>x.errors.length||!x.details.assistant||!x.details.heading||x.details.buttons!==6||x.details.overflow>3);
 assert.equal(bad.length,0,'SSR hydration or responsive regression: '+JSON.stringify(bad));
 console.log('[STRICT HYDRATION QA PASS] '+results.length+' fresh loaded pages, EN/ES 360/390/820/1440, Jessie present and no hydration exceptions.');
}finally{await browser.close();}
