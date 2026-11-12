const assert = require('node:assert/strict');
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({headless:true});
  for (const width of [360,390,820,1440]) {
    const context = await browser.newContext({viewport:{width,height:850},hasTouch:width<=390,reducedMotion:'reduce',permissions:['clipboard-read','clipboard-write']});
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const base = 'http://127.0.0.1:8172';
    for(const [route, lang] of [['/guias/','en'],['/es/guias/','es']]) {
      await page.goto(base+route,{waitUntil:'domcontentloaded'});
      assert.equal(await page.locator('.guide').count(),10);
      assert.equal(await page.locator('html').getAttribute('lang'),lang);
      assert.ok(await page.locator('.hero-portrait').evaluate(async img => {await img.decode();return img.naturalWidth > 0;}));
      assert.ok(await page.locator('.brand-wordmark-image').evaluate(async img=>{await img.decode();return img.naturalWidth===520&&img.naturalHeight===150;}),'transparent Dailin SVG loads at full resolution');
      assert.equal(await page.locator('.brand-wordmark-image').getAttribute('alt'),'Dailin.','wordmark accessible alt');
      assert.equal(await page.locator('.brand-signature').textContent(),'BY THE LAUNCH ERA','proper brand attribution');
      const brandBox = await page.locator('.brand-personal').boundingBox();
      const navBox = await page.locator('.nav').boundingBox();
      assert.ok(brandBox && navBox && brandBox.x+brandBox.width <= navBox.x+2,'logo must not overlap navigation '+width);
      assert.ok(brandBox.width >= 108 && brandBox.width <= 190,'readable mobile/desktop logo '+width);
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth <= window.innerWidth));
      await page.locator('.hero .button').click();
      assert.equal(new URL(page.url()).hash,'#guias');
      await page.getByRole('button',{name:lang==='en'?'Automation':'Automatización',exact:true}).click();
      assert.equal(await page.locator('.guide').count(),3);
      await page.locator('#search').fill('Gmail');
      assert.equal(await page.locator('.guide').count(),1);
      await page.locator('.guide .open').click();
      assert.equal(new URL(page.url()).searchParams.get('guide'),'gmail-digest-make');
      assert.ok(await page.locator('#close').evaluate(el=>{const r=el.getBoundingClientRect(),top=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);return r.top>=0&&r.bottom<=innerHeight&&(top===el||el.contains(top));}),'guide close button stays visible above the fixed header');
      await page.locator('.dialog .copy').click();
      const prompt = await page.locator('.dialog pre').textContent();
      assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),prompt);
      await page.keyboard.press('Escape');
      assert.equal(await page.locator('#dialog-backdrop').isHidden(),true);
      assert.ok(await page.locator('.guide .open').evaluate(el=>el===document.activeElement));
      await page.locator('#sample-copy').click();
      assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),await page.locator('#sample-prompt').textContent());
      await page.locator('.system-link').click();
      assert.equal(new URL(page.url()).hash,'#como');
      await page.locator('#como .text-link').click();
      assert.equal(new URL(page.url()).searchParams.get('guide'),'google-flow-avatar');
      await page.locator('.guide-language').click();
      assert.equal(await page.locator('html').getAttribute('lang'),lang==='en'?'es':'en');
      assert.equal(await page.locator('#dialog-backdrop').isVisible(),true);
      assert.equal(new URL(page.url()).searchParams.get('guide'),'google-flow-avatar');
      assert.deepEqual(errors,[]);
    }
    await context.close();
    console.log(width+'px: EN/ES, portrait, search, filtering, modal, copy, focus, links and guide sharing passed');
  }
  await browser.close();
})().catch(error=>{console.error(error);process.exit(1);});
