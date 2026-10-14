import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import vm from "node:vm";
const js=readFileSync("public/command-center/assets/ai-team.js","utf8");
const html=readFileSync("public/command-center/ai-team.html","utf8");
const css=readFileSync("public/command-center/assets/ai-team.css","utf8");
for(const id of ["owner-diagnostic","owner-diagnostic-title","owner-diagnostic-run","owner-diagnostic-copy","owner-diagnostic-results","owner-diagnostic-disclaimer"]){
 assert.ok(html.includes('id="'+id+'"'),"Missing diagnostic control: "+id);
}
assert.match(js,/async function verifyOwnerSession\(\)/);
assert.match(js,/api\(\{action:"capability_manifest"\}\)/);
assert.match(js,/api\(\{action:"team_brief",language\}\)/);
assert.match(js,/api\(\{action:"provider_check"\}\)/);
assert.match(js,/permission\?\.external_actions_enabled===false/);
assert.match(js,/brief\?\.no_external_actions===true/);
assert.match(js,/ownerCheck=null;try\{localStorage\.setItem/);
assert.match(js,/function renderOwnerCheck\(\)/);
assert.match(js,/ownerCheckCopy=\{/);
assert.match(css,/ait-owner-diagnostic-results/);
assert.match(css,/@media\(max-width:700px\)/);
const start=js.indexOf("function sanitizedOwnerReport(){"),end=js.indexOf("async function verifyOwnerSession(){",start);
assert.ok(start>0&&end>start,"Safe report function must be present");
const fixture={timestamp:"2026-10-14T10:00:00.000Z",language:"es",viewportWidth:390,
 login:true,roles:true,permissions:true,model:false,provider:"unverified",agentCount:7,partial:2,
 access_token:"FORBIDDEN_SECRET_FIXTURE",owner_email:"private@example.invalid",
 client_name:"PRIVATE_CLIENT_FIXTURE",customer_records:["PRIVATE_RECORD_FIXTURE"]};
const result=vm.runInNewContext("const ownerCheck="+JSON.stringify(fixture)+";\n"+js.slice(start,end)+";sanitizedOwnerReport();");
const parsed=JSON.parse(result);
assert.equal(parsed.owner_session_verified,true);
assert.equal(parsed.ai_provider_responded,false);
assert.equal(parsed.partial_agent_reports,2);
assert.equal(parsed.language,"es");
assert.doesNotMatch(result,/FORBIDDEN_SECRET_FIXTURE|private@example|PRIVATE_CLIENT_FIXTURE|PRIVATE_RECORD_FIXTURE/);
assert.match(result,/cross-tenant.*not verified/i);
const uiTranslation=js.slice(js.indexOf("const ownerCheckCopy={"),js.indexOf("function oc(",js.indexOf("const ownerCheckCopy={")));
for(const lang of ["en:","es:"])assert.ok(uiTranslation.includes(lang),"QA panel localization "+lang+" missing");
console.log("PASS — owner panel read-only checks, bilingual UI, sanitized report and responsive layout");
