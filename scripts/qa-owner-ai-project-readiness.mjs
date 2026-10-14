import assert from "node:assert/strict";
import {evaluateOwnerBookingReadiness, draftMissingInformationRequest} from "../lib/owner-ai-project-readiness.mjs";
const ws="internal-owner-workspace";
const row=(id, overrides={})=>({id,crm_workspace_id:ws,payment_status:"paid",business_name:"Sample Cleaning",intake_completed_at:"2026-10-14",intake_payload:{services:["Standard"],service_areas:["Miami"],pricing_style:"quote",availability:"Mon-Fri"},build_started_at:null,delivery_sent_at:null,...overrides});
assert.throws(()=>evaluateOwnerBookingReadiness([]),/workspace/);
assert.throws(()=>evaluateOwnerBookingReadiness(null,{workspaceId:ws}),/rows/);
const result=evaluateOwnerBookingReadiness([
 row("ok"),row("missing",{intake_payload:{services:["Standard"],service_areas:[],pricing_style:"",availability:""}}),
 row("production",{build_started_at:"2026-10-14"}),row("delivered",{delivery_sent_at:"2026-10-14"}),
 row("wrong-tenant",{crm_workspace_id:"another-business"}),row("unpaid",{payment_status:"unpaid"}),row("ok")
],{workspaceId:ws});
assert.deepEqual(result.counts,{needs_info:1,owner_review:1,production:1,delivered:1});
assert.equal(result.projects.length,4);
assert.equal(result.excluded,3);
assert.equal(result.external_actions,0);
assert.equal(result.read_only,true);
const missing=result.projects.find(x=>x.id==="missing");
assert.deepEqual(missing.missing,["Service areas","Pricing details","Booking availability"]);
const draft=draftMissingInformationRequest(missing);
assert.equal(draft.sent,false);
assert.equal(draft.recipient,null);
assert.equal(draft.requires_owner_approval,true);
assert.match(draft.body,/Service areas/);
assert.throws(()=>draftMissingInformationRequest(result.projects[0]),/verified missing/);
const es=evaluateOwnerBookingReadiness([row("es",{intake_completed_at:null})],{workspaceId:ws,language:"es"});
assert.deepEqual(es.projects[0].missing,["Intake sin enviar"]);
assert.match(draftMissingInformationRequest(es.projects[0],{language:"es"}).body,/Intake sin enviar/);
const many=Array.from({length:45},(_,i)=>row(String(i)));
assert.equal(evaluateOwnerBookingReadiness(many,{workspaceId:ws}).truncated,true);
assert.equal(evaluateOwnerBookingReadiness(many,{workspaceId:ws}).projects.length,40);
console.log("Owner AI Projects readiness QA: 11 assertions passed (synthetic fixtures only)");
