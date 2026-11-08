/** Golden Grid hero: 512px video only on standalone phones, approved photo
 *  stays sharp and entirely static on iPad; desktop-only optional syrup glint. */
import { chromium, webkit } from 'playwright';
import assert from 'node:assert/strict';

const base=(process.env.QA_URL||'http://127.0.0.1:4191').replace(/\/$/,'');
for(const engine of [chromium,webkit]){
  const browser=await engine.launch({headless:true});
  try{
    for(const [name,width,height,isMobile,reducedMotion] of [
      ['phone',390,844,true,'no-preference'],
      ['phone-reduced',390,844,true,'reduce'],
      ['tablet-portrait',820,1180,true,'no-preference'],
      ['tablet-landscape',1180,820,true,'no-preference'],
      ['tablet-pro-landscape',1366,1024,true,'no-preference'],
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
          videoSrc:el.querySelector('video')?.getAttribute('src'),
          videoDisplay:el.querySelector('video')?getComputedStyle(el.querySelector('video')).display:'missing',
          videoPhoneEligible:el.hasAttribute('data-gg-mobile-video-eligible'),
          svgCount:el.querySelectorAll('svg.gg-hero-motion').length,
          svgDisplay:svgStyle?.display,
          shineAnimation:shine?getComputedStyle(shine).animationName:'',
          active:el.hasAttribute('data-gg-sheen-active'),
          bodyOverflow:document.documentElement.scrollWidth>innerWidth+2
        };
      });
      assert.deepEqual(details.natural,[1122,1402],'Approved high-resolution original must remain');
      assert.equal(details.videoCount,1,'Preserve approved standalone-phone motion');
      if(width>520||reducedMotion==='reduce'){
        assert.equal(lowRes.length,0,'Tablet/desktop/reduced motion must never request low-res MP4');
        assert.equal(details.videoSrc,null,'Forbidden media source must not attach');
        assert.equal(details.videoDisplay,'none','Low-res movie must stay hidden');
      }else{
        assert.equal(details.videoPhoneEligible,true,'Standalone phone keeps native-scale video option');
      }
      assert.equal(details.svgCount,1,'Localized syrup glint should exist');
      console.log('GOLDEN HERO GEOMETRY',engine.name(),name,JSON.stringify(details));
      if(width>520)assert.ok(Math.abs(details.frameWidth-details.photoWidth)<2,'Photo fills tablet/desktop hero width exactly');
      if(width>520)assert.ok(Math.abs(details.frameHeight-details.photoHeight)<2,'Tablet/desktop hero must not crop photo vertically');
      assert.equal(details.photoDisplay,'block');
      assert.equal(details.photoTransform,'none','Do not zoom or blur headline/product');
      assert.equal(details.photoFilter,'none');
      assert.equal(details.photoOpacity,'1');
      assert.equal(details.bodyOverflow,false,'No horizontal overflow');
      if(name==='desktop'&&reducedMotion==='no-preference'){
        assert.equal(details.svgDisplay,'block','Fine-pointer desktop may keep syrup shine');
        assert.equal(details.active,true,'Desktop syrup shine is opt-in visual enhancement');
        assert.equal(details.shineAnimation,'ggSyrupLight');
      }else{
        assert.equal(details.svgDisplay,'none','Tablet portrait, tablet landscape, phone and reduced-motion must be static');
        assert.equal(details.shineAnimation,'none','No shimmer may animate on iPad/tablet');
        assert.equal(details.active,false,'Tablet must not receive animated shimmer');
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
