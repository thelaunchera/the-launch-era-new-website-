const assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true});
 for(const width of [360,390,768,1024,1440]){
  for(const [path,lang] of [['/guias/','en'],['/es/guias/','es']]){
   const context=await browser.newContext({viewport:{width,height:860},reducedMotion:'reduce',hasTouch:width<=390,permissions:['clipboard-read','clipboard-write']});
   const page=await context.newPage();const errors=[];page.on('pageerror',error=>errors.push(error.message));
   const res=await page.goto('http://127.0.0.1:8172'+path,{waitUntil:'networkidle'});
   assert.equal(res.status(),200);
   assert.equal(await page.locator('html').getAttribute('lang'),lang);
   assert.equal(await page.locator('.lang').count(),1,'one header language group');
   assert.equal(await page.locator('.guide-language').count(),0,'no duplicate anywhere');
   assert.equal(await page.locator('.guide').count(),10);
   assert.equal(await page.locator('.tle-resource-card').count(),8);
   assert.equal(await page.locator('.tle-prompt-card').count(),3);
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'no horizontal overflow at '+width);
   assert.equal(await page.locator('.hero-video source').getAttribute('src'),'/guias/assets/dailin-avatar-hero-loop.mp4','hero video source unchanged');
   assert.equal(await page.locator('.hero-video').getAttribute('autoplay'),'','hero video autoplay unchanged');
   assert.ok(await page.locator('.hero-poster').evaluate(async img=>{await img.decode();return img.naturalWidth>0}),"hero poster");
   const grid=await page.locator('#recursos .tle-resource-cards').evaluate(el=>getComputedStyle(el).gridTemplateColumns.split(' ').length);
   assert.ok(grid>=1,'resources have grid columns');
   const switcher=page.locator('.lang a[hreflang="'+(lang==='en'?'es':'en')+'"]');
   await page.locator('.guide .open').first().click();
   const guide=new URL(page.url()).searchParams.get('guide');
   assert.ok(guide,'guide modal updates link');
   assert.equal(await page.locator('.guide-language').count(),0,'guide reader has no second switch');
   assert.equal(await page.locator('.lang').count(),1,'language switch still singular inside guide reader');
   assert.ok((await switcher.getAttribute('href')).includes('guide='+guide),'guide survives locale change');
   const header=await page.locator('body>.grid header').evaluate(el=>getComputedStyle(el).zIndex);
   assert.ok(parseInt(header)>=250,'language switch is clickable above the reader');
   await switcher.click();
   assert.equal(new URL(page.url()).searchParams.get('guide'),guide,'deep link retained');
   assert.equal(await page.locator('html').getAttribute('lang'),lang==='en'?'es':'en','language actually switched');
   assert.equal(await page.locator('#dialog-backdrop').isVisible(),true,'reader restored in other language');
   await page.keyboard.press('Escape');
   assert.equal(await page.locator('#dialog-backdrop').isHidden(),true);
   const activeStyle=await page.locator('.tle-resource-card').first().evaluate(el=>({radius:getComputedStyle(el).borderRadius,border:getComputedStyle(el).borderColor}));
   assert.equal(activeStyle.radius,'4px','editorial module styling loaded');
   assert.deepEqual(errors,[],'no page errors');
   await context.close();
  }
  console.log('[TLE ATELIER] '+width+'px EN/ES, single language selector, working deep links, original hero video, editorial resources and no overflow: OK');
 }
 await browser.close();
})().catch(error=>{console.error(error);process.exit(1)});
