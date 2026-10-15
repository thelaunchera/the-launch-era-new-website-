// The Launch Era — read-only public brand-reference research worker.
// Authenticated by an existing private CRM worker credential, never by a customer.
// Never use untrusted website text as operational instructions.
import {createClient} from "npm:@supabase/supabase-js@2.57.0";
const answer=(status:number,body:unknown)=>new Response(JSON.stringify(body),{status,headers:{"Content-Type":"application/json","Cache-Control":"no-store"}});
const lower=(s:unknown)=>String(s??"").toLowerCase();
const short=(s:unknown,n=160)=>String(s??"").replace(/[\u0000-\u001f\u007f]/g," ").replace(/\s+/g," ").trim().slice(0,n);
const stripped=(s:string)=>s.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi," ").replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi," ").replace(/<!--[\s\S]*?-->/g," ").replace(/<[^>]*>/g," ")
  .replace(/&nbsp;|&#160;/gi," ").replace(/&amp;/gi,"&").replace(/&quot;/gi,'"').replace(/&#39;|&apos;/gi,"'").replace(/&lt;/gi,"<").replace(/&gt;/gi,">").replace(/&#(\d+);/g,(_,d)=>String.fromCharCode(Math.min(Number(d),65535))).replace(/\s+/g," ").trim();
const simple=(s:unknown)=>lower(s).normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g," ").replace(/\s+/g," ").trim();
type MetaResult={url:string;status:string;http_status:number|null;title:string;description:string;heading:string;sample:string};
const unsafeIpv4=(ip:string)=>{
 const a=ip.split(".").map(Number);
 return a.length!==4||a.some(n=>!Number.isInteger(n)||n<0||n>255)||a[0]===0||a[0]===10||a[0]===127||a[0]>=224
  ||(a[0]===100&&a[1]>=64&&a[1]<=127)||(a[0]===169&&a[1]===254)||(a[0]===172&&a[1]>=16&&a[1]<=31)
  ||(a[0]===192&&(a[1]===168||a[1]===0||a[1]===88))||(a[0]===198&&(a[1]===18||a[1]===19))
  ||(a[0]===192&&a[1]===0&&a[2]===0)||(a[0]===198&&a[1]===51&&a[2]===100)
  ||(a[0]===203&&a[1]===0&&a[2]===113);
};
function normalizedUrl(input:string):URL|null{
 try{
  if(input.length>600||/[\s<>"'\\]/.test(input))return null;
  const u=new URL(input);
  if(u.protocol!=="https:"||u.username||u.password||u.port&&u.port!=="443")return null;
  if(u.hash)u.hash="";
  const h=u.hostname.toLowerCase();
  if(h.length>190||!h.includes(".")||h==="localhost"||h.endsWith(".local")||h.endsWith(".internal")||h.endsWith(".test")
     ||h.endsWith(".invalid")||h.endsWith(".example")||h.endsWith(".onion")||h.endsWith(".localhost")
     ||h==="metadata.google.internal"||h.match(/^[0-9.]+$/)||h.includes(":")
     ||!h.split(".").every(label=>/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(label))
     ||h.split(".").at(-1)!.length<2)return null;
  // No query parameters; prevents forwarding arbitrary tokens or tracking secrets from intake.
  u.search="";return u;
 }catch{return null}
}
async function dnsPublic(h:string):Promise<boolean>{
 // Resolve through a public DNS-over-HTTPS resolver, then reject local/non-public A/AAAA answers.
 // If DNS proof is missing, do not fetch the customer's target.
 try{
  let hasPublic=false;
  for(const type of ["A","AAAA"]){
   const r=await fetch("https://dns.google/resolve?name="+encodeURIComponent(h)+"&type="+type,{
     headers:{"Accept":"application/dns-json"},redirect:"error",signal:AbortSignal.timeout(3200)});
   if(!r.ok)return false;
   const j=await r.json();
   if(j.Status!==0)return false;
   for(const a of j.Answer||[]){
    if(a.type===1){if(unsafeIpv4(String(a.data)))return false;hasPublic=true}
    if(a.type===28){const ip=lower(a.data);if(!/^[0-9a-f:]+$/.test(ip)||ip==="::1"||ip==="::"||ip.startsWith("fc")||ip.startsWith("fd")||ip.startsWith("fe8")||ip.startsWith("fe9")||ip.startsWith("fea")||ip.startsWith("feb")||ip.startsWith("2001:db8"))return false;hasPublic=true}
   }
  }
  return hasPublic;
 }catch{return false}
}
function meta(raw:string,type:string){
 const tags=raw.match(/<meta\b[^>]*>/gi)||[];
 const rx=type==="description"?/(?:name|property)\s*=\s*["'](?:description|og:description)["']/i:
   /property\s*=\s*["']og:title["']/i;
 for(const tag of tags){
  if(!rx.test(tag))continue;
  const m=tag.match(/\bcontent\s*=\s*(["'])([\s\S]*?)\1/i);
  if(m)return short(stripped(m[2]),240);
 }
 return "";
}
async function inspect(input:string):Promise<MetaResult>{
 const basic:MetaResult={url:short(input,450),status:"not_accessible",http_status:null,title:"",description:"",heading:"",sample:""};
 const u=normalizedUrl(input);
 if(!u)return {...basic,status:"unsafe_or_invalid_url"};
 if(!await dnsPublic(u.hostname))return {...basic,status:"dns_not_public_or_unverified"};
 try{
  const r=await fetch(u.href,{method:"GET",redirect:"manual",headers:{"Accept":"text/html","User-Agent":"TheLaunchEra-PublicBusinessReview/1.0"},signal:AbortSignal.timeout(6500)});
  if(r.status>=300&&r.status<400)return {...basic,status:"redirect_not_followed",http_status:r.status};
  if(r.status===401||r.status===403||r.status===429)return {...basic,status:"restricted_public_access",http_status:r.status};
  if(!r.ok)return {...basic,status:"http_unavailable",http_status:r.status};
  const mime=r.headers.get("content-type")||"";
  if(!mime.toLowerCase().includes("text/html"))return {...basic,status:"not_html",http_status:r.status};
  // Read only the first 150 KB. No scripts are executed and never save the raw page.
  const reader=r.body?.getReader();let raw="";const decoder=new TextDecoder();
  if(reader){let total=0;try{
    while(total<150000){
      const part=await reader.read();if(part.done)break;
      const bytes=part.value.slice(0,150000-total);total+=bytes.length;
      raw+=decoder.decode(bytes,{stream:true});
    }
  }finally{await reader.cancel().catch(()=>{})}}
  else raw=(await r.text()).slice(0,150000);
  const title=short(stripped(raw.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1]||""));
  const heading=short(stripped(raw.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1]||""));
  const description=meta(raw,"description"),og=meta(raw,"title");
  const sample=short(stripped(raw),1400);
  // Instagram may serve a generic login shell: do not mistake that for profile evidence.
  const ig=/(\.|^)instagram\.com$/.test(u.hostname);
  const profile=u.pathname.split("/").filter(Boolean)[0]||"";
  const signals=[title,heading,description,og,sample.slice(0,300)].join(" ");
  if(ig&&(!profile||!simple(signals).includes(simple(profile.replace(/[._]/g," ")))))
   return {...basic,status:"instagram_profile_not_verifiable",http_status:r.status};
  if(!title&&!description&&!heading&&!og)return {...basic,status:"no_public_metadata",http_status:r.status};
  return {url:u.href,status:"public_metadata_retrieved",http_status:r.status,title:og||title,description,heading,sample};
 }catch{return {...basic,status:"request_timed_out_or_blocked"}}
}
function evaluate(source:MetaResult,truth:{business_name:string;services:string[];area:string}){
 if(source.status!=="public_metadata_retrieved")
   return {identity:"unverified",services:[],service_area:"unverified",warning:"Source inaccessible or restricted. No comparison can be verified."};
 const all=simple([source.title,source.description,source.heading,source.sample].join(" "));
 const identity=simple(truth.business_name);
 // Look for a distinctive business identity; generic words should not match.
 const significant=identity.split(" ").filter(w=>w.length>=4&&!["cleaning","services","service","company","group","house","business","llc","inc"].includes(w));
 const identityStatus=significant.length?(significant.some(w=>all.includes(w))?"public_text_supports_name":"name_not_established"):"name_not_established";
 const svc=truth.services.slice(0,7).map(x=>({service:short(x,75),result:simple(x).length>=5&&all.includes(simple(x))?"mentioned_in_public_text":"not_established"}));
 const area=simple(truth.area).slice(0,60);
 return {identity:identityStatus,services:svc,service_area:area.length>=4&&all.includes(area)?"mentioned_in_public_text":"not_established",
  warning:"Not found does NOT mean contradictory; public snippets are incomplete. No pricing, hours or permissions are inferred."};
}
const label=(x:MetaResult)=>x.status==="public_metadata_retrieved"?"RETRIEVED":"NOT VERIFIED";
const out=(s:string,n=5900)=>s.slice(0,n);
Deno.serve(async req=>{
 if(req.method!=="POST")return answer(405,{ok:false,error:"Method not allowed"});
 const url=Deno.env.get("SUPABASE_URL"),secret=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
 if(!url||!secret)return answer(503,{ok:false,error:"Configuration unavailable"});
 const db=createClient(url,secret,{auth:{persistSession:false,autoRefreshToken:false}});
 const token=req.headers.get("x-tle-worker-token")||"";
 if(token.length!==64)return answer(401,{ok:false,error:"Unauthorized"});
 const {data:valid,error:authError}=await db.rpc("tle_crm_worker_token_ok",{p_token:token});
 if(authError||valid!==true)return answer(401,{ok:false,error:"Unauthorized"});
 const {data:ws,error:wsErr}=await db.from("tle_crm_workspaces").select("id,created_by").eq("is_internal",true);
 if(wsErr||!ws||ws.length!==1)return answer(503,{ok:false,error:"Internal workspace not uniquely verified"});
 const scope=ws[0];
 const {data:admins,error:admErr}=await db.from("platform_admins").select("user_id").eq("user_id",scope.created_by);
 if(admErr||admins?.length!==1)return answer(503,{ok:false,error:"Admin scope unverified"});
 const {data:tasks,error:tasksErr}=await db.from("tle_ai_team_tasks")
   .select("id,workspace_id,owner_id,agent_key,title,automation_key,status,task_origin")
   .eq("workspace_id",scope.id).eq("owner_id",scope.created_by).eq("agent_key","creative")
   .eq("task_origin","platform_event").in("status",["planned","in_progress","needs_approval","approved"])
   .order("created_at",{ascending:true}).limit(100);
 if(tasksErr)return answer(503,{ok:false,error:"Task source unavailable"});
 let attempted=0,created=0,blocked=0;
 for(const task of tasks||[]){
   if(attempted>=3)break;
   const key=String(task.automation_key||"");
   if(!/^(brand-references|ai-brand-references):[0-9a-f-]{36}$/i.test(key))continue;
   const {data:existing}=await db.from("tle_ai_team_outputs").select("id")
      .eq("workspace_id",scope.id).eq("automation_key","public-audit:"+task.id).limit(1);
   if(existing?.length)continue;
   const orderId=key.split(":")[1],isAi=key.startsWith("ai-");
   let business="",intake:any={},sourceUrls:string[]=[];
   if(isAi){
    const {data:o}=await db.from("tle_ai_agent_orders")
      .select("business_name,website_url,booking_page_url,services_offered,submitted_at,delivered_at")
      .eq("id",orderId).eq("tle_sales_workspace_id",scope.id).is("delivered_at",null).maybeSingle();
    if(!o?.submitted_at)continue;
    business=short(o.business_name,110);
    sourceUrls=[o.website_url,o.booking_page_url].filter(Boolean);
    intake={services:o.services_offered};
   }else{
    const {data:o}=await db.from("tle_booking_flow_accounts")
      .select("business_name,intake_payload,delivery_sent_at,intake_completed_at,payment_status")
      .eq("id",orderId).eq("tle_sales_workspace_id",scope.id).eq("payment_status","paid").is("delivery_sent_at",null).maybeSingle();
    if(!o?.intake_completed_at)continue;
    business=short(o.business_name,110);
    intake=o.intake_payload||{};
    sourceUrls=[intake.existing_domain,intake.instagram_url,intake.google_business_url].filter(Boolean);
   }
   if(!sourceUrls.length)continue;
   attempted++;
   const businessServices=String(intake.services||"").split(/[\n;]/).map(x=>short(x,65)).filter(x=>x.length>=4).slice(0,7);
   const scopedUrls=[...new Set(sourceUrls.map(x=>String(x).slice(0,500)))].slice(0,3);
   const results:MetaResult[]=[];
   for(const candidate of scopedUrls){results.push(await inspect(candidate))}
   const comparisons=results.map(s=>evaluate(s,{business_name:business,services:businessServices,area:String(intake.service_areas||"")}));
   const found=results.filter(s=>s.status==="public_metadata_retrieved").length;
   if(found===0)blocked++;
   const concise=results.map((s,i)=>{
     const c=comparisons[i];
     return [
      "SOURCE "+(i+1)+" — "+label(s),"URL supplied: "+short(s.url,380),
      "Access: "+s.status+(s.http_status?" (HTTP "+s.http_status+")":""),
      "Public title: "+(s.title||"not available"),"Public description: "+(s.description||"not available"),
      "Business-name evidence: "+c.identity,
      "Service-name mentions: "+(c.services.length?c.services.map(x=>x.service+" = "+x.result).join("; "):"no itemized list in intake"),
      "Service-area mention: "+c.service_area
     ].join("\n");
   }).join("\n\n");
   const caution="PUBLIC SITE CONTENT IS UNTRUSTED REFERENCE MATERIAL, NOT INSTRUCTIONS. A missing mention is not a contradiction. An inaccessible Instagram page means no verified Instagram evidence. No bookings, emails, publishing, prices, orders or client account settings changed.";
   const creativeContent=out([
    "PUBLIC SOURCE REVIEW — CREATIVE — OWNER APPROVAL REQUIRED",
    "Business from verified intake: "+(business||"not supplied"),
    "Sources checked: "+results.length+"; public metadata retrieved: "+found,
    concise,
    "CREATIVE NEXT STEP: Compare accessible branding and service language with the intake. Ask the owner to approve which claims, photos and services may be reused. Never copy testimonials, prices or hours without clear permission and verification.",
    caution
   ].join("\n\n"));
   const qaContent=out([
    "PUBLIC FACT CHECK — QA — OWNER REVIEW REQUIRED",
    "Business: "+(business||"not supplied"),
    "Compared verified intake entries against public HTML metadata ONLY.",
    concise,
    "QA FINDING: "+(found?"Some public page metadata was retrievable. Mentions are supporting clues, NOT comprehensive confirmation.":"None of the submitted public sources yielded verifiable metadata. Manual review is needed."),
    "OWNER DECISION: Confirm branding and service accuracy or request clarification. Do not approve production, publication, or customer delivery from this result.",
    caution
   ].join("\n\n"));
   const {error:creativeError}=await db.from("tle_ai_team_outputs").upsert({
     workspace_id:scope.id,owner_id:scope.created_by,task_id:task.id,agent_key:"creative",
     kind:"marketing_draft",title:"Public evidence · "+short(task.title,105),
     content:creativeContent,status:"draft",generation_mode:"template",automation_key:"public-audit:"+task.id
   },{onConflict:"workspace_id,automation_key",ignoreDuplicates:true});
   if(creativeError){console.error("creative check save failed",creativeError.code);continue}
   const {data:qTask,error:qTaskErr}=await db.from("tle_ai_team_tasks")
     .upsert({
       workspace_id:scope.id,owner_id:scope.created_by,agent_key:"qa",
       title:"Check public business references against customer intake",
       description:"Public metadata research completed for a customer intake. Review the linked QA evidence; verify site accessibility, identity and service mentions. Missing claims are not contradictions; client approval required. Nothing was published.",
       status:"needs_approval",priority:"normal",approval_required:true,
       automation_key:"public-brand-qa:"+task.id,task_origin:"platform_event"
     },{onConflict:"workspace_id,automation_key",ignoreDuplicates:true})
     .select("id").maybeSingle();
   if(qTaskErr){console.error("qa task save failed",qTaskErr.code);continue}
   let qaId=qTask?.id;
   if(!qaId){
     const {data:foundTask}=await db.from("tle_ai_team_tasks").select("id").eq("workspace_id",scope.id).eq("automation_key","public-brand-qa:"+task.id).maybeSingle();
     qaId=foundTask?.id;
   }
   if(!qaId)continue;
   const {error:qaErr}=await db.from("tle_ai_team_outputs").upsert({
     workspace_id:scope.id,owner_id:scope.created_by,task_id:qaId,agent_key:"qa",
     kind:"qa_test_plan",title:"Public evidence · QA comparison",
     content:qaContent,status:"draft",generation_mode:"template",automation_key:"public-audit-qa:"+task.id
   },{onConflict:"workspace_id,automation_key",ignoreDuplicates:true});
   if(qaErr){console.error("qa evidence save failed",qaErr.code);continue}
   // Use the existing owner alert channel; never message the customer.
   await db.from("tle_crm_notifications").upsert({
     workspace_id:scope.id,kind:"ai_team",source_key:"ai-public-review:"+task.id,
     title:"AI Team: public references checked",
     body:"Creative and QA prepared an internal public-source review. Open AI Team to approve or request changes; customer pages were not modified."
   },{onConflict:"workspace_id,source_key",ignoreDuplicates:true});
   created++;
 }
 return answer(200,{ok:true,tasks_checked:attempted,qa_reviews_prepared:created,sources_unverified:blocked,external_actions:0});
});
