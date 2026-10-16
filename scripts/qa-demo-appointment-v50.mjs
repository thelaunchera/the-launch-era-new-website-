/** TLE v50: real interactions against the isolated fictional residential form. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=(process.env.QA_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const browser=await chromium.launch({headless:true});
fs.mkdirSync('qa-screenshots/demo-v50',{recursive:true});
try{
 for(const [language,width,reduce] of [
  ['en',360,true],['es',390,true],['en',820,true],['en',1440,true],['en',390,false]
 ]){
  const page=await browser.newPage({
   viewport:{width,height:900},deviceScaleFactor:1,
   isMobile:width<760,hasTouch:width<760,
   reducedMotion:reduce?'reduce':'no-preference'
  });
  const errors=[],writes=[];
  page.on('pageerror',err=>errors.push(err.message));
  page.on('request',r=>{if(['POST','PATCH','PUT','DELETE'].includes(r.method()))writes.push(r.url());});
  await page.goto(base+'/lead-private-preview.html?lang='+language,{waitUntil:'load'});
  await page.locator('html.tle-demo-v50').waitFor({state:'attached',timeout:8000}).catch(async e=>{
    const diagnostic=await page.evaluate(()=>({
      href:location.href,classes:document.documentElement.className,
      hasHero:!!document.getElementById('leadHero'),hasStage:!!document.querySelector('.tle46-hero-slot'),
      hasTag:!!document.querySelector('.tle46-hero-slot .demo-hero-tagline'),
      count:document.querySelectorAll('#residentialServiceList > button.service.tle-service-has-photo-v21').length,
      hasV50Script:[...document.scripts].some(s=>s.src.includes('tle-demo-appointment-v50.js'))
    }));
    throw new Error('v50 init timed out: '+JSON.stringify({language,width,errors,diagnostic})+'; '+e.message);
  });
  const hero=await page.evaluate(()=>{
   const image=document.querySelector('#leadHero .tle46-hero-slot>img.tle46-gallery-img');
   const frame=document.querySelector('#leadHero .tle46-hero-slot');
   const box=image.getBoundingClientRect(),fb=frame.getBoundingClientRect();
   return {fit:getComputedStyle(image).objectFit,heightRatio:box.height/fb.height};
  });
  assert.equal(hero.fit,'contain','Hero uses more of the photo without excessive cropping: '+JSON.stringify(hero));
  assert(hero.heightRatio<.7,'Photo no longer fills tall/zoomed hero: '+JSON.stringify(hero));
  await page.locator('#leadHero .demo-hero-cta').click();
  await page.locator('html.tle-demo-booking-active').waitFor({state:'attached',timeout:9000});
  const card=page.locator('#residentialServiceList button.tle-service-has-photo-v21').first();
  await card.click();
  if(!(await page.locator('#res.on').isVisible()))await card.click();
  await page.locator('#res.on').waitFor({state:'visible',timeout:9000});
  assert.equal(await page.locator('#res .tle50-day').count(),5,'Five readable date chips');
  assert.equal(await page.locator('#res #tle-v42-picker-date').isVisible(),false,'Legacy calendar is not duplicated below new picker');
  assert.equal(await page.locator('#res .tle50-time').count(),3,'Preserve the three actual native sample time choices');
  assert.equal(await page.locator('#res .tle50-days[role=radiogroup]').count(),1);
  assert.equal(await page.locator('#res .tle50-slots[role=radiogroup]').count(),1);
  assert.equal(await page.locator('#res .tle50-day[aria-checked=true]').count(),1);
  assert.equal(await page.locator('#time').inputValue(),'','No default time before explicit selection');
  const bar=page.locator('#tle50ContinueBar button');
  assert.equal(await bar.isDisabled(),true,'Continue disabled before time selection');
  await page.locator('#res .tle50-day').nth(1).click();
  const day=await page.locator('#date').inputValue();
  assert.match(day,/^\d{4}-\d{2}-\d{2}$/,'Native date receives selected value');
  const first=page.locator('#res .tle50-time:not(:disabled)').first();
  await first.click();
  const chosen=await page.locator('#time').inputValue();
  assert(chosen,'Original select is populated, no second data system');
  assert.equal(await bar.isEnabled(),true);
  await page.locator('#res .tle50-day').nth(2).click();
  assert.equal(await page.locator('#time').inputValue(),'','Changing the day clears prior slot');
  assert.equal(await bar.isDisabled(),true);
  await page.locator('#res .tle50-time:not(:disabled)').first().click();
  await bar.click();
  await page.locator('#tle50Overlay.is-open [role=dialog]').waitFor({state:'visible'});
  assert.equal(await page.locator('#tle50Overlay .tle50-summary-row').count(),4);
  assert.equal(await page.locator('#tle50Overlay [aria-modal=true]').count(),1);
  assert((await page.locator('#tle50Overlay .tle50-sheet-note').textContent()).length>10,'Sample-only disclaimer retained');
  await page.locator('#tle50Overlay .tle50-cancel').click();
  await page.locator('#tle50Overlay').waitFor({state:'hidden',timeout:1600});
  assert.equal(await bar.isEnabled(),true,'Cancel preserves selection for deliberate retry');
  await bar.click();
  if(width<=390)await page.screenshot({path:'qa-screenshots/demo-v50/'+language+'-'+width+'-sheet.png'});
  await page.locator('#tle50Overlay .tle50-confirm').click();
  await page.locator('#tle50Overlay').waitFor({state:'hidden',timeout:2900});
  assert.equal(await page.locator('#res .tle50-status').textContent(),language==='es'?'Continúa con tus datos de contacto':'Continue with your contact details');
  assert.equal(await page.locator('#res.on').count(),1,'Stay in original residential form');
  assert(await page.locator('#time').inputValue(),'Original time still present after confirmation');
  const bad=await page.evaluate(()=>{
   const el=document.querySelector('#res .tle50-appointment');
   const r=el.getBoundingClientRect();
   return {left:r.left,right:r.right,viewport:innerWidth,scrollWidth:document.documentElement.scrollWidth};
  });
  assert(bad.left>=-3&&bad.right<=width+3,'No booking picker clipped: '+JSON.stringify(bad));
  await page.screenshot({path:'qa-screenshots/demo-v50/'+language+'-'+width+(reduce?'-reduced':'-animated')+'.png',fullPage:true});
  assert.deepEqual(errors,[],'No browser exceptions');
  assert.deepEqual(writes,[],'No network writes during sample selection');
  await page.close();
  console.log('v50 sample PASS',language,width,reduce?'reduced':'animated');
 }
 const privatePage=await browser.newPage();
 await privatePage.goto(base+'/lead-private-preview.html?key=qa-private&lang=en',{waitUntil:'load'});
 assert.equal(await privatePage.locator('html.tle-demo-v50').count(),0,'Private keyed preview not affected');
 assert.equal(await privatePage.locator('#tle50Appointment').count(),0,'No injected widget on client');
 await privatePage.close();
 console.log('PASS sample v50 date/day/slot/sheet/hero/client isolation');
}finally{await browser.close()}