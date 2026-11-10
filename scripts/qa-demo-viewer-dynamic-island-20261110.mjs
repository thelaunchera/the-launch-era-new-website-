import assert from 'node:assert/strict';
import {chromium,webkit} from 'playwright';
const root=(process.env.QA_URL||'http://127.0.0.1:4197').replace(/\/$/,'');
for(const browserType of [chromium,webkit]){
 const browser=await browserType.launch({headless:true});
 try{
  for(const width of [375,390,430,1280]){
   const page=await browser.newPage({viewport:{width,height:820},reducedMotion:'no-preference'});
   const errors=[];
   page.on('pageerror',err=>errors.push(err.message));
   const r=await page.goto(root+'/demos/',{waitUntil:'domcontentloaded'});
   assert.equal(r?.status(),200);
   const d=page.locator('#demo-viewer');
   await d.evaluate(el=>el.showModal());
   await page.locator('#viewer-name').evaluate(el=>el.textContent='Golden Grid');
   await page.locator('#viewer-owner').evaluate(el=>el.hidden=false);
   assert.equal(await d.evaluate(el=>el.open),true);
   assert.equal(await page.locator('#viewer-name').innerText(),'Golden Grid');
   assert.ok((await page.locator('#viewer-name').boundingBox()).width>80,'Demo title must have room on iPhone');
   const more=page.locator('#viewer-more');
   const close=page.locator('#viewer-close');
   assert.equal(await close.getAttribute('aria-label'),'Close demo');
   if(width<=720){
    assert.equal(await more.isVisible(),true,'Mobile menu toggle visible');
    assert.equal(await page.locator('#viewer-external').isVisible(),false,'Full link tucked into menu on mobile');
    await more.click();
    assert.equal(await more.getAttribute('aria-expanded'),'true','Menu expansion announced');
    assert.equal(await page.locator('#viewer-external').isVisible(),true);
    assert.equal(await page.locator('#viewer-owner').isVisible(),true);
    const viewport=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth}));
    assert.ok(viewport.scrollWidth-viewport.width<=3,'No horizontal overflow');
    await page.keyboard.press('Escape');
    assert.equal(await more.getAttribute('aria-expanded'),'false','Escape closes menu first');
    assert.equal(await d.evaluate(el=>el.open),true,'Dialog stays open after dismissing options');
   }else{
    assert.equal(await more.isVisible(),false,'Desktop shows full options directly');
    assert.equal(await page.locator('#viewer-external').isVisible(),true);
   }
   await close.click();
   assert.equal(await d.evaluate(el=>el.open),false,'Close always exits demo');
   assert.deepEqual(errors,[],'Browser has no unhandled JS errors');
   console.log('PASS',browserType.name(),width,'demo top bar, options, close');
   await page.close();
  }
  const reduced=await browser.newPage({viewport:{width:375,height:820},reducedMotion:'reduce'});
  await reduced.goto(root+'/demos/',{waitUntil:'domcontentloaded'});
  await reduced.locator('#demo-viewer').evaluate(el=>el.showModal());
  assert.equal(await reduced.locator('#viewer-more').isVisible(),true,'Reduced motion preserves navigation');
  assert.equal(await reduced.locator('#viewer-close').isVisible(),true,'Reduced motion preserves exit');
  await reduced.close();
 }finally{await browser.close();}
}