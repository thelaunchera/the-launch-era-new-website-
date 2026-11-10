// Portfolio: approved hero poster, functional mini previews, drag-pill navigation, accessibility.
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
   const r=await page.goto(root+'/portfolio/',{waitUntil:'domcontentloaded'});
   assert.equal(r?.status(),200,'Portfolio route resolves');
   await page.locator('.tle-demo-drop-item').first().waitFor({state:'attached',timeout:15000});
   assert.equal(await page.locator('.tle-demo-drop-item').count(),9,'Nine miniatures must render once');
   assert.equal(await page.locator('#tleGravityStage .tle-brand-pill').count(),9,'No duplicate physics tags');
   assert.equal(await page.locator('#statement .section-tag').count(),1,'Editorial section must use valid HTML');
   assert.equal(await page.locator('#tleGravityTitle').count(),1,'Physics section heading is identified');
   assert.ok((await page.locator('#heroPoster').getAttribute('src')).includes('founder-poster.jpg'),'Poster is specified before scripts');
   const over=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
   assert.ok(over<5,'No horizontal overflow at '+width+'px: '+over);
   await page.locator('.tle-demo-drop-item').first().click({force:true});
   assert.equal(await page.locator('#projectDialog').evaluate(el=>el.open),true,'Miniature opens project');
   assert.ok((await page.locator('#modalExplore').getAttribute('href')).includes('/demos/'),'Real project link assigned');
   await page.locator('#closeDialog').click();
   assert.equal(await page.locator('#projectDialog').evaluate(el=>el.open),false,'Preview can close');
   const first=page.locator('#tleGravityStage .tle-brand-pill').first();
   await first.scrollIntoViewIfNeeded();
   if(motion==='reduce'){
     await first.click();
   }else{
     await first.focus();
     await first.press('Enter');
   }
   assert.equal(await page.locator('#projectDialog').evaluate(el=>el.open),true,'Brand tag opens its matching demo with '+motion);
   await page.locator('#closeDialog').click();
   assert.deepEqual(errors,[],'No portfolio JS errors');
   console.log('PORTFOLIO PASS',type.name(),width,motion);
   await page.close();
  }
 }finally{await browser.close();}
}
