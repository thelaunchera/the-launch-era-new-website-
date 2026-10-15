-- Owner-only watchdog for multi-product Booking + AI bundle orders.
-- Does not change orders, AI subscriptions, customer messaging, or booking state.
create or replace function private.tle_ai_team_watch_bundle_integrity()
returns jsonb language plpgsql security definer
set search_path to 'pg_catalog','public','private'
as $guard$
declare
 v_ws uuid;v_count integer;v_booking record;v_ai record;
 v_new uuid;v_alerts integer:=0;v_checked integer:=0;
begin
 select (array_agg(w.id))[1],count(*)
 into v_ws,v_count
 from public.tle_crm_workspaces w
 where w.is_internal is true
  and exists(select 1 from public.platform_admins p where p.user_id=w.created_by);
 if v_count<>1 then
  return jsonb_build_object('safe_skip','unique owner workspace not verified','alerts',0,'external_actions',0);
 end if;
 for v_booking in
  select id,stripe_session_id,ai_addon_offer,intake_completed_at,
         payment_paid_at,created_at,delivery_sent_at,build_started_at
  from public.tle_booking_flow_accounts
  where payment_status='paid'
    and tle_sales_workspace_id=v_ws
    and ai_addon_offer in ('ai-booking','ai-followup','ai-business')
  order by created_at desc
  limit 500
 loop
  v_checked:=v_checked+1;
  select id,status,submitted_at,delivered_at,offer
  into v_ai from public.tle_ai_agent_orders
  where stripe_session_id=v_booking.stripe_session_id
    and offer=v_booking.ai_addon_offer
  order by created_at desc limit 1;

  if v_booking.intake_completed_at is not null
   and now()-v_booking.intake_completed_at>interval '15 minutes'
   and v_ai.id is null then
    v_new:=public.tle_ai_team_record_automatic(
     'projects','Bundle intake completed but AI order is not linked',
     'A verified paid Booking + AI bundle has a completed shared intake, but no matching AI order was found for the exact checkout session and selected AI plan. Check the original Stripe session, intake sync result and owner bundle queue. Do not ask customer to repay, manually activate a subscription, or deliver either component as a completed bundle.',
     'urgent','watch:bundle:missing-ai:'||v_booking.id,'platform_event');
    if v_new is not null then v_alerts:=v_alerts+1;end if;
  end if;

  if v_ai.id is not null and v_booking.delivery_sent_at is not null
    and v_ai.delivered_at is null
    and now()-v_booking.delivery_sent_at>interval '24 hours' then
    v_new:=public.tle_ai_team_record_automatic(
     'projects','Bundle Booking delivered; AI still needs review',
     'Booking has a recorded final delivery for this paid bundle, but its linked AI Assistant has not been delivered. Check installation, client approval, QA, subscription not-yet-active state and the actual client communications. Booking delivery must not close the full bundle. No automatic AI activation.',
     'high','watch:bundle:ai-pending:'||v_booking.id,'platform_event');
    if v_new is not null then v_alerts:=v_alerts+1;end if;
  end if;

  if v_ai.id is not null and v_ai.delivered_at is not null
    and v_booking.delivery_sent_at is null
    and now()-v_ai.delivered_at>interval '24 hours' then
    v_new:=public.tle_ai_team_record_automatic(
     'qa','Bundle AI activated; Booking delivery still pending',
     'The linked AI Assistant has a delivery timestamp but the purchased Booking product has no recorded final delivery. Audit the live booking link, QA checklist, private buyer access and email delivery status. Do not count the bundle as fully fulfilled, or change the AI subscription automatically.',
     'high','watch:bundle:booking-pending:'||v_booking.id,'platform_event');
    if v_new is not null then v_alerts:=v_alerts+1;end if;
  end if;

  if v_ai.id is not null and v_ai.status='active'
    and v_ai.delivered_at is null then
    v_new:=public.tle_ai_team_record_automatic(
     'qa','Bundle AI marked active without proof of delivery',
     'The bundle AI order status is active without a delivery timestamp. Review Stripe and the verified installation; confirm whether a subscription was started before documented delivery. No automatic customer message, subscription edit or delivery marking.',
     'urgent','watch:bundle:active-no-delivery:'||v_booking.id,'platform_event');
    if v_new is not null then v_alerts:=v_alerts+1;end if;
  end if;
 end loop;
 return jsonb_build_object('paid_bundles_checked',v_checked,'new_internal_alerts',v_alerts,
  'external_actions',0,'customer_orders_changed',0);
end
$guard$;
revoke all on function private.tle_ai_team_watch_bundle_integrity() from public,anon,authenticated;
select cron.schedule('tle-owner-bundle-integrity-hourly','37 * * * *',
 'select private.tle_ai_team_watch_bundle_integrity();');
