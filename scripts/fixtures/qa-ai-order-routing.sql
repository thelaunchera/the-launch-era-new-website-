-- Isolated PostgreSQL fixture: copy of routing logic; temporary task sink; always rollback.
-- Never attaches a test trigger to a public customer table or calls notification providers.
begin;
create temp table ai_order_test_tasks(source text primary key,agent text,title text) on commit drop;
create function pg_temp.record_test_task(p_agent text,p_title text,p_description text,p_priority text,p_source text,p_origin text default 'platform_event')
returns uuid language plpgsql as $test$ begin
 insert into pg_temp.ai_order_test_tasks values(p_source,p_agent,p_title) on conflict do nothing;
 return null;
end $test$;
CREATE OR REPLACE FUNCTION pg_temp.tle_ai_team_platform_event_test()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'public'
AS $function$
declare v_id uuid;
begin
 if TG_TABLE_NAME='tle_crm_support_requests' then
   if new.status in ('open','pending') and (TG_OP='INSERT' or old.status is distinct from new.status) then
     v_id:=pg_temp.record_test_task('care','Review new client support request',
     'A support request needs attention in the private Command Center. Confirm the request and tenant before responding. No message has been sent.',
     'high','support:'||new.id,'platform_event');
   end if;
 elsif TG_TABLE_NAME='tle_booking_flow_accounts' then
   if new.payment_status='paid' and new.intake_completed_at is null then
     v_id:=pg_temp.record_test_task('projects','Paid booking: intake requires review',
     'A booking payment is recorded without a completed intake. Verify order identity, payment and client consent in Clients & Purchases. Do not mark delivery ready.',
     'high','paid-intake:'||new.id,'platform_event');
   elsif new.payment_status='paid' and new.intake_completed_at is not null and new.build_started_at is null then
     v_id:=pg_temp.record_test_task('projects','Booking intake ready for owner check',
     'An intake is recorded for a paid booking, but production is not started. The owner must check completeness and explicitly approve production start.',
     'high','intake-review:'||new.id,'platform_event');
   end if;
 elsif TG_TABLE_NAME='tle_ai_agent_orders' then
   if new.status in ('paid','active','intake_completed','intake_submitted','submitted','pending_setup','in_setup') and new.delivered_at is null then
     v_id:=pg_temp.record_test_task('projects','AI Assistant order needs owner review',
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
create temp table tle_ai_agent_orders(id uuid,status text,delivered_at timestamptz) on commit drop;
create trigger ai_event_test after insert or update on pg_temp.tle_ai_agent_orders for each row execute function pg_temp.tle_ai_team_platform_event_test();
insert into pg_temp.tle_ai_agent_orders values ('00000000-0000-4000-8000-000000000001','intake_submitted',null);
update pg_temp.tle_ai_agent_orders set status='in_setup' where id='00000000-0000-4000-8000-000000000001';
insert into pg_temp.tle_ai_agent_orders values ('00000000-0000-4000-8000-000000000002','intake_submitted',now()),('00000000-0000-4000-8000-000000000003','failed',null);
create temp table tle_booking_flow_accounts(id uuid,payment_status text,intake_completed_at timestamptz,build_started_at timestamptz) on commit drop;
create trigger booking_event_test after insert on pg_temp.tle_booking_flow_accounts for each row execute function pg_temp.tle_ai_team_platform_event_test();
insert into pg_temp.tle_booking_flow_accounts values ('00000000-0000-4000-8000-000000000004','paid',null,null),('00000000-0000-4000-8000-000000000005','paid',now(),null),('00000000-0000-4000-8000-000000000006','unpaid',null,null);
do $test$ begin
 if (select count(*) from pg_temp.ai_order_test_tasks)<>3 then raise exception 'Unexpected task count'; end if;
 if not exists(select 1 from pg_temp.ai_order_test_tasks where source='assistant-order:00000000-0000-4000-8000-000000000001') then raise exception 'Missing AI intake task'; end if;
 if exists(select 1 from pg_temp.ai_order_test_tasks where agent<>'projects') then raise exception 'Unexpected agent'; end if;
end $test$;
rollback;