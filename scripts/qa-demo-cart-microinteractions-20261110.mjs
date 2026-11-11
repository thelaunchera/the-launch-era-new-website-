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
    await page.waitForTimeout(motion==='reduce'?100:1550);
    assert.equal((await page.locator(countSelector).innerText()).trim(),'1','Use existing cart counter');
    // Owner-approved behavior: adding a product never opens the cart automatically.
    if(slug==='casa-brownie'){
      assert.ok(!(await page.locator('#modal-root').innerText()).includes('Tu carrito de muestra'),
        'Add leaves the product detail modal, not the cart, open');
      await page.locator('#modal-close').click();
      await page.locator('#demo-order').click();
    }else{
      assert.equal(await page.locator('#cart-layer').isVisible(),false,'Add does not force the bag open');
      await page.locator('[data-open-cart]').first().click();
    }
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

// Guided-order brands: the only bag trigger belongs in the top bar, not a floating corner.
for(const type of [chromium,webkit]){
 const browser=await type.launch({headless:true});
 try{
  for(const slug of ['golden-grid','havana-19']){
   for(const width of [390,1440]){
    const page=await browser.newPage({viewport:{width,height:844},reducedMotion:'reduce'});
    const errors=[];page.on('pageerror',err=>errors.push(err.message));
    await page.goto(root+'/demos/'+slug+'/',{waitUntil:'domcontentloaded'});
    const bag=page.locator('header .tle-order-float');
    await bag.waitFor({state:'visible',timeout:12000});
    assert.equal(await page.locator('.tle-order-float').count(),1,slug+' one sample bag');
    assert.equal(await page.locator('body > .tle-order-float').count(),0,slug+' no floating cart');
    assert.match(await bag.getAttribute('aria-label'),/shopping bag|bolsa/i);
    const horizontalOverflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2);
    assert.equal(horizontalOverflow,false,slug+' header fits at '+width+'px');
    await bag.click();
    assert.equal(await page.locator('#tle-demo-order-dialog').evaluate(el=>el.open),true,'Header bag opens original order flow');
    await page.locator('#tle-demo-order-dialog [data-action="close"]').click();
    assert.equal(await page.locator('#tle-demo-order-dialog').evaluate(el=>el.open),false,'Header bag closes cleanly');
    assert.deepEqual(errors,[],slug+' no script errors');
    await page.close();
   }
  }
 }finally{await browser.close();}
}
