const assert=require("node:assert/strict");
const {chromium}=require("playwright");
(async()=>{
 const browser=await chromium.launch({headless:true});
 for(const width of [360,390,820,1440]){
  for(const [route,lang] of [["/guias/","en"],["/es/guias/","es"]]){
   const context=await browser.newContext({viewport:{width,height:850},permissions:["clipboard-read","clipboard-write"],reducedMotion:"reduce"});
   const page=await context.newPage();const errors=[];
   page.on("pageerror",e=>errors.push(e.message));
   await page.goto("http://127.0.0.1:8172"+route,{waitUntil:"networkidle"});
   assert.equal(await page.locator(".tle-resource-card").count(),8,lang+" resource count");
   assert.equal(await page.locator(".tle-prompt-card").count(),3,lang+" photo prompts");
   assert.equal(await page.locator(".guide").count(),10,lang+" existing guides untouched");
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),"no overflow "+width+" "+lang);
   await page.locator("#tle-resource-search").fill("SALT");
   assert.equal(await page.locator(".tle-resource-card:visible").count(),1,"search result");
   await page.locator("#tle-resource-search").fill("");
   await page.locator('[data-tle-filter="soon"]').click();
   assert.equal(await page.locator(".tle-resource-card:visible").count(),5,"future resources");
   await page.locator('[data-tle-filter="all"]').click();
   assert.equal(await page.locator(".tle-resource-card:visible").count(),8,"all restored");
   await page.locator(".tle-prompt-card button").first().click();
   const prompt=await page.locator("#tle-photo-prompt-0").textContent();
   assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),prompt,"prompt copied");
   const sent=[];
   await page.route("**/functions/v1/tle-guides-subscribe",async route=>{
    sent.push(route.request().postDataJSON());
    await route.fulfill({status:200,contentType:"application/json",body:JSON.stringify({ok:true,pending:true})});
   });
   await page.locator("#tle-resource-email").fill("example@example.com");
   await page.locator("#tle-resource-consent").check();
   await page.locator("#tle-resource-submit").click();
   assert.equal(sent.length,1,"one submission");
   assert.equal(sent[0].language,lang,"correct language");
   assert.equal(sent[0].consent,true,"only with consent");
   assert.equal(sent[0].action,"subscribe","subscription action");
   await page.waitForFunction(()=>document.querySelector("#tle-resource-feedback")?.textContent?.length>15,{timeout:10000});
   assert.ok((await page.locator("#tle-resource-feedback").textContent()).length>15,"truthful pending message");
   assert.deepEqual(errors,[],"browser errors "+errors.join("; "));
   await context.close();
  }
  console.log("[TLE FREEBIES] "+width+"px bilingual catalog, copy, mocked subscription and layout: OK");
 }
 const context=await browser.newContext({viewport:{width:390,height:844}});
 const page=await context.newPage();
 const fake="a".repeat(64);
 const sent=[];
 await page.route("**/functions/v1/tle-guides-subscribe",async route=>{
  sent.push(route.request().postDataJSON());
  await route.fulfill({status:200,contentType:"application/json",body:JSON.stringify({ok:true,confirmed:true})});
 });
 await page.goto("http://127.0.0.1:8172/es/guias/?confirm_freebie="+fake+"#suscripcion");
 assert.equal(await page.locator("#tle-resource-form").isHidden(),true,"form hidden for confirm");
 await page.locator("#tle-resource-token-btn").click();
 assert.equal(sent[0].action,"confirm");
 assert.equal(sent[0].token,fake);
 assert.equal(await page.locator("#tle-resource-token-panel").isHidden(),true,"confirmation completed");
 await context.close();await browser.close();
 console.log("[TLE FREEBIES] Token confirmation UI tested with mocked backend: OK");
})().catch(e=>{console.error(e);process.exit(1);});