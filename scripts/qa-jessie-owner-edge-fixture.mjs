/**
 * Isolated owner-bubble fixture: auth, tenant isolation, safe provider choice,
 * JWT delegation to AI Team, client readiness and unavailable unscoped sources.
 * No real people, credentials, clients, notifications, sends or writes.
 */
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import vm from "node:vm";
const source=readFileSync("supabase/functions/tle-jessy-owner/index.ts","utf8").replace(/^import\s+["']jsr:[^\n]+\n/m,"");
const BASE="https://fixture.supabase.invalid";
const A="11111111-1111-4111-8111-111111111111",B="22222222-2222-4222-8222-222222222222",C="33333333-3333-4333-8333-333333333333";
const WA="aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",WB="bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const records={
 platform_admins:[{user_id:A},{user_id:B}],
 tle_crm_workspaces:[{id:WA,created_by:A,is_internal:true},{id:WB,created_by:B,is_internal:true}],
 tle_booking_flow_accounts:[
  {id:"dddddddd-dddd-4ddd-8ddd-dddddddddddd",crm_workspace_id:WA,payment_status:"paid",business_name:"Sample Alpha Cleaning",intake_completed_at:null,intake_payload:{},build_started_at:null,delivery_sent_at:null},
  {id:"eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee",crm_workspace_id:WB,payment_status:"paid",business_name:"Sample Beta Cleaning",intake_completed_at:null,intake_payload:{},build_started_at:null,delivery_sent_at:null}
 ],
 tle_crm_leads:[
  {workspace_id:WA,stage:"Follow-up",followup:"2026-01-01",archived_at:null},
  {workspace_id:WB,stage:"Follow-up",followup:"2026-01-01",archived_at:null},
  {workspace_id:WB,stage:"Follow-up",followup:"2026-01-01",archived_at:null}
 ],
 tle_crm_notifications:[{workspace_id:WA,read_at:null},{workspace_id:WB,read_at:null},{workspace_id:WB,read_at:null}]
};
let captured=null,forwarded=[],writes=0,openai=0,groq=0,failGroq=false,workspaceFilters=[];
const mapToken=t=>t==="Bearer fixture-owner"?A:t==="Bearer fixture-other-owner"?B:t==="Bearer fixture-nonowner"?C:null;
function matching(data,params){
 for(const [key,raw] of params){
  if(["select","order","limit"].includes(key))continue;
  if(raw.startsWith("eq."))data=data.filter(row=>String(row[key]??"")===raw.slice(3));
  else if(raw==="is.null")data=data.filter(row=>row[key]===null||row[key]===undefined);
  else if(raw==="not.is.null")data=data.filter(row=>row[key]!==null&&row[key]!==undefined);
  else if(raw.startsWith("lte."))data=data.filter(row=>String(row[key]||"")<=raw.slice(4));
  else throw Error("Unknown fixture filter "+key+"="+raw);
 }
 return data;
}
async function mockedFetch(input,options={}){
 const url=new URL(String(input));const method=options.method||"GET";
 if(url.origin===BASE&&url.pathname==="/auth/v1/user"){
  const user=mapToken(options.headers?.Authorization);
  return new Response(JSON.stringify(user?{id:user}:{error:"invalid"}),{status:user?200:401});
 }
 if(url.origin===BASE&&url.pathname==="/functions/v1/tle-ai-team"){
  if(method!=="POST")throw Error("Delegation must use POST");
  const authorization=options.headers?.Authorization||"";
  forwarded.push(authorization);
  if(!mapToken(authorization))return new Response(JSON.stringify({ok:false}),{status:401});
  const data=JSON.parse(options.body||"{}");
  if(data.action!=="team_brief")throw Error("Unexpected delegated mutation");
  const reports=["jessie","sales","projects","developer","qa","creative","care"].map(agent=>({agent,status:"checked"}));
  return new Response(JSON.stringify({ok:true,reports,priority_actions:[],collected_at:"2026-10-14T10:00:00Z"}),{status:200});
 }
 if(url.origin===BASE&&url.pathname.startsWith("/rest/v1/")){
  if(method!=="GET"){writes++;throw Error("Unexpected database write");}
  const table=url.pathname.split("/").pop();
  if(table==="tle_crm_workspaces")workspaceFilters.push(url.searchParams.toString());
  if(!Object.hasOwn(records,table))throw Error("Unscoped/unknown fixture table: "+table);
  const data=matching(records[table],url.searchParams);
  return new Response(JSON.stringify(data.slice(0,Number(url.searchParams.get("limit")||500))),{status:200,headers:{"Content-Range":"0-0/"+data.length}});
 }
 if(url.hostname==="api.groq.com"){
  groq++;
  return failGroq?new Response(JSON.stringify({error:"rate_limited"}),{status:429}):
   new Response(JSON.stringify({choices:[{message:{content:"I can help review your verified workspace."}}]}),{status:200});
 }
 if(url.hostname==="api.openai.com"){openai++;throw Error("Must not fall back to billed OpenAI");}
 throw Error("Unapproved destination "+url.origin);
}
const config={SUPABASE_URL:BASE,SUPABASE_SERVICE_ROLE_KEY:"fixture-service-key",SUPABASE_ANON_KEY:"fixture-anon-key",GROQ_API_KEY:"gsk_test_fixture"};
const Deno={env:{get:key=>config[key]||undefined},serve:handler=>{captured=handler}};
vm.runInNewContext(source,{Deno,fetch:mockedFetch,Request,Response,Headers,URL,AbortSignal,Intl,Date,console,setTimeout,clearTimeout},{timeout:5000});
assert.equal(typeof captured,"function");
async function call(token,body,origin="https://thelaunchera.com"){
 const headers={"Content-Type":"application/json",Origin:origin};
 if(token)headers.Authorization="Bearer "+token;
 const response=await captured(new Request(BASE+"/functions/v1/tle-jessy-owner",{method:"POST",headers,body:JSON.stringify(body)}));
 return {status:response.status,data:await response.json()};
}
for(const body of [{action:"team_brief",language:"es"},{action:"client_readiness",language:"en"},{message:"How can I organize inquiries?",language:"en"}]){
 assert.equal((await call(null,body)).status,401);
 assert.equal((await call("fixture-nonowner",body)).status,401);
 assert.equal((await call("expired",body)).status,401);
 assert.equal((await call("fixture-owner",body,"https://untrusted.invalid")).status,403);
}
const teamA=await call("fixture-owner",{action:"team_brief",language:"es"});
const teamB=await call("fixture-other-owner",{action:"team_brief",language:"en"});
assert.equal(teamA.status,200);assert.equal(teamB.status,200);
assert.equal(teamA.data.action_performed,"team_brief");
assert.equal(teamA.data.read_only,true);
assert.equal(teamA.data.checked,7);
assert.equal(teamA.data.external_actions,0);
assert.ok(forwarded.includes("Bearer fixture-owner"));
assert.ok(forwarded.includes("Bearer fixture-other-owner"));
const readyA=await call("fixture-owner",{action:"client_readiness",language:"en"});
const readyB=await call("fixture-other-owner",{action:"client_readiness",language:"es"});
assert.equal(readyA.status,200);assert.equal(readyB.status,200);
assert.ok(workspaceFilters.length>0,"Owner authorization must verify internal workspace");
assert.ok(workspaceFilters.every(q=>q.includes("created_by=eq.")&&q.includes("is_internal=eq.true")&&q.includes("limit=1")),"Never enumerate other internal workspaces during owner authentication");
assert.deepEqual(readyA.data.projects.map(x=>x.name),["Sample Alpha Cleaning"]);
assert.deepEqual(readyB.data.projects.map(x=>x.name),["Sample Beta Cleaning"]);
assert.equal(readyA.data.coverage.includes("legacy_ai_orders_unlinked"),true);
const ordinaryA=await call("fixture-owner",{message:"How can I organize inquiries?",language:"en"});
const ordinaryB=await call("fixture-other-owner",{message:"How can I organize inquiries?",language:"en"});
assert.equal(ordinaryA.status,200);assert.equal(ordinaryB.status,200);
assert.equal(ordinaryA.data.counts.prospects,1);
assert.equal(ordinaryB.data.counts.prospects,2);
assert.equal(ordinaryA.data.counts.websiteNew,null,"Unlinked public leads must remain unavailable");
assert.equal(ordinaryA.data.counts.aiPending,null,"Unlinked AI orders must remain unavailable");
failGroq=true;
const fallback=await call("fixture-owner",{message:"How can I organize inquiries?",language:"en"});
assert.equal(fallback.status,200);assert.equal(fallback.data.mode,"guided");
assert.equal(openai,0);assert.equal(writes,0);
assert.ok(groq>=3);
console.log("PASS — Jessy owner JWT delegation, two tenant-scoped readiness views, no cross-tenant counts, Groq/guided fallback");
console.log("FIXTURE ONLY — authenticated live browser and real Groq provider still require independent verification.");
