/** Shared lead magnet: same URL in Jessie's email & public sample.
 * Browser-only read/simulation. No real email, booking, buyer mutation or sales lead.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { chromium } from 'playwright';

const origin=(process.env.QA_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const html=readFileSync('public/booking-demo-reset.html','utf8');
const original=readFileSync('public/lead-private-preview.html','utf8');
const sender=readFileSync('supabase/functions/tle-jessie-demo-lead/index.ts','utf8');
const chat=readFileSync('public/assets/tle-demo-reset-lead-magnet.js','utf8');
const template=readFileSync('public/booking-demo/index.html','utf8');
assert.match(sender,/https:\/\/thelaunchera\.com\/lead-private-preview\.html/,'Jessie email should retain the proven public lead-magnet URL');
assert.match(original,/location\.replace\('\/booking-demo-reset\.html'\+location\.search\+location\.hash\)/,'Legacy public URL must preserve every email parameter and lead campaign ID');
assert.match(original,/p\.has\('key'\)\|\|p\.get\('owner_preview'\)==='1'/,'Real buyer/owner previews must not redirect');
assert.match(chat,/tleSampleBooking:/,'Keep the existing Command Center sample handoff');
assert.match(chat,/tle-ai-booking-demo/,'Keep the existing Sonny demo backend with no extra animation');
assert.match(template,/id="demoForm"/,'Personalized lead magnet intake must not be replaced with booking sample');
assert(!/(?:@keyframes|\banimation\s*:|\btransition\s*:|\btransform\s*:|\bzoom\s*:|gsap\.|Flip\.|mix-blend-mode\s*:)/i.test(html),'New public demo must have zero visual zoom/motion');
assert.deepEqual([...html.matchAll(/<link[^>]*rel="stylesheet"[^>]*href="([^"]+)"/g)].map(m=>m[1]),
  ['/assets/tle-demo-hero-portal.css?v=20261016-strike4','/assets/tle-booking-month-wheel.css?v=20261016-responsive2','/assets/tle-booking-premium-refresh.css?v=20261016-sonny-mobile-safe3','/assets/tle-booking-blue-orbs.css?v=20261016-orbs1','/assets/tle-booking-bubbles-continuity.css?v=20261016-drive-slide-reconciled1','/assets/tle-demo-curtain-footer.css?v=20261016-curtain1','/assets/tle-demo-booking-steps.css?v=20261016-steps1'],'Only scoped hero, time wheel, approved cards and original blue bubble treatments may be linked');

const browser=await chromium.launch({headless:true});
const outputs=[];
try {
 for(const [locale,width] of [['en',360],['es',390],['en',820],['es',1024],['en',1440]]){
  const page=await browser.newPage({viewport:{width,height:880},reducedMotion:'no-preference'});
  const pageErrors=[],posted=[];
  page.on('pageerror',e=>pageErrors.push(e.message));
  page.on('request',r=>{if(['POST','PUT','DELETE','PATCH'].includes(r.method()))posted.push(r.url())});
  const qs=new URLSearchParams({business:'Bright & Tidy Cleaning',area:'Miami Beach',rid:'email-test-42',source:'jessie_email',lang:locale});
  await page.goto(origin+'/lead-private-preview.html?'+qs.toString(),{waitUntil:'load',timeout:45000});
  await page.waitForURL('**/booking-demo-reset.html?*',{timeout:12000});
  await page.locator('#pageTitle').waitFor({state:'visible'});
  assert.equal(await page.locator('#leadBusiness').textContent(),'Bright & Tidy Cleaning','Email business name lost');
  assert.match(await page.locator('#leadArea').textContent(),/Miami Beach/,'Email service area lost');
  assert.equal(await page.locator('#bookingPortalCompany').textContent(),'Bright & Tidy Cleaning','Email recipient business must show in photo hero');
  assert.equal(await page.locator('#bookingPortalCompanyFinal').textContent(),'Bright & Tidy Cleaning','Business must remain visible in both hero scenes');
  assert.equal(await page.locator('#leadContext').isVisible(),false,'Do not repeat name in booking panel');

  assert.equal(new URL(page.url()).searchParams.get('source'),'jessie_email','Email attribution lost');
  const context=await page.evaluate(()=>{
   const root=document.querySelector('.flow');
   const form=root.getBoundingClientRect();
   return {viewport:innerWidth,scroll:document.documentElement.scrollWidth-innerWidth,
     size:getComputedStyle(document.querySelector('#pageTitle')).fontSize,
     cssSheets:document.styleSheets.length,
     importCount:document.querySelectorAll('link[rel=stylesheet]').length,
     cards:[...document.querySelectorAll('.service')].map(x=>({label:x.dataset.id,width:x.getBoundingClientRect().width,height:x.getBoundingClientRect().height,
      imageWidth:x.querySelector('.service-media')?.getBoundingClientRect().width||0,
      imageHeight:x.querySelector('.service-media')?.getBoundingClientRect().height||0})),
     onScreen:form.left>=0&&form.right<=innerWidth+1
   };
  });
  assert(context.scroll<=2&&context.onScreen,locale+' '+width+' overflow '+JSON.stringify(context));
  assert.equal(context.importCount,7,'Seven approved scoped stylesheets including accessible booking steps; no legacy effects');
  assert.equal(context.cards.length,6,'Exactly six service choices, none Post-Construction');
  assert(context.cards.filter(x=>x.width>0).length===3,'Only one service category may be visible');
  assert(context.cards.filter(x=>x.width>0).every(x=>x.width>225&&x.height>=280&&x.imageWidth>x.width*.94&&x.imageHeight>=125),
    locale+' '+width+' service must remain an image-topped CARD, not a mini-photo list '+JSON.stringify(context));
  assert.equal(await page.locator('.service-media img').count(),6,'Six full-width service photographs required');
  assert.equal(await page.locator('.service-photo-check').count(),0,'No checkbox decoration over service imagery');
  assert.equal(await page.locator('input[name="demo-extras"]').count(),4,'Real optional checkboxes belong inside form details');
  await page.locator('#resServices .service-media img').first().scrollIntoViewIfNeeded();
  await page.waitForFunction(()=>{
    const photos=[...document.querySelectorAll('#resServices .service-media img')];
    return photos.length===3&&photos.every(img=>img.complete&&img.naturalWidth>=400);
  },null,{timeout:12000});
  assert.equal(await page.locator('#bookingPortalHeadline').getAttribute('aria-label'),
    locale==='es'?'Haz que tus reservas sean extraordinarias.':'Make your booking flow remarkable.');
  assert.equal(await page.locator('#bookingPortalEnter').count(),1,'Missing hero window zoom entrance');
  assert.equal(await page.locator('#sonnyToggle').count(),1,'Sonny missing');
  assert.equal(await page.locator('#trackerLink').count(),1,'Sample Command Center link missing');
  // Prevent the original iPhone regression: an opened chat must not remain
  // over prices, services, or Before & After as visitors continue scrolling.
  if(width<=390){
    const floating=page.locator('.sonny');
    const collapsed=await floating.boundingBox();
    assert(collapsed.width>=55&&collapsed.width<=65,'Sonny stays a small round robot by default');
    await page.locator('#sonnyToggle').click();
    await page.locator('#sonnyBody').waitFor({state:'visible'});
    const expanded=await floating.boundingBox();
    assert(expanded.width<=width-30&&expanded.height<=(880*.56+6),
      'Open Sonny must be short enough to preserve the booking viewport: '+JSON.stringify(expanded));
    await page.waitForTimeout(800); // Do not confuse the click/focus settling with user scroll.
    await page.evaluate(()=>window.scrollBy(0,95));
    await page.waitForFunction(()=>document.getElementById('sonnyBody')?.hidden===true,
      null,{timeout:5000});
    assert.equal(await page.locator('#sonnyToggle').getAttribute('aria-expanded'),'false');
    await page.locator('#sonnyToggle').click();
    assert.equal(await page.locator('#sonnyBody').isVisible(),true,'Sonny must reopen normally');
    await page.locator('#sonnyToggle').click();
    assert.equal(await page.locator('#sonnyBody').isHidden(),true);
  }
  const tracker=new URL(await page.locator('#trackerLink').getAttribute('href'),origin);
  assert.equal(tracker.searchParams.get('rid'),'email-test-42');
  assert.equal(tracker.searchParams.get('business'),'Bright & Tidy Cleaning');

  if(width===360||width===390){
   const deep=page.locator('.service-flip-card[data-service="deep"]');
   await deep.locator('.service').dispatchEvent('click');
   assert.equal(await page.locator('#detailsPanel').isVisible(),false,'Service flip previews details first');
   await deep.locator('.service-flip-select').click();
   assert.equal(await page.locator('#detailsPanel').isVisible(),true);
   assert.equal(await page.locator('#chooseNext').isVisible(),false);
   await page.locator('#customerName').fill('Demo Test');
   await page.locator('#customerEmail').fill('test@example.invalid');
   await page.locator('#customerZip').fill('33139');
   await page.locator('#preferredDate').fill('2027-11-15');
   await page.locator('input[name="demo-extras"][value="petsLabel"]').check();
   await page.locator('input[name="demo-extras"][value="fridgeLabel"]').check();
   await page.locator('#reviewNext').click();
   await page.locator('#reviewPanel').waitFor({state:'visible'});
   assert.match(await page.locator('#reviewList').innerText(),/Deep Cleaning|Limpieza profunda/);
   assert.match(await page.locator('#reviewList').innerText(),locale==='es'?/Mascotas en casa/:/Pets at home/);
   await page.locator('#finish').click();
   await page.locator('#completePanel').waitFor({state:'visible'});
   const session=await page.evaluate(()=>{
     const q=new URLSearchParams(location.search);
     const key='tleSampleBooking:'+JSON.stringify([q.get('business')||'',q.get('lead')||'',q.get('rid')||'']);
     return JSON.parse(sessionStorage.getItem(key)||'null');
   });
   assert(session&&session.demoOnly===true&&session.service&&session.email==='test@example.invalid'
     &&session.extras?.includes('petsLabel')&&session.extras?.includes('fridgeLabel'),'Lead magnet optional requests not saved to sample handoff');
   await page.locator('#trackerLink').click();
   await page.waitForURL('**/lead-demo-tracker.html?*');
   assert.match(await page.locator('body').innerText(),/Bright & Tidy Cleaning/,'Sample tracker personalization missing');
   await page.goBack({waitUntil:'load'});
  }

  if(width===820) {
    await page.locator('#comTab').click();
    assert.equal(await page.locator('#comServices').isVisible(),true);
    assert.equal(await page.locator('#resServices').isVisible(),false);
    const medical=page.locator('.service-flip-card[data-service="medical"]');
     await medical.locator('.service').dispatchEvent('click');
     await medical.locator('.service-flip-select').click();
    assert.equal(await page.locator('#comDetails').isVisible(),true);
    assert.equal(await page.locator('#resDetails').isVisible(),false);
    await page.locator('#backDetails').click();
    await page.locator('#customQuote').click();
    assert.equal(await page.locator('#comDetails').isVisible(),true,'Custom commercial request lost');
  }

  if(width===1440){
   let call=null;
   await page.route('**/functions/v1/tle-ai-booking-demo',async route=>{
     call=route.request().postDataJSON();
     await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({reply:'I can help plan your Deep Cleaning.',ready_for_review:false,booking:{service:'Deep Cleaning'},mode:'demo_only',booking_created:false,email_sent:false})});
   });
   await page.locator('#sonnyToggle').click();
   await page.locator('#sonnyInput').fill('Can I book a deep clean?');
   await page.locator('#sonnySend').click();
   await page.waitForFunction(()=>document.querySelector('#sonnyLog')?.textContent?.includes('I can help plan your Deep Cleaning.'));
   assert.equal(call?.business_name,'Bright & Tidy Cleaning','Sonny lost original email personalization');
   assert.equal(call?.language,locale);
   assert.equal(call?.service_area,'Miami Beach');
   assert.equal(await page.locator('#sonnyBody').isVisible(),true);
   await page.locator('#sonnyToggle').click();
   assert.equal(await page.locator('#sonnyBody').isVisible(),false,'Sonny chat must close without overlay effects');
   assert.equal(posted.filter(x=>!x.includes('tle-ai-booking-demo')).length,0,'Unexpected write from browsing');
  }else assert.deepEqual(posted,[],'Lead-magnet preview cannot create real orders or send emails');
  assert.deepEqual(pageErrors,[],'Demo JS exceptions '+locale+' '+width);
  outputs.push({locale,width,context});
  console.log('PASS CLEAN_LEAD_MAGNET '+locale+' '+width);
  await page.close();
 }
 // The paid-client key and owner preview continue using the original booking page.
 const protectedPage=await browser.newPage({javaScriptEnabled:false});
 for(const qs of ['?key=customer-token-placeholder&lang=en','?owner_preview=1&lang=es']){
   await protectedPage.goto(origin+'/lead-private-preview.html'+qs,{waitUntil:'domcontentloaded'});
   assert.equal(await protectedPage.locator('#residentialServiceList').count(),1,
     'Existing client booking template must remain in the original HTML');
 }
 await protectedPage.close();
 console.log('[CLEAN LEAD MAGNET QA PASS] '+JSON.stringify(outputs));
}finally{await browser.close();}
