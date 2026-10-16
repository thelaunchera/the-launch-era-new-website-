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
assert.match(html,/class="sonny-avatar-mark"/,'Restore owner-approved robot avatar in existing Sonny card');
const premium=readFileSync('public/assets/tle-booking-premium-refresh.css','utf8');
assert.match(html,/tle-booking-premium-refresh\.css/,'Premium blue card and Sonny bubble styles must be loaded');
assert.match(premium,/\.sonny:not\(:has\(\.sonny-body:not\(\[hidden\]\)\)\)/,'Only the existing Sonny card becomes a head-only bubble');
assert.match(premium,/\.service\{background:linear-gradient/,'Service cards use cohesive blue-tinted surfaces');
assert.match(premium,/\.booking-review,/,'Illustrative proof cards share the premium treatment');
assert.match(premium,/\.booking-compare-card/,'Before/after cards share the premium treatment');
assert(!/backdrop-filter|glassmorphism|gsap/i.test(premium),'Visual polish never adds glass/zoom libraries');

assert.equal((html.match(/src="\/assets\/lead-demo\/ai-demo-robot\.webp"/g)||[]).length,1,'Use exactly one original blue Sonny robot image');
assert.doesNotMatch(html,/sonnyAvatarLauncher|tleSonnyGreetingPopup/,'No duplicate floating bot or popup');
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
   // Same restored blue-bubble story in the public site AND Jessie's email lead magnet.
   assert.equal(await page.locator('#bookingBubbleStory').count(),1,'One bubble chapter only');
   const bubbles=await page.evaluate(()=>{
     const story=document.getElementById('bookingBubbleStory');
     const layer=story?.querySelector('.booking-bubble-layer');
     const first=layer?.querySelector('span');
     const card=document.getElementById('customQuote');
     return {
       count:layer?.children.length,
       pointer:getComputedStyle(layer).pointerEvents,
       rim:getComputedStyle(first).borderTopColor,
       storyBg:getComputedStyle(story).backgroundImage,
       pageBg:getComputedStyle(document.body).backgroundColor,
       quoteBg:getComputedStyle(card).backgroundImage,
       quoteTitle:getComputedStyle(document.getElementById('bookingCustomAction')).color,
       bookingLink:document.getElementById('bookingBubbleAction')?.getAttribute('href'),
       heading:document.getElementById('bookingBubbleTitle')?.textContent,
       overflow:document.documentElement.scrollWidth-innerWidth
     };
   });
   assert(bubbles.count===7&&bubbles.pointer==='none','Old seven decorative bubbles must not block touches: '+JSON.stringify(bubbles));
   assert(bubbles.storyBg.includes('linear-gradient')&&bubbles.quoteBg.includes('linear-gradient'),'Blue bubble treatment missing in story or quote card: '+JSON.stringify(bubbles));
   assert.equal(bubbles.bookingLink,'#bookingPage','Bridge CTA must link to functioning booking steps');
   assert.match(bubbles.heading,lang==='es'?/primer mensaje/:/first hello/,'Bubble story language did not match email lead');
   assert(bubbles.overflow<=2,lang+' '+width+' bubble backgrounds cannot cause horizontal scrolling '+JSON.stringify(bubbles));

   const headerAvatar=page.locator('.sonny-avatar-mark img');
   assert(await headerAvatar.evaluate(img=>img.complete&&img.naturalWidth>30),'Original blue Sonny avatar loads in '+lang);
   assert.equal(await page.locator('.sonny-avatar-mark').count(),1,'One approved Sonny avatar');
   const skin=await page.evaluate(()=>{
     const popup=document.querySelector('.sonny'),robot=popup?.querySelector('.sonny-avatar-mark img');
     const bubble=popup?.getBoundingClientRect(),service=document.querySelector('#resServices .service');
     const sr=service?.getBoundingClientRect(),proof=document.querySelector('.booking-review');
     const pr=proof?.getBoundingClientRect();
     return {bubbleWidth:bubble?.width,bubbleHeight:bubble?.height,
       avatarVisible:robot&&getComputedStyle(robot).display!=='none'&&robot.complete&&robot.naturalWidth>0,
       buttonLabel:popup?.querySelector('#sonnyToggle')?.getAttribute('aria-label'),
       radius:parseFloat(getComputedStyle(popup).borderTopLeftRadius),
       serviceRadius:parseFloat(getComputedStyle(service).borderTopLeftRadius),
       serviceBorder:parseFloat(getComputedStyle(service).borderTopWidth),
       serviceWidth:sr?.width,proofRadius:parseFloat(getComputedStyle(proof).borderTopLeftRadius),
       proofWidth:pr?.width,
       mainMargin:document.querySelector('main.shell')?.getBoundingClientRect().left,
       heroHeight:document.querySelector('#bookingPortal')?.getBoundingClientRect().height,
       vertical:innerHeight};
   });
   assert(skin.bubbleWidth>=55&&skin.bubbleWidth<=70&&Math.abs(skin.bubbleWidth-skin.bubbleHeight)<2,
     lang+' Sonny must be a small circular HEAD, not a wide Try Sonny pill '+JSON.stringify(skin));
   assert(skin.avatarVisible&&skin.radius>=25,'Sonny robot HEAD must be visible on the closed bubble');
   assert(skin.buttonLabel=== (lang==='es'?'Probar Sonny':'Try Sonny'),'Head bubble must retain native EN/ES button accessibility');
   assert(skin.serviceRadius>=20&&skin.serviceBorder>=1.4&&skin.proofRadius>=20,
     'Service/proof cards need rounded blue outlines '+JSON.stringify(skin));
   assert(skin.serviceWidth>230&&skin.proofWidth>245,'Cards must not be narrow '+JSON.stringify(skin));
   if(width<=390)assert(skin.mainMargin<=17,'Phone booking cards should use nearly full width '+JSON.stringify(skin));
   assert(skin.heroHeight>=skin.vertical*1.98&&skin.heroHeight<=skin.vertical*2.10,'Hero needs enough sticky scroll distance for a readable window transition');

   await page.locator('#sonnyToggle').click();
   await page.locator('#sonnyBody').waitFor({state:'visible'});
   assert.equal(await page.locator('.sonny').count(),1,'Original Sonny chat still functional');
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
   assert.equal(await page.locator('.service-photo-check').count(),0,'No empty checkboxes may float on service photos');
   const firstFlip=page.locator('.service-flip-card[data-service="standard"]');
   assert.equal(await page.locator('.service-flip-card').count(),6,'Six services must have front and back');
   assert.equal(await firstFlip.locator('.service-flip-back').evaluate(x=>x.inert),true,'Hidden back CTA cannot receive focus');
   await firstFlip.locator('.service').dispatchEvent('click');
   assert.equal(await firstFlip.getAttribute('class').then(x=>x.includes('is-flipped')),true);
   assert.equal(await page.locator('#detailsPanel').isVisible(),false,'First tap reveals details rather than opening the form');
   assert.equal(await firstFlip.locator('.service-flip-back').evaluate(x=>x.inert),false,'Visible back CTA must accept focus');
   await firstFlip.locator('.service-flip-select').click();
   assert.equal(await page.locator('#detailsPanel').isVisible(),true,'Back CTA must advance to booking details');
   assert.equal(await page.locator('#chooseNext').isVisible(),false,'No far-away Continue control');
   assert.equal(await page.locator('input[name="demo-beds"]:checked').inputValue(),'2');
   assert.equal(await page.locator('input[name="demo-baths"]:checked').inputValue(),'1');
   assert.equal(await page.locator('input[name="demo-frequency"]:checked').inputValue(),'one');
   await page.locator('input[name="demo-beds"][value="3"]').check();
   await page.locator('input[name="demo-baths"][value="2"]').check();
   await page.locator('input[name="demo-frequency"][value="biweekly"]').check();
   assert.equal(await page.locator('#beds').inputValue(),'3');
   assert.equal(await page.locator('#baths').inputValue(),'2');
   assert.equal(await page.locator('#frequency').inputValue(),'biweekly');
   assert.notEqual(await page.locator('.choice-check input:checked+span').first().evaluate(x=>getComputedStyle(x).backgroundColor),'rgb(255, 255, 255)','Selected options must visibly turn blue');
   const extras=page.locator('input[name="demo-extras"]');
   assert.equal(await extras.count(),4,'Four optional checkboxes should be inside Step 2, not over photo cards');
   assert.equal(await page.locator('#bookingExtrasTitle').isVisible(),true);
   assert.equal(await page.locator('input[name="demo-extras"]:checked').count(),0,'Optional details start unchecked');
   await page.locator('input[name="demo-extras"][value="petsLabel"]').check();
   await page.locator('input[name="demo-extras"][value="ovenLabel"]').check();
   assert.equal(await page.locator('input[name="demo-extras"]:checked').count(),2,'Multiple optional details can be chosen');
   const focusStyle=await page.locator('input[name="demo-extras"][value="petsLabel"] + span').evaluate(x=>getComputedStyle(x).backgroundColor);
   assert.notEqual(focusStyle,'rgb(255, 255, 255)','Checked details should have a pale blue highlight');
  
   await page.locator('#customerName').fill('Sample Customer');
   await page.locator('#customerEmail').fill('sample@example.test');
   await page.locator('#customerZip').fill('33101');
   await page.locator('#preferredDate').fill(new Date(Date.now()+45*86400000).toISOString().slice(0,10));
   await page.locator('#reviewNext').click();
   await page.locator('#reviewPanel').waitFor({state:'visible'});
   assert.match(await page.locator('#reviewList').innerText(),/Sample Customer/);
   assert.match(await page.locator('#reviewList').innerText(),lang==='es'?/Mascotas en casa/:/Pets at home/,'Requested details appear on review screen');
   assert.match(await page.locator('#reviewList').innerText(),lang==='es'?/Interior del horno/:/Inside oven/,'Requested oven service appears without adding to estimated price');
   await page.locator('#finish').click();
   await page.locator('#completePanel').waitFor({state:'visible'});
   const tracker=await page.locator('#trackerLink').getAttribute('href');
   assert(tracker?.startsWith('/lead-demo-tracker.html?')&&tracker.includes('lang='+lang),
     'Lead magnet must retain demo Command Center handoff');
   const saved=await page.evaluate(()=>[...Object.keys(sessionStorage)]
     .filter(k=>k.startsWith('tleSampleBooking:')).map(k=>JSON.parse(sessionStorage.getItem(k))));
   assert(saved.some(x=>x.demoOnly&&x.name==='Sample Customer'
     &&x.extras?.includes('petsLabel')&&x.extras?.includes('ovenLabel')
     &&(lang==='es'?x.notes.includes('Mascotas en casa'):x.notes.includes('Pets at home'))),
     'Sample Command Center handoff should include optional checkbox requests, no real writes');
   await page.locator('#restart').click();
   assert.equal(await page.locator('input[name="demo-extras"]:checked').count(),0,'Restart clears optional checkboxes');
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

   await page.locator('.service-flip-card[data-service="office"] .service').dispatchEvent('click');
   await page.locator('.service-flip-card[data-service="office"] .service-flip-select').click();
   assert.equal(await page.locator('#comDetails').isVisible(),true);
   assert.equal(await page.locator('.booking-extras').isVisible(),false,'Residential optional choices stay hidden on commercial forms');
   await page.locator('#backDetails').click();
   assert.equal(await page.locator('button[data-id="office"]').getAttribute('aria-pressed'),'true','Back keeps selected commercial service');
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
