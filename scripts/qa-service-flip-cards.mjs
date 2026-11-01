/** Photo-first service cards: read-only browser QA for EN/ES at phone and desktop widths. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {chromium} from 'playwright';
const read=p=>readFileSync(p,'utf8');
const en=read('src/components/editorial-sections.tsx');
const es=read('src/routes/es.index.tsx');
const component=read('src/components/service-flip-card.tsx');
const css=read('src/components/service-flip-card.css');
const privateGate=read('public/booking-demo-reset.html');
assert(en.includes('ServiceFlipCard')&&es.includes('ServiceFlipCard'),'Both locales use the service card component');
assert(component.includes('tle-service-static__link')&&component.includes('href={href}'),'Cards must contain directly navigable links');
assert(!component.includes('rotateY')&&!component.includes('is-flipped'),'Unreliable touch-dependent 3D faces must stay removed');
assert(css.includes('height:auto!important')&&css.includes('grid-template-columns:minmax(0,1fr)!important'),'Cards must shrink to content and stay visible on phones');
assert(privateGate.includes('tle-booking-demo-gate')&&privateGate.includes('id="authStep"'),'Keep private booking protected');
const base=(process.env.QA_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const destinations={en:['/booking-lead-automation','/ai-booking-assistant','/cleaning-web-app','/website-automation','/virtual-assistant'],es:['/es/booking-lead-automation','/es/ai-booking-assistant','/es/cleaning-web-app','/es/website-automation','/es/virtual-assistant']};
const browser=await chromium.launch({headless:true});
try {
 for(const [lang,route] of [['en','/'],['es','/es/']]){
  for(const width of [360,390,820,1440]){
   const page=await browser.newPage({viewport:{width,height:844},isMobile:width<768,hasTouch:width<768});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto(base+route,{waitUntil:'domcontentloaded',timeout:45000});
   const cards=page.locator('.sales-home .solutions-section .tle-service-static');
   await cards.first().waitFor({state:'visible',timeout:20000});
   assert.equal(await cards.count(),5,lang+' '+width+' must have five offered services');
   for(let i=0;i<5;i++){
    const card=cards.nth(i),link=card.locator('a.tle-service-static__link');
    const href=await link.getAttribute('href');
    assert.equal(new URL(href,base).pathname.replace(/\/$/,''),destinations[lang][i],lang+' service '+i+' link');
    assert(await card.locator('img').count()===1,'Service '+i+' must have one photograph');
    assert(await card.locator('h3').isVisible(),'Name must be visible without touching card');
    assert(await card.locator('p').isVisible(),'Description must be visible without touching card');
    assert(await card.locator('.tle-service-static__cta').isVisible(),'Next action must be visible');
    const rect=await card.boundingBox();
    assert(rect&&rect.height>100&&rect.height<(width<768?325:620),'Unusable card height '+JSON.stringify({width,i,rect}));
   }
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
   assert(overflow<=4,lang+' '+width+' page horizontal overflow '+overflow);
   assert.deepEqual(errors,[],lang+' '+width+' JS errors');
   await page.close();
  }
 }
 for(const [lang,route] of [['en','/'],['es','/es/']]){
  const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  await page.goto(base+route,{waitUntil:'domcontentloaded'});
  await page.locator('.tle-service-static__link').first().click();
  await page.waitForURL(u=>u.pathname.includes('booking-lead-automation'),{timeout:15000});
  await page.close();
 }
 console.log('PASS five static service cards in EN/ES at four widths, visible photography and CTA, functional touch links');
} finally {await browser.close();}
