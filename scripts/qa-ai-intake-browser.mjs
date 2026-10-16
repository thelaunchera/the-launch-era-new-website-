import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {createServer} from 'node:http';
import {readFileSync,existsSync,statSync,mkdirSync} from 'node:fs';
import {resolve,extname,sep} from 'node:path';

// Local, isolated browser test. All intake API requests are intercepted.
// No Stripe checkout, real payment session, email, or Supabase write occurs.
const root=resolve('public');
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8'};
const server=createServer((req,res)=>{
 const pathname=decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname);
 let path=resolve(root,'.'+pathname);
 if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403).end();return;}
 if(existsSync(path)&&statSync(path).isDirectory())path=resolve(path,'index.html');
 if(!existsSync(path)){res.writeHead(404).end('Not found');return;}
 res.writeHead(200,{'Content-Type':mime[extname(path)]||'application/octet-stream'});res.end(readFileSync(path));
});
await new Promise(done=>server.listen(0,'127.0.0.1',done));
const base='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({headless:true});
mkdirSync('qa-screenshots',{recursive:true});
const scenarios=[
 {lang:'en',offer:'ai-booking',bundle:false,paid:4900,monthly:1900,width:390,target:'booking_page'},
 {lang:'es',offer:'ai-followup',bundle:false,paid:5900,monthly:1900,width:390,target:'existing_website'},
 {lang:'en',offer:'ai-business',bundle:true,paid:4140,monthly:2500,width:820,target:'booking_page'},
 {lang:'es',offer:'ai-business',bundle:false,paid:6900,monthly:2500,width:360,target:'both'}
];
try{
 for(const s of scenarios){
  const context=await browser.newContext({viewport:{width:s.width,height:860}});
  const page=await context.newPage();
  const submitted=[],errors=[];
  page.on('pageerror',e=>errors.push(String(e)));
  await page.route('**/functions/v1/tle-ai-booking-onboarding',async route=>{
   assert.equal(route.request().method(),'POST','Only safe intake POST requests are permitted');
   const input=route.request().postDataJSON();
   if(input.action==='verify'){
    return route.fulfill({json:{verified:true,agent_offer:s.offer,bundle_booking_flow:s.bundle,setup_paid_cents:s.paid,monthly_amount_cents:s.monthly,already_submitted:false}});
   }
   if(input.action==='submit'){
    submitted.push(input);
    return route.fulfill({json:{ok:true,notifications_sent:true,already_submitted:false}});
   }
   throw Error('Unexpected request: '+JSON.stringify(input));
  });
  await page.goto(base+'/ai-booking-assistant/onboarding/?session_id=cs_live_MOCKNOCHARGE123&lang='+s.lang,{waitUntil:'domcontentloaded'});
  await page.locator('#intake').waitFor({state:'visible',timeout:6000}).catch(async ()=>{
   const status=await page.locator('#status').innerText().catch(()=>'(none)');
   const text=await page.locator('#paymentText').innerText().catch(()=>'(none)');
   throw Error('Intake did not display for '+s.offer+'/'+s.lang+'; status='+status+'; purchase='+text+'; browserErrors='+errors.join('; '));
  });
  assert.match(await page.locator('#paymentText').innerText(),new RegExp('\\$'+(s.paid/100).toFixed(0)));
  assert.match(await page.locator('#paymentText').innerText(),new RegExp('\\$'+(s.monthly/100).toFixed(0)));
  assert.match(await page.locator('#setupProgressText').innerText(),/1/);
  await page.locator('#business').fill('QA Clean Business');
  await page.locator('#target').selectOption(s.target);
  if(s.target!=='existing_website'&&!s.bundle)await page.locator('#booking').fill('https://example.com/book');
  if(s.target!=='booking_page')await page.locator('#website').fill('https://example.com');
  await page.locator('#services').fill('Standard cleaning, deep cleaning');
  await page.locator('#serviceArea').fill('Miami, FL');
  await page.locator('#businessHours').fill('Monday-Friday 9-5');
  await page.locator('#setupProgress').scrollIntoViewIfNeeded();
  await page.locator('#intake .setup-step').nth(0).getByRole('button').click();
  assert.equal(await page.locator('#setupProgressText').innerText(),s.lang==='es'?'Paso 2 de 3 · Tu asistente':'Step 2 of 3 · Your assistant');
  await page.locator('#contactName').fill('Jane Owner');
  await page.locator('#avatarName').fill('Sunny');
  await page.locator('#handoffRule').fill('Special estimates');
  if(s.offer!=='ai-booking'){
   assert(await page.locator('#followupConsentWrap').isVisible(),'Follow-up consent must be visible');
   await page.locator('#intake .setup-step').nth(1).getByRole('button',{name:s.lang==='es'?'Revisar →':'Review →'}).click();
   assert.equal(await page.locator('#setupProgressText').innerText(),s.lang==='es'?'Paso 2 de 3 · Tu asistente':'Step 2 of 3 · Your assistant','Consent must be required before review');
   await page.locator('#followupConsent').check();
  }else{
   assert.equal(await page.locator('#followupConsentWrap').isVisible(),false,'Booking-only should not show follow-up consent');
  }
  await page.locator('#intake .setup-step').nth(1).getByRole('button',{name:s.lang==='es'?'Revisar →':'Review →'}).click();
  assert.match(await page.locator('#intakeReview').innerText(),/QA Clean Business/);
  await page.locator('#submit').click();
  await page.locator('#done').waitFor({state:'visible'});
  assert.equal(submitted.length,1,'Exactly one test intake submission expected');
  assert.equal(submitted[0].agent_requested,s.offer);
  assert.equal(submitted[0].business_name,'QA Clean Business');
  assert.match(submitted[0].business_notes,/Service area: Miami, FL/);
  assert.match(submitted[0].business_notes,/Hours: Monday-Friday 9-5/);
  assert.match(submitted[0].business_notes,/Human handoff: Special estimates/);
  assert.equal(submitted[0].business_notes.length<=600,true,'Backend notes cap must not truncate important data');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+2),true,'No horizontal overflow on '+s.width);
  assert.deepEqual(errors,[],'Unexpected browser errors');
  await page.screenshot({path:'qa-screenshots/ai-intake-'+s.offer+'-'+s.lang+'-'+s.width+'.png',fullPage:true});
  await context.close();
  console.log('PASS AI intake '+s.offer+' '+s.lang+' '+s.width+'px');
 }

 // Production-shaped preview must never touch real checkout, emails, or data.
 for(const lang of ['en','es']){
  const ctx=await browser.newContext({viewport:{width:390,height:844}});
  const page=await ctx.newPage(),errors=[];
  let externalOps=0;
  page.on('pageerror',e=>errors.push(String(e)));
  await page.route('**/functions/v1/**',r=>{externalOps++;return r.abort();});
  await page.route('**/api.stripe.com/**',r=>{externalOps++;return r.abort();});
  await page.goto(base+'/ai-booking-assistant/intake-test/?plan=ai-business&lang='+lang,{waitUntil:'domcontentloaded'});
  await page.locator('#intake').waitFor({state:'visible',timeout:8000});
  assert.match(await page.locator('#testBanner').innerText(),/NO PAYMENT/);
  assert.match(await page.locator('#paymentText').innerText(),/\$69/);
  assert.match(await page.locator('#paymentText').innerText(),/\$25/);
  assert.equal(await page.locator('#avatarPhoto').isDisabled(),true);
  await page.locator('#business').fill('Preview Cleaning');
  await page.locator('#target').selectOption('existing_website');
  await page.locator('#website').fill('https://example.com');
  await page.locator('#services').fill('Residential cleaning');
  await page.locator('#serviceArea').fill('Miami, FL');
  await page.locator('.setup-step').nth(0).getByRole('button').click();
  await page.locator('#contactName').fill('Example Owner');
  await page.locator('#avatarName').fill('Sam');
  await page.locator('#followupConsent').check();
  await page.locator('.setup-step').nth(1).getByRole('button',{name:lang==='es'?'Revisar →':'Review →'}).click();
  await page.locator('#submit').click();
  await page.locator('#done').waitFor({state:'visible'});
  assert.equal(externalOps,0,'Preview should never call live services');
  assert.deepEqual(errors,[],'Preview browser errors');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+2),true,'Preview horizontal overflow');
  await page.screenshot({path:'qa-screenshots/ai-intake-preview-'+lang+'.png',fullPage:true});
  await ctx.close();
  console.log('PASS no-charge AI intake preview '+lang);
 }

 // Booking Page paid-intake preview: guided selections must map into the original catalog fields.
 for(const lang of ["en","es"]){
  const ctx=await browser.newContext({viewport:{width:390,height:844}}),page=await ctx.newPage();
  const errors=[];let requests=0;
  page.on("pageerror",e=>errors.push(String(e)));
  await page.route("**/functions/v1/**",r=>{requests++;return r.abort();});
  const prefix=lang==="es"?"/es":"";
  await page.goto(base+prefix+"/booking-flow-intake/?demo=1",{waitUntil:"domcontentloaded"});
  await page.locator('input[name="owner_name"]').fill("Example Owner");
  await page.locator('input[name="business_name"]').fill("QA Cleaning");
  await page.locator('#businessEmail').fill("demo@example.com");
  await page.locator('#businessCategory').selectOption("cleaning");
  await page.locator('input[name="service_areas"]').fill("Miami");
  await page.locator('select[name="pricing_style"]').selectOption("mixed");
  await page.locator('select[name="quote_estimate_rules"]').selectOption("review_unpriced_jobs");
  await page.locator('select[name="flat_price_auto_confirm"]').selectOption("false");
  await page.locator('textarea[name="availability"]').fill("Monday-Friday 9-5");
  // Appointment duration is now a guided, visible radio/select control.
  // The original job_duration_minutes input is intentionally hidden.
  const duration=page.locator('[data-tle-duration-picker]');
  await duration.locator('input[name="duration_mode"][value="same"]').check();
  await duration.locator('#durationOne').selectOption("120");
  await page.locator('select[name="recurring_booking_policy"]').selectOption("weekly");
  await page.locator('input[name="customer_payment_methods"]').fill("Cash, Zelle");
  await page.locator('input[name="tle_pick_booking_services_standard"]').check();
  const flatRow=page.locator(".tle-guided-row").first();
  await flatRow.locator("select").selectOption("fixed");
  await flatRow.locator('input[type="number"]').first().fill("150");
  await page.locator('input[name="tle_pick_booking_services_deep"]').check();
  const estimateRow=page.locator(".tle-guided-row").last();
  await estimateRow.locator("select").selectOption("estimate");
  await estimateRow.locator('input[type="number"]').nth(1).fill("220");
  await estimateRow.locator('input[type="number"]').nth(2).fill("350");
  await page.locator("#tleFixedPriceVisibility").selectOption("yes");
  await page.locator("#tleEstimatePriceVisibility").selectOption("yes");
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+2),true,"Guided booking overflow");
  await page.screenshot({path:"qa-screenshots/booking-guided-"+lang+".png",fullPage:true});
  await page.locator("#submit").click();
  await page.locator(".success").waitFor({state:"visible",timeout:6000});
  assert.equal(requests,0,"Booking demo must not submit to production");
  assert.deepEqual(errors,[],"Guided booking errors");
  await ctx.close();
  console.log("PASS guided booking intake "+lang+" 390px");
 }

 // Verify the combined paid-intake preview has one guided setup and no real submissions.
 for(const lang of ["en","es"]){
  const ctx=await browser.newContext({viewport:{width:390,height:844}}),page=await ctx.newPage(),errors=[];
  let live=0;page.on("pageerror",e=>errors.push(String(e)));
  await page.route("**/functions/v1/**",route=>{live++;return route.abort();});
  await page.goto(base+(lang==="es"?"/es":"")+"/booking-flow-intake/?demo=1&bundle=ai-business",{waitUntil:"domcontentloaded"});
  assert.equal(await page.locator("#tleBundleAiIntake").isVisible(),true);
  assert.equal(await page.locator("#tleBundleAiBooking").isVisible(),false,"Legacy booking question must be hidden");
  assert.equal(await page.locator("#tleBundleAiFollowup").isVisible(),false,"Legacy follow-up question must be hidden");
  assert.equal(await page.locator("#tleBundleAiIntake .tle-guided-panel").count(),2,"Separate booking and follow-up guided checklists should display");
  assert.equal(await page.locator('input[name="tle_pick_bundle_booking_questions"]').count(),1);
  assert.equal(await page.locator('input[name="tle_pick_bundle_followup_quote"]').count(),1);
  assert.match(await page.locator(".hero").innerText(),lang==="es"?/4 días hábiles/:/4 business days/);
  assert.equal(await page.locator('input[name="setup_call_requested"]').count(),1);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+2),true,"Bundle has horizontal overflow");
  assert.equal(live,0,"Bundle demo must not call production");
  assert.deepEqual(errors,[],"Bundle preview browser errors");
  await page.screenshot({path:"qa-screenshots/bundle-intake-"+lang+".png",fullPage:true});
  await ctx.close();
  console.log("PASS guided bundle + optional call "+lang+" 390px");
 }
}finally{
 await browser.close();
 await new Promise(done=>server.close(done));
}
