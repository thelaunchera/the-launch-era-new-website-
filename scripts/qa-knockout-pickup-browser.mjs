import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {chromium} from 'playwright';

const root=path.resolve(process.argv[2] || '/tmp/knockout-demo-qa');
const url=pathToFileURL(path.join(root,'menu.html')).href;
const screenshots=path.resolve('qa-screenshots');
fs.mkdirSync(screenshots,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--allow-file-access-from-files']});
try{
  for(const width of [390,768,1024,1440]){
    const page=await browser.newPage({viewport:{width,height:900},deviceScaleFactor:1});
    page.on('pageerror',error=>console.error('BROWSER JS ERROR',width,error.message));
    page.on('console',msg=>{if(msg.type()==='error')console.error('BROWSER CONSOLE',width,msg.text());});
    await page.goto(url,{waitUntil:'domcontentloaded'});
    await page.locator('[data-menu-id="body"] .card-detail').first().waitFor();
    // One direct pickup flow; no window vs. ahead radio selection.
    assert.equal(await page.locator('.pickup-option-switch,.checkout-pickup-cards').count(),0,'No redundant pickup choices');
    assert.equal(await page.locator('.order-routing-note a[href*="doordash.com"]').count(),1,'DoorDash remains an independent delivery option');
    assert.equal(await page.locator('#pickup-preview-form input[type="hidden"][name="method"][value="ahead"]').count(),1,'Only direct pickup');


    // Verify the actual issue in the supplied iPad photo: menu cards must
    // appear in the first screen, not buried below multiple explanation banners.
    for(const selector of ['.digital-menu-intro','.menu-head .head-aside','.menu-order-hint']){
      assert.equal(await page.locator(selector).first().isVisible(),false,'Redundant text visible: '+selector+' at '+width);
    }
    const bannerHeight=await page.locator('.km-banner').evaluate(el=>el.getBoundingClientRect().height);
    assert(bannerHeight <= 222, 'Menu photograph banner too tall at '+width+': '+bannerHeight);
    const firstCard=await page.locator('#menu-grid .menu-card:visible').first().boundingBox();
    assert(firstCard && firstCard.y<830, 'First menu card still below the fold at '+width+': '+JSON.stringify(firstCard));
    await page.screenshot({path:path.join(screenshots,'knockout-menu-first-'+width+'.png'),fullPage:false});

    await page.locator('[data-menu-id="body"] .card-detail').first().click();
    await page.locator('#product-dialog .km-customizer').waitFor();
    assert.equal(await page.locator('#product-dialog input[name="km-topping"]').count(),3);
    assert.equal(await page.locator('#product-dialog input[name="km-side"]').count(),4);
    const dialog=await page.locator('#product-dialog').boundingBox();
    assert(dialog && dialog.width<=width+1,'Product dialog exceeds viewport '+width);
    await page.screenshot({path:path.join(screenshots,'knockout-product-'+width+'.png'),fullPage:false});

    if(width===768){
      await page.locator('#product-dialog input[value="no-pickles"]').check();
      await page.locator('#product-dialog input[name="km-side"][value="chips"]').check();
      await page.locator('#product-dialog .modal-add').click();
      const debug=await page.evaluate(()=>({count:document.querySelector('#window-sticky-count')?.textContent,bag:document.querySelector('#window-cart-items')?.innerHTML,modalOpen:document.querySelector('#product-dialog')?.open,button:document.querySelector('#product-dialog .modal-add')?.outerHTML}));
      console.log('KNOCKOUT POST-ADD',JSON.stringify(debug).slice(0,1200));
      assert.equal((await page.locator('#window-sticky-count').innerText()).trim(),'1','Cart should receive one customized item');
      await page.locator('#knockout-header-cart').click();
      const bag=await page.locator('#window-cart-items').innerText();
      assert.match(bag,/No pickles/,'Topping request missing from bag');
      assert.match(bag,/Side: Potato chips/,'Side request missing from bag');
      await page.locator('#window-review-button').click();
      await page.locator('#pickup-demo-name').fill('Demo Customer');
      await page.locator('#pickup-preview-form button[type="submit"]').click();
      const review=await page.locator('#window-review-slip').innerText();
      assert.match(review,/No pickles/,'Topping request missing from preview');
      assert.match(review,/Side: Potato chips/,'Side request missing from preview');
      assert.match(review,/NO ORDER PLACED/,'Must identify non-live order');
      await page.screenshot({path:path.join(screenshots,'knockout-review-768.png'),fullPage:false});
    }
    await page.close();
  }
  console.log('PASS: Knockout menu-first fold at 390/768/1024/1440, header bag, customization and pickup review');
} finally {await browser.close();}
