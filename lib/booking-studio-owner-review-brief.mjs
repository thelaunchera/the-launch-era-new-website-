/**
 * Booking Studio owner review briefing (synthetic / pure).
 * This is a deterministic review handoff, not an AI message, approval, or release.
 */
const text=(x,max=600)=>typeof x==="string"?x.trim().slice(0,max):"";
const allowed=new Set(["development","qa","owner_review","approved"]);
export function buildOwnerReviewBrief(job,{qaEvidence=[],ownerNotes=""}={}){
 if(!job||!allowed.has(job.stage)||!job.client?.business_name||!job.design||!job.research||!job.tenant_id)
  throw Error("Verified tenant-scoped design required");
 const qa=Array.isArray(qaEvidence)?qaEvidence:[];
 const findings=qa.map(x=>({id:text(x.id,80),passed:x.passed===true,evidence:text(x.evidence,500)}));
 const missing=findings.filter(x=>!x.passed||!x.evidence);
 const design=job.design;
 const photos=(Array.isArray(design.photos)?design.photos:[]).map(p=>({usage:text(p.usage,60),license_recorded:!!text(p.license),rights_verified:p.verified===true}));
 const unknowns=(Array.isArray(job.research.unknowns)?job.research.unknowns:[]).map(x=>text(x,220)).filter(Boolean);
 const readyForOwner=job.stage==="owner_review"&&job.qa?.passed===true&&findings.length===18&&missing.length===0&&unknowns.length===0&&photos.length>0&&photos.every(p=>p.rights_verified);
 return {
  type:"booking-studio-owner-review-brief-v1",fictional_only:job.tenant_id.startsWith("synthetic-"),
  business_name:text(job.client.business_name,160),tenant_id:job.tenant_id,
  stage:job.stage,layout:text(design.layout,40),typography:text(design.typography,40),
  headline:text(design.hero_title,160),rationale:text(design.design_rationale,800),
  services:(job.client.services||[]).map(s=>({name:text(s.name,140),mode:s.mode,price:s.mode==="flat"?s.price:null})),
  photo_evidence:photos,unresolved_questions:unknowns,
  qa:{evidence_count:findings.length,failed_or_missing:missing.map(x=>x.id),passed:findings.length===18&&missing.length===0},
  owner_request:text(ownerNotes,1200),owner_decision:"PENDING",
  can_offer_approval:readyForOwner,can_publish:false,client_notified:false,
  warning:readyForOwner?"Owner can review private design; publishing remains separately gated.":"Private draft only. Missing independent evidence; approval blocked."
 };
}
