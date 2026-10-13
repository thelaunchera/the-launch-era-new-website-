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
   // Verify the last card from the page directly: browser scroll-snap can stall locator auto-scroll.
   const b=await p.evaluate(async()=>{
    const rail=document.querySelector('.sales-home .service-grid');
    const last=rail?.querySelector('.service-card:last-child');
    if(!rail||!last)return null;
    rail.style.scrollBehavior='auto';
    rail.style.scrollSnapType='none';
    rail.scrollLeft=rail.scrollWidth;
    await new Promise(resolve=>setTimeout(resolve,120));
    const rect=last.getBoundingClientRect();
    return {x:rect.x,width:rect.width};
   });
   assert(b&&b.x>=-2&&b.x+b.width<=v.width+2,'Last service reachable in phone rail');
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
  await p.locator('.general-faq summary').first().click();
  assert.equal(await p.locator('.general-faq details').first().locator('p').isVisible(),true);
  const checkout=p.locator('.final-actions a[href*="booking-bundle"]');
  assert.equal(await checkout.getAttribute('href'),'/booking-bundle/?lang='+lang);
  await p.locator('.product-tabs button').first().click();
  await p.locator('.sales-pains summary').first().click();
  await p.locator('.general-faq summary').first().click();
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
 const hero=await p.locator('#leadHero').evaluate(el=>getComputedStyle(el,'::before').backgroundImage);
 assert.match(hero,/whole-home.png/,'Mobile hero should use approved publicly shared home imagery from the owner Drive photo pack');
 assert.equal(await p.locator('.demo-why').count(),0,'Remove repetitive sales section to make demo concise');
 assert.equal(await p.locator('.demo-results .demo-result-card').count(),0,'Remove redundant feature cards');
 assert.equal(await p.locator('.demo-feature-bar').isVisible(),false,'Old numbered feature strip must not interrupt the demo');
 assert.match(await p.locator('.demo-headline').innerText(),/CLEAN\s*ELEVATED/,'Approved editorial headline remains in the sample demo');
 const layout=await p.evaluate(()=>{
  const h=document.querySelector('#leadHero');
  const photo=getComputedStyle(h,'::before');
  return {scrollWidth:document.documentElement.scrollWidth,viewport:innerWidth,photo:photo.backgroundImage,heroHeight:h.getBoundingClientRect().height,headingWidth:document.querySelector('.demo-headline').getBoundingClientRect().width};
 });
 assert.equal(layout.scrollWidth<=layout.viewport+3,true,'No horizontal scrolling in approved phone design');
 assert.match(layout.photo,/whole-home.png/,'Phone displays approved Drive home photo first');
 assert.equal(await p.locator('#demoCinematicStory').count(),1,'The cinematic scroll chapter is present');
 assert.equal(await p.locator('.demo-cinematic-photo').count(),1,'Cinematic photo region is present');
 assert.equal(await p.locator('#demoScrollProgress').isVisible().catch(()=>false),false,'Remove distracting scroll status indicator');
 const ssrc=await p.locator('.demo-cinematic-photo').evaluate(el=>getComputedStyle(el,'::before').backgroundImage);
 assert.match(ssrc,/living-suite\.png/,'Cinematic photo is served from versioned site assets, not private Google Drive');

 assert.equal(await p.locator('.demo-hero-cta').count(),1,'Exactly one primary promotional CTA');
 assert.equal(await p.locator('.demo-hero-art').count(),0,'No amateur floating soap bubbles');
 assert.equal(await p.locator('.demo-vertical-note').count(),0,'No duplicate floating slogan');
 assert.equal(await p.locator('.demo-hero-cta').innerText(),'Choose your service','Primary CTA leads to service choices');
 assert.equal(await p.locator('.demo-hero-cta').getAttribute('href'),'#demoServices','Primary CTA navigates to service section');
 assert.equal(await p.locator('.demo-nav-jump').count(),0,'No redundant header CTA');
 assert.equal(await p.locator('.demo-cinematic-overlay').count(),0,'No giant decorative chapter overlay');
 assert.equal(await p.locator('.trust').isVisible(),false,'Remove duplicate benefit pills');
 assert.equal(await p.locator('.demo-showcase-label b').count(),0,'No chunky emoji arrow chips inside service cards');
 await p.locator('#demoCinematicStory').scrollIntoViewIfNeeded();
 await p.waitForTimeout(350);
 assert.equal(await p.locator('.demo-cinematic-copy').isVisible(),true,'Cinematic section remains readable while scrolling');
 assert.equal(await p.locator('html').evaluate(el=>el.classList.contains('demo-editorial')),true,'Shared prospect demo loads editorial design');
 assert.equal(await p.locator('#leadName').innerText(),'PERSONALIZED FOR EXAMPLE CLEANING','Per-lead branding stays intact');
 assert.equal(await p.locator('#demoEditorialNav').isVisible(),true,'Prospect navigation is visible');
 assert.match(await p.locator('#demoBrandName').innerText(),/Example Cleaning/i,'Dynamic demo brand is the intended business');
 assert.equal(await p.locator('.demo-showcase-card').count(),3,'Three editorial cleaning service cards');
 await p.locator('.demo-showcase-card[data-demo-category="commercial"]').click();
 assert.equal(await p.locator('#commercialServiceList').isVisible(),true,'Editorial service card opens actual commercial booking choice');
 const data=await p.locator('#commercial').evaluate(el=>({screenW:document.documentElement.scrollWidth,viewport:innerWidth,fields:[...el.querySelectorAll('input.field,select.field,textarea.field')].filter(x=>!x.hidden).map(x=>({w:x.getBoundingClientRect().width,left:x.getBoundingClientRect().left,right:x.getBoundingClientRect().right}))}));
 assert.equal(data.screenW<=data.viewport+3,true,'Booking fields do not cause horizontal page overflow on iPhone');
 assert.equal(data.fields.every(x=>x.left>=-3 && x.right<=data.viewport+3),true,'All commercial form controls fit iPhone viewport');
 await p.locator('[data-category="residential"]').click();
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
 // The assistant prefill flow intentionally adds a review screen before completing a sample request.
 assert.equal(await p.locator('#tleAiExtraReview').isVisible(),true,'Sample quote opens a review without email verification');
 await p.locator('#tleAiExtraReview button.next:not(.back)').click();
 assert.equal(await p.locator('#done').isVisible(),true,'Reviewed sample quote works without email code');
 assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+3),'Demo fits mobile width');
 await p.screenshot({path:'qa-screenshots/booking-canonical-home-commercial.png',fullPage:true});
});
await check('AI commercial prefill preserves restaurant as Other and shows next step',{width:390,height:844},async p=>{
 await p.goto(base+'/lead-private-preview.html?business=Example%20Cleaning&area=Boynton%20Beach',{waitUntil:'domcontentloaded'});
 await p.waitForFunction(()=>typeof window.tleAIBookingPrefill==='function');
 const applied=await p.evaluate(()=>window.tleAIBookingPrefill({category:'commercial',service:'commercial',commercial_space_type:'Other',commercial_space_description:'Restaurant',square_feet:2200,commercial_floors:2,commercial_restrooms:3,commercial_cleaning_window:'After closing',commercial_special_areas:'Kitchen and high-touch surfaces',frequency:'weekly',company_name:'Sample Restaurant LLC',first_name:'Jamie',last_name:'Miller',notes:'Restaurant needs cleaning'}));
 assert.equal(applied,true,'Assistant should prefill the commercial form');
 assert.equal(await p.locator('#ctype').inputValue(),'Other','Restaurant must never silently become Office');
 assert.equal(await p.locator('#cOtherType').inputValue(),'Restaurant','Original business type must be preserved');
 assert.equal(await p.locator('#cOtherType').isVisible(),true,'Other description should be visible');
 assert.equal(await p.locator('#cbusiness').inputValue(),'Sample Restaurant LLC');
 assert.equal(await p.locator('#cname').inputValue(),'Jamie Miller');
 assert.equal(await p.locator('#csize').inputValue(),'1,500–3,000 sq ft');
 assert.equal(await p.locator('#cfreq').inputValue(),'Weekly');
 assert.equal(await p.locator('#cFloors').inputValue(),'2');
 assert.equal(await p.locator('#cRestrooms').inputValue(),'3');
 assert.equal(await p.locator('#cCleaningWindow').inputValue(),'After closing');
 assert.equal(await p.locator('#cSpecialAreas').inputValue(),'Kitchen and high-touch surfaces');
 await p.locator('#commercialSubmit').click();
 assert.equal(await p.locator('#tleAiExtraReview').isVisible(),true,'Assistant leads to review before finish');
 assert.match(await p.locator('#tleAiExtraReview').innerText(),/Next step:/);
 assert.match(await p.locator('#tleAiExtraReview').innerText(),/Other: Restaurant/);
 await p.locator('#tleAiExtraReview button.next:not(.back)').click();
 assert.equal(await p.locator('#done').isVisible(),true);
 assert.match(await p.locator('#done').innerText(),/No booking or email was sent/);
 assert.match(await p.locator('#done').innerText(),/We have your booking request!/);
 assert.match(await p.locator('#tleSuccessBusiness').innerText(),/Example Cleaning/);
 assert.match(await p.locator('#done').innerText(),/Open Demo Command Center/);
 await p.screenshot({path:'qa-screenshots/ai-commercial-other-phone.png',fullPage:true});
});
await check('Other property option works for unlisted commercial spaces on tablet',{width:820,height:1180},async p=>{
 await p.goto(base+'/lead-private-preview.html?business=Example%20Cleaning',{waitUntil:'domcontentloaded'});
 await p.waitForFunction(()=>typeof window.tleAIBookingPrefill==='function');
 await p.evaluate(()=>window.tleAIBookingPrefill({category:'commercial',service:'commercial',commercial_space_type:'Banquet hall',commercial_space_description:'Banquet hall'}));
 assert.equal(await p.locator('#ctype').inputValue(),'Other');
 assert.equal(await p.locator('#cOtherType').inputValue(),'Banquet hall');
 await p.locator('#ctype').selectOption({label:'Office'});
 assert.equal(await p.locator('#cOtherType').isVisible(),false);
 assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+3),true);
});
await check('Incomplete commercial request points to missing details',{width:390,height:844},async p=>{
 await p.goto(base+'/lead-private-preview.html?business=Demo%20Cleaning%20Co',{waitUntil:'domcontentloaded'});
 await p.waitForFunction(()=>typeof window.tleAIBookingPrefill==='function');
 await p.evaluate(()=>window.tleAIBookingPrefill({category:'commercial',service:'commercial',commercial_space_type:'Other',commercial_space_description:'Bakery',square_feet:1500}));
 await p.locator('#commercialSubmit').click();
 assert.equal(await p.locator('#tleAiExtraReview').isVisible(),true);
 assert.match(await p.locator('#tleAiExtraReview .tle-review-missing').innerText(),/frequency/);
 assert.equal(await p.locator('#tleAiExtraReview button.next:not(.back)').isVisible(),false);
 await p.locator('#tleAiExtraReview .back').click();
 await p.locator('#cfreq').selectOption({label:'Weekly'});
 await p.locator('#cbusiness').fill('Example Bakery');
 await p.locator('#cname').fill('Taylor Brown');
 await p.locator('#commercialSubmit').click();
 assert.equal(await p.locator('#tleAiExtraReview .tle-review-missing').count(),0);
 await p.locator('#tleAiExtraReview button.next:not(.back)').click();
 assert.equal(await p.locator('#done').isVisible(),true);
 assert.equal(await p.locator('#tleSuccessBusiness').innerText(),'Demo Cleaning Co');
 assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+3),true);
});
await check('Residential confirmation is branded; no real emails',{width:390,height:844},async p=>{
 let sent=0;
 p.on('request',r=>{if(r.url().includes('tle-booking-flow-inquiry')||r.url().includes('api.resend.com/emails'))sent++;});
 await p.goto(base+'/lead-private-preview.html?business=Palm%20Beach%20Cleaning%20Co&area=Boynton%20Beach',{waitUntil:'domcontentloaded'});
 await p.locator('#residentialServiceList .service').first().click();
 await p.locator('#homes .choice').first().click();
 await p.locator('#beds').selectOption({label:'3 bedrooms'});
 await p.locator('#baths').selectOption({label:'2 bathrooms'});
 await p.locator('#res .next').click();
 assert.equal(await p.locator('#resReview').isVisible(),true);
 assert.match(await p.locator('#resReview .note').innerText(),/Check your request/);
 await p.locator('#resReview .next').click();
 assert.equal(await p.locator('#done').isVisible(),true);
 assert.equal(await p.locator('#tleSuccessBusiness').innerText(),'Palm Beach Cleaning Co');
 assert.match(await p.locator('#done').innerText(),/shortly/i);
 assert.match(await p.locator('#done').innerText(),/No booking or email was sent/);
 assert.equal(sent,0);
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
  const expectedFaqCount=product==='booking'?8:4;
   assert.equal(await faq.count(),expectedFaqCount);
   for(let i=0;i<expectedFaqCount;i++){
   await faq.nth(i).locator('summary').click();
   assert(await faq.nth(i).locator('p').isVisible(),'Purchase answer visible');
   await faq.nth(i).locator('summary').click();
  }
  const primary=await p.locator('.service-sales-close .service-cta').getAttribute('href');
  assert.equal(primary,product==='booking'?'/booking-bundle/?lang='+lang:'https://app.thelaunchera.com/?entry=signup');
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



for(const lang of ['en','es']){
 await check('Combined booking + AI activation discount and mock checkout '+lang,{width:390,height:844},async p=>{
  let request=null;
  await p.route('https://bowacxhmjvrqixtwaikv.supabase.co/functions/v1/tle-booking-bundle-checkout',async route=>{
   if(route.request().method()==='GET'){
    await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({
     enabled:true,percent_off:40,booking_setup_cents:1199,
     plans:{'ai-booking':{setup_due_cents:4740,monthly_cents:2900},'ai-followup':{setup_due_cents:3540,monthly_cents:1900},'ai-business':{setup_due_cents:7140,monthly_cents:3900}}
    })});return;
   }
   request=route.request().postDataJSON();
   await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({url:'https://checkout.stripe.com/c/pay/qa-bundle-only',amount_total:8339})});
  });
  await p.route('https://checkout.stripe.com/**',route=>route.fulfill({status:200,contentType:'text/html',body:'<!doctype html><html><body><h1 id="mockCheckout">Safe checkout preview</h1></body></html>'}));
  await p.goto(base+'/booking-bundle/?lang='+lang,{waitUntil:'networkidle'});
  assert(await p.locator('[data-tle-bundle]').isVisible());
  assert.equal(await p.locator('#tleTotal').innerText(),'$19.99');
  const combos=[['ai-booking','$59.39'],['ai-followup','$47.39'],['ai-business','$83.39'],['','$19.99']];
  for(const [plan,total] of combos){await p.locator('input[name="tle-ai-bundle"][value="'+plan+'"]').check();assert.equal(await p.locator('#tleTotal').innerText(),total);}
  await p.locator('input[name="tle-ai-bundle"][value="ai-business"]').check();
  assert((await p.locator('#tleMonthly').innerText()).includes('$39'));
  await p.locator('#tleCheckoutBtn').click();
  await p.locator('#mockCheckout').waitFor({timeout:12000});
  assert.deepEqual(request,{language:lang,ai_addon:'ai-business'});
 });
 await check('One conditional combined intake '+lang,{width:390,height:844},async p=>{
  await p.goto(base+(lang==='es'?'/es':'')+'/booking-flow-intake/?demo=1&bundle=ai-business',{waitUntil:'domcontentloaded'});
  const intakeDiagnostics=await p.evaluate(()=>{const el=document.getElementById('tleBundleAiIntake');return {url:location.href,exists:!!el,inlineStyle:el?.getAttribute('style'),computed:el?getComputedStyle(el).display:null,hiddenAncestor:el?.closest('[hidden]')?.tagName||'',businessPlan:new URLSearchParams(location.search).get('bundle'),text:document.getElementById('status')?.textContent?.slice(0,100)}});
  assert.equal(await p.locator('#tleBundleAiIntake').isVisible(),true,JSON.stringify(intakeDiagnostics));
  await p.locator('#tleBundleAiIntake details.optional-details > summary').click();
  assert.equal(await p.locator('#tleBundleAiBooking').isVisible(),true);
  assert.equal(await p.locator('#tleBundleAiFollowup').isVisible(),true);
  assert.equal(await p.locator('[name="ai_languages"]').count(),1);
  assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+3));
 });
}

// TLE October desktop visual-system regression checks: no payments or form submissions.
// Booking hero → solutions boundary: the soft wave must never obscure the walkthrough.
for(const lang of ['en','es']){
 for(const width of [320,390,768,1280]){
  await check('Homepage wave clears walkthrough '+lang+' '+width,{width,height:844},async p=>{
   await p.goto(base+(lang==='es'?'/es/':'/'),{waitUntil:'networkidle'});
   const result=await p.evaluate(()=>{
    const note=document.querySelector('.hero-copy .walkthrough-note');
    const stage=document.querySelector('.hero-copy .walkthrough-stage');
    const wave=document.querySelector('.solutions-section > .soft-wave');
    const solutions=document.querySelector('.solutions-section');
    if(!note||!stage||!wave||!solutions)return null;
    const n=note.getBoundingClientRect(),st=stage.getBoundingClientRect(),w=wave.getBoundingClientRect(),sol=solutions.getBoundingClientRect();
    return {noteBottom:n.bottom,stageBottom:st.bottom,waveTop:w.top,sectionTop:sol.top,overflow:document.documentElement.scrollWidth-innerWidth,
      visible: getComputedStyle(note).visibility!=='hidden'};
   });
   assert(result,'Walkthrough and decorative wave must render');
   assert(result.visible,'Walkthrough caption is visible');
   assert(result.noteBottom+10<=result.waveTop,'Caption overlaps transition wave: '+JSON.stringify(result));
   assert(result.stageBottom+10<=result.waveTop,'Interactive steps overlap transition wave: '+JSON.stringify(result));
   assert(Math.abs(result.waveTop-result.sectionTop)<=3,'Wave begins within the next section');
   if(result.overflow>3){const overflowElements=await p.evaluate(()=>[...document.querySelectorAll('body *')].filter(el=>el.getBoundingClientRect().right>innerWidth+3).slice(0,8).map(el=>({tag:el.tagName,className:String(el.className).slice(0,100),right:Math.round(el.getBoundingClientRect().right)})));throw new Error('Horizontal overflow in booking walkthrough: '+JSON.stringify({result,overflowElements}))}

  });
 }
}

for(const lang of ['en','es']){
 await check('Editorial desktop layout '+lang,{width:1440,height:900},async p=>{
  await p.goto(base+(lang==='es'?'/es/':'/'),{waitUntil:'networkidle'});
  const result=await p.evaluate(()=>{
   const css=x=>getComputedStyle(document.querySelector(x));
   const hero=document.querySelector('.sales-home .hero-photo');
   const services=document.querySelector('.sales-home .service-grid');
   return {font:css('.sales-home .hero-photo h1').fontFamily,
    cardCols:css('.sales-home .service-grid').gridTemplateColumns.split(' ').length,
    heroHeight:hero.getBoundingClientRect().height,
    headerHeight:document.querySelector('.site-header .nav-inner').getBoundingClientRect().height,
    bg:css('.sales-home .solutions-section').backgroundColor,
    overflow:document.documentElement.scrollWidth-innerWidth,
    cardCount:services.querySelectorAll('.service-card').length};
  });
  assert.match(result.font,/Prompt/,'Headlines must use the single Prompt web font');
  assert.equal(result.cardCols,3,'Services are aligned in a three-column desktop grid');
  assert(result.heroHeight<=650 && result.heroHeight>=495,'Hero occupies a balanced amount of desktop space');
  assert(result.headerHeight<=85,'Navigation is compact');
  assert(result.cardCount>=5,'All service products remain available');
  assert(result.overflow<=3,'No horizontal scrolling');
 });
}
for(const route of ['/booking-lead-automation/','/cleaning-web-app/','/es/booking-lead-automation/']){
 await check('Editorial service consistency '+route,{width:1280,height:800},async p=>{
  await p.goto(base+route,{waitUntil:'networkidle'});
  const result=await p.evaluate(()=>{
   const hero=document.querySelector('.service-hero');
   const h=hero?.querySelector('h1');
   return {font:h?getComputedStyle(h).fontFamily:'',size:h?parseFloat(getComputedStyle(h).fontSize):0,
    heroBottom:hero?.getBoundingClientRect().bottom||0,
    xOverflow:document.documentElement.scrollWidth-innerWidth};
  });
  assert.match(result.font,/Prompt/);
  assert(result.size<=75 && result.size>=35,'Title remains legible without taking over the whole page');
  assert(result.xOverflow<=3,'Page has no horizontal overflow');
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

// Protect the real homepage hero design, both languages, and the agency hours location.
for(const lang of ['en','es'])for(const viewport of [{name:'phone',width:390,height:844},{name:'tablet',width:820,height:1180},{name:'desktop',width:1440,height:900}]){
 await check('Unified photo hero '+lang+' '+viewport.name,viewport,async page=>{
  const response=await page.goto(base+(lang==='es'?'/es/':'/'),{waitUntil:'networkidle'});
  assert.equal(response?.status(),200);
  const result=await page.evaluate(()=>{
    const hero=document.querySelector('.sales-home .hero-photo');
    const intro=hero?.querySelector('.hero-intro');
    const photo=hero?.querySelector('img.hero-main-image');
    const notice=hero?.querySelectorAll('.hero-notice-flow .notification');
    const footer=document.querySelector('.site-footer .footer-hours');
    const h=hero?.getBoundingClientRect(),a=intro?.getBoundingClientRect();
    const cards=[...(notice||[])].map(n=>n.getBoundingClientRect());
    const countdown=document.querySelector('.announcement-offer .sale-countdown');
    const countdownLabel=countdown?.querySelector('.sale-clock-label')?.getBoundingClientRect();
    const countdownUnits=countdown?.querySelector('.sale-clock-units')?.getBoundingClientRect();
    const countdownRect=countdown?.getBoundingClientRect();
    const photoFilter=photo?getComputedStyle(photo).filter:'';
    const photoBlur=parseFloat(photoFilter.match(/blur\(([\d.]+)px\)/)?.[1]||'99');
    const eyebrow=intro?.querySelector('.eyebrow');
    const description=intro?.querySelector('p');
    return {sameSection:!!intro&&intro.parentElement===hero,blur:photoFilter,photoBlur,noticeCount:notice?.length,
      headingTextReadable:!eyebrow||parseFloat(getComputedStyle(eyebrow).fontSize)>=10.5,
      descriptionReadable:!description||parseFloat(getComputedStyle(description).fontSize)>=14.5,
      compactCountdown:!countdownRect||(countdownRect.height<=72&&(!countdownLabel||!countdownUnits||Math.abs(countdownLabel.top-countdownUnits.top)<=20)),
      noHoursInHero:!/(Mon.Fri|lun.vie|8:30|12:00|48.hours|48.horas)/i.test(intro?.textContent||''),
      footerHasHours:!!footer&&/8:30/.test(footer.textContent||'')&&/12:00/.test(footer.textContent||''),
      boundsOK:!!h&&!!a&&a.left>=-2&&a.right<=innerWidth+2&&cards.every(b=>b.left>=-2&&b.right<=innerWidth+2&&b.top>=h.top&&b.bottom<=h.bottom)&&(!cards[1]||cards[1].top>=cards[0].bottom+5),
      introSeparatedFromCards:cards.length===0||!!a&&a.bottom+12<=cards[0].top,
      horizontalOverflow:document.documentElement.scrollWidth>innerWidth+3};
  });
  assert.equal(result.sameSection,true,'Headline must be on photo');
  assert.match(result.blur,/blur\(/,'Photo must be gently blurred');
  assert(result.photoBlur<=3.5,'Hero photo must remain natural and recognizable');
  if(viewport.width<768){
   assert(result.headingTextReadable,'Small hero heading must be readable');
   assert(result.descriptionReadable,'Hero supporting text must be readable');
   assert(result.compactCountdown,'Offer clock must be compact and stay on one line');
  }
  assert.equal(result.noticeCount,2,'Exactly two phone-style notifications');
  assert(result.noHoursInHero,'Business hours and production details belong outside hero');
  assert(result.footerHasHours,'Public office hours remain in footer');
  assert(result.boundsOK,'Headline and notifications must fit the hero');
  assert(result.introSeparatedFromCards,'Hero text must not collide with example notifications');
  assert.equal(result.horizontalOverflow,false,'No horizontal overflow');
 });
}


// Returning appointment self-service: mocked API only, no actual customers, reservations or emails.
const returnKey="00000000-0000-0000-0000-000000000000";
for(const v of [{name:"phone",width:390,height:844},{name:"tablet",width:820,height:1180}]){
 await check("Secure returning booking access "+v.name,v,async page=>{
   let accessCount=0;
   await page.route("**/functions/v1/tle-booking-return-service",async route=>{
     const request=route.request().postDataJSON()||{};
     const response=request.action==="brand"?{ok:true,brand:{name:"Example Cleaning Co.",primary:"#191919",accent:"#087DFF",logo:""},assistant_enabled:false,booking_url:"/booking/?key="+returnKey}:
       {ok:true,message:"If you have an upcoming booking, we'll send a private link."};
     if(request.action==="request_access")accessCount++;
     await route.fulfill({status:200,contentType:"application/json",body:JSON.stringify(response),headers:{"Access-Control-Allow-Origin":"https://thelaunchera.com"}});
   });
   const response=await page.goto(base+"/booking/return/?key="+returnKey,{waitUntil:"domcontentloaded"});
   assert.equal(response?.status(),200);
   await page.locator("#email").fill("example@example.invalid");
   const enabled=await page.evaluate(()=>({href:location.href,key:new URLSearchParams(location.search).get('key'),buttonDisabled:document.getElementById('sendAccess').disabled,error:document.getElementById('entryError').textContent}));
   assert.equal(enabled.buttonDisabled,false,'Returning access button must be enabled: '+JSON.stringify(enabled));
   await page.locator("#sendAccess").click({timeout:4000});
   await page.waitForFunction(()=>!document.querySelector("#sent").hidden);
   assert.equal(accessCount,1);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+3),true);
 });
 await check("Verified booking greeting and secure reschedule "+v.name,v,async page=>{
   let submitCount=0,submitted=null;
   await page.route("**/functions/v1/tle-booking-return-service",async route=>{
    const body=route.request().postDataJSON()||{};
    if(body.action==="submit"){submitCount++;submitted=body}
    const payload=body.action==="view"?{
     ok:true,brand:{name:"Example Cleaning Co.",primary:"#191919",accent:"#087DFF",logo:""},
     customer_first_name:"Jamie",appointment:{id:returnKey,service:"Deep Cleaning",date:"2026-11-02T15:00:00Z",status:"booked"},
     assistant_enabled:true,booking_url:"/booking/?key="+returnKey,language:"en"
    }:{ok:true,request_saved:true,email_accepted:false};
    await route.fulfill({status:200,contentType:"application/json",body:JSON.stringify(payload),headers:{"Access-Control-Allow-Origin":"https://thelaunchera.com"}});
   });
   const response=await page.goto(base+"/booking/return/?token="+("a".repeat(64)),{waitUntil:"domcontentloaded"});
   assert.equal(response?.status(),200);
   await page.waitForFunction(()=>!document.querySelector("#manage").hidden);
   assert.match(await page.locator("#welcome").innerText(),/Jamie.*welcome back/i);
   assert.match(await page.locator("#assistantLabel").innerText(),/AI BOOKING ASSISTANT/);
   await page.locator('[data-kind="reschedule"]').click();
   await page.locator("#date").fill("2026-11-05");
   await page.locator("#time").fill("10:00");
   await page.locator("#submitRequest").click();
   await page.waitForFunction(()=>!document.querySelector("#complete").hidden);
   assert.equal(submitCount,1);
   assert.equal(submitted.request_type,"reschedule");
   assert.equal(submitted.preferred_date,"2026-11-05");
   assert.equal(submitted.preferred_time,"10:00");
   assert.equal(await page.locator("#completeBrand").innerText(),"Example Cleaning Co.");
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+3),true);
 });
}
await check("Original Booking Page includes secure management access",{width:390,height:844},async p=>{
 const response=await p.request.get(base+"/base-booking.html?key="+returnKey);
 assert.equal(response.status(),200);
 const html=await response.text();
 assert.match(html,/tleManageExistingBooking/);
 assert.match(html,/\/booking\/return\/\?key=/);
 assert.match(html,/tle-return-link\[hidden\]/);
});
await browser.close();
console.log('SUMMARY',JSON.stringify({pass:results.filter(x=>x.pass).length,failed:results.filter(x=>!x.pass).length,tests:results}));
if(results.some(x=>!x.pass))process.exitCode=1;
