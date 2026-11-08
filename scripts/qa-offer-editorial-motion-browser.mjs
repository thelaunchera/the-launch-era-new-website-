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
   assert.equal(await page.locator('.hero-gallery-card').count(),7,'Keep the demo gallery');
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
   await page.waitForTimeout(1100);
   const layer=await page.locator('.owner-admin-visual').evaluate(el=>({animation:getComputedStyle(el).animationName,opacity:Number(getComputedStyle(el).opacity)}));
   assert.ok(layer.animation.includes('tle-offer-panel-in')&&layer.opacity>.96,'Owner view settles correctly '+lang);
   await page.screenshot({path:folder+'/'+lang+'-owner-showcase-iphone.png'});
   await page.locator('#website-ai-crm').scrollIntoViewIfNeeded();
   await page.waitForFunction(()=>document.querySelector('#website-ai-crm')?.classList.contains('tle-offer-visible'),null,{timeout:10000});
   await page.waitForTimeout(850);
   const priceCard=await page.locator('#website-ai-crm').evaluate(el=>({opacity:Number(getComputedStyle(el).opacity),shadow:getComputedStyle(el).boxShadow}));
   assert.ok(priceCard.opacity>.96&&priceCard.shadow!=='none','Pricing becomes visible and dimensional '+lang);
   assert.equal(await page.locator('#website-basic a[href^="/website-checkout/"]').getAttribute('href'),'/website-checkout/?offer=website-basic&lang='+lang,'Checkout basic intact');
   assert.equal(await page.locator('#website-ai-crm a[href^="/website-checkout/"]').getAttribute('href'),'/website-checkout/?offer=website-ai-crm&lang='+lang,'Checkout advanced intact');
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
 const desktop=await browser.newContext({viewport:{width:1440,height:900},reducedMotion:'no-preference'});
 const dp=await desktop.newPage();
 try{
  await dp.goto(base+'/website-for-your-business/',{waitUntil:'domcontentloaded'});
  await dp.waitForFunction(()=>document.documentElement.classList.contains('tle-offer-motion'));
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
  await dp.waitForTimeout(900);
  await dp.screenshot({path:folder+'/en-pricing-desktop.png'});
  console.log('PASS: Desktop 1440px motion and layout');
 }finally{await desktop.close()}
}finally{await browser.close()}
