/** QA v46: GSAP Flip gallery using five real Google Drive house image assets.
 * Strictly synthetic click/navigation. Never submit a booking or email. */
import assert from "node:assert/strict";
import {mkdirSync} from "node:fs";
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||"playwright");
const base=(process.env.QA_URL||"http://127.0.0.1:4173").replace(/\/$/,"");
const browser=await chromium.launch({headless:true});
mkdirSync("qa-screenshots/demo-v46",{recursive:true});
const errors=[];
try{
 for(const [lang,width] of [["en",360],["es",390],["en",820],["es",1440]]){
  const page=await browser.newPage({viewport:{width,height:900},reducedMotion:"reduce"});
  const pageErrors=[],writes=[];
  page.on("pageerror",e=>pageErrors.push(e.message));
  page.on("request",r=>{if(["POST","PUT","PATCH","DELETE"].includes(r.method()))writes.push(r.url())});
  try{
   await page.goto(base+"/lead-private-preview.html?lang="+lang,{waitUntil:"load"});
   await page.waitForSelector("html.tle-demo-v46",{timeout:15000});
   const hero=page.locator("#leadHero"),stage=hero.locator(".tle46-hero-slot");
   const strip=hero.locator(".tle46-thumb-strip");
   const thumbs=strip.locator("button");
   assert.equal(await thumbs.count(),4,"Four accessible thumbnails");
   assert.equal(await stage.locator(".tle46-gallery-img").count(),1,"One original image element in hero");
   assert.equal(await hero.locator(".tle46-gallery-img").count(),5,"Five actual Drive photos (not clones)");
   assert.equal(await hero.locator(".tle-v42-window").count(),0,"Retired zoom window must be gone");
   assert.equal(await hero.locator(".tle-v42-second-scene").count(),0,"Retired duplicate photo layer must be gone");
   const before=await page.evaluate(()=>{
    const hero=document.querySelector("#leadHero");
    const stage=hero.querySelector(".tle46-hero-slot");
    const buttons=[...hero.querySelectorAll(".tle46-thumb-slot")];
    window.__v46hero=stage.querySelector("img");
    window.__v46thumb=buttons[0].querySelector("img");
    const good=el=>el?.getBoundingClientRect()?.width>0;
    const text=hero.querySelector(".heroText");
    return {
      heroSrc:window.__v46hero?.getAttribute("src"),
      thumbSrc:window.__v46thumb?.getAttribute("src"),
      heroRect:stage.getBoundingClientRect().toJSON(),
      width:document.documentElement.scrollWidth-innerWidth,
      caption:hero.querySelector(".tle46-caption")?.textContent,
      mainCTA:good(text?.querySelector(".demo-hero-cta")),
      showIntro:document.querySelector("#main .tle-v44-intro")!==null,
      clipHero:getComputedStyle(hero).overflow,
      clipStrip:getComputedStyle(hero.querySelector(".tle46-thumb-strip")).overflow,
      imgReady:window.__v46hero?.complete&&window.__v46hero.naturalWidth>500
    };
   });
   assert(before.imgReady,"Hero Drive photograph should load: "+JSON.stringify(before));
   assert(before.heroSrc.includes("/assets/drive-house-gallery/"),"Hero comes from checked-in Drive collection");
   assert(before.mainCTA&&before.showIntro,"Keep original service CTA and section");
   assert(before.width<8,"No horizontal overflow: "+JSON.stringify(before));
   assert(!before.clipHero.includes("hidden")&&!before.clipStrip.includes("hidden"),"Flight path must not clip: "+JSON.stringify(before));
   if(width===360){
    const layout=await page.evaluate(()=>{
      const r=s=>{const e=document.querySelector(s);return e?{rect:e.getBoundingClientRect().toJSON(),position:getComputedStyle(e).position,zIndex:getComputedStyle(e).zIndex,margin:getComputedStyle(e).margin}:null};
      const b=document.querySelector("#leadHero .tle46-thumb-slot").getBoundingClientRect();
      const target=document.elementFromPoint(b.left+b.width/2,b.top+b.height/2);
      return {hero:r("#leadHero"),gallery:r("#leadHero .tle46-gallery"),stage:r("#leadHero .tle46-hero-slot"),strip:r("#leadHero .tle46-thumb-strip"),button:r("#leadHero .tle46-thumb-slot"),panel:r("#bookingStarter"),target:target?.outerHTML.slice(0,270)}
    });console.log("V46_LAYOUT",JSON.stringify(layout));
   }
   await thumbs.first().click();
   const after=await page.evaluate(()=>{
    const hero=document.querySelector("#leadHero"),stage=hero.querySelector(".tle46-hero-slot"),thumb=hero.querySelector(".tle46-thumb-slot");
    return {
     sameHeroNode:stage.querySelector("img")===window.__v46thumb,
     sameThumbNode:thumb.querySelector("img")===window.__v46hero,
     src:stage.querySelector("img").getAttribute("src"),
     thumbSrc:thumb.querySelector("img").getAttribute("src"),
     count:hero.querySelectorAll(".tle46-gallery-img").length
    }
   });
   assert(after.sameHeroNode&&after.sameThumbNode&&after.count===5,"Reparenting must exchange actual <img> nodes: "+JSON.stringify(after));
   assert.equal(after.src,before.thumbSrc);
   assert.equal(after.thumbSrc,before.heroSrc);
   await thumbs.first().focus();
   await thumbs.first().press("ArrowRight");
   assert.equal(await thumbs.nth(1).evaluate(e=>e===document.activeElement),true,"Arrow keys move focus");
   await thumbs.nth(1).press("End");
   assert.equal(await thumbs.last().evaluate(e=>e===document.activeElement),true,"End focuses last thumbnail");
   await page.screenshot({path:"qa-screenshots/demo-v46/"+lang+"-"+width+".png",fullPage:false});
   await hero.locator(".demo-hero-cta").click();
   await page.waitForSelector("html.tle-demo-booking-active",{timeout:7000});
   assert.equal(await page.locator("#residentialServiceList button.tle-service-has-photo-v21").count()>=3,true,"All original services intact");
   assert.equal(await page.locator("#tle-v42-picker-date").count(),1,"Calendar still inside the form");
   assert.deepEqual(writes,[],"Browsing does not make live writes");
   assert.deepEqual(pageErrors,[],"No runtime JS errors");
   await page.goto(base+"/lead-private-preview.html?key=qa-private&lang="+lang,{waitUntil:"load"});
   assert.equal(await page.locator("html.tle-demo-v46").count(),0,"Buyer private preview untouched");
   assert.equal(await page.locator(".tle46-gallery").count(),0,"Private preview has no demo gallery");
  }catch(e){errors.push(lang+" "+width+": "+e.message);console.error("FAIL v46",lang,width,e.message)}
  finally{await page.close()}
 }
 // Normal-motion run confirms GSAP and Flip are actually used.
 const normal=await browser.newPage({viewport:{width:390,height:844},reducedMotion:"no-preference"});
 try{
  await normal.goto(base+"/lead-private-preview.html?lang=en",{waitUntil:"load"});
  await normal.waitForSelector("html.tle-demo-v46",{timeout:15000});
  const libraries=await normal.evaluate(()=>({gsap:typeof window.gsap?.to,Flip:typeof window.Flip?.getState}));
  assert.equal(libraries.gsap,"function","GSAP core animation methods must load");
  assert.equal(libraries.Flip,"function","GSAP Flip getState must load");
  await normal.locator("#leadHero .tle46-thumb-slot").first().click();
  await normal.waitForTimeout(1100);
  assert.match(await normal.locator("#leadHero .tle47-hero-phrase").innerText(),/More room/i);
  console.log("PASS v46 GSAP Flip normal motion");
 }catch(e){errors.push("GSAP motion: "+e.message)}
 finally{await normal.close()}
}finally{await browser.close()}
if(errors.length){console.error(errors.join("\n"));process.exit(1)}
console.log("PASS v46 — five Drive house images; GSAP Flip; no duplicates, clipping or live writes; EN/ES responsive; buyer isolated");
