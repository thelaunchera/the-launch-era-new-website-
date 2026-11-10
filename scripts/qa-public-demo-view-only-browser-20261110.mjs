// Browser smoke: public photos are view-only while existing galleries keep working.
import assert from 'node:assert/strict';
import { chromium, webkit } from 'playwright';

const base=(process.env.QA_URL||'http://127.0.0.1:4199').replace(/\/$/,'');
for (const engine of [chromium,webkit]) {
  const browser=await engine.launch({headless:true});
  try {
    for (const slug of ['sova','la-vie-in-pink','lavender-edit','photo-gallery']) {
      const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
      const errors=[];
      page.on('pageerror',e=>errors.push(e.message));
      const response=await page.goto(base+'/demos/'+slug+'/',{waitUntil:'domcontentloaded',timeout:25000});
      assert.equal(response?.status(),200,slug+' must load');
      await page.locator('img').first().waitFor({state:'attached',timeout:12000});
      const guard=await page.locator('img').first().evaluate(img=>{
        const drag=new Event('dragstart',{bubbles:true,cancelable:true});
        const menu=new MouseEvent('contextmenu',{bubbles:true,cancelable:true});
        img.dispatchEvent(drag);
        img.dispatchEvent(menu);
        const style=getComputedStyle(img);
        return {drag:drag.defaultPrevented,menu:menu.defaultPrevented,select:style.userSelect || style.webkitUserSelect || style.getPropertyValue('-webkit-user-select')};
      });
      assert.ok(guard.drag&&guard.menu,slug+' must discourage native image saving');
      assert.equal(guard.select,'none',slug+' image selection is disabled');
      assert.equal(await page.locator('a[download]').count(),0,slug+' has no download links');
      if(slug==='sova'){
        await page.locator('[data-photo="5"]').click();
        const modal=page.locator('#photo-dialog');
        await modal.waitFor({state:'visible',timeout:9000});
        assert.match(await modal.innerText(),/Photo 06 \/ 10/i,'photo count retained');
        assert.doesNotMatch(await modal.innerText(),/download|descargar/i,'no download invitation');
        assert.equal(await modal.locator('a[download], a[href$=".png"]').count(),0,'no original PNG link in modal');
        await modal.locator('[data-next]').click();
        assert.match(await modal.innerText(),/Photo 07 \/ 10/i,'Next still works');
        await modal.locator('[data-previous]').click();
        assert.match(await modal.innerText(),/Photo 06 \/ 10/i,'Previous still works');
        await modal.locator('[data-close]').click();
        await modal.waitFor({state:'hidden',timeout:5000});
      }
      assert.deepEqual(errors,[],slug+' no browser errors');
      console.log('PUBLIC PHOTO VIEW-ONLY BROWSER PASS',engine.name(),slug);
      await page.close();
    }
  } finally {await browser.close();}
}
