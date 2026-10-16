// Synthetic Sonny QA: never places bookings, sends mail or saves leads.
import assert from "node:assert/strict";
import {createServer} from "node:http";
import {readFileSync,mkdirSync} from "node:fs";
import {chromium} from "playwright";
const code=readFileSync("public/assets/tle-ai-booking-chat.js","utf8");
const sample='<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body><h1>Sample cleaning demo</h1><script src="/sonny.js"></script></body></html>';
const server=createServer((req,res)=>{
 res.setHeader("content-type",req.url==="/sonny.js"?"application/javascript":"text/html; charset=utf-8");
 res.end(req.url==="/sonny.js"?code:sample);
});
await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
const host="http://127.0.0.1:"+server.address().port;
const browser=await chromium.launch({headless:true});
mkdirSync("qa-screenshots",{recursive:true});
try{
 for(const lang of ["en","es"])for(const width of [390,820,1440]){
  const ctx=await browser.newContext({viewport:{width,height:width<500?844:900}});
  const page=await ctx.newPage();const errors=[];let requests=0;
  page.on("pageerror",error=>errors.push(error.message));
  await page.addInitScript(()=>{window.tleAIBookingPrefill=draft=>{window.__lastSampleDraft=draft;return true};});
  await page.route("**/functions/v1/tle-ai-booking-demo",async route=>{
   requests++;
   const payload=route.request().postDataJSON();
   assert.equal(payload.thread_id.length>10,true);
   assert.equal(payload.booking_draft&&typeof payload.booking_draft==="object",true);
   const booking={service:"deep",category:"residential",property_type:"House",bedrooms:3,bathrooms:2,frequency:"weekly",zip:"33436",date:"",time:"",square_feet:null};
   const summary={service:"deep",space:"House",frequency:"weekly",missing:[],status:"draft"};
   await route.fulfill({status:200,contentType:"application/json",headers:{"access-control-allow-origin":"*"},body:JSON.stringify({reply:lang==="es"?"Ya tengo tus detalles. Revisa el ejemplo.":"Got it. Review your sample below.",booking,summary,ready_for_review:true,mode:"demo_only",booking_created:false,email_sent:false})});
  });
  await page.goto(host+"/?lang="+lang+"&business=Demo%20Cleaning",{waitUntil:"domcontentloaded"});
  await page.locator(".tle-ai-launch").click();
  await page.locator(".tle-ai-form textarea").fill(lang==="es"?"Casa de 3 habitaciones y 2 baños, limpieza profunda semanal.":"3-bedroom house, 2 bathrooms, weekly deep cleaning.");
  await page.locator(".tle-ai-form button").click();
  await page.locator(".tle-ai-sample-summary").waitFor({state:"visible",timeout:10000});
  assert.equal(requests,1);
  const card=page.locator(".tle-ai-sample-summary");
  const content=await card.innerText();
  for(const str of ["House","3","2","weekly"])assert.ok(content.includes(str),lang+"/"+width+": missing "+str);
  assert.match(content,/NOT SUBMITTED|NO ENVIADA/);
  assert.equal(await card.locator(".tle-ai-sample-continue").isVisible(),true);
  const bounds=await card.evaluate(el=>({rect:el.getBoundingClientRect().toJSON(),vw:innerWidth,scroll:document.documentElement.scrollWidth}));
  assert.ok(bounds.rect.width<=bounds.vw-15&&bounds.scroll<=bounds.vw+2,"Summary overflows at "+lang+"/"+width);
  await page.screenshot({path:"qa-screenshots/sonny-memory-"+lang+"-"+width+".png"});
  await page.locator(".tle-ai-review").click();
  assert.equal(await card.isVisible(),true,"Review button should reveal summary, not skip to form");
  await card.locator(".tle-ai-sample-continue").click();
  const filled=await page.evaluate(()=>window.__lastSampleDraft);
  assert.equal(filled.bedrooms,3);assert.equal(filled.bathrooms,2);
  assert.equal(filled.frequency,"weekly");assert.equal(filled.service,"deep");
  assert.equal(await page.locator(".tle-ai-panel").isVisible(),false);
  await page.evaluate(()=>window.tleOpenSonnyDemo({restart:true}));
  assert.equal(await card.count(),0,"Restart removes old summary");
  assert.equal(await page.locator(".tle-ai-review").isVisible(),false);
  assert.equal(errors.length,0,"Browser errors: "+errors.join("; "));
  await ctx.close();
 }
 console.log("PASS Sonny EN/ES at 390, 820, 1440: visual summary, review, sample prefill, reset, no overflow");
}finally{await browser.close();await new Promise(resolve=>server.close(resolve))}
