/** Booking demo v48 QA: responsive, Drive assets, actual prices,
 * quote/booking handler preservation and private-tenant isolation. */
import assert from "node:assert/strict";
import fs from "node:fs";
const imageNames=["editorial-entryway.png","guest-ready-dining-nook.png","deep-cleaned-kitchen.png"];
for(const name of imageNames){
 const file="public/assets/drive-house-gallery/"+name;
 assert(fs.existsSync(file)&&fs.statSync(file).size>100_000,"Missing actual Google Drive photo "+file);
}
const html=fs.readFileSync("public/lead-private-preview.html","utf8");
const script=fs.readFileSync("public/assets/tle-demo-luxury-v48.js","utf8");
assert(html.includes("/assets/tle-demo-luxury-v48.css")&&html.includes("/assets/tle-demo-luxury-v48.js"),"New layer wired");
assert(html.indexOf("tle-demo-luxury-v48.css")>html.indexOf("tle-demo-hero-copy-v47.css"),"Latest approved CSS kept first");
assert(html.indexOf("tle-demo-luxury-v48.js")>html.indexOf("tle-demo-hero-copy-v47.js"),"Latest approved gallery JS kept first");
assert(/query\.has\("key"\).*query\.get\("owner_preview"\)/s.test(script),"Private and owner routes isolated");
assert(!/fetch\(|startResidential\(|startCommercial\(|setCategory\(/.test(script),"Redesign must not change booking actions");
console.log("PASS v48 source safety");
if(!process.env.PLAYWRIGHT_MODULE){
 console.log("SKIP v48 browser test: PLAYWRIGHT_MODULE not supplied");
 process.exit(0);
}
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE);
const base=(process.env.QA_URL||"http://127.0.0.1:4173").replace(/\/$/,"");
const browser=await chromium.launch({headless:true});
try{
 for(const [lang,width] of [["en",360],["es",390],["en",768],["en",1024],["es",1440]]){
  const page=await browser.newPage({viewport:{width,height:850},reducedMotion:"reduce"});
  const errors=[],writes=[];
  page.on("pageerror",e=>errors.push(e.message));
  page.on("request",r=>{if(["POST","PUT","PATCH","DELETE"].includes(r.method()))writes.push(r.url())});
  try{
   await page.goto(base+"/lead-private-preview.html?lang="+lang,{waitUntil:"load"});
   await page.waitForSelector("html.tle-demo-v48",{timeout:16000});
   const result=await page.evaluate(()=>{
    const qs=s=>document.querySelector(s);
    const stage=qs("#leadHero .tle46-hero-slot"),story=qs(".tle48-story"),float=qs(".tle48-floating-photo");
    return {width:document.documentElement.scrollWidth,viewport:window.innerWidth,
      stages:document.querySelectorAll("#leadHero .tle46-hero-slot").length,
      floating:document.querySelectorAll(".tle48-floating-photo").length,
      story:document.querySelectorAll(".tle48-story").length,
      photoUrls:[...document.querySelectorAll(".tle48-story img, .tle48-floating-photo img")].map(i=>i.getAttribute("src")),
      imagesLoaded:[...document.querySelectorAll(".tle48-story img, .tle48-floating-photo img")].map(i=>i.complete&&i.naturalWidth>0),
      quoteCount:document.querySelectorAll("#residentialServiceList button.tle-v34-single-quote").length,
      buttons:[...document.querySelectorAll("#residentialServiceList button.service")].slice(0,3).map(b=>({handler:b.getAttribute("onclick"),price:b.querySelector(".price")?.textContent.trim(),src:b.querySelector(".tle-service-photo-v21 img")?.getAttribute("src")})),
      heroCTA:qs("#leadHero .demo-hero-cta")?.getAttribute("href"),
      size:stage?.getBoundingClientRect().toJSON(),storySize:story?.getBoundingClientRect().toJSON(),photoSize:float?.getBoundingClientRect().toJSON()
    };
   });
   assert(result.stages===1&&result.floating===1&&result.story===1,"Exactly one hero & story "+JSON.stringify(result));
   assert(result.photoUrls.every(x=>x?.startsWith("/assets/drive-house-gallery/")),"Drive images only");
   await page.locator(".tle48-story img, .tle48-floating-photo img").evaluateAll(async images=>{
     await Promise.all(images.map(async img=>{
       img.loading="eager";
       try{await img.decode()}catch{}
     }));
   });
   const images=await page.locator(".tle48-story img, .tle48-floating-photo img").evaluateAll(items=>items.map(i=>i.complete&&i.naturalWidth>0));
   assert(images.every(Boolean),"All new Drive photographs must load "+JSON.stringify(images));
   assert(result.buttons.every(b=>b.handler?.startsWith("startResidential(")&&b.price&&b.src?.includes("drive-house-gallery")),"Existing prices and handlers survive "+JSON.stringify(result.buttons));
   assert(result.quoteCount===1,"Do not duplicate quote CTA");
   assert(result.width-result.viewport<=8,"No horizontal overflow "+JSON.stringify(result));
   assert(result.heroCTA==="#bookingStarter","Hero CTA still opens booking");
   await page.locator("#leadHero .demo-hero-cta").click();
   await page.waitForSelector("html.tle-demo-booking-active",{timeout:8000});
   await page.locator("#residentialServiceList button.service").first().click();
   await page.locator("#res.on").waitFor({state:"visible",timeout:8000});
   assert.deepEqual(errors,[],"No page errors "+JSON.stringify(errors));
   assert.deepEqual(writes,[],"Sample must not create bookings "+JSON.stringify(writes));
   await page.goto(base+"/lead-private-preview.html?key=qa-private&lang="+lang,{waitUntil:"load"});
   assert.equal(await page.locator("html.tle-demo-v48").count(),0,"Private preview unchanged");
   assert.equal(await page.locator(".tle48-story").count(),0,"No editorial collage in private preview");
   console.log("PASS v48",lang,width);
  } finally{await page.close()}
 }
}finally{await browser.close()}