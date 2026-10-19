/** Mobile product conversion QA. Sample interactions only; no email, purchase or booking. */
import assert from 'node:assert/strict';
import {readFileSync,mkdirSync} from 'node:fs';
import {chromium} from 'playwright';
const read=p=>readFileSync(p,'utf8');
const en=read('src/routes/booking-lead-automation.tsx');
const es=read('src/routes/es.booking-lead-automation.tsx');
const app=read('src/components/cleaning-app-showcase.tsx');
const appCss=read('public/assets/tle-app-landing.css');
const bookingCss=read('src/components/service-sales-mobile-cta.css');
const bundleCss=read('public/assets/tle-bundle-landing.css');
const wa=read('public/whatsapp-ai-agent/index.html');
const ai=read('public/ai-booking-assistant/index.html');
const sales=read('src/components/service-sales.tsx');
assert.match(app,/tle-case-mobile-quick/);
assert.match(appCss,/\.tle-cleaning-case \.tle-case-cover\{display:none!important\}/);
assert.match(en,/booking-product-landing/);
assert.match(es,/booking-product-landing/);
assert.match(bookingCss,/\.booking-product-landing \.service-sales-pain/);
assert.match(en,/Try the Booking Demo/);
assert.match(es,/Probar el demo de reservas/);
assert.match(sales,/Get my booking system/);
assert.match(sales,/Request a personalized demo/);
assert.match(bundleCss,/\.tle-bridge-grid\{display:none!important\}/);
assert.match(ai,/#plans \.cards\{display:none!important\}/);
assert.match(ai,/tle-plan-picker/);
assert.match(wa,/\.hero \.art\{display:none!important\}/);
assert.match(wa,/COMING SOON/);
const base=(process.env.QA_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
mkdirSync('qa-screenshots',{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
async function check(path,width,verify){
 const page=await browser.newPage({viewport:{width,height:844},reducedMotion:'reduce'});
 try{
  const res=await page.goto(base+path,{waitUntil:'domcontentloaded',timeout:50000});
  assert.equal(res?.status(),200,path+' status '+res?.status());
  await page.waitForTimeout(400);
  const overflow=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,inner:innerWidth}));
  assert(overflow.scroll<=overflow.inner+4,'Horizontal clipping on '+path+' at '+width+': '+JSON.stringify(overflow));
  await verify(page);
  await page.screenshot({path:'qa-screenshots/mobile-product-'+path.replace(/[^a-z0-9]/gi,'-')+'-'+width+'.png',fullPage:false});
  console.log('PASS',path,width);
 }finally{await page.close()}
}
try{
 const phone=390,desktop=1100;
 for(const [lang,path] of [['en','/booking-lead-automation/'],['es','/es/booking-lead-automation/']]){
  await check(path,phone,async page=>{
   assert.equal(await page.locator('.booking-product-landing .service-sales-pain').isVisible(),false);
   assert.equal(await page.locator('.booking-product-landing .service-endcap').isVisible(),false);
   const btns=page.locator('.booking-product-landing .service-sales-close .service-hero-actions a');
   assert.equal(await btns.count(),2);
   assert.match(await btns.nth(0).getAttribute('href'),/booking-bundle/);
   assert.match(await btns.nth(1).getAttribute('href'),/booking-demo/);
   assert.match(await page.locator('.booking-motion-hero .service-hero-actions a').first().getAttribute('href'),/sample-cleaning/);
  });
 }
 await check('/booking-lead-automation/',desktop,async page=>{
  assert.equal(await page.locator('.service-sales-pain').isVisible(),true);
  assert.equal(await page.locator('.service-endcap').isVisible(),true);
 });
 for(const [lang,path] of [['en','/cleaning-web-app/'],['es','/es/cleaning-web-app/']]){
  await check(path,phone,async page=>{
   assert.equal(await page.locator('.tle-case-mobile-quick').isVisible(),true);
   assert.equal(await page.locator('.tle-case-cover').isVisible(),false);
   assert.match(await page.locator('.tle-case-mobile-quick a').getAttribute('href'),new RegExp('cleaning-app-demo/\\?lang='+lang));
   assert.equal(await page.locator('a[href="https://app.thelaunchera.com/?entry=signup"]').count(),2);
  });
 }
 await check('/cleaning-web-app/',desktop,async page=>{
  assert.equal(await page.locator('.tle-case-cover').isVisible(),true);
  assert.equal(await page.locator('.tle-case-mobile-quick').isVisible(),false);
 });
 await check('/booking-bundle/',phone,async page=>{
  assert.equal(await page.locator('.tle-intro').isVisible(),false);
  assert.equal(await page.locator('.tle-bridge-grid').isVisible(),false);
  assert.equal(await page.locator('.tle-bridge-foot').isVisible(),true);
  assert.equal(await page.locator('#choose-plan').count(),1);
  assert.equal(await page.locator('a[href^="/sample-cleaning/"]').count(),1);
 });
 await check('/booking-bundle/',desktop,async page=>{
  assert.equal(await page.locator('.tle-intro').isVisible(),true);
  assert.equal(await page.locator('.tle-bridge-grid').isVisible(),true);
 });
 await check('/ai-booking-assistant/',phone,async page=>{
  assert.equal(await page.locator('#plans .cards').isVisible(),false);
  assert.equal(await page.locator('#plans .tle-plan-picker').isVisible(),true);
  const picker=page.locator('#plans [data-selected-checkout]');
  assert.match(await picker.getAttribute('href'),/offer=ai-business/);
  await page.locator('#plans .tle-plan-toggle [data-plan="booking"]').click();
  assert.match(await picker.getAttribute('href'),/offer=ai-booking/);
  await page.locator('#plans .tle-plan-toggle [data-plan="followup"]').click();
  assert.match(await picker.getAttribute('href'),/offer=ai-followup/);
 });
 await check('/ai-booking-assistant/',desktop,async page=>{
  assert.equal(await page.locator('#plans .cards').isVisible(),true);
 });
 await check('/whatsapp-ai-agent/',phone,async page=>{
  assert.equal(await page.locator('.hero .art').isVisible(),false);
  assert.equal(await page.locator('#conversation').isVisible(),true);
  assert.equal(await page.locator('.features .feature').count(),6);
  assert.equal(await page.locator('.features .feature:nth-child(4)').isVisible(),false);
  await page.locator('.scenario[data-index="1"]').click();
  assert.equal(await page.locator('.scenario[data-index="1"]').getAttribute('aria-pressed'),'true');
  assert.match((await page.locator('.coming-soon-note').innerText()).toLowerCase(),/coming soon/);
 });
 await check('/whatsapp-ai-agent/',desktop,async page=>{
  assert.equal(await page.locator('.hero .art').isVisible(),true);
  assert.equal(await page.locator('.features .feature:nth-child(4)').isVisible(),true);
 });

 await check('/es/ai-booking-assistant/',phone,async page=>{
  assert.equal(await page.locator('#plans .cards').isVisible(),false);
  assert.equal(await page.locator('#plans .tle-plan-picker').isVisible(),true);
  const picker=page.locator('#plans [data-selected-checkout]');
  await page.locator('#plans .tle-plan-toggle [data-plan="followup"]').click();
  assert.match(await picker.getAttribute('href'),/offer=ai-followup/);
 });
 await check('/es/whatsapp-ai-agent/',phone,async page=>{
  assert.equal(await page.locator('.hero .art').isVisible(),false);
  assert.equal(await page.locator('#conversation').isVisible(),true);
  assert.equal(await page.locator('.features .feature:nth-child(4)').isVisible(),false);
 });
 for(const path of ['/website-automation/','/virtual-assistant/']){
  await check(path,phone,async page=>{
   assert(await page.locator('a[href^="/service-checkout/"]').count()>0,'Checkout CTA missing '+path);
  });
 }
}finally{await browser.close();}
console.log('PASS all mobile product funnels, no real submissions');
