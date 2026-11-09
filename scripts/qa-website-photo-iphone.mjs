import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdirSync} from 'node:fs';
const root='http://127.0.0.1:4187';
const expected={
 en:['hero-jaramillo.svg','automated-crm-en-sharp.png','process-choose-en.png','process-brand-en.png','process-build-en.png','process-launch-en.png'],
 es:['website-la-vie-in-pink-original.jpg','automated-crm-original.jpg','process-choose-original.jpg','process-brand-original.jpg','process-build-original.jpg','process-launch-original.jpg']
};
const browser=await chromium.launch({headless:true});
mkdirSync('qa-screenshots',{recursive:true});
try{
 for(const language of ['en','es']){
  const context=await browser.newContext({
   viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:3,
   userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'
  });
  const page=await context.newPage();
  // Selection is an external read-only service. QA must explicitly expose
  // all eleven original demo photo fixtures rather than accidentally failing when
  // the service is unavailable and the public page correctly hides the rail.
  await page.route('**/tle_website_demo_visibility?**',route=>route.fulfill({
   status:200,contentType:'application/json',body:'[]'
  }));
  const route=language==='en'?'/website-for-your-business/':'/es/website-for-your-business/';
  const response=await page.goto(root+route,{waitUntil:'load',timeout:30000});
  assert.equal(response?.status(),200,'Website route did not load: '+language);
  await page.waitForFunction(()=>document.documentElement.dataset.tleDemoStatus==='ready',null,{timeout:12000});
  const gallery=page.locator('section.hero.hero-gallery');
  assert.equal(await gallery.count(),1,'Gallery hero missing: '+language);
  const heroPhotos=gallery.locator('.hero-gallery-card img');
  assert.equal(await heroPhotos.count(),11,'Expected eleven authentic demo cards: '+language);
  for(let i=0;i<11;i++){
   const demo=heroPhotos.nth(i);
   await demo.scrollIntoViewIfNeeded();
   await demo.evaluate(async img=>{ if(!img.complete)await new Promise((ok,fail)=>{img.addEventListener('load',ok,{once:true});img.addEventListener('error',fail,{once:true});}); });
   const valid=await demo.evaluate(img=>img.naturalWidth>100&&img.naturalHeight>100);
   assert(valid,'Gallery card '+(i+1)+' image did not load in '+language);
   const presentation=await demo.evaluate(img=>{
     const card=img.closest('.hero-gallery-card');
     const caption=card?.querySelector('figcaption');
     return {
       fit:getComputedStyle(img).objectFit,
       brand:card?.dataset.demo,
       name:caption?.textContent?.trim(),
       labelBackground:caption?getComputedStyle(caption).backgroundColor:''
     };
   });
   const uncropped=['jaramillo-boutique','sova','la-vie-in-pink'].includes(presentation.brand);
   assert.equal(presentation.fit,uncropped?'contain':'cover','Gallery card '+(i+1)+' must retain approved noncropping where required: '+language);
   assert(presentation.name?.length>1,'Gallery card '+(i+1)+' has no visible project name: '+language);
   assert(presentation.labelBackground !== 'transparent' && presentation.labelBackground !== 'rgba(0, 0, 0, 0)' && presentation.labelBackground !== '',
     'Gallery card '+(i+1)+' name must have a contrast background: '+language);
  }

  assert.equal(await gallery.locator('a[href="#paquetes"]').count(),1,'Primary package CTA missing: '+language);
  const ctaVisible=await gallery.locator('a[href="#paquetes"]').evaluate(el=>{
    const r=el.getBoundingClientRect(); return {top:r.top,bottom:r.bottom,width:r.width,screen:innerHeight};
  });
  assert(ctaVisible.width>=120&&ctaVisible.top>=0&&ctaVisible.bottom<=844,'Primary action not in first iPhone screen: '+JSON.stringify(ctaVisible));
  const galleryScroll=page.locator('.hero-gallery-stage');
  await galleryScroll.evaluate(el=>el.scrollLeft=el.scrollWidth-el.clientWidth);
  assert(await galleryScroll.evaluate(el=>el.scrollLeft)>20,'Gallery not swipe-scrollable on phone');
  const heroOverflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
  assert(heroOverflow<=3,'Gallery causes page horizontal overflow: '+language+' '+heroOverflow);
  await gallery.screenshot({path:'qa-screenshots/website-gallery-'+language+'-iphone.png',timeout:15000});
  const photos=page.locator('.plan-photo,.step-photo');
  assert.equal(await photos.count(),6,'Expected six individual section photos in '+language);
  for(let i=0;i<6;i++){
   const pic=photos.nth(i);
   const src=await pic.getAttribute('src');
   assert(src?.endsWith('/'+expected[language][i]),'Wrong picture '+(i+1)+' on '+language+': '+src);
   await pic.scrollIntoViewIfNeeded();
   await pic.evaluate(async img=>{if(!img.complete)await new Promise((ok,fail)=>{img.addEventListener('load',ok,{once:true});img.addEventListener('error',fail,{once:true})})});
   const state=await pic.evaluate(img=>{
    const r=img.getBoundingClientRect();
    return {naturalWidth:img.naturalWidth,naturalHeight:img.naturalHeight,
      displayedWidth:r.width,right:r.right,left:r.left,viewport:document.documentElement.clientWidth};
   });
   assert(state.naturalWidth>=300 && state.naturalHeight>=190,'Broken or low-resolution image '+src+' '+JSON.stringify(state));
   assert(state.right<=state.viewport+3&&state.left>=-3,'Photo cropped horizontally '+src+' '+JSON.stringify(state));
   console.log('PASS',language,'photo',i+1,expected[language][i],state.naturalWidth+'x'+state.naturalHeight);
  }
  await page.locator('.process').screenshot({path:'qa-screenshots/website-process-'+language+'-iphone.png',timeout:15000});
  console.log('PASS',language,'iPhone-size viewport, six images visible, gallery hero swipeable and original pricing preserved');
  await context.close();
 }
  // Regression for the owner-reported iPad: all and curated galleries must
  // expose the FIRST card at scrollLeft=0 and the LAST card at the far right.
  // The page must still scroll vertically from over the horizontal rail.
  const hiddenSeven=['ivory-and-bloom','casa-brownie','havana-19','soluna-yoga','experience-cleaning','yummm','wok-social'];
  for(const language of ['en','es']){
   for(const curated of [false,true]){
    const context=await browser.newContext({viewport:{width:1024,height:768},isMobile:true,hasTouch:true,deviceScaleFactor:2});
    const page=await context.newPage();
    const hidden=curated?hiddenSeven.map(demo_id=>({demo_id,visible:false})):[];
    await page.route('**/tle_website_demo_visibility?**',route=>route.fulfill({
     status:200,contentType:'application/json',body:JSON.stringify(hidden)
    }));
    const url=language==='en'?'/website-for-your-business/':'/es/website-for-your-business/';
    await page.goto(root+url,{waitUntil:'load',timeout:30000});
    await page.waitForFunction(()=>document.documentElement.dataset.tleDemoStatus==='ready',null,{timeout:12000});
    const stage=page.locator('.hero-gallery-stage');
    const count=await page.locator('.hero-gallery-card:visible').count();
    assert.equal(count,curated?4:11,'Correct curated gallery count on '+language);
    const left=await stage.evaluate(el=>{
     el.style.scrollBehavior='auto';el.scrollLeft=0;
     const first=el.querySelector('.hero-gallery-card:not([hidden])');
     return {scrollWidth:el.scrollWidth,clientWidth:el.clientWidth,firstLeft:first.getBoundingClientRect().left,stageLeft:el.getBoundingClientRect().left,
      touchAction:getComputedStyle(el).touchAction};
    });
    assert(left.scrollWidth>left.clientWidth+100,'iPad gallery must have real swipe distance: '+language+' '+JSON.stringify(left));
    assert(left.firstLeft>=left.stageLeft-4,'First project was clipped before scroll started: '+language+' '+JSON.stringify(left));
    assert.match(left.touchAction,/pan-x/,'Tablet must support native touch panning');
    const right=await stage.evaluate(el=>{
     el.scrollLeft=el.scrollWidth-el.clientWidth;
     const cards=[...el.querySelectorAll('.hero-gallery-card:not([hidden])')];
     return {scrollLeft:el.scrollLeft,lastRight:cards.at(-1).getBoundingClientRect().right,stageRight:el.getBoundingClientRect().right};
    });
    assert(right.scrollLeft>100,'iPad rail cannot reach later projects: '+language);
    assert(right.lastRight<=right.stageRight+4,'Last project is clipped off the far end: '+language+' '+JSON.stringify(right));
    await page.evaluate(()=>window.scrollTo(0,0));
    const y0=await page.evaluate(()=>window.scrollY);
    const r=await stage.boundingBox();
    await page.mouse.move(r.x+r.width/2,r.y+Math.min(r.height/2,Math.max(20,760-r.y-10)));
    await page.mouse.wheel(0,520);
    await page.waitForTimeout(200);
    const y1=await page.evaluate(()=>window.scrollY);
    assert(y1>y0+50,'Vertical page scroll was trapped over portfolio rail: '+language);
    await page.screenshot({path:'qa-screenshots/website-gallery-'+language+'-tablet-'+(curated?'curated':'full')+'.png',fullPage:false});
    console.log('PASS',language,curated?'4 curated':'11 projects','iPad rail first/last reachability + vertical scroll');
    await context.close();
   }
  }
}finally{await browser.close()}
