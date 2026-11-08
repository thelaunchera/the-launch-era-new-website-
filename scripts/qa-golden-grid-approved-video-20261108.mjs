/** Golden Grid: sharp HD still + localized low-res syrup motion on tablet/desktop. */
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
      const original=page.locator('.hero-art > img');
      await original.waitFor({state:'visible'});
      await page.waitForFunction(()=>{const i=document.querySelector('.hero-art > img');return i?.complete&&i.naturalWidth>512;});
      await page.waitForFunction(()=>{
        const v=document.querySelector('[data-gg-approved-hero-video]');
        return v&&v.videoWidth===512&&v.videoHeight===682&&v.readyState>=2;
      },null,{timeout:20000});
      const state=await video.evaluate(v=>{
        const b=v.getBoundingClientRect();
        const p=v.closest('.hero-art');
        const container=p.getBoundingClientRect();
        const css=getComputedStyle(v);
        const artStyle=getComputedStyle(p);
        const photo=p.querySelector(':scope > img');
        return {
          src:v.currentSrc,poster:v.poster,width:b.width,height:b.height,
          videoWidth:v.videoWidth,videoHeight:v.videoHeight,paused:v.paused,
          fit:css.objectFit,visiblePhoto:photo&&getComputedStyle(photo).display!=='none',
          parentWidth:container.width,parentHeight:container.height,
          x:b.x,parentX:container.x,background:artStyle.backgroundImage,
          padding:artStyle.padding,position:css.position,
          mask:css.maskImage||css.webkitMaskImage,
          photoWidth:photo?.naturalWidth,photoHeight:photo?.naturalHeight
        };
      });
      console.log('Golden Grid hero geometry',engine.name(),name,JSON.stringify(state));
      assert.ok(state.src.endsWith('/demos/golden-grid/media/hero-approved-canva-20261108.mp4'));
      assert.ok(state.poster.endsWith('/demos/golden-grid/media/hero-approved-canva-20261108-firstframe.webp'));
      assert.equal(state.videoWidth,512);
      assert.equal(state.videoHeight,682);
      assert.ok(state.width>512,'The video must now fill the entire tablet/desktop hero');
      assert.ok(Math.abs(state.width-state.parentWidth)<=2,
        'No bars/empty sides allowed between video and hero frame: '+JSON.stringify(state));
      assert.ok(Math.abs(state.x-state.parentX)<=2,'The video must start at the left edge of the hero');
      assert.ok(Math.abs(state.height-state.width*682/512)<3,'Video must retain its full original aspect ratio');
      assert.ok(Math.abs(state.height-state.parentHeight)<=3,'No empty space behind the video');
      assert.equal(state.visiblePhoto,true,'Keep the high-resolution original hero visible under the localized motion');
      assert.ok(state.photoWidth>512,'The crisp campaign image must be higher resolution than the overlay video');
      assert.ok(state.mask.includes('radial-gradient'),'Motion must be feather-masked to syrup and waffles, never cover the sharp headline');
      assert.equal(state.background,'none','No yellow stripe or gradient behind the video');
      assert.equal(state.padding,'0px','No video framing/padding');
      assert.equal(state.position,'absolute');
      assert.equal(state.fit,'cover','Fill the exact hero edges without distortion');
      assert.deepEqual(errors,[]);
      await context.close();
      console.log('PASS Golden Grid crisp full-width still + localized motion',engine.name(),name,Math.round(state.width),'CSS px');
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
      const response=await page.goto(base+route,{waitUntil:'load'});
      assert.equal(response?.status(),200);
      await page.waitForFunction(()=>Array.from(document.styleSheets).some(s=>s.href?.includes('golden-approved-hero-video-20261108.css')));
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
    await page.goto(base+route,{waitUntil:'load'});
    await page.waitForFunction(()=>Array.from(document.styleSheets).some(s=>s.href?.includes('golden-approved-hero-video-20261108.css')));
    assert.equal(await page.evaluate(()=>matchMedia('(prefers-reduced-motion:reduce)').matches),true);
    assert.equal(await page.locator('[data-gg-approved-hero-video]').evaluate(v=>getComputedStyle(v).display),'none');
    assert.equal(await page.locator('[data-gg-approved-hero-video]').getAttribute('src'),null);
    await context.close();
    console.log('PASS Golden Grid reduced-motion desktop',engine.name());
  } finally {await browser.close();}
}
