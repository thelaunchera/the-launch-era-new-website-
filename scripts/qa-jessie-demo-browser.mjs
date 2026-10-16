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
  await page.route("**/functions/v1/tle-jessy-chat",route=>{
   const msg=String(route.request().postDataJSON()?.message||"").toLowerCase();
   const app=msg.includes("cleaning app"),all=msg.includes("all demos")||msg.includes("todas las demos");
   const result=app
    ?{reply:"The Cleaning App demo is open to everyone without a form.",selected_offer:"cleaning-app",next_action:"app_demo",checkout:null}
    :all
      ?{reply:"Here's our Booking Automation demo.",selected_offer:"",next_action:"demo_choice",checkout:null}
      :{reply:lang==="es"?"¡Claro! Te muestro la demo de reservas.":"Sure! Here's the original booking sample demo.",selected_offer:"booking",next_action:"demo",checkout:null};
   return route.fulfill({status:200,contentType:"application/json",headers:{"access-control-allow-origin":"*"},body:JSON.stringify(result)});
  });
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
  assert.equal(await page.locator(".tle-jessy-demo-card").count(),1,"Booking conversation should show exactly one demo card");
  await page.locator(".tle-jessy-demo-card").first().click();
  assert.equal(await page.locator(".tle-jessy-demo-gate").isVisible(),true,"Three-field demo gate should show");
  assert.equal(await page.locator(".tle-jessy-demo-frame").count(),0,"No embedded demo anywhere in Jessie");
  assert.equal(await page.locator(".tle-jessy-demo-confirmation").isVisible(),false,"Do not confirm before submitting");
  assert.equal(await page.locator(".tle-jessy-demo-label").count(),3);
  await page.locator(".tle-jessy-demo-label input").nth(0).fill("Sunshine Cleaning QA");
  await page.locator(".tle-jessy-demo-label input").nth(1).fill("fixture@example.test");
  await page.locator(".tle-jessy-demo-label input").nth(2).fill("Boynton Beach 33436");
  await page.locator(".tle-jessy-demo-submit").click();
  await page.waitForTimeout(200);
  assert.equal(requests.length,0,"Must not submit without explicit consent");
  await page.locator(".tle-jessy-demo-consent input").check();
  await page.locator(".tle-jessy-demo-submit").click();
  await page.locator(".tle-jessy-demo-confirmation").waitFor({state:"visible",timeout:12000});
  assert.equal(await page.locator(".tle-jessy-demo-gate").isVisible(),false,"Form disappears after confirmation");
  assert.equal(requests.length,1,"Exactly one consented transactional demo request");
  assert.equal(requests[0].consent,true);
  assert.equal(requests[0].business_name,"Sunshine Cleaning QA");
  assert.equal(requests[0].email,"fixture@example.test");
  assert.equal(requests[0].service_area,"Boynton Beach 33436");
  assert.equal(await page.locator(".tle-jessy-demo-frame").count(),0,"Never show an interactive sample in the chat");
  assert.equal(await page.locator(".tle-jessy-demo-external").count(),0,"Never reveal the personalized demo URL in Jessie");
  const banner=await page.locator(".tle-jessy-demo-confirmation").innerText();
  assert.match(banner,lang==="es"?/correo/i:/email|inbox/i,"Confirmation should direct visitor to their inbox");
  assert.match(banner,/Sonny/,"Jessie reminds them to try Sonny in the email demo");
  assert.match(banner,lang==="es"?/simulación/i:/simulation/i,"Sonny does not create real bookings");
  const w=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,width:innerWidth}));
  assert.ok(w.scroll<=w.width+4,lang+"/"+width+": horizontal overflow "+JSON.stringify(w));
  await page.screenshot({path:"qa-screenshots/jessie-demo-"+lang+"-"+width+".png"});
  await page.locator(".tle-jessy-demo-done").click();
  assert.equal(await page.locator(".tle-jessy-demo-overlay").isVisible(),false);
  assert.equal(await page.locator(".tle-jessy-panel").isVisible(),true,"Conversation is preserved after closing demo");
  assert.ok((await page.locator(".tle-jessy-log").innerText()).includes("Sonny"),"Jessie says to try Sonny in the existing chat");
  await page.locator(".tle-jessy-demo-card").first().click();
  assert.equal(await page.locator(".tle-jessy-demo-confirmation").isVisible(),true,"Returning to the card shows confirmation; do not repeat form");
  await page.locator(".tle-jessy-demo-done").click();
  assert.equal(requests.length,1,"Reopening a confirmation never resends the email");
  const beforeOtherDemo=await page.locator(".tle-jessy-demo-card").count();
  await page.locator(".tle-jessy-message-field").fill(lang==="es"?"Muéstrame todas las demos":"Show me all demos");
  await page.locator(".tle-jessy-send").click();
  await page.waitForFunction(n=>document.querySelectorAll(".tle-jessy-demo-card").length>n,beforeOtherDemo);
  assert.equal(await page.locator(".tle-jessy-demo-card").count(),beforeOtherDemo+1,"Generic demos must show Booking only, not a second Cleaning App card");
  assert.equal(await page.locator(".tle-jessy-demo-card").last().innerText().then(t=>/Cleaning App/i.test(t)),false);
  await page.locator(".tle-jessy-message-field").fill("Can I see the Cleaning App demo?");
  await page.locator(".tle-jessy-send").click();
  await page.locator(".tle-jessy-help-link[href^='/cleaning-app-demo/']").waitFor({timeout:12000});
  assert.equal(await page.locator(".tle-jessy-demo-card").count(),beforeOtherDemo+1,"Cleaning App never triggers a capture card");
  assert.equal(requests.length,1,"Cleaning App preview must not submit another lead form");

  assert.equal(errors.length,0,lang+"/"+width+": "+errors.join("; "));
  tested.push(lang+"/"+width);await context.close();
 }
 console.log("PASS synthetic Jessie emailed demo: opt-in fields, on-site confirmation, no embedded sample, Sonny sample reminder, bilingual responsive UI, chat preserved — "+tested.join(", "));
}finally{await browser.close();await new Promise(resolve=>http.close(resolve))}
