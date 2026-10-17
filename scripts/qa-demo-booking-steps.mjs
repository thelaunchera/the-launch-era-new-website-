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
assert(h.includes('function validateContact()')&&h.includes('function validateProperty()')&&h.includes('function focusPreferredDate()'),'Mini-wizard must validate contact, space and schedule individually');
assert.equal((h.match(/data-mini-pane="/g)||[]).length,3,'Exactly three inner mini-panels');
assert(css.includes('translateX(var(--demo-mini-offset))')&&css.includes('scaleX(0)'),'Inner stepper needs sliding fields and progress fill');
assert(!/gsap|cdn\.jsdelivr|new XMLHttpRequest/i.test(h),'No external libraries or real booking network writes');
assert(h.includes("revealStageStart('mini')")&&h.includes("revealStageStart(complete?'done':'outer')"),'Both inner and outer step changes must align to their own top');
assert(h.includes("flow.classList.toggle('is-preview-complete',complete)"),'Finish should hide duplicate outer step header');
assert.equal((h.match(/id="doneHeading"/g)||[]).length,1,'Exactly one real completion heading');
assert(css.includes('overflow-anchor:none')&&css.includes('.complete-milestones'),'iPhone scroll-anchor guard and compact final card required');
const base=(process.env.QA_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const browser=await chromium.launch({headless:true});
async function assertStageAtTop(page,which,label){
 await page.waitForTimeout(100);
 const state=await page.evaluate(id=>{
  const node=document.getElementById(id);
  return {top:node?.getBoundingClientRect().top,
   viewport:innerHeight,scrollY:scrollY,
   focus:document.activeElement?.id,
   style:getComputedStyle(document.getElementById('bookingStepViewport')).height};
 },which);
 assert(state.top>=-15&&state.top<Math.min(140,state.viewport*.24),
  label+' new stage must start at top, not leave phone scrolled to bottom: '+JSON.stringify(state));
}
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
  await assertStageAtTop(page,'flowTitle','Service → Contact '+lang+' '+width);
  assert.equal(await page.locator('#choosePanel').evaluate(e=>e.inert),true,'Previous step is inert');
  assert.equal(await page.locator('#detailsPanel').evaluate(e=>e.inert),false,'Current step not inert');
  assert.equal(await page.locator('.booking-progress-item.is-current').getAttribute('data-progress-item'),'2');
  assert.match(await page.locator('#bookingProgressAnnounce').innerText(),lang==='es'?/Paso 2 de 3/:/Step 2 of 3/);
  assert.equal(await page.locator('#bookingStepTrack').evaluate(e=>e.style.getPropertyValue('--slide-offset')),'-33.333333333333336%');
  const box=await panel.boundingBox();assert(box&&box.width>width*.67,'Viewport too small');
  const docWidth=await page.evaluate(()=>document.documentElement.scrollWidth);
  assert(docWidth<=width+3,'Mobile viewport overflow '+lang+' '+width+': '+docWidth);
  assert.equal(await page.locator('.demo-mini-dot.is-current').getAttribute('data-mini-progress'),'0','Start at contact mini-step');
  assert.equal(await page.locator('#bookingProgress').isVisible(),false,'Only one progress track is visible while entering details');
  const name=page.locator('#customerName');
  await page.locator('#reviewNext').click();
  assert.equal(await page.locator('.demo-mini-dot.is-current').getAttribute('data-mini-progress'),'0','Required contact data must block Next');
  await name.fill('Sample Customer');
  await page.locator('#customerEmail').fill('test@example.invalid');
  await page.locator('#customerZip').fill('33101');
  await page.locator('#reviewNext').click();
  assert.equal(await page.locator('.demo-mini-dot.is-current').getAttribute('data-mini-progress'),'0','Incomplete street/city/state cannot advance');
  await page.locator('#customerStreet').fill('123 Ocean Drive');
  await page.locator('#customerUnit').fill('Apt 4B');
  await page.locator('#customerCity').fill('Miami Beach');
  await page.locator('#customerState').fill('FL');
  await page.locator('#customerZip').fill('33101');
  await page.locator('#reviewNext').click();
  assert.equal(await page.locator('.demo-mini-dot.is-current').getAttribute('data-mini-progress'),'1','Contact slides to space details');
  assert.equal(await page.locator('#intakeContact').isVisible(),false,'Previous mini-step hidden');
  assert.equal(await page.locator('#intakeSpace').isVisible(),true);
  await assertStageAtTop(page,'demoMiniProgress','Contact → Space '+lang+' '+width);
  assert.notEqual(await page.evaluate(()=>document.activeElement?.tagName),'INPUT','Stage change must not pop the iPhone keyboard');
  await page.locator('#reviewNext').click();
  assert.equal(await page.locator('.demo-mini-dot.is-current').getAttribute('data-mini-progress'),'1','Residential needs a home type');
  await page.locator('#propertyType').selectOption('house');
  await page.locator('input[name="demo-extras"][value="petsLabel"]').check();
  await page.locator('#reviewNext').click();
  assert.equal(await page.locator('.demo-mini-dot.is-current').getAttribute('data-mini-progress'),'2','Property slides to final calendar');
  assert.equal(await page.locator('#intakeSchedule').isVisible(),true);
  await assertStageAtTop(page,'demoMiniProgress','Space → Date '+lang+' '+width);
  assert.equal(await page.locator('#intakeSpace').isVisible(),false);
  assert.equal(await page.locator('#preferredDate').isVisible(),false,'Only the new calendar can be visible');
  const day=page.locator('#apptDays button[data-day]:not([disabled])').first();
  const date=await day.getAttribute('data-day');
  await page.locator('#reviewNext').click();
  assert.equal(await page.locator('#reviewPanel').isVisible(),false,'Missing date blocks Review');
  assert.equal(await page.locator('.demo-mini-dot.is-current').getAttribute('data-mini-progress'),'2','Do not reset mini-step on validation');
  await day.click();
  assert.equal(await page.locator('#preferredDate').inputValue(),date);
  await page.locator('#backDetails').click();
  assert.equal(await page.locator('.demo-mini-dot.is-current').getAttribute('data-mini-progress'),'1','Back slides to property without deleting data');
  assert.equal(await page.locator('#propertyType').inputValue(),'house');
  await page.locator('#reviewNext').click();
  assert.equal(await page.locator('#preferredDate').inputValue(),date,'Previous schedule choice is retained');
  await page.locator('#reviewNext').click();
  assert.equal(await page.locator('#reviewPanel').isVisible(),true,'Final mini-step advances to overall Review');
  await assertStageAtTop(page,'flowTitle','Date → Review '+lang+' '+width);
  assert.match(await page.locator('#reviewList').innerText(),/123 Ocean Drive, Apt 4B, Miami Beach, FL, 33101/,'Review must show the complete address');
  assert.equal(await page.locator('.booking-progress-item.is-current').getAttribute('data-progress-item'),'3');
  assert.equal(await page.locator('#bookingProgress').isVisible(),true,'Outer progress returns for final review');
  assert.match(await page.locator('#reviewList').innerText(),lang==='es'?/Mascotas en casa/:/Pets at home/);
  await page.locator('#backReview').click();
  assert.equal(await page.locator('#detailsPanel').isVisible(),true,'Back restores details');
  assert.equal(await page.locator('.demo-mini-dot.is-current').getAttribute('data-mini-progress'),'2','Back from Review returns to final mini-step');
  assert.equal(await name.inputValue(),'Sample Customer');
  await assertStageAtTop(page,'flowTitle','Review → Schedule edit '+lang+' '+width);
  // Completion must open at the top, show ONE polished heading, and still be
  // an honest sample. Both CTA destinations and restart remain usable.
  await page.locator('#reviewNext').click();
  assert.equal(await page.locator('#reviewPanel').isVisible(),true);
  await page.locator('#finish').click();
  assert.equal(await page.locator('#completePanel').isVisible(),true,'Final card must be visible');
  await assertStageAtTop(page,'completePanel','Review → Complete '+lang+' '+width);
  assert.equal(await page.locator('.flow-header').isVisible(),false,'No duplicate Preview complete heading');
  assert.equal(await page.locator('#doneHeading').isVisible(),true,'Single celebratory heading is visible');
  assert.equal(await page.locator('.complete-milestones>span').count(),3,'Service/details/review compact confirmations');
  assert.match(await page.locator('#doneBody').innerText(),lang==='es'?/No se creó ninguna reserva/:/No booking, email, payment/);
  const trackerHref=await page.locator('#trackerLink').getAttribute('href');
  const trackerUrl=new URL(trackerHref,base);
  assert.equal(trackerUrl.pathname,'/lead-demo-tracker.html','Preserve demo Command Center CTA');
  assert.equal(trackerUrl.searchParams.get('lang'),lang,'Keep the tracker CTA bilingual');
  await page.locator('#restart').click();
  assert.equal(await page.locator('#choosePanel').isVisible(),true,'Restart returns to service choice');
  await assertStageAtTop(page,'flowTitle','Restart → Service '+lang+' '+width);
  if(reduced){
    assert.equal(await page.locator('#bookingStepTrack').evaluate(x=>getComputedStyle(x).transitionDuration),'0s','Reduced motion must disable outer animation');
    assert.equal(await page.locator('#demoMiniTrack').evaluate(x=>getComputedStyle(x).transitionDuration),'0s','Reduced motion must disable inner animation');
  }
  assert.deepEqual(errors,[],'Page JS errors: '+lang+' '+width);
  assert.deepEqual(writes,[],'Sample preview must not transmit customer details');
  console.log('PASS demo slider '+lang+' '+width+' reduced='+reduced);
  await page.close();
 }
}finally{await browser.close()}
