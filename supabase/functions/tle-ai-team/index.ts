import "jsr:@supabase/functions-js/edge-runtime.d.ts";
const BASE=Deno.env.get("SUPABASE_URL")||"", SR=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")||"", ANON=Deno.env.get("SUPABASE_ANON_KEY")||"", OPENAI=Deno.env.get("OPENAI_API_KEY")||"";
const ORIGINS=new Set(["https://thelaunchera.com","https://www.thelaunchera.com","https://command.thelaunchera.com"]);
const AGENTS=new Set(["jessie","sales","projects","developer","qa","creative","care"]);
const STATUSES=new Set(["planned","in_progress","needs_approval","approved","completed","blocked","cancelled"]);
const HEADERS=(origin)=>({"Content-Type":"application/json","Cache-Control":"no-store","Vary":"Origin","Access-Control-Allow-Origin":ORIGINS.has(origin)?origin:"https://thelaunchera.com","Access-Control-Allow-Headers":"authorization,apikey,content-type","Access-Control-Allow-Methods":"OPTIONS,POST"});
function res(body,code,origin){return new Response(JSON.stringify(body),{status:code,headers:HEADERS(origin)})}
const clean=(v,max)=>String(v??"").replace(/[\u0000-\u001f<>]/g," ").trim().slice(0,max);
const uuid=(s)=>/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(s||""));
async function rest(table,params="",method="GET",body=null,extra={}){
 const url=BASE+"/rest/v1/"+table+(params?"?"+params:"");
 const headers={apikey:SR,Authorization:"Bearer "+SR,...extra};
 if(body!==null)headers["Content-Type"]="application/json";
 const r=await fetch(url,{method,headers,body:body===null?undefined:JSON.stringify(body),signal:AbortSignal.timeout(8000)});
 if(!r.ok)throw Error("Data service unavailable ("+r.status+")");
 if(r.status===204)return [];
 return await r.json();
}
async function auth(req){
 if(!BASE||!SR||!ANON)throw Error("unavailable");
 const token=req.headers.get("authorization")||"";
 if(!token.startsWith("Bearer "))throw Error("unauthorized");
 const a=await fetch(BASE+"/auth/v1/user",{headers:{apikey:ANON,Authorization:token},signal:AbortSignal.timeout(6000)});
 if(!a.ok)throw Error("unauthorized");
 const user=await a.json();
 if(!uuid(user.id))throw Error("unauthorized");
 const admin=await rest("platform_admins","user_id=eq."+encodeURIComponent(user.id)+"&select=user_id&limit=1");
 if(admin.length!==1)throw Error("unauthorized");
 const w=await rest("tle_crm_workspaces","created_by=eq."+encodeURIComponent(user.id)+"&is_internal=eq.true&select=id,created_by,is_internal&limit=1");
 if(w.length!==1||w[0].created_by!==user.id)throw Error("unauthorized");
 return {owner:user.id,workspace:w[0].id};
}
async function event(ctx,id,action,summary){
 return rest("tle_ai_team_events","","POST",{workspace_id:ctx.workspace,task_id:id,actor_id:ctx.owner,action,summary:clean(summary,500)},{Prefer:"return=representation"});
}
async function one(ctx,id){
 if(!uuid(id))throw Error("Invalid task identifier");
 const p="id=eq."+id+"&workspace_id=eq."+ctx.workspace+"&owner_id=eq."+ctx.owner+"&select=*&limit=1";
 const items=await rest("tle_ai_team_tasks",p);
 if(items.length!==1)throw Error("Task not found");
 return items[0];
}
async function patch(ctx,task,changes){
 const p="id=eq."+task.id+"&workspace_id=eq."+ctx.workspace+"&owner_id=eq."+ctx.owner;
 const items=await rest("tle_ai_team_tasks",p,"PATCH",{...changes,updated_at:new Date().toISOString()},{Prefer:"return=representation"});
 if(items.length!==1)throw Error("Update not confirmed");
 return items[0];
}
async function count(table,filters){
 try{
 const url=BASE+"/rest/v1/"+table+"?select=id&"+filters+"&limit=1";
 const r=await fetch(url,{headers:{apikey:SR,Authorization:"Bearer "+SR,Prefer:"count=exact",Range:"0-0"},signal:AbortSignal.timeout(5500)});
 if(!r.ok)return null;
 const n=(r.headers.get("content-range")||"").split("/").pop();
 return n&&n!=="*"&&Number.isFinite(Number(n))?Number(n):null;
 }catch{return null}
}
const ROLE_SYSTEM={
 jessie:"You coordinate an AI operations team. Prioritize the next safe actions.",
 sales:"You support authorized cleaning-business lead management. Drafts ONLY; never send, contact, or imply consent.",
 projects:"You manage purchase, intake, client QA and delivery checklists. Never claim a client is ready without source evidence.",
 developer:"You plan code fixes with separate staging, repository verification, diff review and rollback. Never claim code was deployed.",
 qa:"You plan accessible, tenant-scoped mobile/tablet/desktop checks without real-client test submissions.",
 creative:"You direct premium English public content with ivory, soft blue, yellow, black, Prompt headlines, Futura text. No done-for-you content offer.",
 care:"You create polite customer care drafts, never send messages or expose buyer records."
};

/* Read-only, allow-listed capabilities. Never accept caller-supplied URL, SQL, recipient or repository. */
const CAPABILITIES={jessie:"operations_brief",sales:"sales_review",projects:"project_review",developer:"repository_health",qa:"route_health",creative:"brand_audit",care:"support_review"};
function fact(label,value,source){return {label,value:value===undefined?null:value,source};}
function report(agent,summary,facts,checks=[],limited=false){return {agent,summary,facts,checks,coverage:limited?"partial":"complete",read_only:true,external_actions:0};}
async function dbRead(table,filters,fields,limit=300){
 return rest(table,filters+"&select="+fields+"&limit="+limit);
}
function enes(lang,en,es){return lang==="es"?es:en}
async function salesReview(ctx,lang){
 try{
 const scope="workspace_id=eq."+ctx.workspace+"&archived_at=is.null";
 const rows=await dbRead("tle_crm_leads",scope,"stage,followup,email_consent_status,email_followup_enabled,contact_decision,replied_at,research_only",750);
 const today=new Intl.DateTimeFormat("en-CA",{timeZone:"America/New_York",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());
 const due=rows.filter(x=>x.followup&&x.followup<=today&&["Contacted","Follow-up"].includes(x.stage)&&!x.replied_at&&x.research_only!==true);
 const candidates=due.filter(x=>x.contact_decision==="yes"&&x.email_consent_status==="authorized"&&x.email_followup_enabled===true);
 return report("sales",enes(lang,"Lead records checked. Candidates are NOT cleared to contact until reply, suppression and provider events are revalidated.","Se revisaron los prospectos. Los candidatos NO están autorizados para envío sin verificar respuestas, bajas y eventos del proveedor."),[
 fact("Active lead records scanned",rows.length,"tle_crm_leads"),
 fact("Potential follow-ups due",due.length,"tle_crm_leads.followup"),
 fact("Candidates requiring final consent check",candidates.length,"tle_crm_leads consent flags")],[],rows.length===750);
 }catch{return report("sales",enes(lang,"Lead source unavailable; no recipients contacted.","No se pudieron consultar los prospectos; no se contactó a nadie."),[fact("Lead records",null,"tle_crm_leads")],[],true)}
}
async function projectReview(lang){
 let limit=false;
 try{
 const [accounts,orders]=await Promise.all([
  dbRead("tle_booking_flow_accounts","id=not.is.null","payment_status,intake_completed_at,build_started_at,delivery_sent_at,status",500),
  dbRead("tle_ai_agent_orders","id=not.is.null","status,submitted_at,delivered_at",350)
 ]);
 const paid=accounts.filter(x=>/paid|succeeded|complete/i.test(String(x.payment_status||""))).length;
 const intakeMissing=accounts.filter(x=>/paid|succeeded|complete/i.test(String(x.payment_status||""))&&!x.intake_completed_at).length;
 const buildPending=accounts.filter(x=>x.intake_completed_at&&!x.build_started_at&&!x.delivery_sent_at).length;
 const undelivered=accounts.filter(x=>/paid|succeeded|complete/i.test(String(x.payment_status||""))&&!x.delivery_sent_at).length;
 const aiPending=orders.filter(x=>!/delivered|completed|cancelled|refunded|inactive/i.test(String(x.status||""))).length;
 limit=accounts.length===500||orders.length===350;
 return report("projects",enes(lang,"Paid/intake/delivery stages checked from platform records. Counts are review flags, not proof a client is ready.","Revisé las etapas de pagos, intakes y entregas. Son alertas de revisión, no confirmación de que el proyecto esté listo."),[
 fact("Booking accounts inspected",accounts.length,"tle_booking_flow_accounts"),
 fact("Paid orders",paid,"tle_booking_flow_accounts.payment_status"),
 fact("Paid with intake missing",intakeMissing,"tle_booking_flow_accounts.intake_completed_at"),
 fact("Intakes awaiting build start",buildPending,"tle_booking_flow_accounts.build_started_at"),
 fact("Paid without delivery stamp",undelivered,"tle_booking_flow_accounts.delivery_sent_at"),
 fact("AI orders not recorded delivered",aiPending,"tle_ai_agent_orders.status")],[],limit);
 }catch{return report("projects",enes(lang,"Project source unavailable; no client state was changed.","No se pudieron comprobar los proyectos. No se modificó ningún cliente."),[fact("Delivery source",null,"Supabase")],[],true)}
}
async function careReview(lang){
 try{
 const rows=await dbRead("tle_crm_support_requests","id=not.is.null","status,request_type,created_at",500);
 const unresolved=rows.filter(x=>!["closed","resolved","done","cancelled"].includes(String(x.status||"").toLowerCase()));
 const oldest=unresolved.map(x=>Date.parse(x.created_at)).filter(Number.isFinite).sort((a,b)=>a-b)[0];
 return report("care",enes(lang,"Support requests checked. No customer message was read, composed, or sent.","Se revisaron los estados de soporte, sin leer, redactar ni enviar mensajes a los clientes."),[
 fact("Support requests inspected",rows.length,"tle_crm_support_requests"),
 fact("Not marked resolved",unresolved.length,"tle_crm_support_requests.status"),
 fact("Oldest unresolved date",oldest?new Date(oldest).toISOString().slice(0,10):null,"tle_crm_support_requests.created_at")],[],rows.length===500);
 }catch{return report("care",enes(lang,"Support source unavailable.","Fuente de soporte no disponible."),[fact("Support source",null,"tle_crm_support_requests")],[],true)}
}
async function publicGet(url){
 const t=Date.now();
 try{
  const r=await fetch(url,{method:"GET",redirect:"follow",headers:{"User-Agent":"TheLaunchEra-Owner-QA/1.0","Accept":"text/html,application/json"},signal:AbortSignal.timeout(7000)});
  const body=(await r.text()).slice(0,175000);
  return {url,ok:r.ok,http_status:r.status,ms:Date.now()-t,body};
 }catch{return {url,ok:false,http_status:null,ms:Date.now()-t,body:""}}
}
async function qaReview(lang){
 const urls=[
  ["Public home","https://thelaunchera.com/","thelaunchera"],
  ["Owner Command Center","https://thelaunchera.com/command-center/","authForm"],
  ["Private AI Team","https://thelaunchera.com/command-center/ai-team.html","Owner sign-in required"],
  ["Password recovery","https://thelaunchera.com/auth-recovery.html","passwordForm"],
  ["Booking demo","https://thelaunchera.com/booking-demo/","html"]
 ];
 const results=await Promise.all(urls.map(async([label,url,marker])=>{
  const x=await publicGet(url);
  const passes=x.ok&&(marker==="html"?/<html/i.test(x.body):x.body.toLowerCase().includes(marker.toLowerCase()));
  return {label,url,http_status:x.http_status,expected_marker_found:passes,elapsed_ms:x.ms};
 }));
 const passed=results.filter(x=>x.expected_marker_found).length;
 return report("qa",enes(lang,"Public routes checked via HTTP GET only. Passing a route does NOT prove private login, clicks, or client workflows.","Se comprobaron páginas públicas por HTTP GET; esto NO certifica el login privado, los botones ni los flujos de clientes."),[
 fact("Public checks passed",passed,"thelaunchera.com"),
 fact("Public checks attempted",results.length,"thelaunchera.com")],results,passed!==results.length);
}
async function gitJson(url){
 const r=await fetch(url,{headers:{"Accept":"application/vnd.github+json","User-Agent":"TheLaunchEra-Owner-QA/1.0"},signal:AbortSignal.timeout(6500)});
 if(!r.ok)throw Error("GitHub status "+r.status);
 return await r.json();
}
async function developerReview(lang){
 const repo="thelaunchera/the-launch-era-new-website-";
 try{
 const [commit,runs]=await Promise.all([
 gitJson("https://api.github.com/repos/"+repo+"/commits/main"),
 gitJson("https://api.github.com/repos/"+repo+"/actions/runs?per_page=12&branch=main")
 ]);
 const last=(runs.workflow_runs||[]).filter(x=>x.status==="completed").slice(0,1)[0];
 const sha=String(commit?.sha||"").slice(0,12);
 return report("developer",enes(lang,"Checked published repository metadata and latest CI result. No code changed or deployed.","Consulté el último commit y resultado de CI. No modifiqué ni publiqué código."),[
 fact("Branch",String(commit?.sha?"main":"unavailable"),"GitHub"),
 fact("Latest commit",sha||null,"GitHub commits/main"),
 fact("Latest completed CI",last?.conclusion||null,"GitHub Actions"),
 fact("Latest CI workflow",last?.name||null,"GitHub Actions")],[],!sha||!last);
 }catch{return report("developer",enes(lang,"GitHub API unavailable or rate limited; code was not touched.","GitHub no respondió o limitó las consultas. No se tocó el código."),[fact("Repository health",null,"GitHub public API")],[],true)}
}
async function creativeReview(lang){
 const routes=[["Homepage","https://thelaunchera.com/"],["Booking offer","https://thelaunchera.com/booking-lead-automation/"],["AI Assistant offer","https://thelaunchera.com/ai-booking-assistant/"]];
 const results=await Promise.all(routes.map(async([label,url])=>{
 const x=await publicGet(url), title=(x.body.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]||"").slice(0,130);
 return {label,http_status:x.http_status,title,present:!!(x.ok&&title),url};
 }));
 const passed=results.filter(x=>x.present).length;
 return report("creative",enes(lang,"Public page title/availability audit completed. This does NOT read Metricool analytics or create artwork.","Audité títulos y disponibilidad de páginas públicas. Esto NO consulta Metricool ni crea diseños."),[
 fact("Public titles verified",passed,"TLE public site"),
 fact("Marketing pages inspected",routes.length,"TLE public site"),
 fact("Metricool publishing integration","Not configured for automated execution","Integration status")],results,passed!==routes.length);
}
async function operationsBrief(ctx,lang){
 const scope="workspace_id=eq."+ctx.workspace;
 const vals=await Promise.all([
 count("tle_crm_leads",scope+"&archived_at=is.null"),
 count("tle_crm_notifications",scope+"&read_at=is.null"),
 count("tle_ai_team_tasks",scope+"&owner_id=eq."+ctx.owner+"&status=eq.needs_approval"),
 count("tle_ai_team_tasks",scope+"&owner_id=eq."+ctx.owner+"&status=eq.blocked")
 ]);
 return report("jessie",enes(lang,"Jessie checked live internal counts. Review approvals, blocked work and unread alerts first.","Jessie consultó los indicadores internos. Prioriza aprobaciones, tareas bloqueadas y avisos sin leer."),[
 fact("Active prospects",vals[0],"tle_crm_leads"),
 fact("Unread owner alerts",vals[1],"tle_crm_notifications"),
 fact("Tasks awaiting approval",vals[2],"tle_ai_team_tasks"),
 fact("Blocked AI Team tasks",vals[3],"tle_ai_team_tasks")],[],vals.some(x=>x===null));
}
async function performReadOnly(ctx,agent,lang){
 if(agent==="jessie")return operationsBrief(ctx,lang);
 if(agent==="sales")return salesReview(ctx,lang);
 if(agent==="projects")return projectReview(lang);
 if(agent==="developer")return developerReview(lang);
 if(agent==="qa")return qaReview(lang);
 if(agent==="creative")return creativeReview(lang);
 if(agent==="care")return careReview(lang);
 throw Error("Unknown capability");
}

Deno.serve(async req=>{
 const origin=req.headers.get("origin")||"";
 if(req.method==="OPTIONS")return new Response(null,{status:204,headers:HEADERS(origin)});
 if(req.method!=="POST")return res({ok:false,error:"Method not allowed"},405,origin);
 if(origin&&!ORIGINS.has(origin))return res({ok:false,error:"Origin not allowed"},403,origin);
 let ctx;
 try{ctx=await auth(req)}catch(e){return res({ok:false,error:String(e?.message||e)==="unavailable"?"Service temporarily unavailable":"Owner authentication required"},401,origin)}
 let b;
 try{b=await req.json();if(!b||typeof b!=="object"||Array.isArray(b))throw Error("Invalid body")}catch{return res({ok:false,error:"Invalid request"},400,origin)}
 const action=clean(b.action,36);
 try{
 if(action==="list"){
   const tasks=await rest("tle_ai_team_tasks","workspace_id=eq."+ctx.workspace+"&owner_id=eq."+ctx.owner+"&select=id,agent_key,title,description,status,priority,approval_required,approved_at,completed_at,evidence,created_at,updated_at&order=created_at.desc&limit=120");
   const events=await rest("tle_ai_team_events","workspace_id=eq."+ctx.workspace+"&select=task_id,action,summary,created_at&order=created_at.desc&limit=35");
   const runs=await rest("tle_ai_team_runs","workspace_id=eq."+ctx.workspace+"&owner_id=eq."+ctx.owner+"&select=id,agent_key,capability,status,report,task_id,started_at,finished_at,duration_ms&order=started_at.desc&limit=25");
   return res({ok:true,tasks,events,runs},200,origin);
 }
 if(action==="create"){
   const title=clean(b.title,160),description=clean(b.description,3000),agent=clean(b.agent_key,24),priority=clean(b.priority,16)||"normal";
   if(title.length<3||!AGENTS.has(agent)||!["normal","high","urgent"].includes(priority))return res({ok:false,error:"Choose a valid agent and task title"},400,origin);
   const recent=await rest("tle_ai_team_tasks","workspace_id=eq."+ctx.workspace+"&owner_id=eq."+ctx.owner+"&title=eq."+encodeURIComponent(title)+"&created_at=gte."+encodeURIComponent(new Date(Date.now()-45000).toISOString())+"&select=id&limit=1");
   if(recent.length)return res({ok:false,error:"This task was just added; refresh the board"},409,origin);
   const saved=await rest("tle_ai_team_tasks","","POST",{workspace_id:ctx.workspace,owner_id:ctx.owner,agent_key:agent,title,description,priority,approval_required:true},{Prefer:"return=representation"});
   if(!saved?.[0])throw Error("Creation not confirmed");
   await event(ctx,saved[0].id,"created","Task created for "+agent);
   return res({ok:true,task:saved[0],note:"Created. No external action performed."},200,origin);
 }
 if(["assign","status","approve","complete"].includes(action)){
   const t=await one(ctx,b.id);if(["completed","cancelled"].includes(t.status))return res({ok:false,error:"This task is closed"},409,origin);
   let changes={},actionName="status_changed",summary="";
   if(action==="assign"){
     const key=clean(b.agent_key,24);if(!AGENTS.has(key))return res({ok:false,error:"Unknown agent"},400,origin);
     changes={agent_key:key};actionName="assigned";summary="Assigned to "+key;
   }else if(action==="status"){
     const next=clean(b.status,24);
     if(!["planned","in_progress","needs_approval","blocked","cancelled"].includes(next))return res({ok:false,error:"Unsupported transition"},400,origin);
     if(t.status==="approved"&&next==="planned")return res({ok:false,error:"Approved work cannot be reset silently"},409,origin);
     changes={status:next};actionName=next==="cancelled"?"cancelled":"status_changed";summary="Status changed to "+next;
   }else if(action==="approve"){
     if(t.status!=="needs_approval")return res({ok:false,error:"Move the task to approval first"},409,origin);
     changes={status:"approved",approved_at:new Date().toISOString()};actionName="approved";summary="Owner approved the plan, not external execution";
   }else{
     const proof=clean(b.evidence,1500);
     if(t.approval_required&&t.status!=="approved")return res({ok:false,error:"Owner approval required before completion"},409,origin);
     if(proof.length<12)return res({ok:false,error:"Add verification evidence (12+ characters)"},400,origin);
     changes={status:"completed",completed_at:new Date().toISOString(),evidence:proof};actionName="completed";summary="Owner recorded manually verified completion";
   }
   const changed=await patch(ctx,t,changes);await event(ctx,t.id,actionName,summary);
   return res({ok:true,task:changed,note:"Workflow record updated; no emails or external deployments executed."},200,origin);
 }

 if(action==="run_agent"){
   const agent=clean(b.agent_key,24),lang=b.language==="en"?"en":"es";
   if(!AGENTS.has(agent)||!CAPABILITIES[agent])return res({ok:false,error:"Unknown agent"},400,origin);
   let task=null;
   if(b.id!==undefined&&b.id!==null){
     task=await one(ctx,b.id);
     if(task.agent_key!==agent||["completed","cancelled"].includes(task.status))
       return res({ok:false,error:"Task not available for this agent"},409,origin);
   }
   const recent=await rest("tle_ai_team_runs","workspace_id=eq."+ctx.workspace+"&owner_id=eq."+ctx.owner+"&agent_key=eq."+agent+"&started_at=gte."+encodeURIComponent(new Date(Date.now()-45000).toISOString())+"&select=id,agent_key,capability,status,report,task_id,started_at,finished_at,duration_ms&order=started_at.desc&limit=1");
   if(recent?.length)return res({ok:true,run:recent[0],reused:true,note:"A recent check already exists; no new request was made."},200,origin);
   const start=Date.now();
   const outcome=await performReadOnly(ctx,agent,lang);
   const status=outcome.coverage==="complete"?"success":"partial";
   const saved=await rest("tle_ai_team_runs","","POST",{
    workspace_id:ctx.workspace,owner_id:ctx.owner,task_id:task?.id||null,
    agent_key:agent,capability:CAPABILITIES[agent],status,report:outcome,
    duration_ms:Math.max(0,Date.now()-start),finished_at:new Date().toISOString()
   },{Prefer:"return=representation"});
   if(!saved?.[0])throw Error("Unable to persist verified check");
   return res({ok:true,run:saved[0],reused:false,note:"Read-only sources checked; no client, email, payment or deployment changes."},200,origin);
 }

 if(action==="scan"){
   const w="workspace_id=eq."+encodeURIComponent(ctx.workspace);
   const [prospects,notifications,requests,pendingTasks]=await Promise.all([
     count("tle_crm_leads",w+"&archived_at=is.null"),
     count("tle_crm_notifications",w+"&read_at=is.null"),
     count("tle_crm_support_requests",w+"&status=eq.open"),
     count("tle_ai_team_tasks",w+"&owner_id=eq."+ctx.owner+"&status=in.(planned,in_progress,needs_approval,blocked,approved)")
   ]);
   return res({ok:true,counts:{prospects,unread_notifications:notifications,open_support:requests,active_tasks:pendingTasks},source:"Read-only aggregate data; unavailable values are null",collected_at:new Date().toISOString()},200,origin);
 }
 if(action==="plan"){
   const task=await one(ctx,b.id);
   if(["completed","cancelled"].includes(task.status))return res({ok:false,error:"Closed task"},409,origin);
   if(!OPENAI)return res({ok:false,error:"AI planning connection not configured"},503,origin);
   const system="You are the private The Launch Era "+task.agent_key+" assistant. "+ROLE_SYSTEM[task.agent_key]+
   " Return at most four numbered practical steps in Spanish or English as requested. Mention verification and the actual owner's sign-off. Never invent live results, private customer details, tested URLs, customer consent, sending, publication, payment, completion or execution. Do not take action. No markdown table. Do not ask for credentials.";
   const rr=await fetch("https://api.openai.com/v1/chat/completions",{method:"POST",headers:{Authorization:"Bearer "+OPENAI,"Content-Type":"application/json"},body:JSON.stringify({model:Deno.env.get("JESSY_MODEL")||"gpt-4.1-mini",temperature:0.2,max_tokens:330,messages:[{role:"system",content:system},{role:"user",content:"Task: "+task.title+"\nContext: "+task.description+"\nLanguage: "+(b.language==="en"?"English":"Spanish")+"\nProvide a clear actionable plan, not a claim of completed work."}]}),signal:AbortSignal.timeout(14000)});
   if(!rr.ok)return res({ok:false,error:"AI planning temporarily unavailable"},503,origin);
   const data=await rr.json();
   const plan=clean(data?.choices?.[0]?.message?.content,1900);
   if(!plan)return res({ok:false,error:"No plan generated"},503,origin);
   return res({ok:true,plan,agent:task.agent_key,requires_approval:true,executed:false},200,origin);
 }
 return res({ok:false,error:"Unsupported action"},400,origin);
 }catch(e){return res({ok:false,error:"Could not complete request: "+clean(e?.message||"unavailable",160)},503,origin)}
});