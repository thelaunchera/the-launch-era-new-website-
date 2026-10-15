/* The Launch Era — private owner AI Team. All privileged actions are server-verified. */
const $=id=>document.getElementById(id);
const ENDPOINT="https://bowacxhmjvrqixtwaikv.supabase.co/functions/v1/tle-ai-team";
const URL="https://bowacxhmjvrqixtwaikv.supabase.co";
const KEY="sb_publishable_0TueitFYiRF3rAEMLMT8-w_FvbvY0rB";
const db=window.supabase?.createClient?.(URL,KEY,{auth:{storageKey:"tle-crm-auth",persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
const agents=[
 {key:"jessie",icon:"✦",name:"Jessie · Chief of Staff",es:"Coordina prioridades, tareas y aprobaciones.",en:"Coordinates priorities, tasks and approvals."},
 {key:"sales",icon:"↗",name:"AI Sales",es:"Revisa prospectos y prepara seguimientos autorizados.",en:"Reviews prospects and prepares approved follow-ups."},
 {key:"projects",icon:"▣",name:"AI Project Manager",es:"Organiza intakes, activaciones y entregas.",en:"Organizes intakes, activations and deliveries."},
 {key:"developer",icon:"⌘",name:"AI Developer",es:"Prepara planes de cambios en repositorios y apps.",en:"Plans code fixes and application changes."},
 {key:"qa",icon:"✓",name:"AI Quality Control",es:"Planifica pruebas de enlaces, login y responsive.",en:"Plans link, login and responsive QA."},
 {key:"creative",icon:"◈",name:"AI Creative Director",es:"Coordina diseños y revisiones del contenido.",en:"Coordinates designs and content reviews."},
 {key:"care",icon:"♡",name:"AI Customer Care",es:"Prepara comunicaciones para revisión.",en:"Prepares customer communications for review."}
];
const words={
 es:{intro:"Jessie coordina. Los especialistas preparan los próximos pasos. Tú apruebas cada acción importante.",review:"Revisar mi espacio",newTask:"+ Nueva tarea",truth:"Los planes de IA son recomendaciones, no trabajos completados. No se envían correos ni se hacen cambios a clientes o despliegues automáticamente.",team:"Un equipo. Responsabilidades claras.",taskTitle:"Tareas y aprobaciones",count:"Tareas activas",approvals:"Esperando aprobación",scan:"Resumen del sistema",notChecked:"Sin revisar",snapshot:"Ejecuta una revisión de solo lectura para ver las cifras verificadas.",empty:"Todavía no hay tareas. Crea la primera para Jessie.",read:"Ver tareas",plan:"Crear plan con IA",start:"Iniciar revisión",needs:"Solicitar aprobación",approve:"Aprobar plan",complete:"Registrar finalización",block:"Bloquear",unblock:"Reanudar",cancel:"Cancelar tarea",confirmCancel:"¿Cancelar esta tarea? Esta acción no afecta servicios externos.",cancelled:"Cancelada",verified:"Hecho, con evidencia registrada.",create:"Crear tarea",choose:"Elige un agente",busy:"Trabajando…",serverError:"No se pudo completar. Revisa tu conexión.",created:"La tarea se guardó. No se ejecutó ninguna acción externa.",planDisclaimer:"Plan propuesto por IA. No se ha ejecutado.",planTemplate:"Plan basado en plantilla (sin IA). No ejecutado.",scanning:"Verificando…",prospects:"Prospectos activos",notifications:"Notificaciones pendientes",support:"Tickets abiertos",queue:"Tareas activas",partial:"No disponible",auditEmpty:"Aún no hay actividad.",modalTitle:"Crear una tarea del equipo",taskAgent:"Agente responsable",taskName:"Título de la tarea",taskDesc:"Contexto / requisitos",priority:"Prioridad",evidence:"Evidencia de la verificación",back:"← Command Center",connectionTitle:"Conexión del generador IA",connectionTest:"Verificar IA",connectionChecking:"Comprobando OpenAI…",connectionNotConfigured:"No se detecta la clave de OpenAI. Se pueden crear plantillas, pero NO son generadas por IA.",connectionReady:"Clave detectada. Pulsa Verificar IA para comprobar el modelo y la facturación.",connectionVerified:"OpenAI responde correctamente. Los próximos borradores pueden generarse con IA.",connectionError:"La conexión de IA no pasó la prueba. Se usarán plantillas etiquetadas, nunca se presentarán como IA.",draftAI:"Generado por IA",draftTemplate:"Plantilla · Sin IA",back2:"← Command Center",draftOutput:"Preparar trabajo",draftCreated:"Borrador creado para revisión; no se envió ni publicó nada.",outputs:"Trabajos preparados",noOutputs:"Aún no hay borradores. Selecciona Preparar trabajo en una tarea.",approveDraft:"Aprobar borrador",rejectDraft:"Descartar borrador",copyDraft:"Copiar texto",regenerateDraft:"Rehacer borrador",draftStatus:"Pendiente de aprobación",approvalOnly:"Aprobar no envía correos, ni publica posts, ni cambia clientes.",run:"Ejecutar revisión real",running:"Consultando fuentes reales…",recent:"Ejecuciones verificadas",emptyRuns:"Todavía no hay comprobaciones ejecutadas.",readOnly:"Solo lectura: no se enviaron mensajes ni se cambiaron datos de clientes.",facts:"Datos comprobados",details:"Ver comprobaciones",partialRun:"Verificación parcial",successRun:"Comprobado",reusedRun:"Se muestra el resultado reciente; no repetí la operación."},
 en:{intro:"Jessie coordinates. Specialists prepare the next steps. You approve every important action.",review:"Review my workspace",newTask:"+ New task",truth:"AI plans are suggestions, not completed work. No automatic emails, client changes or deployments.",team:"One team. Clear responsibilities.",taskTitle:"Tasks & approvals",count:"Active team tasks",approvals:"Awaiting approval",scan:"Workspace scan",notChecked:"Not checked",snapshot:"Run a read-only scan to see verified workspace counts.",empty:"No tasks yet. Create one for Jessie.",read:"View tasks",plan:"Generate AI plan",start:"Start review",needs:"Request approval",approve:"Approve plan",complete:"Record completion",block:"Block task",unblock:"Resume",cancel:"Cancel task",confirmCancel:"Cancel this task? External services won't be affected.",cancelled:"Cancelled",verified:"Done, with verified evidence.",create:"Create task",choose:"Choose an agent",busy:"Working…",serverError:"Could not complete that request. Check your connection.",created:"Task saved. No external action was executed.",planDisclaimer:"AI-proposed plan. Not executed.",planTemplate:"Template-based plan (no AI). Not executed.",scanning:"Checking…",prospects:"Active prospects",notifications:"Unread notifications",support:"Open support items",queue:"Active tasks",partial:"Unavailable",auditEmpty:"No activity yet.",modalTitle:"Create a team task",taskAgent:"Responsible agent",taskName:"Task title",taskDesc:"Context / requirements",priority:"Priority",evidence:"Verification evidence",back:"← Command Center",connectionTitle:"AI generator connection",connectionTest:"Verify AI",connectionChecking:"Checking OpenAI…",connectionNotConfigured:"OpenAI secret not detected. Templates are available, but are NOT AI-generated.",connectionReady:"Key detected. Choose Verify AI to test the model and billing.",connectionVerified:"OpenAI responded successfully. New drafts can be AI-generated.",connectionError:"AI connection failed verification. Templates will be clearly labeled, never presented as AI.",draftAI:"AI-generated",draftTemplate:"Template · No AI",draftOutput:"Prepare deliverable",draftCreated:"Draft prepared for review; nothing was sent or published.",outputs:"Prepared deliverables",noOutputs:"No drafts yet. Choose Prepare deliverable on a task.",approveDraft:"Approve draft",rejectDraft:"Reject draft",copyDraft:"Copy text",regenerateDraft:"Regenerate draft",draftStatus:"Awaiting approval",approvalOnly:"Approval never sends messages, publishes posts or changes customers.",run:"Run live check",running:"Checking live sources…",recent:"Verified executions",emptyRuns:"No checks executed yet.",readOnly:"Read-only: no messages were sent and no customer data was changed.",facts:"Verified facts",details:"Show checks",partialRun:"Partial verification",successRun:"Checked",reusedRun:"Showing the recent result without repeating the operation."}
};
let language="es",tasks=[],events=[],runs=[],outputs=[],providerState=null,scan=null,verified=false,activeFinish=null,plans=new Map(),inFlight=false;
try{language=localStorage.getItem("tle_crm_owner_language")==="en"?"en":"es"}catch{}
function tx(k){return words[language][k]}
const teamCopy={
 en:{heroPrefix:"Meet your ",heroEm:"AI Team.",heroEyebrow:"THE LAUNCH ERA · OPERATIONS",agentsEyebrow:"YOUR SPECIALISTS",providerEyebrow:"DRAFT GENERATOR",ownerBadge:"● Owner only",eyebrow:"JESSIE · VERIFIED TEAM BRIEF",title:"The whole team in one view",micro:"Read-only · Owner approval for actions",note:"Metricool, Drive and Resend are not yet authorized as direct AI Team data sources. Drafts and checks do not send or publish anything.",intro:"The seven specialists check your live workspace when this page opens. Choose Review my workspace to refresh.",checked:"Checked",partial:"Partial",noPriorities:"No verified urgent priorities found; partial sources still need review.",briefPrefix:"Read-only review · ",source:"Source",page:"Page",notReachable:"Not reachable",needsAttention:"Needs attention",noSummary:"Source check returned no summary."},
 es:{heroPrefix:"Conoce a tu ",heroEm:"equipo IA.",heroEyebrow:"THE LAUNCH ERA · OPERACIONES",agentsEyebrow:"TUS ESPECIALISTAS",providerEyebrow:"GENERADOR DE BORRADORES",ownerBadge:"● Solo propietaria",eyebrow:"JESSIE · RESUMEN VERIFICADO",title:"Todo tu equipo en un solo lugar",micro:"Solo lectura · Tú apruebas las acciones",note:"Metricool, Drive y Resend aún no están autorizados como fuentes directas del AI Team. Los borradores y revisiones no envían ni publican nada.",intro:"Los siete especialistas revisan tu espacio al abrir esta página. Pulsa Revisar mi espacio para actualizar.",checked:"Revisado",partial:"Parcial",noPriorities:"No se detectaron prioridades confirmadas; las fuentes parciales aún requieren revisión.",briefPrefix:"Revisión de solo lectura · ",source:"Fuente",page:"Página",notReachable:"No disponible",needsAttention:"Requiere atención",noSummary:"La revisión no devolvió un resumen."}
};
const factSpanish={
 "Active lead records scanned":"Prospectos activos revisados",
 "Potential follow-ups due":"Seguimientos posiblemente pendientes",
 "Candidates requiring final consent check":"Candidatos pendientes de comprobar consentimiento",
 "Lead records":"Registros de prospectos",
 "Booking accounts inspected":"Proyectos Booking revisados",
 "Paid orders":"Pedidos pagados",
 "Paid with intake missing":"Pedidos pagados sin intake",
 "Intakes awaiting build start":"Intakes pendientes de inicio de producción",
 "Paid without delivery stamp":"Pedidos pagados sin entrega registrada",
 "AI orders not recorded delivered":"Pedidos IA sin entrega registrada",
 "Delivery source":"Fuente de entregas",
 "Support requests inspected":"Solicitudes de soporte revisadas",
 "Not marked resolved":"Solicitudes sin resolver",
 "Oldest unresolved date":"Fecha de la solicitud más antigua sin resolver",
 "Support source":"Fuente de soporte",
 "Public checks passed":"Rutas públicas comprobadas",
 "Public checks attempted":"Rutas públicas revisadas",
 "Branch":"Rama",
 "Latest commit":"Último cambio",
 "Latest completed CI":"Última prueba automática terminada",
 "Latest CI workflow":"Último proceso de pruebas",
 "Repository health":"Estado del repositorio",
 "Public titles verified":"Títulos públicos comprobados",
 "Marketing pages inspected":"Páginas de marketing revisadas",
 "Metricool publishing integration":"Integración de publicación con Metricool",
 "Active prospects":"Prospectos activos",
 "Unread owner alerts":"Avisos sin leer",
 "Tasks awaiting approval":"Tareas pendientes de aprobación",
 "Blocked AI Team tasks":"Tareas bloqueadas del equipo",
 "Public home":"Inicio público",
 "Owner Command Center":"Command Center privado",
 "Private AI Team":"Equipo IA privado",
 "Password recovery":"Recuperar contraseña",
 "Booking demo":"Demo de reservas",
 "Homepage":"Inicio",
 "Booking offer":"Oferta de reservas",
 "AI Assistant offer":"Oferta del asistente IA"
};
const ownerCheckCopy={
 es:{eyebrow:"VERIFICACIÓN PRIVADA",title:"Comprueba tu sesión del equipo IA",note:"Solo lectura · No se modifican clientes",intro:"Comprueba acceso, siete agentes, permisos y respuesta de Groq antes de publicar.",run:"Verificar mi sesión",copy:"Copiar informe sin datos privados",untested:"Sin comprobar en esta sesión.",checking:"Comprobando acceso y equipo…",summary:"Comprobación terminada",full:"Verificado",partial:"Requiere revisión",login:"Acceso de propietaria",roles:"Siete especialistas",permissions:"Permisos de solo lectura",provider:"Conexión del modelo IA",ok:"Verificado con la sesión actual",missing:"Sin confirmación suficiente",disabled:"Las acciones externas permanecen desactivadas",providerGood:"El modelo respondió",providerBad:"No se pudo verificar la respuesta del modelo",disclaimer:"Solo comprueba tu sesión. El revisor independiente debe validar otros usuarios, otros espacios y cada dispositivo.",copied:"Informe de QA copiado, sin datos personales.",failed:"No se pudo completar la revisión privada."},
 en:{eyebrow:"PRIVATE OWNER CHECK",title:"Verify your AI Team session",note:"Read-only · No client changes",intro:"Check access, seven agents, permissions and Groq response before release.",run:"Verify my session",copy:"Copy sanitized QA report",untested:"Not tested in this session.",checking:"Checking access and team…",summary:"Checks completed",full:"Verified",partial:"Needs review",login:"Owner-only access",roles:"Seven specialists",permissions:"Read-only permissions",provider:"AI model connection",ok:"Verified for this session",missing:"Could not fully verify",disabled:"External actions remain disabled",providerGood:"Model responded",providerBad:"Model response not verified",disclaimer:"Checks this session only. Independent QA must verify other users, other workspaces and each device.",copied:"QA report copied without personal information.",failed:"Private checks could not finish."}
};
function oc(key){return ownerCheckCopy[language][key]||key}
let ownerCheck=null;
function renderOwnerCheck(){
 const nodes=[["owner-diagnostic-eyebrow","eyebrow"],["owner-diagnostic-title","title"],["owner-diagnostic-note","note"],["owner-diagnostic-intro","intro"],["owner-diagnostic-disclaimer","disclaimer"],["owner-diagnostic-run","run"],["owner-diagnostic-copy","copy"]];
 for(const [id,key] of nodes){const element=$(id);if(element)element.textContent=oc(key)}
 const status=$("owner-diagnostic-status"),results=$("owner-diagnostic-results"),copyButton=$("owner-diagnostic-copy");
 if(!status||!results||!copyButton)return;
 results.replaceChildren();
 copyButton.hidden=!ownerCheck;
 if(!ownerCheck){status.textContent=oc("untested");return}
 status.textContent=oc("summary")+" · "+new Date(ownerCheck.timestamp).toLocaleString(language==="es"?"es-US":"en-US");
 const checks=[["login",ownerCheck.login],["roles",ownerCheck.roles],["permissions",ownerCheck.permissions],["provider",ownerCheck.model]];
 for(const [key,passed] of checks){
  const item=el("div","ait-owner-diagnostic-result");
  const symbol=el("span","ait-owner-diagnostic-symbol",passed?"✓":"!");
  const label=el("strong","",oc(key));
  const state=el("span","ait-owner-diagnostic-state "+(passed?"passed":"needs-review"),passed?oc("full"):oc("partial"));
  item.append(symbol,label,state);results.append(item);
 }
 const detail=el("p","ait-muted",ownerCheck.model?oc("providerGood"):oc("providerBad"));results.append(detail);
}
function sanitizedOwnerReport(){
 if(!ownerCheck)return "";
 const result={report:"TLE Jessie AI Team private session check",checked_at:ownerCheck.timestamp,
  language:ownerCheck.language,viewport_width_px:ownerCheck.viewportWidth,
  owner_session_verified:ownerCheck.login,all_seven_roles_reported:ownerCheck.roles,
  external_actions_disabled:ownerCheck.permissions,ai_provider_responded:ownerCheck.model,
  provider:ownerCheck.provider,agent_count:ownerCheck.agentCount,partial_agent_reports:ownerCheck.partial,
  scope:"current signed-in owner only; cross-tenant, other-user and device QA not verified"};
 return JSON.stringify(result,null,2);
}
async function verifyOwnerSession(){
 const button=$("owner-diagnostic-run");if(!button||button.disabled||!verified)return;
 button.disabled=true;button.textContent=oc("checking");
 const results=await Promise.allSettled([
  api({action:"capability_manifest"}),api({action:"team_brief",language}),api({action:"provider_check"})
 ]);
 const extract=i=>results[i].status==="fulfilled"?results[i].value:null;
 const permission=extract(0),brief=extract(1),model=extract(2);
 const expected=["jessie","sales","projects","developer","qa","creative","care"];
 const allRoles=Array.isArray(permission?.roles)&&expected.every(a=>permission.roles.includes(a))&&permission.roles.length===7;
 const reports=Array.isArray(brief?.reports)?brief.reports:[];
 const verifiedBrief=reports.length===7&&expected.every(agent=>reports.some(r=>r.agent===agent&&r.read_only===true))
   &&brief?.no_external_actions===true;
 ownerCheck={timestamp:new Date().toISOString(),language,viewportWidth:Math.max(0,Math.round(window.innerWidth||0)),
  login:!!(permission?.owner_only&&brief?.ok===true),roles:allRoles&&verifiedBrief,
  permissions:permission?.external_actions_enabled===false&&brief?.no_external_actions===true,
  model:model?.verified===true&&model?.reason==="connected",
  provider:model?.provider==="groq"?"GroqCloud":model?.provider==="openai"?"OpenAI":"unverified",
  agentCount:reports.length,partial:reports.filter(r=>r.status!=="checked").length};
 renderOwnerCheck();
 button.disabled=false;
}
function teamTx(key){return teamCopy[language][key]||key}
function localFact(label){const original=String(label||teamTx("source"));return language==="es"?(factSpanish[original]||original):original}
function el(tag,cls,text){const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n}
function showError(message){const toast=$("toast");toast.textContent=String(message||tx("serverError"));toast.hidden=false;toast.classList.add("error");setTimeout(()=>{toast.hidden=true;toast.classList.remove("error")},6000)}
function notify(message){const toast=$("toast");toast.textContent=message;toast.hidden=false;toast.classList.remove("error");setTimeout(()=>toast.hidden=true,4500)}
async function api(body){
 if(!verified&&body.action!=="list")throw Error("Owner verification required");
 const {data:{session},error}=await db.auth.getSession();
 if(error||!session?.access_token)throw Error("Sign in to the Command Center");
 const abort=new AbortController(),timer=setTimeout(()=>abort.abort(),19000);
 try{
  const r=await fetch(ENDPOINT,{method:"POST",headers:{"Content-Type":"application/json",apikey:KEY,Authorization:"Bearer "+session.access_token},body:JSON.stringify(body),signal:abort.signal});
  const data=await r.json().catch(()=>({}));
  if(!r.ok||data.ok!==true)throw Error(data.error||tx("serverError"));
  return data;
 }finally{clearTimeout(timer)}
}
function lock(){verified=false;$("loading").hidden=true;$("locked").hidden=false;$("app").classList.add("hidden");document.body.classList.remove("crm-owner-view");}
function agentName(key){return agents.find(a=>a.key===key)?.name||key}
function statusName(key){
 const map={planned:["Planificada","Planned"],in_progress:["En revisión","In review"],needs_approval:["Necesita aprobación","Needs approval"],approved:["Aprobada","Approved"],completed:["Completada","Completed"],blocked:["Bloqueada","Blocked"],cancelled:["Cancelada","Cancelled"]};
 return (map[key]||[key,key])[language==="es"?0:1];
}
function renderAgents(){
 const root=$("agents");root.replaceChildren();
 for(const [i,a] of agents.entries()){
  const card=el("article","ait-agent"+(i===0?" lead":""));
  card.append(el("div","symbol",a.icon),el("h3","",a.name),el("p","",a[language]));
  const controls=el("div","ait-agent-actions");
  const go=el("button","",tx("create")+" →");go.type="button";go.onclick=()=>showDialog(a.key);
  const run=el("button","ait-run-btn",tx("run")+" ↗");run.type="button";run.onclick=()=>runAgent(a.key,null,run);
  controls.append(go,run);card.append(controls);root.append(card);
 }
}
function renderTasks(){
 const root=$("tasks");root.replaceChildren();
 const active=tasks.filter(t=>!["completed","cancelled"].includes(t.status)).length;
 $("activeCount").textContent=String(active);
 $("approvalCount").textContent=String(tasks.filter(t=>t.status==="needs_approval").length);
 if(!tasks.length){root.append(el("p","ait-muted",tx("empty")));return}
 for(const t of tasks){
  const box=el("article","ait-task");
  const top=el("div","ait-task-top");top.append(el("span","ait-agent-pill",agentName(t.agent_key)),el("span","ait-status "+t.status,statusName(t.status)));
  box.append(top,el("h3","",t.title));
  if(t.description)box.append(el("p","",t.description));
  // Source-backed automatic briefs are displayed beside the task.
  // They are templates for owner review, not completed implementation.
  const preparedReview=outputs.find(o=>o.task_id===t.id&&o.generation_mode==="template"&&
    typeof o.title==="string"&&o.title.startsWith("Public evidence · "))||
    outputs.find(o=>o.task_id===t.id&&o.generation_mode==="template"&&
    typeof o.title==="string"&&o.title.startsWith("Prepared review · "));
  const pendingPreparedReview=preparedReview?.status==="draft"?preparedReview:null;
  if(preparedReview){
    const detail=el("details","ait-plan");
    detail.style.cssText="margin:12px 0;min-width:0;background:#f0f8fd;border:1px solid #c9deeb;border-radius:13px;padding:12px;color:#191919";
    const caption=language==="es"?"Jessie preparó una revisión interna":"Jessie prepared an internal review";
    const reviewStatus=preparedReview.status==="draft"
      ?(language==="es"?" · necesita tu decisión":" · needs your decision")
      :preparedReview.status==="approved"
       ?(language==="es"?" · revisada y aprobada":" · reviewed and approved")
       :(language==="es"?" · se solicitaron cambios":" · changes requested");
    const summary=el("summary","",caption+reviewStatus);summary.style.cssText="cursor:pointer;font-weight:800;font-size:13px;line-height:1.5";
    detail.append(summary);
    const note=el("p","",language==="es"
      ?(preparedReview.title.startsWith("Public evidence · ")?
          "Revisión de referencias públicas. Las coincidencias son orientativas; comprueba los enlaces y autoriza cada decisión."
          :"Preparación basada en registros internos. No se inspeccionaron enlaces públicos ni se ejecutó el trabajo.")
      :(preparedReview.title.startsWith("Public evidence · ")?
          "Public reference review. Text matches are clues only; verify links and approve every decision."
          :"Prepared from internal records. No public links were inspected and no work was executed."));
    note.style.cssText="font-size:12px;line-height:1.5;margin:10px 0";detail.append(note);
    const pre=el("pre","ait-output-copy",preparedReview.content);
    pre.style.cssText="white-space:pre-wrap;overflow-wrap:anywhere;word-break:break-word;max-width:100%;font-size:12px;line-height:1.55;margin:0";
    detail.append(pre);
    if(pendingPreparedReview){
      const options=el("div","ait-task-actions");
      options.style.marginTop="12px";
      for(const [decision,esLabel,enLabel] of [
        ["approve","Aprobar revisión interna","Approve internal review"],
        ["reject","Solicitar cambios","Request changes"]
      ]){
        const btn=el("button",decision==="approve"?"ait-action-primary":"",language==="es"?esLabel:enLabel);
        btn.type="button";
        btn.onclick=async()=>{
          if(inFlight)return;
          inFlight=true;btn.disabled=true;
          try{
            await api({action:"review_output",id:preparedReview.id,decision});
            if(decision==="approve"&&t.status==="needs_approval"){
              // Approve the internal work plan only, never start production or delivery.
              await api({action:"approve",id:t.id});
            }
            if(decision==="reject"&&t.status==="needs_approval"){
              await api({action:"status",id:t.id,status:"blocked"});
            }
            await refresh();
            notify(language==="es"?"Decisión guardada. No se enviaron mensajes ni se modificaron pedidos.":"Decision saved. No messages sent or orders changed.");
          }catch(e){showError(e.message);await refresh().catch(()=>{})}
          finally{inFlight=false;btn.disabled=false}
        };
        options.append(btn);
      }
      detail.append(options);
    }
    box.append(detail);
  }
  const stamp=new Date(t.created_at).toLocaleDateString(language==="es"?"es-US":"en-US");
  box.append(el("p","",stamp+" · "+(t.priority==="normal"?"Normal":t.priority)+(t.task_origin&&t.task_origin!=="manual"?" · "+(language==="es"?"Automática":"Automated"):"")));
  const buttons=el("div","ait-task-actions");
  const add=(label,fn,primary=false)=>{
   const n=el("button",primary?"ait-action-primary":"",label);n.type="button";
   n.onclick=async()=>{if(inFlight)return;inFlight=true;n.disabled=true;try{await fn(t,box);if(verified)await refresh()}catch(e){showError(e.message)}finally{inFlight=false;n.disabled=false}};
   buttons.append(n);
  };
  if(!["cancelled","completed"].includes(t.status)){
    add(tx("run"),async task=>{const data=await api({action:"run_agent",agent_key:task.agent_key,id:task.id,language});notify(data.reused?tx("reusedRun"):tx("readOnly"));});
    add(tx("draftOutput"),async task=>{await api({action:"compose_output",id:task.id,language});notify(tx("draftCreated"))},true);
    add(tx("plan"),async(task,item)=>{
      const r=await api({action:"plan",id:task.id,language});
      plans.set(task.id,{text:r.plan,mode:r.generation_mode||"ai"});renderTasks();notify(r.generation_mode==="template"?tx("planTemplate"):tx("planDisclaimer"));
    },true);
    if(t.status==="planned"||t.status==="blocked")add(t.status==="blocked"?tx("unblock"):tx("start"),task=>api({action:"status",id:task.id,status:"in_progress"}));
    if(["planned","in_progress","blocked"].includes(t.status))add(tx("needs"),task=>api({action:"status",id:task.id,status:"needs_approval"}));
    if(t.status==="needs_approval"&&!pendingPreparedReview)add(tx("approve"),task=>api({action:"approve",id:task.id}),true);
    if(t.status==="in_progress")add(tx("block"),task=>api({action:"status",id:task.id,status:"blocked"}));
    if(t.status==="approved")add(tx("complete"),task=>{activeFinish=task.id;$("finish-evidence").value="";$("finish-dialog").showModal()},true);
    if(["planned","blocked","needs_approval"].includes(t.status))add(tx("cancel"),async task=>{if(window.confirm(tx("confirmCancel")))await api({action:"status",id:task.id,status:"cancelled"});});
  }
  box.append(buttons);
  if(plans.has(t.id)){const plan=el("div","ait-plan",(plans.get(t.id).mode==="template"?tx("planTemplate"):tx("planDisclaimer"))+"\n\n"+plans.get(t.id).text);box.append(plan)}
  if(t.status==="completed"&&t.evidence){box.append(el("p","",tx("verified")+": "+t.evidence))}
  root.append(box);
 }
}
function renderActivity(){
 const root=$("activity");root.replaceChildren();
 if(!events.length){root.textContent=tx("auditEmpty");return}
 for(const x of events.slice(0,12)){
  const item=el("article");item.append(el("div","",x.summary),el("small","",new Date(x.created_at).toLocaleString(language==="es"?"es-US":"en-US")));root.append(item);
 }
}
function renderScan(){
 const root=$("snapshot");root.replaceChildren();
 $("scanState").textContent=scan?(new Date(scan.collected_at).toLocaleTimeString(language==="es"?"es-US":"en-US",{hour:"numeric",minute:"2-digit"})):tx("notChecked");
 if(!scan){root.textContent=tx("snapshot");return}
 for(const [key,label] of [["prospects",tx("prospects")],["unread_notifications",tx("notifications")],["open_support",tx("support")],["active_tasks",tx("queue")]]){
  const item=el("div");item.append(el("span","",label),el("b","",scan.counts[key]===null?tx("partial"):String(scan.counts[key])));root.append(item);
 }
}
function renderTeamBrief(){
 const status=$("team-overview-status"),reportsRoot=$("team-brief-reports"),priorityRoot=$("team-brief-actions");
 if(!status||!reportsRoot||!priorityRoot)return;
 reportsRoot.replaceChildren();priorityRoot.replaceChildren();
 if(!scan?.reports?.length){status.textContent=teamTx("intro");return}
 const when=new Date(scan.collected_at).toLocaleString(language==="es"?"es-US":"en-US");
 status.textContent=teamTx("briefPrefix")+when;
 const actions=Array.isArray(scan.priority_actions)?scan.priority_actions:[];
 if(!actions.length)priorityRoot.append(el("p","ait-muted",teamTx("noPriorities")));
 for(const action of actions.slice(0,5)){
  const item=el("article","ait-priority");
  item.append(el("span","ait-agent-pill",agentName(action.agent)),el("strong","",action.label),el("b","",String(action.count)));
  priorityRoot.append(item);
 }
 for(const x of scan.reports){
  const card=el("article","ait-brief-card");
  const head=el("div","ait-task-top");
  head.append(el("strong","",agentName(x.agent)),el("span","ait-status "+(x.status==="checked"?"completed":"needs_approval"),x.status==="checked"?teamTx("checked"):teamTx("partial")));
  card.append(head,el("p","",String(x.summary||"")));
  const facts=el("div","ait-run-facts");
  for(const y of (x.facts||[]).slice(0,5)){
   const row=el("div");row.append(el("span","",localFact(y.label)),el("b","",y.value===null||y.value===undefined?"—":String(y.value)));facts.append(row);
  }
  card.append(facts);reportsRoot.append(card);
 }
}
async function runAgent(agentKey,taskId,button){
 if(inFlight)return;
 inFlight=true;
 const old=button.textContent;
 button.disabled=true;button.textContent=tx("running");
 try{
  const request={action:"run_agent",agent_key:agentKey,language};
  if(taskId)request.id=taskId;
  const result=await api(request);
  await refresh();
  notify(result.reused?tx("reusedRun"):tx("readOnly"));
  document.getElementById("runs-section")?.scrollIntoView({behavior:"smooth",block:"start"});
 }catch(e){showError(e.message)}
 finally{button.disabled=false;button.textContent=old;inFlight=false}
}
function renderRuns(){
 const root=$("runs");if(!root)return;root.replaceChildren();
 if(!runs.length){root.append(el("p","ait-muted",tx("emptyRuns")));return}
 for(const item of runs.slice(0,12)){
  const card=el("article","ait-run");
  const header=el("div","ait-task-top");
  header.append(el("span","ait-agent-pill",agentName(item.agent_key)),
   el("span","ait-status "+(item.status==="success"?"completed":"needs_approval"),
    item.status==="success"?tx("successRun"):tx("partialRun")));
  card.append(header);
  const report=item.report||{};
  card.append(el("p","ait-run-summary",String(report.summary||teamTx("noSummary"))));
  const facts=el("div","ait-run-facts");
  for(const x of (Array.isArray(report.facts)?report.facts:[]).slice(0,12)){
   const row=el("div");
   const label=el("span","",localFact(x.label));
   const value=el("b","",x.value===null||x.value===undefined?tx("partial"):String(x.value));
   row.append(label,value);
   facts.append(row);
  }
  card.append(facts);
  if(Array.isArray(report.checks)&&report.checks.length){
   const disclosure=el("details","ait-run-details");
   disclosure.append(el("summary","",tx("details")+" ("+report.checks.length+")"));
   const body=el("div","ait-run-checks");
   for(const check of report.checks.slice(0,12)){
    const row=el("p","",localFact(check.label||teamTx("page"))+": "+String(check.http_status===null?teamTx("notReachable"):check.http_status)+" · "+(check.expected_marker_found===false||check.present===false?teamTx("needsAttention"):teamTx("checked")));
    body.append(row);
   }
   disclosure.append(body);card.append(disclosure);
  }
  card.append(el("p","ait-run-note",(item.run_origin==="daily_review"?(language==="es"?"Informe automático · ":"Automatic report · "):"")+tx("readOnly")+" · "+new Date(item.started_at).toLocaleString(language==="es"?"es-US":"en-US")));
  root.append(card);
 }
}


function showProviderState(){
 const title=$("ai-provider-title"),status=$("ai-provider-status"),button=$("ai-provider-check");
 if(!title||!status||!button)return;
 title.textContent=tx("connectionTitle");
 button.textContent=tx("connectionTest");
 if(providerState?.verified===true){
  status.textContent=(providerState.provider==="groq"?"GroqCloud":providerState.provider==="openai"?"OpenAI":"AI")+ (language==="es"?" responde correctamente. Los próximos borradores pueden generarse con IA.":" responded successfully. New drafts can be AI-generated.");
 }else if(providerState?.checked===true){
  status.textContent=tx("connectionError")+(providerState.reason?" ("+String(providerState.reason)+")":"")+(providerState.httpStatus?" · HTTP "+providerState.httpStatus:"")+(providerState.errorCode&&providerState.errorCode!=="unspecified"?" · "+providerState.errorCode:"");
 }else if(providerState?.configured===true){
  status.textContent=tx("connectionReady");
 }else{
  status.textContent=tx("connectionNotConfigured");
 }
}

function renderOutputs(){
 const root=$("outputs");if(!root)return;
 root.replaceChildren();
 if(!outputs.length){root.append(el("p","ait-muted",tx("noOutputs")));return}
 for(const output of outputs.slice(0,20)){
  const card=el("article","ait-output");
  const head=el("div","ait-task-top");
  head.append(el("span","ait-agent-pill",agentName(output.agent_key)),el("span","ait-status "+(output.status==="approved"?"completed":"needs_approval"),output.status==="draft"?tx("draftStatus"):output.status));
  card.append(head,el("h3","",output.title));
  card.append(el("p","ait-generation-mode",output.generation_mode==="template"?tx("draftTemplate"):tx("draftAI")));
  const body=el("pre","ait-output-copy",output.content);card.append(body);
  card.append(el("p","ait-run-note",tx("approvalOnly")+" · "+new Date(output.created_at).toLocaleString()));
  const actions=el("div","ait-task-actions");
  const clip=el("button","",tx("copyDraft"));clip.type="button";
  clip.onclick=async()=>{try{await navigator.clipboard.writeText(output.content);notify(tx("copyDraft"))}catch{showError("Could not copy to clipboard.")}};
  actions.append(clip);
  if(output.status==="draft"){
   const redo=el("button","",tx("regenerateDraft"));redo.type="button";
   redo.onclick=async()=>{redo.disabled=true;try{const result=await api({action:"compose_output",id:output.task_id,language,regenerate:true});await refresh();notify(result.reused?tx("reusedRun"):tx("draftCreated"))}catch(e){showError(e.message)}finally{redo.disabled=false}};
   actions.append(redo);
   for(const [decision,label] of [["approve",tx("approveDraft")],["reject",tx("rejectDraft")]]){
    const bt=el("button",decision==="approve"?"ait-action-primary":"",label);bt.type="button";
    bt.onclick=async()=>{
      bt.disabled=true;
      try{await api({action:"review_output",id:output.id,decision});await refresh()}catch(e){showError(e.message)}
      finally{bt.disabled=false}
    };
    actions.append(bt);
   }
  }
  card.append(actions);root.append(card);
 }
}

function applyText(){
 document.documentElement.lang=language;
 const heroTitle=$("ait-hero-title");
 if(heroTitle){const accent=document.createElement("em");accent.textContent=teamTx("heroEm");heroTitle.replaceChildren(document.createTextNode(teamTx("heroPrefix")),accent)}
 for(const [id,key] of [["ait-hero-eyebrow","heroEyebrow"],["ait-agent-eyebrow","agentsEyebrow"],["ait-provider-eyebrow","providerEyebrow"],["ait-owner-badge","ownerBadge"]]){const el=$(id);if(el)el.textContent=teamTx(key)}
 for(const [id,key] of [["team-overview-eyebrow","eyebrow"],["team-overview-title","title"],["team-overview-micro","micro"],["team-overview-note","note"]]){const e=$(id);if(e)e.textContent=teamTx(key)}
 $("intro").textContent=tx("intro");$("truth").textContent=tx("truth");
 $("scan").firstChild.textContent=tx("review")+" ";
 $("new-task-top").textContent=tx("newTask");$("new-task").textContent=tx("newTask");
 $("lang").textContent=language==="es"?"EN":"ES";
 document.querySelector(".ait-section-head #agents-title").textContent=tx("team");
 $("tasks-title").textContent=tx("taskTitle");
 const spans=$("stats").querySelectorAll("article > span");
 [tx("count"),tx("approvals"),tx("scan")].forEach((x,i)=>spans[i].textContent=x);
 const ds=$("task-dialog");ds.querySelector("h2").textContent=tx("modalTitle");
 const ls=ds.querySelectorAll("label");[tx("taskAgent"),tx("taskName"),tx("taskDesc"),tx("priority")].forEach((x,i)=>{ls[i].childNodes[0].textContent=x});
 $("create-submit").textContent=tx("create");
 document.querySelector("#finish-form label").childNodes[0].textContent=tx("evidence");
 renderAgents();renderTasks();renderScan();renderTeamBrief();renderOwnerCheck();renderActivity();renderRuns();renderOutputs();showProviderState();
 const rt=$("runs-title");if(rt)rt.textContent=tx("recent");
 const ot=$("outputs-title");if(ot)ot.textContent=tx("outputs");
}
async function refresh(){
 const out=await api({action:"list"});
 tasks=out.tasks||[];events=out.events||[];runs=out.runs||[];outputs=out.outputs||[];if(out.capabilities&&providerState?.checked!==true)providerState={configured:out.capabilities.ai_key_detected===true,verified:false,checked:false};
 renderTasks();renderActivity();renderRuns();renderOutputs();
}
function showDialog(agent="jessie"){
 $("task-agent").replaceChildren();
 for(const a of agents){const opt=document.createElement("option");opt.value=a.key;opt.textContent=a.name;$("task-agent").append(opt)}
 $("task-agent").value=agent;
 $("task-dialog").showModal();$("task-title").focus();
}
async function mountJessie(){
 try{
  const {data:{user}}=await db.auth.getUser();if(!user?.id)return;
  const {data:ws,error}=await db.from("tle_crm_workspaces").select("id").eq("created_by",user.id).eq("is_internal",true).limit(1).maybeSingle();
  if(error||!ws?.id)return;
  document.body.dataset.languageWorkspace=ws.id;
  const mod=await import("./jessy-owner-standalone.mjs");
  await mod.mountOwnerJessy({db,workspaceId:ws.id,page:"ai-team"});
 }catch(e){console.warn("Jessie availability check:",e.message)}
}
async function start(){
 if(!db){lock();return}
 try{
  const r=await api({action:"list"});
  verified=true;tasks=r.tasks||[];events=r.events||[];runs=r.runs||[];outputs=r.outputs||[];providerState={configured:r.capabilities?.ai_key_detected===true,checked:false,verified:false};
  $("loading").hidden=true;$("locked").hidden=true;$("app").classList.remove("hidden");
  document.body.classList.add("crm-owner-view");
  applyText();
  // Automatic, owner-authenticated read-only checks on opening the AI Team.
  // Do not block Jessie if a source is temporarily unavailable; no client state changes.
  void api({action:"team_brief",language}).then(data=>{
   if(!verified)return;
   scan=data;
   renderScan();
   renderTeamBrief();
  }).catch(e=>{
   if(verified)console.warn("AI Team automatic read-only brief unavailable:",e.message);
  });
  await mountJessie();
 }catch(e){lock();console.warn("AI Team private access:",e.message)}
}
window.TLEAIOpsGateway=Object.freeze({
 async brief(){if(!this.ready())throw Error("Owner AI Team access required");scan=await api({action:"team_brief",language});renderScan();renderTeamBrief();return scan},
 ready(){return verified===true&&!document.getElementById("app")?.classList.contains("hidden")},
 async run(agentKey){
  if(!this.ready()||!agents.some(a=>a.key===agentKey))throw Error("Owner AI Team access required");
  const res=await api({action:"run_agent",agent_key:agentKey,language});
  await refresh();
  return res.run;
 },
 async create(agentKey,description){
   if(!this.ready()||!agents.some(a=>a.key===agentKey))throw Error("Owner AI Team access required");
   const title=String(description||"").trim().slice(0,160);
   if(title.length<3)throw Error("Please describe the task");
   const result=await api({action:"create",agent_key:agentKey,title,description:String(description||"").trim().slice(0,2500),priority:"normal"});
   await refresh();
   return result.task;
 },
 async draft(agentKey,description){
   if(!this.ready()||!agents.some(a=>a.key===agentKey))throw Error("Owner AI Team access required");
   const task=await this.create(agentKey,description);
   const response=await api({action:"compose_output",id:task.id,language});
   await refresh();
   document.getElementById("outputs-section")?.scrollIntoView({behavior:"smooth",block:"start"});
   return response.output;
 }
});
$("lang").addEventListener("click",()=>{language=language==="es"?"en":"es";if(scan?.reports)scan=null;ownerCheck=null;try{localStorage.setItem("tle_crm_owner_language",language)}catch{}applyText()});
for(const id of ["new-task","new-task-top"])$(id).onclick=()=>showDialog();
$("owner-diagnostic-run").onclick=verifyOwnerSession;
$("owner-diagnostic-copy").onclick=async()=>{
 const report=sanitizedOwnerReport();if(!report)return;
 try{await navigator.clipboard.writeText(report);notify(oc("copied"))}
 catch{showError(oc("failed"))}
};
$("ai-provider-check").onclick=async()=>{
 const button=$("ai-provider-check");if(button.disabled)return;
 button.disabled=true;button.textContent=tx("connectionChecking");
 try{
  const res=await api({action:"provider_check"});
  providerState={configured:res.configured===true,verified:res.verified===true,checked:true,reason:res.reason||null,provider:String(res.provider||""),httpStatus:Number(res.http_status)||null,errorCode:String(res.error_code||"")};
  showProviderState();
 }catch(e){showError(e.message)}
 finally{button.disabled=false}
};
$("scan").onclick=async()=>{const btn=$("scan");btn.disabled=true;try{scan=await api({action:"team_brief",language});renderScan();renderTeamBrief();document.getElementById("team-overview")?.scrollIntoView({behavior:"smooth",block:"start"})}catch(e){showError(e.message)}finally{btn.disabled=false}};
$("task-form").onsubmit=async e=>{
 e.preventDefault();const submit=$("create-submit");submit.disabled=true;
 try{const title=$("task-title").value.trim();if(title.length<3)throw Error("Task title is too short");
 await api({action:"create",title,agent_key:$("task-agent").value,description:$("task-description").value.trim(),priority:$("task-priority").value});
 $("task-dialog").close();e.target.reset();await refresh();notify(tx("created"));
 }catch(e){showError(e.message)}finally{submit.disabled=false}
};
$("finish-form").onsubmit=async e=>{e.preventDefault();const btn=$("finish-submit");btn.disabled=true;try{await api({action:"complete",id:activeFinish,evidence:$("finish-evidence").value.trim()});$("finish-dialog").close();activeFinish=null;await refresh();notify(tx("verified"))}catch(e){showError(e.message)}finally{btn.disabled=false}};
document.querySelectorAll("[data-dialog-close]").forEach(b=>b.onclick=()=>$(b.dataset.dialogClose).close());
db?.auth?.onAuthStateChange((event)=>{if(event==="SIGNED_OUT"||event==="USER_DELETED")lock()});
start();