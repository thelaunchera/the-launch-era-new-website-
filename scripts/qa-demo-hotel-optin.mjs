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
mkdirSync("qa-screenshots/demo-v49-optin",{recursive:true});
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
   await page.goto(base+"/lead-private-preview.html?layout=hotel49&lang="+lang,{waitUntil:"load"});
   await page.waitForSelector("html.tle-demo-v49",{timeout:17000});
   await page.locator("#tle48Story img").first().waitFor({state:"visible"});
   const geometry=await page.evaluate(()=>{
    const get=s=>document.querySelector(s),box=s=>get(s)?.getBoundingClientRect(),
      rect=s=>box(s)?.toJSON(),stage=box("#leadHero .tle46-hero-slot"),
      head=box("#leadHero .heroText h1.tle49-hook"),
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
   const initial=await page.locator("#residentialServiceList").evaluate(el=>{
    const cards=[...el.querySelectorAll(":scope>button.service.tle49-panel")].slice(0,3);
    return {display:getComputedStyle(el).display,rect:el.getBoundingClientRect().toJSON(),
     cards:cards.map(c=>({rect:c.getBoundingClientRect().toJSON(),radius:getComputedStyle(c).borderTopLeftRadius})),
     active:cards.filter(c=>c.getAttribute("aria-expanded")==="true").length};
   });
   assert(initial.display==="flex"&&initial.cards.length===3&&initial.active===1,
     "Photo service gallery must be accessible flex with one expanded item: "+JSON.stringify(initial));
   if(width<1100){
     assert(initial.cards.every(c=>c.rect.left>=18&&c.rect.right<=width-18&&c.rect.height>=225),
       "Phone/tablet cards must have clear side margins: "+JSON.stringify(initial));
     if(width<=600)assert(initial.cards.every(c=>parseFloat(c.radius)<=6),"Phone cards should have nearly square corners");
   }else{
     assert(initial.cards[0].rect.width>initial.cards[1].rect.width*2.2,
       "First desktop photo must be visibly expanded");
   }
   const heading=await page.locator("#leadHero h1.tle49-hook").evaluate(h=>({
    label:h.getAttribute("aria-label"),words:[...h.querySelectorAll(".tle49-hook-word")].map(w=>w.textContent),
    fontSize:parseFloat(getComputedStyle(h).fontSize)}));
   assert(heading.words.length===3&&heading.label.includes(heading.words[0])&&heading.fontSize>=38,
     "Animated words must be in the prominent accessible H1: "+JSON.stringify(heading));
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
   await page.screenshot({path:"qa-screenshots/demo-v49-optin/hero-"+lang+"-"+width+".png",fullPage:false});
   assert.equal(await page.locator("#leadHero .tle46-thumb-slot").count(),4,"Keep Flip gallery");
   await page.locator("#leadHero .tle46-thumb-slot").first().click();
   const index=await page.locator("#leadHero .tle46-hero-slot>img.tle46-gallery-img").getAttribute("data-photo-index");
   assert.equal(index,"1","Thumbnail exchanges actual hero image");
   await page.locator("#leadHero .demo-hero-cta").click();
   await page.waitForSelector("html.tle-demo-booking-active",{timeout:7500});
   assert(await page.locator("#residentialServiceList .service").count()>=3,"Keep pricing service buttons");
   const activeGallery=await page.locator("#residentialServiceList").evaluate(el=>{
     const cards=[...el.querySelectorAll(":scope>button.service.tle49-panel")].slice(0,3);
     return {display:getComputedStyle(el).display,width:el.getBoundingClientRect().width,
       cards:cards.map(c=>({width:c.getBoundingClientRect().width,top:c.getBoundingClientRect().top}))};
   });
   assert.equal(activeGallery.display,"flex","Booking gallery must stay flex");
   if(width>=1100)assert(activeGallery.cards[0].width>activeGallery.cards[1].width*2.2,
      "Expanded panel width must be much larger than collapsed panels: "+JSON.stringify(activeGallery));
   else assert(activeGallery.cards.every(c=>c.width<=activeGallery.width+2),
      "Mobile panels must not overflow: "+JSON.stringify(activeGallery));
   for(const price of ["$120","$190","$240"]){
    const btn=page.locator("#residentialServiceList button.service.tle-service-has-photo-v21").filter({hasText:price}).first();
    assert.equal(await btn.count(),1,"Expected photo card with "+price);
    const p=btn.locator(".price");
    assert.equal(await p.isVisible(),true,"Price must stay readable for "+price);
    const within=await btn.evaluate(el=>{const c=el.getBoundingClientRect(),x=el.querySelector(".price").getBoundingClientRect();
      return x.left>=c.left-2&&x.right<=c.right+2&&x.top>=c.top-2&&x.bottom<=c.bottom+2;});
    assert(within,"Price must stay inside its photo card: "+price);
   }
   await page.screenshot({path:"qa-screenshots/demo-v49-optin/services-"+lang+"-"+width+".png",fullPage:false});
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
  await p.goto(base+"/lead-private-preview.html?layout=hotel49&lang="+lang,{waitUntil:"load"});
  await p.waitForSelector("html.tle-demo-v49",{timeout:18000});
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


/* TOUCH QA: true mobile emulation instead of merely shrinking a desktop viewport.
   A first tap expands the chosen card without opening the form. A second tap
   invokes its ORIGINAL onclick. Never submit a lead, email or paid order. */
for(const engine of [chromium,webkit]){
 const mobile=await engine.launch({headless:true});
 try{
  for(const [lang,width] of [["en",320],["es",390]]){
   const page=await mobile.newPage({
     viewport:{width,height:844},isMobile:true,hasTouch:true,reducedMotion:"reduce"
   });
   const errors=[];
   page.on("pageerror",e=>errors.push(e.message));
   try{
    await page.goto(base+"/lead-private-preview.html?layout=hotel49&lang="+lang,{waitUntil:"load"});
    await page.waitForSelector("html.tle-demo-v49",{timeout:18000});
    await page.locator("#leadHero .demo-hero-cta").tap();
    await page.waitForSelector("html.tle-demo-booking-active",{timeout:10000});
    const placement=await page.evaluate(()=>{
      const bot=document.querySelector(".tle-ai-launch.tle-demo-condensed");
      const card=document.querySelector("#residentialServiceList>button.service.tle49-panel");
      const b=bot?.getBoundingClientRect(),c=card?.getBoundingClientRect();
      return {bot:b?.toJSON(),card:c?.toJSON(),overflow:document.documentElement.scrollWidth-innerWidth};
    });
    assert(placement.overflow<=7,"Even 320px touch screens may not scroll sideways: "+JSON.stringify(placement));
    if(placement.bot&&placement.card){
      assert(placement.bot.bottom<=placement.card.top+4,
        "Sonny must not cover the cleaning cards, prices, or action arrow: "+JSON.stringify(placement));
    }
    const cards=page.locator("#residentialServiceList>button.service.tle49-panel");
    assert.equal(await cards.count(),3,"Touch gallery must retain all three priced services");
    const actualTouch=await page.evaluate(()=>({
      touch:matchMedia("(max-width:759px) and (hover:none)").matches,
      hero:!!document.querySelector("#leadHero h1.tle49-hook"),
      active:document.querySelectorAll("#residentialServiceList>.tle49-panel.tle49-active").length
    }));
    assert(actualTouch.touch,"Touch emulation must use the real touch-gesture branch");
    assert.equal(actualTouch.active,1);
    await cards.nth(1).tap();
    assert.equal(await cards.nth(1).getAttribute("aria-expanded"),"true","First tap expands second service");
    const reduced=await page.locator("#residentialServiceList").evaluate(list=>{
      const nodes=[...list.querySelectorAll(":scope>button.service.tle49-panel")];
      return {heights:nodes.slice(0,3).map(n=>Math.round(n.getBoundingClientRect().height)),
        motion:getComputedStyle(nodes[0]).transitionDuration};
    });
    assert(reduced.heights[0]<=242&&reduced.heights[1]>=320&&reduced.heights[1]<=335,
      "Reduced-motion devices should settle collapsed/expanded heights instantly: "+JSON.stringify(reduced));
    assert(reduced.motion.split(",").every(x=>parseFloat(x)===0),
      "Reduced-motion setting must remove panel motion: "+JSON.stringify(reduced));
    assert.equal(await page.locator("#main").evaluate(el=>el.classList.contains("on")),true,
      "First tap must NOT open a booking unexpectedly");
    await page.screenshot({path:"qa-screenshots/demo-v49-optin/touch-expanded-"+engine.name()+"-"+lang+".png"});
    const visible=await cards.nth(1).evaluate(el=>{
      const p=el.querySelector(".price"),h=el.querySelector(".demo-service-body b");
      const a=el.getBoundingClientRect(),r=p.getBoundingClientRect(),t=h.getBoundingClientRect();
      return {price:!!p&&getComputedStyle(p).opacity==="1",title:!!h&&getComputedStyle(h).visibility!=="hidden",
       within:r.left>=a.left-3&&r.right<=a.right+3&&r.bottom<=a.bottom+3&&t.bottom<=a.bottom+3};
    });
    assert(visible.price&&visible.title&&visible.within,"Expanded mobile content must not be hidden by effect: "+JSON.stringify(visible));
    await cards.nth(1).tap();
    await page.waitForFunction(()=>!document.getElementById("main")?.classList.contains("on"),null,{timeout:10000});
    assert.deepEqual(errors,[],"Mobile touch must not generate JS errors");
    console.log("PASS real touch",engine.name(),lang,"first tap opens panel, second tap opens real booking steps");
   }catch(err){problems.push("real-touch "+engine.name()+" "+lang+" "+err.message)}
   finally{await page.close()}
  }
 }finally{await mobile.close()}
}

const ordinary=await chromium.launch({headless:true});
try{
 const page=await ordinary.newPage({viewport:{width:390,height:844}});
 await page.goto(base+"/lead-private-preview.html?lang=en",{waitUntil:"load"});
 assert.equal(await page.locator("html.tle-demo-v49").count(),0,"Original public demo must be unchanged");
 await page.goto(base+"/lead-private-preview.html?layout=hotel49&key=qa-invalid&lang=en",{waitUntil:"load"});
 assert.equal(await page.locator("html.tle-demo-v49").count(),0,"Buyer previews must stay unchanged");
 await page.close();
}finally{await ordinary.close()}
