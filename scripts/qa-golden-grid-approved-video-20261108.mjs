/** Golden Grid hero: no low-resolution video on any viewport, approved photo
 *  stays sharp; only nonessential syrup glint animates on larger screens. */
import { chromium, webkit } from 'playwright';
import assert from 'node:assert/strict';

const base=(process.env.QA_URL||'http://127.0.0.1:4191').replace(/\/$/,'');
for(const engine of [chromium,webkit]){
  const browser=await engine.launch({headless:true});
  try{
    for(const [name,width,height,isMobile,reducedMotion] of [
      ['phone',390,844,true,'no-preference'],
      ['phone-reduced',390,844,true,'reduce'],
      ['tablet',820,1180,true,'no-preference'],
      ['tablet-reduced',820,1180,true,'reduce'],
      ['desktop',1440,900,false,'no-preference'],
      ['desktop-reduced',1440,900,false,'reduce']
    ]){
      const context=await browser.newContext({
        viewport:{width,height},isMobile,hasTouch:isMobile,reducedMotion
      });
      const page=await context.newPage();
      const errors=[];
      const lowRes=[];
      page.on('pageerror',e=>errors.push(String(e)));
      page.on('request',req=>{
        if(req.url().includes('hero-approved-canva-20261108.mp4'))lowRes.push(req.url());
      });
      const response=await page.goto(base+'/demos/golden-grid/',{waitUntil:'domcontentloaded'});
      assert.equal(response?.status(),200);
      const hero=page.locator('.hero .hero-art');
      const image=hero.locator(':scope > img');
      await image.waitFor({state:'visible'});
      await page.waitForFunction(()=>{
        const photo=document.querySelector('.hero .hero-art > img');
        return photo?.complete&&photo.naturalWidth>=1122&&photo.naturalHeight>=1402;
      });
      await page.waitForFunction(()=>Array.from(document.styleSheets)
        .some(s=>s.href?.includes('golden-approved-hero-video-20261108.css?v=3')));
      await page.waitForTimeout(300);
      const details=await hero.evaluate(el=>{
        const img=el.querySelector(':scope > img');
        const svg=el.querySelector(':scope > svg.gg-hero-motion');
        const shine=svg?.querySelector('.gg-syrup-glint');
        const imgStyle=getComputedStyle(img);
        const svgStyle=svg&&getComputedStyle(svg);
        const photoRect=img.getBoundingClientRect();
        const frameRect=el.getBoundingClientRect();
        return {
          natural:[img.naturalWidth,img.naturalHeight],
          photoWidth:photoRect.width,frameWidth:frameRect.width,
          photoHeight:photoRect.height,frameHeight:frameRect.height,
          photoDisplay:imgStyle.display,photoTransform:imgStyle.transform,
          photoFilter:imgStyle.filter,photoOpacity:imgStyle.opacity,
          videoCount:el.querySelectorAll('video').length,
          svgCount:el.querySelectorAll('svg.gg-hero-motion').length,
          svgDisplay:svgStyle?.display,
          shineAnimation:shine?getComputedStyle(shine).animationName:'',
          active:el.hasAttribute('data-gg-sheen-active'),
          bodyOverflow:document.documentElement.scrollWidth>innerWidth+2
        };
      });
      assert.deepEqual(details.natural,[1122,1402],'Approved high-resolution original must remain');
      assert.equal(details.videoCount,0,'Remove the old video element entirely');
      assert.equal(lowRes.length,0,'Never request 512px MP4');
      assert.equal(details.svgCount,1,'Localized syrup glint should exist');
      assert.ok(Math.abs(details.frameWidth-details.photoWidth)<2,'Photo fills hero width exactly');
      assert.ok(Math.abs(details.frameHeight-details.photoHeight)<2,'Hero does not crop photo vertically');
      assert.equal(details.photoDisplay,'block');
      assert.equal(details.photoTransform,'none','Do not zoom or blur headline/product');
      assert.equal(details.photoFilter,'none');
      assert.equal(details.photoOpacity,'1');
      assert.equal(details.bodyOverflow,false,'No horizontal overflow');
      if(width>760&&reducedMotion==='no-preference'){
        assert.equal(details.svgDisplay,'block');
        assert.equal(details.active,true,'Visible desktop/tablet activates localized syrup effect');
        assert.equal(details.shineAnimation,'ggSyrupLight');
      }else{
        assert.equal(details.svgDisplay,'none','Phone and reduced-motion retain stable still');
        assert.equal(details.shineAnimation,'none');
      }
      assert.deepEqual(errors,[],'No page script errors');
      console.log('PASS Golden Grid sharp photo',engine.name(),name,
        JSON.stringify({natural:details.natural,videoCount:details.videoCount,svg:details.svgDisplay}));
      await context.close();
    }
  }finally{
    await browser.close();
  }
}
