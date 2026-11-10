// Browser-only wishlist QA: product cards, count updates, no live orders/payments.
import assert from 'node:assert/strict';
import { chromium, webkit } from 'playwright';
const origin=(process.env.QA_URL||'http://127.0.0.1:4196').replace(/\/$/,'');
for(const engine of [chromium,webkit]){
 const browser=await engine.launch({headless:true});
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
    const lavanda=slug==='lavender-edit';
    if(lavanda){
     await page.locator('.tle-lavanda-wishlist-topbar').waitFor({state:'visible'});
     assert.equal(await wishlist.isVisible(),false,'Lavanda wishlist is not on the main page');
     assert.equal(await page.locator('.tle-wishlist-jump').count(),0,'No wishlist duplicate below product grid');
     assert.equal(await page.locator('.tle-lavanda-wishlist-topbar').getAttribute('href'),'?view=wishlist');
    }
    assert.equal(await wishlist.locator('[data-wishlist-count]').innerText(),'0');
    await sources.nth(0).click();
    await sources.nth(1).click();
    assert.equal(await wishlist.locator('[data-wishlist-count]').innerText(),'2','Heading count after saves');
    assert.equal(await cards.count(),2);
    if(lavanda){
     assert.equal(await page.locator('.tle-lavanda-wishlist-badge').innerText(),'2','Header heart count');
     await page.locator('.tle-lavanda-wishlist-topbar').click();
     await page.waitForURL('**/demos/lavender-edit/?view=wishlist');
     assert.equal(await wishlist.isVisible(),true,'Dedicated Lavanda wishlist visible');
     assert.equal(await page.locator('#main > .hero').isVisible(),false,'Storefront hidden on wishlist route');
     await page.reload({waitUntil:'domcontentloaded'});
     await page.locator('.tle-wishlist-card').first().waitFor({state:'visible',timeout:16000});
     assert.equal(await cards.count(),2,'Saved products survive direct wishlist refresh');
     assert.equal(await wishlist.isVisible(),true);
    }
    assert.equal(await sources.first().getAttribute('aria-pressed'),'true');
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
    if(lavanda){
     await page.locator('.tle-lavanda-wishlist-back').click();
     assert.equal(await wishlist.isVisible(),false,'Continue shopping returns to storefront');
     assert.equal(await page.locator('#main > .hero').isVisible(),true);
     assert.equal(await page.locator('.tle-lavanda-wishlist-badge').innerText(),'0');
     assert.equal(new URL(page.url()).searchParams.has('view'),false);
     await page.goBack();
     assert.equal(await wishlist.isVisible(),true,'Browser Back restores the wishlist route');
    }
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
