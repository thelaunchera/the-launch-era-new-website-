/** QA v44: visual changes only on fictional public sample, no live writes. */
import assert from "node:assert/strict";
import {mkdirSync} from "node:fs";
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||"playwright");
const root=(process.env.QA_URL||"http://127.0.0.1:4173").replace(/\/$/,"");
mkdirSync("qa-screenshots/demo-v44",{recursive:true});
const browser=await chromium.launch({headless:true});
try{
 for(const [lang,width] of [["en",360],["es",390],["en",820],["es",1440]]){
  const page=await browser.newPage({viewport:{width,height:900},reducedMotion:"reduce"});
  const faults=[],writes=[];
  page.on("pageerror",err=>faults.push(err.message));
  page.on("request",req=>{if(["POST","PUT","DELETE","PATCH"].includes(req.method()))writes.push(req.url())});
  await page.goto(root+"/lead-private-preview.html?lang="+lang,{waitUntil:"load"});
  await page.waitForSelector("html.tle-demo-v44",{timeout:13000});
  const hero=await page.evaluate(()=>{
   const get=s=>document.querySelector(s),rect=s=>get(s)?.getBoundingClientRect();
   const overlap=(a,b)=>a&&b&&a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top;
   const photo=get("#leadHero .demo-cb-hero-media img");
   const scene=get("#leadHero .tle-v42-second-scene");
   const portal=get("#leadHero .tle-v42-window");
   const heading=rect("#leadHero .demo-hero-tagline"),description=rect("#leadHero .demo-hero-description"),button=rect("#leadHero .tle-v42-window");
   const mark=get("#demoBrandName .tle-bloom-name");
   return {
    mainSrc:photo?.getAttribute("src"),
    sceneBg:getComputedStyle(scene).backgroundImage,
    portalBg:getComputedStyle(portal).backgroundImage,
    portalText:portal?.innerText,
    overlapHeading:overlap(heading,button),
    overlapSubheading:overlap(description,button),
    markText:mark?.textContent,markColor:getComputedStyle(mark).color,
    scroll:document.documentElement.scrollWidth-innerWidth
   };
  });
  assert(hero.mainSrc&&hero.sceneBg.includes(hero.mainSrc),"Zoom second scene must use the exact hero photograph: "+JSON.stringify(hero));
  assert(!hero.portalBg.includes("url("),"Window must not introduce a second competing photo: "+JSON.stringify(hero));
  assert.equal(hero.portalText.includes(lang==="es"?"Bienvenidos":"Welcome"),true);
  assert(!hero.overlapHeading&&!hero.overlapSubheading,"Welcome window must not obscure hero text: "+JSON.stringify(hero));
  assert(hero.scroll<8,"No horizontal overflow at hero: "+JSON.stringify(hero));
  assert(hero.markText?.length>5,"Visible cleaning company logo required");
  await page.locator("#leadHero .tle-v42-window").click();
  await page.waitForSelector("html.tle-demo-booking-active",{timeout:6000});
  const gallery=await page.evaluate(()=>{
   const g=s=>document.querySelector(s),cs=s=>getComputedStyle(g(s)),r=s=>g(s)?.getBoundingClientRect();
   const cards=[...document.querySelectorAll("#main .tle-v42-grid > button.tle-service-has-photo-v21")].filter(x=>x.getBoundingClientRect().width>0);
   const intro=g("#main .tle-v44-intro");
   const h=g("#main .tle-v42-home-head h3");
   const panel=g("#bookingStarter");
   return {
    countIntro:document.querySelectorAll("#main .tle-v44-intro").length,
    introTitle:intro?.querySelector("h2")?.textContent,
    introText:intro?.querySelector("p")?.textContent,
    visibleAncientLabel:!!g("#main>.label")&&getComputedStyle(g("#main>.label")).display!=="none",
    headingText:h?.textContent,
    headingInk:getComputedStyle(h).color,
    headingLine:getComputedStyle(g("#main .tle-v42-home-head")).borderBottomWidth,
    panelRadius:parseFloat(getComputedStyle(panel).borderTopLeftRadius),
    panelBorder:getComputedStyle(panel).borderTopWidth,
    galleryBg:getComputedStyle(panel).backgroundImage,
    cards:cards.map(el=>{
      const rc=el.getBoundingClientRect(),s=getComputedStyle(el);
      return {height:rc.height,width:rc.width,radius:s.borderTopLeftRadius,border:s.borderTopWidth};
    }),
    sectionNames:[...document.querySelectorAll("#main .tle-v42-section-head h3")].map(e=>e.textContent),
    scroll:document.documentElement.scrollWidth-innerWidth
   };
  });
  assert.equal(gallery.countIntro,1,"One introduction, not repeated labels: "+JSON.stringify(gallery));
  assert(gallery.introTitle===(lang==="es"?"Elige tu limpieza":"Choose your cleaning"),"Localized introduction missing");
  assert.equal(gallery.visibleAncientLabel,false,"Redundant service label still shown");
  assert(gallery.panelRadius<=1,"Booking entry must be an open section, not a large card: "+JSON.stringify(gallery));
  assert(gallery.cards.length>=7,"Preserve all original real-photo service buttons");
  assert(gallery.cards.every(c=>c.height>=390&&parseFloat(c.border)===0),"Photo cards should be spacious and frameless: "+JSON.stringify(gallery));
  assert(gallery.sectionNames.length===2,"Both Home and Business preserved");
  assert(gallery.scroll<8,"No mobile/tablet horizontal overflow: "+JSON.stringify(gallery));
  await page.screenshot({path:"qa-screenshots/demo-v44/"+lang+"-"+width+"-services.png",fullPage:false});
  await page.locator("#residentialServiceList button.tle-service-has-photo-v21").first().click();
  await page.waitForSelector("#res.on",{timeout:7000});
  assert.equal(await page.locator("#tle-v42-picker-date .tle-v42-date-trigger").count(),1,"Existing in-form calendar retained");
  assert.deepEqual(faults,[],"No JS page errors");
  assert.deepEqual(writes,[],"No booking or quote network writes during QA");
  await page.goto(root+"/lead-private-preview.html?key=qa-isolation&lang="+lang,{waitUntil:"load"});
  assert.equal(await page.locator("html.tle-demo-v44").count(),0,"Do not touch keyed customer demo");
  assert.equal(await page.locator("#main .tle-v44-intro").count(),0,"No customer marketing addition");
  await page.close();
  console.log("PASS v44",lang,width);
 }
 const animated=await browser.newPage({viewport:{width:390,height:844},reducedMotion:"no-preference"});
 const animationErrors=[];
 animated.on("pageerror",e=>animationErrors.push(e.message));
 await animated.goto(root+"/lead-private-preview.html?lang=en",{waitUntil:"load"});
 await animated.waitForSelector("html.tle-demo-v44",{timeout:13000});
 await animated.locator("#leadHero .tle-v42-window").click();
 await animated.waitForTimeout(450);
 const motion=await animated.evaluate(()=>{
  const hero=document.querySelector("#leadHero");
  const portal=hero.querySelector(".tle-v42-window");
  const photo=hero.querySelector(".demo-cb-hero-media");
  return {active:hero.classList.contains("tle-v42-travel"),
    portalTransform:getComputedStyle(portal).transform,
    photoTransform:getComputedStyle(photo).transform,
    sceneOpacity:getComputedStyle(hero.querySelector(".tle-v42-second-scene")).opacity};
 });
 assert(motion.active&&motion.portalTransform!=="none"&&motion.photoTransform!=="none",
   "Real zoom through the original photo must animate on normal motion: "+JSON.stringify(motion));
 await animated.waitForSelector("html.tle-demo-booking-active",{timeout:6000});
 assert.deepEqual(animationErrors,[],"No errors during animated Welcome");
 await animated.close();
}finally{await browser.close();}
