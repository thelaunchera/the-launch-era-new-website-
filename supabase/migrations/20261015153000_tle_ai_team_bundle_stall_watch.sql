-- Detect stalled components of ONE paid Booking + AI bundle without touching
-- customer records, Stripe or delivery status. Distinguish the two release gates.
create or replace function private.tle_ai_team_watch_bundles()
returns jsonb language plpgsql security definer
set search_path to 'pg_catalog','public','private'
as $watch$
declare v_ws uuid;v_count integer;v_created integer:=0;v_checked integer:=0;v_new uuid;
 a record;v_now timestamptz:=now();
begin
 select (array_agg(w.id))[1],count(*) into v_ws,v_count from public.tle_crm_workspaces w
 where w.is_internal is true and exists(select 1 from public.platform_admins p where p.user_id=w.created_by);
 if v_count<>1 then return jsonb_build_object('safe_skip','agency scope unverified','new_alerts',0,'external_actions',0);end if;
 for a in
  select b.id,b.intake_completed_at,b.delivery_sent_at,b.ai_addon_offer,b.created_at,
   linked.id as ai_order_id,linked.status as ai_status,linked.delivered_at as ai_delivered_at
  from public.tle_booking_flow_accounts b
  left join lateral (
    select o.id,o.status,o.delivered_at from public.tle_ai_agent_orders o
    where o.stripe_session_id=b.stripe_session_id and o.offer=b.ai_addon_offer
      and o.tle_sales_workspace_id=v_ws
    order by o.created_at desc limit 1
  ) linked on true
  where b.payment_status='paid' and b.tle_sales_workspace_id=v_ws
    and b.ai_addon_offer in ('ai-booking','ai-followup','ai-business')
  order by b.created_at desc limit 500
 loop
  v_checked:=v_checked+1;
  if a.intake_completed_at is null then continue;end if;
  if a.ai_order_id is null and v_now-a.intake_completed_at>interval '20 minutes' then
   v_new:=public.tle_ai_team_record_automatic('projects',
    'Bundle intake complete, but AI order is missing',
    'A verified paid Booking + AI bundle has a completed shared intake, but no linked AI order under the same checkout session. Review the original checkout and onboarding error before configuring either product. Do not collect a second payment or request another intake.',
    'urgent','watch:bundle:missing-ai:'||a.id,'platform_event');
   if v_new is not null then v_created:=v_created+1;end if;
  end if;
  if a.delivery_sent_at is not null and a.ai_delivered_at is null
     and v_now-a.delivery_sent_at>interval '4 hours' then
   v_new:=public.tle_ai_team_record_automatic('projects',
    'Bundle Booking delivered; AI Assistant still pending',
    'Booking has a recorded final handoff but the AI Assistant has no delivery timestamp. Check the linked AI installation, QA, customer review and separate billing activation. Do not mark the full bundle delivered or start the AI monthly clock.',
    'high','watch:bundle:ai-pending:'||a.id,'platform_event');
   if v_new is not null then v_created:=v_created+1;end if;
  end if;
  if a.ai_delivered_at is not null and a.delivery_sent_at is null
     and v_now-a.ai_delivered_at>interval '4 hours' then
   v_new:=public.tle_ai_team_record_automatic('qa',
    'Bundle AI activated; Booking handoff still pending',
    'The bundled AI Assistant has a recorded delivery but Booking does not. Verify the Booking page, private Command Center, six QA checks and customer approval before separate final Booking delivery. Do not send or publish from this notice.',
    'high','watch:bundle:booking-pending:'||a.id,'platform_event');
   if v_new is not null then v_created:=v_created+1;end if;
  end if;
 end loop;
 return jsonb_build_object('paid_bundles_checked',v_checked,'new_internal_alerts',v_created,'external_actions',0);
end
$watch$;
revoke all on function private.tle_ai_team_watch_bundles() from public,anon,authenticated;
select cron.schedule('tle-ai-team-bundle-stall-hourly','16 * * * *','select private.tle_ai_team_watch_bundles();');
