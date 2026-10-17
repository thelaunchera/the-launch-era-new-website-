// Regression: broad "What can you help me with?" questions must never fall back
// to "I don't have that confirmed". Deterministic, offline; no customer data/writes.
import fs from "node:fs";
import vm from "node:vm";
import assert from "node:assert/strict";

const source=fs.readFileSync(new URL("../supabase/functions/tle-jessy-chat/index.ts",import.meta.url),"utf8");
const start=source.indexOf("function asksAboutJessie(message){");
const end=source.indexOf("function wantsAiPlanComparison(",start);
assert.ok(start>=0&&end>start,"Jessie capabilities handler must exist");
const norm=v=>v.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
const {asksAboutJessie,jessieCapabilitiesReply}=vm.runInNewContext(
  source.slice(start,end)+"\n({asksAboutJessie,jessieCapabilitiesReply})",
  {norm}
);
const yes=[
  "Que puedes ayudarme hoy",
  "¿En qué me puedes ayudar?",
  "¿Qué puedes hacer?",
  "¿Cómo me puedes ayudar con mi negocio?",
  "How can you help me?",
  "What can you help me with today?",
  "What do you do?",
  "What services do you offer?"
];
const no=[
  "¿Cómo puedo editar mis facturas?",
  "¿Me puedes ayudar con una reserva?",
  "How much is Booking Automation?",
  "¿Cuánto cuesta el plan IA?",
  "How do follow-ups work?"
];
for(const question of yes)assert.equal(asksAboutJessie(question),true,"Missing overview for: "+question);
for(const question of no)assert.equal(asksAboutJessie(question),false,"Should keep topical answer for: "+question);
for(const lang of ["en","es"]){
  const answer=jessieCapabilitiesReply(lang);
  for(const topic of ["Booking Automation","Cleaning App","Website Automation","VA"]){
    if(topic)assert.ok(answer.includes(topic),"Missing "+topic+" in "+lang+" response");
  }
  assert.ok(!/not confirmed|no lo tengo confirmado|don't know|no se/.test(answer),"Generic fallback reached");
}
assert.ok(source.indexOf("if(asksAboutJessie(message))")<source.indexOf("if(wantsAiPlanComparison(message,prior,focus))"),"Capability introduction must come before AI plan comparison");
const widget=fs.readFileSync(new URL("../public/assets/jessy-site.js",import.meta.url),"utf8");
assert.ok(widget.includes('if(typeof result.selected_offer==="string")offer=result.selected_offer;'),"Widget must clear stale offer after general introduction");
// A concise answer must remain COMPLETE on the server and in the website widget.
const serverStart=source.indexOf("function compactAiReply(input){");
const serverEnd=source.indexOf("function helpfulNextAction(",serverStart);
assert.ok(serverStart>=0&&serverEnd>serverStart,"Public AI reply formatter is missing");
const compactAiReply=vm.runInNewContext(source.slice(serverStart,serverEnd)+"\ncompactAiReply");
const widgetStart=widget.indexOf("function conciseText(text,mode){");
const widgetEnd=widget.indexOf("function showCheckoutOptions(",widgetStart);
assert.ok(widgetStart>=0&&widgetEnd>widgetStart,"Public widget formatter is missing");
const conciseText=vm.runInNewContext(widget.slice(widgetStart,widgetEnd)+"\nconciseText");
const complete=[
 "Booking Automation receives cleaning inquiries through your booking page.",
 "The details stay organized so you can review requests and follow up instead of looking through scattered messages.",
 "You still approve the final price and booking, so nothing is confirmed without your review."
].join(" ").repeat(2);
assert.ok(complete.length>310&&complete.length<720,"QA fixture must exceed the previous clipping threshold");
assert.equal(compactAiReply(complete),complete,"Server must not cut a valid, complete reply");
assert.equal(conciseText(complete,"reasoned_ai"),complete,"Website must preserve the full answer");
assert.equal(conciseText(complete,"verified_price"),complete,"Pricing replies must remain complete");
assert.ok(widget.includes("const limit=words.length;"),"Typing animation must show all words, not jump after 32");
assert.ok(!source.includes("if(explainCall)finalReply+="),"Avoid unsolicited 1:1 call add-on");
assert.ok(source.includes('if(choice?.finish_reason==="length")return null;'),"Handle incomplete AI generation safely");
console.log("Jessie capabilities and full-reply QA passed: "+(yes.length+no.length)+" intents, two languages.");
