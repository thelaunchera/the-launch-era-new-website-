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
const demoInkCss=read('public/assets/tle-demo-ink-service-cards.css');
assert(demoInkCss.includes('service-flip-front .service')&&demoInkCss.includes('#191919'),'Demo ink style must remain scoped');
assert(read('scripts/build_demo_photo_assets.py').includes('1D56-v3lVV6FpBqW3FqYH442kiPVvjlLT'),'Office demo must use approved commercial cleaning photo from Drive');
assert(en.includes('ServiceFlipCard')&&es.includes('ServiceFlipCard'),'Both public languages use flipping service cards');
assert(component.includes('inert={!open}')&&component.includes('inert={open}'),'Only visible card face can be focused');
assert(component.includes('onKeyDown={onKeys}')&&component.includes("event.key==='Escape'"),'Keyboard return required');
assert(css.includes('perspective:900px')&&css.includes('760ms')&&css.includes('prefers-reduced-motion:reduce'),'Site spring/reduced motion');
assert(component.includes('window.location.assign(event.currentTarget.href)'),'Every Explore service link must navigate reliably on Safari');
assert(css.includes('.tle-service-flip{height:570px}'),'Mobile front card must have room for complete descriptions and pricing');
assert(css.includes('transform:none!important;transition:none!important;transform-style:flat'),'Touch devices must avoid 3D link hit-testing');

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
 for(const width of [360,390,820,1440]){
  const page=await browser.newPage({viewport:{width,height:850},reducedMotion:'no-preference'});
  const errors=[],writes=[];page.on('pageerror',e=>errors.push(e.message));
  page.on('request',r=>{if(['POST','PATCH','PUT','DELETE'].includes(r.method()))writes.push(r.url())});
  await page.goto(base+'/booking-demo-reset.html?lang=en',{waitUntil:'domcontentloaded'});
  const card=page.locator('#resServices .service-flip-card').first();
  assert.equal(await page.locator('.service-flip-card').count(),6);
  const visual=await card.locator('.service').evaluate(el=>{
   const photo=el.querySelector('.service-media');
   const copy=el.querySelector('.service-copy');
   const title=el.querySelector('.service-title');
   const price=el.querySelector('.service-price');
   return {border:getComputedStyle(el).borderTopColor,
    photoPosition:getComputedStyle(photo).position,
    copyPosition:getComputedStyle(copy).position,
    titleColor:getComputedStyle(title).color,
    priceColor:getComputedStyle(price).color,
    cardHeight:el.getBoundingClientRect().height,
    photoHeight:photo.getBoundingClientRect().height,
    copyBottom:el.getBoundingClientRect().bottom-copy.getBoundingClientRect().bottom};
  });
  assert.equal(visual.border,'rgb(25, 25, 25)','Card should have refined black ink border');
  assert.equal(visual.photoPosition,'absolute','Photo should fill card instead of a top banner');
  assert.equal(visual.copyPosition,'absolute','Service text should overlay photo, not use a separate banner');
  assert.equal(visual.titleColor,'rgb(255, 255, 255)','Photo headline needs contrast');
  assert.equal(visual.priceColor,'rgb(255, 255, 255)','Photo quote/price needs contrast');
  assert(visual.photoHeight>visual.cardHeight*.95,'Photograph should occupy full card '+JSON.stringify(visual));
  assert(visual.copyBottom>=75,'Photo labels should clear the quote and CTA '+JSON.stringify(visual));
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
 // Touch regression: first tap must ONLY reveal service details, second tap
 // anywhere on the description opens the matching Step 2 form (EN and ES).
 for(const lang of ['en','es'])for(const [type,id] of [['residential','standard'],['commercial','retail']]){
  const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'no-preference'});
  const errors=[],writes=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('request',req=>{if(['POST','PUT','PATCH','DELETE'].includes(req.method()))writes.push(req.url())});
  await page.goto(base+'/booking-demo-reset.html?lang='+lang,{waitUntil:'domcontentloaded'});
  if(type==='commercial')await page.locator('#comTab').click();
  const card=page.locator('.service-flip-card[data-service="'+id+'"]');
  await card.scrollIntoViewIfNeeded();
  const beforeFlip=await card.evaluate(el=>({height:el.getBoundingClientRect().height,scrollY:window.scrollY}));
  await card.locator('.service').click();
  await page.waitForTimeout(850);
  const afterFlip=await card.evaluate(el=>{
    const back=el.querySelector('.service-flip-back');
    return {height:el.getBoundingClientRect().height,scrollY:window.scrollY,
      backHeight:back.clientHeight,contentHeight:back.scrollHeight,
      backVisible:back.getBoundingClientRect().height>0};
  });
  assert(Math.abs(beforeFlip.scrollY-afterFlip.scrollY)<30,lang+' '+id+' flipping should not unexpectedly scroll the whole page: '+JSON.stringify({beforeFlip,afterFlip}));
  assert(Math.abs(beforeFlip.height-afterFlip.height)<2,lang+' '+id+' flip must not change card geometry');
  assert(afterFlip.contentHeight<=afterFlip.backHeight+3,lang+' '+id+' flipped copy/button must not clip or overflow: '+JSON.stringify(afterFlip));
  assert.equal(await page.locator('#detailsPanel').isVisible(),false,lang+' '+id+' first tap may only flip');
  assert.equal(await card.locator('.service-flip-back').evaluate(el=>el.inert),false,lang+' '+id+' back must be tappable');
  await card.locator('.service-flip-back h3').click();
  assert.equal(await page.locator('#detailsPanel').isVisible(),true,lang+' '+id+' second tap on description must open form');
  assert.equal(await card.locator('.service').getAttribute('aria-pressed'),'true',lang+' '+id+' correct service must be selected');
  assert.deepEqual(writes,[],lang+' '+id+' may not send real booking');
  assert.deepEqual(errors,[],lang+' '+id+' browser errors');
  await page.close();
  console.log('PASS two-tap mobile service '+lang+' '+id);
 }
 for(const [route,selector] of [['/','.tle-service-flip'],['/booking-demo-reset.html?lang=es','.service-flip-card']]){
  const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
  await page.goto(base+route,{waitUntil:'domcontentloaded'});
  const card=page.locator(selector).first();
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
 console.log('PASS flip cards EN ES demo and reduced motion');
} finally {await browser.close();}
