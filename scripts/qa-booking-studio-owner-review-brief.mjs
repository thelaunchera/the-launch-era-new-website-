import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {buildOwnerReviewBrief} from "../lib/booking-studio-owner-review-brief.mjs";
import {validateCustomerCommandCenterDestination as route} from "../lib/booking-studio-tenant-destination.mjs";
const fixture=JSON.parse(await readFile("fixtures/booking-studio-bright-rooms-synthetic.json","utf8"));
const draft=buildOwnerReviewBrief(fixture,{ownerNotes:"Make the headline warmer"});
assert.equal(draft.business_name,"Bright Rooms Housekeeping");
assert.equal(draft.can_offer_approval,false);
assert.equal(draft.can_publish,false);
assert.equal(draft.qa.passed,false);
assert.equal(draft.owner_decision,"PENDING");
assert.ok(draft.unresolved_questions.length>0);
assert.ok(draft.photo_evidence.every(x=>!x.rights_verified));
const complete={...fixture,stage:"owner_review",research:{...fixture.research,unknowns:[]},qa:{passed:true},
 design:{...fixture.design,photos:fixture.design.photos.map(x=>({...x,verified:true}))}};
const qa=Array.from({length:18},(_,i)=>({id:"qa-"+i,passed:true,evidence:"Verified synthetic QA evidence "+i}));
assert.equal(buildOwnerReviewBrief(complete,{qaEvidence:qa}).can_offer_approval,true);
assert.equal(buildOwnerReviewBrief(complete,{qaEvidence:qa.slice(1)}).can_offer_approval,false);
assert.equal(buildOwnerReviewBrief(complete,{qaEvidence:qa.map((x,i)=>i===0?{...x,passed:false}:x)}).can_offer_approval,false);
assert.equal(buildOwnerReviewBrief(complete,{qaEvidence:qa}).can_publish,false);
const input={tenant_id:"synthetic-tenant-a",assigned_tenant_id:"synthetic-tenant-a",url:"https://bright-rooms.example.test/dashboard",approved_origin:"https://bright-rooms.example.test"};
assert.equal(route(input).ok,true);
for(const url of ["https://thelaunchera.com/","https://www.thelaunchera.com/","https://command.thelaunchera.com/","http://bright-rooms.example.test/","https://localhost/","https://127.0.0.1/","javascript:alert(1)","https://other.example.test/"])
 assert.equal(route({...input,url}).ok,false,"Must reject "+url);
assert.equal(route({...input,assigned_tenant_id:"synthetic-tenant-b"}).reason,"tenant_mismatch");
assert.equal(route({...input,approved_origin:"https://other.example.test"}).ok,false);
assert.equal(route({...input,url:"https://bright-rooms.example.test/dashboard?token=secret"}).ok,false);
console.log("PASS: owner review evidence gate and tenant-assigned Command Center destination validation. No external actions.");
