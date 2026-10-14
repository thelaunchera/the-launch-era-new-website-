import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const team=readFileSync("supabase/functions/tle-ai-team/index.ts","utf8");
const owner=readFileSync("supabase/functions/tle-jessy-owner/index.ts","utf8");
const block=(src,start,end)=>{const a=src.indexOf(start);assert.ok(a>=0,"Missing "+start);const b=src.indexOf(end,a+start.length);assert.ok(b>a,"Missing end "+end);return src.slice(a,b)};
const fallback=block(team,"function reviewedTemplate(","function templatePlan(");
const sales=block(fallback," sales: es","\n projects:");
const care=block(fallback," care: es","\n };");
for(const [role,text] of [["Sales",sales],["Care",care]]){
 assert.match(text,/\? "/,role+" missing Spanish branch");
 assert.match(text,/: "/,role+" missing English branch");
 assert.match(text,/\\n\\n/,role+" needs readable paragraph breaks");
 assert.doesNotMatch(text,/\\\\n/,role+" has double-escaped line breaks");
}
assert.match(sales,/Asunto:/);
assert.match(sales,/Subject:/);
assert.match(care,/Asunto:/);
assert.match(care,/Subject:/);
assert.match(team,/Speak naturally and specifically/);
assert.match(team,/Do not force a question into every response/);
assert.match(owner,/maximum 750 characters/);
assert.match(owner,/answer=clean\(j\.choices\?\.\[0\]\?\.message\?\.content,750\)/);
assert.doesNotMatch(owner,/Maximum 230 characters/);
assert.match(team,/Never fabricate numeric performance metrics/);
assert.match(owner,/Never request credentials/);
console.log("PASS: bilingual Sales/Care fallbacks, natural owner Jessie, safety boundaries");
