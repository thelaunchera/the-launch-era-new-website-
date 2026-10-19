begin;
update public.tle_booking_flow_leads set status='booked',requested_start_at=now()+interval '3 days'
where account_id in ('aa25fbee-9034-4a68-8862-47d6a32dffb5','5cff82f1-0f8b-4422-ad87-bb8fb7dd4ca5');
do $qa$
declare n integer; lid uuid; aid uuid;
begin
 n:=private.tle_service_refresh_reminders();
 if n<>1 then raise exception 'Expected one opted-in confirmed appointment, got %',n;end if;
 if private.tle_service_refresh_reminders()<>0 then raise exception 'Duplicate reminder';end if;
 select id,account_id into lid,aid from public.tle_booking_flow_leads where external_ref='req_11111111-2222-4333-8444-555555555552';
 update public.tle_booking_flow_leads set raw_payload=raw_payload||'{"reminders_opt_out":true}'::jsonb where id=lid;
 perform private.tle_service_refresh_reminders();
 if exists(select 1 from public.tle_service_outbox where lead_id=lid and status='pending') then raise exception 'Optout did not cancel';end if;
 update public.tle_booking_flow_leads set requested_start_at=now()+interval '4 days',raw_payload=raw_payload||'{"reminders_opt_out":false}'::jsonb where id=lid;
 if private.tle_service_refresh_reminders()<>1 then raise exception 'Reschedule did not schedule new reminder';end if;
 insert into public.tle_service_completions(account_id,lead_id) values(aid,lid);
 perform private.tle_service_refresh_reminders();
 if exists(select 1 from public.tle_service_outbox where lead_id=lid and status='pending') then raise exception 'Completion did not cancel';end if;
 if exists(select 1 from public.tle_service_outbox where account_id='aa25fbee-9034-4a68-8862-47d6a32dffb5') then raise exception 'No-consent appointment got reminder';end if;
end $qa$;
select 'PASS: explicit consent, confirmed appointment, single reminder, retry deduplication, reschedule, optout and completion cancellation; transaction rolled back' as result;
rollback;
