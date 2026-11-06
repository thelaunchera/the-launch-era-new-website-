import assert from 'node:assert/strict';
import {chromium} from 'playwright';
// Replaces the retired cursor-mask test: the official Jaramillo landing uses a plain accessible headline.
const base=(process.env.QA_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const browser=await chromium.launch({headless:true});
try{
 for(const [lang,route] of [['en','/'],['es','/es/']])for(const [width,touch,reduced] of [[390,true,false],[1440,false,false],[1440,false,true]]){
  const page=await browser.newPage({viewport:{width,height:844},isMobile:touch,hasTouch:touch,reducedMotion:reduced?'reduce':'no-preference'});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+route,{waitUntil:'domcontentloaded',timeout:45000});
  const hero=page.locator('.tle-universal .hero');
  await hero.locator('h1').waitFor({state:'visible',timeout:15000});
  assert.match(await hero.locator('img').getAttribute('src'),/hero-jaramillo\.jpg$/);
  assert.equal(await page.locator('.problem-section .tle-mask-headline').count(),0,'Old visual mask must stay retired');
  assert(await hero.locator('a[href="#paquetes"]').isVisible(),'Hero CTA hidden');
  assert.equal(await page.locator('.tle-universal .plan').count(),2,'Both packages must be visible');
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
  assert(overflow<=3,'Horizontal overflow '+lang+' '+width);
  assert.deepEqual(errors,[],'Page errors');
  await page.close();
  console.log('PASS plain Jaramillo hero '+lang+' '+width+' reduced='+reduced);
 }
}finally{await browser.close();}
