/** Golden Grid: sharp HD still, native-size phone playback and localized desktop motion. */
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
          photoWidth:photo?.naturalWidth,photoHeight:photo?.naturalHeight,
          photoSrc:photo?.currentSrc
        };
      });
      console.log('Golden Grid hero geometry',engine.name(),name,JSON.stringify(state));
      assert.ok(state.src.endsWith('/demos/golden-grid/media/hero-approved-canva-20261108.mp4'));
      assert.ok(state.poster.includes('/demos/golden-grid/resources/golden-1.png?v=20261108-master-hq'),
        'The video poster must match the lossless first image');
      assert.ok(state.photoSrc.includes('/demos/golden-grid/resources/golden-1.png?v=20261108-master-hq'),
        'The real hero must use lossless master PNG instead of optimized WebP');
      assert.equal(state.videoWidth,512);
      assert.equal(state.videoHeight,682);
      assert.ok(state.width>512,'The video must now fill the entire tablet/desktop hero');
      assert.ok(Math.abs(state.width-state.parentWidth)<=2,
        'No bars/empty sides allowed between video and hero frame: '+JSON.stringify(state));
      assert.ok(Math.abs(state.x-state.parentX)<=2,'The video must start at the left edge of the hero');
      assert.ok(Math.abs(state.height-state.width*state.photoHeight/state.photoWidth)<3,
        'The motion overlay must match the sharp approved image, not force the old 512x682 portrait ratio');
      assert.ok(Math.abs(state.height-state.parentHeight)<=3,'No empty space behind the video');
      assert.equal(state.visiblePhoto,true,'Keep the high-resolution original hero visible under the localized motion');
      assert.ok(state.photoWidth>512,'The crisp campaign image must be higher resolution than the overlay video');
      assert.ok(state.mask.includes('6% 23% at 68.5%') && state.mask.includes('11% 7% at 52%'),
        'The narrow syrup mask must not soften package lettering');
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
      const errors=[];
      page.on('pageerror',e=>errors.push(String(e)));
      page.on('request',request=>{
        if(request.url().includes('hero-approved-canva-20261108.mp4'))requests++;
      });
      const response=await page.goto(base+route,{waitUntil:'load'});
      assert.equal(response?.status(),200);
      await page.waitForFunction(()=>Array.from(document.styleSheets).some(s=>s.href?.includes('golden-approved-hero-video-20261108.css')));
      const still=page.locator('.hero-art > img');
      await still.waitFor({state:'visible'});
      assert.ok((await still.getAttribute('src')).includes('golden-1.png?v=20261108-master-hq'),
        'The original PNG must also remain sharp on standalone and embedded phones');
      const video=page.locator('[data-gg-approved-hero-video]');
      if(reducedMotion==='reduce'){
        assert.equal(await video.evaluate(v=>getComputedStyle(v).display),'none');
        assert.equal(await video.getAttribute('src'),null,
          'Reduced-motion phone must keep the high-quality still');
        assert.equal(requests,0);
      } else {
        await video.waitFor({state:'visible'});
        await page.waitForFunction(()=>{
          const v=document.querySelector('[data-gg-approved-hero-video]');
          return v?.videoWidth===512&&v?.videoHeight===682&&v.readyState>=2;
        },null,{timeout:20000});
        const state=await video.evaluate(v=>{
          const i=v.closest('.hero-art').querySelector(':scope > img');
          const outer=v.closest('.hero-art').getBoundingClientRect();
          const rect=v.getBoundingClientRect();
          return {
            src:v.currentSrc,
            naturalWidth:v.videoWidth,naturalHeight:v.videoHeight,
            photoVisible:getComputedStyle(i).display!=='none',
            photoRatio:i.naturalWidth/i.naturalHeight,
            fit:getComputedStyle(v).objectFit,
            videoWidth:rect.width,containerWidth:outer.width,
            videoHeight:rect.height,containerHeight:outer.height,
            eligible:v.closest('.hero-art').hasAttribute('data-gg-mobile-video-eligible')
          };
        });
        assert.ok(state.src.endsWith('/demos/golden-grid/media/hero-approved-canva-20261108.mp4'));
        assert.equal(state.eligible,true,'Standalone phone video must be enabled');
        assert.equal(state.naturalWidth,512);
        assert.equal(state.naturalHeight,682);
        assert.ok(state.containerWidth<=512,'Never upscale the 512px source on phones');
        assert.equal(state.fit,'cover','Fill 4:5 hero edges with only safe vertical-edge crop');
        assert.ok(Math.abs(state.photoRatio-512/682)<.07,'Source aspect must be close enough to preserve product and headline');
        assert.ok(Math.abs(state.videoWidth-state.containerWidth)<2);
        assert.ok(Math.abs(state.videoHeight-state.containerHeight)<2);
        assert.equal(state.photoVisible,true);
        assert.ok(requests>0,'Standalone phone should request the video');
        const preview=await context.newPage();
        const viewerResponse=await preview.goto(base+'/demos/?demo=golden-grid',{waitUntil:'domcontentloaded'});
        assert.equal(viewerResponse?.status(),200);
        const iframe=preview.frameLocator('#viewer-frame');
        await iframe.locator('[data-gg-approved-hero-video]').waitFor({state:'attached'});
        assert.equal(await iframe.locator('[data-gg-approved-hero-video]').getAttribute('src'),null,
          'Embedded phone Studio/library preview must not load video');
        await preview.close();
      }
      assert.deepEqual(errors,[]);
      await context.close();
      console.log('PASS Golden Grid phone motion/fallback',engine.name(),reducedMotion);
    }
    // Intermediate small tablets (521-760 CSS px) retain the sharp photo, not upscaled video.
    {
      const context=await browser.newContext({
        viewport:{width:640,height:900},isMobile:true,hasTouch:true,reducedMotion:'no-preference'
      });
      const page=await context.newPage();
      await page.goto(base+route,{waitUntil:'domcontentloaded'});
      await page.waitForFunction(()=>Array.from(document.styleSheets).some(s=>s.href?.includes('golden-approved-hero-video-20261108.css')));
      assert.equal(await page.locator('[data-gg-approved-hero-video]').getAttribute('src'),null);
      assert.equal(await page.locator('[data-gg-approved-hero-video]').evaluate(v=>getComputedStyle(v).display),'none');
      await context.close();
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
