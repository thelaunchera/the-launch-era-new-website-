/** Safe hydration for current bilingual website, never initialize legacy private forms or checkout. */
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const base=(process.env.QA_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const browser=await chromium.launch({headless:true});
const results=[];
try{
 for(const lang of ['en','es'])for(const width of [360,390,820,1440])for(const repeat of [1,2]){
  const page=await browser.newPage({viewport:{width,height:844}});
  const errors=[],writes=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('request',r=>{if(['POST','PUT','PATCH','DELETE'].includes(r.method()))writes.push(r.url())});
  await page.goto(base+(lang==='es'?'/es/':'/'),{waitUntil:'domcontentloaded',timeout:45000});
  const hero=page.locator('.tle-universal .hero h1');
  await hero.waitFor({state:'visible',timeout:15000});
  const details=await page.evaluate(()=>({
   plans:document.querySelectorAll('.tle-universal .plan').length,
   steps:document.querySelectorAll('.tle-universal .step').length,
   approvedHero:!!document.querySelector('.tle-universal .hero img[src*="hero-jaramillo.jpg"]'),
   oldBooking:!!document.querySelector('.sales-home .booking-section'),
   overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth
  }));
  const valid=details.plans===2&&details.steps===4&&details.approvedHero&&!details.oldBooking&&details.overflow<=3;
  assert(valid,'Current home structure/hydration failed '+JSON.stringify({lang,width,repeat,details}));
  assert.deepEqual(errors,[],'Page runtime exceptions');
  assert.deepEqual(writes,[],'Marketing landing must not create checkout sessions until clicked');
  results.push({lang,width,repeat});
  await page.close();
 }
 console.log('[STRICT HYDRATION QA PASS] '+results.length+' current EN/ES renders, two packages, four steps, approved hero and no side effects');
}finally{await browser.close()}
