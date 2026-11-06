/* Official universal bilingual homepage: responsive purchase and layout regression. */
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const base=(process.env.QA_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const browser=await chromium.launch({headless:true});
try{
 for(const [lang,route] of [['en','/'],['es','/es/']]){
  for(const width of [360,390,820,1440]){
   const page=await browser.newPage({viewport:{width,height:844}});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto(base+route,{waitUntil:'domcontentloaded',timeout:45000});
   await page.locator('.tle-universal .hero').waitFor();
   const state=await page.evaluate(()=>{
    const root=document.querySelector('.tle-universal');
    const hero=root?.querySelector('.hero img');
    const plans=root?.querySelectorAll('.plan');
    const steps=root?.querySelectorAll('.step');
    const faq=root?.querySelector('#preguntas');
    return {
      hero:hero?.getAttribute('src'),plans:plans?.length||0,steps:steps?.length||0,
      faq:!!faq,hasOldBooking:!!document.querySelector('.sales-home .booking-section'),
      overflow:document.documentElement.scrollWidth-innerWidth,
    };
   });
   assert.equal(state.hero,'/assets/website-packages-20261105/hero-jaramillo.jpg',lang+' '+width+': original hero missing');
   assert.equal(state.plans,2,lang+' '+width+': exactly two packages required');
   assert(state.steps>=4,lang+' '+width+': four process steps missing');
   assert(state.faq,lang+' '+width+': FAQ missing');
   assert(!state.hasOldBooking,lang+' '+width+': retired cleaning homepage returned');
   assert(state.overflow<=3,lang+' '+width+': horizontal overflow '+state.overflow);
   assert.equal(await page.locator('a[href="/service-checkout/?offer=website-basic&lang='+lang+'"]').count(),1,'Basic checkout link missing');
   assert.equal(await page.locator('a[href="/service-checkout/?offer=website-ai-crm&lang='+lang+'"]').count(),1,'AI CRM checkout link missing');
   assert.deepEqual(errors,[],lang+' '+width+': browser errors');
   console.log('PASS official home '+lang+' '+width);
   await page.close();
  }
 }
}finally{await browser.close()}
