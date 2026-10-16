/* Browser-only language and responsive QA: never submit a lead or charge a card. */
import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=(process.env.QA_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const browser=await chromium.launch({headless:true});
try{
 for(const lang of ['en','es']){
  for(const width of [360,390,820,1440]){
   const page=await browser.newPage({viewport:{width,height:860},reducedMotion:'reduce'});
   const errors=[],writes=[];
   page.on('pageerror',err=>errors.push(err.message));
   page.on('request',req=>{
    if(['POST','PUT','PATCH','DELETE'].includes(req.method()))writes.push(req.url());
   });
   await page.route('https://www.googletagmanager.com/**',r=>r.abort());
   await page.route('https://www.google-analytics.com/**',r=>r.abort());
   await page.goto(base+'/booking-demo/?lang='+lang,{waitUntil:'domcontentloaded'});
   await page.waitForFunction(target=>document.documentElement.lang===target && document.querySelector('#language')?.value===target,lang,{timeout:12000});
   const heading=await page.locator('#headline').innerText();
   if(lang==='es'){
    assert.match(heading,/Una forma más sencilla de recibir reservas/i);
    assert.match(await page.locator('#formTitle').innerText(),/Pide tu demo personalizada/i);
    assert.match(await page.locator('#submit').innerText(),/Quiero mi demo/i);
    assert.match(await page.locator('#serviceBack').getAttribute('href'),/\/es\/booking-lead-automation/);
    assert.match(await page.locator('input[name="name"]').getAttribute('placeholder'),/Nombre y apellido/i);
   }else{
    assert.match(heading,/A smoother way to book/i);
    assert.match(await page.locator('#formTitle').innerText(),/Request your personalized demo/i);
    assert.match(await page.locator('#submit').innerText(),/Get my personalized demo/i);
   }
   assert.equal(await page.locator('#demoForm input[required]').count(),4,'Four required fields');
   assert.equal(await page.locator('#success').isHidden(),true,'Do not show receipt before actual request');
   assert.equal(await page.locator('#demoForm').isVisible(),true);
   assert.equal(await page.locator('#language').isVisible(),true);
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
   assert(overflow<=3,'No mobile/tablet overflow at '+width+' '+lang+': '+overflow);
   assert.deepEqual(errors,[],'No JS errors at '+lang+' '+width);
   assert.deepEqual(writes,[],'No production requests at '+lang+' '+width);
   console.log('PASS demo language and layout',lang,width);
   await page.close();
  }
 }
}finally{await browser.close()}
