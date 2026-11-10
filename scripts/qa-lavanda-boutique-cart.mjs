/** Lavanda Boutique demo cart QA — no payment provider or personal data. */
import assert from "node:assert/strict";
import { chromium } from "playwright";

const ORIGIN = (process.env.QA_URL || "http://127.0.0.1:4196").replace(/\/$/,"");
const browser=await chromium.launch({headless:true});
try {
 for (const width of [390,820,1440]) {
  const context=await browser.newContext({viewport:{width,height:width===390?844:900},reducedMotion:"reduce"});
  const page=await context.newPage();
  const errors=[];const commerceWrites=[];
  page.on("pageerror",err=>errors.push(String(err)));
  page.on("request",req=>{
   if(req.method()!=="GET"&&/stripe|checkout|payment|order/i.test(req.url()))commerceWrites.push(req.url());
  });
  const res=await page.goto(ORIGIN+"/demos/lavender-edit/",{waitUntil:"domcontentloaded",timeout:35000});
  assert.equal(res?.status(),200,"Lavanda page must load");
  await page.locator("#tle-demo-sample-prices .lb-add").first().waitFor({state:"visible",timeout:16000});
  assert.equal(await page.locator("#tle-demo-sample-prices .lb-add").count(),3,"Exactly three canonical sample prices, no duplicate catalog");
  assert.equal(await page.locator(".lb-cart-trigger").count(),1,"Only one bag trigger");
  assert.equal(await page.locator("#film video source").getAttribute("src"),"./media/hero-motion-20261108.mp4","Original lower-page film retained");
  assert.equal(await page.locator(".lb-price-section .tle-price-card").count(),3);
  const prices=await page.locator(".lb-price-section").innerText();
  for(const price of ["$85.00","$103.50","$45.00"])assert.ok(prices.includes(price),"Missing preserved sample price "+price);
  await page.locator(".lb-add").first().click();
  const drawer=page.locator("#lb-cart-drawer");
  assert.equal(await drawer.isHidden(),true,"Adding a product must not auto-open the bag");
  await page.waitForFunction(()=>document.querySelector("[data-lb-cart-count]")?.textContent?.trim()==="1",null,{timeout:5000});
  assert.equal(await page.locator("[data-lb-cart-count]").innerText(),"1");
  await page.locator(".lb-cart-trigger").click();
  assert.equal(await drawer.isVisible(),true,"Bag opens only when explicitly selected");
  assert.ok((await drawer.innerText()).includes("$85.00"),"One sample product subtotal");
  await drawer.locator('[data-lb-action="plus"]').click();
  assert.ok((await drawer.innerText()).includes("$170.00"),"Plus must recalculate total");
  assert.equal(await page.locator("[data-lb-cart-count]").innerText(),"2");
  await drawer.locator('[data-lb-action="minus"]').click();
  assert.ok((await drawer.innerText()).includes("$85.00"),"Minus must recalculate total");
  await drawer.locator('[data-lb-action="review"]').click();
  assert.ok((await drawer.innerText()).includes("Review your demo purchase"),"Review stage");
  assert.equal(await drawer.locator("input").count(),0,"No card, address or contact details collected");
  await drawer.locator('[data-lb-action="complete"]').click();
  assert.ok((await drawer.innerText()).includes("Your demo purchase is complete!"),"Fake confirmation must appear");
  assert.ok((await drawer.innerText()).includes("No payment was made"),"Must clearly deny real transaction");
  assert.equal(await page.locator("[data-lb-cart-count]").innerText(),"0","Bag clears after completed simulation");
  await drawer.locator('[data-lb-action="close"]').click();
  assert.equal(await drawer.isHidden(),true,"Close must dismiss checkout");
  await page.locator("#es").click();
  assert.equal(await page.locator("[data-lb-cart-word]").innerText(),"Bolsa","Spanish bag");
  assert.equal(await page.locator(".lb-add").first().innerText(),"AÑADIR A LA BOLSA","Spanish product CTA");
  await page.locator(".lb-add").first().click();
  await drawer.locator('[data-lb-action="review"]').click();
  await drawer.locator('[data-lb-action="complete"]').click();
  assert.ok((await drawer.innerText()).includes("¡Tu compra simulada está completa!"),"Spanish confirmation");
  assert.equal(commerceWrites.length,0,"No real order/payment request");
  const overflow=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,width:window.innerWidth}));
  assert.ok(overflow.scroll<=overflow.width+2,"Horizontal overflow "+JSON.stringify(overflow));
  assert.deepEqual(errors,[],"No runtime errors at "+width+"px");
  await context.close();
  console.log("PASS Lavanda demo cart EN/ES",width,"no payment, no data, hero/film preserved");
 }
}finally{await browser.close()}
