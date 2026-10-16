/** Current editorial visual QA for the public fictional cleaning demo.
 * The v42 request RETIRED the category switch, midnight panels, hero calendar
 * and savings control. Preserve actual behavior and client isolation checks.
 * No form submissions, emails, payments or live booking writes.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||"playwright");
const base=(process.env.QA_URL||"http://127.0.0.1:4173").replace(/\/$/,"");
fs.mkdirSync("qa-screenshots/demo-v7",{recursive:true});
const browser=await chromium.launch({headless:true});
const failures=[];
try{
 for(const lang of ["en","es"]){
  for(const width of [360,390,768,1024,1440]){
   const page=await browser.newPage({viewport:{width,height:900},deviceScaleFactor:1,reducedMotion:"reduce"});
   const errors=[],writes=[];
   page.on("pageerror",e=>errors.push(e.message));
   page.on("request",r=>{if(["POST","PUT","PATCH","DELETE"].includes(r.method()))writes.push(r.url());});
   try{
    await page.goto(base+"/lead-private-preview.html?business=Sample%20Cleaning&area=Miami&lang="+lang,{waitUntil:"load",timeout:30000});
    await page.locator("html.tle-demo-v42").waitFor({state:"attached",timeout:16000});
    const state=await page.evaluate(()=>{
     const $=s=>document.querySelector(s);
     const visible=sel=>{const e=$(sel);return !!e&&e.getBoundingClientRect().height>0&&getComputedStyle(e).display!=="none"};
     const scene=$("#leadHero"),heroImage=$("#leadHero .demo-cb-hero-media img");
     const res=$("#residentialServiceList"),com=$("#commercialServiceList");
     const rect=sel=>$(sel)?.getBoundingClientRect();
     const progress=$(".tle-client-progress-step"),headline=$("#bookingStarter #title");
     return {
      classes:document.documentElement.className,screenWidth:innerWidth,scrollWidth:document.documentElement.scrollWidth,
      heroImage:heroImage?.complete&&heroImage?.naturalWidth>600,
      heroCTA:visible("#leadHero .demo-hero-cta"),
      portal:visible("#leadHero .tle-v42-window"),
      oldTabs:!!$("#categoryTabs"),oldCalendar:!!$("#tle41HeroBooking"),oldSavings:!!$("#tle41Frequency"),
      headline:headline?.textContent,headlineColor:headline?getComputedStyle(headline).color:null,
      progressColor:progress?getComputedStyle(progress).color:null,
      label:$("#main>.label")?.textContent,
      resVisible:visible("#residentialServiceList"),comVisible:visible("#commercialServiceList"),
      photoCount:document.querySelectorAll("#bookingStarter .tle-service-photo-v21 img").length,
      homeCards:res?.querySelectorAll("button.service.tle-service-has-photo-v21").length,
      businessCards:com?.querySelectorAll("button.service.tle-service-has-photo-v21").length,
      reviewCards:document.querySelectorAll("#tleDemoReviews .tle-v36-review-card").length,
      comparison:document.querySelectorAll("#tleV31GalleryRail .tle-v31-gallery-card").length,
      chapterOrder:(()=>{const a=$("#tleV31Transformations"),b=$("#tleDemoReviews");return !!(a&&b&&(a.compareDocumentPosition(b)&Node.DOCUMENT_POSITION_FOLLOWING))})(),
      serviceOverflow:[...document.querySelectorAll("#bookingStarter .tle-service-has-photo-v21")].filter(x=>x.getBoundingClientRect().width>innerWidth+1).length,
      customerPreview:""+new URLSearchParams(location.search).get("key")
     };
    });
    assert(state.heroImage&&state.portal&&state.heroCTA,"Hero photo, existing CTA and window zoom must remain available: "+JSON.stringify(state));
    assert(!state.oldTabs&&!state.oldCalendar&&!state.oldSavings,"Rejected UI returned: "+JSON.stringify(state));
    assert(!/what kind of space/i.test(state.label||""),"Obsolete technical question visible");
    assert(state.resVisible&&state.comVisible&&state.homeCards===3&&state.businessCards>=2,"Both visual service collections must be visible: "+JSON.stringify(state));
    assert(state.photoCount>=7&&state.reviewCards>=4&&state.comparison===3&&state.chapterOrder,"Photos, comparisons or honest example reviews missing: "+JSON.stringify(state));
    assert(state.scrollWidth<=width+8&&state.serviceOverflow===0,"Service/card overflow: "+JSON.stringify(state));
    await page.screenshot({path:"qa-screenshots/demo-v7/"+lang+"-"+width+"-services.png",fullPage:false});
    await page.locator("#leadHero .tle-v42-window").click();
    await page.locator("html.tle-demo-booking-active").waitFor({state:"attached",timeout:5000});
    const ink=await page.evaluate(()=>{
      const color=s=>{const el=document.querySelector(s);return el?getComputedStyle(el).color:null};
      return {title:color("#bookingStarter #title"),progress:color(".tle-client-progress-step"),step:color("#bookingStarter #count")};
    });
    if(width===360&&lang==="en"){
     const debug=await page.evaluate(()=>{
      const el=document.getElementById("title"),progress=document.querySelector(".tle-client-progress-step");
      const rule='html.demo-editorial.tle-demo-v42.tle-demo-booking-active #bookingStarter .head #title';
      return {htmlClass:document.documentElement.className,titleHTML:el?.outerHTML.slice(0,260),
        titleInline:el?.style.cssText,progressHTML:progress?.outerHTML.slice(0,250),
        matches:el?.matches(rule),
        inkCSS:[...document.styleSheets].filter(s=>s.href?.includes("booking-ink-v43")).map(s=>({url:s.href,count:s.cssRules?.length})),
        actualColor:getComputedStyle(el).color,
        fill:getComputedStyle(el).webkitTextFillColor,
        rules:[...document.styleSheets].filter(s=>s.href?.includes("booking-ink-v43")).flatMap(s=>[...s.cssRules].slice(0,8).map(r=>r.selectorText||r.cssText.slice(0,130)))};
     });
     console.log("V43_INK_DIAGNOSTIC",JSON.stringify(debug));
    }
    const brightness=s=>{const m=s?.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);return m?.length?Number(m[1])*.2126+Number(m[2])*.7152+Number(m[3])*.0722:256;};
    assert(brightness(ink.title)<165&&brightness(ink.progress)<165&&brightness(ink.step)<165,
      "Dark foreground is required on the pale booking canvas: "+JSON.stringify(ink));
    await page.locator("#commercialServiceList button.service.tle-service-has-photo-v21").first().click();
    await page.locator("#commercial.on").waitFor({state:"visible",timeout:6000});
    assert.equal(await page.locator("#tle-v42-picker-cdate .tle-v42-date-trigger").count(),1,"Business date picker must be in form");
    await page.locator("#commercial button.back").first().click();
    await page.locator("#main.on").waitFor({state:"visible",timeout:6000});
    await page.locator("#residentialServiceList button.service.tle-service-has-photo-v21").first().click();
    await page.locator("#res.on").waitFor({state:"visible",timeout:6000});
    assert.equal(await page.locator("#tle-v42-picker-date .tle-v42-date-trigger").count(),1,"Home date picker must be in form");
    assert.equal(await page.locator("#tle-v42-picker-date .tle-v42-cal").isVisible(),false,"Calendar must stay closed until visitor chooses a date");
    await page.locator("#tle-v42-picker-date .tle-v42-date-trigger").click();
    assert.equal(await page.locator("#tle-v42-picker-date .tle-v42-cal").isVisible(),true,"Calendar should open within the selected service");
    await page.locator("#tle-v42-picker-date .tle-v42-cal-grid button:enabled").first().click();
    assert.match(await page.locator("#date").inputValue(),/^\d{4}-\d{2}-\d{2}$/);
    assert.deepEqual(errors,[],"Unexpected browser errors");
    assert.deepEqual(writes,[],"Sample UI must not send any network write");
    console.log("PASS editorial v42",lang,width);
   }catch(e){failures.push(lang+" "+width+": "+e.message);console.error("FAIL editorial",lang,width,e.message);}
   finally{await page.close();}
  }
 }
 for(const mode of ["?key=qa-invalid-key","?owner_preview=1"]){
  const page=await browser.newPage();
  try{
   await page.goto(base+"/lead-private-preview.html"+mode,{waitUntil:"load",timeout:30000});
   assert.equal(await page.locator("html.tle-demo-v42").count(),0,"Private/customer pages must never mount v42");
   assert.equal(await page.locator(".tle-v42-date-picker").count(),0,"Do not inject sample calendars into private pages");
   console.log("PASS isolated",mode);
  }catch(e){failures.push("isolation "+mode+": "+e.message)}finally{await page.close();}
 }
}finally{await browser.close()}
if(failures.length){console.error(failures.join("\n"));process.exit(1)}
