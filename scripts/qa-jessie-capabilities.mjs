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
console.log("Jessie capabilities QA passed: "+(yes.length+no.length)+" intents, two languages.");
