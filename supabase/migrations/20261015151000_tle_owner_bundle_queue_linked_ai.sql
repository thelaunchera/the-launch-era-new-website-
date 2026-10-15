-- Owner-only joined purchase view: one checkout / one intake / two separately gated deliveries.
-- ai_order_id links the bundled AI installation to the paid Booking order by the
-- exact verified Stripe session, never by email or business name.
create or replace function public.tle_owner_bundle_queue()
returns jsonb
language plpgsql
security definer
set search_path to ''
as $function$
begin
 if auth.uid() is null or not exists (
   select 1 from public.tle_crm_workspaces w
   where w.created_by=auth.uid() and w.is_internal=true
 ) then raise exception 'Owner access required' using errcode='42501';end if;
 return coalesce((
  select jsonb_agg(x order by x->>'paid_at' desc)
  from (
   select jsonb_build_object(
    'id',b.id,
    'business_name',b.business_name,'owner_email',b.owner_email,
    'language',b.language,'booking_status',b.status,
    'booking_page_url',b.booking_page_url,
    'intake_done',b.intake_completed_at is not null,
    'bundle_ai',b.ai_addon_offer,
    'amount_paid_cents',b.payment_amount_cents,
    'paid_at',b.payment_paid_at,
    'booking_delivery_recorded',b.delivery_sent_at is not null,
    'ai_order_id',a.id,
    'ai_status',coalesce(a.status,'not_prepared'),
    'ai_delivered_at',a.delivered_at,
    'ai_monthly_cents',a.monthly_amount_cents
   ) as x
   from public.tle_booking_flow_accounts b
   left join lateral (
     select o.id,o.status,o.delivered_at,o.monthly_amount_cents
     from public.tle_ai_agent_orders o
     where o.stripe_session_id=b.stripe_session_id
       and o.offer=b.ai_addon_offer
     order by o.created_at desc limit 1
   ) a on true
   where b.payment_status='paid'
     and b.ai_addon_offer in ('ai-booking','ai-followup','ai-business')
   order by b.payment_paid_at desc nulls last
   limit 30
  ) rows
 ),'[]'::jsonb);
end
$function$;
