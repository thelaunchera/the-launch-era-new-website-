/** Golden Grid syrup video and iPhone demo-close regression. */
import {chromium, webkit} from 'playwright';
import assert from 'node:assert/strict';
const BASE=(process.env.QA_URL||'http://127.0.0.1:4191').replace(/\/$/,'');
for(const [engine,browserType] of [['Chromium',chromium],['WebKit',webkit]]){
 const browser=await browserType.launch({headless:true});
 try{
  for(const mode of ['no-preference','reduce']){
   const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:mode});
   const page=await context.newPage(),errors=[];
   page.on('pageerror',e=>errors.push(String(e)));
   const response=await page.goto(BASE+'/demos/golden-grid/',{waitUntil:'domcontentloaded',timeout:30000});
   assert.equal(response?.status(),200);
   const hero=page.locator('.hero-art');
   await hero.waitFor({state:'visible'});
   const poster=hero.locator('img');
   await poster.evaluate(async img=>{if(!img.complete)await new Promise(resolve=>{img.addEventListener('load',resolve,{once:true});img.addEventListener('error',resolve,{once:true})})});
   assert(await poster.evaluate(img=>img.naturalWidth>=512),'First-frame fallback loads');
   const posterPath=await poster.getAttribute('src');
   assert(posterPath.includes('hero-syrup-poster-20261108.webp'),'User video poster selected');
   const media=page.locator('.hero-art video.golden-hero-video');
   if(mode==='reduce')assert.equal(await media.count(),0,'Reduced-motion keeps the still poster');
   else{
    await media.waitFor({state:'attached',timeout:12000});
    assert((await media.getAttribute('src')).includes('hero-syrup-20261108.mp4'));
    assert(await media.evaluate(v=>v.muted&&v.playsInline&&v.loop),'Inline autoplay must be muted and looped');
   }
   await page.locator('#gallery.golden-featured-carousel').waitFor({state:'attached'});
   assert.equal(await page.locator('#gallery > button img[src]').count(),3,'No nine-image iPhone decode');
   await page.locator('[data-golden-next]').click();
   assert.equal(await page.locator('#gallery > button img[src]').count(),3);
   await page.locator('.is-golden-current').click();
   assert(await page.locator('#lightbox').evaluate(d=>d.open),'Lightbox opens');
   await page.locator('#lightbox [data-close]').click();
   assert(!(await page.locator('#lightbox').evaluate(d=>d.open)),'Lightbox closes');
   assert.deepEqual(errors,[],'Page errors: '+engine+'/'+mode);
   await context.close();
   console.log('PASS',engine,'direct Golden',mode);
  }
  const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  const page=await context.newPage();
  await page.goto(BASE+'/demos/?demo=golden-grid',{waitUntil:'domcontentloaded'});
  const direct=page.locator('.demo-card[data-brand="golden-grid"] .card-preview-link');
  if(await direct.getAttribute('target')==='_blank'){
    // #441: avoid nested high-resolution iframe on iPhone and Studio previews.
    await page.locator('.demo-card.golden-direct-target').waitFor({state:'visible',timeout:12000});
    assert.equal(await page.locator('#demo-viewer').evaluate(d=>d.open),false,'Golden direct link must not trap the library');
    assert.equal(await page.evaluate(()=>document.body.style.overflow),'','Gallery scrolling must remain unlocked');
    assert.match(await direct.getAttribute('href'),/\/demos\/golden-grid\//,'Direct link must retain actual demo route');
  }else{
    // Legacy preview, retained until #441 merges. Wait until the gallery has
    // mounted and pruned non-visible sources, not merely until its class exists.
    await page.locator('#demo-viewer[open]').waitFor({state:'visible',timeout:12000});
    const iframe=page.frameLocator('#viewer-frame');
    await iframe.locator('.hero-art img').waitFor({state:'visible',timeout:15000});
    await iframe.locator('#gallery.golden-featured-carousel').waitFor({state:'attached',timeout:15000});
    await iframe.locator('#gallery').evaluate(async gallery=>{
      const ready=()=>gallery.querySelectorAll(':scope > button img[src]').length===3;
      if(ready())return;
      await new Promise((resolve,reject)=>{
        const observer=new MutationObserver(()=>{if(ready()){observer.disconnect();resolve()}});
        observer.observe(gallery,{subtree:true,childList:true,attributes:true,attributeFilter:['src']});
        setTimeout(()=>{observer.disconnect();reject(new Error('Nine-image gallery was not pruned after mount'))},12000);
      });
    });
    assert.equal(await iframe.locator('#gallery > button img[src]').count(),3);
    await page.locator('#viewer-close').click();
    assert(!(await page.locator('#demo-viewer').evaluate(d=>d.open)),'Closing demo must unlock parent');
    assert.equal(await page.locator('#viewer-frame').getAttribute('src'),'about:blank','iframe released');
  }
  await context.close();
  console.log('PASS',engine,'library preview return');
 }finally{await browser.close()}
}
