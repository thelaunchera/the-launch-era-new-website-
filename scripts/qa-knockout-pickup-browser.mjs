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
    await page.locator('[data-menu-id="body"] .card-add').first().waitFor();
    // One direct pickup flow; no window vs. ahead radio selection.
    assert.equal(await page.locator('.pickup-option-switch,.checkout-pickup-cards').count(),0,'No redundant pickup choices');
    assert.equal(await page.locator('.order-routing-note a[href*="doordash.com"]').count(),1,'DoorDash remains an independent delivery option');
    assert.equal(await page.locator('#km-pickup-action').count(),1,'Pickup CTA missing');
    assert.equal(await page.locator('.km-order-choice-delivery').count(),1,'Separate DoorDash CTA missing');
    assert.equal(await page.locator('.km-choice-doordash-symbol svg').count(),1,'DoorDash brand mark should replace external arrow');
    assert.equal(await page.locator('.km-choice-pickup-symbol svg').count(),1,'Pickup action should have its own icon');
    assert.equal((await page.locator('.km-order-choice-delivery').innerText()).trim(),'ORDER ON DOORDASH');
    const nestedSearchBorders=await page.locator('.menu-search-field input').evaluate(input=>({
      outer:getComputedStyle(input.parentElement).borderTopWidth,
      inner:getComputedStyle(input).borderTopWidth
    }));
    console.log('KNOCKOUT SEARCH BORDER QA',width,JSON.stringify(nestedSearchBorders));
    assert(nestedSearchBorders.outer!=='0px'&&nestedSearchBorders.inner==='0px','Search must render a single exterior border: '+JSON.stringify(nestedSearchBorders));

    assert.equal(await page.locator('#km-pickup-action').innerText(),'PICKUP AT THE TRUCK');
    assert((await page.locator('.km-order-choice-delivery').getAttribute('href')||'').includes('doordash.com'));
    await page.locator('#km-pickup-action').click();
    const afterPickup=await page.locator('#menu-grid').boundingBox();
    assert(afterPickup&&afterPickup.y<900,'Pickup action must reveal menu');
    assert.equal(await page.locator('#pickup-preview-form input[type="hidden"][name="method"][value="ahead"]').count(),1,'Only direct pickup');


    // Verify the actual issue in the supplied iPad photo: menu cards must
    // appear in the first screen, not buried below multiple explanation banners.
    for(const selector of ['.digital-menu-intro','.menu-head .head-aside','.menu-order-hint']){
      assert.equal(await page.locator(selector).first().isVisible(),false,'Redundant text visible: '+selector+' at '+width);
    }
    const bannerHeight=await page.locator('.km-banner').evaluate(el=>el.getBoundingClientRect().height);
    assert(bannerHeight <= (width<=600?420:222), 'Menu photograph banner too tall at '+width+': '+bannerHeight);
    if(width<=600){
      const imageQA=await page.locator('.km-banner-photo').evaluate(img=>{
        const rect=img.getBoundingClientRect(), parent=img.parentElement.getBoundingClientRect();
        return {complete:img.complete,naturalWidth:img.naturalWidth,naturalHeight:img.naturalHeight,
          width:rect.width,height:rect.height,parentWidth:parent.width,
          objectFit:getComputedStyle(img).objectFit,
          headingAfter:!!(img.compareDocumentPosition(document.querySelector('.km-banner-inner')) & Node.DOCUMENT_POSITION_FOLLOWING)};
      });
      assert(imageQA.complete && imageQA.naturalWidth===1536 && imageQA.naturalHeight===1024,
        'Mobile Drive hero image failed to load: '+JSON.stringify(imageQA));
      assert(imageQA.objectFit==='contain' && Math.abs(imageQA.width/imageQA.height-1.5)<.015,
        'Mobile hero must show entire 3:2 picture without cropping: '+JSON.stringify(imageQA));
      assert(imageQA.headingAfter && Math.abs(imageQA.width-imageQA.parentWidth)<2,
        'Image must use full width with separate headline below: '+JSON.stringify(imageQA));
    }else{
      const photoInfo=await page.locator('.km-banner').evaluate(async el=>{
        const src=getComputedStyle(el).backgroundImage.match(/url\\(["']?([^"')]+)["']?\\)/)?.[1]||'';
        const picture=new Image();
        const loaded=await new Promise(resolve=>{picture.onload=()=>resolve(true);picture.onerror=()=>resolve(false);picture.src=src;});
        return {src,loaded,width:picture.naturalWidth,height:picture.naturalHeight};
      });
      assert(photoInfo.src.includes('knockout-menu-hero-drive-07.png') && photoInfo.loaded && photoInfo.width>1000,
        'Tablet/desktop Drive hero background failed: '+JSON.stringify(photoInfo));
    }
    const ctas=await page.locator('.km-order-choices .km-order-choice').evaluateAll(els=>els.map(el=>el.getBoundingClientRect().toJSON()));
    assert(ctas.length===2 && Math.abs(ctas[0].top-ctas[1].top)<4 && ctas[0].width>=120 && ctas[1].width>=120,'Pickup/DoorDash CTA must remain side by side '+width);

    const firstCard=await page.locator('#menu-grid .menu-card:visible').first().boundingBox();
    assert(firstCard && firstCard.y<(width<=600?1080:830), 'First menu card pushed too far below fold at '+width+': '+JSON.stringify(firstCard));
    await page.screenshot({path:path.join(screenshots,'knockout-menu-first-'+width+'.png'),fullPage:false});

    assert.equal(await page.locator('#menu-grid .card-detail').count(),0,'No View Details button on products');
    assert.equal((await page.locator('#window-sticky-count').innerText()).trim(),'0','Start with empty cart');
    await page.locator('[data-menu-id="body"] .card-add').first().click();
    assert.equal((await page.locator('#window-sticky-count').innerText()).trim(),'0','Step 1 plus must not add an item');
    assert.equal(await page.locator('#product-dialog').evaluate(el=>el.open),true,'Step 1 plus must open Step 2 customization');
    const paymentNote=await page.locator('.direct-pay-truck').textContent();
    assert(paymentNote.includes('SQUARE PAYMENT BEFORE ORDER')&&paymentNote.includes('Demo only'),'Square note must not imply completed payment');
    await page.locator('#product-dialog .km-customizer').waitFor();
    assert((await page.locator('#product-dialog .km-order-progress').innerText()).includes('02 · TOPPINGS'),'Progress must indicate Step 2');
    assert((await page.locator('#product-dialog .modal-add').innerText()).includes('ADD & VIEW BAG'),'The only add button is the Step 2 confirmation');
    assert.equal(await page.locator('#product-dialog input[name="km-topping"]').count(),3);
    assert.equal(await page.locator('#product-dialog input[name="km-side"]').count(),4);
    const dialog=await page.locator('#product-dialog').boundingBox();
    assert(dialog && dialog.width<=width+1,'Product dialog exceeds viewport '+width);
    await page.screenshot({path:path.join(screenshots,'knockout-product-'+width+'.png'),fullPage:false});

    if(width===390){
      await page.locator('#dialog-close').click();
      assert.equal((await page.locator('#window-sticky-count').innerText()).trim(),'0','Canceling toppings must leave the cart untouched');
      await page.locator('[data-menu-id="body"] .card-add').first().click();
      assert.equal((await page.locator('#window-sticky-count').innerText()).trim(),'0','Re-opening Step 2 must not add item');
    }
    if(width===768){
      await page.locator('#product-dialog input[value="no-pickles"]').check();
      await page.locator('#product-dialog input[name="km-side"][value="chips"]').check();
      await page.locator('#product-dialog .modal-add').click();
      const debug=await page.evaluate(()=>({count:document.querySelector('#window-sticky-count')?.textContent,bag:document.querySelector('#window-cart-items')?.innerHTML,modalOpen:document.querySelector('#product-dialog')?.open,button:document.querySelector('#product-dialog .modal-add')?.outerHTML}));
      console.log('KNOCKOUT POST-ADD',JSON.stringify(debug).slice(0,1200));
      assert.equal((await page.locator('#window-sticky-count').innerText()).trim(),'1','Cart should receive one customized item');
      await page.locator('#window-cart-dialog[open]').waitFor({timeout:5000});
      assert((await page.locator('#window-cart-dialog .window-cart-kicker').innerText()).includes('03 / YOUR BAG'),'After customization must show Step 3 cart');
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
  console.log('PASS: Knockout 1 menu plus -> 2 toppings -> 3 cart at 390/768/1024/1440, customization and pickup review');
} finally {await browser.close();}
