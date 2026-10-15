/**
 * Regression QA for Jessy's FAQ and server routing.
 * Run: bun scripts/qa-jessy-reasoning.ts
 */
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import { FAQ, findFaq, fallbackFaq, knowledgeForModel } from "../supabase/functions/tle-jessy-chat/knowledge.ts";
const backend=readFileSync("supabase/functions/tle-jessy-chat/index.ts","utf8");
const frontend=readFileSync("public/assets/jessy-site.js","utf8");
const offers=JSON.parse(readFileSync("public/assets/jessy-offers.json","utf8")).offers;
assert.ok(FAQ.length>=35,"FAQ needs substantial coverage");
for(const service of ["general","booking","ai-booking","ai-followup","ai-business","cleaning-app","website","va","whatsapp"])
 assert.ok(FAQ.some(x=>x.service===service),"Missing FAQ: "+service);
assert.ok(FAQ.every(f=>f.en&&f.es&&f.topic&&f.keywords.length),"All FAQs must be bilingual/searchable");
assert.doesNotMatch(backend,/const explanation=isServiceExplanation\(message\)\?helpfulExplanation/);
assert.doesNotMatch(backend,/const appReply=!explanation&&id==="cleaning-app"\?appHelp/);
assert.match(backend,/const ai=fixed\?null:await aiResponse\(message,history,lang,catalog,id\|\|focus\)/);
assert.match(backend,/const fixed=priceQuestion\?answerPrice/);
assert.match(backend,/if\(tooSimilarAnswer\(finalReply,history,message\)\)/);
assert.match(backend,/fallbackFaq\(message,id,lang\)/);
assert.match(backend,/console\.warn\("jessy_ai_response_unavailable"/);
assert.match(backend,/max_tokens:230/);
assert.match(frontend,/history:previous/);
assert.ok(backend.includes("b.history.slice(-12)"),"Server must consider twelve recent messages");
assert.ok(frontend.includes("history.slice(-12)"),"Browser must forward twelve recent messages");
assert.ok(frontend.includes("Editable summary only"),"Human handoff should be editable and opt-in");
assert.ok(!backend.includes("$79 activation")&&!backend.includes("$119 activation")&&!backend.includes("Booking $19.99 en oferta"),"Stale fallback prices cannot be repeated");
assert.match(frontend,/selected_offer:offer\|\|currentPage\(\)/);
assert.doesNotMatch(backend,/sk-proj-/);
assert.doesNotMatch(readFileSync("supabase/functions/tle-jessy-chat/knowledge.ts","utf8"),/sk-proj-|Bearer /);
const helpers=backend.slice(backend.indexOf("function identify("),backend.indexOf("function wantsAiPlanComparison("));
const get=new Function("serviceIds","norm",helpers+";return {identify,asksPrice,answerPrice,tooSimilarAnswer,isBusinessCleaningPriceQuestion}");
const ids=new Set(["booking","ai-booking","ai-followup","ai-business","cleaning-app","website","va","whatsapp"]);
const normalize=(v:string)=>v.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
const {identify,asksPrice,answerPrice,tooSimilarAnswer,isBusinessCleaningPriceQuestion}=get(ids,normalize) as any;
const list=offers.map((x:any)=>[x.id,x.name,x.short_en,x.short_es,x.price_en,x.price_es,x.checkout||x.details]);
assert.equal(identify("How much?","booking","booking"),"booking");
assert.equal(identify("My website gets leads, but I forget to follow up","", ""),"website");
assert.equal(identify("Las consultas de mi sitio web se me pierden","", ""),"website");
assert.equal(identify("My clients and invoices are scattered","", ""),"cleaning-app");
assert.equal(identify("¿Cuánto cuesta?","ai-business","ai-booking"),"ai-business");
assert.equal(identify("And what about invoices?","booking","booking"),"cleaning-app");
assert.equal(identify("Can I change my follow-ups?","booking","booking"),"booking");
assert.equal(identify("What does AI Follow-Up Assistant do?","booking","booking"),"ai-followup");
assert.equal(identify("How much?","ai-plans","ai-booking"),"ai-booking");
assert.equal(asksPrice("How much?"),true);
assert.equal(asksPrice("¿Cuánto cuesta?"),true);
assert.equal(asksPrice("And how much per month?"),true);
assert.equal(asksPrice("How does Booking work?"),false);
assert.equal(isBusinessCleaningPriceQuestion("How much to clean a house?"),true);
const answer=answerPrice("How much?","en",list,"booking");
assert.ok(answer.includes(offers.find((x:any)=>x.id==="booking").price_en));
assert.ok(!answer.includes("A customer sends a cleaning request"));
assert.ok(answerPrice("¿Cuánto cuesta?","es",list,"ai-followup").includes("$29"));
assert.equal(tooSimilarAnswer("The same exact description of booking requests",[
 {role:"assistant",message:"The same exact description of booking requests"},
 {role:"user",message:"How does booking work?"}
],"How much?"),true);
assert.equal(tooSimilarAnswer("This is a new, different price answer",[{role:"assistant",message:"Some earlier booking description"}],"How much?"),false);
for(const [question,service,language,topic] of [
 ["How many hours does VA include?","va","en","hours"],
 ["¿Acepta Zelle?","cleaning-app","es","payments"],
 ["Can I install it on an iPad?","cleaning-app","en","devices"],
 ["What if the AI follows up without consent?","ai-followup","en","permission"],
 ["How can I edit my cleaning rates?","booking","en","manage"],
 ["Can you redesign my entire website?","website","en","scope"],
 ["¿Qué incluye el plan completo de asistentes?","ai-business","es","bundle"],
 ["How does the Command Center work?","booking","en","command"],
 ["Is WhatsApp AI for sale now?","whatsapp","en","status"],
 ["¿Puedo solicitar un reembolso?","general","es","refunds"],
 ["¿Cuánto tardan en configurar?","general","es","production"],
 ["¿Y las cotizaciones?","cleaning-app","es","quotes"]
] as const){
 const found=findFaq(question,service,5);
 assert.ok(found.some(x=>x.topic===topic),"FAQ mismatch: "+question+" "+service+" -> "+found.map(x=>x.topic).join(", "));
 assert.ok(fallbackFaq(question,service,language),"Missing fallback: "+question);
 const facts=knowledgeForModel(question,service,language);
 assert.ok(facts.includes("RELEVANT ANSWERS"),"Missing grounding");
}
console.log("PASS Jessy contextual FAQ: "+FAQ.length+" bilingual entries, follow-ups, service switching and anti-repetition");
