import assert from "node:assert/strict";
import vm from "node:vm";
import {readFileSync} from "node:fs";
const team=readFileSync("supabase/functions/tle-ai-team/index.ts","utf8");
const bubble=readFileSync("supabase/functions/tle-jessy-owner/index.ts","utf8");
const ui=readFileSync("public/command-center/assets/ai-team.js","utf8");
const ownerUi=readFileSync("public/command-center/assets/jessy-owner.js","utf8");
const page=readFileSync("public/command-center/ai-team.html","utf8");

assert.match(team,/if\(action==="team_brief"\)/);
assert.match(team,/if\(action==="capability_manifest"\)/);
assert.match(team,/const AI_EXTERNAL_ACTIONS_ENABLED=false;/);
assert.match(team,/Promise\.allSettled\(keys\.map\(agent=>performReadOnly\(ctx,agent,/);
assert.match(team,/if\(agent==="projects"\)return projectReview\(ctx,lang\)/);
assert.match(team,/if\(agent==="care"\)return careReview\(ctx,lang\)/);
const projectSource=team.slice(team.indexOf("async function projectReview("),team.indexOf("async function careReview("));
assert.match(projectSource,/tle_sales_workspace_id\.eq\./);
assert.doesNotMatch(projectSource,/"id=not\.is\.null"/);
assert.match(projectSource,/dbRead\("tle_ai_agent_orders","tle_sales_workspace_id=eq\."/);
const careSource=team.slice(team.indexOf("async function careReview("),team.indexOf("async function publicGet("));
assert.match(careSource,/workspace_id=eq\./);
assert.doesNotMatch(careSource,/"id=not\.is\.null"/);
assert.match(bubble,/const resolveProvider=\(\)=>/);
assert.match(bubble,/GROQ_API_KEY/);
assert.match(bubble,/provider\.url/);
assert.doesNotMatch(bubble,/fetch\("https:\/\/api\.openai\.com\/v1\/chat\/completions"/);
assert.match(bubble,/async function projectReadiness\(lang,workspace\)/);
assert.match(bubble,/tle_sales_workspace_id\.eq\./);
assert.doesNotMatch(bubble,/projectReadiness\(lang\)/);
assert.match(bubble,/rows\("tle_ai_agent_orders","tle_sales_workspace_id=eq\."/);
assert.match(bubble,/subject_id=in\.\(/);
assert.match(bubble,/async function ownerTeamBrief\(req,lang\)/);
assert.match(bubble,/Authorization:authorization/);
assert.match(bubble,/action:"team_brief"/);
assert.match(ui,/action:"team_brief"/);
assert.match(ui,/function renderTeamBrief\(\)/);
assert.match(ownerUi,/TLEAIOpsGateway\.brief\(\)/);
assert.match(page,/id="team-brief-reports"/);
// Reviewer regression fixture: an unresolved request is not necessarily in status 'open'.
const stStart=team.indexOf("function unresolvedSupportStatus(");
const stEnd=team.indexOf("async function careReview(",stStart);
assert.ok(stStart>=0&&stEnd>stStart,"shared support status predicate must exist");
const unresolved=vm.runInNewContext(team.slice(stStart,stEnd)+";unresolvedSupportStatus;");
const sample=["open","pending","needs_review","resolved","CLOSED",null];
assert.deepEqual(sample.map(x=>Boolean(unresolved(x))),[true,true,true,false,false,true]);
const teamBrief=team.slice(team.indexOf('if(action==="team_brief")'),team.indexOf('if(action==="scan")'));
const scan=team.slice(team.indexOf('if(action==="scan")'),team.indexOf('if(action==="plan")'));
assert.match(teamBrief,/open_support:care/,"team overview uses Care's unresolved count, not open-only");
assert.match(scan,/careReview\(ctx,/,"workspace scan uses same scoped Care predicate");
assert.doesNotMatch(teamBrief,/status=eq\.open/);
assert.doesNotMatch(scan,/status=eq\.open/);
// All new dashboard text must be retranslated when changing languages.
for(const key of ["eyebrow","title","micro","note","intro","checked","partial","noPriorities","briefPrefix"]){
 assert.match(ui,new RegExp(key+':'),"EN/ES dashboard text missing: "+key);
}
for(const id of ["team-overview-eyebrow","team-overview-title","team-overview-micro","team-overview-note"]){
 assert.match(page,new RegExp('id="'+id+'"'));
}
assert.match(ui,/factSpanish/);
assert.match(ui,/localFact\(y\.label\)/);
assert.match(ui,/if\(scan\?\.reports\)scan=null/,"changing language must clear stale summaries");
assert.match(teamBrief,/enes\(b\.language/,"priority actions translated at source for owner bubble");
console.log("PASS — mixed support-status fixture and EN/ES team dashboard localization");
console.log("PASS — owner-only unified briefing, tenant-scoped project/support sources, Groq provider and no external effects");
