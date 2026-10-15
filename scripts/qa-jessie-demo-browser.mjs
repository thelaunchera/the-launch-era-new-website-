// Responsive Jessie conversion QA. Entirely local sample page, mock email and mock chat.
// NO production submissions, no real leads, no Resend sends.
import {chromium} from "playwright";
import assert from "node:assert/strict";
import {createServer} from "node:http";
import {existsSync,readFileSync,statSync,mkdirSync} from "node:fs";
import {resolve,extname,sep} from "node:path";
const root=resolve("public");
const mime={".css":"text/css; charset=utf-8",".js":"application/javascript; charset=utf-8",".json":"application/json; charset=utf-8",".png":"image/png",".webp":"image/webp",".html":"text/html; charset=utf-8"};
const html='<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;background:#faf8f3"><main style="max-width:750px;margin:15vh auto;padding:22px"><h1>The Launch Era</h1><p>Sample test host, no real booking</p></main><script src="/assets/jessy-site.js" defer></script></body></html>';
const http=createServer((req,res)=>{
 const uri=new URL(req.url,"http://127.0.0.1"),path=decodeURIComponent(uri.pathname);
 if(path==="/"||path==="/es/"){res.writeHead(200,{"content-type":"text/html; charset=utf-8"});res.end(html);return}
 if(path==="/lead-private-preview.html"||path==="/cleaning-app-demo/"){res.writeHead(200,{"content-type":"text/html; charset=utf-8"});res.end("<!doctype html><title>Safe sample mock</title><p>Sample experience only, no booking</p>");return}
 let file=resolve(root,"."+path);if(!file.startsWith(root+sep)&&file!==root){res.writeHead(403).end();return}
 if(existsSync(file)&&statSync(file).isDirectory())file=resolve(file,"index.html");
 if(!existsSync(file)){res.writeHead(404).end();return}
 res.writeHead(200,{"content-type":mime[extname(file)]||"application/octet-stream"});res.end(readFileSync(file));
});
await new Promise(resolve=>http.listen(0,"127.0.0.1",resolve));
const base="http://127.0.0.1:"+http.address().port;
mkdirSync("qa-screenshots",{recursive:true});
const browser=await chromium.launch({headless:true});const tested=[];
try{
 for(const lang of ["en","es"])for(const width of [390,820,1440]){
  const context=await browser.newContext({viewport:{width,height:width<600?844:900}});
  const page=await context.newPage(),requests=[],errors=[];
  page.on("pageerror",e=>errors.push(String(e)));
  await page.route("**/functions/v1/tle-jessy-chat",route=>route.fulfill({status:200,contentType:"application/json",headers:{"access-control-allow-origin":"*"},body:JSON.stringify({reply:lang==="es"?"¡Claro! Te muestro la demo de ejemplo.":"Sure! Here's the original sample demo.",selected_offer:"booking",next_action:"demo",checkout:null})}));
  await page.route("**/functions/v1/tle-jessie-demo-lead",route=>{
   const body=route.request().postDataJSON();requests.push(body);
   return route.fulfill({status:200,contentType:"application/json",headers:{"access-control-allow-origin":"*"},body:JSON.stringify({ok:true,saved:true,email_sent:true,service:"Booking Automation"})});
  });
  await page.route("**/functions/v1/tle-jessie-metrics",route=>route.fulfill({status:200,contentType:"application/json",headers:{"access-control-allow-origin":"*"},body:'{"ok":true}'}));
  await page.goto(base+(lang==="es"?"/es/":"/"),{waitUntil:"domcontentloaded"});
  await page.locator(".tle-jessy-fab").click();
  await page.locator(".tle-jessy-message-field").fill(lang==="es"?"¿Puedes mostrarme la demo de reservas?":"Can you show me the booking demo?");
  await page.locator(".tle-jessy-send").click();
  await page.locator(".tle-jessy-demo-card").first().waitFor({timeout:12000});
  await page.locator(".tle-jessy-demo-card").first().click();
  assert.equal(await page.locator(".tle-jessy-demo-gate").isVisible(),true,"Three-field demo gate should show");
  assert.equal(await page.locator(".tle-jessy-demo-frame").isVisible(),false,"No demo before visitor submits");
  assert.equal(await page.locator(".tle-jessy-demo-label").count(),3);
  await page.locator(".tle-jessy-demo-label input").nth(0).fill("Sunshine Cleaning QA");
  await page.locator(".tle-jessy-demo-label input").nth(1).fill("fixture@example.test");
  await page.locator(".tle-jessy-demo-label input").nth(2).fill("Boynton Beach 33436");
  await page.locator(".tle-jessy-demo-submit").click();
  await page.waitForTimeout(200);
  assert.equal(requests.length,0,"Must not submit without explicit consent");
  await page.locator(".tle-jessy-demo-consent input").check();
  await page.locator(".tle-jessy-demo-submit").click();
  await page.locator(".tle-jessy-demo-frame").waitFor({state:"visible",timeout:12000});
  assert.equal(requests.length,1,"One visitor-approved demo request");
  assert.equal(requests[0].consent,true);
  assert.equal(requests[0].business_name,"Sunshine Cleaning QA");
  assert.equal(requests[0].email,"fixture@example.test");
  assert.equal(requests[0].service_area,"Boynton Beach 33436");
  const demo=await page.locator(".tle-jessy-demo-frame").getAttribute("src");
  assert.ok(demo.startsWith("/lead-private-preview.html?"),"Original safe sample route required");
  assert.ok(demo.includes("business=Sunshine+Cleaning+QA")&&demo.includes("area=Boynton+Beach+33436"));
  assert.ok(!demo.includes("email=")&&!demo.includes("key="),"No email/private token in preview URL");
  const w=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,width:innerWidth}));
  assert.ok(w.scroll<=w.width+4,lang+"/"+width+": horizontal overflow "+JSON.stringify(w));
  await page.screenshot({path:"qa-screenshots/jessie-demo-"+lang+"-"+width+".png"});
  await page.locator(".tle-jessy-demo-close").click();
  assert.equal(await page.locator(".tle-jessy-demo-overlay").isVisible(),false);
  assert.equal(await page.locator(".tle-jessy-panel").isVisible(),true,"Conversation is preserved after closing demo");
  assert.equal(errors.length,0,lang+"/"+width+": "+errors.join("; "));
  tested.push(lang+"/"+width);await context.close();
 }
 console.log("PASS synthetic Jessie demo gate: 3 fields, explicit consent, original sample, no identity in URL, bilingual responsive UI, chat preserved — "+tested.join(", "));
}finally{await browser.close();await new Promise(resolve=>http.close(resolve))}
