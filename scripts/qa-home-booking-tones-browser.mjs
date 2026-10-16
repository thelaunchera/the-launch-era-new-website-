/* Read-only responsive regression after retirement of duplicate homepage Booking panel.
 * Confirm adjacent sections and independent final purchase CTA survive. */
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const base=(process.env.QA_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const browser=await chromium.launch({headless:true});
try{
 for(const [lang,route] of [['en','/'],['es','/es/']]){
  for(const width of [360,390,820,1440]){
   const page=await browser.newPage({viewport:{width,height:844},reducedMotion:'no-preference'});
   const errors=[];
   page.on('pageerror',error=>errors.push(error.message));
   await page.goto(base+route,{waitUntil:'domcontentloaded',timeout:45000});
   const state=await page.evaluate(()=>{
    const problem=document.querySelector('.sales-home .problem-section');
    const process=document.querySelector('.sales-home .process-section');
    const final=document.querySelector('.sales-home .final-section');
    return {
     duplicate:document.querySelectorAll('.sales-home .booking-section').length,
     removedHub:document.querySelectorAll('.sales-home .tle-connected-flow').length,
     hasProblem:!!problem,hasProcess:!!process,hasFinal:!!final,
     order:!!(problem&&process&&final&&problem.compareDocumentPosition(process)&Node.DOCUMENT_POSITION_FOLLOWING&&process.compareDocumentPosition(final)&Node.DOCUMENT_POSITION_FOLLOWING),
     overflow:document.documentElement.scrollWidth-innerWidth
    };
   });
   assert.equal(state.duplicate,0,lang+' '+width+': old booking section returned');
   assert.equal(state.removedHub,0,lang+' '+width+': old booking hub returned');
   assert(state.hasProblem&&state.hasProcess&&state.hasFinal&&state.order,lang+' '+width+': adjacent home sections reordered');
   assert(state.overflow<=3,lang+' '+width+': horizontal overflow '+state.overflow);
   const checkout=page.locator('section.final-section a[href="/booking-bundle/?lang='+lang+'"]');
   assert.equal(await checkout.count(),1,lang+' '+width+': final checkout lost');
   assert.deepEqual(errors,[],lang+' '+width+': script errors');
   console.log('PASS home panel retirement '+lang+' '+width);
   await page.close();
  }
 }
}finally{await browser.close()}
