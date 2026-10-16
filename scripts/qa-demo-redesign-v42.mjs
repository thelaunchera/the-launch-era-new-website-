/** v42 browser regressions: user-facing flow only. No real requests or sends. */
import assert from "node:assert/strict";
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||"playwright");
const base=(process.env.QA_URL||"http://127.0.0.1:4173").replace(/\/$/,"");
const browser=await chromium.launch({headless:true});
try{
 for(const [lang,width] of [["en",360],["en",390],["es",820],["en",1440]]){
  const page=await browser.newPage({viewport:{width,height:900},reducedMotion:"reduce"});
  const errors=[],writes=[];
  page.on("pageerror",e=>errors.push(e.message));
  page.on("request",r=>{if(["POST","PUT","PATCH","DELETE"].includes(r.method()))writes.push(r.url());});
  await page.goto(base+"/lead-private-preview.html?lang="+lang,{waitUntil:"load"});
  await page.waitForSelector(".tle-demo-v42",{timeout:16000});
  assert.equal(await page.locator("#tle41HeroBooking").count(),0,"old hero booking must disappear");
  assert.equal(await page.locator("#tle41Frequency").count(),0,"old savings card must disappear");
  assert.equal(await page.locator("#categoryTabs").count(),0,"old residential/commercial switch must disappear");
  assert.equal(await page.locator("#leadHero .tle-v42-window").count(),1,"portal window missing");
  assert.equal(await page.locator("#residentialServiceList button.service:visible").count()>0,true);
  assert.equal(await page.locator("#commercialServiceList button.service:visible").count()>0,true);
  assert.equal(await page.locator("#main .tle-v42-section-head").count(),2);
  await page.locator("#leadHero .tle-v42-window").click();
  await page.waitForSelector(".tle-demo-booking-active",{timeout:7000});
  await page.locator("#residentialServiceList button.service:visible").first().click();
  await page.waitForSelector("#res.on",{timeout:5000});
  assert.equal(await page.locator("#tle-v42-picker-date").count(),1);
  assert.equal(await page.locator("#tle-v42-picker-qdate").count(),1);
  assert.equal(await page.locator("#tle-v42-picker-cdate").count(),1);
  const trigger=page.locator("#tle-v42-picker-date .tle-v42-date-trigger");
  await trigger.click();
  assert.equal(await trigger.getAttribute("aria-expanded"),"true");
  assert.equal(await page.locator("#date-calendar .tle-v42-cal-grid button").count()>25,true);
  const day=page.locator("#date-calendar .tle-v42-cal-grid button:enabled").first();
  await day.click();
  const value=await page.locator("#date").inputValue();
  assert.match(value,/^\d{4}-\d{2}-\d{2}$/);
  await page.locator("#date-calendar .tle-v42-time-slots button").first().click();
  await page.locator("#date-calendar .tle-v42-cal-save").click();
  assert.equal(await trigger.getAttribute("aria-expanded"),"false");
  await page.locator("#res button.back").click();
  await page.waitForSelector("#main.on");
  assert.equal(await page.locator("#commercialServiceList button.service:visible").count()>0,true);
  await page.locator("#commercialServiceList button.service:visible").first().click();
  await page.waitForSelector("#commercial.on");
  await page.locator("#tle-v42-picker-cdate .tle-v42-date-trigger").click();
  await page.locator("#cdate-calendar .tle-v42-cal-grid button:enabled").first().click();
  assert.match(await page.locator("#cdate").inputValue(),/^\d{4}-\d{2}-\d{2}$/);
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
  assert(overflow<=8,"Viewport overflow "+width+": "+overflow);
  assert.deepEqual(errors,[],"browser errors");
  assert.deepEqual(writes,[],"no live writes");
  await page.goto(base+"/lead-private-preview.html?key=qa-unkeyed-check&lang="+lang,{waitUntil:"load"});
  assert.equal(await page.locator(".tle-demo-v42").count(),0,"client page untouched");
  assert.equal(await page.locator(".tle-v42-date-picker").count(),0,"client native dates unchanged");
  await page.close();
 }
 console.log("PASS: portal zoom, both service groups, date pickers, EN/ES responsive & client isolation");
}finally{await browser.close()}
