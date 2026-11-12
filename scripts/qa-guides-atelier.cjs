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
   assert.equal(await page.locator('.tle-resource-card').count(),7);
   assert.equal(await page.locator('.tle-prompt-card').count(),3);
   assert.equal(await page.locator('.vault-photo-help').count(),3,'public photo prompts include steps');
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'no horizontal overflow at '+width);
   assert.equal(await page.locator('.hero-video source').getAttribute('src'),'/guias/assets/dailin-avatar-hero-loop.mp4','hero video source unchanged');
   assert.equal(await page.locator('.hero-video').getAttribute('autoplay'),'','hero video autoplay unchanged');
   assert.ok(await page.locator('.hero-poster').evaluate(async img=>{await img.decode();return img.naturalWidth>0}),"hero poster");
   assert.equal(await page.locator('.hero-vault').count(),1,'Vault founder hero present');
   assert.equal(await page.locator('.hero-actions .button').count(),2,'two working hero actions');
   assert.deepEqual(await page.locator('.hero-actions .button').evaluateAll(els=>els.map(el=>el.getAttribute('href'))),['#guias','#recursos'],'actions point to guides and Vault');
   assert.equal(await page.locator('.hero-topics a').count(),4,'four linked topics');
   assert.deepEqual(await page.locator('.hero-topics a').evaluateAll(els=>els.map(el=>el.getAttribute('href'))),['#guias','?guide=google-flow-avatar','#prompts-fotos','#recursos'],'topic destinations present');
   assert.equal(await page.locator('link[href^="/guias/vault-hero.css"]').count(),1,'new Vault stylesheet loaded exactly once');
   assert.equal(await page.locator('.hero h1').textContent().then(s=>s.includes('Dailin.')),true,'Dailin headline');
   assert.equal(await page.locator('.system-link').textContent(),'Vault','Vault nav label');
   assert.equal(await page.locator('.hero-media').evaluate(el=>getComputedStyle(el).boxShadow),'none','Motion is no longer boxed into a photo card');
   const canvas=await page.evaluate(()=>{
     const sample=selector=>{const s=getComputedStyle(document.querySelector(selector));return {color:s.backgroundColor,image:s.backgroundImage};};
     return {body:sample('body'),root:sample('body>.grid'),sections:['#guias','#recursos','#prompts-fotos','#proximamente','#suscripcion','.how','.products','.consult','footer','.ticker'].map(sample),title:getComputedStyle(document.querySelector('.hero-vault h1')).fontFamily,button:getComputedStyle(document.querySelector('.hero-actions .button')).backgroundColor};
   });
   assert.equal(canvas.body.color,'rgb(250, 246, 237)','site has one continuous warm paper canvas');
   assert.equal(canvas.body.image,'none','no repeated blue background on body');
   for(const section of [canvas.root,...canvas.sections]){
     assert.equal(section.color,'rgba(0, 0, 0, 0)','all page sections share one unbroken canvas');
     assert.equal(section.image,'none','no section-level wallpaper or blue grid');
   }
   assert.ok(canvas.title.includes('Archivo Black'),'reference-inspired heavy display face');
   assert.equal(canvas.button,'rgb(237, 100, 75)','hero CTA uses warm coral palette');

   const motionStyle=await page.locator('.hero-media').evaluate(el=>{
     const css=getComputedStyle(el);
     return {radius:parseFloat(css.borderTopLeftRadius),overflow:css.overflow,border:css.borderTopWidth,shadow:css.boxShadow,background:css.backgroundColor};
   });
   assert.ok(motionStyle.radius>=18,'Motion frame has visibly rounded corners');
   assert.equal(await page.locator('.hero-card').count(),1,'rounded decorative card behind floating portrait');
   assert.equal(await page.locator('.hero-video').evaluate(el=>getComputedStyle(el).objectFit),'contain','portrait video must not crop the head');
   assert.equal(await page.locator('#vault-inquiry-form').count(),1,'consultation uses real inquiry form');
   assert.equal(await page.locator('.vault-form-privacy').count(),1,'form explains privacy');
   assert.equal(await page.locator('#guide-detail .vault-prompt-help').count(),0,'guide hints show inside reader only');
   assert.equal(motionStyle.overflow,'visible','Motion should break out of lower decorative card without clipping head');
   assert.equal(motionStyle.border,'0px','no white frame around Motion');
   assert.equal(motionStyle.shadow,'none','no box shadow around Motion');
   assert.equal(motionStyle.background,'rgba(0, 0, 0, 0)','transparent Motion container');
   assert.ok(await page.locator('.hero-video').evaluate(el=>parseFloat(getComputedStyle(el).borderTopLeftRadius)>=18),'Motion video follows corner radius');
   assert.ok(await page.locator('.hero-poster').evaluate(el=>parseFloat(getComputedStyle(el).borderTopLeftRadius)>=18),'poster follows the same corner radius');


   const grid=await page.locator('#recursos .tle-resource-cards').evaluate(el=>getComputedStyle(el).gridTemplateColumns.split(' ').length);
   assert.ok(grid>=1,'resources have grid columns');
   const switcher=page.locator('.lang a[hreflang="'+(lang==='en'?'es':'en')+'"]');
   await page.locator('.guide .open').first().click();
   const guide=new URL(page.url()).searchParams.get('guide');
   assert.equal(await page.locator('#guide-detail .vault-prompt-help li').count(),3,'guide modal gives visitor clear prompt instructions');
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
   assert.equal(activeStyle.radius,'20px','editorial resource tile rounded consistently');
   assert.deepEqual(errors,[],'no page errors');
   await context.close();
  }
  console.log('[TLE ATELIER] '+width+'px EN/ES, single language selector, working deep links, original hero video, editorial resources and no overflow: OK');
 }
 await browser.close();
})().catch(error=>{console.error(error);process.exit(1)});
