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
   assert.match(confirmation,lang==='es'?/enlaces.*correo/i:/demo links.*email/i,'Demo delivery confirmed by email');
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
   await p.waitForLoadState('networkidle');
   assert.equal(await p.locator('#contacto').count(),1);
   assert.equal(await p.locator('#contacto .contact-form form').count(),1,'Actual contact form appears once');
   assert.equal(await p.locator('#contacto input[name="email"]').count(),1);
   assert.equal(await p.locator('#contacto textarea[name="message"]').count(),1);
   assert.equal(await p.locator('#contacto a[href*="booking-demo"]').count(),0,'No demo link in contact card');
   assert.equal(await p.locator('#contacto .homepage-demo-access').count(),0,'Duplicate demo content removed');
   assert.equal(await p.locator('text=Ask for your Demo').count(),0,'Old personalized modal removed from homepage, preserved at demo page');
   await p.locator('a[href="/booking-demo/?lang='+lang+'"]').first().waitFor({state:'attached',timeout:10000});
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
// Mock delivery outcomes: these are UI tests and never send a live email.
for(const lang of ['en','es']){
 await check('Repeat demo request shows accurate confirmation '+lang,{width:390,height:844},async p=>{
  let requests=0;
  await p.route('**/functions/v1/tle-personalized-demo',route=>{
   requests++;
   return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,duplicate:true})});
  });
  await p.goto(base+'/booking-demo/?lang='+lang,{waitUntil:'domcontentloaded'});
  await p.locator('#demoForm input[name="name"]').fill('Example Visitor');
  await p.locator('#demoForm input[name="email"]').fill('example@example.com');
  await p.locator('#demoForm input[name="business"]').fill('Example Cleaning Company');
  await p.locator('#demoForm input[name="serviceArea"]').fill('Charlotte, NC');
  await p.locator('#demoForm textarea[name="goal"]').fill('Organize requests');
  await p.locator('#submit').click();
  await p.locator('#success').waitFor({state:'visible'});
  assert.equal(requests,1,'One request per click');
  const heading=await p.locator('#thanksTitle').innerText();
  const body=await p.locator('#thanksCopy').innerText();
  assert.match(heading,lang==='es'?/ya solicitaste/i:/already requested/i,'Repeated request must not be labeled freshly sent');
  assert.match(body,lang==='es'?/no enviamos otro/i:/haven't sent a second/i,'Repeated request must explain no second email');
  await p.locator('#language').selectOption(lang==='es'?'en':'es');
  const translated=await p.locator('#thanksTitle').innerText();
  assert.match(translated,lang==='es'?/already requested/i:/ya solicitaste/i,'Repeated request remains accurate after changing language');
 });
 await check('Failed demo request never claims success '+lang,{width:390,height:844},async p=>{
  await p.route('**/functions/v1/tle-personalized-demo',route=>route.fulfill({
   status:503,contentType:'application/json',body:JSON.stringify({ok:false,error:'internal email delivery failed'})
  }));
  await p.goto(base+'/booking-demo/?lang='+lang,{waitUntil:'domcontentloaded'});
  await p.locator('#demoForm input[name="name"]').fill('Example Visitor');
  await p.locator('#demoForm input[name="email"]').fill('example@example.com');
  await p.locator('#demoForm input[name="business"]').fill('Example Cleaning Company');
  await p.locator('#demoForm input[name="serviceArea"]').fill('Charlotte, NC');
  await p.locator('#demoForm textarea[name="goal"]').fill('Organize requests');
  await p.locator('#submit').click();
  await p.locator('#error').waitFor({state:'visible'});
  assert.equal(await p.locator('#success').isVisible(),false,'No success when delivery fails');
  assert.doesNotMatch(await p.locator('#error').innerText(),/internal email delivery failed/i,'Never display internal error details');
 });
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
await check('Demo uses new photos without changing the original buyer design',{width:390,height:844},async p=>{
 await p.goto(base+'/lead-private-preview.html?business=Example%20Cleaning',{waitUntil:'domcontentloaded'});
 const hero=await p.locator('#leadHero').evaluate(el=>getComputedStyle(el).backgroundImage);
 assert.match(hero,/37184168/,'Personalized demo hero should use the selected bright living room photo');
 await p.evaluate(()=>startQuote('quote'));
 assert.equal(await p.locator('#quote').isVisible(),true);
 assert.equal(await p.locator('#quote .quote-photo').count(),1);
 const special=await p.locator('#quote .quote-photo').evaluate(el=>getComputedStyle(el).backgroundImage);
 assert.match(special,/37184184/,'Special requests use a different real kitchen photo');
 const baseHtml=await (await p.request.get(base+'/base-booking.html')).text();
 assert(baseHtml.includes('photo-1642505172378-a6f5e5b15580'),'Buyer base photo should be preserved');
});
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
 assert.equal(await p.locator('.verify').count(),0,'Sample demo has no email verification');
 await p.locator('#quoteSubmit').click();
 assert.equal(await p.locator('#done').isVisible(),true,'Sample quote works without email code');
 assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+3),'Demo fits mobile width');
 await p.screenshot({path:'qa-screenshots/booking-canonical-home-commercial.png',fullPage:true});
});
await check('Public preview opens only the personalized demo form',{width:390,height:844},async p=>{
 await p.goto(base+'/booking/?owner_preview=1',{waitUntil:'domcontentloaded'});
 await p.waitForURL(url=>url.pathname==='/booking-demo/');
 assert.equal(await p.locator('#demoForm').count(),1);
 assert.equal(await p.locator('#baseServiceGrid').count(),0);
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
await check('Original booking cannot display publicly without a buyer key',{width:390,height:844},async p=>{
 await p.goto(base+'/base-booking.html?owner_preview=1&lang=en',{waitUntil:'domcontentloaded'});
 await p.waitForURL(url=>url.pathname==='/booking-demo/');
 assert.equal(await p.locator('#demoForm').count(),1);
 assert.equal(await p.locator('#baseServiceGrid').count(),0);
});

await check('Verified checkout opens intake without waiting for email',{width:390,height:844},async p=>{
 let requests=0;
 await p.route('**/functions/v1/tle-booking-flow-stripe-complete',async route=>{
  requests++;
  const posted=route.request().postDataJSON();
  assert.equal(posted.session_id,'cs_live_QAOnlyNotARealPayment');
  await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({
   ok:true,email_sent:true,intake_url:'https://thelaunchera.com/booking-flow-intake/?token=qa-only-preview-token',
   amount_total_cents:1999,currency:'USD'
  })});
 });
 await p.goto(base+'/booking-flow-payment-success/?session_id=cs_live_QAOnlyNotARealPayment&lang=en',{waitUntil:'domcontentloaded'});
 await p.locator('#intakeLink:visible').waitFor();
 assert.equal(requests,1);
 assert.match(await p.locator('#heading').innerText(),/Payment confirmed/);
 assert.match(await p.locator('#intakeLink').getAttribute('href'),/booking-flow-intake/);
});
await check('Verified checkout has fallback if onboarding email fails',{width:390,height:844},async p=>{
 await p.route('**/functions/v1/tle-booking-flow-stripe-complete',async route=>{
  await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({
   ok:true,email_sent:false,intake_url:'https://thelaunchera.com/booking-flow-intake/?token=qa-only-preview-token',
   amount_total_cents:1999,currency:'USD'
  })});
 });
 await p.goto(base+'/booking-flow-payment-success/?session_id=cs_live_QAOnlyNotARealPayment&lang=es',{waitUntil:'domcontentloaded'});
 await p.locator('#intakeLink:visible').waitFor();
 assert.match(await p.locator('#status').innerText(),/No pudimos confirmar el envío/);
 assert.equal(await p.locator('#heading').innerText(),'Pago confirmado.');
 assert.match(await p.locator('#intakeLink').getAttribute('href'),/booking-flow-intake/);
});
await check('Unverified checkout never offers a buyer intake',{width:390,height:844},async p=>{
 await p.route('**/functions/v1/tle-booking-flow-stripe-complete',async route=>{
  await route.fulfill({status:402,contentType:'application/json',body:JSON.stringify({error:'Payment not complete'})});
 });
 await p.goto(base+'/booking-flow-payment-success/?session_id=cs_live_QAOnlyNotARealPayment',{waitUntil:'domcontentloaded'});
 await p.locator('#retry:visible').waitFor();
 assert.equal(await p.locator('#intakeLink').isVisible(),false);
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

for(const viewport of screens)for(const lang of ['en','es']){
 await check('Booking layout fills screen '+viewport.name+' '+lang,viewport,async p=>{
  await p.goto(base+'/lead-private-preview.html?business='+encodeURIComponent('Example Home and Office Cleaning Company')+'&area=Charlotte%2C%20NC&lang='+lang+'&layout=wide-hero',{waitUntil:'networkidle'});
  const measure=()=>p.evaluate(()=>{
   const hero=document.querySelector('.hero').getBoundingClientRect();
   const trust=document.querySelector('.trust');
   const clipped=[...document.querySelectorAll('.screen.on button,.screen.on .field,.screen.on .choices,.heroText,.trust')].filter(el=>el.getClientRects().length).filter(el=>{
    const b=el.getBoundingClientRect();return b.left< -1||b.right>innerWidth+1||el.scrollWidth>el.clientWidth+2;
   }).map(el=>el.id||el.className);
   return {heroWidth:hero.width,heroHeight:hero.height,pageWidth:document.documentElement.scrollWidth,width:innerWidth,trustFits:trust.scrollWidth<=trust.clientWidth+2,clipped};
  });
  const start=await measure();
  assert(start.heroHeight>=350,'Hero is large enough');
  assert(start.heroWidth>=(viewport.width<768?viewport.width*.92:Math.min(viewport.width*.85,1100)),'Booking layout uses screen width');
  assert(start.pageWidth<=viewport.width+2,'No horizontal page overflow');
  assert(start.trustFits,'Trust badges wrap instead of scrolling sideways');
  assert.deepEqual(start.clipped,[],'Visible controls fit');
  for(const service of ['res','quote','commercial']){
   await p.evaluate(service=>{if(service==='res')startResidential('Standard Cleaning',120);else if(service==='quote')startQuote();else startCommercial()},service);
   const view=await measure();
   assert(view.pageWidth<=viewport.width+2,'No overflow in '+service);
   assert.deepEqual(view.clipped,[],'Controls fit in '+service);
  }
  await p.screenshot({path:'qa-screenshots/wide-booking-'+viewport.name+'-'+lang+'.png',fullPage:true});
 });
}


for(const offer of ['booking-flow','website-automation','va']){
 for(const lang of ['en','es']){
  await check('Direct localized Stripe checkout '+offer+' '+lang,{width:390,height:844},async p=>{
   const sent=[];
   await p.route('https://bowacxhmjvrqixtwaikv.supabase.co/functions/v1/create-tle-service-checkout',async route=>{
    sent.push(route.request().postDataJSON());
    await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({url:'https://checkout.stripe.com/c/pay/qa-language-check'})});
   });
   await p.route('https://checkout.stripe.com/**',route=>route.fulfill({status:200,contentType:'text/html',body:'<!doctype html><html><head><title>Test Stripe Checkout</title></head><body><h1 id="mockStripe">Stripe checkout simulated: no real payment</h1></body></html>'}));
   await p.goto(base+'/service-checkout/?offer='+offer+'&lang='+lang,{waitUntil:'domcontentloaded'});
   await p.locator('#mockStripe').waitFor({timeout:20000});
   assert.equal(sent.length,1,'Must redirect to Stripe without an extra language-selection step');
   assert.equal(sent[0].offer,offer);
   assert.equal(sent[0].language,lang,'Site language must control the Stripe checkout locale');
  });
 }
}

if(process.env.QA_CHECKOUT_REAL==='1'){
 const endpoint='https://bowacxhmjvrqixtwaikv.supabase.co/functions/v1/create-tle-service-checkout';
 const expectedAmounts={'booking-flow':1999,'website-automation':4199,va:3499};
 for(const [offer,amount] of Object.entries(expectedAmounts)){
  for(const lang of ['en','es']){
   await check('REAL unpaid Stripe checkout session '+offer+' '+lang,{width:390,height:844},async p=>{
    const response=await p.request.post(endpoint,{
     headers:{Origin:'https://thelaunchera.com','Content-Type':'application/json'},
     data:{offer,language:lang}
    });
    const d=await response.json().catch(()=>({}));
    assert.equal(response.status(),200,'Stripe checkout creation response '+JSON.stringify(d));
    assert.match(String(d.url||''),/^https:\/\/checkout\.stripe\.com\//,'Must create a real hosted Stripe checkout session');
    assert.match(String(d.session_id||''),/^cs_live_/,'Must use Stripe LIVE session, no payment attempted');
    assert.equal(d.locale,lang,'Stripe must confirm selected checkout language');
    assert.equal(Number(d.amount_total),amount,'Stripe amount must match published price');
   });
  }
 }
}

await browser.close();
console.log('SUMMARY',JSON.stringify({pass:results.filter(x=>x.pass).length,failed:results.filter(x=>!x.pass).length,tests:results}));
if(results.some(x=>!x.pass))process.exitCode=1;
