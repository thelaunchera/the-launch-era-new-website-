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



    // Mobile food-first composition: no separate back strip or redundant heading.
    const backBarVisible=await page.locator('.menu-route-bar').isVisible();
    assert.equal(backBarVisible,false,'Back-to-website strip must not consume a second row');
    const backNav=page.locator('.site-header .brand .km-brand-back');
    assert.equal(await backNav.count(),1,'Back-to-website label must be integrated with the logo');
    assert.equal((await backNav.innerText()).trim(),'BACK','Back label must be concise');
    assert((await page.locator('.site-header .brand').getAttribute('href')||'').includes('index.html'),'Logo/back must preserve real homepage destination');
    if(width<=600){
      const displayedHeading=await page.locator('.menu-section .menu-head').evaluate(el=>{
        const s=getComputedStyle(el);const r=el.getBoundingClientRect();
        return {width:r.width,height:r.height,clipped:s.clipPath};
      });
      assert(displayedHeading.width<=1.1 && displayedHeading.height<=1.1,
        'OUR MENU is still visibly duplicating the hero: '+JSON.stringify(displayedHeading));
      const eyebrow=page.locator('.km-banner .km-eyebrow');
      assert.equal((await eyebrow.innerText()).trim(),'SOUTH FLORIDA · FOOD TRUCK');
      assert.equal(await eyebrow.isVisible(),true,'The small editorial place label must be visible');
      const heroBox=await page.locator('.km-banner').boundingBox();
      const ctaBox=await page.locator('.km-order-choices').boundingBox();
      assert(heroBox&&ctaBox&&ctaBox.y-heroBox.y-heroBox.height>=0 && ctaBox.y-heroBox.y-heroBox.height<28,
        'Pickup and DoorDash must immediately follow the photo/title: '+JSON.stringify({heroBox,ctaBox}));
    }
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
        const src=getComputedStyle(el).backgroundImage.match(/url\(["']?([^"')]+)["']?\)/)?.[1]||'';
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


    // The old review slip had labels glued to values and a white-on-white
    // Edit Pickup button. Measure computed styles in the real browser.
    async function checkPickupReviewUi(){
      const info=await page.locator('#window-review-slip').evaluate(el=>{
        const facts=el.querySelector('.preview-facts');
        const fact=facts?.querySelector('p');
        const label=fact?.querySelector('span'),value=fact?.querySelector('strong');
        const edit=el.querySelector('#pickup-edit'),done=el.querySelector('#pickup-done');
        const dead=el.querySelector('.preview-submit-disabled');
        const cs=e=>e?getComputedStyle(e):null;
        const rect=e=>e?.getBoundingClientRect();
        const editStyle=cs(edit),doneStyle=cs(done);
        return {
          factsCount:facts?.children.length||0,
          labelDisplay:cs(label)?.display,
          valueDisplay:cs(value)?.display,
          factDirection:cs(fact)?.flexDirection,
          editText:edit?.textContent?.trim(),
          doneText:done?.textContent?.trim(),
          editColor:editStyle?.color,
          editBg:editStyle?.backgroundColor,
          doneColor:doneStyle?.color,
          doneBg:doneStyle?.backgroundColor,
          editWidth:rect(edit)?.width||0,
          doneWidth:rect(done)?.width||0,
          disabled:dead?.disabled,
          layout:cs(el)?.display
        };
      });
      assert(info.factsCount>=3,'Pickup facts missing '+width+': '+JSON.stringify(info));
      assert.equal(info.labelDisplay,'block','Pickup label must be separated from value '+width);
      assert.equal(info.valueDisplay,'block','Pickup value must wrap under label '+width);
      assert.equal(info.factDirection,'column','Pickup facts should stack their labels '+width);
      assert(info.editText.length>4&&info.doneText.length>4,'Bottom actions have lost their visible labels '+width);
      assert(info.editColor!==info.editBg&&info.doneColor!==info.doneBg,'Review action text must contrast with button surfaces '+width);
      assert(info.editWidth>140&&info.doneWidth>140,'Review buttons should have comfortable tap sizes '+width);
      assert(info.disabled,'Send to Truck must remain disabled in demo '+width);
      assert.equal(info.layout,'grid','Review layout enhancement not loaded '+width);
      return info;
    }

    if(width===390){
      await page.locator('#dialog-close').click();
      assert.equal((await page.locator('#window-sticky-count').innerText()).trim(),'0','Canceling toppings must leave the cart untouched');
      await page.locator('[data-menu-id="body"] .card-add').first().click();
      assert.equal((await page.locator('#window-sticky-count').innerText()).trim(),'0','Re-opening Step 2 must not add item');
      await page.locator('#product-dialog .modal-add').click();
      await page.locator('#window-cart-dialog[open]').waitFor({timeout:5000});
      await page.locator('#window-review-button').click();
      await page.locator('#pickup-demo-name').fill('Demo Guest');
      await page.locator('#pickup-preview-form button[type="submit"]').click();
      await checkPickupReviewUi();
      await page.screenshot({path:path.join(screenshots,'knockout-review-390.png'),fullPage:false});
      await page.locator('#pickup-edit').click();
      assert(await page.locator('#pickup-preview-form').isVisible(),'Edit Pickup must return to form on iPhone');
      await page.locator('#pickup-preview-form button[type="submit"]').click();
      await page.locator('#pickup-done').click();
      assert.equal(await page.locator('#window-cart-dialog').evaluate(el=>el.open),false,'Back to Menu must close the receipt');
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
      await checkPickupReviewUi();
      await page.screenshot({path:path.join(screenshots,'knockout-review-768.png'),fullPage:false});
    }
    await page.close();
  }
  console.log('PASS: Knockout 1 menu plus -> 2 toppings -> 3 cart at 390/768/1024/1440, customization and pickup review');
} finally {await browser.close();}
