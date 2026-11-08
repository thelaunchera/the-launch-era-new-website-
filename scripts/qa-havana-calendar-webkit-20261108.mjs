// WebKit/iPhone acceptance for Havana 19: inline bilingual date, compact fit and preview-only submission.
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {webkit,devices} from 'playwright';
const origin=(process.env.QA_URL||'http://127.0.0.1:4191').replace(/[/]$/,'');
const browser=await webkit.launch({headless:true});
try{
 for(const width of [360,390]){
  const context=await browser.newContext({...devices['iPhone 13'],viewport:{width,height:780},reducedMotion:'reduce'});
  const page=await context.newPage();
  const errors=[];
  page.on('pageerror',error=>errors.push(String(error)));
  const response=await page.goto(origin+'/demos/havana-19/',{waitUntil:'domcontentloaded'});
  assert.equal(response?.status(),200);
  const form=page.locator('#booking'),trigger=page.locator('#tlc-date-trigger');
  await trigger.waitFor({state:'visible'});
  assert.equal(await form.locator('input[type=date]').count(),0,'Havana Safari must never render a native blank date field');
  assert.equal(await page.locator('#date').getAttribute('type'),'hidden','Date ISO source stays in FormData');
  await trigger.click();
  const panel=page.locator('#tlc-date-calendar');
  assert.equal(await panel.isVisible(),true,'Touch calendar opens inside reservation form');
  const geo=await panel.evaluate(el=>{
   const r=el.getBoundingClientRect(),parent=el.parentElement.getBoundingClientRect(),
     trigger=document.getElementById('tlc-date-trigger').getBoundingClientRect();
   return {right:r.right,parentRight:parent.right,scroll:document.documentElement.scrollWidth,viewport:window.innerWidth,triggerHeight:trigger.height};
  });
  assert.ok(geo.right<=geo.parentRight+2,'Calendar extends outside field: '+JSON.stringify(geo));
  assert.ok(geo.scroll<=geo.viewport+2,'Mobile overflow: '+JSON.stringify(geo));
  assert.ok(geo.triggerHeight>=50 && geo.triggerHeight<=56,'Touch date should be compact');
  await mkdir('qa-screenshots',{recursive:true});
  await panel.screenshot({path:'qa-screenshots/hero-havana-calendar-webkit-'+width+'.png'});
  const first=panel.locator('button[data-day]:not([disabled])').first();
  const iso=await first.getAttribute('data-day');
  await first.click();
  assert.equal(await page.locator('#date').inputValue(),iso);
  assert.equal(await trigger.getAttribute('data-selected'),'true');
  assert.equal(await panel.isVisible(),false);
  await form.locator('[name=time]').selectOption({label:'7:00 PM'});
  await form.locator('input[name=name]').fill('Sample Guest');
  await form.locator('input[name=email]').fill('sample@example.com');
  await form.locator('button[type=submit]').click();
  const receipt=page.locator('#receipt');
  await receipt.waitFor({state:'visible'});
  assert.ok((await page.locator('#details').innerText()).includes(iso),'Preview must retain selected ISO date');
  assert.match(await receipt.innerText(),/not a confirmed reservation/i);
  await page.locator('#edit').click();
  await page.locator('#lang').click();
  assert.equal(await page.locator('html').getAttribute('lang'),'es','Spanish toggle stays functional');
  await trigger.click();
  assert.match(await panel.locator('.tlc-calendar-caption').innerText(),/No.*reserva confirmada|no es una reserva confirmada/i);
  assert.deepEqual(errors,[],'No page JS errors: '+errors.join('; '));
  console.log('HAVANA WEBKIT IPHONE QA PASS',width,JSON.stringify({date:iso,geo}));
  await context.close();
 }
}finally{await browser.close()}
