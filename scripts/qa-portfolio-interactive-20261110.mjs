// Portfolio: approved hero poster, one interactive website-card gallery, keyboard navigation and accessibility.
import assert from 'node:assert/strict';
import {chromium,webkit} from 'playwright';
const root=(process.env.QA_URL||'http://127.0.0.1:4198').replace(/\/$/,'');
for(const type of [chromium,webkit]){
 const browser=await type.launch({headless:true});
 try{
  for(const [width,motion] of [[390,'no-preference'],[375,'reduce'],[1280,'no-preference']]){
   const page=await browser.newPage({viewport:{width,height:844},reducedMotion:motion});
   const errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   const res=await page.goto(root+'/portfolio/',{waitUntil:'domcontentloaded'});
   assert.equal(res?.status(),200,'Portfolio route resolves');
   await page.locator('.tle-demo-drop-item').first().waitFor({state:'attached',timeout:15000});
   assert.equal(await page.locator('.tle-demo-drop-item').count(),10,'Ten website cards render once');
   assert.equal(await page.locator('.tle-brand-pill').count(),0,'No duplicated pill navigation');
   assert.equal(await page.locator('.tle-gravity-arena #tleDemoDropGrid').count(),1,'Every card is inside the same blue showcase');
   assert.equal(await page.locator('#statement .section-tag').count(),1,'Editorial section remains valid');
   assert.equal(await page.locator('#tleGravityTitle').count(),1,'Single showcase heading is identified');
   assert.equal(await page.locator('#tleDemoDropTitle').count(),1,'Website collection has an accessible label');
   assert.ok((await page.locator('#heroPoster').getAttribute('src')).includes('founder-poster.jpg'),'Poster is specified from first paint');
   const over=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
   assert.ok(over<5,'No horizontal overflow at '+width+'px: '+over);
   const first=page.locator('.tle-demo-drop-item').first();
   await first.click();
   assert.equal(await page.locator('#projectDialog').evaluate(el=>el.open),true,'Website miniature opens a preview');
   assert.ok((await page.locator('#modalExplore').getAttribute('href')).includes('/demos/la-vie-in-pink/'),'Correct real website is linked');
   await page.locator('#closeDialog').click();
   assert.equal(await page.locator('#projectDialog').evaluate(el=>el.open),false,'Preview can close');
   const second=page.locator('.tle-demo-drop-item').nth(1);
   await second.scrollIntoViewIfNeeded();
   await second.focus();
   await second.press('Enter');
   assert.equal(await page.locator('#projectDialog').evaluate(el=>el.open),true,'Keyboard Enter opens the second website');
   assert.equal((await page.locator('#modalTitle').innerText()).trim(),'VELMORA','Matching brand opens instead of repeated first demo');
   await page.locator('#closeDialog').click();
   assert.deepEqual(errors,[],'No portfolio JavaScript errors');
   console.log('PORTFOLIO PASS',type.name(),width,motion,'one set of cards');
   await page.close();
  }
 }finally{await browser.close()}
}
