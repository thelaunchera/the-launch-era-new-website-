// Native gallery QA on desktop engines at iPhone width.
// We test both languages: full-size viewing, close and prev/next must remain,
// and absolutely no public image download action is rendered.
import assert from 'node:assert/strict';
import {chromium,webkit} from 'playwright';
const origin=(process.env.QA_URL||'http://127.0.0.1:4198').replace(/\/$/,'');
for(const browserType of [chromium,webkit]){
  const browser=await browserType.launch({headless:true});
  try{
    for(const lang of ['en','es']){
      const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
      const errors=[];
      page.on('pageerror',error=>errors.push(error.message));
      const response=await page.goto(origin+'/demos/sova/',{waitUntil:'domcontentloaded'});
      assert.equal(response?.status(),200,'SOVA loads');
      await page.locator('#campaign .gallery-item[data-photo="5"]').waitFor({state:'visible'});
      if(lang==='es'){
        await page.locator('[data-language="es"]').first().click();
        await page.locator('#campaign .gallery-item[data-photo="5"]').waitFor({state:'visible'});
      }
      await page.locator('#campaign .gallery-item[data-photo="5"]').click();
      const dialog=page.locator('#photo-dialog');
      await dialog.waitFor({state:'visible',timeout:10000});
      assert.equal(await dialog.locator('img').count(),1,'photo remains viewable');
      assert.equal(await dialog.locator('a[download],button[download]').count(),0,'no photo download button');
      assert.doesNotMatch(await dialog.innerText(),/download|descargar/i,'no photo download copy');
      const caption=dialog.locator('.photo-controls .eyebrow');
      assert.match(await caption.innerText(),/06\s*\/\s*10/,'opens 6th photo');
      await dialog.locator('[data-next]').click();
      assert.match(await caption.innerText(),/07\s*\/\s*10/,'Next still works');
      await dialog.locator('[data-previous]').click();
      assert.match(await caption.innerText(),/06\s*\/\s*10/,'Previous still works');
      await dialog.locator('[data-close]').click();
      assert.equal(await dialog.isVisible(),false,'Close still works');
      assert.deepEqual(errors,[],'no runtime errors');
      console.log('PASS',browserType.name(),lang,'SOVA photo preview, nav and no download action');
      await page.close();
    }
  }finally{await browser.close();}
}
