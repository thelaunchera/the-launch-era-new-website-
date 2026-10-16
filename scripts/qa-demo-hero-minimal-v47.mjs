/** Public sample v47 only. No actual booking, data changes or payment requests. */
import assert from 'node:assert/strict';
const { chromium }=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=(process.env.QA_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const browser=await chromium.launch({headless:true});
try {
 for(const [lang,width] of [['en',360],['es',390],['en',820],['es',1440]]) {
  const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});
  const writes=[],errors=[];
  page.on('request',r=>{if(['POST','PUT','PATCH','DELETE'].includes(r.method()))writes.push(r.url())});
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'/lead-private-preview.html?lang='+lang,{waitUntil:'load'});
  await page.waitForSelector('html.tle-demo-v47',{timeout:15000});
  const hero=page.locator('#leadHero'),stage=hero.locator('.tle46-hero-slot');
  const name=hero.locator('#leadName'),title=hero.locator('h1.demo-headline'),cta=hero.locator('.demo-hero-cta');
  assert.equal(await name.isHidden(),true,'Decorative duplicated brand eyebrow must be hidden');
  assert.equal(await hero.locator('.demo-hero-tagline').isHidden(),true,'Old duplicated paragraph must stay hidden');
  assert.equal(await title.isVisible(),true,'Actual hero title remains visible');
  assert.equal(await hero.locator('.tle47-hero-phrase').isVisible(),true,'Requested animated top phrase stays visible');
  assert.equal(await cta.isVisible(),true,'Primary CTA remains visible');
  assert.equal(await hero.locator('.tle46-thumb-slot').count(),4,'Keep the four real thumbnail controls');
  const geometry=await page.evaluate(()=>{
   const hero=document.querySelector('#leadHero'),stage=hero.querySelector('.tle46-hero-slot');
   const title=stage.querySelector('h1.demo-headline'),cta=stage.querySelector('.demo-hero-cta');
   const h=stage.getBoundingClientRect(),a=title.getBoundingClientRect(),c=cta.getBoundingClientRect();
   const label=hero.querySelector('#leadName'),heroText=stage.querySelector('.heroText'),gallery=hero.querySelector('.tle46-gallery');
   const inside=r=>r.width>0&&r.height>0&&r.left>=h.left-3&&r.right<=h.right+3&&r.top>=h.top-3&&r.bottom<=h.bottom+3;
   const hit=document.elementFromPoint(c.left+c.width/2,c.top+c.height/2);
   return {headlineInside:inside(a),ctaInside:inside(c),hitCTA:!!hit?.closest('.demo-hero-cta'),
     caption:!!hero.querySelector('.tle47-hero-phrase'),label:getComputedStyle(label).display,
     beforeText:getComputedStyle(heroText,'::before').content,beforeGallery:getComputedStyle(gallery,'::before').content,
     afterText:getComputedStyle(heroText,'::after').content,overflow:document.documentElement.scrollWidth-innerWidth};
  });
  assert(geometry.headlineInside&&geometry.ctaInside,'Headline and CTA fit within actual hero photograph: '+JSON.stringify(geometry));
  assert(geometry.hitCTA,'CTA must not be covered by next section: '+JSON.stringify(geometry));
  assert.equal(geometry.label,'none','No extra branding layer');
  assert(['none','normal'].includes(geometry.beforeText),'No duplicated text decoration');
  assert(['none','normal'].includes(geometry.afterText),'No duplicated text decoration');
  assert(['none','normal'].includes(geometry.beforeGallery),'No extra gallery overlay');
  assert(geometry.overflow<=7,'No horizontal overflow '+lang+' '+width+': '+geometry.overflow);
  await cta.click();
  await page.waitForSelector('html.tle-demo-booking-active',{timeout:7000});
  assert((await page.locator('#residentialServiceList button.service').count())>=3,'Booking service choices remain');
  assert.deepEqual(writes,[],'No live requests');
  assert.deepEqual(errors,[],'No runtime errors');
  await page.goto(base+'/lead-private-preview.html?key=synthetic-private-check&lang='+lang,{waitUntil:'load'});
  assert.equal(await page.locator('html.tle-demo-v47').count(),0,'Private customer preview unchanged');
  await page.close();
  console.log('PASS clean v47 hero',lang,width);
 }
}finally{await browser.close()}
