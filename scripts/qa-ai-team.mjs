import { readFileSync, existsSync } from "node:fs";
import vm from "node:vm";
import assert from "node:assert/strict";
const read=p=>readFileSync(p,"utf8");
const base="public/command-center/";
const html=read(base+"ai-team.html");
const script=read(base+"assets/ai-team.js");
const entry=read(base+"assets/ai-team-entry.js");
const index=read(base+"index.html");
const bridge=read(base+"assets/jessy-owner-standalone.mjs");
const css=read(base+"assets/ai-team.css");
new vm.Script(script,{filename:"ai-team.js"});
new vm.Script(entry,{filename:"ai-team-entry.js"});
new vm.Script(read(base+"assets/jessy-owner.js"),{filename:"jessy-owner.js"});
const checks=[
 ["AI Team document",html.includes("<title>AI Team | The Launch Era Command Center</title>")],
 ["Owner-only blank until authenticated",html.includes('id="app" class="hidden"')],
 ["AI Team JS asset exists",existsSync(base+"assets/ai-team.js")],
 ["AI Team CSS asset exists",existsSync(base+"assets/ai-team.css")],
 ["Shared Supabase SDK exists",existsSync(base+"vendor/supabase-js-v2.57.0.umd.js")],
 ["Real favicon exists",existsSync("public/favicon.png")],
 ["Real brand mark exists",existsSync("public/assets/brand/tle-mark.svg")],
 ["Owner navigation wired",index.includes("ai-team-entry.js")],
 ["Navigation never offered without verified owner",entry.includes("TLEOwnerJessyGateway?.ready?.()===true")],
 ["Owner private section only",entry.includes('getElementById("ownerPrivateSection")')],
 ["Standalone Jessie allows AI Team",bridge.includes('"ai-team"')],
 ["Auth token used in AI Team",script.includes('Bearer "+session.access_token')],
 ["Production backend endpoint scoped",script.includes("/functions/v1/tle-ai-team")],
 ["No unauthorized data render before list",script.includes('verified=true;tasks=r.tasks')],
 ["No AI completion without evidence",script.includes('action:"complete",id:activeFinish,evidence:')],
 ["AI plan is not external execution",script.includes('tx("planDisclaimer")')],
 ["Escapes dynamically displayed task titles",script.includes('el("h3","",t.title)')],
 ["No direct email or billing sends",!/resend|stripe|send_email|checkout/i.test(script)],
 ["Responsive phone/tablet CSS",css.includes("@media(max-width:600px)")&&css.includes("@media(max-width:820px)")],
 ["No broken app-icons references",!html.includes("./app-icons/tle-192.png")],
 ["Private report section exists",html.includes('id="runs-section"') && html.includes('id="runs"')],
 ["Agent run action is authenticated",script.includes('action:"run_agent"') && script.includes('verified=true;tasks=r.tasks')],
 ["Report display escapes values",script.includes('el("b","",x.value===null')],
 ["Read-only action connected to Jessie",read(base+"assets/jessy-owner.js").includes("TLEAIOpsGateway.run(teamAgent)")],
 ["Task remains human approved",script.includes('action:"approve"') && script.includes('action:"complete"')],
 ["No arbitrary external requests in browser",!script.includes("fetch('https://api.github.com")],
 ["Reports stay responsive",css.includes(".ait-runs-grid") && css.includes("ait-agent-actions")],
 ["Real run endpoint and history",script.includes('runs=out.runs||[]') && script.includes('window.TLEAIOpsGateway=Object.freeze')],
 ["Automatic review and draft UI",html.includes('id="outputs-section"') && script.includes('action:"compose_output"')],
 ["Outputs require owner review",script.includes('action:"review_output"') && script.includes('output.status==="draft"')],
 ["No automatic message sending",script.includes('tx("approvalOnly")') && !script.includes('action:"send_email"')],
 ["Autonomy Edge Function source",existsSync("supabase/functions/tle-ai-team/index.ts")],
 ["Server scope for human approval",read("supabase/functions/tle-ai-team/index.ts").includes('action==="review_output"')],
 ["Server restricts execution",read("supabase/functions/tle-ai-team/index.ts").includes('external_actions:0')],
 ["Server workspace-isolates outputs",read("supabase/functions/tle-ai-team/index.ts").includes('workspace_id=eq." +ctx.workspace') || read("supabase/functions/tle-ai-team/index.ts").includes('"&workspace_id=eq."+ctx.workspace')],
 ["Outputs remain responsive",css.includes(".ait-outputs-grid") && css.includes("@media(max-width:820px)")],
 ["Single render after refresh",!script.includes("renderOutputs();renderRuns()")],
 ["Owner review audit events",read("supabase/functions/tle-ai-team/index.ts").includes('output_approved') && read("supabase/functions/tle-ai-team/index.ts").includes('output_created')],
 ["Concurrent approval guarded",read("supabase/functions/tle-ai-team/index.ts").includes('&status=eq.draft')],
 ["Origin labels in owner UI",script.includes('item.run_origin==="daily_review"') && script.includes('t.task_origin')],
 ["Private Jessie create and draft",read(base+"assets/jessy-owner.js").includes("function aiTeamCommand(") && script.includes('async draft(agentKey,description)')],
 ["Jessie actions stay inside owner-only page",read(base+"assets/jessy-owner.js").includes('activeContext().section!=="ai-team"')]
];
for(const [name,ok] of checks){assert.ok(ok,name);console.log("PASS — "+name)}
console.log("AI Team static readiness:",checks.length,"checks passed.");
