// Real-browser QA for original sample cart animations. No backend or payments.
import assert from 'node:assert/strict';
import { chromium, webkit } from 'playwright';
const root=(process.env.QA_URL||'http://127.0.0.1:4196').replace(/\/$/,'');
for(const browserType of [chromium,webkit]){
 const browser=await browserType.launch({headless:true});
 try{
  for(const [slug,trigger,followup,preview,addSelector,countSelector] of [
    ['casa-brownie','.flavor[data-flavor="clasico"]','.modal-primary','Tu carrito de muestra',null,'#cart-count'],
    ['la-vie-in-pink','#menu-grid .menu-card .add-btn',null,'Your bag',null,'#bag-count']
  ]){
   for(const motion of ['no-preference','reduce']){
    const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:motion});
    const errors=[];
    page.on('pageerror',err=>errors.push(err.message));
    const response=await page.goto(root+'/demos/'+slug+'/',{waitUntil:'domcontentloaded'});
    assert.equal(response?.status(),200,'Demo should load');
    if(slug==='la-vie-in-pink')assert.equal(await page.locator('#menu-grid .menu-card').count(),6,'Keep six original cafe products');
    await page.locator(trigger).first().click();
    if(followup)await page.locator(followup).filter({hasText:'Añadir al carrito de muestra'}).click();
    await page.waitForTimeout(motion==='reduce'?100:1100);
    assert.equal((await page.locator(countSelector).innerText()).trim(),'1','Use existing cart counter');
    const panel=slug==='casa-brownie'?page.locator('#modal-root'):page.locator('#cart-layer');
    assert.equal(await panel.getAttribute('hidden'),null,slug+' existing cart should open');
    assert.ok((await panel.innerText()).includes(preview),slug+' shows original cart content');
    assert.ok((await panel.innerText()).toLowerCase().includes(slug==='casa-brownie'?'no se':'demo'),'Demo must describe limitations');
    assert.equal(await page.locator('body > img[aria-hidden="true"][style*="position: fixed"]').count(),0,'Flight image cleaned up');
    assert.deepEqual(errors,[],slug+' no browser errors');
    console.log('PASS',browserType.name(),slug,motion,'native cart and optional image fly');
    await page.close();
   }
  }
 }finally{await browser.close();}
}
