/** Approved Golden Grid Canva video: tablet/desktop portrait clarity, iPhone stays still. */
import { chromium, webkit } from 'playwright';
import assert from 'node:assert/strict';

const base=(process.env.QA_URL||'http://127.0.0.1:4191').replace(/\/$/,'');
const route='/demos/golden-grid/';
for (const engine of [chromium,webkit]) {
  const browser=await engine.launch({headless:true});
  try {
    for (const [name,width,height,isMobile] of [
      ['tablet',820,1180,true],
      ['desktop',1440,900,false]
    ]) {
      const context=await browser.newContext({
        viewport:{width,height},isMobile,hasTouch:isMobile,reducedMotion:'no-preference'
      });
      const page=await context.newPage();
      const errors=[];
      page.on('pageerror',e=>errors.push(String(e)));
      const response=await page.goto(base+route,{waitUntil:'domcontentloaded'});
      assert.equal(response?.status(),200);
      const video=page.locator('[data-gg-approved-hero-video]');
      await video.waitFor({state:'visible'});
      await page.waitForFunction(()=>{
        const v=document.querySelector('[data-gg-approved-hero-video]');
        return v&&v.videoWidth===512&&v.videoHeight===682&&v.readyState>=2;
      },null,{timeout:20000});
      const state=await video.evaluate(v=>{
        const b=v.getBoundingClientRect();
        return {src:v.currentSrc,poster:v.poster,width:b.width,height:b.height,
          videoWidth:v.videoWidth,videoHeight:v.videoHeight,paused:v.paused,
          fit:getComputedStyle(v).objectFit};
      });
      assert.ok(state.src.endsWith('/demos/golden-grid/media/hero-approved-canva-20261108.mp4'));
      assert.ok(state.poster.endsWith('/demos/golden-grid/media/hero-approved-canva-20261108-firstframe.webp'));
      assert.ok(state.width<=512.5&&state.width>300,'Video must not upscale beyond native width');
      assert.equal(state.videoWidth,512);
      assert.equal(state.videoHeight,682);
      assert.equal(state.fit,'contain','Never crop the portrait footage');
      assert.deepEqual(errors,[]);
      await context.close();
      console.log('PASS Golden Grid approved video',engine.name(),name,state.width,'CSS px');
    }
    for (const reducedMotion of ['no-preference','reduce']) {
      const context=await browser.newContext({
        viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion
      });
      const page=await context.newPage();
      let requests=0;
      page.on('request',request=>{
        if(request.url().includes('hero-approved-canva-20261108.mp4'))requests++;
      });
      const response=await page.goto(base+route,{waitUntil:'domcontentloaded'});
      assert.equal(response?.status(),200);
      await page.locator('.hero-art img').waitFor({state:'visible'});
      assert.equal(await page.locator('[data-gg-approved-hero-video]').evaluate(v=>getComputedStyle(v).display),'none');
      assert.equal(await page.locator('[data-gg-approved-hero-video]').getAttribute('src'),null,
        'Phone must never request the video');
      assert.equal(requests,0,'Phone must not download the video');
      await context.close();
      console.log('PASS Golden Grid stable phone photo',engine.name(),reducedMotion);
    }
    const context=await browser.newContext({
      viewport:{width:1024,height:768},reducedMotion:'reduce'
    });
    const page=await context.newPage();
    await page.goto(base+route,{waitUntil:'domcontentloaded'});
    assert.equal(await page.locator('[data-gg-approved-hero-video]').evaluate(v=>getComputedStyle(v).display),'none');
    assert.equal(await page.locator('[data-gg-approved-hero-video]').getAttribute('src'),null);
    await context.close();
    console.log('PASS Golden Grid reduced-motion desktop',engine.name());
  } finally {await browser.close();}
}
