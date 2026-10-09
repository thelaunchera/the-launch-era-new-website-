import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdirSync } from 'node:fs';
const base=process.env.QA_URL||'https://thelaunchera.com';
const screens=[
 {name:'small-phone',width:360,height:780},
 {name:'mobile',width:390,height:844},
 {name:'tablet',width:820,height:1180},
 {name:'desktop',width:1440,height:900}
];
const results=[];const browser=await chromium.launch({headless:true});
mkdirSync('qa-screenshots',{recursive:true});
const ok=label=>{results.push({case:label,pass:true});console.log('PASS',label)};
const fail=(label,e)=>{results.push({case:label,pass:false,reason:String(e)});console.error('FAIL',label,String(e))};
async function check(label,viewport,action){
 const page=await browser.newPage({viewport,deviceScaleFactor:1});
 const errs=[];page.on('pageerror',e=>errs.push(e.message));
 try{await action(page);assert.equal(errs.length,0,'Page JavaScript errors '+errs.join(','));ok(label)}
 catch(e){fail(label,e);await page.screenshot({path:'qa-screenshots/ERROR-'+label.replace(/[^a-z0-9_-]+/gi,'-')+'.png',fullPage:true}).catch(()=>{})}
 finally{await page.close()}
}
for(const v of screens){
 for(const lang of ['en','es']){
  await check('Personalized booking demo '+v.name+' '+lang,v,async p=>{
   const r=await p.goto(base+'/booking-demo/?lang='+lang,{waitUntil:'domcontentloaded',timeout:30000});
   assert.equal(r?.status(),200,'demo HTTP status');
   await p.locator('#demoForm').waitFor();
   assert.equal(await p.locator('html').getAttribute('lang'),lang);
   assert.equal(await p.locator('#language').inputValue(),lang);
   assert.equal(await p.locator('#demoForm input[name="name"]').count(),1);
   assert.equal(await p.locator('#demoForm input[name="email"][type="email"]').count(),1);
   assert.equal(await p.locator('#demoForm input[name="business"]').count(),1);
   assert.equal(await p.locator('#demoForm input[name="serviceArea"]').count(),1);
   assert.equal(await p.locator('#demoForm textarea[name="goal"]').count(),1);
   assert.equal(await p.locator('#submit').count(),1);
   const privacy=await p.locator('#privacy').innerText();
   assert.match(privacy,lang==='es'?/automáticamente.*por correo/i:/automatically/i,'demo must say automatically delivered');
   assert.doesNotMatch(privacy,lang==='es'?/responderte sobre la solicitud/i:/contact you about your request/i,'no manual contact promise');
   const confirmation=await p.locator('#thanksCopy').innerText();
   assert.match(confirmation,lang==='es'?/Promociones.*Spam/i:/Promotions.*Spam/i,'check promotions/spam');
   assert.match(confirmation,lang==='es'?/código de 6 dígitos/i:/6-digit email verification code/i,'email code reminder');
   assert.equal(await p.locator('#ownerTab').count(),0,'Old fake command center no longer available');
   assert.equal(await p.locator('#customerTab').count(),0,'Old fake booking demo no longer available');
   assert.equal(await p.locator('#demoForm input[name="email"]').isVisible(),true);
   assert.equal(await p.locator('form#demoForm').isVisible(),true);
   await p.locator('#demoForm input[name="name"]').fill('Example Visitor');
   await p.locator('#demoForm input[name="email"]').fill('example@example.com');
   await p.locator('#demoForm input[name="business"]').fill('Example Cleaning Company');
   await p.locator('#demoForm input[name="serviceArea"]').fill('Charlotte, NC');
   await p.locator('#demoForm textarea[name="goal"]').fill('Organize follow-ups');
   // Do not submit. A real request would send email / add a lead.
   assert.equal(await p.locator('#demoForm input[name="business"]').inputValue(),'Example Cleaning Company');
   const bounds=await p.evaluate(()=>({scroll:document.documentElement.scrollWidth,width:document.documentElement.clientWidth,
    form:(()=>{let q=document.querySelector('#demoForm').getBoundingClientRect();return [q.left,q.right]})()}));
   assert(bounds.scroll<=bounds.width+3,'No horizontal overflow '+JSON.stringify(bounds));
   assert(bounds.form[0]>=-2&&bounds.form[1]<=bounds.width+2,'Form fits '+JSON.stringify(bounds));
   await p.screenshot({path:'qa-screenshots/'+v.name+'-'+lang+'-personalized-booking.png',fullPage:true});
  });
  await check('Homepage contact only '+v.name+' '+lang,v,async p=>{
   const path=lang==='es'?'/es/':'/';
   const r=await p.goto(base+path,{waitUntil:'domcontentloaded',timeout:30000});
   assert.equal(r?.status(),200,'Homepage HTTP');
   await p.locator('#contacto .contact-form form').waitFor();
   assert.equal(await p.locator('#contacto').count(),1);
   assert.equal(await p.locator('#contacto .contact-form form').count(),1,'Actual contact form appears once');
   assert.equal(await p.locator('#contacto input[name="email"]').count(),1);
   assert.equal(await p.locator('#contacto textarea[name="message"]').count(),1);
   assert.equal(await p.locator('#contacto a[href*="booking-demo"]').count(),0,'No demo link in contact card');
   assert.equal(await p.locator('#contacto .homepage-demo-access').count(),0,'Duplicate demo content removed');
   assert.equal(await p.locator('text=Ask for your Demo').count(),0,'Old personalized modal removed from homepage, preserved at demo page');
   assert((await p.locator('a[href="/booking-demo/?lang='+lang+'"]').count())>0,'Personalized demo link elsewhere on homepage');
   const bounds=await p.locator('#contacto').evaluate(el=>{const a=el.getBoundingClientRect();return {left:a.left,right:a.right,window:document.documentElement.clientWidth}});
   assert(bounds.left>=-2&&bounds.right<=bounds.window+2,'Contact card fits phone');
   await p.screenshot({path:'qa-screenshots/'+v.name+'-'+lang+'-homepage-contact.png',fullPage:true});
  });
  await check('Cleaning App demo unchanged '+v.name+' '+lang,v,async p=>{
   const r=await p.goto(base+'/cleaning-app-demo/?lang='+lang,{waitUntil:'domcontentloaded',timeout:30000});
   assert.equal(r?.status(),200,'Cleaning App preview HTTP');
   await p.locator('#nav button').first().waitFor();
   assert.equal(await p.locator('#nav button').count(),6);
   await p.locator('#nav [data-tab="2"]').click();
   await p.locator('[data-action="done"]').click();
   assert.equal(await p.locator('[data-action="done"]').isDisabled(),true);
   await p.locator('[data-action="reset"]').click();
   assert.equal(await p.locator('#nav [data-tab="0"]').getAttribute('aria-current'),'page');
  });
 }
}
for(const [name,path,href] of [
 ['EN product','/booking-lead-automation','/booking-demo/?lang=en'],
 ['ES product','/es/booking-lead-automation/','/booking-demo/?lang=es']]){
 await check(name,{width:390,height:844},async p=>{
  const r=await p.goto(base+path,{waitUntil:'domcontentloaded',timeout:30000});
  assert.equal(r?.status(),200);
  assert((await p.locator('a[href="'+href+'"]').count())>0,'Personalized demo link missing');
 });
}
await browser.close();
console.log('SUMMARY',JSON.stringify({pass:results.filter(x=>x.pass).length,failed:results.filter(x=>!x.pass).length,tests:results}));
if(results.some(x=>!x.pass))process.exitCode=1;