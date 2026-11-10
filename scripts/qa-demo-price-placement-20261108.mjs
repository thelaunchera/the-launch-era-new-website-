// TLE price presentation QA — same source price cards, directly after hero or beside original menu.
import assert from 'node:assert/strict';
import {chromium,webkit,devices} from 'playwright';
const origin=(process.env.QA_URL||'http://127.0.0.1:4191').replace(/\/$/,'');
const brands=[
 {slug:'marea-wigs-miami',kind:'service'},
 {slug:'golden-grid',kind:'menu',target:'#collection'},
 {slug:'casa-brownie',kind:'menu',target:'#brownies'},
 {slug:'havana-19',kind:'menu',target:'#kitchen'},
 {slug:'ivory-and-bloom',kind:'menu',target:'#cake-gallery'},
 {slug:'la-vie-in-pink',kind:'menu',target:'#collection'},
 {slug:'lavender-edit',kind:'service'},
 {slug:'experience-cleaning',kind:'service'}
];
const path=slug=>slug==='experience-cleaning'?'/experience-cleaning/':'/demos/'+slug+'/';
for(const engine of [chromium,webkit]){
 const browser=await engine.launch({headless:true});
 try{
  for(const width of (engine===webkit?[390]:[360,390])){
   const context=await browser.newContext({...devices['iPhone 13'],viewport:{width,height:800},reducedMotion:'reduce'});
   for(const brand of brands){
    const page=await context.newPage(),errors=[];
    page.on('pageerror',e=>errors.push(String(e)));
    const response=await page.goto(origin+path(brand.slug),{waitUntil:'domcontentloaded'});
    assert.equal(response?.status(),200,brand.slug+' page should load');
    // La Vie in Pink has a native six-product café menu and interactive bag.
    // Test its actual prices rather than demanding a duplicate 3-item price block.
    if(brand.slug==='la-vie-in-pink'){
      await page.waitForFunction(()=>document.querySelectorAll('#menu-grid .menu-card .price-wrap strong').length===6,null,{timeout:12000});
      const prices=await page.locator('#menu-grid .menu-card .price-wrap strong').allTextContents();
      assert.equal(prices.length,6,'La Vie in Pink has six priced café products');
      assert.ok(prices.every(value=>/^\$\d+(?:\.\d{2})?$/.test(value.trim())),'Each product price is formatted as US dollars');
      assert.deepEqual(errors,[],'La Vie in Pink menu runtime errors');
      console.log('NATIVE CAFE PRICES PASS',engine.name(),brand.slug,width,prices.length);
      await page.close();
      continue;
    }
    const pricing=page.locator('section#tle-demo-sample-prices');
    await page.waitForFunction(()=>document.querySelector('#tle-demo-sample-prices')||document.querySelector('.tle-demo-customer-price'),null,{timeout:12000});
    if(await pricing.count()===0){
      const badges=await page.locator('.tle-demo-customer-price').count();
      assert.ok(badges>0,brand.slug+' existing catalog must show original price badges or a preview block');
      assert.deepEqual(errors,[],brand.slug+' price badge runtime errors');
      console.log('PRICE BADGES BY ORIGINAL PRODUCT PASS',engine.name(),brand.slug,width,badges);
      await page.close();
      continue;
    }
    assert.equal(await pricing.count(),1,brand.slug+' only one example-price section allowed');
    const result=await page.evaluate(({kind,target})=>{
      const p=document.querySelector('#tle-demo-sample-prices');
      const hero=document.querySelector('main section.hero,#app section.hero,#root section.hero,section.hero');
      const catalog=target?document.querySelector(target):null;
      const box=p.getBoundingClientRect();
      const cardCount=p.querySelectorAll('.tle-price-card').length;
      return {
        isAfterHero:Boolean(hero&&(hero.nextElementSibling===p||(hero.nextElementSibling?.id==='tle-brand-discovery'&&hero.nextElementSibling.nextElementSibling===p))),
        isByMenu:Boolean(catalog&&catalog.previousElementSibling===p),
        position:p.dataset.tlePricePlacement,
        cardCount,footerAfter:p.compareDocumentPosition(document.querySelector('footer')) & Node.DOCUMENT_POSITION_FOLLOWING,
        x:box.left,right:box.right,viewport:innerWidth
      };
    },brand);
    assert.equal(result.position,brand.kind==='service'?'below-hero':'beside-menu',brand.slug+' price placement flag');
    if(brand.kind==='service')assert.equal(result.isAfterHero,true,brand.slug+' service prices must be immediately beneath the hero');
    else assert.equal(result.isByMenu,true,brand.slug+' sample menu prices must sit beside the catalog');
    assert.equal(result.cardCount,3,brand.slug+' should show exactly three original price options');
    assert.ok(result.x>=-2&&result.right<=result.viewport+2,brand.slug+' cards must fit on '+width+'px iPhone');
    assert.ok(result.footerAfter,brand.slug+' legal footer must remain after prices');
    assert.deepEqual(errors,[],brand.slug+' JS runtime errors');
    if(brand.slug==='marea-wigs-miami'){
      const copy=await pricing.innerText();
      for(const value of ['$65.00','$93.50','$85.00'])assert.ok(copy.includes(value),'Marea preserved price '+value);
      const cols=await pricing.locator('.tle-price-grid').evaluate(el=>getComputedStyle(el).gridTemplateColumns);
      assert.equal(cols.trim().split(/\s+/).length,1,'Marea mobile services stack evenly without a stranded third card');
    }
    if(brand.slug==='experience-cleaning'){
      const correct=await page.evaluate(()=>{
        const p=document.querySelector('#tle-demo-sample-prices');
        return p?.nextElementSibling?.id==='experience';
      });
      assert.ok(correct,'Cleaning services must be directly below hero, followed by sample booking');
    }
    console.log('PRICES NEAR HERO PASS',engine.name(),brand.slug,width,JSON.stringify(result));
    await page.close();
   }
   await context.close();
  }
 }finally{await browser.close()}
}
