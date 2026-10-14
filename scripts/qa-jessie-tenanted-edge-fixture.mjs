/**
 * Isolated owner/tenant fixture for the exact production Edge Function source.
 * No live credentials, users, clients or network traffic.
 * Verifies route authorization and tenant filtering under mocked Supabase REST.
 */
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import vm from "node:vm";

const file=readFileSync("supabase/functions/tle-ai-team/index.ts","utf8");
const source=file.replace(/^import\s+["']jsr:[^\n]+\n/m,"");
const urlBase="https://fixture.supabase.invalid";
const OWNER="11111111-1111-4111-8111-111111111111";
const OWNER2="22222222-2222-4222-8222-222222222222";
const NONOWNER="33333333-3333-4333-8333-333333333333";
const WS="aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const WS2="bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const rows={
 platform_admins:[{user_id:OWNER},{user_id:OWNER2}],
 tle_crm_workspaces:[
  {id:WS,created_by:OWNER,is_internal:true},{id:WS2,created_by:OWNER2,is_internal:true}
 ],
 tle_crm_leads:[
  {workspace_id:WS,stage:"Follow-up",followup:"2026-01-01",email_consent_status:"authorized",email_followup_enabled:true,contact_decision:"yes",replied_at:null,research_only:false,archived_at:null},
  ...Array.from({length:3},()=>({workspace_id:WS2,stage:"New",archived_at:null}))
 ],
 tle_crm_notifications:[
  {workspace_id:WS,read_at:null},{workspace_id:WS2,read_at:null},{workspace_id:WS2,read_at:null}
 ],
 tle_booking_flow_accounts:[
  {crm_workspace_id:WS,payment_status:"paid",intake_completed_at:null,build_started_at:null,delivery_sent_at:null,status:"paid"},
  {crm_workspace_id:WS2,payment_status:"paid",intake_completed_at:null,build_started_at:null,delivery_sent_at:null,status:"paid"},
  {crm_workspace_id:WS2,payment_status:"paid",intake_completed_at:null,build_started_at:null,delivery_sent_at:null,status:"paid"}
 ],
 tle_crm_support_requests:[
  {workspace_id:WS,status:"open",created_at:"2026-10-10T00:00:00Z"},
  {workspace_id:WS,status:"pending",created_at:"2026-10-11T00:00:00Z"},
  {workspace_id:WS,status:"resolved",created_at:"2026-10-12T00:00:00Z"},
  {workspace_id:WS2,status:"needs_review",created_at:"2026-10-12T00:00:00Z"}
 ],
 tle_ai_team_tasks:[
  {workspace_id:WS,owner_id:OWNER,status:"planned"},
  {workspace_id:WS2,owner_id:OWNER2,status:"planned"}
 ]
};
let endpoint=null,groqAttempts=0,openaiAttempts=0,forbiddenWrites=0,simulateGroqFailure=false,simulateRouteFailure=false,simulateProjectUnavailable=false;
function userForToken(token){
 if(token==="Bearer fixture-owner")return OWNER;
 if(token==="Bearer fixture-other-owner")return OWNER2;
 if(token==="Bearer fixture-nonowner")return NONOWNER;
 return null;
}
function applyFilter(data,query){
 const filters=[...query.entries()].filter(([key])=>!["select","order","limit","offset"].includes(key));
 for(const [key,raw] of filters){
  if(raw.startsWith("eq.")){const val=raw.slice(3);data=data.filter(x=>String(x[key]??"")===val);}
  else if(raw==="is.null")data=data.filter(x=>x[key]===null||x[key]===undefined);
  else if(raw==="not.is.null")data=data.filter(x=>x[key]!==null&&x[key]!==undefined);
  else if(raw.startsWith("in.(")){const choices=raw.slice(4,-1).split(",");data=data.filter(x=>choices.includes(String(x[key])));}
  else if(raw.startsWith("lte."))data=data.filter(x=>String(x[key]||"")<=raw.slice(4));
  else if(raw.startsWith("gte."))data=data.filter(x=>String(x[key]||"")>=raw.slice(4));
  else throw new Error("Unexpected test filter "+key+"="+raw);
 }
 return data;
}
async function fakeFetch(input,options={}){
 const url=new URL(String(input));
 const method=options.method||"GET";
 if(url.origin===urlBase&&url.pathname==="/auth/v1/user"){
  const id=userForToken(options.headers?.Authorization);
  return new Response(JSON.stringify(id?{id}:{error:"unauthorized"}),{status:id?200:401});
 }
 if(url.origin===urlBase&&url.pathname.startsWith("/rest/v1/")){
  if(method!=="GET"){forbiddenWrites++;throw new Error("Unexpected database mutation in a read-only fixture");}
  const table=url.pathname.split("/").pop();
  if(table==="tle_booking_flow_accounts"&&simulateProjectUnavailable)return new Response("Service temporarily unavailable",{status:503});
  if(!Object.hasOwn(rows,table))throw new Error("Unmocked tenant source: "+table);
  const data=applyFilter(rows[table],[...url.searchParams].length?url.searchParams:new URLSearchParams());
  const limit=Number(url.searchParams.get("limit")||"500");
  return new Response(JSON.stringify(data.slice(0,limit)),{
   status:200,headers:{"Content-Type":"application/json","Content-Range":"0-0/"+data.length}
  });
 }
 if(url.hostname==="api.groq.com"){
  groqAttempts++;
  if(simulateGroqFailure)return new Response(JSON.stringify({error:{code:"rate_limit"}}),{status:429});
  return new Response(JSON.stringify({choices:[{message:{content:"OK"}}]}),{status:200});
 }
 if(url.hostname==="api.openai.com"){openaiAttempts++;throw Error("OpenAI fallback must NOT be used while Groq is configured");}
 if(url.hostname==="api.github.com"){
  if(url.pathname.endsWith("/commits/main"))return new Response(JSON.stringify({sha:"0123456789012345"}),{status:200});
  return new Response(JSON.stringify({workflow_runs:[{name:"Fixture QA",status:"completed",conclusion:"success"}]}),{status:200});
 }
 if(url.hostname==="thelaunchera.com"){
  if(simulateRouteFailure&&url.pathname==="/auth-recovery.html")return new Response("Not found",{status:404});
  return new Response("<html><title>The Launch Era</title>thelaunchera authForm Owner sign-in required passwordForm</html>",{status:200});
 }
 throw Error("Unexpected network destination in fixture: "+url.origin);
}
const env={SUPABASE_URL:urlBase,SUPABASE_SERVICE_ROLE_KEY:"fixture-sr-key",SUPABASE_ANON_KEY:"fixture-anon-key",GROQ_API_KEY:"gsk_fixture_key_123"};
const Deno={env:{get:(k)=>env[k]||undefined},serve:handler=>{endpoint=handler;}};
vm.runInNewContext(source,{Deno,fetch:fakeFetch,Response,Request,Headers,URL,AbortSignal,Intl,Date,console,setTimeout,clearTimeout},{timeout:5000});
assert.equal(typeof endpoint,"function","Fixture must load actual Edge Function source");

async function call(token,action,fields={},origin="https://thelaunchera.com"){
 const headers={"Content-Type":"application/json",Origin:origin};
 if(token)headers.Authorization="Bearer "+token;
 const req=new Request(urlBase+"/functions/v1/tle-ai-team",{method:"POST",headers,body:JSON.stringify({action,...fields})});
 const response=await endpoint(req);
 const result=await response.json();
 return {status:response.status,result};
}
for(const action of ["list","team_brief","capability_manifest","run_agent"]){
 const fields=action==="run_agent"?{agent_key:"sales"}:{language:"es"};
 const anonymous=await call(null,action,fields);
 const nonowner=await call("fixture-nonowner",action,fields);
 const expired=await call("expired",action,fields);
 assert.equal(anonymous.status,401,"Unauthenticated "+action+" denied");
 assert.equal(nonowner.status,401,"Non-owner "+action+" denied");
 assert.equal(expired.status,401,"Expired "+action+" denied");
 const badOrigin=await call("fixture-owner",action,fields,"https://untrusted.invalid");
 assert.equal(badOrigin.status,403,"Untrusted origin "+action+" denied");
}
const primary=await call("fixture-owner","team_brief",{language:"es"});
const other=await call("fixture-other-owner","team_brief",{language:"en"});
assert.equal(primary.status,200);
assert.equal(other.status,200);
assert.equal(primary.result.reports.length,7);
assert.equal(other.result.reports.length,7);
assert.equal(primary.result.counts.prospects,1);
assert.equal(other.result.counts.prospects,3);
assert.equal(primary.result.counts.unread_notifications,1);
assert.equal(other.result.counts.unread_notifications,2);
assert.equal(primary.result.counts.open_support,2,"Owner sees open+pending, not other tenant's support");
assert.equal(other.result.counts.open_support,1,"Other owner sees needs_review, not main owner's support");
assert.equal(primary.result.counts.active_tasks,1);
assert.equal(other.result.counts.active_tasks,1);
assert.equal(primary.result.reports.find(x=>x.agent==="projects").facts.find(x=>x.label==="Booking accounts inspected").value,1);
assert.equal(other.result.reports.find(x=>x.agent==="projects").facts.find(x=>x.label==="Booking accounts inspected").value,2);
// A fully reliable linked-booking count can raise a priority while the overall project
// report remains partial because unmapped legacy AI orders are intentionally excluded.
const projectReport=primary.result.reports.find(x=>x.agent==="projects");
assert.equal(projectReport.status,"partial");
assert.equal(projectReport.facts.find(x=>x.label==="Paid with intake missing").value,1);
assert.equal(primary.result.priority_actions.find(x=>x.agent==="projects")?.count,1,
 "One verified paid booking without intake must be surfaced as a priority despite partial coverage");
// A failed URL is itself a verified negative result, not an unknown/zero.
simulateRouteFailure=true;
const withFailedUrl=await call("fixture-owner","team_brief",{language:"en"});
const qaReport=withFailedUrl.result.reports.find(x=>x.agent==="qa");
assert.equal(qaReport.status,"partial","Incomplete public QA checks must keep partial status");
assert.equal(qaReport.facts.find(x=>x.label==="Public checks passed").value,4);
assert.equal(qaReport.facts.find(x=>x.label==="Public checks attempted").value,5);
assert.equal(withFailedUrl.result.priority_actions.find(x=>x.agent==="qa")?.count,1,
 "A verified failed public route must produce one QA priority");
simulateRouteFailure=false;
// Source failure is unknown, not a fabricated zero or a false priority.
simulateProjectUnavailable=true;
const noProjectSource=await call("fixture-owner","team_brief",{language:"en"});
assert.equal(noProjectSource.result.reports.find(x=>x.agent==="projects").status,"partial");
assert.equal(noProjectSource.result.priority_actions.some(x=>x.agent==="projects"),false);
assert.equal(noProjectSource.result.reports.find(x=>x.agent==="projects").facts.some(x=>x.value===null),true);
simulateProjectUnavailable=false;
assert.equal(primary.result.no_external_actions,true);
assert.equal(other.result.no_external_actions,true);
assert.doesNotMatch(JSON.stringify(primary.result),/bbbbbbbb|fixture-sr-key|fixture-owner|owner_email/i);
const manifest=await call("fixture-owner","capability_manifest");
assert.equal(manifest.status,200);
assert.equal(manifest.result.owner_only,true);
assert.equal(manifest.result.external_actions_enabled,false);
const connected=await call("fixture-owner","provider_check");
assert.equal(connected.result.verified,true);
assert.equal(connected.result.provider,"groq");
simulateGroqFailure=true;
const unavailable=await call("fixture-owner","provider_check");
assert.equal(unavailable.result.verified,false);
assert.equal(unavailable.result.reason,"rate_or_billing_limit");
assert.equal(openaiAttempts,0,"Groq failures must never silently bill OpenAI");
assert.equal(forbiddenWrites,0,"Read-only fixture must not call POST/PATCH to a table");
assert.ok(groqAttempts>=2);
console.log("PASS — isolated JWT, tenant isolation, support counts, verified partial project/QA priorities, unavailable sources and Groq fallback guard");
console.log("FIXTURE ONLY — No authenticated live owner E2E, production client data or real Groq traffic was used.");
