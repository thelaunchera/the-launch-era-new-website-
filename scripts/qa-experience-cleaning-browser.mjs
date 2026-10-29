import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {mkdirSync} from 'node:fs';
const base=(process.env.QA_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
mkdirSync('qa-screenshots',{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
try{
 for(const lang of ['en','es'])for(const width of [390,820,1440]){
  const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});
  const errors=[],writes=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('request',r=>{if(r.method()!=='GET' || /supabase|resend|stripe/i.test(r.url()))writes.push(r.method()+' '+r.url());});
  const response=await page.goto(base+'/experience-cleaning/?lang='+lang,{waitUntil:'domcontentloaded',timeout:35000});
  assert.equal(response?.status(),200,'The isolated new demo route must load');
  assert.equal(await page.locator('#owner').isVisible(),false);
  assert.match(await page.locator('#hero-title').innerText(),lang==='es'?/Tu casa impecable/:/A beautiful clean/);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+3),true,'No mobile horizontal overflow '+lang+' '+width);
  await page.screenshot({path:'qa-screenshots/experience-cleaning-hero-'+lang+'-'+width+'.png',fullPage:false});
  await page.locator('[data-service="deep"]').click();
  assert.equal(await page.locator('#r-price').innerText(),'$190');
  await page.locator('#next').click();
  await page.locator('#beds').selectOption('3');
  await page.locator('.extras input[value="oven"]').check();
  assert.equal(await page.locator('#r-price').innerText(),'$240');
  await page.locator('#next').click();
  await page.locator('#next').click();
  await page.locator('#owner').waitFor({state:'visible'});
  assert.match(await page.locator('#owner-service').innerText(),lang==='es'?/profunda/:/Deep cleaning/);
  await page.screenshot({path:'qa-screenshots/experience-cleaning-owner-'+lang+'-'+width+'.png',fullPage:false});
  await page.locator('#workflow-next').click();
  await page.locator('#workflow-next').click();
  assert.match(await page.locator('#workflow-desc').innerText(),lang==='es'?/hasta dos recordatorios automáticos/:/up to two automatic reminders/);
  assert.match(await page.locator('#purchase-link').getAttribute('href'),new RegExp('lang='+lang));
  assert.match(await page.locator('.offer-price').innerText(),/\$15/);
  // Commercial must always be estimate-only, never show a fixed total.
  await page.locator('.booking-category-tab[data-category="commercial"]').click();
  assert(await page.locator('#commercial-service-grid').isVisible());
  assert.equal(await page.locator('#service-grid').isVisible(),false);
  assert.match(await page.locator('#r-price').innerText(),lang==='es'?/Solicitar estimado/:/Request estimate/);
  await page.locator('[data-commercial-service="customCommercial"]').click();
  await page.locator('#next').click();
  assert.equal(await page.locator('#commercial-details').isVisible(),true);
  assert.equal(await page.locator('.extras').isVisible(),false);
  await page.locator('#commercial-area').selectOption('over5000');
  await page.locator('#next').click();
  await page.locator('#next').click();
  assert.match(await page.locator('#metric-value').innerText(),lang==='es'?/Solicitar estimado/:/Request estimate/);
  assert.match(await page.locator('#owner-service').innerText(),lang==='es'?/Locales comerciales/:/Business spaces/);
  await page.locator('#restart').click();
  assert.equal(await page.locator('#owner').isVisible(),false);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+3),true,'No overflow after interaction');
  assert.deepEqual(errors,[],'No runtime errors');
  assert.deepEqual(writes,[],'No real booking/financial/email requests');
  await page.close();
 }
 console.log('PASS premium demo EN/ES at iPhone, tablet and desktop; no writes, same-request handoff, follow-up and conversion');
}finally{await browser.close();}
