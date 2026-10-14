/**
 * Browser-based visual QA for SYNTHETIC private Booking Studio previews.
 * Checks real layout in Chromium across phone, tablet and desktop.
 * Does not exercise a customer booking backend or approve a client project.
 */
import assert from "node:assert/strict";
import {chromium} from "playwright";
import {readFile,mkdir,writeFile} from "node:fs/promises";
import {resolve} from "node:path";
import {pathToFileURL} from "node:url";
import {renderBookingStudioPreview} from "../lib/booking-studio-preview.mjs";

const fixture=JSON.parse(await readFile("fixtures/booking-studio-synthetic.json","utf8"));
const bright=JSON.parse(await readFile("fixtures/booking-studio-bright-rooms-synthetic.json","utf8"));
const revised={...bright,design:{...bright.design,layout:"split",cards:"photographic",typography:"elegant",hero_title:"A little more calm, right at home.",hero_body:"From everyday upkeep to a deeper refresh, tell us what your space needs. We will help with the next step."}};
const output=resolve(".private-preview/visual-qa");
await mkdir(output,{recursive:true});
const browser=await chromium.launch({headless:true});
const results=[];
const devices=[
 {name:"phone-360",width:360,height:780},
 {name:"phone-390",width:390,height:844},
 {name:"tablet-768",width:768,height:1024},
 {name:"tablet-1024",width:1024,height:768},
 {name:"desktop-1440",width:1440,height:900}
];
try{
 for(const variant of [
  {name:"editorial-split",job:fixture},
  {name:"immersive-tiles",job:{...fixture,design:{...fixture.design,layout:"immersive",cards:"tiles",typography:"modern"}}},
  {name:"bright-rooms-first-draft",job:bright},
  {name:"bright-rooms-owner-revision",job:revised}
 ]){
  const filename=resolve(output,variant.name+".html");
  await writeFile(filename,renderBookingStudioPreview(variant.job),{flag:"wx"});
  for(const device of devices){
   const page=await browser.newPage({viewport:{width:device.width,height:device.height},deviceScaleFactor:1,reducedMotion:"reduce"});
   const errors=[];
   page.on("pageerror",error=>errors.push(error.message));
   // Avoid contacting external image hosts during synthetic CI screenshots.
   await page.route("**/*",route=>route.request().url().startsWith("file:")?route.continue():route.abort());
   await page.goto(pathToFileURL(filename).href,{waitUntil:"load"});
   const report=await page.evaluate(()=>{
    const visible=el=>{const r=el.getBoundingClientRect(),style=getComputedStyle(el);return r.width>0&&r.height>0&&style.display!=="none"&&style.visibility!=="hidden"};
    const cards=[...document.querySelectorAll(".service-card")];
    const doc=document.documentElement;
    const overflows=[...document.querySelectorAll("body *")].filter(el=>{
      if(!visible(el))return false;
      const r=el.getBoundingClientRect();
      return r.right>innerWidth+3||r.left< -3;
    }).slice(0,8).map(el=>({tag:el.tagName,cls:el.className,left:Math.round(el.getBoundingClientRect().left),right:Math.round(el.getBoundingClientRect().right)}));
    return {
      viewport:innerWidth,documentWidth:doc.scrollWidth,
      title:document.querySelector("h1")?.textContent,
      serviceCards:cards.length,
      visibleCards:cards.filter(visible).length,
      heroVisible:visible(document.querySelector(".hero")),
      navVisible:visible(document.querySelector(".nav")),
      bannerVisible:visible(document.querySelector(".banner")),
      bookingDisabled:!!document.querySelector(".fake-button")&&!document.querySelector("form"),
      scripts:document.querySelectorAll("script").length,
      overflowElements:overflows
    };
   });
   const label=variant.name+"-"+device.name;
   assert.equal(report.documentWidth<=device.width+3,true,label+": horizontal document overflow "+JSON.stringify(report));
   assert.equal(report.overflowElements.length,0,label+": clipped content "+JSON.stringify(report.overflowElements));
   assert.equal(report.heroVisible,true,label+": hero hidden");
   assert.equal(report.navVisible,true,label+": nav hidden");
   assert.equal(report.bannerVisible,true,label+": private banner hidden");
   assert.equal(report.serviceCards,3,label+": missing synthetic services");
   assert.equal(report.title,variant.job.design.hero_title,label+": incorrect client-specific hero");
   assert.equal(report.visibleCards,3,label+": service cards not visible");
   assert.equal(report.bookingDisabled,true,label+": booking action must be disabled");
   assert.equal(report.scripts,0,label+": no scripts allowed");
   assert.deepEqual(errors,[],label+": page errors");
   await page.screenshot({path:resolve(output,label+".png"),fullPage:true,animations:"disabled"});
   results.push({variant:variant.name,viewport:device.name,...report});
   await page.close();
  }
 }
 await writeFile(resolve(output,"report.json"),JSON.stringify({status:"PASS",type:"synthetic-visual-only",checks:results},null,2));
 console.log("Booking Studio synthetic visual QA PASS: "+results.length+" layout/device combinations; no horizontal overflow, hidden cards, scripts or active booking forms.");
}finally{await browser.close()}
