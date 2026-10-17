/** Public unkeyed booking demo — Drive-photo GSAP3 horizontal story.
 * Never reads client data, sends forms or invokes checkout. */
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {chromium} from 'playwright';
const html=readFileSync('public/booking-demo-reset.html','utf8');
const css=readFileSync('public/assets/tle-booking-bubbles-continuity.css','utf8');
const script=readFileSync('public/assets/tle-demo-horizontal-story.js','utf8');
const dictionary=readFileSync('public/assets/tle-demo-hero-portal.js','utf8');
const sources=[
 ['choose-cleaner-kitchen.png','Professional cleaner'],
 ['share-details-bathroom.png','family bathroom'],
 ['choose-time-living-room.png','living room'],
 ['review-ready-bedroom.png','guest bedroom']
];
assert.equal((html.match(/data-booking-story-card/g)||[]).length,4,'Exactly four photo cards');
assert.equal((html.match(/id="bookingStoryTrack"/g)||[]).length,1,'Single horizontal track');
assert(html.indexOf('id="bookingBubbleStory"')<html.indexOf('id="bookingPage"'),'Flow stays before the sample form');
assert(html.indexOf('id="bookingPage"')<html.indexOf('id="tleDemoCurtainFooter"'),'Footer reveal stays last');
for(const [name] of sources) {
 assert(html.includes('/assets/drive-booking-journey/'+name),'Missing original Drive photo '+name);
 assert(existsSync('public/assets/drive-booking-journey/'+name),'Drive photo not stored locally '+name);
}
assert(html.includes('id="bookingBubbleStep4Title"'),'Fourth step missing');
assert(dictionary.includes('bookingBubbleStep4Title:"Revisa tu solicitud"'),'Spanish chapter translation missing');
assert(dictionary.includes('bookingBubbleStep4Title:"Review the request"'),'English chapter translation missing');
assert(script.includes('gsap.matchMedia()')&&script.includes('gsap.context('),'Use GSAP cleanup and media isolation');
assert(script.includes("pin:true,scrub:0.6,invalidateOnRefresh:true"),'ScrollTrigger must pin and scrub smoothly');
assert(script.includes("containerAnimation:h"),'Per-card sideways animations must use containerAnimation');
assert(css.includes('booking-bubble-horizontal')&&css.includes('prefers-reduced-motion:reduce'),'Accessible CSS-native fallback missing');
assert(existsSync('public/assets/vendor/gsap-3.14.2.min.js')&&existsSync('public/assets/vendor/ScrollTrigger-3.14.2.min.js'),'Official local GSAP distributions missing');
console.log('[STATIC PASS] Four distinct Drive images, EN/ES, locally hosted GSAP 3, original form + curtain footer.');
const base=(process.env.QA_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const browser=await chromium.launch({headless:true});
try{
 for(const [lang,width,height] of [['en',360,780],['es',390,844],['en',820,1180],['es',1440,900]]){
  const page=await browser.newPage({viewport:{width,height},reducedMotion:'no-preference'});
  const errors=[],writes=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('request',req=>{if(['POST','PUT','PATCH','DELETE'].includes(req.method()))writes.push(req.url())});
  await page.goto(base+'/booking-demo-reset.html?lang='+lang,{waitUntil:'domcontentloaded'});
  const section=page.locator('#bookingBubbleStory');
  await section.waitFor();
  await page.waitForFunction(()=>{
   const x=document.getElementById('bookingBubbleStory');
   return x?.classList.contains('is-gsap-ready')&&!!window.ScrollTrigger?.getById('booking-demo-horizontal-journey');
  },null,{timeout:16000});
  const dims=await page.evaluate(()=>{
   const a=document.getElementById('bookingBubbleStory');
   const t=document.getElementById('bookingStoryTrack');
   const h=window.ScrollTrigger.getById('booking-demo-horizontal-journey');
   const r=a.getBoundingClientRect();
   return {start:h.start,end:h.end,pin:!!h.pin,width:innerWidth,scrollWidth:t.scrollWidth,
    sectionWidth:a.clientWidth,docWidth:document.documentElement.scrollWidth,
    cards:a.querySelectorAll('.booking-story-photo-card').length,
    img:[...a.querySelectorAll('.booking-story-photo-card img')].map(x=>x.getAttribute('src'))};
  });
  assert.equal(dims.cards,4,lang+' required cards');
  assert(dims.pin&&dims.end>dims.start+500,'Pinned horizontal ScrollTrigger must cover full track '+JSON.stringify(dims));
  assert(dims.docWidth<=width+4,lang+' '+width+' overflow '+JSON.stringify(dims));
  assert.equal(new Set(dims.img).size,4,'Do not repeat Drive photos');
  const h3=await section.locator('#bookingBubbleStep4Title').textContent();
  assert.match(h3,lang==='es'?/Revisa tu solicitud/:/Review the request/);
  await page.evaluate(o=>window.scrollTo({top:(o.start+o.end)/2,behavior:'instant'}),dims);
  await page.waitForTimeout(850);
  const mid=await page.evaluate(()=>{
   const t=document.getElementById('bookingStoryTrack'),h=window.ScrollTrigger.getById('booking-demo-horizontal-journey');
   return {progress:h.progress,x:getComputedStyle(t).transform,
    value:Number(document.getElementById('bookingStoryProgress').getAttribute('aria-valuenow')),
    overflow:document.documentElement.scrollWidth-innerWidth};
  });
  assert(mid.progress>.28&&mid.progress<.72&&mid.value>24&&mid.value<76,'Scrub/progress not advancing '+JSON.stringify(mid));
  assert(mid.x!=='none'&&mid.overflow<=3,'Track must move sideways without horizontal document scroll '+JSON.stringify(mid));
  const fixedFooter=await page.locator('#tleDemoCurtainFooter').count();
  assert.equal(fixedFooter,1,'Approved curtain footer lost');
  assert.equal(await page.locator('#sonnyToggle').count(),1,'Sonny lost');
  assert.deepEqual(writes,[],'Animated story created a real form write');
  assert.deepEqual(errors,[],'Booking demo browser errors '+JSON.stringify(errors));
  await page.close();
  console.log('PASS pinned Drive-photo story '+lang+' '+width);
 }
 for(const [lang,width,height] of [['en',390,844],['es',360,780]]){
  const page=await browser.newPage({viewport:{width,height},reducedMotion:'reduce'});
  await page.goto(base+'/booking-demo-reset.html?lang='+lang,{waitUntil:'domcontentloaded'});
  const story=page.locator('#bookingBubbleStory');
  const state=await story.evaluate(el=>{
   const view=el.querySelector('.booking-story-window');
   const track=el.querySelector('#bookingStoryTrack');
   return {ready:el.classList.contains('is-gsap-ready'),scrollWidth:view.scrollWidth,viewWidth:view.clientWidth,overflow:getComputedStyle(view).overflowX,docWidth:document.documentElement.scrollWidth};
  });
  assert(!state.ready&&state.overflow==='auto','Reduced motion must skip the pin and offer native horizontal scroll '+JSON.stringify(state));
  assert(state.scrollWidth>state.viewWidth+300,'Native gallery still needs four reachable cards '+JSON.stringify(state));
  const native=await story.evaluate(el=>{
   const view=el.querySelector('.booking-story-window');
   view.scrollLeft=400;return view.scrollLeft;
  });
  assert(native>100,'Reduced-motion gallery must scroll by touch/keyboard');
  await page.close();
  console.log('PASS native fallback '+lang+' '+width);
 }
}finally{await browser.close();}
console.log('[BROWSER PASS] GSAP horizontal drive story, EN ES and reduced motion.');
