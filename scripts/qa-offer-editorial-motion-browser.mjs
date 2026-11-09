/* Render/interaction regression for editorial offer animations. */
import assert from 'node:assert/strict';
import {chromium,devices} from 'playwright';
import {mkdir} from 'node:fs/promises';
const base=(process.env.QA_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const browser=await chromium.launch({headless:true});
const folder='qa-screenshots/offer-motion';
await mkdir(folder,{recursive:true});
try{
 for(const lang of ['en','es']){
  const locale=lang==='es'?'es-US':'en-US';
  const route=lang==='es'?'/es/website-for-your-business/':'/website-for-your-business/';
  const context=await browser.newContext({...devices['iPhone 13'],locale,reducedMotion:'no-preference'});
  const page=await context.newPage();
  try{
   const response=await page.goto(base+route,{waitUntil:'domcontentloaded',timeout:35000});
   assert.equal(response?.status(),200,'Homepage must resolve '+lang);
   await page.waitForFunction(()=>document.documentElement.classList.contains('tle-offer-motion'));
   assert.equal(await page.locator('.hero-gallery-card').count(),11,'Keep eleven actual demo hero cards');
   // The live Jaramillo fashion film and the approved SOVA photo must never
   // be stretched or cropped in the portfolio card.
   const framing=await page.evaluate(()=>{
    const j=document.querySelector('.hero-gallery-card[data-demo="jaramillo-boutique"]');
    const s=document.querySelector('.hero-gallery-card[data-demo="sova"]');
    const video=j?.querySelector('video.hero-gallery-motion');
    return {
     sovaSrc:s?.querySelector('img')?.getAttribute('src'),
     sovaFit:s?getComputedStyle(s.querySelector('img')).objectFit:'',
     jaramilloSrc:video?.dataset.motionSrc,
     jaramilloPoster:video?.getAttribute('poster'),
     jaramilloVideoFit:video?getComputedStyle(video).objectFit:'',
     jaramilloPhotoFit:j?getComputedStyle(j.querySelector('img')).objectFit:''
    };
   });
   assert.equal(framing.sovaSrc,'/demos/sova/media/sova-hero-seamless-cobalt-20261108.png','SOVA must show the latest approved hero photograph '+lang);
   assert.equal(framing.sovaFit,'contain','SOVA must keep its full photograph in the gallery '+lang);
   assert.ok(framing.jaramilloSrc?.endsWith('/jaramillo-boutique/media/hero-motion-20261108.mp4'),'Jaramillo uses its original motion asset '+lang);
   assert.ok(framing.jaramilloPoster?.endsWith('/jaramillo-boutique/assets/noche.webp'),'Jaramillo uses the original video poster '+lang);
   assert.equal(framing.jaramilloPhotoFit,'contain','Jaramillo fallback must never crop the face '+lang);
   assert.equal(framing.jaramilloVideoFit,'contain','Jaramillo video must never crop the face '+lang);



   assert.equal(await page.locator('.pricing .plan').count(),2,'Keep only two packages');
   assert.equal(await page.locator('.process .step').count(),4,'Keep four steps');
   const doc=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,viewport:innerWidth}));
   assert.ok(doc.scroll<=doc.viewport+2,'No horizontal overflow on iPhone '+lang+': '+JSON.stringify(doc));
   const heroAnimation=await page.locator('.hero-gallery h1').evaluate(el=>getComputedStyle(el).animationName);
   assert.ok(heroAnimation.includes('tle-offer-headline'),'Hero must reveal title in '+lang);
   await page.waitForTimeout(1300);
   const legible=await page.locator('.hero-gallery h1').evaluate(el=>({opacity:Number(getComputedStyle(el).opacity),height:el.getBoundingClientRect().height}));
   assert.ok(legible.opacity>.99&&legible.height>45,'Hero text settled and readable '+lang);

   const headlineBounds=await page.locator('.hero-gallery h1').evaluate(el=>{
    const r=el.getBoundingClientRect(),copy=el.closest('.hero-gallery-copy')?.getBoundingClientRect();
    return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,scrollWidth:el.scrollWidth,clientWidth:el.clientWidth,scrollHeight:el.scrollHeight,clientHeight:el.clientHeight,copyBottom:copy?.bottom};
   });
   assert.ok(headlineBounds.left>=-2&&headlineBounds.right<=390+2,
    'Headline must stay inside iPhone viewport '+lang+' '+JSON.stringify(headlineBounds));
   assert.ok(headlineBounds.scrollWidth<=headlineBounds.clientWidth+3&&headlineBounds.scrollHeight<=headlineBounds.clientHeight+4,
    'Bilingual headline may wrap but must never clip '+lang+' '+JSON.stringify(headlineBounds));
   const heroBtn=page.locator('.hero-gallery .hero-gallery-copy a[href="#paquetes"]');
   assert.equal(await heroBtn.isVisible(),true,'Hero must keep its single package CTA '+lang);

   await page.screenshot({path:folder+'/'+lang+'-hero-iphone.png'});
   const owner=page.locator('#owner-experience');
   await owner.scrollIntoViewIfNeeded();
   await page.waitForFunction(()=>document.querySelector('#owner-experience')?.classList.contains('tle-offer-visible'),null,{timeout:10000});
   await page.waitForTimeout(1850);
   const layer=await page.locator('.owner-admin-visual').evaluate(el=>({animation:getComputedStyle(el).animationName,opacity:Number(getComputedStyle(el).opacity)}));
   assert.ok(layer.animation.includes('tle-offer-panel-in')&&layer.opacity>.96,'Owner view settles correctly '+lang);
   await page.screenshot({path:folder+'/'+lang+'-owner-showcase-iphone.png'});
   await page.locator('#website-plus').scrollIntoViewIfNeeded();
   await page.waitForFunction(()=>document.querySelector('#website-plus')?.classList.contains('tle-offer-visible'),null,{timeout:10000});
   await page.waitForFunction(()=>Number(getComputedStyle(document.querySelector('#website-plus')).opacity)>.96,null,{timeout:5000});
   const priceCard=await page.locator('#website-plus').evaluate(el=>({opacity:Number(getComputedStyle(el).opacity),shadow:getComputedStyle(el).boxShadow}));
   assert.ok(priceCard.opacity>.96&&priceCard.shadow!=='none','Pricing becomes visible and dimensional '+lang);
   assert.equal(await page.locator('#website-basic a[href^="/website-checkout/"]').getAttribute('href'),'/website-checkout/?offer=website-basic&lang='+lang,'Checkout basic intact');
   assert.equal(await page.locator('#website-plus a[href^="/website-checkout/"]').getAttribute('href'),'/website-checkout/?offer=website-plus&lang='+lang,'Checkout advanced intact');
   await page.screenshot({path:folder+'/'+lang+'-pricing-iphone.png'});
   await page.locator('.faq details').first().scrollIntoViewIfNeeded();
   await page.locator('.faq details summary').first().click();
   assert.equal(await page.locator('.faq details').first().evaluate(el=>el.open),true,'FAQ continues working '+lang);
   await page.locator('.faq details summary').first().click();
   assert.equal(await page.locator('.faq details').first().evaluate(el=>el.open),false,'FAQ can close '+lang);
   const after=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,viewport:innerWidth}));
   assert.ok(after.scroll<=after.viewport+2,'No mobile overflow after reveals '+lang);
   console.log('PASS: '+lang+' iPhone hero, layered owner, pricing, FAQ, checkout links, zero overflow');
  }finally{await context.close()}
 }
 const reduced=await browser.newContext({...devices['iPhone 13'],reducedMotion:'reduce'});
 const rp=await reduced.newPage();
 try{
  await rp.goto(base+'/es/website-for-your-business/',{waitUntil:'domcontentloaded'});
  await rp.waitForTimeout(150);
  assert.equal(await rp.evaluate(()=>document.documentElement.classList.contains('tle-offer-motion')),false,'Motion opt-out must be respected');
  assert.equal(await rp.locator('.hero-gallery h1').evaluate(el=>getComputedStyle(el).animationName),'none','Hero animation disabled in reduce mode');
  await rp.locator('.pricing .plan').first().scrollIntoViewIfNeeded();
  const visibility=await rp.locator('.pricing .plan').first().evaluate(el=>Number(getComputedStyle(el).opacity));
  assert.equal(visibility,1,'Reduced-motion pricing visible immediately');
  console.log('PASS: iPhone reduced-motion accessibility');
 }finally{await reduced.close()}
 // Owner-reported 2026-11-08 iPad layout: mock visible selection to ensure
 // hidden projects never keep their old fixed seven-card flex allocation.
 for(const lang of ['en','es']){
  const route=lang==='es'?'/es/website-for-your-business/':'/website-for-your-business/';
  for(const width of [768,820,1024]){
   const context=await browser.newContext({viewport:{width,height:1100},locale:lang==='es'?'es-US':'en-US',reducedMotion:'reduce'});
   const page=await context.newPage();
   try{
    await page.route('**/tle_website_demo_visibility?**',r=>r.fulfill({
     status:200,contentType:'application/json',
     body:JSON.stringify([
      {demo_id:'ivory-and-bloom',visible:false},
      {demo_id:'casa-brownie',visible:false},
      {demo_id:'crumb',visible:false},
      {demo_id:'la-vie-in-pink',visible:false},
      {demo_id:'jaramillo-boutique',visible:false},
      {demo_id:'havana-19',visible:false},
      {demo_id:'sova',visible:false}
     ])
    }));
    const response=await page.goto(base+route,{waitUntil:'domcontentloaded',timeout:35000});
    assert.equal(response?.status(),200,'Tablet route must load '+lang);
    await page.waitForFunction(()=>document.documentElement.dataset.tleDemoStatus==='ready',null,{timeout:15000});
    const layout=await page.evaluate(()=>{
     const rect=e=>e.getBoundingClientRect();
     const visible=[...document.querySelectorAll('.hero-gallery-card')]
      .filter(e=>getComputedStyle(e).display!=='none');
     const gallery=document.querySelector('.hero-gallery-stage');
     const benefits=[...document.querySelectorAll('.features .feature')];
     const plans=[...document.querySelectorAll('.pricing .plan')];
     return {
      visibleCount:visible.length,
      cardWidths:visible.map(e=>Math.round(rect(e).width)),
      filledFraction:visible.length?(Math.max(...visible.map(e=>rect(e).right))-Math.min(...visible.map(e=>rect(e).left)))/rect(gallery).width:0,
      benefitFont:parseFloat(getComputedStyle(benefits[0].querySelector('p')).fontSize),
      benefitFirstX:rect(benefits[0]).x,benefitThirdX:rect(benefits[2]).x,
      planFirstX:rect(plans[0]).x,planSecondX:rect(plans[1]).x,
      planFirstWidth:rect(plans[0]).width,planSecondWidth:rect(plans[1]).width,
      pageScroll:document.documentElement.scrollWidth,viewport:innerWidth
     };
    });
    assert.equal(layout.visibleCount,4,'Gallery visibility preserves four curated demos '+lang+' '+width);
    assert.ok(Math.min(...layout.cardWidths)>=170,'Visible demo thumbnails must be large on iPad '+JSON.stringify(layout));
    assert.ok(layout.filledFraction>.78,'Visible demos must occupy tablet rail instead of half-width '+JSON.stringify(layout));
    assert.ok(layout.benefitFont>=13,'Benefit explanations must remain readable '+JSON.stringify(layout));
    assert.ok(Math.abs(layout.benefitFirstX-layout.benefitThirdX)<3,'Benefits use 2-by-2 tablet layout '+JSON.stringify(layout));
    assert.ok(Math.abs(layout.planFirstX-layout.planSecondX)<3,'Packages stack as full-width tablet rows '+JSON.stringify(layout));
    assert.ok(layout.planFirstWidth>=width*.8&&layout.planSecondWidth>=width*.8,'Packages are not cramped half-width cards '+JSON.stringify(layout));
    assert.ok(layout.pageScroll<=layout.viewport+2,'No page horizontal overflow on tablet '+JSON.stringify(layout));
    await page.screenshot({path:folder+'/'+lang+'-hero-tablet-'+width+'.png'});
    await page.locator('.pricing').scrollIntoViewIfNeeded();
    await page.screenshot({path:folder+'/'+lang+'-pricing-tablet-'+width+'.png'});
    assert.equal(await page.locator('#website-basic a').last().getAttribute('href'),'/website-checkout/?offer=website-basic&lang='+lang);
    assert.equal(await page.locator('#website-plus a').last().getAttribute('href'),'/website-checkout/?offer=website-plus&lang='+lang);
    console.log('PASS: '+lang+' iPad '+width+'px, 4 large projects, 2x2 benefits, readable full-width packages');
   }finally{await context.close()}
  }
 }
 // Explicit iPad portrait/landscape viewport checks with both brand cards
 // visible independent of the owner's saved public curation.
 for(const width of [768,820,1024]){
  const ctx=await browser.newContext({viewport:{width,height:1024},reducedMotion:'no-preference'});
  await ctx.route('**/tle_website_demo_visibility?**',r=>r.fulfill({status:200,contentType:'application/json',body:'[]'}));
  const page=await ctx.newPage();
  try{
   await page.goto(base+'/website-for-your-business/',{waitUntil:'domcontentloaded',timeout:35000});
   await page.waitForFunction(()=>document.documentElement.dataset.tleDemoStatus==='ready');
   const data=await page.evaluate(()=>{
    const card=document.querySelector('.hero-gallery-card[data-demo="jaramillo-boutique"]');
    const sova=document.querySelector('.hero-gallery-card[data-demo="sova"]');
    const v=card.querySelector('video.hero-gallery-motion'),img=card.querySelector('img'),sovaImg=sova.querySelector('img');
    // offsetWidth/Height validate layout before entrance transforms settle.
    // getBoundingClientRect may briefly report 90% scale during initial reveal.
    return {
      cardWidth:card.offsetWidth,cardHeight:card.offsetHeight,
      videoFit:getComputedStyle(v).objectFit,
      photoFit:getComputedStyle(img).objectFit,
      sovaFit:getComputedStyle(sovaImg).objectFit,
      videoPointer:getComputedStyle(v).pointerEvents,
      sovaSrc:sovaImg.getAttribute('src'),
      pageWidth:document.documentElement.scrollWidth,viewport:innerWidth
    };
   });
   assert.ok(data.cardWidth>160&&data.cardHeight>=250,'Jaramillo tablet card must be large and readable: '+JSON.stringify(data));
   assert.equal(data.videoFit,'contain','Keep full Jaramillo face on iPad: '+width);
   assert.equal(data.photoFit,'contain','Keep Jaramillo photo uncropped on iPad: '+width);
   assert.equal(data.sovaFit,'contain','Keep approved SOVA portrait uncropped on iPad: '+width);
   assert.equal(data.videoPointer,'none','Video must not block the card link');
   assert.equal(data.sovaSrc,'/demos/sova/media/sova-hero-seamless-cobalt-20261108.png');
   assert.ok(data.pageWidth<=data.viewport+2,'No horizontal page overflow on iPad: '+JSON.stringify(data));
   console.log('PASS: Jaramillo video and SOVA photo framing on iPad '+width+'px');
  }finally{await ctx.close();}
 }
 const desktop=await browser.newContext({viewport:{width:1440,height:900},reducedMotion:'no-preference'});
 const dp=await desktop.newPage();
 try{
  // Install read-only selection fixture before navigation to avoid racing the live owner selection.
  await dp.route('**/tle_website_demo_visibility?**',r=>r.fulfill({
   status:200,contentType:'application/json',body:'[]'
  }));
  await dp.goto(base+'/website-for-your-business/',{waitUntil:'domcontentloaded'});
  await dp.waitForFunction(()=>document.documentElement.classList.contains('tle-offer-motion'));
  await dp.waitForFunction(()=>document.documentElement.dataset.tleDemoStatus==='ready'&&document.querySelector('.hero-gallery-rail')?.dataset.galleryLayout==='extended',null,{timeout:12000});
  const portfolio=await dp.evaluate(()=>{
   const stage=document.querySelector('.hero-gallery-stage');
   const visible=[...document.querySelectorAll('.hero-gallery-card')].filter(e=>getComputedStyle(e).display!=='none');
   return {count:visible.length,overflow:stage.scrollWidth-stage.clientWidth,
    narrowest:Math.min(...visible.map(e=>e.getBoundingClientRect().width)),
    labels:visible.map(e=>e.dataset.demo)};
  });
  assert.equal(portfolio.count,11,'All eleven projects appear with no Studio hides '+JSON.stringify(portfolio));
  assert.ok(portfolio.overflow>400&&portfolio.narrowest>=200,'Extended desktop gallery must be scrollable with readable real photos '+JSON.stringify(portfolio));
  for(const slug of ['soluna-yoga','experience-cleaning','yummm','wok-social']){
   assert.ok(portfolio.labels.includes(slug),'Required project missing: '+slug);
  }
  const yummm=dp.locator('.hero-gallery-card[data-demo="yummm"]');
  assert.equal(await yummm.locator('video[data-motion-src*="/yummm/media/hero-motion-20261108.mp4"]').count(),1,
   'YUMMM must use its original matching video with still fallback');
  await dp.locator('.hero-gallery-card[data-demo="wok-social"]').scrollIntoViewIfNeeded();
  const lastCardVisible=await dp.locator('.hero-gallery-card[data-demo="wok-social"]').isVisible();
  assert.ok(lastCardVisible,'WOK must be reachable from extended desktop gallery');
  const d=await dp.evaluate(()=>({scroll:document.documentElement.scrollWidth,width:innerWidth}));
  assert.ok(d.scroll<=d.width+2,'Desktop no horizontal overflow');

  const desktopCopy=await dp.locator('.hero-gallery-copy').evaluate(el=>{
   const r=el.getBoundingClientRect(),hero=el.closest('.hero-gallery')?.getBoundingClientRect(),h1=el.querySelector('h1')?.getBoundingClientRect();
   return {copyBottom:r.bottom,heroBottom:hero?.bottom,h1Right:h1?.right,copyRight:r.right,h1Height:h1?.height};
  });
  assert.ok(desktopCopy.copyBottom<=desktopCopy.heroBottom+4,
   'Stronger headline must not collide with the desktop hero boundary '+JSON.stringify(desktopCopy));
  assert.ok(desktopCopy.h1Right<=desktopCopy.copyRight+3,
   'Headline must stay inside desktop copy column '+JSON.stringify(desktopCopy));

  await dp.locator('.pricing').scrollIntoViewIfNeeded();
  await dp.waitForTimeout(1550);
  await dp.screenshot({path:folder+'/en-pricing-desktop.png'});
  console.log('PASS: Desktop 1440px motion and layout');
 }finally{await desktop.close()}
}finally{await browser.close()}
