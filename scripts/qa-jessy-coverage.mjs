import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const text = (path) => readFileSync(path, "utf8");
const root = text("src/routes/__root.tsx");
assert.match(root, /<script src="\/assets\/jessy-site\.js\?v=[^"]+" defer \/>/);

const publicPages = [
  "ai-booking-assistant/index.html",
  "es/ai-booking-assistant/index.html",
  "whatsapp-ai-agent/index.html",
  "es/whatsapp-ai-agent/index.html",
  "booking-demo/index.html",
  "privacy.html",
  "es/privacy.html",
  "terms.html",
  "es/terms.html",
  "automation-terms/index.html",
  "es/automation-terms/index.html",
  "va-terms/index.html",
  "es/va-terms/index.html",
];
for (const page of publicPages) {
  const html = text("public/" + page);
  assert.match(html, /src="\/assets\/jessy-site\.js\?v=[^"]+"/, page + " missing Jessie");
}
// The Cleaning App sample workspace is embedded multiple times. No Jessie in its iframes.
const appSample = text("public/cleaning-app-demo/index.html");
assert.doesNotMatch(appSample, /<script\s+src="\/assets\/jessy-site\.js/);
const showcase = text("src/components/cleaning-app-showcase.tsx");
assert.match(showcase, /cleaning-app-demo\/\?lang=\$\{lang\}&embedded=1/);

const front = text("public/assets/jessy-site.js");
new Function(front); // Syntax-check without running a browser assistant.

assert.match(front, /if\(location\.pathname\.replace\(\/\\\/\+\$\/,""\)==="\/cleaning-app-demo"\|\|window\.self!==window\.top\)return/);
assert.match(front, /function actions\(checkout,detail,trial\)/);
assert.match(front, /options\.slice\(0,2\)/);
assert.match(front, /Get started/);
assert.match(front, /How it works/);
assert.match(front, /Could you walk me through how this service works/);
assert.match(front, /See the demo/);
assert.doesNotMatch(front.slice(front.indexOf("function actions("),front.indexOf("function showAiPlanChoices(")),/View checkout|Explore service/);
const actionsCode=front.slice(front.indexOf("function actions("),front.indexOf("function showAiPlanChoices("));
function simulateActions(checkout,detail,trial){
 const container={children:[],appendChild(x){this.children.push(x)}};
 const log={children:[],appendChild(x){this.children.push(x)},scrollTop:0,scrollHeight:100};
 const events=[];
 function node(tag,cls,label){
  return {tag,cls,label,children:[],attrs:{},appendChild(x){this.children.push(x)},
    setAttribute(k,v){this.attrs[k]=v},addEventListener(name,fn){this["on"+name]=fn}};
 }
 const button=(cls,label)=>node("button",cls,label);
 const routeFor=(href)=>href&&href.startsWith("/")?href:href==="https://app.thelaunchera.com/?entry=signup"?href:null;
 const track=(what)=>events.push(what);
 const ask=(what)=>events.push("ask:"+what);
 const fn=new Function("node","button","routeFor","log","lang","track","ask",actionsCode+";return actions");
 fn(node,button,routeFor,log,"en",track,ask)(checkout,detail,trial);
 return {links:log.children.flatMap(r=>r.children.map(c=>({tag:c.tag,label:c.label,url:c.href,click:c.onclick,css:c.cls,attrs:c.attrs}))),events};
}
const regular=simulateActions("/service-checkout/?offer=ai-booking","/ai-booking-assistant/",null);
assert.equal(regular.links.length,2);
assert.equal(regular.links[0].label,"Get started");
assert.equal(regular.links[0].url,"/service-checkout/?offer=ai-booking");
assert.equal(regular.links[0].attrs["aria-label"],"Continue to this service's checkout");
assert.equal(regular.links[1].tag,"button");
assert.equal(regular.links[1].label,"How it works");
regular.links[1].click();
assert.ok(regular.events.some(e=>e.startsWith("ask:Could you walk me through")));
const appActions=simulateActions(null,"/cleaning-app-demo/?lang=en","https://app.thelaunchera.com/?entry=signup");
assert.equal(appActions.links.length,2);
assert.equal(appActions.links[0].label,"Try it free");
assert.equal(appActions.links[1].label,"See the demo");
assert.equal(appActions.links[1].url,"/cleaning-app-demo/?lang=en");
const chatCss=text("public/assets/jessy-site.css");
assert.match(chatCss, /\.tle-jessy-inline \.tle-jessy-action-primary/);
assert.match(chatCss, /\.tle-jessy-inline \.tle-jessy-action-secondary/);
assert.match(chatCss, /min-height:44px/);
assert.match(chatCss, /background:#dcefff/);
assert.match(chatCss, /background:#faf8f3/);
console.log("PASS Jessie is excluded from sample iframes; warm CTAs route to correct destinations");

assert.match(front, /page_path:location\.pathname/);
assert.match(front, /function handleRoute\(\)/);
assert.match(front, /"cleaning-app"/);
assert.match(front, /cleaning-app-demo/);
assert.match(front, /Try it free/); // Updated, clearer button label
const contextFunction = front.slice(front.indexOf("function currentPage()"), front.indexOf("let lang="));
for (const [path, expected] of [
  ["/", ""],
  ["/cleaning-web-app", "cleaning-app"],
  ["/es/cleaning-web-app/", "cleaning-app"],
  ["/cleaning-app-demo/", "cleaning-app"],
  ["/booking-lead-automation", "booking"],
  ["/es/ai-booking-assistant", "ai-booking"],
  ["/website-automation", "website"],
]) {
  const box = { location: { pathname: path } };
  vm.createContext(box);
  vm.runInContext(contextFunction + ";contextResult=currentPage();", box);
  assert.equal(box.contextResult, expected, path);
}

// Welcome + scroll-collapse behavior must work on both desktop and mobile.
assert.match(front, /fabLabel=node\("span","tle-jessy-fab-label"/);
assert.match(front, /fab\.setAttribute\("aria-expanded"/);
assert.match(front, /window\.addEventListener\("scroll",updateJessyScroll,\{passive:true\}\)/);
assert.match(front, /if\(!open&&!compact&&window\.scrollY<=36\)/);
assert.match(front, /nudge\.textContent=t\("nudge"\)/);
assert.match(front, /if\(!compact&&window\.scrollY>36\)collapseJessyLauncher\(\)/);
const scrollBlock = front.slice(front.indexOf("let compact=false;"),front.indexOf('reloadOffers();track("loaded");'));
assert.ok(scrollBlock.startsWith("let compact=false;"),"Scroll initialization missing");
function simulateJessyScroll(startY){
 const listeners={},timers=[],classes=new Set(),attributes={};
 const box={
  window:{scrollY:startY,addEventListener:(k,fn,opt)=>{listeners[k]=fn;if(k==="scroll")assert.equal(opt.passive,true)}},
  root:{classList:{add:name=>classes.add(name)}},
  fab:{setAttribute:(k,v)=>{attributes[k]=v}},
  nudge:{hidden:true,textContent:""},
  lang:"en",open:false,track:()=>{},
  t:()=> "Chat with the assistant",
  setTimeout:(fn)=>{timers.push(fn)}
 };
 vm.createContext(box);
 vm.runInContext(scrollBlock,box);
 return {box,listeners,timers,classes,attributes};
}
const entry=simulateJessyScroll(0);
assert.equal(entry.classes.has("tle-jessy-compact"),false,"Scroll flag starts unset; CSS already renders a round launcher");
assert.equal(entry.timers.length,1);
entry.timers[0]();
assert.equal(entry.box.nudge.hidden,false,"Jessie must greet new visitors");
entry.box.window.scrollY=40;
entry.listeners.scroll();
assert.equal(entry.classes.has("tle-jessy-compact"),true,"Scroll must collapse Jessie to avatar");
assert.equal(entry.box.nudge.hidden,true,"No greeting nudge while scrolling");
assert.equal(entry.attributes.title,"Chat with the assistant");
entry.box.window.scrollY=0;entry.listeners.scroll();
assert.equal(entry.classes.has("tle-jessy-compact"),true,"Do not expand/flicker during scroll");
const scrollingEarly=simulateJessyScroll(0);
scrollingEarly.box.window.scrollY=55;
scrollingEarly.listeners.scroll();
scrollingEarly.timers[0]();
assert.equal(scrollingEarly.box.nudge.hidden,true,"No late greeting after scroll");
const deepLink=simulateJessyScroll(95);
assert.equal(deepLink.classes.has("tle-jessy-compact"),true,"Already scrolled pages should start compact");
const css = text("public/assets/jessy-site.css");
assert.match(css, /\.tle-jessy-root\.tle-jessy-compact \.tle-jessy-fab/);
assert.match(css, /width:52px;height:52px;min-height:52px/);
assert.match(css, /width:50px;height:50px;min-height:50px/);
assert.match(css, /max-width:0;width:0;padding:0;margin:0;opacity:0;visibility:hidden/);
assert.ok(!css.includes(".tle-jessy-root.tle-jessy-compact .tle-jessy-nudge{display:none!important}"),"Round launcher must allow generic greeting");
assert.ok(front.includes('node("div","tle-jessy-root tle-jessy-compact")'),"Launcher must be round before any scroll");
assert.ok(front.includes('launcherPhoto.alt=""'),"Outside portrait has no personal-name alt label");
console.log("PASS Jessie welcome nudge and scroll-to-face-only launcher on desktop and mobile");

const backend = text("supabase/functions/tle-jessy-chat/index.ts");
assert.match(backend, /const focus=pageOffer\(b\.page_path\)/);
assert.match(backend, /id==="cleaning-app"\?"\/cleaning-app-demo/);
assert.match(backend, /trial:id==="cleaning-app"/);
assert.match(backend, /function appHelp/);

// AI pricing: generic questions must show ALL 3 approved plans before any checkout.
assert.match(front, /function showAiPlanChoices\(plans\)/);
assert.match(front, /result\.ai_plans/);
assert.match(front, /Compare 3 plans/);
assert.match(front, /ai_plan_checkout_/);
const planLogic = backend.slice(backend.indexOf("function wantsAiPlanComparison("),backend.indexOf("async function offers(){"));
const planContext = { norm: (s) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"") };
vm.createContext(planContext);
const actualPriceLogic=backend.slice(backend.indexOf("function asksPrice("),backend.indexOf("function isBusinessCleaningPriceQuestion(",backend.indexOf("function asksPrice(")));
vm.runInContext(actualPriceLogic+planLogic,planContext);
const requests = [
 ["Which AI Assistants do you offer?","ai-booking","ai-booking",true],
 ["¿Qué asistentes de IA ofrecen?","ai-booking","ai-booking",true],
 ["AI assistants","","",true],
 ["Asistentes IA","","",true],
 ["What are the prices?","ai-booking","ai-booking",true],
 ["checkout","ai-plans","ai-booking",true],
 ["AI Booking Assistant price","ai-plans","ai-booking",false],
 ["I want the AI Follow-Up Assistant","ai-plans","ai-booking",false],
 ["What does Booking Automation include?","booking","booking",false],
];
for (const [message,previous,focus,expected] of requests)
 assert.equal(planContext.wantsAiPlanComparison(message,previous,focus),expected,message);
const offers=JSON.parse(text("public/assets/jessy-offers.json")).offers;
const ids=["ai-booking","ai-followup","ai-business"];
const amounts=[49,29,69],monthly=[19,12,25];
for(let i=0;i<ids.length;i++){
 const p=offers.find(o=>o.id===ids[i]);
 assert.ok(p,"missing AI plan "+ids[i]);
 assert.ok(p.price_en.includes("$"+amounts[i]),"setup price mismatch");
 assert.ok(p.price_en.includes("$"+monthly[i]+"/month"),"monthly price mismatch");
 assert.ok(p.checkout==="/service-checkout/?offer="+ids[i],"incorrect checkout");
}
console.log("PASS Jessie 3 AI plans, exact EN/ES prices, specific checkout and no default AI selection");


/* Information-first chat: explain real steps, no repeating the same checkout/learn CTAs. */
assert.match(front,/const next=result.next_action/);
assert.match(front,/if\(next==="checkout"&&checkout\)/);
assert.match(front,/else if\(next==="trial"&&result.trial\)/);
assert.match(front,/if\(next==="demo"&&offer==="booking"\)showDemoCard\("booking"\)/);
assert.match(front,/else if\(next==="demo"&&offer!=="booking"&&info\)/);
assert.match(front,/demoGate\.addEventListener\("submit"/);
assert.match(front,/data\.email_sent!==true/);
assert.match(front,/Check your email for your personalized demo/);
assert.match(front,/Don.t forget to try a live booking with my friend Sonny/);
assert.match(front,/simulation, not a real booking/);
assert.doesNotMatch(front,/tle-jessy-demo-frame/,"Jessie must never embed the emailed demo");
assert.match(front,/service_area:demoArea\.value\.trim\(\)/);
assert.doesNotMatch(front,/if\(!showAiPlanChoices\(result\.ai_plans\)&&\(checkout\|\|info\|\|result\.trial\)\)/);
assert.doesNotMatch(front,/actions\(null,"\/solutions"\)/);
assert.match(backend,/function isServiceExplanation\(message\)/);
assert.match(backend,/function helpfulExplanation\(id,lang\)/);
assert.match(backend,/function helpfulNextAction\(message,id\)/);
assert.match(backend,/const nextAction=priceQuestion/);
assert.match(backend,/next_action:nextAction/);
assert.match(backend,/mode:fixed\?"verified_price":ai\?"reasoned_ai":knowledge\?"verified_faq"/);
const explanations=backend.slice(backend.indexOf("function isServiceExplanation("),backend.indexOf("function guide("));
const knowledge= {};
vm.createContext(knowledge);
vm.runInContext("function norm(s){return s.toLowerCase().normalize('NFD').replace(/[\\u0300-\\u036f]/g,'')}"+explanations,knowledge);
for(const q of ["Could you walk me through how this service works?","How does Booking Automation work?","¿Me explicas cómo funciona?","What does Booking Automation include?","¿Qué incluye este servicio?"]){
 assert.equal(knowledge.isServiceExplanation(q),true,q);
 assert.equal(knowledge.helpfulNextAction(q,"booking"),"demo",q); // Explanations now offer the original sample in chat, after explicit demo contact consent.
}
for(const [id,word] of [["booking","customer"],["cleaning-app","invoice"],["ai-booking","booking"],["ai-followup","leads"],["ai-business","assistant"],["website","inquiry"],["va","hours"]]){
 const answer=knowledge.helpfulExplanation(id,"en");
 assert.ok(answer.toLowerCase().includes(word),id+" must explain a specific feature");
 assert.ok(answer.length>=90 && answer.length<350,id+" must be clear and concise");
 assert.ok(!/what would you like to know|here.s the idea/i.test(answer),id+" may not be canned");
 const es=knowledge.helpfulExplanation(id,"es");
 assert.ok(es.length>=60 && es.length<350,id+" Spanish text should be useful");
}
assert.equal(knowledge.helpfulNextAction("Can I see the booking demo?","booking"),"demo");
assert.equal(knowledge.helpfulNextAction("How do I start my free trial?","cleaning-app"),"trial");
assert.equal(knowledge.helpfulNextAction("Where can I checkout?","booking"),"checkout");
assert.equal(knowledge.helpfulNextAction("How much does it cost?","booking"),"none");
console.log("PASS Jessie detailed service answers, bilingual helpful content, and consent-gated original demo after explanations");

console.log("PASS Jessie universal public pages, English/Spanish route focus, Cleaning App answers and safe next steps");
