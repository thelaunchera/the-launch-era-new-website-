import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import vm from "node:vm";
const A="aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",B="bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const records={
 tle_booking_flow_accounts:[
  {id:"11111111-1111-4111-8111-111111111111",business_name:"Sample A",crm_workspace_id:"buyer-a",tle_sales_workspace_id:A,payment_status:"paid",intake_completed_at:null,delivery_sent_at:null},
  {id:"22222222-2222-4222-8222-222222222222",business_name:"Sample B",crm_workspace_id:"buyer-b",tle_sales_workspace_id:B,payment_status:"paid",intake_completed_at:null},
  {id:"33333333-3333-4333-8333-333333333333",business_name:"Unlinked historical",crm_workspace_id:"old-buyer",payment_status:"paid"}
 ],
 tle_ai_agent_orders:[
  {id:"44444444-4444-4444-8444-444444444444",business_name:"AI A",tle_sales_workspace_id:A,status:"intake_submitted",submitted_at:"2026-10-14",services_offered:"Home cleaning",install_target:"booking"},
  {id:"55555555-5555-4555-8555-555555555555",business_name:"AI B",tle_sales_workspace_id:B,status:"in_setup",submitted_at:"2026-10-14",services_offered:"Home cleaning",install_target:"booking"},
  {id:"66666666-6666-4666-8666-666666666666",business_name:"Legacy AI",status:"intake_submitted"}
 ]
};
let failAI=false;
function read(table,query){
 if(table==="tle_project_kickoffs"){assert(!query.includes("66666666"));return [];}
 if(table==="tle_ai_agent_orders"&&failAI)throw Error("source unavailable");
 const p=new URLSearchParams(query);let items=records[table]||[];
 if(p.has("or")){const m=p.get("or").match(/^\(tle_sales_workspace_id.eq.([^,]+),crm_workspace_id.eq.([^\)]+)\)$/);assert(m);assert.equal(m[1],m[2]);items=items.filter(x=>x.tle_sales_workspace_id===m[1]||x.crm_workspace_id===m[1]);}
 else {const q=p.get("tle_sales_workspace_id");assert(q?.startsWith("eq."),"agency filter required");items=items.filter(x=>x.tle_sales_workspace_id===q.slice(3));}
 return items;
}
function load(file){
 const context={Deno:{env:{get:()=>""},serve(){}},URLSearchParams,URL,AbortSignal,Request,Response,Headers,Intl,Date,console,fetch:()=>{throw Error("No live requests");}};
 vm.createContext(context);vm.runInContext(readFileSync(file,"utf8").replace(/^import[^\n]+\n/gm,""),context);
 context.dbRead=async(table,filters)=>read(table,filters);
 context.rows=async(table,query)=>read(table,query);
 return context;
}
const team=load("supabase/functions/tle-ai-team/index.ts"),owner=load("supabase/functions/tle-jessy-owner/index.ts");
for(const workspace of [A,B]){
 const review=await team.projectReview({workspace},"es");
 assert.equal(review.facts.find(x=>x.label==="Booking accounts inspected").value,1);
 assert.equal(review.facts.find(x=>x.label==="AI orders not recorded delivered").value,1);
 const result=await owner.projectReadiness("es",workspace);
 assert.equal(result.projects.length,2);assert(result.projects.every(x=>!x.name.includes("Legacy")&&!x.name.includes("historical")));
 assert.equal(result.projects.find(x=>x.kind==="ai").status,"owner_review");
 assert.equal(result.read_only,true);
}
failAI=true;
const partial=await team.projectReview({workspace:A},"en");
assert.equal(partial.coverage,"partial");assert.equal(partial.facts.find(x=>x.label==="Paid with intake missing").value,1);
assert.equal(partial.facts.find(x=>x.label==="AI orders not recorded delivered").value,null);
console.log("PASS: new buyer orders routed to owning agency; two-owner isolation; unlinked records excluded; AI failure preserves Booking facts; no writes or sends.");

