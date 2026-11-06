/* Browser QA for the current universal Website for Your Business landing.
   The cleaning-only WebGL starfield has intentionally been retired. */
import assert from 'node:assert/strict';
import {mkdirSync} from 'node:fs';
import {chromium} from 'playwright';
const base=(process.env.QA_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
mkdirSync('qa-screenshots',{recursive:true});
const browser=await chromium.launch({headless:true});
try{
 for(const [lang,path] of [['en','/'],['es','/es/']]){
  for(const width of [390,820,1440]){
   const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   try{
    await page.goto(base+path,{waitUntil:'domcontentloaded',timeout:30000});
    const root=page.locator('.tle-universal');await root.waitFor({state:'visible',timeout:15000});
    assert.equal(await page.locator('.tle-starfield-accent').count(),0,'Retired starfield returned');
    const hero=root.locator('.hero > img');
    assert.equal(await hero.count(),1);
    await page.waitForFunction(()=>{const img=document.querySelector('.tle-universal .hero>img');return !!img&&img.complete&&img.naturalWidth>=1200;},null,{timeout:15000});
    assert.equal(await hero.getAttribute('src'),'/assets/website-packages-20261105/hero-jaramillo.jpg');
    assert.equal(await root.locator('#website-basic').count(),1);
    assert.equal(await root.locator('#website-ai-crm').count(),1);
    assert.equal(await root.locator('.process-grid .step').count(),4);
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
    assert(overflow<=3,lang+' '+width+' horizontal overflow '+overflow);
    assert.deepEqual(errors,[],lang+' '+width+' runtime errors');
    if(width===390)await page.screenshot({path:'qa-screenshots/starfield-'+lang+'-'+width+'.png',fullPage:true});
    console.log('PASS new hero',lang,width);
   }finally{await page.close()}
  }
 }
}finally{await browser.close()}
