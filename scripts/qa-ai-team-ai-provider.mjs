import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import vm from "node:vm";
const api=readFileSync("supabase/functions/tle-ai-team/index.ts","utf8");
const ui=readFileSync("public/command-center/assets/ai-team.js","utf8");
const html=readFileSync("public/command-center/ai-team.html","utf8");
const jessie=readFileSync("public/command-center/assets/jessy-owner.js","utf8");
assert.match(api,/if\(action==="provider_check"\)/);
assert.ok(api.indexOf("ctx=await auth(req)")<api.indexOf('if(action==="provider_check")'),"provider check only after server owner auth");
assert.match(api,/OPENAI_API_KEY/);
assert.ok(api.includes('reason:ok?"connected":"empty_response"'));
assert.doesNotMatch(api,/AI content service is not configured/);
assert.match(api,/generation_mode="template"/);
assert.match(api,/content=reviewedTemplate/);
assert.match(api,/generation_mode==="ai"/);
assert.match(api,/if\(!plan\)plan=templatePlan/);
assert.match(api,/generation_mode:|"generation_mode"/);
assert.match(html,/id="ai-provider-check"/);
assert.match(ui,/action:"provider_check"/);
assert.match(ui,/output\.generation_mode==="template"/);
assert.match(ui,/tx\("draftTemplate"\)/);
assert.match(jessie,/result\?\.generation_mode==="template"/);
assert.doesNotMatch(ui,/OPENAI_API_KEY/);
assert.doesNotMatch(html,/OPENAI_API_KEY/);
const a=api.indexOf("function reviewedTemplate("),b=api.indexOf("const ROLE_SYSTEM",a);
assert.ok(a>=0 && b>a,"fallback generator source found");
const generate=vm.runInNewContext(api.slice(a,b)+";reviewedTemplate;");
for(const agent of ["jessie","sales","projects","developer","qa","creative","care"]){
 const draft=generate(agent,"es","");
 assert.ok(draft.length>80,"usable fallback for "+agent);
 assert.doesNotMatch(draft,/OPENAI_API_KEY|sk-proj-/i);
}
const sales=generate("sales","es","");
assert.match(sales,/\[First Name\]/);
assert.match(sales,/\[Business\]/);
// Keep Jessie, Sales and Projects instructions grounded and human.
assert.match(api,/const ROLE_SYSTEM=\\{/);
assert.match(api,/const humanHint=\\{/);
// Regression: these three specialists must stay human and evidence-based.
assert.match(api,/Give the owner a short, warm, direct answer first/);
assert.match(api,/what is still unknown and needs checking/);
assert.match(api,/Write one short, warm email/);
assert.match(api,/do not invent tools, 24\/7 booking, calendar integrations/);
assert.match(api,/The draft is never sent/);
assert.match(api,/what has actually been confirmed, what is missing/);
assert.match(api,/Block handoff until the correct brand/);
console.log("PASS — AI provider check owner-only, generated provenance, honest offline templates, no embedded secret");
