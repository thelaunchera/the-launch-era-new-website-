import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdirSync} from 'node:fs';
const root='http://127.0.0.1:4187';
const expected={
 en:['website-la-vie-in-pink-en-sharp.png','automated-crm-en-sharp.png','process-choose-en.png','process-brand-en.png','process-build-en.png','process-launch-en.png'],
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
  const route=language==='en'?'/website-for-your-business/':'/es/website-for-your-business/';
  const response=await page.goto(root+route,{waitUntil:'load',timeout:30000});
  assert.equal(response?.status(),200,'Website route did not load: '+language);
  const gallery=page.locator('section.hero.hero-gallery');
  assert.equal(await gallery.count(),1,'Gallery hero missing: '+language);
  const heroPhotos=gallery.locator('.hero-gallery-card img');
  assert.equal(await heroPhotos.count(),7,'Expected seven authentic demo cards: '+language);
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
}finally{await browser.close()}
