import { clean, uuid, publicURL, blockedLead, easternDate, validDate } from './core.mjs';
import { inspectPage } from './public-page.mjs';

const BASE=Deno.env.get('SUPABASE_URL')||'',SERVICE=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')||'',ANON=Deno.env.get('SUPABASE_ANON_KEY')||'';
const ORIGINS=new Set(['https://thelaunchera.com','https://www.thelaunchera.com','https://command.thelaunchera.com']);
const EVIDENCE='tle_owner_growth_evidence',WATCHES='tle_owner_growth_watches';
const LEAD_FIELDS='id,business,contact,email,stage,followup,language,replied_at,archived_at,email_consent_status,email_followup_enabled,contact_decision,research_url,observed_evidence,primary_friction,service_fit';
const headers=origin=>({'Content-Type':'application/json','Cache-Control':'no-store','Vary':'Origin',
  'Access-Control-Allow-Origin':ORIGINS.has(origin)?origin:'https://thelaunchera.com',
  'Access-Control-Allow-Headers':'authorization,apikey,content-type,x-tle-worker-token','Access-Control-Allow-Methods':'POST,OPTIONS'});
const response=(data,status=200,origin='')=>new Response(JSON.stringify(data),{status,headers:headers(origin)});
async function rest(table,query='',method='GET',body=null){
  const r=await fetch(BASE+'/rest/v1/'+table+(query?'?'+query:''),{method,headers:{apikey:SERVICE,Authorization:'Bearer '+SERVICE,
    'Content-Type':'application/json',Prefer:'return=representation'},body:body===null?undefined:JSON.stringify(body),signal:AbortSignal.timeout(9000)});
  if(!r.ok)throw Error('Workspace data could not be verified ('+r.status+').');
  return r.status===204?[]:await r.json();
}
async function owner(req){
  const token=req.headers.get('authorization')||'';if(!token.startsWith('Bearer '))throw Error('unauthorized');
  const r=await fetch(BASE+'/auth/v1/user',{headers:{apikey:ANON,Authorization:token},signal:AbortSignal.timeout(6000)});
  if(!r.ok)throw Error('unauthorized');const user=await r.json();if(!uuid(user.id))throw Error('unauthorized');
  const admin=await rest('platform_admins','select=user_id&user_id=eq.'+user.id);
  const spaces=await rest('tle_crm_workspaces','select=id,created_by&is_internal=eq.true&created_by=eq.'+user.id);
  if(admin.length!==1||spaces.length!==1)throw Error('unauthorized');return {owner:user.id,workspace:spaces[0].id};
}
async function worker(req){
  const token=req.headers.get('x-tle-worker-token')||'';if(token.length!==64)throw Error('unauthorized');
  const ok=await rest('rpc/tle_crm_worker_token_ok','','POST',{p_token:token});if(ok!==true)throw Error('unauthorized');
  const spaces=await rest('tle_crm_workspaces','select=id,created_by&is_internal=eq.true');
  if(spaces.length!==1)throw Error('unauthorized');
  const admin=await rest('platform_admins','select=user_id&user_id=eq.'+spaces[0].created_by);
  if(admin.length!==1)throw Error('unauthorized');return {workspace:spaces[0].id,owner:spaces[0].created_by};
}
const scope=ctx=>'workspace_id=eq.'+ctx.workspace+'&owner_id=eq.'+ctx.owner;
async function record(ctx,kind,title,data,leadId=null){
  const rows=await rest(EVIDENCE,'','POST',{workspace_id:ctx.workspace,owner_id:ctx.owner,lead_id:leadId,kind,title:clean(title,180),data});
  if(rows.length!==1)throw Error('Evidence save was not confirmed.');return rows[0];
}
async function lead(ctx,id){
  if(!uuid(id))throw Error('Choose a prospect from your workspace.');
  const rows=await rest('tle_crm_leads','select='+LEAD_FIELDS+'&id=eq.'+id+'&workspace_id=eq.'+ctx.workspace);
  if(rows.length!==1)throw Error('Prospect not found in this workspace.');return rows[0];
}
async function snapshot(ctx){
  const [leads,events,records,watches]=await Promise.all([
    rest('tle_crm_leads','select='+LEAD_FIELDS+'&workspace_id=eq.'+ctx.workspace+'&archived_at=is.null&order=followup.asc.nullslast&limit=500'),
    rest('tle_crm_email_events','select=lead_id,event_type,created_at&workspace_id=eq.'+ctx.workspace+'&order=created_at.desc&limit=1500'),
    rest(EVIDENCE,'select=*&'+scope(ctx)+'&order=created_at.desc&limit=80'),
    rest(WATCHES,'select=id,url,label,active,last_status,last_checked_at,next_check_at&'+scope(ctx)+'&order=created_at.desc&limit=20')]);
  const today=easternDate();
  return {leads:leads.map(l=>({...l,followup_blocked:blockedLead(l)||events.some(e=>e.lead_id===l.id&&e.event_type==='email_failed'),history:events.filter(e=>e.lead_id===l.id).slice(0,10)})),records,watches,
    due:leads.filter(l=>l.followup&&l.followup<=today&&!blockedLead(l)).length,
    checked_at:new Date().toISOString(),coverage:{lead_limit:500,event_limit:1500,lead_limit_reached:leads.length===500,event_limit_reached:events.length===1500},
    capabilities:{paid_data:false,automatic_email:false,automatic_demo_delivery:false,watch_schedule:'daily per active page; dispatcher every 30 minutes'}};
}
async function scan(ctx,value,leadId=null){
  const data=await inspectPage(value);const {monitor_text,...publicData}=data;
  return record(ctx,'research',publicData.title||publicData.source_url,publicData,leadId);
}
async function checkWatch(ctx,id=null){
  if(id&&!uuid(id))throw Error('Invalid watch.');
  const rows=await rest('rpc/tle_owner_growth_claim_watch','','POST',{p_workspace_id:ctx.workspace,p_owner_id:ctx.owner,p_watch_id:id});
  if(!rows?.length)return {checked:false,reason:'No due page or this page is already being checked.'};
  const w=rows[0];let result;
  try{
    const data=await inspectPage(w.url),bytes=new TextEncoder().encode(data.monitor_text);
    const fingerprint=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))).map(b=>b.toString(16).padStart(2,'0')).join('');
    const changed=!!w.fingerprint&&w.fingerprint!==fingerprint;
    const status=!w.fingerprint?'baseline':changed?'changed':'unchanged';
    result=await record(ctx,'watch_check',w.label,{source_url:w.url,checked_at:data.checked_at,status,
      previous_excerpt:w.last_excerpt||null,current_excerpt:data.monitor_text.slice(0,1800),
      scope:'Visible text in one public HTML response. A change is not proof of a price change.',},null);
    await rest(WATCHES,scope(ctx)+'&id=eq.'+w.id,'PATCH',{fingerprint,last_excerpt:data.monitor_text.slice(0,1800),last_status:status,last_checked_at:data.checked_at,lease_until:null});
    if(changed)await rest('tle_crm_notifications','','POST',{workspace_id:ctx.workspace,kind:'owner_growth',title:'Watched page changed',body:clean(w.label,100)+': review the saved source comparison.',source_key:'growth-watch:'+result.id});
  }catch(e){
    const message=clean(e.message,220);await rest(WATCHES,scope(ctx)+'&id=eq.'+w.id,'PATCH',{last_status:'error',last_checked_at:new Date().toISOString(),lease_until:null});
    result=await record(ctx,'watch_check',w.label,{source_url:w.url,status:'error',error:message,checked_at:new Date().toISOString()});
  }
  return {checked:true,record:result};
}

Deno.serve(async req=>{
  const origin=req.headers.get('origin')||'';
  if(origin&&!ORIGINS.has(origin))return response({ok:false,error:'Origin not allowed.'},403,origin);
  if(req.method==='OPTIONS')return new Response(null,{status:204,headers:headers(origin)});
  if(req.method!=='POST')return response({ok:false,error:'Method not allowed.'},405,origin);
  try{
    if(!BASE||!SERVICE||!ANON)return response({ok:false,error:'Service configuration unavailable.'},503,origin);
    const raw=await req.text();if(raw.length>100000)return response({ok:false,error:'Request too large.'},413,origin);
    let input;try{input=JSON.parse(raw)}catch{return response({ok:false,error:'Invalid request.'},400,origin)}
    const scheduled=input?.action==='scheduled_watch';
    const ctx=scheduled?await worker(req):await owner(req);
    if(scheduled)return response({ok:true,...await checkWatch(ctx),external_messages:0},200,origin);
    const action=input?.action;
    if(action==='list')return response({ok:true,...await snapshot(ctx)},200,origin);
    if(action==='research'){
      const l=input.lead_id?await lead(ctx,input.lead_id):null;
      const url=publicURL(input.url||l?.research_url).href;
      const previous=await rest(EVIDENCE,'select=*&'+scope(ctx)+'&kind=eq.research&data->>source_url=eq.'+encodeURIComponent(url)+'&created_at=gte.'+encodeURIComponent(new Date(Date.now()-300000).toISOString())+'&order=created_at.desc&limit=1');
      if(previous.length&&previous[0].lead_id===(l?.id||null))return response({ok:true,record:previous[0],reused:true},200,origin);
      return response({ok:true,record:await scan(ctx,url,l?.id||null)},200,origin);
    }
    if(action==='set_followup'){
      const l=await lead(ctx,input.lead_id),date=String(input.date||'');
      if(blockedLead(l))throw Error('This prospect is replied, archived, won or opted out. Review it in the CRM.');
      if(!validDate(date)||date<easternDate())throw Error('Choose today or a future date (Eastern time).');
      if(!Object.hasOwn(input,'expected_date')||(input.expected_date||null)!==(l.followup||null))throw Error('Prospect changed. Refresh before saving.');
      const audit=await rest('rpc/tle_owner_growth_set_followup','','POST',{p_workspace_id:ctx.workspace,p_owner_id:ctx.owner,
        p_lead_id:l.id,p_expected_date:input.expected_date||null,p_date:date,p_note:clean(input.note,500)});
      return response({ok:true,record:audit},200,origin);
    }
    if(action==='demo_brief'){
      const l=await lead(ctx,input.lead_id);
      const source=await rest(EVIDENCE,'select=id,data&'+scope(ctx)+'&kind=eq.research&lead_id=eq.'+l.id+'&order=created_at.desc&limit=1');
      const data={business:l.business,language:l.language==='es'?'es':'en',area:clean(input.area,140),services:Array.isArray(input.services)?input.services.map(s=>clean(s,90)).filter(Boolean).slice(0,6):[],
        source_id:source[0]?.id||null,source_url:source[0]?.data?.source_url||null,source_checked_at:source[0]?.data?.checked_at||null,
        mode:'private_concept',real_booking:false,automatic_delivery:false,missing:['Confirm business branding and licensed images','Confirm services, coverage and availability','Connect and test real bookings only after client approval']};
      return response({ok:true,record:await record(ctx,'demo_brief','Demo concept · '+l.business,data,l.id)},200,origin);
    }
    if(action==='add_watch'){
      const url=publicURL(input.url).href,label=clean(input.label,100)||new URL(url).hostname;
      const all=await rest(WATCHES,'select=id,url&'+scope(ctx));
      const existing=all.find(w=>w.url===url);if(existing)return response({ok:true,id:existing.id,reused:true},200,origin);
      if(all.length>=10)throw Error('Keep up to 10 watched pages. Pause or remove an old page first.');
      // The initial scan verifies public access and robots permission before scheduling.
      await inspectPage(url);
      const rows=await rest(WATCHES,'','POST',{workspace_id:ctx.workspace,owner_id:ctx.owner,url,label});
      return response({ok:true,id:rows[0].id},200,origin);
    }
    if(action==='check_watch')return response({ok:true,...await checkWatch(ctx,input.id)},200,origin);
    if(action==='toggle_watch'){
      if(!uuid(input.id)||typeof input.active!=='boolean')throw Error('Invalid watch update.');
      const rows=await rest(WATCHES,scope(ctx)+'&id=eq.'+input.id,'PATCH',{active:input.active});
      if(rows.length!==1)throw Error('Watch not found.');return response({ok:true},200,origin);
    }
    if(action==='report'){
      const s=await snapshot(ctx);
      const data={generated_at:s.checked_at,due:s.due,active_leads:s.leads.length,coverage:s.coverage,
        evidence:s.records.filter(r=>['research','watch_check','demo_brief'].includes(r.kind)).map(r=>({id:r.id,kind:r.kind,title:r.title,created_at:r.created_at,source_url:r.data?.source_url||null})),
        scope:'Owner workspace snapshot. Counts are not conversion rates, revenue or proof of completed work.'};
      return response({ok:true,record:await record(ctx,'report','Sales workspace report',data)},200,origin);
    }
    return response({ok:false,error:'Unknown action.'},400,origin);
  }catch(e){const unauthorized=e.message==='unauthorized';return response({ok:false,error:unauthorized?'Owner sign-in required.':clean(e.message,250)},unauthorized?401:400,origin)}
});
