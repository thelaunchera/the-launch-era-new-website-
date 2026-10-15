-- TLE: source-backed, owner-review-only automatic briefs for internal agent tasks.
-- Does NOT access client URLs, call models, send messages, modify orders, or approve work.
alter table public.tle_ai_team_outputs
  add column if not exists automation_key text;

create unique index if not exists tle_ai_team_outputs_automation_dedupe
on public.tle_ai_team_outputs(workspace_id,automation_key)
where automation_key is not null;

create or replace function private.tle_ai_team_prepare_automatic_briefs(p_limit integer default 16)
returns jsonb
language plpgsql
security definer
set search_path to 'pg_catalog','public','private'
as $worker$
declare
  t record;
  b record;
  a record;
  v_prefix text;
  v_suffix text;
  v_content text;
  v_business text;
  v_missing text;
  v_checks text;
  v_action text;
  v_kind text;
  v_created uuid;
  v_seen integer:=0;
  v_prepared integer:=0;
begin
  -- Only one internal admin workspace. No client-owned workspace can be processed.
  if (select count(*) from public.tle_crm_workspaces w
      join public.platform_admins adm on adm.user_id=w.created_by
      where w.is_internal is true)<>1 then
    return jsonb_build_object('skipped','internal agency scope not unique','prepared',0,'external_actions',0);
  end if;
  for t in
    select q.* from public.tle_ai_team_tasks q
    join public.tle_crm_workspaces w on w.id=q.workspace_id
    join public.platform_admins adm on adm.user_id=w.created_by and adm.user_id=q.owner_id
    where w.is_internal is true
      and q.task_origin in ('platform_event','daily_review')
      and q.status='planned'
      and q.automation_key is not null
      and not exists (
        select 1 from public.tle_ai_team_outputs o
        where o.workspace_id=q.workspace_id and o.automation_key='prepared:'||q.automation_key
      )
    order by q.created_at,q.id
    limit greatest(1,least(coalesce(p_limit,16),30))
    for update of q skip locked
  loop
    v_seen:=v_seen+1;
    v_prefix:=split_part(t.automation_key,':',1);
    v_suffix:=split_part(t.automation_key,':',2);
    v_content:=null;
    v_business:='';
    v_missing:='';
    v_checks:='';
    v_action:='';
    v_kind:=case t.agent_key
      when 'projects' then 'project_checklist'
      when 'developer' then 'engineering_spec'
      when 'qa' then 'qa_test_plan'
      when 'creative' then 'marketing_draft'
      when 'sales' then 'sales_draft'
      when 'care' then 'care_draft'
      when 'jessie' then 'operations_brief'
      else null end;
    if v_kind is null then continue; end if;

    if v_prefix in ('paid-intake','intake-review','intake-info',
      'brand-references','booking-config','booking-qa')
      and v_suffix ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    then
      select business_name,payment_status,intake_completed_at,build_started_at,delivery_sent_at,intake_payload
      into b
      from public.tle_booking_flow_accounts
      where id=v_suffix::uuid and tle_sales_workspace_id=t.workspace_id
        and payment_status='paid' and delivery_sent_at is null;
      if not found then continue; end if;
      if v_prefix in ('intake-review','intake-info','brand-references','booking-config','booking-qa')
         and b.intake_completed_at is null then continue; end if;
      if v_prefix in ('booking-config','booking-qa') and b.build_started_at is null then continue; end if;
      v_business:=left(coalesce(nullif(trim(b.business_name),''),'Business name not provided'),110);
      v_missing:=concat_ws(', ',
         case when b.intake_completed_at is null then 'customer intake' end,
         case when b.intake_completed_at is not null
               and nullif(trim(b.intake_payload->>'services'),'') is null then 'service list' end,
         case when b.intake_completed_at is not null
               and nullif(trim(b.intake_payload->>'availability'),'') is null then 'availability' end,
         case when b.intake_completed_at is not null
               and nullif(trim(b.intake_payload->>'service_areas'),'') is null then 'service area' end,
         case when b.intake_completed_at is not null
               and nullif(trim(b.intake_payload->>'job_duration_minutes'),'') is null then 'appointment duration' end
      );
      if v_prefix='intake-info' and v_missing='' then continue; end if;
      v_checks:='Verified paid order: YES'||E'\n'||
        'Customer intake received: '||case when b.intake_completed_at is not null then 'YES' else 'NO' end||E'\n'||
        'Owner approved production start recorded: '||case when b.build_started_at is not null then 'YES' else 'NO' end||E'\n'||
        'Business website supplied: '||case when nullif(trim(b.intake_payload->>'existing_domain'),'') is not null then 'YES' else 'NO' end||E'\n'||
        'Instagram supplied: '||case when nullif(trim(b.intake_payload->>'instagram_url'),'') is not null then 'YES' else 'NO' end||E'\n'||
        'Google Business supplied: '||case when nullif(trim(b.intake_payload->>'google_business_url'),'') is not null then 'YES' else 'NO' end||E'\n'||
        'Intake field gaps detected: '||coalesce(nullif(v_missing,''),'none in basic fields; owner still checks accuracy');
      v_action:=case v_prefix
        when 'paid-intake' then 'Review paid status and pending intake. Do not send a reminder without checking the actual email history.'
        when 'intake-review' then 'Open Clients & Purchases. Compare answers, verify customer-approved prices and access. Owner must explicitly approve production.'
        when 'intake-info' then 'Ask for the specific missing details before the owner starts production; do not guess.'
        when 'brand-references' then 'Examine the supplied public business links manually or through a separately approved website audit. Compare identity, services and opening hours with the intake before using them.'
        when 'booking-config' then 'Review the technical plan for the approved booking flow, service durations, prices, private dashboard and notifications.'
        when 'booking-qa' then 'Prepare an isolated phone/tablet/desktop QA pass, booking and inquiry routing, reschedule and cancellation tests. Record evidence.'
      end;
      v_content:='TLE INTERNAL PREPARED REVIEW — NOT COMPLETED WORK'||E'\n'||
        'Business: '||v_business||E'\n'||
        'Source: verified internal booking account and saved customer intake; public links were NOT visited.'||E'\n\n'||
        v_checks||E'\n\n'||
        'RECOMMENDED NEXT ACTION'||E'\n'||v_action||E'\n\n'||
        'OWNER DECISION: review and approve the brief only. This does not approve production, change prices, publish, send or deliver anything.';

    elsif v_prefix in ('ai-intake-pending','assistant-order','ai-brand-references','ai-dev','ai-qa')
      and v_suffix ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    then
      select business_name,submitted_at,delivered_at,status,offer,website_url,booking_page_url
      into a from public.tle_ai_agent_orders
      where id=v_suffix::uuid and tle_sales_workspace_id=t.workspace_id
      and delivered_at is null;
      if not found then continue; end if;
      if v_prefix in ('assistant-order','ai-brand-references','ai-dev','ai-qa')
         and a.submitted_at is null then continue; end if;
      if v_prefix in ('ai-dev','ai-qa') and a.status not in ('in_setup','pending_setup') then continue; end if;
      v_business:=left(coalesce(nullif(trim(a.business_name),''),'Business name not provided'),110);
      v_checks:='Assistant offer: '||left(coalesce(a.offer,'not provided'),60)||E'\n'||
       'Intake submitted: '||case when a.submitted_at is null then 'NO' else 'YES' end||E'\n'||
       'Installation target supplied: '||case when nullif(trim(a.website_url),'') is not null or nullif(trim(a.booking_page_url),'') is not null then 'YES' else 'NO' end||E'\n'||
       'Delivery recorded: NO';
      v_action:=case v_prefix
        when 'ai-intake-pending' then 'Check the verified purchase and whether the setup intake invitation was received, without sending duplicates.'
        when 'assistant-order' then 'Verify intake goals, consent, business answers and approved production kickoff in Clients & Purchases.'
        when 'ai-brand-references' then 'Compare customer-provided website or booking URL against the intake. No automatic external visit occurred.'
        when 'ai-dev' then 'Prepare scoped implementation plan for approved assistant behavior and human escalation. Do not activate anything.'
        when 'ai-qa' then 'Prepare isolated assistant test, fact accuracy, opt-in rules, mobile/tablet/desktop and human handoff checks.'
      end;
      v_content:='TLE INTERNAL PREPARED REVIEW — NOT COMPLETED WORK'||E'\n'||
        'Business: '||v_business||E'\n'||
        'Source: saved AI Assistant order; website/booking URL NOT visited.'||E'\n\n'||
        v_checks||E'\n\n'||
        'RECOMMENDED NEXT ACTION'||E'\n'||v_action||E'\n\n'||
        'OWNER DECISION: approve this internal brief only. No payment, subscription, messages, deployment or delivery occurred.';

    elsif v_prefix in ('daily-sales','daily-support','daily-projects')
      and t.task_origin='daily_review'
    then
      v_content:='TLE DAILY REVIEW — PREPARED FOR OWNER'||E'\n'||
        'Responsible agent: '||t.agent_key||E'\n'||
        'Source: internal scheduled monitoring; original data and permissions must be rechecked before acting.'||E'\n\n'||
        'VERIFIED QUEUE NOTICE'||E'\n'||left(t.description,1200)||E'\n\n'||
        'NEXT ACTION'||E'\n'||
        'Review current records and authorization in Command Center. Prepare a response only if needed. Do not send, publish or change any customer automatically.'||E'\n\n'||
        'OWNER DECISION: review only.';
    end if;
    if v_content is null then continue; end if;
    insert into public.tle_ai_team_outputs
      (workspace_id,owner_id,task_id,agent_key,kind,title,content,status,generation_mode,automation_key)
    values
      (t.workspace_id,t.owner_id,t.id,t.agent_key,v_kind,
       left('Prepared review · '||t.title,160),left(v_content,5800),
       'draft','template','prepared:'||t.automation_key)
    on conflict (workspace_id,automation_key) where automation_key is not null do nothing
    returning id into v_created;
    if v_created is null then continue; end if;
    update public.tle_ai_team_tasks
       set status='needs_approval',updated_at=now()
     where id=t.id and status='planned';
    insert into public.tle_ai_team_events(workspace_id,task_id,actor_id,action,summary)
      values(t.workspace_id,t.id,t.owner_id,'output_created',
      'Automatic internal evidence brief prepared; requires owner review; no customer or external actions.');
    v_prepared:=v_prepared+1;
  end loop;
  return jsonb_build_object('tasks_checked',v_seen,'prepared',v_prepared,'external_actions',0,'requires_owner_review',true);
end
$worker$;

revoke all on function private.tle_ai_team_prepare_automatic_briefs(integer)
  from public,anon,authenticated;

select cron.schedule('tle-ai-team-prepare-briefs','*/5 * * * *',
  'select private.tle_ai_team_prepare_automatic_briefs(16);');
