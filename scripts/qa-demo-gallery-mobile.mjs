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
 const horizontal=await page.evaluate(()=>({scrollWidth:document.documentElement.scrollWidth,innerWidth:window.innerWidth}));
 assert.ok(horizontal.scrollWidth<=horizontal.innerWidth+2,'Mobile page overflow: '+JSON.stringify(horizontal));
 console.log('[MOBILE WIDTH]',JSON.stringify(horizontal));
 await page.screenshot({path:folder+'/iPhone-hero.png'});
 await checkImage('la-vie-in-pink');
 await checkOpenAndClose('la-vie-in-pink','La vie in pink');
 await checkImage('jaramillo-boutique');
 await checkOpenAndClose('jaramillo-boutique','Jaramillo');
 const food=page.locator('.filter[data-filter="Food & Drink"]');
 await food.click();
 assert.equal(await page.locator('.demo-card:visible').count(),9,'Category filter must show 9 Food & Drink demos');
 await page.locator('.filter[data-filter="All"]').click();
 assert.equal(await page.locator('.demo-card:visible').count(),16,'Reset filter must show all');
 console.log('[PASS] 16 cards, two exact hero images, modal open/close, filters and iPhone scroll.');
} finally{
 await browser.close();
}
