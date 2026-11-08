/** Golden Grid: iPhone iframe + original hero regression after motion fallback. */
import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const base=(process.env.QA_URL||'http://127.0.0.1:4191').replace(/\/$/,'');
const browser=await chromium.launch({headless:true});
try {
  for(const reducedMotion of ['no-preference','reduce']){
    const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion});
    const page=await context.newPage();
    const errors=[];
    page.on('pageerror', e=>errors.push(String(e)));
    const response=await page.goto(base+'/demos/golden-grid/',{waitUntil:'domcontentloaded'});
    assert.equal(response?.status(),200);
    const hero=page.locator('.hero-art img');
    await hero.waitFor({state:'visible'});
    await page.waitForFunction(()=>{const i=document.querySelector('.hero-art img');return i?.complete&&i.naturalWidth>300;});
    assert.equal(await page.locator('video[data-tle-cinematic-hero]').count(),0,'Unverified video should not run on Golden Grid');
    await page.locator('#gallery.golden-featured-carousel').waitFor({state:'attached'});
    const snapshot=()=>page.locator('#gallery > button img[src]').count();
    assert.equal(await snapshot(),3,'Only current and adjacent photos should remain mounted');
    const next=page.locator('[data-golden-next]');
    await next.click();
    assert.equal(await snapshot(),3,'Carousel should retain three photos after advancing');
    await page.locator('.is-golden-current').click();
    assert.equal(await page.locator('#lightbox').evaluate(d=>d.open),true,'Full-quality photo must remain accessible');
    await page.locator('#lightbox [data-close]').click();
    assert.equal(await page.locator('#lightbox').evaluate(d=>d.open),false,'Photo close must work');
    assert.deepEqual(errors,[],'No Golden JS errors');
    await context.close();
    console.log('PASS Golden Grid direct',reducedMotion);
  }
  const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
  const page=await context.newPage();
  await page.goto(base+'/demos/?demo=golden-grid',{waitUntil:'domcontentloaded'});
  const direct=page.locator('.demo-card[data-brand="golden-grid"] .card-preview-link');
  if(await direct.getAttribute('target')==='_blank'){
    // Compatible with PR #441's safer standalone navigation: never trap Studio in iframe.
    await page.locator('.demo-card.golden-direct-target').waitFor({state:'visible'});
    assert.match(await direct.getAttribute('href'),/\/demos\/golden-grid\//);
    assert.equal(await page.locator('#demo-viewer').evaluate(d=>d.open),false);
    assert.equal(await page.evaluate(()=>document.body.style.overflow),'');
  } else {
    // Existing gallery preview path until the standalone safe-open fix lands.
    await page.locator('#demo-viewer[open]').waitFor({state:'visible'});
    const iframe=page.frameLocator('#viewer-frame');
    await iframe.locator('.hero-art img').waitFor({state:'visible'});
    await page.locator('#viewer-close').click();
    assert.equal(await page.locator('#demo-viewer').evaluate(d=>d.open),false);
    assert.equal(await page.locator('#viewer-frame').getAttribute('src'),'about:blank');
  }
  await context.close();
  console.log('PASS Golden Grid demo library return');
} finally {await browser.close();}
