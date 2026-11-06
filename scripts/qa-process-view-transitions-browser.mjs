/* Browser QA for the current four-step bilingual website service.
   This never creates orders, customer records, emails or any billing session. */
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const base=(process.env.QA_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const browser=await chromium.launch({headless:true});
try {
 for(const [lang,path] of [['en','/'],['es','/es/']]){
  for(const width of [390,820,1440]){
   const page=await browser.newPage({viewport:{width,height:850},reducedMotion:'reduce'});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   try{
    const response=await page.goto(base+path,{waitUntil:'domcontentloaded',timeout:30000});
    assert(response?.ok(),lang+' page must respond successfully');
    const root=page.locator('.tle-universal');
    await root.waitFor({state:'visible',timeout:20000});
    const hero=page.locator('.tle-universal .hero > img');
    assert.equal(await hero.count(),1,'One Jaramillo photo must be prominent');
    assert.equal(await hero.getAttribute('src'),'/assets/website-packages-20261105/hero-jaramillo.jpg');
    await hero.scrollIntoViewIfNeeded();
    await page.waitForFunction(()=>{const img=document.querySelector('.tle-universal .hero > img');return img instanceof HTMLImageElement&&img.complete&&img.naturalWidth>=1200;},null,{timeout:20000});
    assert.equal(await page.locator('.tle-universal .process-grid .step').count(),4,lang+' needs 4 independent process steps');
    assert.equal(await page.locator('.tle-universal #website-basic').count(),1);
    assert.equal(await page.locator('.tle-universal #website-ai-crm').count(),1);
    const hrefs=await page.locator('.tle-universal #paquetes a[href*="service-checkout"]').evaluateAll(els=>els.map(el=>el.getAttribute('href')));
    assert(hrefs.some(h=>h.includes('offer=website-basic&lang='+lang)),lang+' basic checkout missing');
    assert(hrefs.some(h=>h.includes('offer=website-ai-crm&lang='+lang)),lang+' recurring checkout missing');
    assert((await page.locator('.tle-universal #website-ai-crm').innerText()).includes('$8'),lang+' monthly payment disclosure missing');
    const photos=await page.locator('.tle-universal .process-grid img').evaluateAll(els=>els.map(el=>({src:el.getAttribute('src'),naturalWidth:el.naturalWidth,complete:el.complete})));
    assert(photos.length===4&&photos.every(img=>img.complete&&img.naturalWidth>0),lang+' process photos are broken '+JSON.stringify(photos));
    await page.locator('.tle-universal a[href="#proceso"]').first().click();
    assert.equal(new URL(page.url()).hash,'#proceso');
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
    assert(overflow<=3,lang+' '+width+' horizontal overflow '+overflow);
    assert.deepEqual(errors,[],lang+' '+width+' browser errors');
    if(width===390)await page.screenshot({path:'qa-screenshots/universal-process-'+lang+'.png',fullPage:true});
    console.log('[UNIVERSAL PROCESS BROWSER PASS]',lang,width);
   } finally {await page.close()}
  }
 }
}finally{await browser.close()}
