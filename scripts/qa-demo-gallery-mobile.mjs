import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {chromium,devices} from 'playwright';

const url=(process.env.QA_URL||'http://127.0.0.1:4173').replace(/\/$/,'')+'/demos/';
const folder='qa-screenshots/demo-gallery';
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({...devices['iPhone 13'],locale:'en-US',reducedMotion:'reduce'});
const page=await context.newPage();

async function checkImage(slug){
 const card=page.locator('.demo-card[data-brand="'+slug+'"]');
 await card.scrollIntoViewIfNeeded();
 await page.waitForFunction(slug=>{
  const img=document.querySelector('.demo-card[data-brand="'+slug+'"] .demo-art img');
  return !!img&&img.complete&&img.naturalWidth>0&&img.naturalHeight>0;
 },slug,{timeout:25000});
 const img=await card.locator('.demo-art img').evaluate(el=>({src:el.currentSrc,width:el.naturalWidth,height:el.naturalHeight,fit:getComputedStyle(el).objectFit}));
 console.log('[PHOTO]',slug,JSON.stringify(img));
 await card.screenshot({path:folder+'/'+slug+'.png'});
 return img;
}

async function checkOpenAndClose(slug,expected){
 const card=page.locator('.demo-card[data-brand="'+slug+'"]');
 const url=await card.getAttribute('data-demo-url');
 await card.locator('.card-preview-link').click();
 const modal=page.locator('#demo-viewer');
 await page.waitForFunction(()=>document.querySelector('#demo-viewer')?.open===true,null,{timeout:5000});
 assert.equal(await page.locator('#viewer-frame').getAttribute('src'),url,'Iframe should display chosen project');
 assert.equal(await page.locator('#viewer-close').isVisible(),true,'Close demo must stay visible');
 assert.equal(await page.locator('#viewer-external').isVisible(),true,'Open full site must remain available on mobile');
 const frame=page.frameLocator('#viewer-frame');
 await frame.locator('main').first().waitFor({state:'visible',timeout:25000});
 const bodyText=await frame.locator('body').innerText({timeout:15000});
 assert.ok(bodyText.toLowerCase().includes(expected.toLowerCase()),'Preview should contain its correct brand: '+slug);
 assert.equal(await page.locator('#viewer-loading-direct').getAttribute('href'),url,'Loading fallback must open the exact original demo URL');
 await page.locator('#viewer-stage.is-ready').waitFor({state:'attached',timeout:30000});
 assert.equal(await page.locator('#viewer-stage').getAttribute('aria-busy'),'false','Preview should finish its loading state');
 await page.screenshot({path:folder+'/'+slug+'-open.png'});
 await page.locator('#viewer-close').click();
 assert.equal(await modal.evaluate(el=>el.open),false,'Close demo must return to gallery');
 assert.equal(await card.isVisible(),true,'Original gallery card must remain visible on return');
 console.log('[OPEN+CLOSE]',slug,'OK');
}

try{
 await mkdir(folder,{recursive:true});
 const response=await page.goto(url,{waitUntil:'domcontentloaded',timeout:35000});
 assert.equal(response?.status(),200,'Gallery must return 200, not a 404');
 assert.equal(await page.locator('.demo-card').count(),16,'Gallery must contain exactly 16 original concepts');

 // Visual-depth regression — inspect computed presentation, not only source.
 const galleryCardDepth=await page.locator('.demo-card').first().evaluate(el=>{
  const css=getComputedStyle(el);
  return {shadow:css.boxShadow,radius:parseFloat(css.borderTopLeftRadius),width:el.getBoundingClientRect().width};
 });
 assert.ok(galleryCardDepth.shadow!=='none'&&galleryCardDepth.shadow.includes('rgba'),
   'Portfolio card must have a visibly layered shadow');
 assert.ok(galleryCardDepth.radius>=18,'Portfolio cards need a soft physical frame');
 const depthPage=await context.newPage();
 try{
  await depthPage.goto(new URL('/demos/owner-center/?demo=golden-grid&lang=es',url).href,{waitUntil:'domcontentloaded'});
  await depthPage.locator('#mobile-nav [data-view="catalog"]').click();
  await depthPage.locator('.product-card').first().waitFor({state:'visible'});
  const productDepth=await depthPage.locator('.product-card').first().evaluate(el=>({
   shadow:getComputedStyle(el).boxShadow,
   radius:parseFloat(getComputedStyle(el).borderTopLeftRadius),
   width:el.getBoundingClientRect().width
  }));
  assert.ok(productDepth.shadow!=='none'&&productDepth.radius>=20,
   'Owner menu cards need realistic depth and rounding');
  assert.ok(productDepth.width<=390,'Owner product cards must fit the phone viewport');
  await depthPage.screenshot({path:folder+'/iPhone-owner-deep-product-cards.png'});
  await depthPage.locator('#mobile-nav [data-view="preview"]').click();
  const phoneShadow=await depthPage.locator('#large-preview .phone').evaluate(el=>getComputedStyle(el).boxShadow);
  assert.notEqual(phoneShadow,'none','Customer phone preview needs its device frame shadow');
  const ownerOverflow=await depthPage.evaluate(()=>({scroll:document.documentElement.scrollWidth,width:innerWidth}));
  assert.ok(ownerOverflow.scroll<=ownerOverflow.width+2,'Owner depth layer must not overflow iPhone '+JSON.stringify(ownerOverflow));
  await depthPage.screenshot({path:folder+'/iPhone-owner-deep-phone-preview.png'});
  await depthPage.goto(new URL('/es/website-for-your-business/',url).href,{waitUntil:'domcontentloaded'});
  const marketingShadows=await depthPage.locator('.owner-admin-visual').evaluate(el=>getComputedStyle(el).boxShadow);
  assert.notEqual(marketingShadows,'none','Spanish homepage presentation must be elevated');
  console.log('[CARD DEPTH] gallery, owner catalog, phone preview and Spanish showcase OK');
 }finally{await depthPage.close()}

 assert.equal(await page.locator('.card-preview-link').count(),16,'Every photo card needs a preview link');

 // Golden Grid must not open a heavy nested iframe that can lock the mobile
 // Studio preview or leave the entire gallery under a stuck modal.
 const goldenCard=page.locator('.demo-card[data-brand="golden-grid"]');
 const goldenLink=goldenCard.locator('.card-preview-link');
 assert.equal(await goldenLink.getAttribute('target'),'_blank','Golden Grid opens independently of the Studio/library preview');
 assert.match(await goldenLink.getAttribute('rel'),/noopener/,'Golden Grid must not retain an opener window');
 await goldenCard.scrollIntoViewIfNeeded();
 const goldenPopupEvent=page.waitForEvent('popup',{timeout:12000});
 await goldenLink.click();
 const goldenPopup=await goldenPopupEvent;
 await goldenPopup.waitForLoadState('domcontentloaded',{timeout:25000});
 assert.match(goldenPopup.url(),/\\/demos\\/golden-grid\\//,'Golden Grid should open its actual original demo');
 assert.equal(await goldenPopup.locator('body').isVisible(),true,'Golden Grid independent page must render');
 await goldenPopup.close();
 assert.equal(await page.locator('#demo-viewer').evaluate(el=>el.open),false,'Golden Grid must not lock the gallery in a dialog');
 assert.equal(await page.evaluate(()=>document.body.style.overflow),'','Golden Grid must not lock page scrolling');
 await page.goto(new URL('/demos/?demo=golden-grid',url).href,{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>document.querySelector('.demo-card[data-brand="golden-grid"]')?.classList.contains('golden-direct-target'),null,{timeout:10000});
 assert.equal(await page.locator('#demo-viewer').evaluate(el=>el.open),false,'Deep-link entry must not automatically lock Golden Grid in an iframe');
 await page.goto(url,{waitUntil:'domcontentloaded'});
 console.log('[GOLDEN GRID SAFE OPEN] dedicated tab, no gallery scroll lock, no automatic mobile embed');
 assert.equal(await page.locator('.demo-links .view').count(),16,'Every card needs a public demo website link');
 assert.equal(await page.locator('.demo-links .source, a[href*="github.com"]').count(),0,'Never expose code/source repository links in the public library');
 assert.equal(await page.locator('#viewer-close').count(),1);
 const legalPaths=['/privacy.html','/terms.html','/cookies.html','/refunds.html','/privacy-choices.html'];
 assert.equal(await page.locator('.library-footer-legal a').count(),legalPaths.length,'Library must show five legal policy links');
 for(const path of legalPaths){
   assert.equal(await page.locator('.library-footer-legal a[href="'+path+'"]').count(),1,'Legal link missing: '+path);
   const legalResponse=await page.request.get(new URL(path,url).href);
   assert.equal(legalResponse.status(),200,'Legal policy URL must exist: '+path);
 }
 assert.equal(await page.locator('.library-footer-bottom').getByText('Powered by The Launch Era').count(),1,'TLE attribution must be visible');
 const retiredHero=await page.request.get(new URL('/demos/crumb/assets/CRUMB_Storefront_Hero_Blue.png',url).href);
 assert.equal(retiredHero.status(),404,'The banned historical CRUMB photo must not be present in the published file set');

 const heroOrder=await page.evaluate(()=>{
   const photo=document.querySelector('.hero-gallery');
   const copy=document.querySelector('.intro-bottom');
   const corners=[photo.querySelector('.hero-photo'),photo.querySelector('.hero-small'),document.querySelector('.demo-card .demo-art')]
      .map(el=>parseFloat(getComputedStyle(el).borderTopLeftRadius));
   return {photoBottom:photo.getBoundingClientRect().bottom,copyTop:copy.getBoundingClientRect().top,corners};
 });
 assert.ok(heroOrder.photoBottom < heroOrder.copyTop+3,'Mobile hero photography should appear before body description: '+JSON.stringify(heroOrder));
 assert.ok(heroOrder.corners.every(radius=>radius>=16),'Hero and demo images must have soft rounded corners: '+JSON.stringify(heroOrder));
 console.log('[EDITORIAL HERO]',JSON.stringify(heroOrder));
 const horizontal=await page.evaluate(()=>({scrollWidth:document.documentElement.scrollWidth,innerWidth:window.innerWidth}));
 assert.ok(horizontal.scrollWidth<=horizontal.innerWidth+2,'Mobile page overflow: '+JSON.stringify(horizontal));
 console.log('[MOBILE WIDTH]',JSON.stringify(horizontal));
 await page.screenshot({path:folder+'/iPhone-hero.png'});
 const sovaPhoto=await checkImage('sova');
 assert.ok(new URL(sovaPhoto.src).pathname.endsWith('/01-hero.png'),'SOVA library must show the official homepage hero, not a campaign photo');
 await checkImage('la-vie-in-pink');
 await checkOpenAndClose('la-vie-in-pink','La vie in pink');
 await checkImage('jaramillo-boutique');
 await checkOpenAndClose('jaramillo-boutique','Jaramillo');

 // CRUMB must use the image actually approved for its live hero, never an old gallery-only storefront.
 const crumbThumb=await checkImage('crumb');
 assert.ok(new URL(crumbThumb.src).pathname.endsWith('/CRUMB_Storefront_Approved_20261030.webp'),'CRUMB library must use the documented approved original hero');
 const crumbHero=await page.evaluate(async()=>{
  const r=await fetch('/demos/crumb/');
  const markup=await r.text();
  const doc=new DOMParser().parseFromString(markup,'text/html');
  const img=doc.querySelector('.hero picture img');
  return img?new URL(img.getAttribute('src'),r.url).pathname:null;
 });
 assert.equal(new URL(crumbThumb.src).pathname,crumbHero,'CRUMB card photo must match the current live hero image');
 await checkOpenAndClose('crumb','CRUMB');

 const food=page.locator('.filter[data-filter="Food & Drink"]');
 await food.click();
 assert.equal(await page.locator('.demo-card:visible').count(),9,'Category filter must show 9 Food & Drink demos');
 await page.locator('.filter[data-filter="All"]').click();
 assert.equal(await page.locator('.demo-card:visible').count(),16,'Reset filter must show all');

 // Every English and Spanish hero card must lead to exactly its own library demo.
 // Umbral was renamed Havana 19 and must never be displayed as a second card.
 const heroSlugs=['ivory-and-bloom','casa-brownie','crumb','la-vie-in-pink','jaramillo-boutique','havana-19','sova'];
 for(const [locale,chosen] of [
  ['/website-for-your-business/','la-vie-in-pink'],
  ['/es/website-for-your-business/','jaramillo-boutique']
 ]){
  const route=new URL(locale,url);
  const r=await page.goto(route.href,{waitUntil:'domcontentloaded',timeout:35000});
  assert.equal(r?.status(),200,'Bilingual website route must serve a page');
  const items=page.locator('.hero-gallery-card');
  assert.equal(await items.count(),7,'Show seven unique website concepts');
  const found=await items.evaluateAll(nodes=>nodes.map(n=>n.getAttribute('data-demo')));
  assert.deepEqual(found,heroSlugs,'Gallery brands must be unique and never include Umbral');
  for(const slug of heroSlugs){
   const hit=page.locator('.hero-gallery-card[data-demo="'+slug+'"] .hero-gallery-hit');
   assert.equal(await hit.getAttribute('href'),'/demos/?demo='+slug+'&returnTo='+encodeURIComponent(locale)+(locale.startsWith('/es/')?'&lang=es':''),'Photo must link to exact library demo, retain Spanish locale and original website');
  }
  const hit=page.locator('.hero-gallery-card[data-demo="'+chosen+'"] .hero-gallery-hit');
  await hit.click();
  await page.waitForURL(new RegExp('/demos/\\?demo='+chosen),{timeout:20000});
  await page.waitForFunction(()=>document.querySelector('#demo-viewer')?.open===true,null,{timeout:20000});
  assert.equal(await page.locator('#viewer-frame').getAttribute('src'),chosen==='jaramillo-boutique'?'https://thelaunchera.github.io/demo-booking-landing-/jaramillo-boutique/':'https://thelaunchera.com/demos/la-vie-in-pink/');
  assert.equal(await page.locator('#viewer-close').isVisible(),true);
  await page.screenshot({path:folder+'/website-'+(locale.startsWith('/es/')?'es':'en')+'-direct-demo.png'});
  await page.locator('#viewer-close').click();
  await page.waitForURL(u=>u.pathname===locale&&u.hash==='#inicio',{timeout:20000});
  assert.equal(await page.locator('.hero-gallery-card[data-demo="'+chosen+'"]').count(),1,'Closing must return to the original website gallery');
  console.log('[WEBSITE RETURN]',locale,chosen,'OK');
 }
 // Old links using Umbral must still resolve to the single canonical Havana 19 demo.
 await page.goto(new URL('/demos/?demo=umbral',url).href,{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>document.querySelector('#demo-viewer')?.open===true,null,{timeout:20000});
 assert.equal(await page.locator('#viewer-frame').getAttribute('src'),'https://thelaunchera.com/demos/havana-19/');
 await page.locator('#viewer-close').click();
 console.log('[ALIAS] Umbral -> Havana 19 OK');
 // Entering directly from the public gallery must keep users in the gallery.
 await page.waitForFunction(()=>!new URL(location.href).searchParams.has('demo'),null,{timeout:5000});
 assert.equal(new URL(page.url()).pathname,'/demos/','Standalone demo preview must close within the demo library');
 console.log('[LIBRARY RETURN] standalone visitors remain in library');

 // Motion-enabled mobile context verifies progressive enhancement; reduced-motion gallery above remains fully readable.
 const motionContext=await browser.newContext({...devices['iPhone 13'],locale:'en-US',reducedMotion:'no-preference'});
 try{
   const motionPage=await motionContext.newPage();
   await motionPage.goto(url,{waitUntil:'domcontentloaded',timeout:35000});
   assert.equal(await motionPage.locator('html.gallery-motion-ready').count(),1,'Scroll effects should initialize for motion-enabled users');
   const motionCard=motionPage.locator('.demo-card[data-brand="sova"]');
   await motionCard.scrollIntoViewIfNeeded();
   await motionPage.waitForFunction(()=>document.querySelector('.demo-card[data-brand="sova"]')?.classList.contains('is-inview'),null,{timeout:8000});
   const noOverflow=await motionPage.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+2);
   assert.ok(noOverflow,'Scroll effects must not create horizontal overflow');
   await motionPage.screenshot({path:folder+'/iPhone-gallery-scroll.png'});
   console.log('[SCROLL MOTION] reveal + no horizontal overflow OK');

   // Mobile demo hero art: photo comes before the copy; the original CSS animation remains active.
   const photoFirstDemos=[
     {slug:'sova',visual:'.hero .hero-media',copy:'.hero .hero-copy',image:'.hero .hero-media img',motion:'.hero h1'},
     {slug:'golden-grid',visual:'.hero .hero-art',copy:'.hero .hero-copy',image:'.hero .hero-art img',motion:'.hero .hero-art img'},
     {slug:'la-vie-in-pink',visual:'.hero .hero-image-wrap',copy:'.hero .hero-content',image:'.hero .hero-image',motion:'.hero .hero-image'},
     {slug:'marea-wigs-miami',visual:'.hero .hero-visual',copy:'.hero .hero-copy',image:'.hero .hero-visual>img',motion:'.hero .hero-visual>img'},
     {slug:'lavender-edit',visual:'.hero .hero-art',copy:'.hero .hero-copy',image:'.hero .hero-art img',motion:'.hero .hero-art img'}
   ];
   for(const demo of photoFirstDemos){
     const address=new URL('/demos/'+demo.slug+'/',url).href;
     const response=await motionPage.goto(address,{waitUntil:'domcontentloaded',timeout:35000});
     assert.equal(response?.status(),200,'Hero page must return 200: '+demo.slug);
     await motionPage.locator(demo.visual).waitFor({state:'visible',timeout:25000});
     await motionPage.locator(demo.image).waitFor({state:'visible',timeout:25000});
     await motionPage.waitForFunction(sel=>{
       const img=document.querySelector(sel);
       return img&&img.complete&&img.naturalWidth>0;
     },demo.image,{timeout:25000});
     const result=await motionPage.evaluate(d=>{
       const visual=document.querySelector(d.visual),copy=document.querySelector(d.copy);
       const img=document.querySelector(d.image),moving=document.querySelector(d.motion);
       const v=visual.getBoundingClientRect(),c=copy.getBoundingClientRect();
       return {
         photoTop:v.top,photoBottom:v.bottom,copyTop:c.top,
         photoHeight:v.height,photoWidth:v.width,
         motion:getComputedStyle(moving).animationName,
         naturalWidth:img.naturalWidth,
         scrollWidth:document.documentElement.scrollWidth,
         viewport:innerWidth, viewportHeight:innerHeight
       };
     },demo);
     assert.ok(result.photoTop+8<result.copyTop,'Mobile hero photo must precede copy: '+demo.slug+' '+JSON.stringify(result));
     assert.ok(result.photoHeight>220,'Mobile hero photo must be prominent: '+demo.slug+' '+JSON.stringify(result));
     assert.ok(result.photoTop<result.viewportHeight,'Hero photo must appear upon entry: '+demo.slug);
     assert.ok(result.scrollWidth<=result.viewport+2,'No horizontal overflow: '+demo.slug+' '+JSON.stringify(result));
     assert.ok(result.motion!=='none'&&result.motion.length>0,'Original hero reveal animation must remain: '+demo.slug+' '+JSON.stringify(result));
     // Capture the settled design, not a half-transparent reveal frame.
     await motionPage.waitForTimeout(1200);
     const readableHeading=await motionPage.locator('.hero h1, .hero h2').first().evaluate(el=>({
       opacity:Number(getComputedStyle(el).opacity),
       visibility:getComputedStyle(el).visibility,
       height:el.getBoundingClientRect().height
     }));
     assert.ok(readableHeading.opacity>.97&&readableHeading.visibility==='visible'&&readableHeading.height>20,
       'Hero headline must be readable after its existing animation: '+demo.slug+' '+JSON.stringify(readableHeading));
     await motionPage.screenshot({path:folder+'/hero-first-'+demo.slug+'-iPhone.png'});
     console.log('[PHOTO FIRST + MOTION]',demo.slug,JSON.stringify(result));
   }

 }finally{await motionContext.close()}


 console.log('[PASS] Bilingual demo-to-website return and standalone library-close, plus 16 cards, hero images and mobile scroll.');
} finally{
 await browser.close();
}
