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
      assert.ok(await page.locator('.hero-poster').evaluate(async img => {await img.decode();return img.naturalWidth > 0;}));
      assert.ok(await page.locator('.brand-wordmark-image').evaluate(async img=>{await img.decode();return img.naturalWidth===520&&img.naturalHeight===150;}),'transparent Dailin SVG loads at full resolution');
      assert.equal(await page.locator('.brand-wordmark-image').getAttribute('alt'),'Dailin.','wordmark accessible alt');
      assert.equal(await page.locator('.brand-signature').textContent(),'BY THE LAUNCH ERA','proper brand attribution');
      const brandBox = await page.locator('.brand-personal').boundingBox();
      const navBox = await page.locator('.nav').boundingBox();
      assert.ok(brandBox && navBox && brandBox.x+brandBox.width <= navBox.x+2,'logo must not overlap navigation '+width);
      assert.ok(brandBox.width >= 108 && brandBox.width <= 190,'readable mobile/desktop logo '+width);
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth <= window.innerWidth));
      await page.locator('.hero-actions .button').first().click();
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
      assert.equal(await page.locator('.sample').count(),0,'duplicated prompt example removed');
      assert.equal(await page.locator('#guide-detail .vault-prompt-help ol li').count(),0,'reader help cleared on close');
      assert.equal(await page.locator('#vault-inquiry-form').count(),1,'real inquiry form is present');
      // Stub the backend so this browser test cannot create a customer record or send email.
      const submitted=[];
      await page.route('**/functions/v1/tle-contact',async route=>{
        submitted.push(route.request().postDataJSON());
        await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,email_sent:true})});
      });
      await page.locator('#vault-inquiry-form input[name="name"]').fill('Test Example');
      await page.locator('#vault-inquiry-form input[name="email"]').fill('example@example.invalid');
      await page.locator('#vault-inquiry-form input[name="business"]').fill('Test Project');
      await page.locator('#vault-inquiry-form select[name="service"]').selectOption('Website');
      await page.locator('#vault-inquiry-form textarea[name="message"]').fill('Testing the new inquiry form without external delivery.');
      await page.locator('#vault-inquiry-form input[name="consent"]').check();
      await page.locator('#vault-inquiry-form button[type="submit"]').click();
      await page.locator('#vault-inquiry-form .vault-inquiry-success').waitFor({timeout:5000});
      assert.equal(submitted.length,1,'submit must send exactly one request');
      assert.equal(submitted[0].source,lang==='es'?'vault_inquiry_es':'vault_inquiry');
      assert.equal(submitted[0].language,lang);
      assert.equal(submitted[0].help_needed[0],'Website');
      assert.equal(submitted[0].email,'example@example.invalid');
      assert.equal(await page.locator('a[href^="mailto:"]').count(),0,'old mailto CTA is removed');

      await page.locator('.system-link').click();
      assert.equal(new URL(page.url()).hash,'#recursos');
      await page.locator('#como .text-link').click();
      assert.equal(new URL(page.url()).searchParams.get('guide'),'google-flow-avatar');
      assert.equal(await page.locator('.lang').count(),1,'one language switch in header');
      assert.equal(await page.locator('.guide-language').count(),0,'no second language switch in reader');
      const localeLink=page.locator('.lang a[hreflang="'+(lang==='en'?'es':'en')+'"]');
      assert.ok((await localeLink.getAttribute('href')).includes('guide=google-flow-avatar'),'the header keeps the open guide on language change');
      await localeLink.click();
      await page.locator('#dialog-backdrop').waitFor({state:'visible',timeout:8000});
      assert.equal(await page.locator('html').getAttribute('lang'),lang==='en'?'es':'en');
      await page.locator('#dialog-backdrop').waitFor({state:'visible',timeout:5000});
      assert.equal(await page.locator('#dialog-backdrop').isVisible(),true);
      assert.equal(new URL(page.url()).searchParams.get('guide'),'google-flow-avatar');
      assert.deepEqual(errors,[]);
    }
    await context.close();
    console.log(width+'px: EN/ES, portrait, search, filtering, modal, copy, focus, links and guide sharing passed');
  }
  await browser.close();
})().catch(error=>{console.error(error);process.exit(1);});
