/** Site + Booking Demo flip cards: browser-only. Never book/send/pay. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {chromium} from 'playwright';
const read=p=>readFileSync(p,'utf8');
const en=read('src/components/editorial-sections.tsx'),es=read('src/routes/es.index.tsx');
const component=read('src/components/service-flip-card.tsx');
const css=read('src/components/service-flip-card.css');
const html=read('public/booking-demo-reset.html');
const demoCss=read('public/assets/tle-booking-bubbles-continuity.css');
assert(en.includes('ServiceFlipCard')&&es.includes('ServiceFlipCard'),'Both public languages use flipping service cards');
assert(component.includes('inert={!open}')&&component.includes('inert={open}'),'Only visible card face can be focused');
assert(component.includes('onKeyDown={onKeys}')&&component.includes("event.key==='Escape'"),'Keyboard return required');
assert(css.includes('perspective:900px')&&css.includes('760ms')&&css.includes('prefers-reduced-motion:reduce'),'Site spring/reduced motion');
assert.equal((html.match(/data-flip-card data-service=/g)||[]).length,6,'All six demo services must flip');
assert.equal((html.match(/class="service-flip-select"/g)||[]).length,6,'Only six demo back faces may advance booking');
assert(!html.includes('service-photo-check'),'Do not reintroduce squares over photos');
assert(demoCss.includes('perspective:900px')&&demoCss.includes('760ms')&&demoCss.includes('prefers-reduced-motion:reduce'),'Demo spring/reduced motion');
const base=(process.env.QA_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const browser=await chromium.launch({headless:true});
try {
 for(const [lang,route] of [['en','/'],['es','/es/']]){
  for(const width of [390,820,1440]){
   const page=await browser.newPage({viewport:{width,height:850},reducedMotion:'no-preference'});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto(base+route,{waitUntil:'domcontentloaded',timeout:45000});
   const cards=page.locator('.sales-home #solutions .tle-service-flip, .sales-home #soluciones .tle-service-flip');
   assert.equal(await cards.count(),6,lang+' home service grid must have 6 flip cards');
   const first=cards.first(),front=first.locator('.tle-service-flip__front-button'),back=first.locator('.tle-service-flip__cta');
   assert.equal(await first.locator('.tle-service-flip__back').evaluate(e=>e.inert),true);
   // Focus-within flips to readable detail without navigating.
   await front.evaluate(el=>el.focus());
   await page.waitForFunction(()=>document.querySelector('.sales-home .tle-service-flip')?.classList.contains('is-flipped'));
   assert.equal(await first.locator('.tle-service-flip__back').evaluate(e=>e.inert),false);
   const href=await back.getAttribute('href');assert(href?.startsWith('/'),lang+' back CTA must be a real site link');
   await page.keyboard.press('Escape');
   await page.waitForFunction(()=>!document.querySelector('.sales-home .tle-service-flip')?.classList.contains('is-flipped'));
   assert.equal(await first.locator('.tle-service-flip__back').evaluate(e=>e.inert),true);
   assert.deepEqual(errors,[],lang+' '+width+' home JS errors');
   await page.close();
   console.log('PASS site flip '+lang+' '+width);
  }
 }
 for(const width of [360,390,820,1440]){
  const page=await browser.newPage({viewport:{width,height:850},reducedMotion:'no-preference'});
  const errors=[],writes=[];page.on('pageerror',e=>errors.push(e.message));
  page.on('request',r=>{if(['POST','PATCH','PUT','DELETE'].includes(r.method()))writes.push(r.url())});
  await page.goto(base+'/booking-demo-reset.html?lang=en',{waitUntil:'domcontentloaded'});
  const card=page.locator('#resServices .service-flip-card').first();
  assert.equal(await page.locator('.service-flip-card').count(),6);
  assert.equal(await card.locator('.service-flip-back').evaluate(el=>el.inert),true);
  await card.locator('.service').dispatchEvent('click');
  assert.equal(await page.locator('#detailsPanel').isVisible(),false,'Flip may not skip to booking form');
  assert.equal(await card.locator('.service-flip-back').evaluate(el=>el.inert),false);
  await card.locator('.service-flip-select').click();
  assert.equal(await page.locator('#detailsPanel').isVisible(),true,'Only deliberate back CTA should open form');
  assert.deepEqual(writes,[],'Demo flip must not submit a booking');
  assert.deepEqual(errors,[],width+' JS errors');
  await page.close();
  console.log('PASS demo flip '+width);
 }
 for(const [route,selector] of [['/','.tle-service-flip'],['/booking-demo-reset.html?lang=es','.service-flip-card']]){
  const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
  await page.goto(base+route,{waitUntil:'domcontentloaded'});
  const card=page.locator(selector).first();
  await page.waitForFunction(s=>document.querySelector(s)?.classList.contains('is-flipped'),selector);
  const state=await card.evaluate(el=>({transform:getComputedStyle(el.querySelector(selectorFrom(el))).transform,backInert:el.querySelector(el.matches('.tle-service-flip')?'.tle-service-flip__back':'.service-flip-back').inert}));
  function selectorFrom() {return '.tle-service-flip__inner';}
  assert(!state.backInert,'Reduced motion should expose final back face');
  await page.close();
 }
 console.log('PASS flip cards EN ES demo and reduced motion');
} finally {await browser.close();}
