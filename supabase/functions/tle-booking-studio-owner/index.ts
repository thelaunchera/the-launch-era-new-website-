import "jsr:@supabase/functions-js/edge-runtime.d.ts";
/**
 * TLE Booking Studio owner-only API (staging implementation).
 * No publication, email, DNS, payments or customer booking mutations.
 * Every request verifies platform_admins + an INTERNAL owner workspace.
 */
const BASE=Deno.env.get("SUPABASE_URL")||"";
const SR=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")||"";
const ANON=Deno.env.get("SUPABASE_ANON_KEY")||"";
const ORIGINS=new Set(["https://command.thelaunchera.com","https://thelaunchera.com","https://www.thelaunchera.com"]);
const STAGES=new Set(["research","creative","development","qa","owner_review","approved","blocked"]);
const QA_IDS=["tenant_isolation","payment_verified","intake_verified","assets_licensed","brand_accuracy","no_invented_claims","services_and_prices","booking_and_quote","frequency_and_addons","service_area","email_permissions","links","mobile","tablet","desktop","accessibility","en_es","customer_data_protected"];
const uuid=x=>/^[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(String(x||""));
const str=(x,max=500)=>typeof x==="string"?x.trim().slice(0,max):"";
const validHex=x=>/^#[a-f0-9]{6}$/i.test(x||"");
const safeUrl=x=>{try{const u=new URL(x);return u.protocol==="https:"&&!u.username&&!u.password?u.href:null}catch{return null}};
const headers=o=>({"Content-Type":"application/json","Cache-Control":"no-store","Vary":"Origin","Access-Control-Allow-Origin":ORIGINS.has(o)?o:"https://command.thelaunchera.com","Access-Control-Allow-Headers":"authorization,apikey,content-type","Access-Control-Allow-Methods":"POST,OPTIONS"});
const response=(o,code,data)=>new Response(JSON.stringify(data),{status:code,headers:headers(o)});
async function rest(table,query="",method="GET",body=null){
 const url=BASE+"/rest/v1/"+table+(query?"?"+query:"");
 const h={apikey:SR,Authorization:"Bearer "+SR};
 if(body!==null)h["Content-Type"]="application/json";
 if(method!=="GET")h.Prefer="return=representation";
 const r=await fetch(url,{method,headers:h,body:body===null?undefined:JSON.stringify(body),signal:AbortSignal.timeout(8000)});
 if(!r.ok)throw Error("Data unavailable ("+r.status+")");
 return r.status===204?[]:await r.json();
}
async function auth(req){
 if(!BASE||!SR||!ANON)throw Error("unavailable");
 const token=req.headers.get("authorization")||"";
 if(!token.startsWith("Bearer "))throw Error("unauthorized");
 const userReq=await fetch(BASE+"/auth/v1/user",{headers:{apikey:ANON,Authorization:token},signal:AbortSignal.timeout(6500)});
 if(!userReq.ok)throw Error("unauthorized");
 const user=await userReq.json();
 if(!uuid(user.id))throw Error("unauthorized");
 const admin=await rest("platform_admins","user_id=eq."+encodeURIComponent(user.id)+"&select=user_id&limit=1");
 if(admin.length!==1)throw Error("unauthorized");
 const ws=await rest("tle_crm_workspaces","created_by=eq."+encodeURIComponent(user.id)+"&is_internal=eq.true&select=id&limit=1");
 if(ws.length!==1)throw Error("unauthorized");
 return {owner:user.id,workspace:ws[0].id};
}
const scope=ctx=>"owner_id=eq."+ctx.owner+"&owner_workspace_id=eq."+ctx.workspace;
async function bookingAccount(ctx,id){
 if(!uuid(id))throw Error("Invalid account");
 const a=await rest("tle_booking_flow_accounts","id=eq."+id+"&crm_workspace_id=not.is.null&payment_status=eq.paid&select=id,crm_workspace_id,business_name,payment_status,intake_completed_at,intake_payload,build_started_at,delivery_sent_at&limit=1");
 if(a.length!==1)throw Error("Paid booking account unavailable");
 return a[0];
}
function intakeMissing(a){
 const p=a.intake_payload&&typeof a.intake_payload==="object"&&!Array.isArray(a.intake_payload)?a.intake_payload:{};
 const present=x=>Array.isArray(x)?x.length>0:typeof x==="string"?x.trim().length>0:typeof x==="object"&&x!==null?Object.keys(x).length>0:Boolean(x);
 const missing=[];
 if(!a.intake_completed_at)missing.push("completed_intake");
 if(!present(p.services))missing.push("services");
 if(!present(p.service_areas))missing.push("service_areas");
 if(!["pricing_style","quote_estimate_rules","quote_pricing_factors","quote_estimate_examples"].some(k=>present(p[k])))missing.push("pricing_rules");
 if(!["availability","business_hours_display","minimum_booking_notice"].some(k=>present(p[k])))missing.push("availability");
 return missing;
}
async function one(ctx,id){
 if(!uuid(id))throw Error("Invalid job");
 const a=await rest("tle_booking_studio_jobs","id=eq."+id+"&"+scope(ctx)+"&select=*&limit=1");
 if(a.length!==1)throw Error("Job unavailable");
 // Verify this order still belongs to the SAME buyer tenant stored on the job.
 const account=await bookingAccount(ctx,a[0].booking_account_id);
 if(!uuid(a[0].client_workspace_id)||account.crm_workspace_id!==a[0].client_workspace_id)throw Error("Customer tenant mismatch");
 return {job:a[0],account};
}
async function save(ctx,job,patch,action,detail){
 const audit=Array.isArray(job.audit)?job.audit.slice(-75):[];
 audit.push({at:new Date().toISOString(),by:ctx.owner,action,detail:str(detail,350)});
 const rows=await rest("tle_booking_studio_jobs","id=eq."+job.id+"&"+scope(ctx)+"&stage=eq."+job.stage,"PATCH",{...patch,audit,revision:(job.revision||1)+1,updated_at:new Date().toISOString()});
 if(rows.length!==1)throw Error("Concurrent update; refresh");
 return rows[0];
}
function sanitizeResearch(input){
 const sources=(Array.isArray(input?.sources)?input.sources:[]).slice(0,12).map(s=>({url:safeUrl(s.url),purpose:str(s.purpose,120)})).filter(s=>s.url);
 const facts=(Array.isArray(input?.facts)?input.facts:[]).slice(0,24).map(f=>({claim:str(f.claim,700),source_url:safeUrl(f.source_url)})).filter(f=>f.claim&&sources.some(s=>s.url===f.source_url));
 if(!sources.length||!facts.length)throw Error("Cited research sources and facts required");
 return {sources,facts,unknowns:(Array.isArray(input?.unknowns)?input.unknowns:[]).slice(0,15).map(x=>str(x,200)).filter(Boolean)};
}
function sanitizeDesign(d){
 const layouts=["editorial","immersive","split","minimal"],cards=["photographic","editorial","compact","tiles"],types=["modern","elegant","friendly"];
 if(!layouts.includes(d?.layout)||!cards.includes(d?.cards)||!types.includes(d?.typography))throw Error("Select a distinct layout, card style and typography");
 if(!validHex(d.primary_color)||!validHex(d.accent_color))throw Error("Invalid brand colors");
 const photos=(Array.isArray(d.photos)?d.photos:[]).slice(0,15).map(p=>({url:safeUrl(p.url),license:str(p.license,240),usage:str(p.usage,60)}));
 if(!photos.length||photos.some(p=>!p.url||!p.license||!p.usage))throw Error("Licensed image evidence required");
 if(!str(d.hero_title,160)||!str(d.hero_body,600)||!str(d.design_rationale,1000))throw Error("Custom hero and design rationale required");
 if(d.reviews?.length)throw Error("Unverified reviews not accepted");
 return {layout:d.layout,cards:d.cards,typography:d.typography,primary_color:d.primary_color,accent_color:d.accent_color,
   photos,hero_title:str(d.hero_title,160),hero_body:str(d.hero_body,600),design_rationale:str(d.design_rationale,1000),
   section_order:[...new Set((Array.isArray(d.section_order)?d.section_order:[]).filter(x=>["services","benefits","process","booking"].includes(x)))]};
}
Deno.serve(async req=>{
 const origin=req.headers.get("origin")||"";
 if(req.method==="OPTIONS")return new Response(null,{status:204,headers:headers(origin)});
 if(req.method!=="POST")return response(origin,405,{ok:false,error:"Method not allowed"});
 if(origin&&!ORIGINS.has(origin))return response(origin,403,{ok:false,error:"Origin not allowed"});
 try{
  const ctx=await auth(req),body=await req.json(),action=str(body.action,40);
  if(action==="list"){
   const jobs=await rest("tle_booking_studio_jobs",scope(ctx)+"&select=id,booking_account_id,stage,base_version,revision,updated_at,created_at&order=updated_at.desc&limit=50");
   const accounts=await rest("tle_booking_flow_accounts","crm_workspace_id=not.is.null&payment_status=eq.paid&select=id,crm_workspace_id,business_name,intake_completed_at,intake_payload,delivery_sent_at&order=created_at.desc&limit=50");
   return response(origin,200,{ok:true,owner_only:true,jobs,accounts:accounts.map(a=>({id:a.id,business_name:a.business_name,ready:intakeMissing(a).length===0,missing:intakeMissing(a),delivered:!!a.delivery_sent_at})),external_actions_enabled:false});
  }
  if(action==="start"){
   const account=await bookingAccount(ctx,body.account_id),missing=intakeMissing(account);
   if(missing.length)return response(origin,409,{ok:false,error:"Intake incomplete",missing});
   if(account.delivery_sent_at)return response(origin,409,{ok:false,error:"Already delivered; no duplicate production"});
   if(body.owner_start_approved!==true)return response(origin,403,{ok:false,error:"Owner must approve production start"});
   const existing=await rest("tle_booking_studio_jobs",scope(ctx)+"&booking_account_id=eq."+account.id+"&select=id&limit=1");
   if(existing.length)return response(origin,409,{ok:false,error:"Existing project; open instead",job_id:existing[0].id});
   const rows=await rest("tle_booking_studio_jobs","","POST",{owner_id:ctx.owner,owner_workspace_id:ctx.workspace,booking_account_id:account.id,client_workspace_id:account.crm_workspace_id,stage:"research",base_version:"v1-2026-10-14",audit:[{at:new Date().toISOString(),by:ctx.owner,action:"start",detail:"Paid client tenant and completed intake verified; owner authorized research"}]});
   return response(origin,200,{ok:true,job:rows[0],external_actions_executed:false});
  }
  const {job,account}=await one(ctx,body.job_id);
  if(action==="get"){
   const p=account.intake_payload&&typeof account.intake_payload==="object"&&!Array.isArray(account.intake_payload)?account.intake_payload:{};
   const services=(Array.isArray(p.services)?p.services:[]).slice(0,24).map(item=>{
     if(typeof item==="string")return {name:str(item,160),mode:"quote",price:null};
     if(!item||typeof item!=="object")return null;
     const price=typeof item.price==="number"&&Number.isFinite(item.price)&&item.price>=0?item.price:null;
     return {name:str(item.name||item.service_name,160),mode:item.mode==="flat"&&price!==null?"flat":"quote",price};
   }).filter(x=>x?.name);
   return response(origin,200,{ok:true,job,account:{id:account.id,business_name:account.business_name,missing:intakeMissing(account),services},external_actions_enabled:false});
  }
  if(action==="research_from_intake"){
   if(job.stage!=="research")return response(origin,409,{ok:false,error:"Not in research stage"});
   if(intakeMissing(account).length)return response(origin,409,{ok:false,error:"Completed intake required"});
   const p=account.intake_payload&&typeof account.intake_payload==="object"&&!Array.isArray(account.intake_payload)?account.intake_payload:{};
   const facts=[];
   const fact=(label,value)=>{const v=str(value,240);if(v)facts.push({claim:label+": "+v,source_type:"verified_intake",source_url:null})};
   fact("Business name",account.business_name);
   fact("About the business",p.about_business);
   fact("Preferred brand colors",p.brand_colors);
   fact("Primary offer",p.main_offer);
   fact("Pricing style",p.pricing_style);
   fact("Preferred language",p.language);
   const serviceNames=Array.isArray(p.services)?p.services.slice(0,16).map(x=>typeof x==="string"?str(x,90):str(x?.name||x?.service_name,90)).filter(Boolean):[];
   if(serviceNames.length)fact("Services supplied in intake",serviceNames.join(", "));
   const areaNames=Array.isArray(p.service_areas)?p.service_areas.slice(0,15).map(x=>typeof x==="string"?str(x,90):str(x?.name||x?.zip,90)).filter(Boolean):[];
   if(areaNames.length)fact("Service areas supplied in intake",areaNames.join(", "));
   const website=safeUrl(p.existing_domain)||null,instagram=safeUrl(p.instagram_url)||null,google=safeUrl(p.google_business_url)||null;
   const sources=[{type:"verified_intake",url:null,purpose:"Customer-submitted intake; not independently corroborated"}];
   const unknowns=["Website and social media branding not independently verified","Photo ownership and licensing not verified","Reviews, claims, prices and booking behavior require independent QA"];
   if(website)unknowns.push("Website research pending: "+website);
   if(instagram)unknowns.push("Instagram research pending: "+instagram);
   if(google)unknowns.push("Google Business research pending: "+google);
   if(facts.length<3)return response(origin,409,{ok:false,error:"Insufficient intake brand facts; research manually"});
   const research={sources,facts,unknowns,provenance:"customer_intake",external_research_verified:false,images_verified:false};
   const next=await save(ctx,job,{research,stage:"creative"},"intake_research","Structured customer intake facts; external research explicitly pending");
   return response(origin,200,{ok:true,job:next,research_status:"intake_only",external_research_verified:false});
  }
  if(action==="research"){
   if(job.stage!=="research")return response(origin,409,{ok:false,error:"Not in research stage"});
   const research=sanitizeResearch(body.research);
   const next=await save(ctx,job,{research,stage:"creative"},"research_verified","Evidence-backed brand research recorded");
   return response(origin,200,{ok:true,job:next});
  }
  if(action==="creative_suggest"){
   if(job.stage!=="creative")return response(origin,409,{ok:false,error:"Research must be verified first"});
   const key=str(Deno.env.get("GROQ_API_KEY"),300);
   if(!key)return response(origin,503,{ok:false,error:"AI Creative provider not configured"});
   const p=account.intake_payload&&typeof account.intake_payload==="object"&&!Array.isArray(account.intake_payload)?account.intake_payload:{};
   const brief={business_name:str(account.business_name,140),business_type:str(p.business_type||p.industry||"cleaning",100),
     verified_facts:job.research?.facts||[],unknowns:job.research?.unknowns||[],
     services:Array.isArray(p.services)?p.services.slice(0,15):[],
     brand_preferences:{colors:str(p.brand_colors||p.colors,120),tone:str(p.brand_tone||p.style,160)}};
   const system="You are AI Creative for The Launch Era owner-only Booking Studio. Return ONLY a JSON object with layout (editorial, immersive, split, minimal), cards (photographic, editorial, compact, tiles), typography (modern, elegant, friendly), primary_color and accent_color as hex, hero_title (max 120 chars), hero_body (max 280 chars), design_rationale (max 400 chars), photo_direction (max 200 chars). Make it specific to the business and cited facts, not a generic template. Do not invent reviews, locations, certifications, prices, history, photos, image licenses or services. If data is missing, do not claim it. No HTML.";
   const ai=await fetch("https://api.groq.com/openai/v1/chat/completions",{method:"POST",headers:{Authorization:"Bearer "+key,"Content-Type":"application/json"},body:JSON.stringify({model:Deno.env.get("GROQ_MODEL")||"openai/gpt-oss-120b",temperature:0.45,max_tokens:750,messages:[{role:"system",content:system},{role:"user",content:JSON.stringify(brief).slice(0,6500)}]}),signal:AbortSignal.timeout(16000)});
   if(!ai.ok)return response(origin,503,{ok:false,error:"AI Creative generation unavailable"});
   const result=await ai.json(),raw=str(result?.choices?.[0]?.message?.content,5000);
   let parsed={};
   try{parsed=JSON.parse(raw.replace(/^\`\`\`(?:json)?/i,"").replace(/\`\`\`$/,"").trim())}catch{return response(origin,503,{ok:false,error:"Creative draft format unavailable; retry"})}
   if(!["editorial","immersive","split","minimal"].includes(parsed.layout)||!["photographic","editorial","compact","tiles"].includes(parsed.cards)
     ||!["modern","elegant","friendly"].includes(parsed.typography)||!validHex(parsed.primary_color)||!validHex(parsed.accent_color))
     return response(origin,503,{ok:false,error:"Creative draft failed validation"});
   const suggestion={layout:parsed.layout,cards:parsed.cards,typography:parsed.typography,
     primary_color:parsed.primary_color,accent_color:parsed.accent_color,hero_title:str(parsed.hero_title,160),
     hero_body:str(parsed.hero_body,600),design_rationale:str(parsed.design_rationale,800),photo_direction:str(parsed.photo_direction,240)};
   if(!suggestion.hero_title||!suggestion.hero_body||!suggestion.design_rationale)
     return response(origin,503,{ok:false,error:"Creative draft incomplete"});
   return response(origin,200,{ok:true,suggestion,source:"groq",status:"draft",requires_owner_review:true,photos_verified:false,published:false});
  }
  if(action==="design"){
   if(job.stage!=="creative")return response(origin,409,{ok:false,error:"Not in creative stage"});
   const design=sanitizeDesign(body.design);
   const next=await save(ctx,job,{design,stage:"development",qa:{},build:{}},"creative_ready","Unique design direction and licensed imagery recorded");
   return response(origin,200,{ok:true,job:next});
  }
  if(action==="build"){
   if(job.stage!=="development")return response(origin,409,{ok:false,error:"Not in development stage"});
   const b=body.build||{};
   if(!str(b.private_preview_id,160)||!str(b.artifact_commit,100)||b.tenant_id!==job.client_workspace_id||b.published||b.client_notified)
     return response(origin,409,{ok:false,error:"Private, tenant-scoped build evidence required"});
   const next=await save(ctx,job,{build:{private_preview_id:str(b.private_preview_id,160),artifact_commit:str(b.artifact_commit,100),tenant_id:job.client_workspace_id,published:false,client_notified:false},stage:"qa"},"build_ready","Private build artifact registered; no publication");
   return response(origin,200,{ok:true,job:next});
  }
  if(action==="qa"){
   if(job.stage!=="qa")return response(origin,409,{ok:false,error:"Not in QA stage"});
   const tests=Array.isArray(body.tests)?body.tests:[];
   const map=new Map(tests.map(t=>[t.id,t]));
   const failed=QA_IDS.filter(id=>map.get(id)?.passed!==true||!str(map.get(id)?.evidence,800));
   const passed=failed.length===0;
   const next=await save(ctx,job,{qa:{passed,failed,tests:passed?QA_IDS.map(id=>({id,evidence:str(map.get(id).evidence,800)})):[]},stage:passed?"owner_review":"development"},"qa_review",passed?"Evidence-backed QA passed":"QA failed; return to Developer");
   return response(origin,200,{ok:true,job:next,failed});
  }
  if(action==="review"){
   if(job.stage!=="owner_review"||job.qa?.passed!==true)return response(origin,409,{ok:false,error:"QA must pass first"});
   if(body.decision==="request_changes"){
    if(!str(body.notes,1200))return response(origin,400,{ok:false,error:"Revision notes required"});
    const next=await save(ctx,job,{stage:"creative",owner_review:{approved:false,notes:str(body.notes,1200),actor_id:ctx.owner},qa:{}},"owner_changes","Owner requested creative revision");
    return response(origin,200,{ok:true,job:next});
   }
   if(body.decision!=="approve"||body.owner_confirmed!==true)return response(origin,403,{ok:false,error:"Explicit owner approval required"});
   const next=await save(ctx,job,{stage:"approved",owner_review:{approved:true,actor_id:ctx.owner,notes:str(body.notes,1200),approved_at:new Date().toISOString()}},"owner_approved","Owner approved private preview; NOT published");
   return response(origin,200,{ok:true,job:next,published:false,external_actions_executed:false});
  }
  return response(origin,400,{ok:false,error:"Unsupported action"});
 }catch(e){
  const msg=String(e?.message||"Unavailable");
  const unauthorized=msg==="unauthorized";
  return response(origin,unauthorized?401:503,{ok:false,error:unauthorized?"Owner authorization required":msg.slice(0,180)});
 }
});
