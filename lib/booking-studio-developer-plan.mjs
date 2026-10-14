/**
 * AI Developer handoff: deterministic, tenant-scoped build plan.
 * This module never reads live customer data or publishes a page.
 * It separates what can be rendered in a private visual preview from
 * integrations that MUST be wired and tested in a client-specific branch.
 */
const clean=(v,max=200)=>typeof v==="string"?v.trim().slice(0,max):"";
const validId=v=>typeof v==="string"&&/^[a-zA-Z0-9_-]{3,128}$/.test(v);
const safeUrl=v=>{try{const u=new URL(v);return u.protocol==="https:"&&!u.username&&!u.password?u.href:null}catch{return null}};
const supported=new Set(["editorial","immersive","split","minimal"]);
export function planBookingBuild(job,verifiedTenantId){
 if(!job||!validId(verifiedTenantId)||job.tenant_id!==verifiedTenantId)return {ok:false,reason:"tenant_mismatch"};
 if(job.stage!=="development"||!job.design||!job.research||!job.client)return {ok:false,reason:"creative_handoff_required"};
 if(!validId(job.order_id)||!supported.has(job.design.layout))return {ok:false,reason:"invalid_job"};
 const photos=(job.design.photos||[]).map(p=>({url:safeUrl(p.url),license:clean(p.license),usage:clean(p.usage,40)}));
 if(!photos.length||photos.some(p=>!p.url||!p.license||!p.usage))return {ok:false,reason:"licensed_assets_required"};
 const services=(job.client.services||[]).map(s=>({name:clean(s.name,160),mode:s.mode==="flat"?"flat":"quote",price:s.mode==="flat"&&Number.isFinite(s.price)&&s.price>=0?s.price:null}));
 if(!services.length||services.some(s=>!s.name||(s.mode==="flat"&&s.price===null)))return {ok:false,reason:"verified_services_required"};
 const checklist=[
  {id:"tenant_binding",state:"blocked_until_verified",requirement:"Authorize every booking, quote, lead and follow-up request against this exact customer workspace."},
  {id:"booking_quote",state:"blocked_until_verified",requirement:"Wire real booking and quote submission to the authorized customer backend; verify persisted results."},
  {id:"frequency_addons",state:"blocked_until_verified",requirement:"Match frequency, add-ons and estimate rules to approved intake and test real calculations."},
  {id:"zip_service_area",state:"blocked_until_verified",requirement:"Test allowed ZIPs and distance rules against the customer configuration."},
  {id:"consent_notifications",state:"blocked_until_verified",requirement:"Verify consent and approved customer email follow-up behavior; never send from visual preview."},
  {id:"responsive_accessibility",state:"blocked_until_verified",requirement:"Test real client build on mobile, tablet, desktop and keyboard."},
  {id:"owner_release",state:"blocked_until_verified",requirement:"Private QA evidence and explicit owner publication approval required."}
 ];
 return {ok:true,kind:"private_developer_plan",publishable:false,customer_notified:false,preview_only:true,
  tenant_id:verifiedTenantId,order_id:job.order_id,base_version:clean(job.base_version,80),
  design:{layout:job.design.layout,cards:job.design.cards,typography:job.design.typography},
  services,licensed_assets:photos,blocked_integrations:checklist,
  next_step:"Build in isolated tenant branch and replace each blocked integration with real verified evidence."};
}
