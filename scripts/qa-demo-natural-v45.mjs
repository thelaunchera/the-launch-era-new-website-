/** Natural editorial smoke: current v47 hero Flip gallery plus booking form.
 * Obsolete v42 portal and service-card slogans intentionally retired. */
import assert from "node:assert/strict";
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||"playwright");
const base=(process.env.QA_URL||"http://127.0.0.1:4173").replace(/\/$/,"");
const browser=await chromium.launch({headless:true});
try{
 for(const [lang,width] of [["en",360],["es",390],["es",768],["en",820],["en",1024],["es",1440]]){
  const page=await browser.newPage({viewport:{width,height:900},reducedMotion:"reduce"});
  const errors=[],writes=[];
  page.on("pageerror",e=>errors.push(e.message));
  page.on("request",r=>{if(["POST","PATCH","PUT","DELETE"].includes(r.method()))writes.push(r.url())});
  await page.goto(base+"/lead-private-preview.html?lang="+lang,{waitUntil:"load"});
  await page.waitForSelector("html.tle-demo-v47",{timeout:16000});
  assert.equal(await page.locator(".tle-v46-photo-words").count(),0,"No unwanted text on service photos");
  assert.equal(await page.locator(".tle47-hero-phrase").count(),1,"One human headline on active hero image");
  assert.equal(await page.locator(".tle46-thumb-slot").count(),4,"Four house thumbnails");
  assert.equal(await page.locator(".tle-v42-window").count(),0,"Retired zoom window not restored");
  await page.locator("#leadHero .demo-hero-cta").click();
  await page.waitForSelector("html.tle-demo-booking-active",{timeout:6500});
  const geometry=await page.evaluate(()=>{
   const el=s=>document.querySelector(s),css=s=>getComputedStyle(el(s)),rect=s=>el(s)?.getBoundingClientRect();
   const intro=rect("#main .tle-v44-intro"),head=rect("#main .tle-v42-home-head");
   const first=el("#residentialServiceList button.tle-service-has-photo-v21");
   const custom=el("#residentialServiceList .tle-v34-single-quote");
   return {width:rect("#bookingStarter")?.width,viewport:innerWidth,voidSpace:Math.round(head.top-intro.bottom),
    introCount:document.querySelectorAll("#main .tle-v44-intro").length,
    cards:document.querySelectorAll("#main button.tle-service-has-photo-v21").length,
    residentialPhotos:document.querySelectorAll("#residentialServiceList > button.tle-service-has-photo-v21").length,
    commercialPhotos:document.querySelectorAll("#commercialServiceList > button.tle-service-has-photo-v21").length,
    postConstruction:document.querySelectorAll('#commercialServiceList > button[onclick*="Post-Construction"]').length,
    commercialCustomQuotes:document.querySelectorAll("#commercialServiceList > button.tle-v34-single-quote").length,
    border:css("#bookingStarter").borderTopLeftRadius,
    photoBorder:getComputedStyle(first).borderTopWidth,
    quoteBorder:custom?getComputedStyle(custom).borderTopLeftRadius:null,
    horizontallyScrollable:document.documentElement.scrollWidth-innerWidth};
  });
  assert(Math.abs(geometry.width-width)<3,"Natural gallery fills screen: "+JSON.stringify(geometry));
  assert(geometry.voidSpace<70&&geometry.introCount===1,"No empty stack between header and cleaning photos");
  assert(geometry.cards===6&&geometry.residentialPhotos===3&&geometry.commercialPhotos===3,
   "Keep the six approved service photo cards, no empty construction tile: "+JSON.stringify(geometry));
  assert(geometry.postConstruction===0,"Post-Construction must be removed from sample DOM");
  assert(geometry.commercialCustomQuotes===1,"Preserve one working commercial custom-quote path");
  assert(parseFloat(geometry.border)<=1&&parseFloat(geometry.photoBorder)===0,"No rectangular parent cards");
  assert(geometry.quoteBorder==="0px","Inline custom quote, not a boxed callout: "+JSON.stringify(geometry));
  assert(geometry.horizontallyScrollable<=7,"No horizontal overflow: "+JSON.stringify(geometry));
  await page.locator("#residentialServiceList button.tle-service-has-photo-v21").first().click();
  await page.locator("#res.on").waitFor({state:"visible",timeout:6500});
  assert.equal(await page.locator("#tle-v42-picker-date").count(),1,"Date picker stays in service form");
  assert.deepEqual(errors,[],"No runtime errors");
  assert.deepEqual(writes,[],"No real bookings or messages sent");
  await page.goto(base+"/lead-private-preview.html?key=qa-private&lang="+lang,{waitUntil:"load"});
  assert.equal(await page.locator("html.tle-demo-v47").count(),0,"Sample copy cannot enter private demos");
  assert.equal(await page.locator('#commercialServiceList > button[onclick*="Post-Construction"]').count(),1,
   "Do not remove a separately customized buyer's commercial option");
  await page.close();
  console.log("PASS v47 natural smoke",lang,width);
 }
}finally{await browser.close()}
