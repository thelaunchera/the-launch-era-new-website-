import assert from "node:assert/strict";
import {readFileSync,mkdirSync,existsSync} from "node:fs";
import {join} from "node:path";
import {Script} from "node:vm";

const dir=join(process.cwd(),"public/demos/delicious-tacos");
const page=readFileSync(join(dir,"index.html"),"utf8");
const customer=readFileSync(join(dir,"customer-preview.html"),"utf8");
for(const re of [
 /<meta name="robots" content="noindex,nofollow,noarchive">/,
 /OWNER CONCEPT · NOT LIVE ORDERING/,
 /SIMULATION ONLY · NO REAL ORDERS, EMAILS OR PAYMENTS/,
 /id="customer-stage"/,/id="owner-stage"/,/id="cart-open"/,/id="cart-overlay"/,
 /id="drawer-items"/,/id="to-pickup"/,/id="to-review"/,/id="place-sample"/,
 /id="receipt-number"/,/id="view-admin"/,/function paintTicket/,
 /phase==="preparing"\)phase="ready"/,/heroTitle:"SEE PICKUP<em>IN ACTION/,
 /href="\.\/customer-preview\.html"/,/id="pickup-demo"/
])assert.match(page,re);
assert.equal([...page.matchAll(/data-drawer-screen="(cart|pickup|review|confirmed)"/g)].length,4);
assert.match(page,/drawerTitle:"Tu carrito\."/);
assert.match(page,/drawerTitle:"Your cart\."/);
assert.doesNotMatch(page,/<section class="(?:packages|next|photo-section|admin-features)"/);
assert.doesNotMatch(page,/canva\.com|published-intake\.html|packageOne:|scopeNote:|photoIntro:/i);
assert.ok(!/<form\b/i.test(page),"No personal-data collection form");
assert.ok(!/(fetch\s*\(|XMLHttpRequest|localStorage\.|sessionStorage\.)/.test(page),"No customer-data writes/persistence");
assert.ok(existsSync(join(dir,"customer-preview.html")));
assert.match(customer,/<meta name="robots" content="noindex,nofollow"/);
assert.match(customer,/class="truck-gallery"/);
assert.match(customer,/truckAILabel:"AI-generated photos"/);
for(const p of ["truck-service-window.webp","tacos-overhead.webp","taco-in-hand.webp","quesadilla-hand.webp"]){
 assert.ok(existsSync(join(dir,"media",p)),"Missing "+p);
 assert.ok(page.includes(p),"Owner demo must reference "+p);
}
const inline=[...page.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map(m=>m[1]).join("\n");
new Script(inline,{filename:"delicious-tacos-cart-pickup.js"});
console.log("PASS static: full simulated cart → pickup → review → confirmation → Admin Panel; bilingual; no backend/Canva sales content");

if(!process.env.QA_URL)process.exit(0);
const {chromium}=await import("playwright");
const browser=await chromium.launch({headless:true});
try{
 for(const width of [375,390,820,1440]){
  const ctx=await browser.newContext({viewport:{width,height:width<600?812:900},reducedMotion:"reduce"});
  const p=await ctx.newPage(),errors=[],writes=[];
  p.on("pageerror",e=>errors.push(String(e)));
  p.on("request",r=>{if(!["GET","HEAD"].includes(r.method()))writes.push(r.method()+": "+r.url())});
  const res=await p.goto(new URL("/demos/delicious-tacos/",process.env.QA_URL).href,{waitUntil:"domcontentloaded",timeout:30000});
  assert.equal(res.status(),200);
  assert.equal(await p.locator("#product-list .product").count(),4);
  assert.equal(await p.locator("#send-sample").isDisabled(),true);
  assert.equal((await p.locator("#cart-bubble").textContent()).trim(),"0");
  await p.locator("img").evaluateAll(xs=>xs.forEach(x=>x.loading="eager"));
  await p.waitForFunction(()=>[...document.querySelectorAll("img")].every(x=>x.complete&&x.naturalWidth>0),null,{timeout:20000});
  const pageWidth=await p.evaluate(()=>document.documentElement.scrollWidth);
  if(pageWidth>width+1) {
   const offenders=await p.evaluate(()=>[...document.querySelectorAll("body *")].filter(x=>x.getBoundingClientRect().right>innerWidth+1).slice(0,12).map(x=>({tag:x.tagName,cls:String(x.className).slice(0,50),right:Math.round(x.getBoundingClientRect().right)})));
   throw Error("Horizontal overflow at "+width+": "+pageWidth+" "+JSON.stringify(offenders));
  }
  await p.locator('[data-add="0"]').click();
  assert.equal(await p.locator("#cart-overlay").isVisible(),true);
  assert.equal(await p.locator("#drawer-items .drawer-item").count(),1);
  assert.equal(await p.locator("#cart-bubble").innerText(),"1");
  await p.locator('[data-inc="0"]').click();assert.equal(await p.locator("#cart-bubble").innerText(),"2");
  await p.locator('[data-dec="0"]').click();assert.equal(await p.locator("#cart-bubble").innerText(),"1");
  assert.equal((await p.locator("#drawer-subtotal").textContent()).trim(),"$3.50");
  await p.locator("#to-pickup").click();
  assert.equal(await p.locator('[data-drawer-screen="pickup"]').isVisible(),true);
  await p.locator('input[name="pickup-window"][value="later"]').check();
  await p.locator("#to-review").click();
  assert.equal(await p.locator('[data-drawer-screen="review"]').isVisible(),true);
  assert.match(await p.locator("#review-window").innerText(),/Later pickup/);
  assert.equal((await p.locator("#review-total").textContent()).trim(),"$3.50");
  await p.locator("#back-to-pickup").click();
  await p.locator('input[name="pickup-window"][value="soon"]').check();
  await p.locator("#to-review").click();
  await p.locator("#place-sample").click();
  assert.equal(await p.locator('[data-drawer-screen="confirmed"]').isVisible(),true);
  assert.match(await p.locator("#receipt-number").innerText(),/#DEMO-/);
  assert.equal(await p.locator("#receipt-status").innerText(),"NEW");
  assert.equal(await p.locator("#metric-new").innerText(),"1");
  assert.match(await p.locator("#tickets").innerText(),/Carne Asada/);
  await p.locator("#view-admin").click();
  assert.equal(await p.locator("#cart-overlay").isVisible(),false);
  await p.locator("#advance").click();
  assert.equal(await p.locator("#metric-working").innerText(),"1");
  await p.locator("#advance").click();
  assert.equal(await p.locator("#metric-ready").innerText(),"1");
  await p.locator("#cart-open").click();
  assert.equal(await p.locator("#cart-overlay").isVisible(),true);
  await p.locator("#cart-close").click();
  assert.equal(await p.locator("#cart-overlay").isVisible(),false);
  await p.locator("#advance").click();assert.match(await p.locator("#tickets").innerText(),/PICKED UP/);
  await p.locator("#advance").click();assert.match(await p.locator("#tickets").innerText(),/No sample orders yet/);
  await p.locator("#lang").click();
  assert.equal(await p.locator("html").getAttribute("lang"),"es");
  await p.locator('[data-add="1"]').click();
  assert.equal((await p.locator("#cart-drawer-title").textContent()).trim(),"Tu carrito.");
  assert.equal((await p.locator("#to-pickup").textContent()).trim(),"Continuar a pickup");
  await p.keyboard.press("Escape");
  assert.equal(await p.locator("#cart-overlay").isVisible(),false);
  assert.deepEqual(writes,[],"No POST/PUT/DELETE/real order should be sent");
  assert.deepEqual(errors,[],"No JavaScript errors");
  if([375,820,1440].includes(width)){
   await p.locator("#lang").click();
   await p.locator('#cart-open').click();
   await p.locator("#cart-close").click();
   await p.evaluate(()=>{document.documentElement.style.scrollBehavior="auto";window.scrollTo(0,0)});
   await p.waitForFunction(()=>scrollY===0);
   mkdirSync("qa-screenshots/delicious-tacos-owner",{recursive:true});
   await p.screenshot({path:"qa-screenshots/delicious-tacos-owner/"+width+".png",fullPage:true,animations:"disabled"});
  }
  const guest=await ctx.newPage();
  const gr=await guest.goto(new URL("/demos/delicious-tacos/customer-preview.html",process.env.QA_URL).href,{waitUntil:"domcontentloaded",timeout:30000});
  assert.equal(gr.status(),200);
  assert.equal(await guest.locator(".truck-gallery-grid img").count(),3);
  await ctx.close();
 }
}finally{await browser.close()}
console.log("PASS Chromium cart, quantity controls, pickup window, review, example receipt, ticket statuses, EN/ES and overflow at 375/390/820/1440");
