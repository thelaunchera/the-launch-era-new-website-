// Motion-library pilot: preserve actual text, translations and cart navigation.
import assert from 'node:assert/strict';
import { chromium, webkit } from 'playwright';
const origin=(process.env.QA_URL||'http://127.0.0.1:4191').replace(/\/$/,'');
for(const browserType of [chromium,webkit]){
 const browser=await browserType.launch({headless:true});
 try{
  for(const [slug,selector] of [['freska','[data-i18n="flavorsKicker"]'],['sneekiefs','[data-i18n="feature3"]']]){
   const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'no-preference'});
   const errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   const response=await page.goto(origin+'/demos/'+slug+'/',{waitUntil:'domcontentloaded'});
   assert.equal(response?.status(),200,'Demo route must load');
   const target=page.locator(selector);
   assert.equal(await target.count(),1,slug+' should have exactly one text effect target');
   const before=(await target.innerText()).trim();
   assert.ok(before.length>6,slug+' keeps complete original meaningful text');
   await target.scrollIntoViewIfNeeded();
   await page.waitForTimeout(1300);
   assert.equal((await target.innerText()).trim(),before,slug+' effect must settle to original text');
   assert.equal(await target.locator('.tle-text-effect-layer').count(),0,'Animation overlay removed');
   const lang=slug==='freska'?page.locator('[data-lang="es"]'):page.locator('#langToggle');
   await lang.click();
   await page.waitForTimeout(1300);
   const translated=(await target.innerText()).trim();
   assert.ok(translated.length>5,slug+' translated text remains visible');
   assert.notEqual(translated,before,slug+' language toggle must translate target');
   assert.equal(await target.locator('.tle-text-effect-layer').count(),0,'Translation overlay removed');
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
   assert.ok(overflow<4,slug+' should not create horizontal scrolling on phone');
   assert.deepEqual(errors,[],slug+' must have no browser script errors');
   console.log('TEXT MOTION PASS',browserType.name(),slug,{before,translated});
   await page.close();
   const reduced=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
   await reduced.goto(origin+'/demos/'+slug+'/',{waitUntil:'domcontentloaded'});
   const reducedTarget=reduced.locator(selector);
   await reducedTarget.scrollIntoViewIfNeeded();
   await reduced.waitForTimeout(300);
   assert.equal(await reducedTarget.locator('.tle-text-effect-layer').count(),0,slug+' must not animate reduced-motion readers');
   assert.notEqual((await reducedTarget.innerText()).trim(),'','Static text must be readable');
   await reduced.close();
  }
 } finally {await browser.close()}
}
