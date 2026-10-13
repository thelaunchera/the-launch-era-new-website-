/** Non-destructive UI QA for public Cleaning App sales page only.
 * Run against a local Vite preview; do not authenticate or read customer records.
 */
import { strict as assert } from 'node:assert';
const modulePath = process.env.PLAYWRIGHT_MODULE || 'playwright';
const { chromium } = await import(modulePath);
const base = (process.env.QA_URL || 'http://127.0.0.1:4173').replace(/\/$/, '');
const fs = await import('node:fs');
fs.mkdirSync('qa-screenshots', { recursive:true });
const browser = await chromium.launch({headless:true});
let failures = [];
for(const [lang,slug] of [['en','/cleaning-web-app/'],['es','/es/cleaning-web-app/']]){
 for(const width of [360,390,820,1440]){
  const page=await browser.newPage({viewport:{width,height:900},deviceScaleFactor:1,reducedMotion:'reduce'});
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  try{
   const response=await page.goto(base+slug,{waitUntil:'domcontentloaded',timeout:20000});
   assert(response?.ok(), 'Page response failed');
   await page.locator('.tle-app-landing h1').waitFor({state:'visible',timeout:15000});
   await page.waitForTimeout(600);
   await page.screenshot({path:'qa-screenshots/cleaning-'+lang+'-'+width+'.png',fullPage:true});
   assert.equal(await page.locator('.tle-app-feature').count(),4,'Exactly four feature groups');
   assert.equal(await page.locator('.tle-app-finish').count(),1,'One pricing close');
   assert.equal(await page.locator('.service-sales').count(),0,'No old FAQ/service repeat');
   assert.equal(await page.locator('.tle-app-landing').count(),1,'Single product page');
   assert.equal(await page.locator('a[href="https://app.thelaunchera.com/?entry=signup"]').count(),2,'Two appropriate signup entry points');
   assert(await page.locator('a[href="/cleaning-app-demo/?lang='+lang+'"]').count()>=2,'Demo links correct language');
   assert.equal(await page.locator('.tle-app-landing').getAttribute('lang'),null);
   const metrics=await page.evaluate(()=>({
    pageWidth:document.documentElement.scrollWidth,
    viewportWidth:window.innerWidth,
    featureFont:parseFloat(getComputedStyle(document.querySelector('.tle-app-feature p')).fontSize),
    leadFont:parseFloat(getComputedStyle(document.querySelector('.tle-app-lead')).fontSize),
    priceFont:parseFloat(getComputedStyle(document.querySelector('.tle-app-price small')).fontSize),
    cssReady:getComputedStyle(document.querySelector('.tle-app-hero')).backgroundImage!=='none',
    blankPrice:document.querySelector('.tle-app-landing').innerText.includes('$—')
   }));
   assert(metrics.pageWidth <= metrics.viewportWidth+2, 'Horizontal overflow '+JSON.stringify(metrics));
   assert(metrics.featureFont>=14 && metrics.leadFont>=16 && metrics.priceFont>=13, 'Unreadable font '+JSON.stringify(metrics));
   assert(metrics.cssReady,'Landing CSS not loaded');
   assert(!metrics.blankPrice,'Blank estimate price exposed');
   assert.equal(errors.length,0,'JavaScript runtime errors '+errors.join(';'));
   console.log('PASS',lang,width,JSON.stringify(metrics));
  }catch(e){failures.push(lang+' '+width+': '+e.message);console.error('FAIL',lang,width,e.message)}
  finally{await page.close()}
 }
}
await browser.close();
if(failures.length){console.error('Cleaning App UI QA failures:\n'+failures.join('\n'));process.exit(1)}
