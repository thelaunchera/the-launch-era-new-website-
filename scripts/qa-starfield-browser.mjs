import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
const base=process.env.QA_URL||'http://127.0.0.1:4173';
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader']});
mkdirSync('qa-screenshots',{recursive:true});
try {
 for(const width of [390,820,1440]) for(const path of ['/','/es/']){
  const page=await browser.newPage({viewport:{width,height:900}}),errors=[];
  await page.addInitScript(() => { const raf=window.requestAnimationFrame.bind(window); window.__qaFrames=0; window.requestAnimationFrame=callback=>raf(time=>{window.__qaFrames++;callback(time)}); });
  page.on('pageerror',error=>errors.push(error.message));
  page.on('console',message=>{if(message.type()==='error'&&/THREE|shader|WebGLProgram/.test(message.text()))errors.push(message.text())});
  await page.route('**/*',route=>{
   const url=new URL(route.request().url());
   return url.origin===new URL(base).origin||url.hostname==='unpkg.com'?route.continue():route.abort();
  });
  await page.goto(base+path,{waitUntil:'networkidle'});
  assert.equal(await page.locator('.hero-scroll-reveal').count(),0,'Removed See how it works banner returned');
  const host=page.locator('.hero-scroll-stage--starfield > .tle-starfield-accent');
  assert.equal(await host.count(),1,'One stage-wide starfield required');
  const sceneDimensions=await host.evaluate(el=>({overlay:el.getBoundingClientRect(),stage:el.parentElement.getBoundingClientRect(),pointer:getComputedStyle(el).pointerEvents,blend:getComputedStyle(el).mixBlendMode}));
  assert(Math.abs(sceneDimensions.overlay.width-sceneDimensions.stage.width)<2&&Math.abs(sceneDimensions.overlay.height-sceneDimensions.stage.height)<2,'Stars must fill full hero stage');
  assert.equal(sceneDimensions.pointer,'none','Starfield must not block booking CTA');
  assert.equal(sceneDimensions.blend,'screen','Starfield must blend transparently above real photo');
  if(width<768){
    const top=await page.locator('.hero-split-visual').evaluate(el=>el.getBoundingClientRect().top-el.closest('.hero-scroll-stage').getBoundingClientRect().top);
    assert(top>=-3&&top<32,'Mobile photo must start at top of hero, not under removed link');
  }
  const hero=page.locator('.hero-scroll-stage--starfield > .tle-starfield-accent iframe');
  await hero.waitFor();
  const frame=await hero.contentFrame();
  await frame.locator('html[data-rendered="true"]').waitFor({timeout:45000});
  await page.mouse.move(width*.75,350);
  const before=await frame.locator('canvas').screenshot();
  await page.waitForTimeout(350);
  const after=await frame.locator('canvas').screenshot();
  assert(!before.equals(after),'Stars must animate');
  assert.equal(await page.locator('.tle-starfield-accent').count(),2);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Horizontal overflow');
  const link=page.locator('.hero-cta-row a');
  assert.equal(await link.getAttribute('href'),'/booking-demo/?lang='+ (path==='/'?'en':'es'));
  assert(await link.isVisible(),'Hero demo CTA must remain readable');
  await page.screenshot({path:`qa-screenshots/starfield-${path==='/'?'en':'es'}-${width}.png`});
  await page.locator('.final-section').scrollIntoViewIfNeeded();
  const finalFrame=await page.locator('.final-section iframe').contentFrame();
  await finalFrame.locator('html[data-rendered="true"]').waitFor({timeout:45000});
  // Hidden hero must actually stop rendering, not merely become transparent.
  await page.waitForTimeout(250);
  const paused=await frame.locator('html').evaluate(()=>window.__qaFrames);
  await page.waitForTimeout(300);
  assert.equal(await frame.locator('html').evaluate(()=>window.__qaFrames),paused,'Offscreen hero must pause');
  const finalCTA=page.locator('.final-actions a');
  await finalCTA.click();await page.waitForURL('**/booking-bundle/**');
  assert(await page.locator('body').innerText(),'CTA destination must render');
  assert.deepEqual(errors,[],'No shader or page errors');
  await page.close();console.log(`PASS ${path} ${width}: shader, animation, scroll, pause, CTA, overflow`);
 }
 const reduced=await browser.newPage({reducedMotion:'reduce'});
 await reduced.goto(base,{waitUntil:'networkidle'});
 await reduced.locator('.final-section').scrollIntoViewIfNeeded();
 assert.equal(await reduced.locator('.tle-starfield-accent iframe').count(),0,'Reduced motion must not load WebGL');
 await reduced.close();console.log('PASS reduced motion: static fallback, no Three.js frame');
}finally{await browser.close()}
