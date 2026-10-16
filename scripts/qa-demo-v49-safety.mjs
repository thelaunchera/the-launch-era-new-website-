/**
 * The Launch Era v49 public sample smoke regression (NO submissions).
 * Prevents two gallery/headline engines, checks hero hit testing and
 * first/second touch behavior without changing production booking handlers.
 */
import assert from "node:assert/strict";
import {mkdirSync} from "node:fs";
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||"playwright");
const base=(process.env.QA_URL||"http://127.0.0.1:4173").replace(/\/$/,"");
const widths=[360,390,412,820,1024,1440];
const errors=[];
mkdirSync("qa-screenshots/demo-v49-guard",{recursive:true});
const browser=await chromium.launch({headless:true});
try {
 for(const lang of ["en","es"])for(const width of widths){
  const touch=width<=1024;
  const page=await browser.newPage({
   viewport:{width,height:width===820?1180:width===1024?900:844},
   deviceScaleFactor:1,hasTouch:touch,isMobile:touch,reducedMotion:"reduce"
  });
  const pageErrors=[],writes=[];
  page.on("pageerror",e=>pageErrors.push(e.message));
  page.on("request",r=>{
   if(["POST","PUT","PATCH","DELETE"].includes(r.method()))writes.push(r.url());
  });
  try{
   await page.goto(base+"/lead-private-preview.html?lang="+lang,{waitUntil:"load",timeout:30000});
   await page.locator("html.tle-demo-v49").waitFor({state:"attached",timeout:18000});
   const layout=await page.evaluate(()=>{
    const links=[...document.querySelectorAll("link[href],script[src]")].map(el=>el.getAttribute("href")||el.getAttribute("src"));
    const counted=fragment=>links.filter(src=>src.includes(fragment)).length;
    const shown=el=>{
     if(!el)return false;
     const s=getComputedStyle(el),r=el.getBoundingClientRect();
     return s.display!=="none"&&s.visibility!=="hidden"&&r.width>0&&r.height>0;
    };
    const visibleHeadings=[...document.querySelectorAll("#leadHero h1")].filter(shown);
    const gallery=document.getElementById("residentialServiceList");
    const panels=[...gallery.querySelectorAll(":scope>button.tle49-service-panel")];
    return {
     js:counted("/assets/tle-demo-expanding-v49.js"),
     css:counted("/assets/tle-demo-expanding-v49.css"),
     duplicateJs:counted("tle-demo-expand-panels-v49.js"),
     duplicateCss:counted("tle-demo-expand-panels-v49.css"),
     visibleHeadings:visibleHeadings.map(el=>({className:el.className,aria:el.getAttribute("aria-label")})),
     hintCount:document.querySelectorAll("#leadHero .tle48-sample-note").length,
     hintPointer:getComputedStyle(document.querySelector("#leadHero .tle48-sample-note")).pointerEvents,
     galleryDisplay:getComputedStyle(gallery).display,
     panelCount:panels.length,active:panels.filter(b=>b.getAttribute("aria-expanded")==="true").length,
     scrollOverflow:document.documentElement.scrollWidth-innerWidth,
     quoteButtons:[...document.querySelectorAll("#residentialServiceList>button")].filter(el=>
      !el.hidden&&getComputedStyle(el).display!=="none"&&/quote|cotiz/i.test(el.textContent)
     ).length
    };
   });
   assert.equal(layout.js,1,"One v49 controller JS only");
   assert.equal(layout.css,1,"One v49 controller stylesheet only");
   assert.equal(layout.duplicateJs+layout.duplicateCss,0,"Never reload competing v49 engine");
   assert.equal(layout.visibleHeadings.length,1,"Only one visible H1 in hero");
   assert(layout.visibleHeadings[0].className.includes("tle49-hook"),"Active H1 must be animated hook");
   assert.equal(layout.hintCount,1,"One disclaimer");
   assert.equal(layout.hintPointer,"none","Disclaimer must not intercept CTA");
   assert.equal(layout.galleryDisplay,"flex","Keep expanding flex photo panels");
   assert.equal(layout.panelCount,3,"Keep three real residential service buttons");
   assert.equal(layout.active,1,"Exactly one panel starts expanded");
   assert.equal(layout.quoteButtons,1,"Only one visible request-a-quote control");
   assert(layout.scrollOverflow<=8,"Page must not overflow horizontally: "+JSON.stringify(layout));
   const cta=page.locator("#leadHero .demo-hero-cta");
   await cta.scrollIntoViewIfNeeded();
   assert(await cta.isVisible(),"Original booking CTA must be visible");
   const hit=await cta.evaluate(el=>{
    const r=el.getBoundingClientRect();
    const x=r.left+r.width/2,y=r.top+r.height/2;
    const target=document.elementFromPoint(x,y);
    return {ok:!!target&&(target===el||el.contains(target)),
            blockedBy:target?.className||target?.tagName||null};
   });
   assert(hit.ok,"Hero CTA center blocked: "+JSON.stringify(hit));
   await page.screenshot({path:"qa-screenshots/demo-v49-guard/"+lang+"-"+width+"-hero.png"});
   await cta.click();
   await page.locator("html.tle-demo-booking-active").waitFor({state:"attached",timeout:9000});
   const cards=page.locator("#residentialServiceList>button.service.tle49-service-panel");
   assert.equal(await cards.count(),3,"Do not replace original booking service buttons");
   await cards.nth(1).scrollIntoViewIfNeeded();
   if(touch&&width<=412){
    await cards.nth(1).tap();
    assert.equal(await cards.nth(1).getAttribute("aria-expanded"),"true","First phone tap expands selected photo");
    assert(await page.locator("#main.on").isVisible(),"First phone tap must not book");
    await cards.nth(1).tap();
   }else if(touch){
    // Tablet may directly continue on tap; no mouse hover is required.
    await cards.nth(1).tap();
   }else{
    await cards.nth(1).hover();
    assert.equal(await cards.nth(1).getAttribute("aria-expanded"),"true","Desktop hover expands selected photo");
    await cards.nth(1).click();
   }
   await page.locator("#res.on").waitFor({state:"visible",timeout:9000});
   assert.deepEqual(pageErrors,[],"No browser JS errors");
   assert.deepEqual(writes,[],"Public sample navigation must not send a booking or API write");
   console.log("PASS v49 guard",lang,width,touch?"touch":"pointer");
  }catch(error){
   errors.push(lang+" "+width+" "+error.message);
   console.error("FAIL v49 guard",lang,width,error.message);
  }finally{await page.close()}
 }
 for(const suffix of ["?key=qa-private-test&lang=en","?owner_preview=1&lang=es"]){
  const page=await browser.newPage();
  try{
   await page.goto(base+"/lead-private-preview.html"+suffix,{waitUntil:"domcontentloaded",timeout:30000});
   assert.equal(await page.locator("html.tle-demo-v49").count(),0,"Never mount gallery in private/owner demos");
   assert.equal(await page.locator("#tle48Story").count(),0,"Never inject public sample editorial into private views");
   console.log("PASS private isolation",suffix);
  }catch(error){errors.push("private "+suffix+" "+error.message)}
  finally{await page.close()}
 }
}finally{await browser.close()}
if(errors.length){console.error(errors.join("\n"));process.exit(1)}
