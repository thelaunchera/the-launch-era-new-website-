/** Public unkeyed Booking Demo: service-specific flips and real 3-step slider. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {chromium} from 'playwright';
const h=readFileSync('public/booking-demo-reset.html','utf8');
const css=readFileSync('public/assets/tle-demo-booking-steps.css','utf8');
const keys=['standard','deep','move','office','retail','medical'];
const inl=[...h.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].filter(x=>!x[0].includes(' src='));
assert.equal(inl.length,1,'One original controller, no new duplicate booking wizard');
new vm.Script(inl[0][1]);
assert.equal((h.match(/class="booking-step-fieldset"/g)||[]).length,3);
assert.equal((h.match(/data-step-pane="/g)||[]).length,3);
assert.equal((h.match(/class="booking-progress-item/g)||[]).length,3);
for(const id of keys)for(let j=1;j<=3;j++)assert(h.includes('data-i18n="scope_'+id+'_'+j+'"'),'Missing scoped flip explanation '+id+' '+j);
assert(css.includes('560ms')&&css.includes('prefers-reduced-motion:reduce'),'Animated progress and reduced-motion safety required');
assert(css.includes('overflow:hidden')&&css.includes('translateX(var(--slide-offset'),'True clipped three-panel slide track required');
assert(h.includes('inert=complete||n!==next')&&h.includes('bookingProgressAnnounce'),'ARIA/inert on off-screen steps required');
assert(h.includes("if(bad){if(bad.id==='preferredDate')focusPreferredDate();else{openIntake('intakeContact');requestAnimationFrame(()=>{bad.focus();bad.reportValidity();});}return;}"),'Preserve per-step validation and visible calendar focus');
assert(!/gsap|cdn\.jsdelivr|new XMLHttpRequest/i.test(h),'No external libraries or real booking network writes');
const base=(process.env.QA_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const browser=await chromium.launch({headless:true});
try{
 for(const [lang,width,reduced] of [
  ['en',360,false],['es',390,false],['en',820,false],['es',1440,false],
  ['en',390,true],['es',360,true]
 ]){
  const page=await browser.newPage({viewport:{width,height:900},reducedMotion:reduced?'reduce':'no-preference'});
  const errors=[],writes=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('request',r=>{if(['POST','PUT','PATCH','DELETE'].includes(r.method()))writes.push(r.url())});
  await page.goto(base+'/booking-demo-reset.html?lang='+lang,{waitUntil:'domcontentloaded'});
  assert.equal(await page.locator('.service-flip-card').count(),6);
  const panel=page.locator('#bookingStepViewport');
  const first=page.locator('.service-flip-card[data-service="deep"]');
  assert.equal(await page.locator('#detailsPanel').isVisible(),false,'Offscreen form must not be visible initially');
  assert.equal(await page.locator('#detailsPanel').evaluate(e=>e.inert),true,'Offscreen form must be inert');
  assert.equal(await page.locator('.booking-progress-item.is-current').count(),1);
  const deepScope=await first.locator('.service-flip-back ul').innerText();
  assert.match(deepScope,lang==='es'?/zócalos|azulejos/i:/baseboards|tiles/i,'Deep cleaning should explain actual work');
  const standardScope=await page.locator('.service-flip-card[data-service="standard"] .service-flip-back ul').innerText();
  assert.notEqual(deepScope,standardScope,'Services must not repeat generic demo steps');
  await first.locator('.service').dispatchEvent('click');
  assert.equal(await page.locator('#detailsPanel').isVisible(),false,'Flip alone must not advance');
  await first.locator('.service-flip-select').click();
  assert.equal(await page.locator('#detailsPanel').isVisible(),true,'Continue from flipped card enters details');
  assert.equal(await page.locator('#choosePanel').evaluate(e=>e.inert),true,'Previous step is inert');
  assert.equal(await page.locator('#detailsPanel').evaluate(e=>e.inert),false,'Current step not inert');
  assert.equal(await page.locator('.booking-progress-item.is-current').getAttribute('data-progress-item'),'2');
  assert.match(await page.locator('#bookingProgressAnnounce').innerText(),lang==='es'?/Paso 2 de 3/:/Step 2 of 3/);
  assert.equal(await page.locator('#bookingStepTrack').evaluate(e=>e.style.getPropertyValue('--slide-offset')),'-33.333333333333336%');
  const box=await panel.boundingBox();assert(box&&box.width>width*.67,'Viewport too small');
  const docWidth=await page.evaluate(()=>document.documentElement.scrollWidth);
  assert(docWidth<=width+3,'Mobile viewport overflow '+lang+' '+width+': '+docWidth);
  const name=page.locator('#customerName');
  await page.locator('#reviewNext').click();
  assert.equal(await page.locator('#reviewPanel').isVisible(),false,'Required fields must block next');
  await name.fill('Sample Customer');await page.locator('#customerEmail').fill('test@example.invalid');
  await page.locator('#customerZip').fill('33101');
  assert.equal(await page.locator('#preferredDate').isVisible(),false,'Old preferred date must not appear above new calendar');
  const day=page.locator('#apptDays button[data-day]:not([disabled])').first();
  const date=await day.getAttribute('data-day');
  await page.locator('#reviewNext').click();
  assert.equal(await page.locator('#reviewPanel').isVisible(),false,'A missing calendar day must block review');
  assert.equal(await page.evaluate(()=>document.activeElement?.dataset.day),date,'Missing date must focus visible picker');
  await day.click();
  assert.equal(await page.locator('#preferredDate').inputValue(),date,'Calendar must sync review date');
  await page.locator('#intakeSpace > summary').click();
  await page.locator('input[name="demo-extras"][value="petsLabel"]').check();
  await page.locator('#reviewNext').click();
  assert.equal(await page.locator('#reviewPanel').isVisible(),true);
  assert.equal(await page.locator('.booking-progress-item.is-current').getAttribute('data-progress-item'),'3');
  assert.match(await page.locator('#bookingProgressAnnounce').innerText(),lang==='es'?/Paso 3 de 3/:/Step 3 of 3/);
  assert.match(await page.locator('#reviewList').innerText(),lang==='es'?/Mascotas en casa/:/Pets at home/);
  await page.locator('#backReview').click();
  assert.equal(await page.locator('#detailsPanel').isVisible(),true,'Back must retain typed details');
  assert.equal(await name.inputValue(),'Sample Customer');
  if(reduced)assert.equal(await page.locator('#bookingStepTrack').evaluate(x=>getComputedStyle(x).transitionDuration),'0s','Reduced motion must have no transform animation');
  assert.deepEqual(errors,[],'Page JS errors: '+lang+' '+width);
  assert.deepEqual(writes,[],'Sample preview must not transmit customer details');
  console.log('PASS demo slider '+lang+' '+width+' reduced='+reduced);
  await page.close();
 }
}finally{await browser.close()}
