// Reuse native sample carts as iPhone bottom sheets, without replacing price or checkout logic.
import assert from 'node:assert/strict';
import { chromium, webkit } from 'playwright';
const root=(process.env.QA_URL||'http://127.0.0.1:4197').replace(/\/$/,'');
const cases=[
 {slug:'freska',trigger:'[data-bag-open]',panel:'#bag-panel',close:'.close-panel'},
 {slug:'sneekiefs',trigger:'#bagOpen',panel:'#bagDialog',close:'#bagClose'},
 {slug:'la-vie-in-pink',trigger:'[data-open-cart]',panel:'.cart-drawer',close:'.close-cart'},
 {slug:'lavender-edit',trigger:'.lb-cart-trigger',panel:'#lb-cart-drawer',close:'[data-lb-close]'}
];
for(const browserType of [chromium,webkit]){
 const browser=await browserType.launch({headless:true});
 try{
  for(const spec of cases){
   for(const motion of ['no-preference','reduce']){
    const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:motion});
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    const response=await page.goto(root+'/demos/'+spec.slug+'/',{waitUntil:'domcontentloaded'});
    assert.equal(response?.status(),200,'Original demo loads');
    await page.locator(spec.trigger).first().click();
    const panel=page.locator(spec.panel);
    await panel.waitFor({state:'visible',timeout:9000});
    // WebKit can delay the first animation frame after a drawer becomes
    // visible. Verify the real final on-screen geometry rather than assuming
    // a fixed 650ms clock; still fail if the panel never docks correctly.
    await page.waitForFunction(selector=>{
      const element=document.querySelector(selector);
      if(!element)return false;
      const rect=element.getBoundingClientRect();
      return rect.height>50&&Math.abs(rect.bottom-innerHeight)<=5;
    },spec.panel,{timeout:6000});
    const geometry=await panel.evaluate(el=>{
      const r=el.getBoundingClientRect(),c=getComputedStyle(el);
      return {bottom:r.bottom,top:r.top,width:r.width,position:c.position,animation:c.animationName,visible:c.display!=='none'};
    });
    assert.ok(Math.abs(geometry.bottom-844)<=5,spec.slug+' should attach to bottom, got '+JSON.stringify(geometry));
    assert.ok(geometry.top>3,spec.slug+' must not cover entire phone viewport');
    assert.ok(geometry.width>=375,spec.slug+' bottom sheet must use phone width');
    const fixedLayer=spec.slug==='la-vie-in-pink' &&
      await page.locator('.cart-layer').evaluate(el=>getComputedStyle(el).position==='fixed');
    assert.ok(geometry.position==='fixed'||fixedLayer,
      spec.slug+' sheet should float above original page');
    if(motion==='reduce')assert.equal(geometry.animation,'none',spec.slug+' must respect reduced motion');
    else assert.ok(geometry.animation.includes('tle-mobile-sheet-rise'),spec.slug+' sheet should rise visibly');
    assert.ok(await page.locator(spec.close).count(),spec.slug+' must preserve original Close button');
    await page.locator(spec.close).click();
    await panel.waitFor({state:'hidden',timeout:5000});
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
    const offenders=overflow>4 ? await page.evaluate(()=>
      [...document.querySelectorAll('*')]
        .map(el=>({el,r:el.getBoundingClientRect()}))
        .filter(({r})=>r.width>0&&(r.right>innerWidth+5||r.left< -5))
        .slice(0,7).map(({el,r})=>({tag:el.tagName,cls:String(el.className).slice(0,60),right:Math.round(r.right),left:Math.round(r.left)}))
    ) : [];
    assert.ok(overflow<=4,spec.slug+' no horizontal overflow '+overflow+' '+JSON.stringify(offenders));
    assert.deepEqual(errors,[],spec.slug+' no JS errors');
    console.log('MOBILE BOTTOM SHEET PASS',browserType.name(),spec.slug,motion);
    await page.close();
   }
  }
 }finally{await browser.close()}
}
