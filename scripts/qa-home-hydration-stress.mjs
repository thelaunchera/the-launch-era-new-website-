/* Official website hydration smoke: 16 independent page loads, both languages, phone/tablet/desktop.
   Read only. No checkout sessions, form submissions, email or customer writes. */
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const base=(process.env.QA_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const browser=await chromium.launch({headless:true});
const results=[];
try{
 for(const lang of ['en','es'])for(const width of [360,390,820,1440])for(const repeat of [1,2]){
  const page=await browser.newPage({viewport:{width,height:844},reducedMotion:'reduce'});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const route=lang==='es'?'/es/':'/';
  const response=await page.goto(base+route,{waitUntil:'domcontentloaded',timeout:45000});
  assert.equal(response?.status(),200,lang+' '+width+': homepage response');
  await page.locator('.tle-universal .hero h1').waitFor({state:'visible',timeout:15000});
  const data=await page.evaluate(()=>{
   const root=document.querySelector('.tle-universal');
   const hero=root?.querySelector('.hero img');
   const plans=root?.querySelectorAll('.plan');
   const steps=root?.querySelectorAll('.step');
   const price=root?.querySelector('.monthly-price');
   const anchors=[...root?.querySelectorAll('a[href^="/service-checkout/?offer="]')||[]].map(a=>a.getAttribute('href'));
   return {
    hero:hero?.getAttribute('src'),
    title:root?.querySelector('.hero h1')?.textContent||'',
    plans:plans?.length||0,steps:steps?.length||0,
    monthly:price?.textContent||'',anchors,
    hasOldHome:!!document.querySelector('.sales-home'),
    overflow:document.documentElement.scrollWidth-innerWidth,
    scrollHeight:document.documentElement.scrollHeight
   };
  });
  assert.equal(data.hero,'/assets/website-packages-20261105/hero-jaramillo.jpg',lang+' '+width+': wrong hero');
  assert(data.title.trim(),lang+' '+width+': empty hero title');
  assert.equal(data.plans,2,lang+' '+width+': expected two packages');
  assert.equal(data.steps,4,lang+' '+width+': expected four process steps');
  assert.match(data.monthly,/\$8/,lang+' '+width+': monthly fee missing');
  assert.deepEqual(data.anchors.sort(),[
    '/service-checkout/?offer=website-ai-crm&lang='+lang,
    '/service-checkout/?offer=website-basic&lang='+lang
  ].sort(),lang+' '+width+': checkout routes missing');
  assert(!data.hasOldHome,lang+' '+width+': legacy sales home still mounted');
  assert(data.scrollHeight>650,lang+' '+width+': page content missing');
  assert(data.overflow<=3,lang+' '+width+': horizontal overflow '+data.overflow);
  assert.deepEqual(errors,[],lang+' '+width+': client script errors');
  results.push({lang,width,repeat});
  console.log('PASS official bilingual hydration '+lang+' '+width+' #'+repeat);
  await page.close();
 }
 assert.equal(results.length,16);
}finally{await browser.close()}
