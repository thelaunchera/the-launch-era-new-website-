// Synthetic public-chat smoke checks. Never sends contact forms, orders, customer data,
// subscriptions or checkout requests. Intended for manual GitHub Actions QA.
import assert from "node:assert/strict";

const URL = "https://bowacxhmjvrqixtwaikv.supabase.co/functions/v1/tle-jessy-chat";
const tests = [];
async function ask(label, message, opts = {}) {
 const payload = { message, language: opts.lang || "en", selected_offer: opts.selected || "", page_path: opts.path || "/", history: opts.history || [] };
 const res = await fetch(URL, {
  method: "POST",
  headers: { "content-type": "application/json", "origin": "https://thelaunchera.com" },
  body: JSON.stringify(payload),
  signal: AbortSignal.timeout(16000)
 });
 const data = await res.json().catch(() => ({}));
 assert.equal(res.status,200,`${label}: HTTP ${res.status} / ${String(data.error || "").slice(0,80)}`);
 assert.equal(typeof data.reply, "string", `${label}: Missing reply`);
 assert.ok(data.reply.length>20, `${label}: Unexpectedly short reply`);
 assert.ok(!/(unknown error|internal server error|Assistant unavailable)/i.test(data.reply), `${label}: Generic backend failure`);
 const result={label,mode:data.mode,selected_offer:data.selected_offer,reply:data.reply.slice(0,450),next_action:data.next_action};
 tests.push(result);
 console.log(JSON.stringify(result));
 return data;
}

const question="I have a cleaning business. My existing website gets inquiries, but I forget to follow up. What would help?";
const first=await ask("English pain-point discovery",question);
assert.equal(first.mode,"reasoned_ai","A public visitor must receive an actual AI answer, not only a scripted FAQ");
assert.equal(first.selected_offer, "website", "Inquiries lost through the existing website should target Website Automation");
const price=await ask("English context price","How much does that cost?",{
  selected:first.selected_offer,
  history:[{role:"user",message:question},{role:"assistant",message:first.reply}]
});
assert.equal(price.selected_offer, "website", "A short price follow-up must preserve the selected service");
assert.match(price.reply,/\$35(?![\d.])/, "Website Automation must match the approved $35 published price");
assert.doesNotMatch(price.reply,/\$41\.99|\$31\.99/, "Jessie must not quote retired Website Automation prices");
assert.ok(!/\$79 activation|\$119 activation/.test(price.reply),"Avoid stale AI prices");
const spanish=await ask("Spanish capabilities","¿En qué me puedes ayudar?",{lang:"es",path:"/es/"});
assert.equal(spanish.mode,"capabilities","A broad capabilities request must get actual information");
assert.match(spanish.reply,/reservas|clientes|seguimientos/i);
assert.ok(spanish.reply.length<180,"Keep the introduction short");
const privateCheck=await ask("Private workspace boundary","Can you see other customers' private Command Center data?");
assert.equal(privateCheck.mode,"privacy","Never claim private workspace access");
// Post-purchase 20-minute consultation is a buyer onboarding benefit, NEVER presales.
const call=await ask("English 1:1 call eligibility","Si you offer 1:1 call ?",{selected:"booking"});
assert.equal(call.mode,"verified_call");
assert.equal(call.next_action,"none");
assert.match(call.reply,/after purchasing a service/i);
assert.match(call.reply,/optional/i);
assert.match(call.reply,/not required/i);
assert.doesNotMatch(call.reply,/request one here|book your call|schedule your call now/i);
assert.ok(!call.reply.includes("**"),"Chat reply must remain plain text");
const callEs=await ask("Spanish 1:1 call eligibility","¿Ofrecen llamada 1:1 de 20 minutos?",{lang:"es",selected:"booking",path:"/es/"});
assert.equal(callEs.mode,"verified_call");
assert.equal(callEs.next_action,"none");
assert.match(callEs.reply,/después de comprar un servicio/i);
assert.match(callEs.reply,/opcional/i);
assert.match(callEs.reply,/no es obligatoria/i);
const how=await ask("English service walkthrough","How does Booking Automation work?",{selected:"booking"});
assert.doesNotMatch(how.reply,/20-minute 1:1 call|after purchasing a service/i,"Do not add an unrequested sales call");
assert.ok(["none","demo"].includes(how.next_action),"Walkthrough may offer the existing demo");
const howEs=await ask("Spanish service walkthrough","¿Cómo funciona Booking Automation?",{lang:"es",selected:"booking",path:"/es/"});
assert.doesNotMatch(howEs.reply,/llamada 1:1 opcional|después de comprar un servicio/i,"No agregar llamadas no solicitadas");
assert.ok(["none","demo"].includes(howEs.next_action),"Walkthrough may offer the existing demo");
const ready=await ask("Ready to purchase Booking Automation","I'm ready to buy Booking Automation",{selected:"booking"});
assert.equal(ready.mode,"purchase_ready");
assert.equal(ready.next_action,"checkout");
assert.match(ready.checkout,/^\/service-checkout\/\?offer=booking-flow&lang=en/);
assert.match(ready.reply,/Hurray!.*We’re happy to assist you.*See you inside!/s);
const readyEs=await ask("Lista para comprar","Estoy lista para comprar",{lang:"es",selected:"booking",path:"/es/booking-lead-automation"});
assert.equal(readyEs.mode,"purchase_ready");
assert.equal(readyEs.next_action,"checkout");
assert.match(readyEs.reply,/¡Hurra!.*Nos alegra ayudarte.*¡Nos vemos dentro!/s);
const info=await ask("Info only - no demo","How does Booking Automation work?",{selected:"booking"});
assert.equal(info.next_action,"none","Ordinary questions must not automatically open demos");
const justPrice=await ask("Price only - no checkout","How much?",{selected:"booking"});
assert.notEqual(justPrice.next_action,"checkout","Pricing questions are not purchase intent");
const notReady=await ask("Not ready, asks for demo","Not ready to buy, show me the demo",{selected:"booking"});
assert.notEqual(notReady.mode,"purchase_ready","Do not send someone hesitant to checkout");

console.log(JSON.stringify({results:tests},null,2));
console.log("PASS: Jessie public endpoint returned synthetic EN/ES replies with safe context and privacy boundaries.");
