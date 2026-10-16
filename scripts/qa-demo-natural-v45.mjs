/** v45 smoke/regression: public fictional sample only. No production writes. */
import assert from "node:assert/strict";
import {mkdirSync} from "node:fs";
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||"playwright");
const base=(process.env.QA_URL||"http://127.0.0.1:4173").replace(/\/$/,"");
mkdirSync("qa-screenshots/demo-v45",{recursive:true});
const browser=await chromium.launch({headless:true});
try{
 for(const [lang,width] of [["en",360],["es",390],["es",768],["en",820],["en",1024],["es",1440]]){
  const page=await browser.newPage({viewport:{width,height:900},reducedMotion:"reduce"});
  const faults=[],writes=[];
  page.on("pageerror",error=>faults.push(error.message));
  page.on("request",r=>{if(["POST","PUT","PATCH","DELETE"].includes(r.method()))writes.push(r.url())});
  await page.goto(base+"/lead-private-preview.html?lang="+lang,{waitUntil:"load"});
  await page.waitForSelector("html.tle-demo-v45",{timeout:15000});
  await page.waitForSelector("html.tle-demo-v46",{timeout:15000});
  const words=await page.evaluate(()=>{
   const all=[...document.querySelectorAll("#residentialServiceList .tle-v46-photo-words,#commercialServiceList .tle-v46-photo-words")];
   const first=all[0],grid=first?.querySelector(".tle-v46-rotate");
   return {count:all.length,
    allOnPhoto:all.every(e=>!!e.parentElement.querySelector(".tle-service-photo-v21 img")),
    triplets:all.every(e=>e.querySelectorAll(".tle-v46-word").length===3),
    uniquePrefixes:new Set(all.map(e=>e.querySelector(".tle-v46-static")?.textContent)).size,
    firstWords:all.map(e=>e.querySelector(".tle-v46-word")?.textContent),
    aria:all.map(e=>[...e.querySelectorAll(".tle-v46-word")].map(w=>w.getAttribute("aria-hidden"))),
    motion:[...grid?.children||[]].map(el=>({name:getComputedStyle(el).animationName,opacity:getComputedStyle(el).opacity})),
    intro:document.querySelector(".tle-v44-intro h2")?.textContent
   };
  });
  assert.equal(words.count,7,"Each of 7 original service photos needs human overlay copy: "+JSON.stringify(words));
  assert(words.allOnPhoto&&words.triplets&&words.uniquePrefixes>=6,"Rotating copy must be unique and photo-specific");
  assert(words.aria.every(a=>a[0]===null&&a[1]==="true"&&a[2]==="true"),"Only primary word available to assistive tech");
  assert(words.motion[0].name==="none"&&Number(words.motion[0].opacity)===1
      &&words.motion.slice(1).every(x=>Number(x.opacity)===0),"Reduced-motion uses the first static word");
  assert(words.firstWords[0]===(lang==="es"?"fresco":"fresh"),"Translations should be idiomatic EN/ES");

  const before=await page.evaluate(()=>{
   const logo=document.querySelector("#demoEditorialNav #demoBrandName");
   const hero=document.querySelector("#leadHero");
   return {logoInk:getComputedStyle(logo).color,logoFill:getComputedStyle(logo).webkitTextFillColor,
     logoBackground:getComputedStyle(logo).backgroundColor,
     sectionWidth:document.querySelector("#bookingStarter").getBoundingClientRect().width,
     heroBackground:getComputedStyle(hero.querySelector(".tle-v42-second-scene")).backgroundImage,
     photograph:hero.querySelector(".demo-cb-hero-media img").getAttribute("src"),
     oldYearly:!!document.querySelector("#tle41Frequency"),
     oldHeroCal:!!document.querySelector("#tle41HeroBooking"),
     oldCategoryTabs:!!document.querySelector("#categoryTabs"),
     scrollWidth:document.documentElement.scrollWidth-innerWidth};
  });
  assert(before.heroBackground.includes(before.photograph),"Both zoom scenes use same picture");
  assert.equal(before.logoFill,"rgb(23, 62, 90)","Readable navy logo must show on light bar");
  assert(Math.abs(before.sectionWidth-width)<=2,"Service section must span viewport, not a rectangle inside black gutters: "+JSON.stringify(before));
  assert(!before.oldYearly&&!before.oldHeroCal&&!before.oldCategoryTabs,"Old widgets must stay retired");
  assert(before.scrollWidth<=7,"No horizontal overflow: "+JSON.stringify(before));
  await page.locator("#leadHero .tle-v42-window").click();
  await page.waitForSelector("html.tle-demo-booking-active",{timeout:6000});
  const details=await page.evaluate(()=>{
   const select=s=>document.querySelector(s),style=s=>getComputedStyle(select(s));
   const rect=s=>select(s).getBoundingClientRect();
   const intro=select("#main .tle-v44-intro").getBoundingClientRect();
   const header=select("#main .tle-v42-home-head").getBoundingClientRect();
   const first=select("#residentialServiceList button.tle-service-has-photo-v21");
   const quote=select("#residentialServiceList .tle-v30-main-custom");
   return {panelWidth:rect("#bookingStarter").width,panelRadius:style("#bookingStarter").borderTopLeftRadius,
    introGap:Math.round(header.top-intro.bottom),
    staleNotices:document.querySelectorAll("#main > .tle-client-notice,#main .tle-service-subsection").length,
    cardBorder:getComputedStyle(first).borderTopWidth,
    cardRadius:getComputedStyle(first).borderTopLeftRadius,
    cardShadow:getComputedStyle(first).boxShadow,
    photoWidth:first.getBoundingClientRect().width,
    photoHeight:first.getBoundingClientRect().height,
    customBorder:quote?getComputedStyle(quote).borderTopWidth:null,
    customRadius:quote?getComputedStyle(quote).borderTopLeftRadius:null,
    grids:[...document.querySelectorAll("#main .tle-v42-grid")].map(x=>({visible:getComputedStyle(x).display!=="none",width:x.getBoundingClientRect().width})),
    scrollWidth:document.documentElement.scrollWidth-innerWidth};
  });
  assert(Math.abs(details.panelWidth-width)<=2,"Focused service page must stay edge-to-edge "+JSON.stringify(details));
  assert(parseFloat(details.panelRadius)<=1,"Outer service container is still a card");
  assert(details.introGap<50,"Blank space between intro and category heading: "+JSON.stringify(details));
  assert.equal(details.staleNotices,0,"Remove outdated duplicate prose nodes");
  assert(parseFloat(details.cardBorder)===0&&parseFloat(details.cardRadius)===0,"Photo is still a rounded card: "+JSON.stringify(details));
  assert(details.cardShadow==="none","Remove big floating card shadows");
  assert(details.photoHeight>=400,"Service photo should breathe: "+JSON.stringify(details));
  assert(details.customRadius==="0px","Custom quote must be an inline row, not a tile");
  assert(details.grids.length===2&&details.grids.every(x=>x.visible),"Home and business galleries remain");
  assert(details.scrollWidth<=7,"No focused horizontal overflow");
  await page.screenshot({path:"qa-screenshots/demo-v45/"+lang+"-"+width+"-gallery.png",fullPage:false});
  await page.locator("#residentialServiceList button.tle-service-has-photo-v21").first().click();
  await page.waitForSelector("#res.on",{timeout:6500});
  const extra=await page.locator("#res label.choice b").first().evaluate(el=>({text:el.textContent,color:getComputedStyle(el).color,fill:getComputedStyle(el).webkitTextFillColor}));
  assert(extra.text.includes("$25")&&extra.fill==="rgb(32, 95, 128)","Visible add-on price in booking form: "+JSON.stringify(extra));
  assert.equal(await page.locator("#tle-v42-picker-date .tle-v42-date-trigger").count(),1);
  assert.deepEqual(faults,[],"JS page errors");
  assert.deepEqual(writes,[],"No real sample writes");
  await page.goto(base+"/lead-private-preview.html?key=fictional-tenant-check&lang="+lang,{waitUntil:"load"});
  assert.equal(await page.locator("html.tle-demo-v45").count(),0,"No v45 on customer pages");
  assert.equal(await page.locator(".tle-v46-photo-words").count(),0,"No v46 photo marketing copy on private customers");
  await page.close();
  console.log("PASS natural layout",lang,width);
 }
 const motionPage=await browser.newPage({viewport:{width:390,height:860},reducedMotion:"no-preference"});
 await motionPage.goto(base+"/lead-private-preview.html?lang=es",{waitUntil:"load"});
 await motionPage.waitForSelector("html.tle-demo-v46",{timeout:15000});
 const animation=await motionPage.evaluate(()=>{
  const first=document.querySelector("#residentialServiceList .tle-v46-photo-words");
  const grid=first.querySelector(".tle-v46-rotate");
  return {perspective:getComputedStyle(grid).perspective,
   animations:[...grid.children].map(e=>({name:getComputedStyle(e).animationName,
     duration:getComputedStyle(e).animationDuration,delay:getComputedStyle(e).animationDelay})),
   scrollWidth:document.documentElement.scrollWidth-innerWidth};
 });
 assert.equal(animation.perspective,"520px","Rotating words should retain 3D perspective");
 assert(animation.animations.every(x=>x.name==="tleV46RotateWord"&&x.duration==="6s"),
   "Each word must rotate for six seconds: "+JSON.stringify(animation));
 assert.deepEqual(animation.animations.map(x=>x.delay),["0s","2s","4s"],"Word cadence must be staggered 2s");
 assert(animation.scrollWidth<=7,"Caption motion must not create horizontal overflow: "+JSON.stringify(animation));
 await motionPage.close();
}finally{await browser.close()}
