/** v48 booking-demo regression: visual geometry, correct Drive images,
 * preserved service/pricing/quote handlers and strict customer isolation.
 * NEVER submit a real booking, email, payment, or backend write. */
import assert from "node:assert/strict";
import {existsSync,mkdirSync} from "node:fs";
const {chromium,webkit}=await import(process.env.PLAYWRIGHT_MODULE||"playwright");
const base=(process.env.QA_URL||"http://127.0.0.1:4173").replace(/\/$/,"");
const assets=[
  "public/assets/drive-house-gallery/quiet-luxury.png",
  "public/assets/drive-house-gallery/whole-home.png",
  "public/assets/drive-house-gallery/pristine-kitchen.png",
  "public/assets/drive-house-gallery/dining-room.png",
  "public/assets/drive-house-gallery/miami-condo.png",
  "public/assets/demo-editorial/story-room.webp",
  "public/assets/demo-editorial/story-detail.webp",
  "public/assets/demo-editorial/service-standard.webp",
  "public/assets/demo-editorial/service-deep.webp",
  "public/assets/demo-editorial/service-move.webp"
];
for(const path of assets)assert(existsSync(path),"Missing Drive image: "+path);
const browser=await chromium.launch({headless:true});
const problems=[];
mkdirSync("qa-screenshots/demo-v48",{recursive:true});
try {
 for(const [lang,width,height] of [
  ["en",360,780],["es",390,844],["en",412,915],
  ["en",820,1180],["es",1024,768],["en",1440,900]
 ]){
  const page=await browser.newPage({viewport:{width,height},reducedMotion:"reduce"});
  const errors=[],writes=[];
  page.on("pageerror",e=>errors.push(e.message));
  page.on("request",r=>{if(["POST","PUT","PATCH","DELETE"].includes(r.method()))writes.push(r.url())});
  try {
   await page.goto(base+"/lead-private-preview.html?lang="+lang,{waitUntil:"load"});
   await page.waitForSelector("html.tle-demo-v48",{timeout:17000});
   await page.locator("#tle48Story img").first().waitFor({state:"visible"});
   const geometry=await page.evaluate(()=>{
    const get=s=>document.querySelector(s),box=s=>get(s)?.getBoundingClientRect(),
      rect=s=>box(s)?.toJSON(),stage=box("#leadHero .tle46-hero-slot"),
      head=box("#leadHero .heroText .demo-hero-tagline"),
      cta=box("#leadHero .demo-hero-cta"),
      photo=box("#leadHero .tle46-hero-slot>img.tle46-gallery-img"),
      story=box("#tle48Story");
    const list=[...document.querySelectorAll("#residentialServiceList>button.service.tle-service-has-photo-v21")].slice(0,3);
    return {
      heroStage:stage?.toJSON(),headline:head?.toJSON(),cta:cta?.toJSON(),photo:photo?.toJSON(),
      story:story?.toJSON(),storyCount:document.querySelectorAll("#tle48Story").length,
      photoSrc:get("#leadHero .tle46-hero-slot>img.tle46-gallery-img")?.getAttribute("src"),
      servicePhotos:list.map(el=>el.querySelector(".tle-service-photo-v21 img")?.getAttribute("src")),
      samplePrices:document.querySelector("#residentialServiceList")?.textContent,
      singleVisibleQuote:[...document.querySelectorAll("#residentialServiceList>button")].filter(el=>{
        if(!/quote|cotiz/i.test(el.textContent))return false;
        const st=getComputedStyle(el),r=el.getBoundingClientRect();
        return !el.hidden&&st.display!=="none"&&r.width>0&&r.height>0;
      }).length,
      quoteDuplicateHidden:!!get(".tle48-duplicate-quote[hidden]"),
      overflow:document.documentElement.scrollWidth-innerWidth,
      navVisible:!!box("#demoEditorialNav"),
      dataVersion:document.documentElement.className
    };
   });
   assert.equal(geometry.storyCount,1,"Exactly one editorial story");
   assert(geometry.photoSrc.includes("/assets/drive-house-gallery/"),"Hero must use existing Drive asset");
   assert(new Set(geometry.servicePhotos).size===3&&geometry.servicePhotos.every(src=>src?.includes("/assets/demo-editorial/")),
     "Three different optimized Drive service photos: "+JSON.stringify(geometry.servicePhotos));
   assert(geometry.samplePrices?.includes("$120")&&geometry.samplePrices?.includes("$190")&&geometry.samplePrices?.includes("$240"),"All original sample prices retained");
   assert(geometry.singleVisibleQuote===1,"Only one visible custom quote CTA: "+JSON.stringify(geometry));
   assert(geometry.overflow<=7,"No horizontal overflow "+JSON.stringify(geometry));
   const columns=await page.locator("#residentialServiceList").evaluate(el=>({
     count:getComputedStyle(el).gridTemplateColumns.split(/\\s+/).filter(Boolean).length,
     display:getComputedStyle(el).display
   }));
   const expected=width>=1051?3:width>=760?2:1;
   assert.equal(columns.count,expected,"Expected "+expected+" readable service columns at "+width+": "+JSON.stringify(columns));
   if(width<=412){
    const bubble=await page.evaluate(()=>{
     const bot=document.querySelector(".tle-ai-launch.tle-demo-condensed"),cta=document.querySelector("#leadHero .demo-hero-cta");
     if(!bot||!cta)return {overlap:false};
     const a=bot.getBoundingClientRect(),b=cta.getBoundingClientRect();
     return {overlap:Math.min(a.right,b.right)>Math.max(a.left,b.left)+2&&Math.min(a.bottom,b.bottom)>Math.max(a.top,b.top)+2};
    });
    assert(!bubble.overlap,"Sonny must not cover the Booking CTA on mobile");
   }
   assert(geometry.headline&&geometry.cta&&geometry.heroStage&&geometry.story,"Hero/story/CTA must exist");
   assert(geometry.cta.top>=geometry.heroStage.top-3&&geometry.cta.bottom<=geometry.heroStage.bottom+3,
     "CTA inside photo hero: "+JSON.stringify(geometry));
   assert(geometry.headline.left>=-3&&geometry.headline.right<=width+3,
     "Headline stays on screen: "+JSON.stringify(geometry));
   if(width>=760){
    assert(geometry.photo.left>geometry.headline.right-20,"Desktop image to right of headline");
   }else{
    assert(Math.abs(geometry.photo.width-geometry.heroStage.width)<7,"Phone gets full-width photo");
   }
   const allImages=await page.evaluate(()=>({
     src:[...document.querySelectorAll("#leadHero img.tle46-gallery-img,#tle48Story img,#residentialServiceList>button.service.tle-service-has-photo-v21 img")].map(i=>i.getAttribute("src")),
     commercial:[...document.querySelectorAll("#commercialServiceList>button.service.tle-service-has-photo-v21 img")].slice(0,4).map(i=>i.getAttribute("src"))
   }));
   assert.equal(new Set(allImages.src).size,10,"Hero, story, and residential services use ten DISTINCT photos: "+JSON.stringify(allImages));
   assert(allImages.commercial.every(src=>src?.includes("/assets/demo-services/")),"Commercial photos must show the right type of space");
   const loaded=await page.evaluate(async()=>{
    const imgs=[...document.querySelectorAll("#leadHero .tle46-hero-slot>img.tle46-gallery-img,#tle48Story img")];
    await Promise.all(imgs.map(img=>img.decode().catch(()=>{})));
    return imgs.map(img=>({src:img.getAttribute("src"),naturalWidth:img.naturalWidth}));
   });
   assert(loaded.every(img=>img.naturalWidth>300),"Local Drive images must resolve "+JSON.stringify(loaded));
   await page.screenshot({path:"qa-screenshots/demo-v48/hero-"+lang+"-"+width+".png",fullPage:false});
   assert.equal(await page.locator("#leadHero .tle46-thumb-slot").count(),4,"Keep Flip gallery");
   await page.locator("#leadHero .tle46-thumb-slot").first().click();
   const index=await page.locator("#leadHero .tle46-hero-slot>img.tle46-gallery-img").getAttribute("data-photo-index");
   assert.equal(index,"1","Thumbnail exchanges actual hero image");
   await page.locator("#leadHero .demo-hero-cta").click();
   await page.waitForSelector("html.tle-demo-booking-active",{timeout:7500});
   assert(await page.locator("#residentialServiceList .service").count()>=3,"Keep pricing service buttons");
   for(const price of ["$120","$190","$240"]){
    const btn=page.locator("#residentialServiceList button.service.tle-service-has-photo-v21").filter({hasText:price}).first();
    assert.equal(await btn.count(),1,"Expected photo card with "+price);
    const p=btn.locator(".price");
    assert.equal(await p.isVisible(),true,"Price must stay readable for "+price);
    const within=await btn.evaluate(el=>{const c=el.getBoundingClientRect(),x=el.querySelector(".price").getBoundingClientRect();
      return x.left>=c.left-2&&x.right<=c.right+2&&x.top>=c.top-2&&x.bottom<=c.bottom+2;});
    assert(within,"Price must stay inside its photo card: "+price);
   }
   await page.screenshot({path:"qa-screenshots/demo-v48/services-"+lang+"-"+width+".png",fullPage:false});
   const category=page.locator("#categoryTabs button[data-category='commercial']");
   if(await category.isVisible())await category.click(); // v42 hides legacy category tabs; never click a retired button
   const commercial=await page.evaluate(()=>{
    const c=document.getElementById("commercialServiceList");
    const visible=c&&!c.hidden&&getComputedStyle(c).display!=="none";
    return {visible,count:c?.querySelectorAll(":scope>button.service").length,
      overflow:document.documentElement.scrollWidth-innerWidth};
   });
   assert(commercial.count>=4,"Preserve commercial options");
   assert(commercial.overflow<=7,"Commercial should not overflow");
   const standard=page.locator("#residentialServiceList button.service.tle-service-has-photo-v21").first();
   await standard.click();
   await page.waitForFunction(()=>!document.getElementById("main")?.classList.contains("on"),null,{timeout:9000});
   assert(!await page.locator("#main").evaluate(el=>el.classList.contains("on")),"Selecting a priced service opens its real booking request steps");
   assert.deepEqual(writes,[],"Browsing demo must never send backend writes");
   assert.deepEqual(errors,[],"No Javascript runtime errors");
   console.log("PASS v48",lang,width,JSON.stringify({overflow:geometry.overflow,commercial}));
  }catch(e){problems.push(lang+" "+width+" "+e.message);console.error("FAIL v48",lang,width,e.message)}
  finally{await page.close()}
 }
 for(const suffix of ["?key=qa-private&lang=en","?owner_preview=1&lang=es"]){
  const page=await browser.newPage();
  try{
   await page.goto(base+"/lead-private-preview.html"+suffix,{waitUntil:"domcontentloaded"});
   assert.equal(await page.locator("html.tle-demo-v48").count(),0,"Do not apply to protected demo: "+suffix);
   assert.equal(await page.locator("#tle48Story").count(),0,"Never inject editorial into client preview");
  }catch(e){problems.push("isolation "+suffix+" "+e.message)}
  finally{await page.close()}
 }
}finally{await browser.close()}
for(const lang of ["en","es"]){
 const b=await webkit.launch({headless:true});
 try{
  const p=await b.newPage({viewport:{width:390,height:844},reducedMotion:"reduce"});
  await p.goto(base+"/lead-private-preview.html?lang="+lang,{waitUntil:"load"});
  await p.waitForSelector("html.tle-demo-v48",{timeout:18000});
  const v=await p.evaluate(()=>({overflow:document.documentElement.scrollWidth-innerWidth,
    story:!!document.getElementById("tle48Story"),
    quotes:[...document.querySelectorAll("#residentialServiceList>button")].filter(e=>/quote|cotiz/i.test(e.textContent)&&!e.hidden&&getComputedStyle(e).display!=="none").length}));
  assert(v.overflow<=7&&v.story&&v.quotes===1,"Safari iPhone layout: "+JSON.stringify(v));
  await p.locator("#leadHero .demo-hero-cta").click();
  await p.waitForSelector("html.tle-demo-booking-active",{timeout:10000});
  console.log("PASS Safari iPhone",lang);
 }catch(e){problems.push("Safari iPhone "+lang+" "+e.message)}
 finally{await b.close()}
}
if(problems.length){console.error(problems.join("\n"));process.exit(1)}
