/** Responsive five-service gallery: content always visible; no 570px blanks. */
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const base=(process.env.QA_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const browser=await chromium.launch({headless:true});
try{
 for(const [lang,route] of [['en','/'],['es','/es/']]){
  for(const width of [360,390,768,820,1024,1440]){
   const page=await browser.newPage({viewport:{width,height:900},isMobile:width<768,hasTouch:width<768});
   const errors=[],writes=[];
   page.on('pageerror',e=>errors.push(e.message));
   page.on('request',r=>{if(['POST','PUT','PATCH','DELETE'].includes(r.method()))writes.push(r.url())});
   await page.goto(base+route,{waitUntil:'domcontentloaded',timeout:45000});
   const cards=page.locator('.sales-home .solutions-section .tle-service-static');
   await cards.first().waitFor({state:'visible',timeout:20000});
   assert.equal(await cards.count(),5,'Five real service choices required');
   const report=await cards.evaluateAll(cards=>cards.map(card=>{
     const a=card.querySelector('a.tle-service-static__link');
     const img=card.querySelector('img');
     const r=card.getBoundingClientRect();
     const d=card.querySelector('p').getBoundingClientRect();
     const h=card.querySelector('h3').getBoundingClientRect();
     return {height:r.height,cardBottom:r.bottom,textBottom:d.bottom,titleBottom:h.bottom,
       link:a?.getAttribute('href'),alt:img?.alt,imageSource:img?.getAttribute('src'),
       ctaVisible:!!card.querySelector('.tle-service-static__cta'),
       linkVisibility:getComputedStyle(a).visibility,imageVisibility:getComputedStyle(img).visibility
     };
   }));
   for(const [i,card] of report.entries()){
      assert(card.link?.startsWith('/'),lang+' '+i+' link missing');
      assert(card.alt&&card.imageSource,lang+' '+i+' photo and alt missing');
      assert(card.ctaVisible&&card.linkVisibility==='visible'&&card.imageVisibility==='visible',lang+' '+i+' content hidden');
      assert(card.height<(width<768?325:650),lang+' '+width+' empty fixed-height card '+i+': '+card.height);
      assert(card.textBottom<=card.cardBottom+2&&card.titleBottom<=card.cardBottom+2,lang+' '+i+' clipped content');
   }
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
   assert(overflow<=4,lang+' '+width+' document overflow '+overflow);
   assert.deepEqual(writes,[],'Browsing service cards must not write user data');
   assert.deepEqual(errors,[],'JavaScript errors');
   await page.close();
   console.log('PASS static gallery '+lang+' '+width+'px');
  }
 }
} finally {await browser.close();}
