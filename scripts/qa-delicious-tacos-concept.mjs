import assert from "node:assert/strict";
import {readFileSync,mkdirSync,existsSync} from "node:fs";
import {join} from "node:path";
import {Script} from "node:vm";
const dir=join(process.cwd(),"public/demos/delicious-tacos");
const page=readFileSync(join(dir,"index.html"),"utf8");
const customer=readFileSync(join(dir,"customer-preview.html"),"utf8");
assert.match(page,/<meta name="robots" content="noindex,nofollow,noarchive">/);
assert.match(page,/OWNER CONCEPT · NOT LIVE ORDERING/);
assert.match(page,/SIMULATION ONLY · NO REAL ORDERS, EMAILS OR PAYMENTS/);
assert.match(page,/id="customer-stage"/);
assert.match(page,/id="owner-stage"/);
assert.match(page,/id="send-sample"/);
assert.match(page,/function paintTicket/);
assert.match(page,/phase==="preparing"\)phase="ready"/);
assert.match(page,/photoIntro:".*send us the food photos/);
assert.match(page,/scopeNote:"Pickup ordering is shown as a concept/);
assert.match(page,/https:\/\/www\.canva\.com\/d\//);
assert.match(page,/intake-1f2685aa1fd2491f9eea0/);
assert.ok(!/<form\b/i.test(page),"No customer info form in demo");
assert.ok(!/(fetch\s*\(|XMLHttpRequest|localStorage\.|sessionStorage\.)/.test(page),"Sample order must not send or persist customer data");
assert.ok(existsSync(join(dir,"customer-preview.html")));
assert.match(customer,/<meta name="robots" content="noindex,nofollow"/);
assert.match(customer,/class="truck-gallery"/);
assert.match(customer,/truckAILabel:"AI-generated photos"/);
for(const p of ["truck-service-window.webp","tacos-overhead.webp","taco-in-hand.webp","quesadilla-hand.webp","burrito-disposable-fork.webp"]){
 assert.ok(existsSync(join(dir,"media",p)),"Missing "+p);
 assert.ok(page.includes(p),"Expected owner photo reference: "+p);
}
const script=[...page.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map(m=>m[1]).join("\n");
new Script(script,{filename:"delicious-tacos-owner.js"});
console.log("PASS owner static: noindex, sample workflow, EN/ES, photos, proposal and source guest preview, no actual order endpoint");
if(!process.env.QA_URL)process.exit(0);
const {chromium}=await import("playwright");
const browser=await chromium.launch({headless:true});
try{
 for(const width of [375,390,820,1440]){
   const ctx=await browser.newContext({viewport:{width,height:width<600?812:900},reducedMotion:"reduce"});
   const p=await ctx.newPage();
   const errors=[];
   p.on("pageerror",x=>errors.push(String(x)));
   const posted=[];
   p.on("request",q=>{if(!["GET","HEAD"].includes(q.method()))posted.push(q.url())});
   const res=await p.goto(new URL("/demos/delicious-tacos/",process.env.QA_URL).href,{waitUntil:"domcontentloaded",timeout:30000});
   assert.equal(res.status(),200);
   assert.equal(await p.locator("#product-list .product").count(),4);
   assert.equal(await p.locator("#send-sample").isDisabled(),true);
   await p.locator("img").evaluateAll(images=>images.forEach(x=>x.loading="eager"));
   await p.waitForFunction(()=>[...document.querySelectorAll("img")].every(x=>x.complete&&x.naturalWidth>0),null,{timeout:20000});
   let sw=await p.evaluate(()=>document.documentElement.scrollWidth);
   if(sw>width+1){const bad=await p.evaluate(()=>[...document.querySelectorAll("body *")].filter(e=>e.getBoundingClientRect().right>innerWidth+1).slice(0,12).map(e=>({tag:e.tagName,cls:e.className,right:Math.round(e.getBoundingClientRect().right)})));throw Error("horizontal overflow "+width+" vs "+sw+" "+JSON.stringify(bad))}
   await p.locator('[data-add="0"]').click();
   assert.equal(await p.locator("#send-sample").isEnabled(),true);
   assert.equal((await p.locator("#cart-total").innerText()).trim(),"$3.50");
   await p.locator("#send-sample").click();
   assert.equal(await p.locator("#metric-new").innerText(),"1");
   assert.match(await p.locator("#tickets").innerText(),/Carne Asada/);
   await p.locator("#advance").click();
   assert.equal(await p.locator("#metric-working").innerText(),"1");
   await p.locator("#advance").click();
   assert.equal(await p.locator("#metric-ready").innerText(),"1");
   await p.locator("#advance").click();
   assert.match(await p.locator("#tickets").innerText(),/PICKED UP/);
   await p.locator("#advance").click();
   assert.match(await p.locator("#tickets").innerText(),/No sample orders yet/);
   await p.locator("#lang").click();
   assert.equal(await p.locator("html").getAttribute("lang"),"es");
   assert.match(await p.locator("#owner-stage .admin-head h3").innerText(),/Pedidos pickup/);
   assert.equal(await p.locator("#send-sample").innerText(),"Enviar pedido de EJEMPLO");
   assert.equal(posted.length,0,"Demo must never POST, DELETE or PUT");
   assert.deepEqual(errors,[],"No page errors");
   if([375,820,1440].includes(width)){
     await p.locator("#lang").click();
     await p.evaluate(()=>{document.documentElement.style.scrollBehavior="auto";window.scrollTo(0,0)});
     await p.waitForFunction(()=>scrollY===0);
     mkdirSync("qa-screenshots/delicious-tacos-owner",{recursive:true});
     await p.screenshot({path:"qa-screenshots/delicious-tacos-owner/"+width+".png",fullPage:true,animations:"disabled"});
   }
   const customerPage=await ctx.newPage();
   const guest=await customerPage.goto(new URL("/demos/delicious-tacos/customer-preview.html",process.env.QA_URL).href,{waitUntil:"domcontentloaded",timeout:30000});
   assert.equal(guest.status(),200);
   assert.equal(await customerPage.locator(".truck-gallery-grid img").count(),3);
   await ctx.close();
 }
}finally{await browser.close()}
console.log("PASS owner walkthrough at 375,390,820,1440: mock pickup order & Admin Panel statuses, ES/EN, no POST, photos, no overflow, guest preview");
