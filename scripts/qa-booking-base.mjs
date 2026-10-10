import {chromium} from 'playwright';import assert from 'node:assert/strict';import {mkdirSync} from 'node:fs';
const base=process.env.QA_URL||'https://thelaunchera.com';const browser=await chromium.launch();mkdirSync('qa-screenshots',{recursive:true});let passed=0,failed=0;
const model={business_name:'Fixture Cleaning',language:'en',timezone:'America/New_York',currency:'USD',quote_policy:'review_unpriced_jobs',auto_confirm_flat:false,addons:[],branding:{headline:'A clean home starts here.',description:'Our verified fixture business.',service_area:'Example City',reviews:[{name:'Test Client',text:'Original text | kept intact\nSecond line',rating:5}]},services:[{id:'home-clean',name:'Fixture Home Cleaning',category:'residential',mode:'flat',price:123,active:true},{id:'office-clean',name:'Fixture Office Cleaning',category:'commercial',mode:'quote',active:true}]};
async function check(name,viewport,run){const p=await browser.newPage({viewport});const errors=[];p.on('pageerror',e=>errors.push(e.message));try{await run(p);assert.deepEqual(errors,[]);passed++;console.log('PASS '+name)}catch(e){failed++;console.error('FAIL '+name+': '+e);await p.screenshot({path:'qa-screenshots/FAIL-'+name.replace(/\W+/g,'-')+'.png',fullPage:true}).catch(()=>{})}finally{await p.close()}}
async function overflow(p){assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'horizontal overflow')}
for(const width of [360,390,820,1440])for(const lang of ['en','es']){
 const viewport={width,height:900};
 await check('Original base redirects public visitors to demo '+width+' '+lang,viewport,async p=>{await p.goto(base+'/base-booking.html?base=1&lang='+lang);await p.waitForURL(url=>url.pathname==='/booking-demo/');assert.equal(await p.locator('#demoForm').count(),1);assert.equal(await p.locator('#baseServiceGrid').count(),0);await overflow(p)});
 await check('Buyer branding & reviews '+width+' '+lang,viewport,async p=>{await p.route('**/functions/v1/**',route=>{assert.ok(route.request().url().endsWith('/tle-booking-flow-pricing'),'Unexpected live API request');return route.fulfill({json:{...model,language:lang}})});await p.goto(base+'/booking/?key='+'a'.repeat(48)+'&lang='+lang);await p.locator('.base-review:not(.empty)').waitFor();assert.match(await p.locator('#baseBusiness').textContent(),/Fixture Cleaning/);assert.equal(await p.locator('.base-review').count(),1);assert.equal(await p.locator('.base-review blockquote').textContent(),model.branding.reviews[0].text);assert.equal(await p.locator('.base-review a').count(),0);assert.equal(await p.locator('.base-review .cb-review-stars').textContent(),'★★★★★');assert.equal(await p.locator('.base-review .cb-review-stars').getAttribute('aria-label'),'5 out of 5 stars');assert.equal(await p.locator('#baseServiceGrid a').count(),2);assert.equal(await p.locator('.base-photo-label').isVisible(),false);await overflow(p)});
 await check('Empty reviews hidden '+width+' '+lang,viewport,async p=>{await p.route('**/functions/v1/**',r=>r.fulfill({json:{...model,branding:{...model.branding,reviews:[]},language:lang}}));await p.goto(base+'/base-booking.html?key='+'b'.repeat(48)+'&lang='+lang);await p.locator('#baseBusiness').filter({hasText:'Fixture Cleaning'}).waitFor();assert.equal(await p.locator('#baseReviews').isVisible(),false);await overflow(p)});
}
await check('Invalid key fails closed',{width:390,height:844},async p=>{await p.route('**/functions/v1/**',r=>r.fulfill({status:404,json:{error:'Not available'}}));await p.goto(base+'/booking/?key='+'c'.repeat(48));await p.getByRole('heading',{name:'Booking Page unavailable'}).waitFor();assert.equal(await p.locator('#services').isVisible(),false);assert.equal(await p.locator('#baseReviews').isVisible(),false);await overflow(p)});

const cbFixture={...model,business_name:'CB Depot',branding:{business_name:'CB Depot',headline:'Professional car detailing, made simple.',description:'Premium auto detailing',service_area:'Boynton Beach',hero_image:'',logo_image:'',reviews:[{name:'Real Test Reviewer',text:'Verified demo fixture review',rating:5}]},
 services:['Interior Detailing','Exterior Detailing','Deep Interior Cleaning','Paint Protection','Full Detail Package','Custom Auto Detailing Quote']
 .map((name,i)=>({id:'fixture-car-'+i,name,mode:'quote',category:'residential',active:true}))};
for(const width of [390,820,1024,1440]){
 await check('CB Depot custom landing + contact '+width,{width,height:900},async p=>{
  let inquiry=null;
  await p.route('**/functions/v1/**',route=>{
   const url=route.request().url();
   if(url.endsWith('/tle-booking-flow-pricing'))return route.fulfill({json:cbFixture});
   if(url.endsWith('/tle-booking-flow-inquiry')){inquiry=JSON.parse(route.request().postData());return route.fulfill({json:{ok:true,booking_confirmed:false}})}
   return route.fulfill({json:{slots:[]}});
  });
  await p.goto(base+'/base-booking.html?key='+'d'.repeat(48)+'&lang=en');
  await p.locator('body.vehicle-booking').waitFor();
  await p.locator('#cbContactForm').waitFor();
  assert.equal(await p.locator('.trust .cb-trust').count(),3);
  assert.ok(await p.locator('#leadHero').evaluate(el=>Math.abs(el.getBoundingClientRect().width-innerWidth)<2),'CB hero must fill viewport');
  assert.ok(await p.locator('.trust').evaluate(el=>Math.abs(el.getBoundingClientRect().width-innerWidth)<2),'Trust bar must be full bleed');
  await overflow(p);

  assert.equal(await p.locator('#baseServiceGrid .base-service-card').count(),4);
  assert.equal(await p.locator('.base-review .cb-review-stars').textContent(),'★★★★★');
  assert.equal(await p.locator('.base-review a').count(),0);
  await p.locator('#cbContactForm [name=customer_name]').fill('Guest Fixture');
  await p.locator('#cbContactForm [name=customer_email]').fill('fixture@example.com');
  await p.locator('#cbContactForm [name=message]').fill('Can you detail my BMW next week?');
  await p.locator('#cbContactForm button[type=submit]').click();
  await p.getByText('Thank you! Your message was sent to CB Depot.').waitFor();
  assert.equal(inquiry?.source,'booking_page_contact');
  assert.equal(inquiry?.request_type,'inquiry');
  assert.equal(inquiry?.customer_name,'Guest Fixture');
  assert.equal(inquiry?.booking_key,'d'.repeat(48));
  await p.locator('[data-cb-vehicle="SUV"]').click();
  await p.locator('#cbNext1').click();
  assert.equal(await p.locator('.cb-stage[data-stage="2"]').isVisible(),true);
  const wizardRect=await p.locator('#quote .cb-wizard').boundingBox();
  const dateRect=await p.locator('#qdate').boundingBox();
  const timeRect=await p.locator('#qtime').boundingBox();
  assert.ok(wizardRect&&dateRect&&timeRect,'Date, time and wizard must render');
  for(const [name,rect] of [['date',dateRect],['time',timeRect]]){
   assert.ok(rect.x>=wizardRect.x-2&&rect.x+rect.width<=wizardRect.x+wizardRect.width+2,
    'CB Depot '+name+' field must remain inside its form at '+width+'px');
  }
  assert.equal(await p.locator('#qtime').evaluate(el=>el.tagName),'SELECT');
  assert.equal(await p.locator('#qtime option[value="07:30"]').count(),1);
  const date=new Date();date.setDate(date.getDate()+((8-date.getDay())%7||7));
  await p.locator('#qdate').fill(date.toISOString().slice(0,10));
  await p.locator('#qtime').selectOption('07:30');
  await p.locator('#cbNext2').click();
  assert.equal(await p.locator('.cb-stage[data-stage="3"]').isVisible(),true);
  await overflow(p);
 });
}

await browser.close();console.log(JSON.stringify({passed,failed}));if(failed)process.exitCode=1;
