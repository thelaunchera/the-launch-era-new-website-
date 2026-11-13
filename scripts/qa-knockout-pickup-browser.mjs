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
    const choices=page.locator('.pickup-option-switch .pickup-mode');
    assert.equal(await choices.count(),2,'Must show two pickup methods');
    const first=await choices.nth(0).boundingBox();
    const second=await choices.nth(1).boundingBox();
    assert(first && second,'Pickup cards have no layout');
    const overlap=first.x < second.x+second.width-1 && first.x+first.width > second.x+1 &&
      first.y < second.y+second.height-1 && first.y+first.height > second.y+1;
    assert(!overlap,'Pickup method cards overlap at '+width+'px');

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
      await page.locator('#window-sticky-button').click();
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
  console.log('PASS: Knockout pickup layout at 390/768/1024/1440 and options through bag/review');
} finally {await browser.close();}
