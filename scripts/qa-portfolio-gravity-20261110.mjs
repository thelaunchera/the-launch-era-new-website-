import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {chromium,webkit} from 'playwright';
const html=readFileSync('public/portfolio/index.html','utf8');
assert.doesNotMatch(html,/if \(reduced\.matches\) document\.querySelectorAll\('\.tle-brand-pill\[data-project\]'\)/,'No duplicate reduced-motion project listener');
assert.match(html,/\.tle-brand-pill\{cursor:grab;touch-action:none\}/,'Mobile brand pills support touch dragging');
const origin=(process.env.QA_URL||'http://127.0.0.1:4198').replace(/\/$/,'');
for(const browserType of [chromium,webkit]){
 const browser=await browserType.launch({headless:true});
 try{
  for(const width of [375,390,1280]){
   const page=await browser.newPage({viewport:{width,height:820},reducedMotion:'reduce'});
   const errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   const response=await page.goto(origin+'/portfolio/',{waitUntil:'domcontentloaded'});
   assert.equal(response?.status(),200);
   await page.waitForFunction(()=>document.querySelectorAll('.tle-demo-drop-item').length===9,null,{timeout:12000});
   assert.equal(await page.locator('.tle-demo-drop-item').count(),9,'All 9 real demo miniatures exist');
   assert.equal(await page.locator('.tle-brand-pill[data-project]').count(),9,'9 correct project pills retained');
   assert.ok(await page.locator('#heroVideo').count(),'Approved cinematic hero is retained');
   await page.waitForFunction(()=>document.querySelector('#heroPoster')?.complete&&document.querySelector('#heroPoster')?.naturalWidth>0,null,{timeout:15000});
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
   assert.ok(overflow<=3,'No page horizontal overflow at '+width+'px: '+overflow);
   const buttons=page.locator('#tleGravityStage .tle-brand-pill');
   await buttons.first().click();
   assert.equal(await page.locator('#projectDialog').evaluate(el=>el.open),true,'Pill opens correct existing preview');
   assert.ok((await page.locator('#modalTitle').innerText()).length>2,'Preview has an actual demo title');
   await page.locator('#closeDialog').click();
   assert.equal(await page.locator('#projectDialog').evaluate(el=>el.open),false,'Preview closes and page scroll unlocks');
   assert.deepEqual(errors,[],'No JS errors');
   console.log('PASS',browserType.name(),width,'reduced-motion, 9 cards, hero and project viewer');
   await page.close();
  }
  const active=await browser.newPage({viewport:{width:390,height:820},reducedMotion:'no-preference'});
  await active.goto(origin+'/portfolio/',{waitUntil:'domcontentloaded'});
  await active.locator('#tleGravityStage').scrollIntoViewIfNeeded();
  const touch=await active.locator('#tleGravityStage .tle-brand-pill').first().evaluate(el=>getComputedStyle(el).touchAction);
  assert.equal(touch,'none','iPhone gesture belongs to the draggable pill, not page scroll');
  const mini=active.locator('.tle-demo-drop-item').first();
  await mini.scrollIntoViewIfNeeded();
  assert.equal(await active.locator('.tle-demo-drop-item').count(),9);
  const image=mini.locator('img');
  await image.waitFor({state:'visible',timeout:10000});
  await active.waitForFunction(el=>el?.complete&&el.naturalWidth>0,await image.elementHandle(),{timeout:18000});
  await active.close();
 }finally{await browser.close();}
}
