/** Scoped two-specialist handoff fixture. No real network, clients or credentials. */
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import vm from "node:vm";
const backend=readFileSync("supabase/functions/tle-ai-team/index.ts","utf8").replace(/^import\\s+["']jsr:[^\\n]+\\n/m,"");
const ui=readFileSync("public/command-center/assets/ai-team.js","utf8");
new vm.Script(backend,{filename:"tle-ai-team.ts"});
new vm.Script(ui,{filename:"ai-team.js"});
assert(ui.includes('action:"collaborate",id:task.id,language'));
assert(ui.includes('const canRegenerate=!primaryTask||primaryTask.agent_key===output.agent_key'));
assert(!ui.includes('action:"send_email"')&&!ui.includes('action:"publish"'));
const BASE="https://fixture.supabase.invalid",OWNER="11111111-1111-4111-8111-111111111111",OTHER="22222222-2222-4222-8222-222222222222";
const WS="aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",WS2="bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",TASK="cccccccc-cccc-4ccc-8ccc-cccccccccccc";
let endpoint,providerCalls=0,remoteActions=0;
const requests=[];
const rows={
 platform_admins:[{user_id:OWNER},{user_id:OTHER}],
 tle_crm_workspaces:[{id:WS,created_by:OWNER,is_internal:true},{id:WS2,created_by:OTHER,is_internal:true}],
 tle_ai_team_tasks:[{id:TASK,workspace_id:WS,owner_id:OWNER,agent_key:"developer",title:"Improve the demo review handoff",description:"Use test fixtures. Do not publish.",status:"planned",approval_required:true}],
 tle_ai_team_outputs:[],tle_ai_team_events:[]
};
const filter=(data,params)=>{for(const [key,value] of params){
 if(["select","order","limit"].includes(key))continue;
 if(!value.startsWith("eq."))throw Error("Unexpected filter "+key+" "+value);
 data=data.filter(x=>String(x[key])===value.slice(3));
}return data};
const fakeFetch=async(input,opts={})=>{
 const url=new URL(String(input)),method=opts.method||"GET";
 if(url.origin===BASE&&url.pathname==="/auth/v1/user"){
  const t=opts.headers?.Authorization, id=t==="Bearer owner"?OWNER:t==="Bearer other"?OTHER:null;
  return new Response(JSON.stringify(id?{id}:{error:"unauthorized"}),{status:id?200:401});
 }
 if(url.origin===BASE&&url.pathname.startsWith("/rest/v1/")){
  const table=url.pathname.split("/").pop();
  if(!Object.hasOwn(rows,table))throw Error("Unknown table "+table);
  if(method==="GET")return new Response(JSON.stringify(filter(rows[table],url.searchParams).slice(0,Number(url.searchParams.get("limit")||100))),{status:200});
  if(method!=="POST"||!["tle_ai_team_outputs","tle_ai_team_events"].includes(table)){remoteActions++;throw Error("Forbidden mutation "+table)}
  const body=JSON.parse(opts.body), saved={...body,id:table==="tle_ai_team_outputs"?"dddddddd-dddd-4ddd-8ddd-"+String(rows[table].length+1).padStart(12,"0"):rows[table].length+1,created_at:new Date().toISOString()};
  rows[table].push(saved);return new Response(JSON.stringify([saved]),{status:201});
 }
 if(url.hostname==="api.groq.com"){
  providerCalls++;
  const messages=JSON.parse(opts.body).messages;
  requests.push(messages[1].content);
  const answer=providerCalls===1
   ?"Project plan: confirm the owner task and define acceptance criteria. Use isolated fixtures. Check login, mobile layouts, separate preview access and rollback. This is only a proposed checklist; no files were modified."
   :"QA plan: review the proposed project plan with isolated fixtures. Test tenant isolation, login, mobile and desktop, protected preview, and rollback. Require owner approval after verifying evidence. This is a draft, not a completed test.";
  return new Response(JSON.stringify({choices:[{message:{content:answer}}]}),{status:200});
 }
 remoteActions++;throw Error("Unexpected external destination "+url.origin);
};
const env={SUPABASE_URL:BASE,SUPABASE_SERVICE_ROLE_KEY:"fixture-only",SUPABASE_ANON_KEY:"fixture-only",GROQ_API_KEY:"gsk_fixture_key_123"};
const Deno={env:{get:k=>env[k]},serve:handler=>{endpoint=handler}};
vm.runInNewContext(backend,{Deno,fetch:fakeFetch,Response,Request,Headers,URL,AbortSignal,Intl,Date,console,setTimeout,clearTimeout},{timeout:5000});
async function call(token,action,fields={},origin="https://thelaunchera.com"){
 const headers={"Content-Type":"application/json","Origin":origin};
 if(token)headers.Authorization="Bearer "+token;
 const res=await endpoint(new Request(BASE+"/functions/v1/tle-ai-team",{method:"POST",headers,body:JSON.stringify({action,...fields})}));
 return {status:res.status,body:await res.json()};
}
for(const [token,expected] of [[null,401],["other",503]]){
 const answer=await call(token,"collaborate",{id:TASK,language:"es"});
 assert.equal(answer.status,expected);
 assert(!JSON.stringify(answer.body).includes(WS));
}
assert.equal((await call("owner","collaborate",{id:TASK,language:"es"},"https://evil.invalid")).status,403);
const first=await call("owner","collaborate",{id:TASK,language:"es"});
assert.equal(first.status,200,JSON.stringify(first.body));
assert.equal(first.body.outputs.length,2);
assert.equal(first.body.external_actions,0);
assert.equal(first.body.requires_owner_review,true);
assert.deepEqual(rows.tle_ai_team_outputs.map(x=>x.agent_key),["projects","qa"]);
assert(rows.tle_ai_team_outputs.every(x=>x.workspace_id===WS&&x.owner_id===OWNER&&x.task_id===TASK&&x.status==="draft"));
assert(requests[1].includes("Project plan:"),"Second specialist must receive first draft as unverified context");
assert.equal(providerCalls,2);
const again=await call("owner","collaborate",{id:TASK,language:"es"});
assert.equal(again.status,200);
assert.equal(again.body.outputs.length,2);
assert.equal(rows.tle_ai_team_outputs.length,2,"Repeat must reuse recent drafts");
assert.equal(providerCalls,2,"Repeat should not re-bill the model");
assert.equal(remoteActions,0);
console.log("PASS — authenticated owner, cross-tenant denial, origin guard, sequential shared context, owner-only drafts, 90s reuse, no external actions");
console.log("FIXTURE ONLY — live owner browser, independent CI and production approval are not covered.");
