/** New public Booking Demo visual reset: no animation, no zoom, no writes.
 * Original keyed/owner preview HTML stays intact on the old route.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { chromium } from 'playwright';
const html=readFileSync('public/booking-demo-reset.html','utf8');
const original=readFileSync('public/lead-private-preview.html','utf8');
assert.match(original,/p\.has\('key'\)\|\|p\.get\('owner_preview'\)==='1'/,'Buyer/private preview gate must stay intact');
assert.match(original,/location\.replace\('\/booking-demo-reset\.html'/,'Public sample must leave legacy effect stack');
assert.match(original,/startResidential\('Standard Cleaning',120\)/,'Original source forms remain for keyed clients');
assert.match(html,/id="sonnyAvatarLauncher"/,'One restored floating Sonny avatar');
assert.match(html,/class="sonny-avatar-mark"/,'Restore original avatar beside in-page Sonny');
assert.equal((html.match(/id="sonnyAvatarLauncher"/g)||[]).length,1,'Exactly one original Sonny floating launcher');
assert.equal((html.match(/src="\/assets\/lead-demo\/ai-demo-robot\.webp"/g)||[]).length,2,'Reuse approved historical Sonny robot artwork in header and launcher');
assert.match(readFileSync('public/assets/tle-demo-reset-lead-magnet.js','utf8'),/sonnyLauncher\.addEventListener\('click'/,'Avatar must open existing Sonny rather than render a second assistant');

assert(!/gsap|Flip\.min|cdn\.jsdelivr|scroll-behavior\s*:\s*smooth|mix-blend-mode/i.test(html),'Booking form must not inherit the old animation library');
assert.match(html,/\/assets\/tle-demo-hero-portal\.css/,'Only scoped requested hero animations are enabled');
const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)];
const inline=scripts.filter(x=>!/<script\s+src=/.test(x[0]));
const external=scripts.filter(x=>/<script\s+src=/.test(x[0]));
assert.equal(inline.length,1,'One compact booking wizard controller');
assert.equal(external.length,3,'Only three scoped scripts: Sonny, appointment and hero portal');
assert.match(external[0][0],/\/assets\/tle-demo-reset-lead-magnet\.js/,'Sonny/lead context must remain unchanged');
assert.match(external[1][0],/\/assets\/tle-booking-month-wheel\.js/,'Full month / wheel script must remain present');
assert.match(external[2][0],/\/assets\/tle-demo-hero-portal\.js/,'Existing hero portal must remain present');
new vm.Script(inline[0][1]);
new vm.Script(readFileSync('public/assets/tle-demo-reset-lead-magnet.js','utf8'));
for(const tag of ['id="resServices"','id="comServices"','id="detailsPanel"','id="reviewPanel"','id="completePanel"','id="customerName"','id="customerEmail"'])assert(html.includes(tag),'Missing service/booking field '+tag);
assert(!/Post-Construction|posconstrucción/i.test(html),'Removed construction tile must stay removed');
const base=(process.env.QA_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const browser=await chromium.launch({headless:true});
try{
 for(const [lang,width] of [['en',360],['es',390],['en',820],['es',1440]]){
   const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'no-preference'});
   const errors=[],writes=[];
   page.on('pageerror',err=>errors.push(err.message));
   page.on('request',request=>{if(['POST','PATCH','PUT','DELETE'].includes(request.method()))writes.push(request.url())});
   await page.goto(base+'/lead-private-preview.html?lang='+lang,{waitUntil:'load',timeout:45000});
   await page.waitForURL('**/booking-demo-reset.html?lang='+lang,{timeout:15000});
   assert.equal(await page.locator('html').getAttribute('lang'),lang);
   const headerAvatar=page.locator('.sonny-avatar-mark img');
   assert(await headerAvatar.evaluate(img=>img.complete&&img.naturalWidth>30),'Original Sonny robot must load in the chat heading');
   const floating=page.locator('#sonnyAvatarLauncher');
   // The Sonny card may already peek into the initial viewport: hiding the
   // floating avatar in that case is correct, not a missing launcher.
   await page.evaluate(()=>window.scrollTo({top:document.body.scrollHeight,behavior:'instant'}));
   await floating.waitFor({state:'visible',timeout:10000});
   const avatarCheck=await floating.evaluate(button=>{
     const image=button.querySelector('img'),r=button.getBoundingClientRect();
     return {loaded:image.complete&&image.naturalWidth>30,left:r.left,right:r.right,bottom:r.bottom,
       imgSrc:new URL(image.getAttribute('src'),location.href).pathname};
   });
   assert(avatarCheck.loaded&&avatarCheck.imgSrc==='/assets/lead-demo/ai-demo-robot.webp','Old robot avatar must load in '+lang);
   assert(avatarCheck.left>=0&&avatarCheck.right<=width+1&&avatarCheck.bottom<=901,'Avatar must stay within phone/tablet/desktop bounds '+JSON.stringify(avatarCheck));
   await floating.click();
   await page.locator('#sonnyBody').waitFor({state:'visible'});
   assert.equal(await page.locator('.sonny').count(),1,'Floating avatar must reuse the one in-page Sonny assistant');
   assert.equal(await floating.getAttribute('aria-expanded'),'true');
   assert.match(await floating.getAttribute('aria-label'),lang==='es'?/Sonny.*demo/i:/Chat with Sonny/);
   await page.locator('#sonnyToggle').click();
   assert.equal(await page.locator('#sonnyBody').isHidden(),true);

   assert.equal(await page.locator('.service').count(),6,'Expected six real service choices');
   assert.equal(await page.locator('.service-media img').count(),6,'Each of the six services needs one full-card photo');
   assert.equal(await page.locator('video,canvas').count(),0,'No cinematic layers, video, or movement');
   assert.equal(await page.locator('button[data-id="standard"]').count(),1);
   await page.locator('button[data-id="standard"]').scrollIntoViewIfNeeded();
   const cardLayout=await page.evaluate(()=>{
     const list=document.getElementById('resServices');
     const cards=[...list.querySelectorAll('button.service')];
     return cards.map(button=>{
       const photo=button.querySelector('.service-media');
       const br=button.getBoundingClientRect(),pr=photo.getBoundingClientRect();
       return {width:br.width,height:br.height,imageWidth:pr.width,imageHeight:pr.height,top:pr.top,cardTop:br.top};
     });
   });
   assert(cardLayout.length===3&&cardLayout.every(x=>x.width>230&&x.imageWidth>x.width*.94&&x.imageHeight>=125&&Math.abs(x.top-x.cardTop)<4),
     lang+' '+width+': service cards must be large photos above titles, NEVER mini image list '+JSON.stringify(cardLayout));
   await page.waitForFunction(()=>{
     const imgs=[...document.querySelectorAll('#resServices .service-media img')];
     return imgs.length===3&&imgs.every(i=>i.complete&&i.naturalWidth>=400);
   },null,{timeout:12000});
   await page.locator('button[data-id="standard"]').click();
   assert.equal(await page.locator('#chooseNext').isEnabled(),true);
   await page.locator('#chooseNext').click();
   await page.locator('#customerName').fill('Sample Customer');
   await page.locator('#customerEmail').fill('sample@example.test');
   await page.locator('#customerZip').fill('33101');
   await page.locator('#preferredDate').fill(new Date(Date.now()+45*86400000).toISOString().slice(0,10));
   await page.locator('#reviewNext').click();
   await page.locator('#reviewPanel').waitFor({state:'visible'});
   assert.match(await page.locator('#reviewList').innerText(),/Sample Customer/);
   await page.locator('#finish').click();
   await page.locator('#completePanel').waitFor({state:'visible'});
   const tracker=await page.locator('#trackerLink').getAttribute('href');
   assert(tracker?.startsWith('/lead-demo-tracker.html?')&&tracker.includes('lang='+lang),
     'Lead magnet must retain demo Command Center handoff');
   const saved=await page.evaluate(()=>[...Object.keys(sessionStorage)]
     .filter(k=>k.startsWith('tleSampleBooking:')).map(k=>JSON.parse(sessionStorage.getItem(k))));
   assert(saved.some(x=>x.demoOnly&&x.name==='Sample Customer'),
     'Sample owner-side request must stay in sessionStorage only');
   await page.locator('#restart').click();
   await page.locator('#comTab').click();
   await page.locator('#comServices .service').first().scrollIntoViewIfNeeded();
   await page.waitForFunction(()=>{
     const imgs=[...document.querySelectorAll('#comServices .service-media img')];
     return imgs.length===3&&imgs.every(i=>i.complete&&i.naturalWidth>=400);
   },null,{timeout:12000});
   const commercial=await page.evaluate(()=>[...document.querySelectorAll('#comServices .service')].map(b=>({
      width:b.getBoundingClientRect().width,
      photo:b.querySelector('.service-media').getBoundingClientRect().width,
      height:b.querySelector('.service-media').getBoundingClientRect().height
   })));
   assert(commercial.every(x=>x.photo>x.width*.94&&x.height>=125),
    lang+' '+width+': commercial should also be photo cards, not thumbnail rows '+JSON.stringify(commercial));

   await page.locator('button[data-id="office"]').click();
   await page.locator('#chooseNext').click();
   assert.equal(await page.locator('#comDetails').isVisible(),true);
   await page.locator('#backDetails').click();
   const layout=await page.evaluate(()=>{
     const rect=document.querySelector('.flow').getBoundingClientRect();
     return {bodyOverflow:document.documentElement.scrollWidth-innerWidth,flowWidth:rect.width,
       slide:document.querySelectorAll('[class*="carousel"],[class*="glow"],.flow[style*="transform"],.service[style*="transform"]').length,
       images:document.images.length,nav:location.pathname};
   });
   assert(layout.bodyOverflow<=2,lang+' '+width+' horizontal overflow '+JSON.stringify(layout));
   assert(layout.flowWidth>290,'Booking flow too narrow '+JSON.stringify(layout));
   assert.equal(layout.slide,0,'Motion fragments remain');
   assert.deepEqual(writes,[],'Pure demo must not send emails, create bookings or submit to backend');
   assert.deepEqual(errors,[],lang+' '+width+' JS errors');
   console.log('PASS clean booking demo '+lang+' '+width+' '+JSON.stringify(layout));
   await page.close();
 }
 // Verify the SAME marketing demo sent by email, preserving its business,
 // location, language and attribution. Sonny must work as a plain inline card.
 for(const lang of ['en','es']){
   const page=await browser.newPage({viewport:{width:390,height:844}});
   let sonnyPayload=null;
   await page.route('**/functions/v1/tle-ai-booking-demo',async route=>{
     sonnyPayload=route.request().postDataJSON();
     await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({
       reply:lang==='es'?'Claro, te ayudo con tu reserva de ejemplo.':'I can help with your sample booking.',
       mode:'demo_only',booking_created:false,email_sent:false,ready_for_review:true,
       booking:{category:'residential',service:'standard',first_name:'Test',last_name:'Lead',zip:'33101'}
     })});
   });
   const emailLink='/lead-private-preview.html?business=Sample+Cleaning+Company&area=Miami+33101&lang='+lang+'&source=jessie_email';
   await page.goto(base+emailLink,{waitUntil:'load'});
   await page.waitForURL('**/booking-demo-reset.html?*');
   assert.match(await page.locator('#leadBusiness').textContent(),/Sample Cleaning Company/,
     'Email lead magnet must retain recipient business branding');
   assert.match(await page.locator('#leadArea').textContent(),/Miami 33101/,
     'Email link must retain recipient service area');
   assert.equal(new URL(page.url()).searchParams.get('source'),'jessie_email',
     'Preserve email campaign attribution');
   assert.equal(await page.locator('#language').inputValue(),lang,'Preserve recipient language');
   assert.equal(await page.locator('#bookingPortalHeadline').getAttribute('aria-label'),
      lang==='es'?'Haz que tus reservas sean extraordinarias.':'Make your booking flow remarkable.');
   const heroPhoto=page.locator('.booking-portal-picture').first();
   await page.waitForFunction(()=>{
      const img=document.querySelector('.booking-portal-picture');
      return img&&img.complete&&img.naturalWidth>=1100;
   },null,{timeout:15000});
   assert.equal(await page.locator('#bookingPortalEnter').count(),1,'Window portal button must exist');
   await page.locator('#sonnyToggle').click();
   await page.locator('#sonnyInput').fill('Can you help me book a cleaning?');
   await page.locator('#sonnySend').click();
   await page.waitForFunction(()=>document.querySelectorAll('#sonnyLog p').length>=3);
   assert.equal(sonnyPayload?.business_name,'Sample Cleaning Company','Sonny must receive personalized business context');
   assert.equal(sonnyPayload?.service_area,'Miami 33101','Sonny must receive recipient service area');
   assert.equal(sonnyPayload?.language,lang);
   assert.equal(typeof sonnyPayload.thread_id,'string');
   await page.locator('#sonnyUse').waitFor({state:'visible',timeout:12000});
   assert.equal(await page.locator('#sonnyUse').isVisible(),true,'Keep Sonny to form handoff');
   await page.locator('#sonnyUse').click();
   assert.equal(await page.locator('#customerName').inputValue(),'Test Lead');
   assert.equal(await page.locator('#detailsPanel').isVisible(),true);
   assert.equal(await page.locator('#sonnyBody').isVisible(),false);
   console.log('PASS email lead magnet personalization and Sonny mocked handoff '+lang);
   await page.close();
 }
 const page=await browser.newPage({viewport:{width:390,height:844}});
 await page.goto(base+'/lead-private-preview.html?owner_preview=1&lang=en',{waitUntil:'domcontentloaded'});
 assert(!page.url().includes('booking-demo-reset.html'),'Owner preview redirected away from original');
 await page.close();
 console.log('[BOOKING VISUAL RESET QA PASSED] No legacy effect assets, EN/ES service flow, 4 widths, no writes, owner isolation.');
}finally{await browser.close()}
