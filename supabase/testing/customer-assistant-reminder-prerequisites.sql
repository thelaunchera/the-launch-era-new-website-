-- Testing only. Copies current scheduler functions; installs no cron or email worker.
create table if not exists public.tle_service_completions (id uuid default gen_random_uuid(), account_id uuid, lead_id uuid, completed_at timestamp with time zone default now(), completed_by uuid, recurring boolean default false, space_type text default 'home'::text, outreach_opted_in boolean default false, permission_source text, created_at timestamp with time zone default now());
create table if not exists public.tle_service_outbox (id uuid default gen_random_uuid(), outbox_key text, account_id uuid, lead_id uuid, completion_id uuid, kind text, booking_at timestamp with time zone, due_at timestamp with time zone, status text default 'pending'::text, provider_id text, error text, claimed_at timestamp with time zone, sent_at timestamp with time zone, created_at timestamp with time zone default now());
alter table public.tle_service_outbox add primary key (id);
alter table public.tle_service_outbox add unique (outbox_key);
alter table public.tle_service_completions add primary key (id);
alter table public.tle_service_completions add unique (lead_id);
alter table public.tle_service_outbox enable row level security;
alter table public.tle_service_completions enable row level security;
revoke all on public.tle_service_outbox,public.tle_service_completions from public,anon,authenticated;
grant all on public.tle_service_outbox,public.tle_service_completions to service_role;
create schema if not exists private;
CREATE OR REPLACE FUNCTION private.tle_service_refresh_reminders()
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare inserted_count integer=0;
begin
  -- Legacy pending reminders must not fire in addition to the new single 24h reminder.
  update public.tle_service_outbox
  set status='cancelled',error='Replaced by single 24-hour reminder'
  where kind in ('reminder_48h','reminder_day_5am') and status='pending';
  insert into public.tle_service_outbox(outbox_key,account_id,lead_id,kind,booking_at,due_at)
  select l.id::text||':reminder_24h:'||extract(epoch from l.requested_start_at)::bigint,
         l.account_id,l.id,'reminder_24h',l.requested_start_at,
         l.requested_start_at-interval '24 hours'
  from public.tle_booking_flow_leads l
  join public.tle_booking_flow_accounts a on a.id=l.account_id
  where l.status='booked'
    and l.requested_start_at>now()+interval '24 hours'
    and l.requested_start_at<now()+interval '65 days'
    and a.status='active' and a.payment_status='paid'
    and a.delivery_sent_at is not null and a.crm_workspace_id is not null
    and l.created_at<=l.requested_start_at-interval '24 hours'
    and l.raw_payload->>'appointment_reminders_opt_in'='true'
    and coalesce(l.raw_payload->>'reminders_opt_out','false')<>'true'
    and not exists(select 1 from public.tle_service_completions c where c.lead_id=l.id)
  on conflict(outbox_key) do nothing;
  get diagnostics inserted_count=row_count;
  update public.tle_service_outbox o
  set status='cancelled',error='Booking changed, completed or consent withdrawn'
  from public.tle_booking_flow_leads l
  where o.lead_id=l.id and o.kind='reminder_24h' and o.status='pending'
    and (l.status<>'booked'
      or l.requested_start_at is distinct from o.booking_at
      or coalesce(l.raw_payload->>'appointment_reminders_opt_in','false')<>'true'
      or coalesce(l.raw_payload->>'reminders_opt_out','false')='true'
      or exists(select 1 from public.tle_service_completions c where c.lead_id=l.id));
  return inserted_count;
end $function$;
CREATE OR REPLACE FUNCTION private.tle_service_claim_one()
 RETURNS tle_service_outbox
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare claimed public.tle_service_outbox;
begin
 with selected as(
   select id from public.tle_service_outbox where status='pending' and due_at<=now()
   order by due_at,id for update skip locked limit 1
 )
 update public.tle_service_outbox o set status='processing',claimed_at=now()
 from selected where o.id=selected.id returning o.* into claimed;
 return claimed;
end $function$;
revoke all on function private.tle_service_refresh_reminders() from public,anon,authenticated;
revoke all on function private.tle_service_claim_one() from public,anon,authenticated;
grant execute on function private.tle_service_refresh_reminders(), private.tle_service_claim_one() to service_role;
