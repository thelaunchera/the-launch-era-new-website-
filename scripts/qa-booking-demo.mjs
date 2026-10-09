import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdirSync } from 'node:fs';
const base=process.env.QA_URL||'https://thelaunchera.com';
const screens=[
 {name:'small-phone',width:360,height:780},
 {name:'mobile',width:390,height:844},
 {name:'tablet',width:820,height:1180},
 {name:'desktop',width:1440,height:900}
];
const results=[];const browser=await chromium.launch({headless:true});
mkdirSync('qa-screenshots',{recursive:true});
const ok=label=>{results.push({case:label,pass:true});console.log('PASS',label)};
const fail=(label,e)=>{results.push({case:label,pass:false,reason:String(e)});console.error('FAIL',label,String(e))};
async function check(label,viewport,action){
 const page=await browser.newPage({viewport,deviceScaleFactor:1});
 const errs=[];page.on('pageerror',e=>errs.push(e.message));
 try{await action(page);assert.equal(errs.length,0,'Page JavaScript errors '+errs.join(','));ok(label)}
 catch(e){fail(label,e);await page.screenshot({path:'qa-screenshots/ERROR-'+label.replace(/[^a-z0-9_-]+/gi,'-')+'.png',fullPage:true}).catch(()=>{})}
 finally{await page.close()}
}
for(const v of screens){
 for(const lang of ['en','es']){
  await check('Personalized booking demo '+v.name+' '+lang,v,async p=>{
   const r=await p.goto(base+'/booking-demo/?lang='+lang,{waitUntil:'domcontentloaded',timeout:30000});
   assert.equal(r?.status(),200,'demo HTTP status');
   await p.locator('#demoForm').waitFor();
   assert.equal(await p.locator('html').getAttribute('lang'),lang);
   assert.equal(await p.locator('#language').inputValue(),lang);
   assert.equal(await p.locator('#demoForm input[name="name"]').count(),1);
   assert.equal(await p.locator('#demoForm input[name="email"][type="email"]').count(),1);
   assert.equal(await p.locator('#demoForm input[name="business"]').count(),1);
   assert.equal(await p.locator('#demoForm input[name="serviceArea"]').count(),1);
   assert.equal(await p.locator('#demoForm textarea[name="goal"]').count(),1);
   assert.equal(await p.locator('#submit').count(),1);
   const privacy=await p.locator('#privacy').innerText();
   assert.match(privacy,lang==='es'?/automáticamente.*por correo/i:/automatically/i,'demo must say automatically delivered');
   assert.doesNotMatch(privacy,lang==='es'?/responderte sobre la solicitud/i:/contact you about your request/i,'no manual contact promise');
   const confirmation=await p.locator('#thanksCopy').innerText();
   assert.match(confirmation,lang==='es'?/Promociones.*Spam/i:/Promotions.*Spam/i,'check promotions/spam');
   assert.match(confirmation,lang==='es'?/código de 6 dígitos/i:/6-digit email verification code/i,'email code reminder');
   assert.equal(await p.locator('#ownerTab').count(),0,'Old fake command center no longer available');
   assert.equal(await p.locator('#customerTab').count(),0,'Old fake booking demo no longer available');
   assert.equal(await p.locator('#demoForm input[name="email"]').isVisible(),true);
   assert.equal(await p.locator('form#demoForm').isVisible(),true);
   await p.locator('#demoForm input[name="name"]').fill('Example Visitor');
   await p.locator('#demoForm input[name="email"]').fill('example@example.com');
   await p.locator('#demoForm input[name="business"]').fill('Example Cleaning Company');
   await p.locator('#demoForm input[name="serviceArea"]').fill('Charlotte, NC');
   await p.locator('#demoForm textarea[name="goal"]').fill('Organize follow-ups');
   // Do not submit. A real request would send email / add a lead.
   assert.equal(await p.locator('#demoForm input[name="business"]').inputValue(),'Example Cleaning Company');
   const bounds=await p.evaluate(()=>({scroll:document.documentElement.scrollWidth,width:document.documentElement.clientWidth,
    form:(()=>{let q=document.querySelector('#demoForm').getBoundingClientRect();return [q.left,q.right]})()}));
   assert(bounds.scroll<=bounds.width+3,'No horizontal overflow '+JSON.stringify(bounds));
   assert(bounds.form[0]>=-2&&bounds.form[1]<=bounds.width+2,'Form fits '+JSON.stringify(bounds));
   await p.screenshot({path:'qa-screenshots/'+v.name+'-'+lang+'-personalized-booking.png',fullPage:true});
  });
  await check('Homepage contact only '+v.name+' '+lang,v,async p=>{
   const path=lang==='es'?'/es/':'/';
   const r=await p.goto(base+path,{waitUntil:'domcontentloaded',timeout:30000});
   assert.equal(r?.status(),200,'Homepage HTTP');
   await p.locator('#contacto .contact-form form').waitFor();
   assert.equal(await p.locator('#contacto').count(),1);
   assert.equal(await p.locator('#contacto .contact-form form').count(),1,'Actual contact form appears once');
   assert.equal(await p.locator('#contacto input[name="email"]').count(),1);
   assert.equal(await p.locator('#contacto textarea[name="message"]').count(),1);
   assert.equal(await p.locator('#contacto a[href*="booking-demo"]').count(),0,'No demo link in contact card');
   assert.equal(await p.locator('#contacto .homepage-demo-access').count(),0,'Duplicate demo content removed');
   assert.equal(await p.locator('text=Ask for your Demo').count(),0,'Old personalized modal removed from homepage, preserved at demo page');
   assert((await p.locator('a[href="/booking-demo/?lang='+lang+'"]').count())>0,'Personalized demo link elsewhere on homepage');
   const bounds=await p.locator('#contacto').evaluate(el=>{const a=el.getBoundingClientRect();return {left:a.left,right:a.right,window:document.documentElement.clientWidth}});
   assert(bounds.left>=-2&&bounds.right<=bounds.window+2,'Contact card fits phone');
   await p.screenshot({path:'qa-screenshots/'+v.name+'-'+lang+'-homepage-contact.png',fullPage:true});
  });
  await check('Cleaning App demo unchanged '+v.name+' '+lang,v,async p=>{
   const r=await p.goto(base+'/cleaning-app-demo/?lang='+lang,{waitUntil:'domcontentloaded',timeout:30000});
   assert.equal(r?.status(),200,'Cleaning App preview HTTP');
   await p.locator('#nav button').first().waitFor();
   assert.equal(await p.locator('#nav button').count(),6);
   await p.locator('#nav [data-tab="2"]').click();
   await p.locator('[data-action="done"]').click();
   assert.equal(await p.locator('[data-action="done"]').isDisabled(),true);
   await p.locator('[data-action="reset"]').click();
   assert.equal(await p.locator('#nav [data-tab="0"]').getAttribute('aria-current'),'page');
  });
 }
}
for(const [name,path,href] of [
 ['EN product','/booking-lead-automation','/booking-demo/?lang=en'],
 ['ES product','/es/booking-lead-automation/','/booking-demo/?lang=es']]){
 await check(name,{width:390,height:844},async p=>{
  const r=await p.goto(base+path,{waitUntil:'domcontentloaded',timeout:30000});
  assert.equal(r?.status(),200);
  assert((await p.locator('a[href="'+href+'"]').count())>0,'Personalized demo link missing');
 });
}
// Real phone checks: no horizontal scrolling, readable sales copy, usable fields,
// and buttons whose labels stay inside their bounds. No forms are submitted.
const mobilePaths=[
 '/', '/es/', '/solutions/', '/how-it-works/', '/help/',
 '/booking-lead-automation/', '/es/booking-lead-automation/',
 '/cleaning-web-app/', '/es/cleaning-web-app/',
 '/website-automation/', '/es/website-automation/',
 '/virtual-assistant/', '/es/virtual-assistant/',
 '/free-cleaning-lead-guide/', '/es/free-cleaning-lead-guide/',
 '/booking-demo/?lang=en', '/booking-demo/?lang=es',
 '/booking-flow-intake/', '/es/booking-flow-intake/',
 '/intake/automation/', '/es/intake/automation/',
 '/intake/va/', '/es/intake/va/',
 '/terms.html', '/es/terms.html', '/privacy.html', '/es/privacy.html',
];
for(const viewport of screens.filter(s=>s.width<768)){
 for(const path of mobilePaths){
  const name='Phone readability '+viewport.name+' '+path;
  await check(name,viewport,async p=>{
   const r=await p.goto(base+path,{waitUntil:'networkidle',timeout:45000});
   assert.equal(r?.status(),200,'Page HTTP status');
   await p.evaluate(()=>document.fonts.ready);
   const issues=await p.evaluate(()=>{
    const visible=el=>{const s=getComputedStyle(el);return s.display!=='none'&&s.visibility!=='hidden'&&el.getClientRects().length>0};
    const problems=[];
    if(document.documentElement.scrollWidth>innerWidth+3)problems.push('Horizontal page overflow');
    for(const el of document.querySelectorAll('.service-card p,.section-heading p,.service-hero>p,.service-benefit-grid p,.field input,.field textarea,.field select,body[data-tle-page] input:not([type=hidden]):not([type=checkbox]):not([type=file]),body[data-tle-page] textarea,body[data-tle-page] select')){
     if(visible(el)&&parseFloat(getComputedStyle(el).fontSize)<15.5)problems.push('Small reading text: '+el.tagName+' '+el.className);
    }
    for(const el of document.querySelectorAll('.cta-button,.service-demo-link,.action,.btn')){
     if(!visible(el))continue;
     const s=getComputedStyle(el),b=el.getBoundingClientRect();
     if(parseFloat(s.fontSize)<15.5)problems.push('Small CTA: '+el.textContent.trim());
     if(b.height<47)problems.push('Short CTA: '+el.textContent.trim());
     if(el.scrollWidth>el.clientWidth+2||el.scrollHeight>el.clientHeight+2)problems.push('Clipped CTA: '+el.textContent.trim());
     if(b.left< -2||b.right>innerWidth+2)problems.push('CTA outside viewport: '+el.textContent.trim()+' '+Math.round(b.left)+'..'+Math.round(b.right));
    }
    const notices=[...document.querySelectorAll('.hero-photo .notification')].filter(visible).map(el=>el.getBoundingClientRect());
    for(let i=1;i<notices.length;i++)if(notices[i].top<notices[i-1].bottom+4)problems.push('Overlapping hero activity cards');
    return problems;
   });
   assert.deepEqual(issues,[]);
   if(['/', '/booking-lead-automation/', '/help/', '/booking-demo/?lang=en'].includes(path)){
    await p.screenshot({path:'qa-screenshots/readability-'+viewport.name+'-'+path.replace(/[^a-z0-9]+/gi,'-')+'.png',fullPage:true});
   }
  });
 }
}
// Exercise the actual sales interactions in both languages and all four sizes.
for(const v of screens) for(const lang of ['en','es']) {
 await check('Sales interactions '+v.name+' '+lang,v,async p=>{
  await p.goto(base+(lang==='es'?'/es/':'/'),{waitUntil:'networkidle'});
  const hero=p.locator('.hero-copy');
  if(v.width<768){
   const last=p.locator('.service-grid .service-card').last();
   await last.scrollIntoViewIfNeeded();
   const b=await last.boundingBox();
   assert(b&&b.x>=0&&b.x+b.width<=v.width+2,'Last service reachable in phone rail');
  }
  assert.equal(await hero.locator('a[href="/booking-demo/?lang='+lang+'"]').count(),1);
  for(let i=0;i<3;i++) {
   await p.locator('.walkthrough-controls button').nth(i).click();
   assert.equal(await p.locator('.walkthrough-controls button').nth(i).getAttribute('aria-pressed'),'true');
  }
  await p.locator('.sales-pains summary').first().click();
  assert.equal(await p.locator('.sales-pains details').first().getAttribute('open'),'');
  assert.equal(await p.locator('.sales-pains details').first().locator('.pain-answer').isVisible(),true);
  for(let i=0;i<3;i++) {
   await p.locator('.product-tabs button').nth(i).click();
   assert.equal(await p.locator('.product-tabs button').nth(i).getAttribute('aria-pressed'),'true');
   const bounds=await p.locator('.product-explorer').evaluate(el=>({left:el.getBoundingClientRect().left,right:el.getBoundingClientRect().right,width:innerWidth,scroll:document.documentElement.scrollWidth}));
   assert(bounds.left>=-2&&bounds.right<=bounds.width+2&&bounds.scroll<=bounds.width+3,'Product preview overflow '+JSON.stringify(bounds));
  }
  await p.locator('.purchase-clarity summary').first().click();
  assert.equal(await p.locator('.purchase-clarity details').first().locator('p').isVisible(),true);
  const checkout=p.locator('.final-actions a[href*="service-checkout"]');
  assert.equal(await checkout.getAttribute('href'),'/service-checkout/?offer=booking-flow&lang='+lang);
  await p.locator('.product-tabs button').first().click();
  await p.locator('.sales-pains summary').first().click();
  await p.locator('.purchase-clarity summary').first().click();
  console.log('HOME_HEIGHT',v.name,lang,await p.evaluate(()=>document.documentElement.scrollHeight));
  await p.screenshot({path:'qa-screenshots/sales-'+v.name+'-'+lang+'.png',fullPage:true});
  await hero.scrollIntoViewIfNeeded();
  await p.screenshot({path:'qa-screenshots/sales-hero-'+v.name+'-'+lang+'.png'});
  await p.locator('.booking-section').scrollIntoViewIfNeeded();
  await p.screenshot({path:'qa-screenshots/sales-product-'+v.name+'-'+lang+'.png'});
 });
}
await check('Canonical Booking Page is the emailed demo',{width:390,height:844},async p=>{
 const r=await p.goto(base+'/lead-private-preview.html?business=Example%20Cleaning&area=Charlotte%2C%20NC',{waitUntil:'domcontentloaded'});
 assert.equal(r?.status(),200);
 assert.equal(await p.locator('#categoryTabs button').count(),2);
 assert.equal(await p.locator('[data-category="residential"]').isVisible(),true);
 assert.equal(await p.locator('#residentialServiceList').isVisible(),true);
 await p.locator('[data-category="commercial"]').click();
 assert.equal(await p.locator('#commercialServiceList').isVisible(),true);
 await p.locator('#commercialServiceList .service').first().click();
 assert.equal(await p.locator('#commercial').isVisible(),true);
 assert(await p.locator('#commercialAddons input[data-commercial-addon]').count()>=6);
 await p.locator('#commercialAddons input[data-commercial-addon]').first().check();
 assert.equal(await p.locator('#commercial [data-intent="estimate"]').count(),1);
 await p.locator('#commercial [data-intent="quote"]').click();
 assert((await p.locator('#commercial [data-intent="quote"]').getAttribute('class')).includes('sel'));
 await p.locator('#commercial .back').click();
 await p.locator('[data-category="residential"]').click();
 await p.locator('#residentialServiceList .service').last().click();
 assert.equal(await p.locator('#quote').isVisible(),true);
 assert(await p.locator('#quote [data-quote-addon]').count()>=4);
 assert.equal(await p.locator('#qemailCode').count(),1,'Email verification remains in demo');
 assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+3),'Demo fits mobile width');
 await p.screenshot({path:'qa-screenshots/booking-canonical-home-commercial.png',fullPage:true});
});
await check('Buyer Booking Page uses canonical demo template',{width:390,height:844},async p=>{
 await p.goto(base+'/booking/?owner_preview=1',{waitUntil:'domcontentloaded'});
 await p.waitForURL(url=>url.pathname==='/lead-private-preview.html'&&url.searchParams.get('owner_preview')==='1');
 assert.equal(await p.locator('#categoryTabs').count(),1);
 assert.equal(await p.locator('#leadHero').count(),1);
 const mode=await p.locator('html').getAttribute('class');
 assert.match(mode||'',/buyer-live-loading/,'Owner preview awaits verified Command Center config');
});
await check('Spanish canonical booking demo copy',{width:390,height:844},async p=>{
 await p.goto(base+'/lead-private-preview.html?lang=es',{waitUntil:'domcontentloaded'});
 await p.waitForFunction(()=>document.querySelector('#title')?.textContent==='Elige un servicio');
 assert.equal(await p.locator('html').getAttribute('lang'),'es');
 await p.locator('[data-category="commercial"]').click();
 assert.equal(await p.locator('#commercialServiceList').isVisible(),true);
 await p.locator('#commercialServiceList .service').first().click();
 await p.waitForFunction(()=>document.querySelector('#commercialEyebrow')?.textContent?.includes('COMERCIAL'));
 assert(await p.locator('text=EXTRAS COMERCIALES').count()>0);
 assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+3),'Spanish Booking Page fits phone width');
});
await check('Owner can preview actual buyer template with private intake data',{width:1100,height:950},async p=>{
 const r=await p.goto('https://the-launch-era-crm.dailinsegura17.workers.dev/',{waitUntil:'domcontentloaded'});
 assert.equal(r?.status(),200);
 await p.evaluate(base=>{
  const f=document.createElement('iframe');f.id='qaOwnerPreview';
  f.style.width='700px';f.style.height='900px';
  f.sandbox='allow-scripts allow-forms';
  f.src=base+'/booking/?owner_preview=1&lang=en';
  document.body.append(f);
  const model={
   business_name:'Example Home & Office Cleaning',
   language:'en',timezone:'America/New_York',currency:'USD',
   branding:{headline:'A cleaner space, without the stress.',description:'Residential and office cleaning.',service_area:'Charlotte, NC'},
   services:[
    {id:'00000000-0000-4000-8000-000000000111',name:'Standard Home Cleaning',mode:'flat',price:145,category:'residential',active:true},
    {id:'00000000-0000-4000-8000-000000000112',name:'Office Cleaning',mode:'quote',price:null,category:'commercial',active:true}
   ],
   addons:[{id:'00000000-0000-4000-8000-000000000113',name:'Interior glass & partitions',price:30,category:'commercial',active:true}],
   quote_policy:'review_unpriced_jobs'
  };
  f.addEventListener('load',()=>{f.contentWindow?.postMessage({type:'TLE_OWNER_BOOKING_PREVIEW',config:model},'*')});
 },base);
 const f=p.frameLocator('#qaOwnerPreview');
 await f.locator('#leadName').filter({hasText:'EXAMPLE HOME & OFFICE CLEANING'}).waitFor({timeout:20000});
 assert.match(await f.locator('.top').innerText(),/OWNER DESIGN PREVIEW/);
 await f.locator('[data-category="commercial"]').click();
 assert(await f.locator('#commercialServiceList').isVisible());
 assert(await f.locator('#commercialAddons input[data-addon-id]').count()===1);
 await f.locator('#commercialServiceList .service').first().click();
 assert((await f.locator('#commercial').isVisible()),'Commercial buyer preview is usable');
 assert(!await f.locator('.verify').first().isVisible(),'No email code in private owner preview');
});
// Validate focused service decisions without submitting forms or starting a purchase.
for(const viewport of screens) for(const lang of ['en','es']) for(const product of ['booking','app']){
 await check('Product sales clarity '+viewport.name+' '+lang+' '+product,viewport,async p=>{
  const route=product==='booking'?'booking-lead-automation':'cleaning-web-app';
  await p.goto(base+(lang==='es'?'/es/':'/')+route+'/',{waitUntil:'networkidle'});
  assert.equal(await p.locator('h1').count(),1);
  assert.equal(await p.locator('.service-pain-list details').count(),3);
  for(let i=0;i<3;i++){
   const detail=p.locator('.service-pain-list details').nth(i);
   await detail.locator('summary').click();
   assert(await detail.locator('p').first().isVisible(),'Pain explanation visible');
   await detail.locator('summary').click();
  }
  const faq=p.locator('.service-buy-clarity details');
  assert.equal(await faq.count(),4);
  for(let i=0;i<4;i++){
   await faq.nth(i).locator('summary').click();
   assert(await faq.nth(i).locator('p').isVisible(),'Purchase answer visible');
   await faq.nth(i).locator('summary').click();
  }
  const primary=await p.locator('.service-sales-close .service-cta').getAttribute('href');
  assert.equal(primary,product==='booking'?'/service-checkout/?offer=booking-flow&lang='+lang:'https://app.thelaunchera.com/?entry=signup');
  const alternative=await p.locator('.service-fit a').getAttribute('href');
  assert(alternative.includes(product==='booking'?'cleaning-web-app':'booking-lead-automation'));
  assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+3),'No horizontal overflow');
  await p.locator('.service-sales-close').scrollIntoViewIfNeeded();
  const bounds=await p.locator('.service-sales-close .service-cta').boundingBox();
  assert(bounds&&bounds.height>=47&&bounds.x>=-2&&bounds.x+bounds.width<=viewport.width+2,'Readable closing CTA');
  await p.screenshot({path:'qa-screenshots/product-sales-'+viewport.name+'-'+lang+'-'+product+'.png',fullPage:true});
 });
}
await browser.close();
console.log('SUMMARY',JSON.stringify({pass:results.filter(x=>x.pass).length,failed:results.filter(x=>!x.pass).length,tests:results}));
if(results.some(x=>!x.pass))process.exitCode=1;
