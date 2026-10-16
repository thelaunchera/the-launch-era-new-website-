/** Booking lead magnet: full-month calendar, iOS wheel, safe sample sheet, photo-only zoom. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {chromium} from 'playwright';
const html=fs.readFileSync('public/booking-demo-reset.html','utf8');
const js=fs.readFileSync('public/assets/tle-booking-month-wheel.js','utf8');
const css=fs.readFileSync('public/assets/tle-booking-month-wheel.css','utf8');
const sender=fs.readFileSync('supabase/functions/tle-jessie-demo-lead/index.ts','utf8');
const buyer=fs.readFileSync('public/lead-private-preview.html','utf8');
assert.match(sender,/thelaunchera\.com\/lead-private-preview\.html/);
assert.match(buyer,/p\.has\('key'\)\|\|p\.get\('owner_preview'\)==='1'/);
assert.match(html,/\/assets\/tle-booking-month-wheel\.js/);
assert.match(css,/\.service:hover \.service-media img/);
assert.doesNotMatch(css,/\.booking-portal[^\n]*transform/);
assert.match(js,/scrollSnapType='y mandatory'/);
assert.match(js,/state\.picked=false/);
assert.match(js,/window\.tleBookingPreference/);
const base=(process.env.QA_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const browser=await chromium.launch({headless:true});
try {
 for(const [lang,width,reduced] of [['en',360,false],['es',390,true],['en',820,false],['es',1024,false],['en',1440,false]]){
  const page=await browser.newPage({viewport:{width,height:844},reducedMotion:reduced?'reduce':'no-preference'});
  const errors=[],writes=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('request',r=>{if(['POST','PUT','PATCH','DELETE'].includes(r.method()))writes.push(r.url())});
  const qp=new URLSearchParams({business:'Evergreen Cleaning',area:'Miami',rid:'qa-time-1',lang});
  await page.goto(base+'/lead-private-preview.html?'+qp.toString(),{waitUntil:'load',timeout:45000});
  await page.waitForURL('**/booking-demo-reset.html?*');
  const initial=await page.evaluate(()=>({
    link:document.querySelectorAll('link[href*="tle-booking-month-wheel"]').length,
    photos:document.querySelectorAll('.service-media img').length,
    rootOverflow:document.documentElement.scrollWidth-innerWidth
  }));
  assert.equal(initial.link,1);assert.equal(initial.photos,6);assert(initial.rootOverflow<=3,lang+' overflow');
  await page.locator('.service[data-id="standard"]').click();
  assert.equal(await page.locator('#detailsPanel').isVisible(),true,'Service tap opens calendar immediately');
  await page.locator('#tleBookingAppointment').waitFor({state:'visible'});
  assert.equal(await page.locator('#apptDays button[role="radio"]').count(),new Date(new Date().getFullYear(),new Date().getMonth()+1,0).getDate(),
    'Must render EVERY day of a full month');
  const geometry=await page.evaluate(()=>{
    const bounds=(selector)=>{const r=document.querySelector(selector)?.getBoundingClientRect();return r?{left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height}:null;};
    return {appointment:bounds('#tleBookingAppointment'),panel:bounds('#detailsPanel'),
      calendar:bounds('.appt-date-pane'),time:bounds('.appt-time-pane'),
      day:bounds('#apptDays button[data-day]'),viewport:innerWidth,
      cssWidth:getComputedStyle(document.querySelector('#tleBookingAppointment')).maxWidth,
      overflow:document.documentElement.scrollWidth-innerWidth};
  });
  assert(geometry.appointment?.width>=geometry.panel.width*.88,
    'Appointment card must fill the booking form instead of staying 430px: '+JSON.stringify({lang,width,geometry}));
  assert(geometry.overflow<=3,'Appointment caused horizontal scroll '+JSON.stringify({lang,width,geometry}));
  if(width>=800){
    assert(geometry.appointment.width>=650,'Desktop/tablet appointment should be wide '+JSON.stringify(geometry));
    assert(Math.abs(geometry.calendar.top-geometry.time.top)<5,'Calendar and time should sit side by side '+JSON.stringify(geometry));
    assert(geometry.calendar.width>=320&&geometry.time.width>=245,'Both desktop panes must be readable '+JSON.stringify(geometry));
    assert(geometry.day.width>=40,'Desktop dates must no longer appear tiny '+JSON.stringify(geometry));
  }else{
    assert(geometry.time.top>geometry.calendar.bottom-5,'Phone date and time should stack vertically '+JSON.stringify(geometry));
    assert(geometry.day.width>=32,'Phone dates must remain tappable without clipping '+JSON.stringify(geometry));
  }
  assert.equal(await page.locator('.appt-wheel').count(),3);
  assert.equal(await page.locator('#apptHours [role="option"]').count(),12);
  assert.equal(await page.locator('#apptMinutes [role="option"]').count(),12);
  assert.equal(await page.locator('#apptPeriod [role="option"]').count(),2);
  assert.equal(await page.locator('#apptContinue').isEnabled(),false);
  // Travel forward one full calendar month and select an enabled day.
  await page.locator('#apptNext').click();
  const date=page.locator('#apptDays button[data-day]:not([disabled])').first();
  const selectedDate=await date.getAttribute('data-day');
  await date.click();
  assert.equal(await page.locator('#preferredDate').inputValue(),selectedDate);
  await page.locator('#apptUseTime').click();
  assert.equal(await page.locator('#apptContinue').isEnabled(),true);
  const first=await page.locator('#tlePreferredTime').inputValue();
  assert.match(first,/^\d{1,2}:(?:00|05|10|15|20|25|30|35|40|45|50|55) (AM|PM)$/);
  await page.locator('#apptHours').focus();
  await page.keyboard.press('ArrowDown');
  const changed=await page.locator('#tlePreferredTime').inputValue();
  assert.notEqual(changed,first,'Keyboard ArrowDown must move wheel by 1 hour');
  // Day changes reset previous selected time.
  const nextDate=page.locator('#apptDays button[data-day]:not([disabled])').nth(1);
  await nextDate.click();
  assert.equal(await page.locator('#apptContinue').isEnabled(),false);
  assert.equal(await page.locator('#tlePreferredTime').inputValue(),'');
  await page.locator('#apptUseTime').click();
  await page.locator('#customerName').fill('Demo Customer');
  await page.locator('#customerEmail').fill('demo@example.test');
  await page.locator('#customerZip').fill('33101');
  await page.locator('#apptContinue').click();
  await page.locator('#apptSheet').waitFor({state:'visible'});
  assert.equal(await page.locator('#apptSheet').getAttribute('role'),'dialog');
  assert.match(await page.locator('#apptSheetProvider').innerText(),/Evergreen Cleaning/);
  assert.match(await page.locator('#apptSheetNote').innerText(),/simulaci|sample|envía|booking/i);
  // Escape must close and restore the button's focus.
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#apptSheet').isVisible(),false);
  assert.equal(await page.evaluate(()=>document.activeElement?.id),'apptContinue');
  await page.locator('#apptContinue').click();
  await page.locator('#apptSheetConfirm').click();
  await page.locator('#reviewPanel').waitFor({state:'visible'});
  assert.match(await page.locator('#reviewList').innerText(),/AM|PM/);
  await page.locator('#finish').click();
  await page.locator('#completePanel').waitFor({state:'visible'});
  const stored=await page.evaluate(()=>{
    const p=new URLSearchParams(location.search);
    const key='tleSampleBooking:'+JSON.stringify([p.get('business')||'',p.get('lead')||'',p.get('rid')||'']);
    return JSON.parse(sessionStorage.getItem(key)||'null');
  });
  assert(stored&&stored.demoOnly===true,'Sample storage handoff missing');
  assert.equal(stored.time,changed,'Command Center example must retain picked time');
  assert.equal(await page.locator('.service').count(),6,'Do not add miniature service list or construction');
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
  assert(overflow<=3,'Calendar or time wheel exceeds screen '+lang+' '+width+' overflow '+overflow);
  assert.deepEqual(errors,[],'Browser errors: '+lang+' '+width);
  assert.deepEqual(writes,[],'Demo must NEVER send actual booking/email/payment');
  console.log('PASS_MONTH_WHEEL '+JSON.stringify({lang,width,selectedDate,time:changed,reduced}));
  await page.close();
 }
 const privatePage=await browser.newPage({javaScriptEnabled:false});
 await privatePage.goto(base+'/lead-private-preview.html?key=qa-buyer&lang=en',{waitUntil:'domcontentloaded'});
 assert.equal(await privatePage.locator('#residentialServiceList').count(),1,'Buyer original remains intact');
 await privatePage.close();
 console.log('[MONTH + WHEEL LEAD MAGNET QA PASS] No user writes, no buyer changes');
} finally { await browser.close() }
