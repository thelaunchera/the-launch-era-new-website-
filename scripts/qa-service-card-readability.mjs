import assert from 'node:assert/strict';
import {chromium} from 'playwright';
// Current public home contains two website packages. Old 5-service cards remain only on archived routes.
const base=(process.env.QA_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const browser=await chromium.launch({headless:true});
try {
 for(const [lang,route] of [['en','/'],['es','/es/']])for(const width of [360,390,768,820,1024,1440]){
  const page=await browser.newPage({viewport:{width,height:900},isMobile:width<768,hasTouch:width<768});
  const errors=[],writes=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('request',r=>{if(['POST','PUT','PATCH','DELETE'].includes(r.method()))writes.push(r.url());});
  await page.goto(base+route,{waitUntil:'domcontentloaded'});
  const cards=page.locator('.tle-universal .plan');
  await cards.first().waitFor({state:'visible',timeout:20000});
  assert.equal(await cards.count(),2,'Exactly two packages');
  const packages=['website-basic','website-ai-crm'];
  for(let i=0;i<2;i++){
   const card=cards.nth(i),img=card.locator('img'),link=card.locator('a[href^="/service-checkout/"]');
   assert(await img.count()===1,'Package needs one product photo');
   assert((await img.getAttribute('alt'))?.length>5,'Photo needs alternative text');
   assert(await card.locator('h3').isVisible(),'Headline hidden');
   assert(await link.isVisible(),'Purchase CTA hidden');
   assert.equal(await link.getAttribute('href'),'/service-checkout/?offer='+packages[i]+'&lang='+lang,'Wrong package checkout');
   const box=await card.boundingBox();
   assert(box && box.width>180 && box.height>180,'Unusable card geometry');
  }
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
  assert(overflow<=4,'Responsive overflow '+lang+' '+width);
  assert.deepEqual(writes,[],'Viewing package cards cannot initiate checkout');
  assert.deepEqual(errors,[],'Unexpected browser errors');
  await page.close();
  console.log('PASS current package cards '+lang+' '+width);
 }
} finally {await browser.close();}
