/**
 * TLE Booking Studio · deterministic, side-effect-free production contract.
 * This module NEVER accesses accounts, websites, email, payments or deploys code.
 * Runtime connectors must enforce owner auth and tenant-scoped reads independently.
 */
export const BOOKING_MASTER="templates/booking-page-master/v1-2026-10-14";
export const STAGES=Object.freeze(["intake","research","creative","development","qa","owner_review","approved","released"]);
export const REQUIRED_QA=Object.freeze([
 "tenant_isolation","payment_verified","intake_verified","assets_licensed",
 "brand_accuracy","no_invented_claims","services_and_prices","booking_and_quote",
 "frequency_and_addons","service_area","email_permissions","links",
 "mobile","tablet","desktop","accessibility","en_es","customer_data_protected"
]);
const string=(value,max=240)=>typeof value==="string"?value.trim().slice(0,max):"";
const arr=value=>Array.isArray(value)?value:[];
const unique=value=>[...new Set(value)];
const has=(x)=>Boolean(string(x));
const safeHex=x=>/^#[a-f0-9]{6}$/i.test(x||"")?x:null;
const safeLink=x=>{try{const u=new URL(x);return ["https:","http:"].includes(u.protocol)&&!u.username&&!u.password?u.href:null}catch{return null}};
const normText=x=>string(x,3000);
const modes=new Set(["editorial","immersive","split","minimal"]);
const cardModes=new Set(["photographic","editorial","compact","tiles"]);
const typeModes=new Set(["modern","elegant","friendly"]);
export function assessIntake(input={}){
 const required=["business_name","business_type","service_areas","services","contact_email","booking_policy"];
 const missing=required.filter(k=>k==="services"||k==="service_areas"?arr(input[k]).length===0:!has(input[k]));
 if(!input.verified_tenant_id)missing.unshift("verified_tenant_id");
 if(input.payment_status!=="paid")missing.unshift("paid_order");
 if(input.owner_start_approved!==true)missing.push("owner_start_approval");
 return {ready:missing.length===0,missing:unique(missing)};
}
export function createStudioJob(input={}){
 const readiness=assessIntake(input);
 if(!readiness.ready)return {ok:false,reason:"intake_not_ready",missing:readiness.missing};
 const tenant=string(input.verified_tenant_id,128),order=string(input.order_id,128);
 if(!order)return {ok:false,reason:"missing_order_id"};
 const cleanServices=arr(input.services).filter(s=>has(s?.name)).map(s=>({
   name:string(s.name),mode:["flat","quote","estimate"].includes(s.mode)?s.mode:"quote",
   price:Number.isFinite(s.price)&&s.price>=0?s.price:null,category:string(s.category,40)
 }));
 if(!cleanServices.length)return {ok:false,reason:"missing_valid_services"};
 if(cleanServices.some(s=>s.mode==="flat"&&s.price===null))return {ok:false,reason:"missing_flat_price"};
 const job={
   schema_version:1,base_version:"v1-2026-10-14",source_path:BOOKING_MASTER,
   tenant_id:tenant,order_id:order,stage:"research",history:[{stage:"research",by:"system",note:"Verified intake; awaiting research evidence"}],
   client:{business_name:string(input.business_name),business_type:string(input.business_type),
     contact_email:string(input.contact_email),service_areas:arr(input.service_areas).map(x=>string(x,120)).filter(Boolean),
     services:cleanServices,booking_policy:string(input.booking_policy,2000),
     website:safeLink(input.website),social_urls:arr(input.social_urls).map(safeLink).filter(Boolean)},
   research:null,design:null,build:null,qa:null,owner_review:null,release:null
 };
 return {ok:true,job};
}
function sameTenant(job,verifiedTenantId){
 return has(job?.tenant_id)&&has(verifiedTenantId)&&job.tenant_id===verifiedTenantId;
}
function fail(reason){return {ok:false,reason}};
function move(job,stage,actor,note,patch={}){
 return {ok:true,job:{...job,...patch,stage,history:[...job.history,{stage,by:actor,note:string(note,500)}]}};
}
export function submitResearch(job,verifiedTenantId,research={}){
 if(!sameTenant(job,verifiedTenantId))return fail("tenant_mismatch");
 if(job.stage!=="research")return fail("invalid_stage");
 const sources=arr(research.sources).map(x=>({url:safeLink(x.url),purpose:string(x.purpose,100)})).filter(x=>x.url);
 const facts=arr(research.facts).map(x=>({claim:normText(x.claim),source_url:safeLink(x.source_url)})).filter(x=>x.claim&&x.source_url&&sources.some(s=>s.url===x.source_url));
 if(!sources.length||!facts.length)return fail("research_evidence_required");
 return move(job,"creative","creative","Brand research and evidence prepared",{research:{sources,facts,unknowns:arr(research.unknowns).map(x=>string(x)).filter(Boolean)}});
}
export function submitDesign(job,verifiedTenantId,design={}){
 if(!sameTenant(job,verifiedTenantId))return fail("tenant_mismatch");
 if(job.stage!=="creative")return fail("invalid_stage");
 const layout=string(design.layout,40),cards=string(design.cards,40),typography=string(design.typography,40);
 if(!modes.has(layout)||!cardModes.has(cards)||!typeModes.has(typography))return fail("invalid_design_system");
 const primary=safeHex(design.primary_color),accent=safeHex(design.accent_color);
 if(!primary||!accent)return fail("invalid_brand_colors");
 const photos=arr(design.photos).map(x=>({url:safeLink(x.url),license:string(x.license,180),usage:string(x.usage,80)}));
 if(!photos.length||photos.some(p=>!p.url||!p.license||!p.usage))return fail("photo_license_required");
 const heroTitle=string(design.hero_title,160),heroBody=string(design.hero_body,480);
 if(!heroTitle||!heroBody||!has(design.design_rationale))return fail("design_content_required");
 if(design.reviews?.length)return fail("reviews_require_separate_verified_data");
 return move(job,"development","creative","Distinct visual direction and licensed imagery",{design:{
   layout,cards,typography,primary_color:primary,accent_color:accent,
   hero_title:heroTitle,hero_body:heroBody,photos,
   section_order:unique(arr(design.section_order).map(x=>string(x,40))).filter(x=>["services","benefits","process","booking","reviews"].includes(x)),
   design_rationale:string(design.design_rationale,800),verified_claims_only:true
 }});
}
export function submitBuild(job,verifiedTenantId,build={}){
 if(!sameTenant(job,verifiedTenantId))return fail("tenant_mismatch");
 if(job.stage!=="development")return fail("invalid_stage");
 if(!has(build.private_preview_id)||!has(build.artifact_commit)||build.tenant_id!==job.tenant_id)return fail("build_evidence_required");
 if(build.published===true||build.client_notified===true)return fail("premature_external_action");
 return move(job,"qa","developer","Private build prepared for QA",{build:{
   tenant_id:job.tenant_id,private_preview_id:string(build.private_preview_id,160),
   artifact_commit:string(build.artifact_commit,100),published:false,client_notified:false
 }});
}
export function submitQa(job,verifiedTenantId,results={}){
 if(!sameTenant(job,verifiedTenantId))return fail("tenant_mismatch");
 if(job.stage!=="qa")return fail("invalid_stage");
 const tests=arr(results.tests),lookup=new Map(tests.map(t=>[t.id,t]));
 const failed=REQUIRED_QA.filter(id=>lookup.get(id)?.passed!==true||!has(lookup.get(id)?.evidence));
 if(failed.length)return move(job,"development","qa","QA failed; changes required",{qa:{passed:false,failed}});
 return move(job,"owner_review","qa","All required QA evidence recorded",{qa:{passed:true,tests:REQUIRED_QA.map(id=>({id,evidence:string(lookup.get(id).evidence,800)}))}});
}
export function ownerDecision(job,verifiedTenantId,decision={}){
 if(!sameTenant(job,verifiedTenantId))return fail("tenant_mismatch");
 if(job.stage!=="owner_review"||job.qa?.passed!==true)return fail("qa_or_review_missing");
 if(decision.actor_role!=="platform_owner"||!has(decision.actor_id))return fail("owner_required");
 if(decision.action==="request_changes"){
   if(!has(decision.notes))return fail("revision_notes_required");
   return move(job,"creative","owner","Owner requested changes",{owner_review:{approved:false,notes:string(decision.notes,1200),actor_id:string(decision.actor_id)}});
 }
 if(decision.action!=="approve")return fail("invalid_decision");
 return move(job,"approved","owner","Owner approved the verified preview",{owner_review:{approved:true,actor_id:string(decision.actor_id),notes:string(decision.notes,1200)}});
}
export function releaseGate(job,verifiedTenantId,authorization={}){
 if(!sameTenant(job,verifiedTenantId))return fail("tenant_mismatch");
 if(job.stage!=="approved"||job.qa?.passed!==true||job.owner_review?.approved!==true)return fail("approval_required");
 if(authorization.actor_role!=="platform_owner"||authorization.explicit_publish_approval!==true)return fail("publish_authorization_required");
 return {ok:true,release_ready:true,tenant_id:job.tenant_id,order_id:job.order_id,
   preview_id:job.build.private_preview_id,artifact_commit:job.build.artifact_commit,
   notice:"Authorization gate only. No deployment, emails or client writes performed."};
}
