import assert from "node:assert/strict";
import {assessIntake,createStudioJob,submitResearch,submitDesign,submitBuild,submitQa,ownerDecision,releaseGate,REQUIRED_QA} from "../lib/booking-studio-pipeline.mjs";
// No external requests: all accounts, orders and proof references are synthetic.
const input={verified_tenant_id:"synthetic-tenant-a",order_id:"synthetic-paid-order-a",payment_status:"paid",owner_start_approved:true,
 business_name:"Bright Rooms Housekeeping",business_type:"residential cleaning",contact_email:"owner@example.test",
 booking_policy:"Every booking request requires manual confirmation.",service_areas:["Miami","Miami Beach"],
 services:[{name:"Standard Cleaning",mode:"flat",price:120},{name:"Move-Out Cleaning",mode:"quote"}]};
const research={sources:[{url:"https://example.test/about",purpose:"Verified synthetic intake"}],
 facts:[{claim:"Synthetic residential cleaning business",source_url:"https://example.test/about"}],unknowns:["Confirm image rights"]};
const design=(title)=>({layout:"immersive",cards:"photographic",typography:"elegant",primary_color:"#191919",accent_color:"#B7DDF3",
 photos:[{url:"https://example.test/licensed.jpg",license:"Synthetic permission record",usage:"hero"}],
 hero_title:title,hero_body:"A little more time for the things you love.",design_rationale:"Photo-first composition for this synthetic client's audience",
 section_order:["services","process","booking"]});
const proof=()=>({tests:REQUIRED_QA.map(id=>({id,passed:true,evidence:"Synthetic automated QA assertion: "+id}))});
const owner={actor_role:"platform_owner",actor_id:"synthetic-owner"};
assert.equal(REQUIRED_QA.length,18);
for(const broken of [{payment_status:"pending"},{owner_start_approved:false},{verified_tenant_id:""},{services:[]},{booking_policy:""}])
 assert.equal(assessIntake({...input,...broken}).ready,false,"Unverified intake must be rejected");
let result=createStudioJob(input);assert.equal(result.ok,true);let job=result.job;
assert.equal(job.stage,"research");
assert.equal(submitResearch(job,"synthetic-tenant-b",research).reason,"tenant_mismatch");
result=submitResearch(job,input.verified_tenant_id,research);assert.equal(result.ok,true);job=result.job;
assert.equal(submitDesign(job,input.verified_tenant_id,{...design("Home, refreshed"),photos:[]}).reason,"photo_license_required");
result=submitDesign(job,input.verified_tenant_id,design("A home you can settle into"));assert.equal(result.ok,true);job=result.job;
assert.equal(submitBuild(job,input.verified_tenant_id,{tenant_id:input.verified_tenant_id,private_preview_id:"synthetic-preview",artifact_commit:"synthetic-sha",client_notified:true}).reason,"premature_external_action");
result=submitBuild(job,input.verified_tenant_id,{tenant_id:input.verified_tenant_id,private_preview_id:"synthetic-preview",artifact_commit:"synthetic-sha",published:false,client_notified:false});assert.equal(result.ok,true);job=result.job;
assert.equal(job.stage,"qa");
assert.equal(submitQa(job,"synthetic-tenant-b",proof()).reason,"tenant_mismatch");
assert.equal(releaseGate(job,input.verified_tenant_id,{...owner,explicit_publish_approval:true}).reason,"approval_required");
// Missing a single evidence item must fail all-or-nothing QA.
const noEvidence=proof();noEvidence.tests[0].evidence="";
const failure=submitQa(job,input.verified_tenant_id,noEvidence);
assert.equal(failure.job.stage,"development");assert.deepEqual(failure.job.qa.failed,[REQUIRED_QA[0]]);
assert.equal(ownerDecision(failure.job,input.verified_tenant_id,{...owner,action:"approve"}).reason,"qa_or_review_missing");
result=submitQa(job,input.verified_tenant_id,proof());assert.equal(result.ok,true);job=result.job;
assert.equal(job.stage,"owner_review");assert.equal(job.qa.tests.length,18);
assert.equal(ownerDecision(job,input.verified_tenant_id,{actor_role:"customer",actor_id:"synthetic-buyer",action:"approve"}).reason,"owner_required");
assert.equal(ownerDecision(job,input.verified_tenant_id,{...owner,action:"request_changes",notes:""}).reason,"revision_notes_required");
result=ownerDecision(job,input.verified_tenant_id,{...owner,action:"request_changes",notes:"Use a warmer hero headline and a wider licensed photo"});
assert.equal(result.ok,true);job=result.job;assert.equal(job.stage,"creative");assert.equal(job.owner_review.approved,false);
assert.equal(releaseGate(job,input.verified_tenant_id,{...owner,explicit_publish_approval:true}).reason,"approval_required");
// A revision must pass development and all QA gates again.
result=submitDesign(job,input.verified_tenant_id,design("Welcome home to clean"));assert.equal(result.ok,true);job=result.job;
result=submitBuild(job,input.verified_tenant_id,{tenant_id:input.verified_tenant_id,private_preview_id:"synthetic-preview-rev2",artifact_commit:"synthetic-sha-rev2"});assert.equal(result.ok,true);job=result.job;
assert.equal(ownerDecision(job,input.verified_tenant_id,{...owner,action:"approve"}).reason,"qa_or_review_missing");
result=submitQa(job,input.verified_tenant_id,proof());assert.equal(result.ok,true);job=result.job;
result=ownerDecision(job,input.verified_tenant_id,{...owner,action:"approve",notes:"Private design approved; no publication"});assert.equal(result.ok,true);job=result.job;
assert.equal(job.stage,"approved");assert.equal(job.owner_review.approved,true);
assert.equal(releaseGate(job,input.verified_tenant_id,{...owner}).reason,"publish_authorization_required");
assert.equal(releaseGate(job,"synthetic-tenant-b",{...owner,explicit_publish_approval:true}).reason,"tenant_mismatch");
const gate=releaseGate(job,input.verified_tenant_id,{...owner,explicit_publish_approval:true});
assert.equal(gate.ok,true);assert.equal(gate.release_ready,true);assert.match(gate.notice,/No deployment/);
assert.equal(job.release,null);assert.equal(job.history.filter(x=>x.stage==="owner_review").length,2);
assert.equal(job.design.hero_title,"Welcome home to clean");
console.log("PASS: 18 QA gates, research → custom design → private build → QA → owner revision → rebuild → re-QA → approval; tenant isolation and separate release authorization. Synthetic only; no side effects.");
