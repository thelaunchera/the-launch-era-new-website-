import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdirSync} from 'node:fs';
const base = process.env.QA_URL || 'https://thelaunchera.com';
const viewports = [
  {name:'mobile',width:390,height:844},
  {name:'tablet',width:820,height:1180},
  {name:'desktop',width:1440,height:900},
];
const results=[];
const browser=await chromium.launch({headless:true});
mkdirSync('qa-screenshots',{recursive:true});
const fail=(caseName,e)=>{results.push({case:caseName,pass:false,reason:String(e)});console.error('FAIL',caseName,String(e))};
const good=caseName=>{results.push({case:caseName,pass:true});console.log('PASS',caseName)};
for(const v of viewports){
 const page=await browser.newPage({viewport:{width:v.width,height:v.height},deviceScaleFactor:1});
 const errors=[];
 page.on('pageerror',err=>errors.push(err.message));
 for(const lang of ['en','es']){
  const label=v.name+' / '+lang;
  try{
    const response=await page.goto(base+'/booking-demo/?lang='+lang,{waitUntil:'domcontentloaded',timeout:30000});
    assert.equal(response?.status(),200,'demo HTTP status');
    await page.waitForSelector('#ownerTab');
    assert.equal(await page.locator('#language').inputValue(),lang,'language deep link');
    assert.equal(await page.locator('html').getAttribute('lang'),lang,'HTML document language');
    assert.equal(await page.locator('#customerView').isVisible(),true,'customer view visible');
    await page.screenshot({path:'qa-screenshots/'+v.name+'-'+lang+'-booking.png',fullPage:true});
    const horizontal=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,width:document.documentElement.clientWidth}));
    assert(horizontal.scroll<=horizontal.width+3,'horizontal overflow '+JSON.stringify(horizontal));
    await page.locator('#standard').click();
    await page.locator('#slots button').filter({hasText:'10:30 AM'}).click();
    assert.equal(await page.locator('#submitDemo').isEnabled(),true);
    await page.locator('#submitDemo').click();
    assert.equal(await page.locator('#ownerView').isVisible(),true,'owner view switches on request');
    assert.equal(await page.locator('#newLead').isVisible(),true,'the sample request is visible to owner');
    assert.match(await page.locator('#leadStatus').innerText(),lang==='es'?/pendiente/i:/needs review/i);
    await page.locator('#editPrice').fill('165');
    await page.locator('#editAvailability').selectOption('morning');
    await page.locator('#saveDemo').click();
    assert.equal(await page.locator('#customerView').isVisible(),true);
    assert.equal(await page.locator('#standardPrice').innerText(),'$165','owner price propagated to booking');
    assert.equal(await page.locator('#slots button').filter({hasText:'1:00 PM'}).isDisabled(),true,'closed slot unavailable');
    await page.locator('#ownerTab').click();
    await page.locator('#confirmDemo').click();
    assert.match(await page.locator('#leadStatus').innerText(),lang==='es'?/confirmada/i:/confirmed/i);
    assert.equal(errors.length,0,'page JavaScript errors: '+errors.join(','));
    await page.screenshot({path:'qa-screenshots/'+v.name+'-'+lang+'-owner.png',fullPage:true});
    good(label);
  }catch(e){fail(label,e);await page.screenshot({path:'qa-screenshots/ERROR-'+v.name+'-'+lang+'.png',fullPage:true}).catch(()=>{})}
 }
 await page.close();
}
for(const [name,path,lookFor] of [
 ['EN sales landing','/booking-lead-automation','/booking-demo/?lang=en'],
 ['ES sales landing','/es/booking-lead-automation/','/booking-demo/?lang=es'],
 ['EN homepage','/','/booking-demo/?lang=en'],
 ['ES homepage','/es','/booking-demo/?lang=es'],
]){
 const p=await browser.newPage({viewport:{width:390,height:844}});
 try {
  const r=await p.goto(base+path,{waitUntil:'domcontentloaded',timeout:30000});
  assert.equal(r?.status(),200);
  assert((await p.locator('a[href="'+lookFor+'"]').count())>0,'demo link missing');
  good(name);
 }catch(e){fail(name,e)}
 await p.close();
}
for(const route of ['/cleaning-web-app','/es/cleaning-web-app/']){
 const page=await browser.newPage();
 try{
  await page.goto(base+route,{waitUntil:'domcontentloaded',timeout:30000});
  assert.match(await page.locator('body').innerText(),/30 DAYS FREE|30 DÍAS GRATIS/i);
  good('30-day app trial '+route);
 }catch(e){fail('30-day app trial '+route,e)}
 await page.close();
}
await browser.close();
console.log('SUMMARY',JSON.stringify({pass:results.filter(x=>x.pass).length,failed:results.filter(x=>!x.pass).length,tests:results}));
if(results.some(x=>!x.pass))process.exitCode=1;
