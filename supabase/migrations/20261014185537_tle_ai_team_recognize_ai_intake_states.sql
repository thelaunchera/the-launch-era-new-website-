-- Recognize the exact states saved by the verified AI onboarding handler.
-- Existing task deduplication, owner routing and approval gates stay unchanged.
CREATE OR REPLACE FUNCTION public.tle_ai_team_platform_event()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'public'
AS $function$
declare v_id uuid;
begin
 if TG_TABLE_NAME='tle_crm_support_requests' then
   if new.status in ('open','pending') and (TG_OP='INSERT' or old.status is distinct from new.status) then
     v_id:=public.tle_ai_team_record_automatic('care','Review new client support request',
     'A support request needs attention in the private Command Center. Confirm the request and tenant before responding. No message has been sent.',
     'high','support:'||new.id,'platform_event');
   end if;
 elsif TG_TABLE_NAME='tle_booking_flow_accounts' then
   if new.payment_status='paid' and new.intake_completed_at is null then
     v_id:=public.tle_ai_team_record_automatic('projects','Paid booking: intake requires review',
     'A booking payment is recorded without a completed intake. Verify order identity, payment and client consent in Clients & Purchases. Do not mark delivery ready.',
     'high','paid-intake:'||new.id,'platform_event');
   elsif new.payment_status='paid' and new.intake_completed_at is not null and new.build_started_at is null then
     v_id:=public.tle_ai_team_record_automatic('projects','Booking intake ready for owner check',
     'An intake is recorded for a paid booking, but production is not started. The owner must check completeness and explicitly approve production start.',
     'high','intake-review:'||new.id,'platform_event');
   end if;
 elsif TG_TABLE_NAME='tle_ai_agent_orders' then
   if new.status in ('paid','active','intake_completed','intake_submitted','submitted','pending_setup','in_setup') and new.delivered_at is null then
     v_id:=public.tle_ai_team_record_automatic('projects','AI Assistant order needs owner review',
     'An AI Assistant order needs checking in Clients & Purchases before any production or customer email. Verify payment and intake; do not auto-deliver.',
     'high','assistant-order:'||new.id,'platform_event');
   end if;
 end if;
 return new;
exception when others then
 raise warning 'AI Team event alert skipped: %',sqlstate;
 return new;
end $function$
;
