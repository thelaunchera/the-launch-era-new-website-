/** Focused EN/ES smartphone CTA audit. No booking submission or purchases. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {chromium} from 'playwright';
const css=readFileSync('src/components/service-sales-mobile-cta.css','utf8');
const component=readFileSync('src/components/service-sales.tsx','utf8');
const enLanding=readFileSync('src/routes/booking-lead-automation.tsx','utf8');
const esLanding=readFileSync('src/routes/es.booking-lead-automation.tsx','utf8');
const requestForm=readFileSync('public/booking-demo/index.html','utf8');
const sampleDemo=readFileSync('public/booking-demo-reset.html','utf8');
for(const [lang,landing,copy] of [
 ['en',enLanding,['Preview only','not your final design','photos','colors']],
 ['es',esLanding,['La demo es un ejemplo','no tu diseño final','fotos','colores']]
]){
 for(const term of copy)assert(landing.includes(term),lang+' landing must clearly explain the personalized final design: '+term);
}
for(const term of ['Preview only. Your finished Booking Page','your photos','colors, and branding','Es una vista previa. Tu Booking Page final','tus fotos','colores y marca']) assert(requestForm.includes(term),'Private demo request must disclose personalized final design: '+term);
for(const term of ['tle-booking-demo-gate','id="authStep"','id="startStep"','id="codeStep"','action:"content"']) assert(sampleDemo.includes(term),'Private Booking demo must require verified invitation: '+term);
assert(!sampleDemo.includes('id="bookingPage"'),'Booking demo content must not be publicly accessible');
assert(css.includes('.service-sales .service-fit a.service-demo-link'),'Scoped booking/app link style missing');
assert(component.includes("import './service-sales-mobile-cta.css'"),'ServiceSales must import cache-busted scoped styling');
const base=(process.env.QA_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const browser=await chromium.launch({headless:true});
try{
 for(const width of [320,360,390,768]){
  for(const lang of ['en','es']){
   const path=lang==='es'?'/es/booking-lead-automation/':'/booking-lead-automation/';
   const page=await browser.newPage({viewport:{width,height:860},reducedMotion:'reduce'});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   const res=await page.goto(base+path,{waitUntil:'domcontentloaded',timeout:45000});
   assert.equal(res?.status(),200,'Landing must exist: '+path);
   // Landing priority: visitors first try the no-signup public booking sample. Checkout stays
   // available to ready buyers and never submits a purchase during QA.
   const actions=page.locator('.booking-motion-hero .service-hero-actions a');
   assert.equal(await actions.count(),2,lang+' should have a demo action and a purchase option');
   const primary=await actions.nth(0).getAttribute('href');
   const secondary=await actions.nth(1).getAttribute('href');
   assert.equal(primary,'/sample-cleaning/?lang='+lang+'&source=booking-landing',lang+' primary action must open the no-signup sample');
   assert.equal(secondary,'/booking-bundle/?lang='+lang,lang+' purchase option must remain available');
   const close=page.locator('.service-sales-close .service-hero-actions a');
   assert.equal(await close.count(),2,lang+' bottom sales actions must include demo and checkout');
   assert.match((await close.nth(0).getAttribute('href'))||'',new RegExp('/booking-demo/\\?lang='+lang),lang+' bottom primary must request a demo');
   assert.equal(await close.nth(1).getAttribute('href'),secondary,lang+' bottom purchase route changed');
   assert((await actions.nth(0).textContent()||'').toLowerCase().includes(lang==='es'?'ver demos':'see demos'),lang+' should make the sample invitation obvious');
   const disclosure=await page.locator('.booking-motion-hero p').allTextContents();
   assert(disclosure.some(v=>lang==='es'?v.includes('no tu diseño final')&&v.includes('fotos')&&v.includes('colores'):v.includes('not your final design')&&v.includes('photos')&&v.includes('colors')),lang+' landing should explain personalized final brand design');
   const fitDemo=page.locator('.service-sales .service-fit a.service-fit-request-link');
   assert.equal(await fitDemo.count(),1,lang+' qualification should request the personalized demo');
   assert.equal(await fitDemo.getAttribute('href'),'/booking-demo/?lang='+lang+'&source=booking-landing-fit',lang+' mid-page demo route changed');
   const fitLink=await fitDemo.evaluate(el=>{const r=el.getBoundingClientRect();return {left:r.left,right:r.right,height:r.height}});
   assert(fitLink.height>=46 && fitLink.left>=-2 && fitLink.right<=width+2,lang+' mid-page demo link not accessible on phone');
   const link=page.locator('.service-sales .service-fit a.service-demo-link');
   await link.waitFor({state:'visible',timeout:15000});
   const d=await link.evaluate(el=>{
    const r=el.getBoundingClientRect(),s=getComputedStyle(el);
    return {text:el.textContent.trim(),href:el.getAttribute('href'),width:r.width,height:r.height,
      left:r.left,right:r.right,clientWidth:el.clientWidth,scrollWidth:el.scrollWidth,
      clientHeight:el.clientHeight,scrollHeight:el.scrollHeight,font:parseFloat(s.fontSize),
      whiteSpace:s.whiteSpace,lineHeight:s.lineHeight,documentWidth:document.documentElement.scrollWidth,viewport:innerWidth};
   });
   assert(d.href?.includes('cleaning-web-app'),lang+' must retain the real cross-sell page');
   assert(d.height>=47&&d.font>=15.5,lang+' readable CTA target '+JSON.stringify(d));
   assert(d.scrollHeight<=d.clientHeight+2&&d.scrollWidth<=d.clientWidth+2,'Cross-sell text must not clip '+JSON.stringify(d));
   assert(d.left>=-2&&d.right<=width+2,'Link must fit viewport '+JSON.stringify(d));
   assert(d.documentWidth<=width+3,'Booking landing should not horizontally overflow '+JSON.stringify(d));
   assert.deepEqual(errors,[],lang+' page errors '+JSON.stringify(errors));
   console.log('PASS service-cross-link',lang,width,JSON.stringify({height:d.height,text:d.text}));
   await page.close();
  }
 }
 // Diagnostic only: legacy /solutions and /how-it-works may need a separate
 // targeted fix; report offending nodes, never disguise a problem as a pass.
 for(const path of ['/solutions/','/how-it-works/']){
  const page=await browser.newPage({viewport:{width:320,height:800}});
  await page.goto(base+path,{waitUntil:'domcontentloaded'});
  const out=await page.evaluate(()=>({
   overflow:document.documentElement.scrollWidth-innerWidth,
   offenders:[...document.querySelectorAll('main *')].filter(x=>{
    const s=getComputedStyle(x),r=x.getBoundingClientRect();
    return s.position!=='fixed' && r.width && (r.right>innerWidth+3||r.left< -3);
   }).slice(0,12).map(el=>({tag:el.tagName,classes:String(el.className).slice(0,100),text:(el.textContent||'').slice(0,42),left:Math.round(el.getBoundingClientRect().left),right:Math.round(el.getBoundingClientRect().right)}))
  }));
  console.log('DIAGNOSTIC',path,JSON.stringify(out));
  await page.close();
 }
 // Verify the real demo request route renders its correct language, with no
 // form submission, email, purchase or personal data.
 for(const lang of ['en','es']){
  const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
  await page.goto(base+'/booking-demo/?lang='+lang+'&source=booking-landing',{waitUntil:'domcontentloaded',timeout:45000});
  await page.waitForFunction((language)=>document.documentElement.lang===language,lang);
  const submit=page.locator('#submit');
  assert(await submit.isVisible(),lang+' personalized demo request form submit missing');
  assert.match(await submit.textContent()||'',lang==='es'?/continuar para confirmar/i:/continue to confirmation/i,lang+' form language mismatched');
  assert.equal(await page.locator('#serviceBack').getAttribute('href'),lang==='es'?'/es/booking-lead-automation/':'/booking-lead-automation',lang+' demo return path mismatched');
  const designDisclosure=await page.locator('#disclaimer').textContent();
  assert(lang==='es'?designDisclosure.includes('vista previa')&&designDisclosure.includes('fotos, colores y marca'):designDisclosure.includes('Preview only')&&designDisclosure.includes('photos, colors, and branding'),lang+' request form missing personalized final design disclosure');
  await page.close();
 }
 // Direct, uninvited Booking demo visits must show an access gate, never the service content.
 for(const lang of ['en','es']){
  const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
  const response=await page.goto(base+'/booking-demo-reset.html?lang='+lang,{waitUntil:'domcontentloaded',timeout:45000});
  assert.equal(response?.status(),200,lang+' private demo entry route missing');
  await page.waitForFunction(l=>document.documentElement.lang===l,lang);
  assert.equal(await page.locator('#authStep').isVisible(),true,lang+' uninvited visitor must be directed to request access');
  assert.equal(await page.locator('#bookingPage').count(),0,lang+' must not expose interactive Booking demo');
  assert.equal(await page.locator('#demoForm').count(),0,lang+' must not include customer booking form');
  const link=await page.locator('#requestLink').getAttribute('href');
  assert(link?.startsWith('/booking-demo/'),lang+' invite request link must be available');
  await page.close();
 }

 // Public no-signup example must truly move across the three client steps,
 // reveal an illustrative owner request, preserve language and never POST a record.
 for(const lang of ['en','es'])for(const width of [390,820,1440]){
  const page=await browser.newPage({viewport:{width,height:844},reducedMotion:'reduce'});
  const unsafe=[];
  page.on('request',req=>{if(req.method()!=='GET' && /supabase\.co|resend|service-checkout/i.test(req.url()))unsafe.push(req.method()+' '+req.url());});
  const res=await page.goto(base+'/try-booking/?lang='+lang+'&source=browser-qa',{waitUntil:'domcontentloaded',timeout:45000});
  assert.equal(res?.status(),200,'Public sample must render: '+lang);
  assert.equal(await page.locator('html').getAttribute('lang'),lang,'Example language must match');
  assert.equal(await page.locator('#page1').isVisible(),true);
  await page.locator('[data-service="deep"]').click();
  assert.equal(await page.locator('[data-service="deep"]').getAttribute('aria-pressed'),'true');
  await page.locator('#nextBtn').click();
  assert.equal(await page.locator('#page2').isVisible(),true);
  await page.locator('#beds').selectOption('3');
  await page.locator('#nextBtn').click();
  assert.equal(await page.locator('#page3').isVisible(),true);
  await page.locator('#nextBtn').click();
  assert.equal(await page.locator('#dashboardResult').isVisible(),true);
  assert.equal(await page.locator('#count').innerText(),'1');
  assert.match(await page.locator('#outService').innerText(),lang==='es'?/profunda/i:/deep/i);
  assert.equal(await page.locator('#buyLink').getAttribute('href'),'/booking-bundle/?lang='+lang+'&source=public-sample');
  await page.locator('#reviewBtn').click();
  assert.equal(await page.locator('#actionCount').innerText(),'0');
  await page.locator('#nextBtn').click();
  assert.equal(await page.locator('#dashboardResult').isVisible(),false);
  assert.deepEqual(unsafe,[],'The browser-only sample must never send a booking/email/payment');
  await page.locator('#langSwitch').click();
  assert.equal(await page.locator('html').getAttribute('lang'),lang==='es'?'en':'es');
  await page.close();
  console.log('PASS public sample',lang,width,'3 steps, owner result, review, reset, switch and no writes');
 }

 console.log('PASS booking cross-link EN/ES across four sizes');
}finally{await browser.close();}
