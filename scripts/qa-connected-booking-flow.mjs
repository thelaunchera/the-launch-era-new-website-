/* Homepage section removal, EN/ES. Preserve independent Booking product pages,
 * demo links, hero backdrop, final purchase CTA and all tenant data. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const home=read('src/routes/index.tsx');
const es=read('src/routes/es.index.tsx');
const editorial=read('src/components/editorial-sections.tsx');
for(const [lang,source] of [['en',home],['es',es]]){
 assert(!source.includes('<BookingSection'),lang+': removed booking section reappeared');
 assert(!source.includes('<ConnectedBookingFlow'),lang+': removed hub reappeared');
 assert(!source.includes('home-booking-explorer'),lang+': duplicate explorer remains');
 assert(source.includes('<HomeMotionInterlude lang="'+lang+'"/>'),lang+': following section missing');
}
assert(home.includes('<ProblemSection/><HomeMotionInterlude'),'EN: section order changed');
assert(!es.includes('<section className="booking-section">'),'ES: booking section remains');
assert(home.includes('<FinalCTA/>')&&editorial.includes('export function FinalCTA'),'EN: final purchase CTA missing');
assert(es.includes('className="final-section"'),'ES: final purchase CTA missing');
assert(editorial.includes('/booking-bundle/?lang=en')&&es.includes('/booking-bundle/?lang=es'),'Booking checkout links must remain');
assert(editorial.includes('<HeroConnectionBackdrop lang="en"/>')&&es.includes('<HeroConnectionBackdrop lang="es"/>'),'Hero effects must remain');
console.log('[HOMEPAGE BOOKING SECTION STATIC PASS] EN/ES duplicate removed; service pages, hero and purchase CTA retained.');
if(!process.argv.includes('--browser'))process.exit(0);
const {chromium}=await import('playwright');
const base=(process.env.QA_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const browser=await chromium.launch({headless:true});
try{
 for(const [lang,route] of [['en','/'],['es','/es/']]){
  for(const width of [360,390,820,1024,1440]){
   const page=await browser.newPage({viewport:{width,height:900}});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto(base+route,{waitUntil:'domcontentloaded',timeout:45000});
   assert.equal(await page.locator('section.booking-section').count(),0,lang+' '+width+': booking section still visible');
   assert.equal(await page.locator('.tle-connected-flow').count(),0,lang+' '+width+': removed hub still visible');
   assert.equal(await page.locator('section.final-section').count(),1,lang+' '+width+': final purchase CTA missing');
   assert.equal(await page.locator('section.problem-section').count(),1,lang+' '+width+': adjacent problem section missing');
   assert.equal(await page.locator('a[href="/booking-bundle/?lang='+lang+'"]').count()>0,true,lang+' '+width+': purchase destination missing');
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
   assert(overflow<=3,lang+' '+width+': horizontal overflow '+overflow);
   assert.deepEqual(errors,[],lang+' '+width+': browser errors');
   console.log('PASS home booking section removed '+lang+' '+width);
   await page.close();
  }
 }
}finally{await browser.close()}
