/**
 * TLE public demo v12 regression tests. Sample-only, no real requests.
 * Run with QA_URL and PLAYWRIGHT_MODULE in local CI browser.
 */
import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=(process.env.QA_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const browser=await chromium.launch({headless:true});
const failures=[];
for(const width of [360,390,820,1024,1440]){
 for(const lang of ['en','es']){
  const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  try{
   await page.goto(base+'/lead-private-preview.html?business=Coastal%20Cleaners&area=Fort%20Lauderdale&lang='+lang,{waitUntil:'domcontentloaded',timeout:30000});
   await page.locator('#tleDemoReviews').waitFor({state:'visible',timeout:12000});
   const proof=await page.evaluate(()=>{
    const $=s=>document.querySelector(s);
    const image=$('.tle-demo-v12-why>img');
    const avatar=$('.tle-ai-launch .tle-demo-ai-avatar');
    const area=[...document.querySelectorAll('#tleDemoAreaTags span')].map(x=>x.textContent);
    return {viewport:innerWidth,scrollWidth:document.documentElement.scrollWidth,
     sections:['#tleDemoReviews','#tleDemoAreas','#tleDemoFaq'].every(s=>!!$(s)),
     reviews:document.querySelectorAll('#tleDemoReviews article').length,
     honest:[...document.querySelectorAll('#tleDemoReviews article')].every(e=>/SAMPLE|EJEMPLO/i.test(e.textContent)),
     area,faqs:document.querySelectorAll('#tleDemoFaq details').length,
     ai:!!avatar&&avatar.complete&&avatar.naturalWidth>=96,
     photo:image?.complete&&image?.naturalWidth>=900,
     photoSource:image?.getAttribute('src'),
     endLink:$('.tle-demo-v12-end a')?.getAttribute('href'),
     addOn:$('.tle-ai-head small')?.textContent
    };
   });
   assert(proof.sections,'missing proof sections');
   assert.equal(proof.reviews,3,'three honest review slots expected');
   assert(proof.honest,'fake unlabelled testimonials detected');
   assert(proof.area.includes('Fort Lauderdale'),'service area is not derived from the current business');
   assert(proof.faqs>=4,'FAQ is missing');
   assert(proof.ai,'assistant robot file not loaded');
   assert(proof.photo,'Drive cleaner file not loaded');
   assert(proof.photoSource.includes('drive-cleaner-kitchen.webp'),'Drive image not used');
   assert(proof.addOn.includes(lang==='es'?'opcional':'optional'),'AI separate service disclosure missing');
   assert.equal(proof.endLink,'#bookingStarter','CTA no longer goes to the existing request UI');
   assert(proof.scrollWidth<=width+3,'horizontal overflow on prospect '+JSON.stringify(proof));
   const agentTitle=await page.locator('.tle-ai-head b').textContent();
   assert(agentTitle?.includes('Sonny'),'booking agent should be named Sonny');
   await page.locator('.tle-ai-launch').click();
   await assertVisible(page,'.tle-ai-panel');
   await page.locator('.tle-ai-head button').click();
   // Simulated finished demo: no real form submission, API call, or email.
   await page.evaluate(()=>{
      window.showBrandedRequestSuccess('Coastal Cleaners');
      window.showDemoRequestSummary({service:'Standard Cleaning',date:'2026-10-24',time:'10:00'});
      window.show('done','Request received','✓');
   });
   const retry=page.locator('#tleTrySonny');
   await retry.waitFor({state:'visible',timeout:5000});
   assert((await retry.textContent()).includes(lang==='es'?'Sonny':'Try it again with the booking agent'),'missing retry call to action');
   await retry.click();
   await assertVisible(page,'.tle-ai-panel');
   assert(await page.locator('#main').evaluate(e=>e.classList.contains('on')),'Retry must restore the service-picker start screen');
   assert((await page.locator('.tle-ai-head b').textContent())?.includes('Sonny'),'Retry did not open Sonny');
   assert((await page.locator('.tle-ai-msg.bot').first().textContent())?.includes('Sonny'),'Retry did not restart Sonny conversation');
   assert(await page.locator('#done').evaluate(e=>!e.classList.contains('on')),'Old confirmation must not remain active');
   console.log('PASS prospect',lang,width);
  }catch(e){failures.push('prospect '+lang+' '+width+': '+e.message);console.error('FAIL prospect',lang,width,e.message,'js errors:',errors)}
  finally{await page.close();}
 }
}
for(const width of [360,390,820,1024,1440]){
 const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.goto(base+'/booking-demo/',{waitUntil:'domcontentloaded',timeout:30000});
  try{await page.locator('#tleDemoFormGuide').waitFor({state:'visible',timeout:5000})}
  catch{
   const diag=await page.evaluate(()=>({path:location.pathname,title:document.title,main:!!document.querySelector('main.wrap'),form:!!document.querySelector('#demoForm'),sales:!!document.querySelector('#tleDemoSalesExperience'),includesScript:[...document.scripts].some(s=>s.src.includes('tle-demo-enhancements-v12.js'))}));
   throw new Error('Sales enhancement not loaded: '+JSON.stringify(diag));
  }
  const state=await page.evaluate(()=>{
   const $=s=>document.querySelector(s);
   const avatar=$('.tle-jessy-fab img');
   const photo=$('.tle-demo-v12-salesphotos img');
   return {scrollWidth:document.documentElement.scrollWidth,viewport:innerWidth,
    sales:!!$('#tleDemoSalesExperience'),reviews:!!$('#tleDemoSalesProof'),
    form:!!$('#demoForm'),jessyUnchanged:!!avatar&&avatar.src.includes('/assets/jessy-avatar.webp'),
    gallery:photo?.complete&&photo.naturalWidth>900,
    controls:document.querySelectorAll('.tle-demo-v12-formactions button').length};
  });
  assert(state.sales&&state.reviews&&state.form,'sales page preview missing');
  assert(state.jessyUnchanged&&state.gallery,'Jessy must retain her own avatar; sales gallery must load');
  assert.equal(state.controls,3,'sales guide needs three help actions');
  assert(state.scrollWidth<=width+3,'sales page horizontal overflow '+JSON.stringify(state));
  await page.locator('#demoForm [name="name"]').fill('QA Tester');
  await page.locator('#demoForm [name="business"]').fill('Sample Company');
  await page.locator('.tle-demo-v12-formactions [data-action="form"]').click();
  const active=await page.evaluate(()=>document.activeElement?.name);
  assert.equal(active,'business','Help with form did not focus business field');
  await page.selectOption('#language','es');
  assert.equal(await page.locator('#demoForm [name="business"]').inputValue(),'Sample Company','Language switch wiped the form');
  await page.locator('.tle-jessy-fab').click();
  await assertVisible(page,'.tle-jessy-panel');
  assert((await page.locator('.tle-jessy-title b').textContent())?.includes('Jessy'),'Jessy was incorrectly renamed on sales demo');
  console.log('PASS sales',width);
 }catch(e){failures.push('sales '+width+': '+e.message);console.error('FAIL sales',width,e.message,'js errors:',errors)}
 finally{await page.close()}
}
for(const query of ['?key=qa-test-no-real-key','?owner_preview=1']){
 const page=await browser.newPage();
 try{
  await page.goto(base+'/lead-private-preview.html'+query,{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForTimeout(250);
  const hidden=await page.evaluate(()=>!document.getElementById('tleDemoReviews')&&!document.querySelector('.tle-demo-v12-welcome'));
  assert(hidden,'customer or owner booking preview must not display sample-only v12 sections');
  console.log('PASS isolation',query);
 }catch(e){failures.push('isolated '+query+': '+e.message)}
 finally{await page.close()}
}
await browser.close();
if(failures.length){console.error('\n'+failures.join('\n'));process.exit(1)}
async function assertVisible(page,selector){await page.locator(selector).waitFor({state:'visible',timeout:7000})}
