/* Read-only homepage hydration release gate.
 * 16 fresh renders across EN/ES and phone, tablet, desktop.
 * The former homepage BookingSection / ConnectedBookingFlow was intentionally removed.
 * Verify its approved successor (four chapter day/night scene), six service cards,
 * interactive hydration, Jessie, hero CTA and safe responsive layout instead.
 * No bookings, forms, emails, payments or customer records are submitted.
 */
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
    // React attaches a private instance property after hydration. Check the
    // current scene rather than the owner's retired homepage booking section.
    await page.waitForFunction(()=>{
      const scene=document.querySelector('.sales-home .tle-day-night');
      return !!(scene&&Object.keys(scene).some(k=>k.startsWith('__reactFiber')||k.startsWith('__reactProps')));
    },null,{timeout:15000});
    await page.locator('.tle-jessy-root').waitFor({state:'attached',timeout:12000});
    await page.waitForTimeout(450);
    const details=await page.evaluate(()=>({
      assistant:!!document.querySelector('.tle-jessy-root'),
      heading:!!document.querySelector('.problem-section .tle-mask-headline__base'),
      chapters:document.querySelectorAll('.tle-day-night .tle-time-chapter').length,
      services:document.querySelectorAll('.solutions-section .service-grid .service-image').length,
      bookingDemoCTA:!!document.querySelector('.hero-intro a[href^="/booking-demo/"]'),
      removedBookingSection:document.querySelectorAll('.booking-section').length,
      overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth
    }));
    const result={lang,width,repeat,errors,details};
    results.push(result);
    console.log('HYDRATION_STRESS '+JSON.stringify(result));
    await page.close();
   }
  }
 }
 const bad=results.filter(x=>x.errors.length||!x.details.assistant||!x.details.heading
   ||x.details.chapters!==4||x.details.services!==6||!x.details.bookingDemoCTA
   ||x.details.removedBookingSection!==0||x.details.overflow>3);
 assert.equal(bad.length,0,'Homepage hydration or responsive regression: '+JSON.stringify(bad));
 console.log('[STRICT HYDRATION QA PASS] '+results.length+' fresh pages EN/ES, four story chapters, six services, no retired booking block, Jessie and no hydration exceptions.');
}finally{await browser.close();}
