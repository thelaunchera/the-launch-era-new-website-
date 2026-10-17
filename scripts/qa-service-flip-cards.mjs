/** Site + Booking Demo flip cards: browser-only. Never book/send/pay. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {chromium} from 'playwright';
const read=p=>readFileSync(p,'utf8');
const en=read('src/components/editorial-sections.tsx'),es=read('src/routes/es.index.tsx');
const component=read('src/components/service-flip-card.tsx');
const css=read('src/components/service-flip-card.css');
const html=read('public/booking-demo-reset.html');
// Private Booking Automation is never served as unprotected public markup.
assert(html.includes('tle-booking-demo-gate')&&html.includes('id="authStep"'),'Private access shell is required');
assert(!html.includes('id="bookingPage"'),'Service cards and booking data must not be public');
assert(read('scripts/build_demo_photo_assets.py').includes('1D56-v3lVV6FpBqW3FqYH442kiPVvjlLT'),'Office demo must use approved commercial cleaning photo from Drive');
assert(en.includes('ServiceFlipCard')&&es.includes('ServiceFlipCard'),'Both public languages use flipping service cards');
assert(component.includes('inert={!open}')&&component.includes('inert={open}'),'Only visible card face can be focused');
assert(component.includes('onKeyDown={onKeys}')&&component.includes("event.key==='Escape'"),'Keyboard return required');
assert(css.includes('perspective:900px')&&css.includes('760ms')&&css.includes('prefers-reduced-motion:reduce'),'Site spring/reduced motion');
assert(component.includes('window.location.assign(event.currentTarget.href)'),'Every Explore service link must navigate reliably on Safari');
assert(css.includes('.tle-service-flip{height:570px}'),'Mobile front card must have room for complete descriptions and pricing');
assert(css.includes('transform:none!important;transition:none!important;transform-style:flat'),'Touch devices must avoid 3D link hit-testing');

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
   // Desktop hover may have opened the card before front-focus; focus a real back control before Escape.
   await back.evaluate(el=>el.focus());
   await page.keyboard.press('Escape');
   await page.waitForFunction(()=>!document.querySelector('.sales-home .tle-service-flip')?.classList.contains('is-flipped'));
   assert.equal(await first.locator('.tle-service-flip__back').evaluate(e=>e.inert),true);
   assert.deepEqual(errors,[],lang+' '+width+' home JS errors');
   await page.close();
   console.log('PASS site flip '+lang+' '+width);
  }
 }
 // Every CTA must navigate from the flipped face, including real touch behavior.
 const serviceRoutes={
  en:['/booking-lead-automation','/ai-booking-assistant','/whatsapp-ai-agent','/cleaning-web-app','/website-automation','/virtual-assistant'],
  es:['/es/booking-lead-automation','/es/ai-booking-assistant','/es/whatsapp-ai-agent','/es/cleaning-web-app','/es/website-automation','/es/virtual-assistant']
 };
 for(const [lang,route] of [['en','/'],['es','/es/']]){
  const expectedRoutes=serviceRoutes[lang];
  for(let i=0;i<expectedRoutes.length;i++){
   const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'no-preference'});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto(base+route,{waitUntil:'domcontentloaded',timeout:45000});
   const card=page.locator('.sales-home .tle-service-flip').nth(i);
   const front=card.locator('.tle-service-flip__front-button');
   const back=card.locator('.tle-service-flip__cta');
   await front.click();
   await page.waitForFunction(index=>document.querySelectorAll('.sales-home .tle-service-flip')[index]?.classList.contains('is-flipped'),i);
   await page.waitForTimeout(820); // Let the 760ms turn finish before a real tap.
   const href=await back.getAttribute('href');
   assert.equal(new URL(href,base).pathname.replace(/\/$/,''),expectedRoutes[i],lang+' service '+i+' points to its own landing');
   const fontWeight=Number(await card.locator('.tle-service-flip__hint').evaluate(el=>getComputedStyle(el).fontWeight));
   assert(fontWeight<700,lang+' front tap hint should stay secondary');
   await Promise.all([
    page.waitForURL(url=>url.pathname.replace(/\/$/,'')===expectedRoutes[i],{timeout:18000}),
    back.click({timeout:12000})
   ]);
   assert.deepEqual(errors,[],lang+' service '+i+' JS errors');
   await page.close();
   console.log('PASS real CTA navigation '+lang+' service '+(i+1));
  }
 }
 // Direct, uninvited links reveal only the invitation screen, never Booking demo content.
 for(const lang of ['en','es']){
  const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
  const response=await page.goto(base+'/booking-demo-reset.html?lang='+lang,{waitUntil:'domcontentloaded'});
  assert.equal(response?.status(),200,'Private demo entry route must exist');
  await page.waitForFunction(l=>document.documentElement.lang===l,lang);
  assert.equal(await page.locator('#authStep').isVisible(),true,lang+' must require invitation');
  assert.equal(await page.locator('.service-flip-card').count(),0,lang+' private service cards must not be public');
  assert.equal(await page.locator('#bookingPage').count(),0,lang+' private Booking data must not be public');
  assert((await page.locator('#requestLink').getAttribute('href'))?.includes('/booking-demo/'));
  await page.close();
 }
 for(const [route,selector] of [['/','.tle-service-flip']]){
  const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
  await page.goto(base+route,{waitUntil:'domcontentloaded'});
  const card=page.locator(selector).first();
  await card.locator('.tle-service-flip__front-button').focus();
  await page.waitForFunction(s=>document.querySelector(s)?.classList.contains('is-flipped'),selector);
  const state=await card.evaluate(el=>{
    const site=el.matches('.tle-service-flip');
    const inner=el.querySelector(site?'.tle-service-flip__inner':'.service-flip-inner');
    const back=el.querySelector(site?'.tle-service-flip__back':'.service-flip-back');
    return {transform:getComputedStyle(inner).transform,transition:getComputedStyle(inner).transitionDuration,backInert:back.inert};
  });
  assert(!state.backInert&&state.transform==='none','Reduced motion should expose final back face without any rotation: '+JSON.stringify(state));
  await page.close();
 }
 console.log('PASS homepage flip cards EN ES, private gate and reduced motion');
} finally {await browser.close();}
