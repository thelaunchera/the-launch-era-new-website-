/** Regression: public service push/pop and edge swipe. No POSTs or live bookings. */
import assert from "node:assert/strict";
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||"playwright");
const base=(process.env.QA_URL||"http://127.0.0.1:4173").replace(/\/$/,"");
const browser=await chromium.launch({headless:true});
try{
 for(const [lang,width] of [["en",360],["en",390],["es",820],["en",1440]]){
  const page=await browser.newPage({viewport:{width,height:900},reducedMotion:"reduce"});
  const errors=[];page.on("pageerror",e=>errors.push(e.message));
  await page.goto(base+"/lead-private-preview.html?lang="+lang,{waitUntil:"domcontentloaded"});
  await page.waitForSelector(".tle-stack-stage");
  assert.equal(await page.locator("#main.on").count(),1,"chooser must start visible");
  assert.equal(await page.locator("#res[inert]").count(),1,"inactive pages must be inert");
  await page.locator("#residentialServiceList button.service").first().click();
  await page.waitForSelector("#res.on");
  await page.waitForTimeout(260);
  assert.equal(await page.locator("#main[inert]").count(),1,"chooser must become inert");
  assert.equal(await page.evaluate(()=>document.activeElement?.id),"title","focus new heading");
  await page.locator("#homes button").first().click();
  await page.locator("#res button.next").click();
  const details=await page.evaluate(()=>{
    const p=document.querySelector("#resReview");
    const r=p?.getBoundingClientRect();
    const on=[...document.querySelectorAll("#bookingStarter .screen.on")].map(x=>x.id);
    const block=document.querySelector("#tleV30Tasksres");
    return {active:on,reviewClass:p?.className,reviewDisplay:p&&getComputedStyle(p).display,
      reviewRect:r&&{w:r.width,h:r.height},stageHeight:document.querySelector(".tle-stack-stage")?.style.height,
      home:typeof state!=="undefined"?state.home:null,
      otherChecked:block?.querySelector('[data-other="1"]')?.checked,
      errors:[...document.querySelectorAll("#res [role=alert]")].map(x=>x.textContent).filter(Boolean)};
  });
  console.log("NAV DEBUG "+lang+" "+width+" "+JSON.stringify(details));
  if(!details.active.includes("resReview")){
    const why=await page.evaluate(()=>{
      const btn=document.querySelector("#res button.next");
      const stateBefore={screen:[...document.querySelectorAll("#bookingStarter .screen.on")].map(p=>p.id),inert:document.querySelector("#res")?.inert};
      try{window.reviewResidential()}catch(e){return {stateBefore,callError:String(e),button:btn?.outerHTML}}
      return {stateBefore,after:[...document.querySelectorAll("#bookingStarter .screen.on")].map(p=>p.id),
        home:state.home,button:btn?.outerHTML,onclick:btn?.onclick?.toString()?.slice(0,280),
        override:String(window.reviewResidential).slice(0,400)};
    });
    console.log("NAV DIRECT "+lang+" "+width+" "+JSON.stringify(why));
  }
  assert(details.active.includes("resReview") && details.reviewRect?.h>0,
    "Review request must be shown and measured: "+JSON.stringify(details));
  await page.waitForTimeout(250);
  await page.locator("#resReview button.back").click();
  await page.waitForSelector("#res.on");
  await page.waitForTimeout(250);
  assert.equal(await page.locator("#homes button.sel").count(),1,"edit must retain home selection");
  // Pointer sequence simulates a left-edge touch; velocity/distance pops to chooser.
  await page.evaluate(()=>{
    const stage=document.querySelector(".tle-stack-stage");
    for(const [type,x] of [["pointerdown",12],["pointermove",98],["pointermove",190],["pointermove",320],["pointerup",340]]){
      stage.dispatchEvent(new PointerEvent(type,{bubbles:true,cancelable:true,isPrimary:true,
        pointerId:17,pointerType:"touch",button:0,clientX:x,clientY:420}));
    }
  });
  await page.waitForTimeout(450);
  assert.equal(await page.locator("#main.on").count(),1,"edge swipe must return to chooser");
  assert.equal(await page.locator("#res[inert]").count(),1,"popped page must become inert");
  // Rapid successive steps must update the active screen synchronously.
  await page.evaluate(()=>{
    startQuote("estimate");
    show("done","Request received","✓");
  });
  assert.equal(await page.locator("#done.on").count(),1,"rapid step changes must not stall");
  assert.equal(errors.length,0,"browser errors: "+errors.join(", "));
  // Real-client/owner preview must never mount sample-only navigation.
  await page.goto(base+"/lead-private-preview.html?key=isolated-fixture&lang="+lang,{waitUntil:"domcontentloaded"});
  assert.equal(await page.locator(".tle-stack-stage").count(),0,"keyed view must be untouched");
  await page.close();
 }
 console.log("PASS: public service push, edit pop, touch swipe, focus and keyed isolation");
}finally{await browser.close()}
