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
 return data;
}

const question="I have a cleaning business. My existing website gets inquiries, but I forget to follow up. What would help?";
const first=await ask("English pain-point discovery",question);
assert.equal(first.selected_offer, "website", "Inquiries lost through the existing website should target Website Automation");
const price=await ask("English context price","How much does that cost?",{
  selected:first.selected_offer,
  history:[{role:"user",message:question},{role:"assistant",message:first.reply}]
});
assert.equal(price.selected_offer, "website", "A short price follow-up must preserve the selected service");
assert.match(price.reply,/\$41\.99/, "Price must agree with the approved published catalog");
assert.ok(!/\$79 activation|\$119 activation/.test(price.reply),"Avoid stale AI prices");
const spanish=await ask("Spanish capabilities","¿En qué me puedes ayudar?",{lang:"es",path:"/es/"});
assert.equal(spanish.mode,"capabilities","A broad capabilities request must get actual information");
assert.match(spanish.reply,/Booking Automation|Cleaning App|Website Automation/);
const privateCheck=await ask("Private workspace boundary","Can you see other customers' private Command Center data?");
assert.equal(privateCheck.mode,"privacy","Never claim private workspace access");
console.log(JSON.stringify({results:tests},null,2));
console.log("PASS: Jessie public endpoint returned synthetic EN/ES replies with safe context and privacy boundaries.");
