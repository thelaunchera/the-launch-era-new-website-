/* Non-mutating marketing offer image QA. Payment/intake remain untouched. */
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const base=(process.env.QA_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const offer={percent_off:40,booking_setup_cents:1999,plans:{'ai-booking':{setup_due_cents:4740,monthly_cents:2900}}};
const browser=await chromium.launch({headless:true});
try{
 for(const [lang,path] of [['en','/'],['es','/es/']]){
  for(const broken of [false,true]){
   const page=await browser.newPage({viewport:{width:390,height:844}});
   await page.route('**/functions/v1/tle-booking-bundle-checkout',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify(offer)}));
   if(broken) await page.route('**/assets/promo/tle-smart-welcome-bundle-flyer.jpg*',r=>r.abort());
   await page.goto(base+path,{waitUntil:'domcontentloaded',timeout:45000});
   const dialog=page.getByRole('dialog',{name:lang==='es'?'Oferta de The Launch Era':'The Launch Era bundle offer'});
   await dialog.waitFor({state:'visible',timeout:20000});
   if(broken){
    await dialog.locator('.tle-bundle-art-fallback').waitFor({state:'visible',timeout:10000});
    assert.equal(await dialog.locator('.tle-bundle-art-fallback').count(),1,'Fallback photo alternative missing');
   }else{
    await page.waitForFunction(()=>{let img=document.querySelector('.tle-bundle-welcome-dialog img');return !!img&&img.complete&&img.naturalWidth>500},null,{timeout:10000});
    assert.equal(await dialog.locator('img').count(),1,'Approved flyer replaced');
   }
   const link=dialog.locator('.tle-bundle-welcome-cta');
   assert.match(await link.getAttribute('href'),/\/booking-bundle\/\?lang=(en|es)&bundle=ai-booking/);
   await dialog.getByRole('button',{name:lang==='es'?'Cerrar promoción':'Close promotion'}).click();
   assert.equal(await dialog.count(),0,'Promotional modal did not close');
   assert.equal(await page.locator('.tle-bundle-inline').count(),1,'Inline offer lost');
   console.log('SMART_WELCOME_FLYER_QA_PASS '+JSON.stringify({lang,broken,link:await link.count()}));
   await page.close();
  }
 }
}finally{await browser.close();}
