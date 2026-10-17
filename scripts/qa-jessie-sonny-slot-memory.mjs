import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import ts from "typescript";
const source=readFileSync("supabase/functions/tle-ai-booking-demo/index.ts","utf8");
const from=source.indexOf("function bookingDraft(raw:unknown)");
const to=source.indexOf("function localDate()",from);
assert.ok(from>0&&to>from,"Sonny booking draft helpers should exist");
const code=source.slice(from,to);
const result=ts.transpileModule(code,{
 fileName:"sonny-helpers.ts",reportDiagnostics:true,compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.None}
});
assert.equal((result.diagnostics||[]).filter(d=>d.category===ts.DiagnosticCategory.Error).length,0,"Sonny TypeScript helper parse errors");
const helpers=Function("const clean=(x,max=400)=>String(x??'').trim().slice(0,max);"+
 result.outputText+";return {bookingDraft,explicitDetails,shortNumericAnswer,safePublicReply,nextAction,repeatedQuestion,requestSummary};")();
const prior=helpers.bookingDraft({category:"residential",property_type:"House",bedrooms:3,bathrooms:null,service:"deep",frequency:"weekly"});
const extracted=helpers.explicitDetails("I have a 3 bedroom house and 2 bathrooms. Weekly deep cleaning.",prior);
assert.deepEqual({category:extracted.category,property_type:extracted.property_type,bedrooms:extracted.bedrooms,bathrooms:extracted.bathrooms,frequency:extracted.frequency,service:extracted.service},
 {category:"residential",property_type:"House",bedrooms:3,bathrooms:2,frequency:"weekly",service:"deep"});
const draft={...prior,...extracted};
assert.equal(helpers.repeatedQuestion("How many bedrooms are there?",draft),true);
assert.equal(helpers.repeatedQuestion("How many bathrooms are there?",draft),true);
assert.match(helpers.nextAction(draft,"en"),/ZIP/,"Sonny should ask for the NEXT missing answer, not bedrooms or bathrooms again");
assert.match(helpers.nextAction(draft,"es"),/código postal/);
const change=helpers.explicitDetails("Actually, 4 bedrooms. Make that biweekly.",draft);
assert.equal(change.bedrooms,4);
assert.equal(change.frequency,"biweekly");
const sum=helpers.requestSummary({...draft,...change},"en");
assert.equal(sum.bedrooms,4);assert.equal(sum.bathrooms,2);assert.equal(sum.frequency,"biweekly");
assert.equal(sum.status,"draft");
assert.equal(sum.space,"House");
assert.ok(!("email" in sum)&&!("phone" in sum),"Public visual summary must not expose personal fields");
const commercial=helpers.explicitDetails("It's a restaurant, around 2500 square feet, every week",helpers.bookingDraft({}));
assert.equal(commercial.category,"commercial");
assert.equal(commercial.commercial_space_type,"Other");
assert.equal(commercial.commercial_space_description,"Restaurant");
assert.equal(commercial.square_feet,2500);
assert.equal(commercial.frequency,"weekly");
assert.match(source,/msg\.length<1/, "Single-number visitor answers must be accepted by the API");
assert.deepEqual(helpers.shortNumericAnswer("5","Visitor: It's a house\\nAssistant: Great—how many bedrooms does the house have?"),{bedrooms:5});
assert.deepEqual(helpers.shortNumericAnswer("2","Visitor: 5\\nAssistant: And how many bathrooms?"),{bathrooms:2});
assert.deepEqual(helpers.shortNumericAnswer("5","Visitor: What can you do?"),{}, "Do not guess a field without a matching previous question");
const longNatural="I can answer cleaning questions, remember your details and prepare a sample booking request so the business owner doesn't need to chase messages.";
assert.equal(helpers.safePublicReply(longNatural,"What can you help with?",draft,"en"),longNatural,
 "Preserve helpful AI-generated replies instead of replacing them with canned questions");
assert.match(source,/booking_created:false,email_sent:false/);
const client=readFileSync("public/assets/tle-ai-booking-chat.js","utf8");
assert.doesNotThrow(()=>new Function(client));
assert.match(client,/tle-ai-sample-summary/);
assert.match(client,/sampleSummary\.hidden=true;sampleSummary\.remove/);
assert.match(client,/window\.tleAIBookingPrefill/);
assert.match(client,/NOT SUBMITTED/);
console.log("PASS Sonny: confirmed slot memory, corrections, bilingual next questions, sanitized summary, simulation-only");
