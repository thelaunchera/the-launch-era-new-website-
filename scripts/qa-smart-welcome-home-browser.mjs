// Read-only browser smoke for The Launch Era homepage promotion.
// Intercepts promotional GET only; no real customer, email, or checkout POST.
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdirSync} from 'node:fs';
const base=(process.env.QA_URL||'https://thelaunchera.com').replace(/\/$/,'');
const fixture={percent_off:40,booking_setup_cents:1999,plans:{
 'ai-booking':{setup_due_cents:4740,monthly_cents:2900},
 'ai-followup':{setup_due_cents:3540,monthly_cents:1900},
 'ai-business':{setup_due_cents:7140,monthly_cents:3900}
}};
const browser=await chromium.launch({headless:true});
mkdirSync('qa-screenshots',{recursive:true});
try {
 for(const width of [360,390,820,1440]) {
   const ctx=await browser.newContext({viewport:{width,height:width<500?800:900}});
   const page=await ctx.newPage();
   await page.route('**/functions/v1/tle-booking-bundle-checkout',route=>{
      if(route.request().method()!=='GET')throw Error('QA never invokes checkout POST');
      return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(fixture)});
   });
   await page.goto(base+'/',{waitUntil:'domcontentloaded'});
   const modal=page.getByRole('dialog',{name:'The Launch Era bundle offer'});
   await modal.waitFor({state:'visible',timeout:15000});
   const image=modal.locator('img');
   assert(await image.evaluate(el=>el.complete&&el.naturalWidth>500),'approved flyer failed to load');
   assert.equal(await page.locator('#smart-welcome-bundle').count(),1,'No inline promotion');
   const rect=await modal.evaluate(el=>{const r=el.getBoundingClientRect();return {l:r.left,right:r.right,w:window.innerWidth,h:r.height,screenH:window.innerHeight}});
   assert(rect.l>=-2&&rect.right<=rect.w+2&&rect.h<=rect.screenH+2,'Modal overflow '+width);
   await page.screenshot({path:'qa-screenshots/home-welcome-'+width+'.png'});
   const checkoutLink=modal.getByRole('link',{name:/Get the bundle/}).first();
   assert.match(await checkoutLink.getAttribute('href'),/^\/booking-bundle\/\?lang=en&bundle=ai-booking&source=smart-welcome$/);
   await modal.getByRole('button',{name:'Close promotion'}).click();
   assert.equal(await modal.count(),0,'Modal did not close');
   assert(await page.locator('#smart-welcome-bundle').isVisible(),'Inline panel disappeared');
   const slim=page.locator('#smart-welcome-bundle');
   assert.equal(await slim.locator('img').count(),0,'Large poster must not repeat in the homepage');
   const panelHeight=await slim.evaluate(el=>el.getBoundingClientRect().height);
   assert(panelHeight<=(width<700?225:165),'Inline promo still too tall at '+width+': '+panelHeight);
   assert.equal(await slim.locator('a.tle-bundle-inline-cta').count(),1,'Compact strip needs one working CTA');
   await slim.screenshot({path:'qa-screenshots/home-welcome-compact-'+width+'.png'});
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Home overflow '+width);
   await page.reload({waitUntil:'domcontentloaded'});
   await page.waitForTimeout(1600);
   assert.equal(await page.getByRole('dialog',{name:'The Launch Era bundle offer'}).count(),0,'Promo interrupted repeat session');
   await page.locator('.tle-bundle-inline-cta').click();
   await page.waitForURL(url=>url.pathname==='/booking-bundle/',{timeout:15000});
   const checked=page.locator('input[name="tle-ai-bundle"]:checked');
   await checked.waitFor({state:'attached'});
   assert.equal(await checked.inputValue(),'ai-booking','Bundle did not preselect AI on CTA');
   assert.equal(await page.locator('input[name="tle-ai-bundle"]').count(),4,'Other AI choices were lost');
   await ctx.close();
   console.log('PASS marketing promo and bundle CTA at '+width);
 }
 const esCtx=await browser.newContext({viewport:{width:390,height:844}});
 const esPage=await esCtx.newPage();
 await esPage.route('**/functions/v1/tle-booking-bundle-checkout',route=>route.fulfill({json:fixture}));
 await esPage.goto(base+'/es/',{waitUntil:'domcontentloaded'});
 const esModal=esPage.getByRole('dialog',{name:'Oferta de The Launch Era'});
 await esModal.waitFor({state:'visible',timeout:15000});
 assert(await esModal.getByRole('link',{name:'Ver el paquete'}).count()>=1,'Spanish bundle CTA missing');
 await esModal.getByRole('button',{name:'Cerrar promoción'}).click();
 assert.equal(await esPage.locator('.tle-bundle-inline').count(),1,'Spanish inline offer missing');
 await esCtx.close();
 console.log('PASS Spanish homepage');
 const offCtx=await browser.newContext({viewport:{width:390,height:844}});
 const off=await offCtx.newPage();
 await off.route('**/functions/v1/tle-booking-bundle-checkout',route=>route.fulfill({json:{...fixture,percent_off:0}}));
 await off.goto(base+'/',{waitUntil:'domcontentloaded'});
 await off.waitForTimeout(1600);
 assert.equal(await off.locator('.tle-bundle-welcome-dialog,.tle-bundle-inline').count(),0,'Disabled discount must not be advertised');
 await offCtx.close();
 console.log('PASS discount-disabled safety');
} finally {await browser.close()}
