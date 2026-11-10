// Browser-only wishlist QA: product cards, count updates, no live orders/payments.
import assert from 'node:assert/strict';
import { chromium, webkit } from 'playwright';
const origin=(process.env.QA_URL||'http://127.0.0.1:4196').replace(/\/$/,'');
for(const engine of (process.env.CHROMIUM_PATH?[chromium]:[chromium,webkit])){
 const browser=await engine.launch({headless:true,...(engine===chromium&&process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{})});
 try{
  for(const width of [390,1440]){
   for(const slug of ['lavender-edit','sneekiefs']){
    const page=await browser.newPage({viewport:{width,height:width===390?844:900},reducedMotion:'reduce'});
    const errors=[],writes=[];
    page.on('pageerror',error=>errors.push(String(error)));
    page.on('request',req=>{if(req.method()!=='GET')writes.push(req.url())});
    const response=await page.goto(origin+'/demos/'+slug+'/',{waitUntil:'domcontentloaded',timeout:35000});
    assert.equal(response?.status(),200,slug+' route');
    await page.locator('.tle-wishlist-heart').first().waitFor({state:'visible',timeout:16000});
    const sources=page.locator('.tle-wishlist-heart');
    assert.equal(await sources.count(),3,slug+' exactly three products');
    const wishlist=page.locator('#tle-wishlist');
    const cards=wishlist.locator('[data-wish-card]');
    assert.equal(await wishlist.locator('[data-wishlist-count]').innerText(),'0');
    await sources.nth(0).click();
    await sources.nth(1).click();
    assert.equal(await wishlist.locator('[data-wishlist-count]').innerText(),'2','Heading count after saves');
    assert.equal(await cards.count(),2);
    assert.equal(await sources.first().getAttribute('aria-pressed'),'true');
    assert.equal(await wishlist.isHidden(),true,'Wishlist absent from main page');
    await page.locator('.tle-wishlist-topbar').click();
    assert.match(page.url(),/view=wishlist/);
    assert.equal(await wishlist.isVisible(),true);
    assert.equal(await page.locator('.hero').isHidden(),true,'Homepage hidden on wishlist page');
    await page.reload({waitUntil:'domcontentloaded'});
    await wishlist.waitFor({state:'visible'});
    assert.equal(await cards.count(),2,'Favorites survive direct URL reload');
    await page.goBack();
    await page.waitForTimeout(100);
    assert.equal(await wishlist.isHidden(),true,'Browser Back returns to shop');
    await page.locator('.tle-wishlist-topbar').click();
    await cards.first().locator('[data-wish-remove]').click();
    await page.waitForTimeout(80);
    assert.equal(await cards.count(),1,'Grid closes removed card gap');
    assert.equal(await wishlist.locator('[data-wishlist-count]').innerText(),'1','Heading count after remove');
    if(slug==='sneekiefs'){
     // A sneaker must never move without a size, and must not open the drawer.
     await cards.first().locator('[data-wish-move]').click();
     assert.equal(await cards.count(),1,'Size required before moving');
     assert.equal(await page.locator('#bagCount').innerText(),'0');
     await cards.first().locator('[data-wish-size]').selectOption('9');
    }
    await cards.first().locator('[data-wish-move]').click();
    await page.waitForTimeout(80);
    assert.equal(await cards.count(),0,'Move removes wishlist card');
    assert.equal(await wishlist.locator('[data-wishlist-count]').innerText(),'0','Move updates wishlist heading count');
    if(slug==='lavender-edit'){
     assert.equal(await page.locator('[data-lb-cart-count]').innerText(),'1','Native bag count updated');
     assert.equal(await page.locator('#lb-cart-drawer').isHidden(),true,'Wishlist move never auto-opens cart');
     await page.locator('.lb-cart-trigger').click();
     assert.equal(await page.locator('.lb-cart-row').count(),1);
     await page.locator('[data-lb-close]').click();
    }else{
     assert.equal(await page.locator('#bagCount').innerText(),'1','Native bag count updated');
     assert.equal(await page.locator('#bagDialog').isHidden(),true,'Wishlist move never auto-opens cart');
     await page.locator('#bagOpen').click();
     assert.match(await page.locator('#bagItems').innerText(),/City Court|Canyon Classic|Sandstone Low/);
     assert.match(await page.locator('#bagItems').innerText(),/US 9/);
     await page.locator('#bagClose').click();
    }
    await page.locator('.tle-wishlist-back').click();
    assert.equal(await wishlist.isHidden(),true);
    assert.equal(await page.locator(slug==='lavender-edit'?'[data-lb-cart-count]':'#bagCount').innerText(),'1','Bag survives return to shop');
    assert.equal(writes.length,0,'No network writes from sample shopping');
    assert.deepEqual(errors,[],slug+' no browser errors');
    const overflow=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,width:innerWidth}));
    assert.ok(overflow.scroll<=overflow.width+2,slug+' no horizontal overflow: '+JSON.stringify(overflow));
    await page.close();
    console.log('PASS',engine.name(),slug,width,'save, remove, heading count, cart, closed drawer');
   }
  }
 }finally{await browser.close()}
}
