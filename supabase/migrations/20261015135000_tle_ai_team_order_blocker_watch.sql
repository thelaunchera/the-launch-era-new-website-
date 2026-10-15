-- TLE owner-order watchdog — proactive internal alerts only, never customer actions.
-- Safe for multi-company data: inspect unique verified agency and its linked orders.
create or replace function private.tle_ai_team_watch_order_blockers()
returns jsonb language plpgsql security definer
set search_path to 'pg_catalog','public','private'
as $watch$
declare
 v_ws uuid;v_agencies integer;v_new uuid;v_created integer:=0;
 v_booking integer:=0;v_ai integer:=0;
 a record;k record;v_now timestamptz:=now();
begin
 select (array_agg(w.id))[1],count(*) into v_ws,v_agencies
 from public.tle_crm_workspaces w
 where w.is_internal is true and exists (
   select 1 from public.platform_admins admin where admin.user_id=w.created_by
 );
 if v_agencies<>1 then return jsonb_build_object('safe_skip','agency not uniquely verified','alerts',0,'external_actions',0);end if;

 -- Paid, unfulfilled Booking ONLY. Previously delivered, expired, test and unpaid orders are excluded.
 for a in
  select id,payment_paid_at,created_at,intake_sent_at,intake_completed_at,
    build_started_at,activation_email_sent_at,activation_email_delivery_status,
    delivery_sent_at,tle_sales_workspace_id,business_name
  from public.tle_booking_flow_accounts
  where payment_status='paid' and delivery_sent_at is null
    and (tle_sales_workspace_id=v_ws or tle_sales_workspace_id is null)
  order by created_at desc limit 500
 loop
  v_booking:=v_booking+1;
  if a.tle_sales_workspace_id is null and v_now-coalesce(a.payment_paid_at,a.created_at)>interval '60 minutes' then
    v_new:=public.tle_ai_team_record_automatic(
      'projects','Paid order needs internal agency routing',
      'A paid Booking order has no internal sales-workspace link. Verify the original checkout and correct order-to-agency association before modifying the project. Never move or merge a buyer workspace automatically.',
      'urgent','watch:book:agency:'||a.id,'platform_event');
    if v_new is not null then v_created:=v_created+1; end if;
    continue;
  end if;
  if a.intake_completed_at is null then
    if a.intake_sent_at is null and v_now-coalesce(a.payment_paid_at,a.created_at)>interval '1 hour' then
      v_new:=public.tle_ai_team_record_automatic('projects','Check paid customer intake invitation',
        'Verified paid Booking order has no recorded intake invitation after an hour. Inspect the actual provider history, invitation link and customer email. Do not resend blindly.',
        'high','watch:book:missing-invite:'||a.id,'platform_event');
      if v_new is not null then v_created:=v_created+1; end if;
    elsif a.intake_sent_at is not null and v_now-a.intake_sent_at>interval '24 hours' then
      v_new:=public.tle_ai_team_record_automatic('care','Booking intake still pending after one day',
        'The intake has not been completed 24 hours after an invitation was recorded. Check its true delivery status and any buyer reply before deciding if a personal follow-up is appropriate. Consent must be checked. Do not auto-email.',
        'normal','watch:book:intake-pending:'||a.id,'platform_event');
      if v_new is not null then v_created:=v_created+1; end if;
    end if;
  end if;
  if a.intake_completed_at is not null and a.build_started_at is null then
    select subject_type,approved_at into k
    from public.tle_project_kickoffs
    where subject_type='booking' and subject_id=a.id and approved_at is not null;
    if found and v_now-k.approved_at>interval '1 hour' then
      v_new:=public.tle_ai_team_record_automatic('projects','Approved Booking kickoff not reflected in build state',
        'Owner-approved kickoff is recorded but Booking build_started_at is empty. Check both systems and the acknowledgement email before changing any dates. Do not issue a duplicate confirmation.',
        'high','watch:book:kickoff-state:'||a.id,'platform_event');
      if v_new is not null then v_created:=v_created+1; end if;
    end if;
  end if;
  if a.build_started_at is not null and v_now-a.build_started_at>interval '48 hours' then
    v_new:=public.tle_ai_team_record_automatic('projects','Check Booking project against 48-hour estimate',
      'Production began over 48 elapsed hours ago without recorded final delivery. Review actual working-hours cutoff, customer revisions, blockers and QA; the window is an ESTIMATE, not proof of a missed deadline. Update the owner plan, do not auto-email.',
      'high','watch:book:production-progress:'||a.id,'platform_event');
    if v_new is not null then v_created:=v_created+1; end if;
  end if;
  if a.activation_email_sent_at is not null
      and a.activation_email_delivery_status is distinct from 'delivered'
      and v_now-a.activation_email_sent_at>interval '4 hours' then
    v_new:=public.tle_ai_team_record_automatic('care','Verify private Command Center invitation delivery',
      'Private account activation email was sent more than four hours ago but a delivered provider status is not recorded. Check actual Resend/provider events and link correctness. Queued/accepted is not delivered. Never send a duplicate automatically.',
      'high','watch:book:activation-delivery:'||a.id,'platform_event');
    if v_new is not null then v_created:=v_created+1; end if;
  end if;
 end loop;

 -- AI orders: do not interpret a checkout session prefix alone as verified payment.
 -- Flag for a *human payment check*, not automatic activation.
 for a in
  select id,created_at,submitted_at,delivered_at,status,stripe_session_id,
    stripe_subscription_id,tle_sales_workspace_id
  from public.tle_ai_agent_orders
  where delivered_at is null and tle_sales_workspace_id=v_ws
  order by created_at desc limit 500
 loop
  v_ai:=v_ai+1;
  if a.submitted_at is null and v_now-a.created_at>interval '24 hours'
    and a.stripe_session_id like 'cs_live_%' then
    v_new:=public.tle_ai_team_record_automatic('projects','Review AI Assistant payment and pending intake',
      'AI Assistant checkout record has an associated live Stripe session but no intake after 24 hours. Verify Stripe payment first, then check existing intake invitation and actual provider delivery. Do not assume payment or send duplicates.',
      'normal','watch:ai:intake-pending:'||a.id,'platform_event');
    if v_new is not null then v_created:=v_created+1; end if;
  end if;
  if a.status='active' then
    v_new:=public.tle_ai_team_record_automatic('qa','AI Assistant active without delivery record',
      'AI Assistant status shows active but no delivered_at timestamp. Inspect actual installation, client acknowledgement and Stripe subscription timing. Do not alter subscription or mark delivery without owner verification.',
      'urgent','watch:ai:active-undelivered:'||a.id,'platform_event');
    if v_new is not null then v_created:=v_created+1; end if;
  end if;
  select approved_at into k
  from public.tle_project_kickoffs
  where subject_type='ai' and subject_id=a.id and approved_at is not null;
  if found and v_now-k.approved_at>interval '48 hours' then
    v_new:=public.tle_ai_team_record_automatic('projects','Review AI Assistant post-kickoff progress',
      'AI Assistant kickoff was approved over 48 elapsed hours ago without a recorded delivery. Review the estimated production window, test and customer review gates before any billing or delivery change. Do not activate automatically.',
      'high','watch:ai:production-progress:'||a.id,'platform_event');
    if v_new is not null then v_created:=v_created+1; end if;
  end if;
 end loop;
 return jsonb_build_object('booking_checked',v_booking,'ai_checked',v_ai,'internal_alerts_created',v_created,'external_actions',0);
end
$watch$;
revoke all on function private.tle_ai_team_watch_order_blockers() from public,anon,authenticated;
select cron.schedule('tle-ai-team-order-blockers-hourly','11 * * * *','select private.tle_ai_team_watch_order_blockers();');
