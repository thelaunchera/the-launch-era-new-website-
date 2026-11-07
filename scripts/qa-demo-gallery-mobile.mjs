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
 assert.equal(await page.locator('.card-preview-link').count(),16,'Every photo card needs a preview link');
 assert.equal(await page.locator('#viewer-close').count(),1);
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
 await checkImage('la-vie-in-pink');
 await checkOpenAndClose('la-vie-in-pink','La vie in pink');
 await checkImage('jaramillo-boutique');
 await checkOpenAndClose('jaramillo-boutique','Jaramillo');

 // CRUMB must use the image actually approved for its live hero, never an old gallery-only storefront.
 const crumbThumb=await checkImage('crumb');
 assert.ok(crumbThumb.src.endsWith('/CRUMB_Storefront_Approved_20261030.webp'),'CRUMB gallery must show its approved original hero');
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
   const destination=new URL(await hit.getAttribute('href'),url);
   assert.equal(destination.pathname,'/demos/','Photo must open the existing demo library');
   assert.equal(destination.searchParams.get('demo'),slug,'Photo must select the exact demo');
   assert.equal(destination.searchParams.get('returnTo'),locale,'Photo must preserve the bilingual origin for Close');
  }
  const hit=page.locator('.hero-gallery-card[data-demo="'+chosen+'"] .hero-gallery-hit');
  await hit.click();
  await page.waitForURL(new RegExp('/demos/\\?demo='+chosen),{timeout:20000});
  await page.waitForFunction(()=>document.querySelector('#demo-viewer')?.open===true,null,{timeout:20000});
  assert.equal(await page.locator('#viewer-frame').getAttribute('src'),chosen==='jaramillo-boutique'?'https://thelaunchera.github.io/demo-booking-landing-/jaramillo-boutique/':'https://thelaunchera.com/demos/la-vie-in-pink/');
  assert.equal(await page.locator('#viewer-close').isVisible(),true);
  await page.screenshot({path:folder+'/website-'+(locale.startsWith('/es/')?'es':'en')+'-direct-demo.png'});
  await page.locator('#viewer-close').click();
  await page.waitForURL(new URL(locale,url).href,{timeout:20000});
  assert.equal(await page.locator('.hero-gallery-card').count(),7,'Close should return to the original bilingual website');
  console.log('[LINK+RETURN]',locale,chosen,'OK');
 }
 // Old links using Umbral must still resolve to the single canonical Havana 19 demo.
 await page.goto(new URL('/demos/?demo=umbral',url).href,{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>document.querySelector('#demo-viewer')?.open===true,null,{timeout:20000});
 assert.equal(await page.locator('#viewer-frame').getAttribute('src'),'https://thelaunchera.com/demos/havana-19/');
 await page.locator('#viewer-close').click();
 console.log('[ALIAS] Umbral -> Havana 19 OK');


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
 }finally{await motionContext.close()}

 console.log('[PASS] 16 cards, three exact hero images, modal open/close, filters and iPhone scroll.');
} finally{
 await browser.close();
}
