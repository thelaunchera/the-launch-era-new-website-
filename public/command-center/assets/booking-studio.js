import {renderBookingStudioPreview} from "./booking-studio-preview.mjs";
/* Booking Studio · owner-only companion UI. Backend enforces every permission. */
const $=id=>document.getElementById(id);
const SUPA="https://bowacxhmjvrqixtwaikv.supabase.co";
const PUBLISHABLE="sb_publishable_0TueitFYiRF3rAEMLMT8-w_FvbvY0rB";
const endpoint=SUPA+"/functions/v1/tle-booking-studio-owner";
const db=window.supabase?.createClient?.(SUPA,PUBLISHABLE,{auth:{storageKey:"tle-crm-auth",persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
const qaIds=["tenant_isolation","payment_verified","intake_verified","assets_licensed","brand_accuracy","no_invented_claims","services_and_prices","booking_and_quote","frequency_and_addons","service_area","email_permissions","links","mobile","tablet","desktop","accessibility","en_es","customer_data_protected"];
let state={jobs:[],accounts:[],selected:null,account:null};
const setText=(id,value)=>{$(id).textContent=String(value??"")};
const showMessage=(text,error=false)=>{const el=$("message");el.hidden=false;el.textContent=String(text);el.style.background=error?"#fff1ef":"#f1f7fb";el.style.color=error?"#9b4136":"#34566d"};
const errText=e=>String(e?.message||"Request unavailable");
async function api(payload){
 if(!db)throw Error("Owner authentication is unavailable");
 const {data:{session},error}=await db.auth.getSession();
 if(error||!session?.access_token)throw Error("Please sign in to your private Command Center first.");
 const response=await fetch(endpoint,{method:"POST",headers:{"Content-Type":"application/json",apikey:PUBLISHABLE,Authorization:"Bearer "+session.access_token},body:JSON.stringify(payload),cache:"no-store"});
 const data=await response.json().catch(()=>({error:"Invalid server response"}));
 if(!response.ok||!data.ok)throw Error(data.error||"Request failed");
 return data;
}
function addButton(parent,label,subtitle,fn,disabled=false){
 const button=document.createElement("button");button.type="button";button.className="item";button.disabled=disabled;
 const title=document.createElement("strong");title.textContent=label;
 const small=document.createElement("small");small.textContent=subtitle;
 button.append(title,small);button.onclick=fn;parent.append(button);
}
function paintLists(){
 const accounts=$("accounts"),jobs=$("jobs");accounts.replaceChildren();jobs.replaceChildren();
 if(!state.accounts.length)accounts.textContent="No linked paid booking accounts were found.";
 for(const a of state.accounts){
  const existing=state.jobs.find(j=>j.booking_account_id===a.id);
  addButton(accounts,a.business_name||"Booking project",a.delivered?"Already delivered":existing?"Studio project already started":a.ready?"Ready for owner start approval":"Missing: "+a.missing.join(", "),()=>existing?openJob(existing.id):start(a.id),a.delivered||(!a.ready&&!existing));
 }
 if(!state.jobs.length)jobs.textContent="No Booking Studio projects yet.";
 for(const j of state.jobs)addButton(jobs,j.booking_account_id,"Stage: "+j.stage+" · revision "+j.revision,()=>openJob(j.id));
}
async function refresh(){
 const r=await api({action:"list"});state.jobs=r.jobs||[];state.accounts=r.accounts||[];paintLists();
}
async function start(id){
 if(!window.confirm("Start an internal Booking Studio project for this paid, completed intake? This does not publish or contact the client."))return;
 try{const r=await api({action:"start",account_id:id,owner_start_approved:true});await refresh();await openJob(r.job.id);showMessage("Project started. Research evidence is required next.")}catch(e){showMessage(errText(e),true)}
}
async function openJob(id){
 try{const r=await api({action:"get",job_id:id});state.selected=r.job;state.account=r.account;paintProject()}catch(e){showMessage(errText(e),true)}
}
function paintProject(){
 const j=state.selected;if(!j)return;
 $("empty").hidden=true;$("project").hidden=false;
 setText("stage","STAGE · "+j.stage.replaceAll("_"," "));
 setText("project-title",state.account?.business_name||"Booking Studio project");
 setText("project-detail","Master: "+j.base_version+" · revision "+j.revision+" · owner-only private workflow");
 const descriptions={
 research:"Creative must verify sources and record what is known versus unknown.",
 creative:"Creative prepares a distinct layout, real imagery with rights, and client-specific copy.",
 development:"Developer must produce a private build with source evidence. No publishing.",
 qa:"QA must record all 18 checks with real evidence; failures return to Developer.",
 owner_review:"Jessie presents the verified private build for your decision.",
 approved:"Approved internally. A separate, explicit publish approval is still required."
 };
 setText("project-note",descriptions[j.stage]||"No external actions enabled.");
 for(const id of ["research-form","design-form","build-form","qa-form","review-form","approved-state"])$(id).hidden=true;
 $("preview-button").hidden=!["development","qa","owner_review","approved"].includes(j.stage)||!j.design?.hero_title;
 $("preview-wrap").hidden=true;
 $("preview-frame").srcdoc="";
 const form={research:"research-form",creative:"design-form",development:"build-form",qa:"qa-form",owner_review:"review-form"}[j.stage];
 if(form)$(form).hidden=false;
 if(j.stage==="approved")$("approved-state").hidden=false;
 if(j.stage==="qa")renderQa();
}
function renderQa(){
 const holder=$("qa-checks");holder.replaceChildren();
 for(const id of qaIds){
  const label=document.createElement("label");label.className="qa-row";
  const input=document.createElement("input");input.type="checkbox";input.name="qa_"+id;
  const span=document.createElement("span");span.textContent=id.replaceAll("_"," ");
  const evidence=document.createElement("input");evidence.name="evidence_"+id;evidence.placeholder="Specific evidence or test report reference";evidence.setAttribute("aria-label","Evidence for "+id.replaceAll("_"," "));
  const group=document.createElement("div");group.className="qa-check";label.append(input,span);group.append(label,evidence);holder.append(group);
 }

}
async function submit(action,payload){
 try{
  const r=await api({action,job_id:state.selected.id,...payload});
  await refresh();await openJob(r.job.id);
  showMessage(action==="qa"&&r.failed?.length?"QA failed: "+r.failed.join(", ")+". Returned to Developer.":"Stage recorded. No external actions were performed.");
 }catch(e){showMessage(errText(e),true)}
}
$("research-form").onsubmit=e=>{
 e.preventDefault();const d=new FormData(e.currentTarget);
 const url=String(d.get("url")||"").trim(),fact=String(d.get("fact")||"").trim();
 submit("research",{research:{sources:[{url,purpose:"Client brand research"}],facts:[{claim:fact,source_url:url}],unknowns:String(d.get("unknowns")||"").split("\n").filter(Boolean)}});
};
$("creative-generate").onclick=async()=>{
 const button=$("creative-generate");button.disabled=true;
 setText("creative-status","AI Creative is preparing a draft from the verified research…");
 try{
  const result=await api({action:"creative_suggest",job_id:state.selected.id});
  const form=$("design-form"),d=result.suggestion;
  for(const key of ["layout","cards","typography","primary_color","accent_color","hero_title","hero_body","design_rationale"]){
   const control=form.elements.namedItem(key);if(control)control.value=d[key]||"";
  }
  setText("creative-status","AI draft ready. Photo direction: "+(d.photo_direction||"Use a licensed image matching the business.")+" Add a licensed photo and review all copy before saving.");
 }catch(e){setText("creative-status","AI Creative unavailable: "+errText(e))}
 finally{button.disabled=false}
};
$("design-form").onsubmit=e=>{
 e.preventDefault();const d=new FormData(e.currentTarget);
 const fields=Object.fromEntries(d.entries());
 submit("design",{design:{...fields,photos:[{url:fields.photo_url,license:fields.photo_license,usage:"hero"}],section_order:["services","benefits","process","booking"]}});
};
$("build-form").onsubmit=e=>{
 e.preventDefault();const d=new FormData(e.currentTarget);
 submit("build",{build:{private_preview_id:String(d.get("private_preview_id")||""),artifact_commit:String(d.get("artifact_commit")||""),tenant_id:state.selected.client_workspace_id,published:false,client_notified:false}});
};
$("qa-form").onsubmit=e=>{
 e.preventDefault();const d=new FormData(e.currentTarget);
 const tests=qaIds.map(id=>({id,passed:d.has("qa_"+id),evidence:d.has("qa_"+id)?String(d.get("evidence_"+id)||"").trim():""}));
 submit("qa",{tests});
};
$("approve").onclick=()=>{
 if(!window.confirm("Approve this QA-verified private Booking Page design? This will NOT publish or email the client."))return;
 submit("review",{decision:"approve",owner_confirmed:true,notes:new FormData($("review-form")).get("notes")||""});
};
$("request-changes").onclick=()=>{
 const notes=String(new FormData($("review-form")).get("notes")||"").trim();
 if(!notes){showMessage("Write the changes you need before sending the project back.",true);return}
 submit("review",{decision:"request_changes",notes});
};
$("preview-button").onclick=()=>{
 try{
  const job=state.selected,account=state.account;
  const safeServices=Array.isArray(account?.services)?account.services:[];
  const model={...job,tenant_id:job.client_workspace_id,order_id:job.booking_account_id,
    client:{business_name:account?.business_name||"Cleaning Business",services:safeServices}};
  const html=renderBookingStudioPreview(model);
  $("preview-frame").srcdoc=html;
  $("preview-wrap").hidden=false;
  $("preview-wrap").scrollIntoView({behavior:"smooth",block:"start"});
 }catch(e){showMessage("Private preview unavailable: "+errText(e),true)}
};
$("refresh").onclick=()=>refresh().catch(e=>showMessage(errText(e),true));
async function boot(){
 try{
  await refresh();
  $("auth-state").textContent="Owner access verified. No client actions or publishing enabled.";
  $("studio").hidden=false;
 }catch(e){
  $("auth-state").textContent="Owner access unavailable. Open this page after signing in to your private Command Center.";
  showMessage(errText(e),true);
 }
}
db?.auth?.onAuthStateChange((event)=>{if(event==="SIGNED_OUT"){location.replace("/command-center/")}});
boot();
