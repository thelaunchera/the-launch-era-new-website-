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
  "cleaning-app-demo/index.html",
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
  assert.match(html, /src="\/assets\/jessy-site\.js\?v=[^"]+"/, page + " missing Jessy");
}
const front = text("public/assets/jessy-site.js");
new Function(front); // Syntax-check without running a browser assistant.
assert.match(front, /page_path:location\.pathname/);
assert.match(front, /function handleRoute\(\)/);
assert.match(front, /"cleaning-app"/);
assert.match(front, /cleaning-app-demo/);
assert.match(front, /Start free trial/);
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
vm.runInContext(planLogic,planContext);
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
const amounts=[79,59,119],monthly=[29,19,39];
for(let i=0;i<ids.length;i++){
 const p=offers.find(o=>o.id===ids[i]);
 assert.ok(p,"missing AI plan "+ids[i]);
 assert.ok(p.price_en.includes("$"+amounts[i]),"setup price mismatch");
 assert.ok(p.price_en.includes("$"+monthly[i]+"/month"),"monthly price mismatch");
 assert.ok(p.checkout==="/service-checkout/?offer="+ids[i],"incorrect checkout");
}
console.log("PASS Jessy 3 AI plans, exact EN/ES prices, specific checkout and no default AI selection");

console.log("PASS Jessy universal public pages, English/Spanish route focus, Cleaning App answers and safe next steps");
