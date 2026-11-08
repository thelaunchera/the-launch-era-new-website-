// TLE scroll-motion acceptance: real offscreen reveal, reduced motion and unaffected CTAs.
import assert from 'node:assert/strict';
import {chromium,webkit,devices} from 'playwright';

async function assertReplayInBothDirections(page, node, label) {
 const positions=await page.evaluate(el=>{
  const rect=el.getBoundingClientRect();
  const top=rect.top+scrollY, bottom=top+rect.height;
  return {canExitAbove:top>innerHeight+120,
          canExitBelow:document.documentElement.scrollHeight-bottom>innerHeight+120};
 },node);
 for(const [possible,where] of [[positions.canExitAbove,'top'],[positions.canExitBelow,'bottom']]){
  if(!possible)continue;
  await page.evaluate(where=>window.scrollTo({top:where==='top'?0:document.documentElement.scrollHeight,behavior:'instant'}),where);
  await page.waitForFunction(el=>!el.classList.contains('tle-scroll-visible'),node,{timeout:4000});
  await node.scrollIntoViewIfNeeded();
  await page.waitForFunction(el=>el.classList.contains('tle-scroll-visible'),node,{timeout:4000});
 }
 console.log('SCROLL RE-ENTRY',label,'UP/DOWN',positions);
}

const origin=(process.env.QA_URL||'http://127.0.0.1:4191').replace(/\/$/,'');
const demos=['sova','golden-grid','casa-brownie','crumb','havana-19','ivory-and-bloom','la-vie-in-pink','marea-wigs-miami','aftr','lavender-edit','experience-cleaning'];
const urlFor=slug=>slug==='experience-cleaning'?'/experience-cleaning/':'/demos/'+slug+'/';
const browser=await chromium.launch({headless:true});
try {
 const context=await browser.newContext({...devices['iPhone 13'],viewport:{width:390,height:800},reducedMotion:'no-preference'});
 for(const slug of demos){
  const page=await context.newPage();
  const response=await page.goto(origin+urlFor(slug),{waitUntil:'domcontentloaded'});
  assert.equal(response?.status(),200,'Route should load '+slug);
  await page.locator('body').waitFor({state:'visible'});
  await page.waitForTimeout(220);
  const targets=page.locator('[data-tle-scroll-part]');
  const count=await targets.count();
  assert.ok(count>=1,slug+' should mark editorial scroll targets (found '+count+')');
  const details=await page.evaluate(()=>{
   const nodes=[...document.querySelectorAll('[data-tle-scroll-part]')];
   return {heads:nodes.filter(n=>n.dataset.tleScrollPart==='headline').length,photos:nodes.filter(n=>n.dataset.tleScrollPart==='photo').length};
  });
  assert.ok(details.heads+details.photos>=1,slug+' must have at least one editorial target');
  const pending=page.locator('.tle-scroll-pending').first();
  if(await pending.count()){
   const el=await pending.elementHandle();
   await el.scrollIntoViewIfNeeded();
   await page.waitForFunction(target=>target?.classList.contains('tle-scroll-visible'),el,{timeout:3500});
    await assertReplayInBothDirections(page,el,slug);
  }
  // No reveal may be applied to actual form controls or buttons.
  assert.equal(await page.locator('input.tle-scroll-pending,button.tle-scroll-pending,form.tle-scroll-pending,[role=dialog].tle-scroll-pending').count(),0,
   slug+' cannot animate form controls or interactive dialogs as scroll content');
  console.log('SCROLL MOTION OK',slug,JSON.stringify(details));
  await page.close();
 }
 await context.close();
 const reduced=await browser.newContext({...devices['iPhone 13'],viewport:{width:390,height:800},reducedMotion:'reduce'});
 for(const slug of ['golden-grid','casa-brownie','havana-19','ivory-and-bloom','sova']){
  const page=await reduced.newPage();
  await page.goto(origin+urlFor(slug),{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(160);
  assert.equal(await page.locator('.tle-scroll-pending').count(),0,slug+' reduced-motion cannot hide content');
  console.log('REDUCED MOTION OK',slug);
  await page.close();
 }
 await reduced.close();
} finally {await browser.close();}
const safari=await webkit.launch({headless:true});
try {
 const context=await safari.newContext({...devices['iPhone 13'],viewport:{width:390,height:800},reducedMotion:'no-preference'});
 for(const slug of ['havana-19','ivory-and-bloom','golden-grid','casa-brownie']){
  const page=await context.newPage();
  await page.goto(origin+urlFor(slug),{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(180);
  assert.ok(await page.locator('[data-tle-scroll-part]').count()>=1,slug+' WebKit should initialize reveal');
  const pending=page.locator('.tle-scroll-pending').first();
  if(await pending.count()){
   const el=await pending.elementHandle();
   await el.scrollIntoViewIfNeeded();
   await page.waitForFunction(target=>target?.classList.contains('tle-scroll-visible'),el,{timeout:3500});
   await assertReplayInBothDirections(page,el,'WebKit '+slug);
  }
  console.log('SAFARI SCROLL OK',slug);
  await page.close();
 }
 await context.close();
} finally {await safari.close();}
