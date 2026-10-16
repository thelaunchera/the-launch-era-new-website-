/* QA v41: no real orders, emails, payments or appointments are submitted. */
import assert from "node:assert/strict";
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||"playwright");
const base=(process.env.QA_URL||"http://127.0.0.1:4173").replace(/\/$/,"");
const browser=await chromium.launch({headless:true});
try{
 for(const [lang,width] of [["en",360],["en",390],["es",820],["en",1440]]){
  const page=await browser.newPage({viewport:{width,height:920}});
  const errors=[],writes=[];
  page.on("pageerror",e=>errors.push(e.message));
  page.on("request",r=>{if(["POST","PUT","PATCH","DELETE"].includes(r.method()))writes.push(r.url());});
  await page.goto(base+"/lead-private-preview.html?lang="+lang,{waitUntil:"load"});
  await page.waitForSelector("#tle41HeroBooking",{timeout:12000});
  assert.equal(await page.locator("#tle41HeroBooking .tle41-calendar-grid button").count()>25,true);
  const first=page.locator("#tle41HeroBooking .tle41-day:not([disabled])").first();
  await first.click();
  assert.equal(await page.locator("#tle41HeroBooking .tle41-times button").count(),3);
  const confirm=page.locator("#tle41HeroBooking .tle41-confirm");
  assert.equal(await confirm.isDisabled(),true);
  await page.locator("#tle41HeroBooking .tle41-times button").first().click();
  assert.equal(await confirm.isEnabled(),true);
  await confirm.click();
  assert.match(await confirm.innerText(),lang==="es"?/demo/i:/demo/i);
  assert.equal(await page.locator("#tle41Frequency [role=radio]").count(),3);
  const choices=page.locator("#tle41Frequency [role=radio]");
  await choices.nth(1).click();
  assert.equal(await choices.nth(1).getAttribute("aria-checked"),"true");
  assert.match(await page.locator(".tle41-frequency-price").innerText(),/102/);
  assert.match(await page.locator(".tle41-frequency-badge").innerText(),/936/);
  await choices.nth(1).press("ArrowRight");
  assert.equal(await choices.nth(2).getAttribute("aria-checked"),"true");
  assert.match(await page.locator(".tle41-frequency-badge").innerText(),/312/);
  await page.locator("#categoryTabs [data-category=commercial]").click();
  assert.equal(await page.locator("#tle41Frequency").isVisible(),false,"no residential prices for business");
  await page.locator("#categoryTabs [data-category=residential]").click();
  await page.locator("#tle41Frequency").waitFor({state:"visible"});
  const ink=await page.locator("#categoryTabs button.sel b").evaluate(el=>getComputedStyle(el).color);
  assert.notEqual(ink,"rgb(255, 255, 255)","selected label must be legible on white");
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
  assert(overflow<8,"No horizontal overflow: "+overflow+"px");
  assert.deepEqual(errors,[],"No errors: "+errors.join(","));
  assert.deepEqual(writes,[],"No writes in isolated sample");
  await page.goto(base+"/lead-private-preview.html?key=qa-isolated&lang="+lang,{waitUntil:"load"});
  assert.equal(await page.locator("#tle41HeroBooking").count(),0,"no widget on customer preview");
  assert.equal(await page.locator("#tle41Frequency").count(),0,"no pricing on customer preview");
  await page.close();
 }
 console.log("PASS: mobile/tablet/desktop hero calendar, pricing switch, contrast, locale and customer isolation");
}finally{await browser.close()}
