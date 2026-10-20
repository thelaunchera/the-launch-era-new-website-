-- Owner-only additive capabilities. No changes to client bookings, email or payment flows.
create table public.tle_owner_growth_evidence (
 id uuid primary key default gen_random_uuid(),
 workspace_id uuid not null references public.tle_crm_workspaces(id) on delete cascade,
 owner_id uuid not null references auth.users(id) on delete cascade,
 lead_id uuid references public.tle_crm_leads(id) on delete set null,
 kind text not null check (kind in ('research','demo_brief','watch_check','followup','report')),
 title text not null check(length(title)<=180),
 data jsonb not null default '{}'::jsonb check(octet_length(data::text)<=100000),
 created_at timestamptz not null default now()
);
create index on public.tle_owner_growth_evidence(workspace_id,owner_id,created_at desc);
create index on public.tle_owner_growth_evidence(lead_id) where lead_id is not null;
alter table public.tle_owner_growth_evidence enable row level security;
revoke all on public.tle_owner_growth_evidence from public,anon,authenticated;
grant all on public.tle_owner_growth_evidence to service_role;

create table public.tle_owner_growth_watches (
 id uuid primary key default gen_random_uuid(),
 workspace_id uuid not null references public.tle_crm_workspaces(id) on delete cascade,
 owner_id uuid not null references auth.users(id) on delete cascade,
 url text not null check(length(url)<=600 and url like 'https://%'),
 label text not null check(length(label)<=100),
 active boolean not null default true,
 fingerprint text,
 last_excerpt text,
 last_status text not null default 'not_checked' check(last_status in ('not_checked','baseline','changed','unchanged','error')),
 last_checked_at timestamptz,
 next_check_at timestamptz not null default now(),
 lease_until timestamptz,
 created_at timestamptz not null default now(),
 unique(workspace_id,url)
);
create index on public.tle_owner_growth_watches(next_check_at) where active;
create index on public.tle_owner_growth_watches(owner_id);
alter table public.tle_owner_growth_watches enable row level security;
revoke all on public.tle_owner_growth_watches from public,anon,authenticated;
grant all on public.tle_owner_growth_watches to service_role;

create function public.tle_owner_growth_claim_watch(p_workspace_id uuid,p_owner_id uuid,p_watch_id uuid default null)
returns setof public.tle_owner_growth_watches language sql security invoker set search_path='' as $$
 update public.tle_owner_growth_watches w set lease_until=now()+interval '90 seconds',next_check_at=now()+interval '1 day'
 where w.id=(select q.id from public.tle_owner_growth_watches q
  where q.workspace_id=p_workspace_id and q.owner_id=p_owner_id and q.active
   and (q.lease_until is null or q.lease_until<now())
   and ((p_watch_id is null and q.next_check_at<=now()) or q.id=p_watch_id)
  order by q.next_check_at for update skip locked limit 1)
 returning w.*;
$$;
revoke all on function public.tle_owner_growth_claim_watch(uuid,uuid,uuid) from public,anon,authenticated;
grant execute on function public.tle_owner_growth_claim_watch(uuid,uuid,uuid) to service_role;

create function public.tle_owner_growth_set_followup(p_workspace_id uuid,p_owner_id uuid,p_lead_id uuid,p_expected_date date,p_date date,p_note text)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare l public.tle_crm_leads; e public.tle_owner_growth_evidence;
begin
 if not exists(select 1 from public.tle_crm_workspaces w join public.platform_admins a on a.user_id=w.created_by
  where w.id=p_workspace_id and w.created_by=p_owner_id and w.is_internal) then raise exception 'Owner scope not verified';end if;
 select * into l from public.tle_crm_leads where id=p_lead_id and workspace_id=p_workspace_id for update;
 if not found or l.followup is distinct from p_expected_date then raise exception 'Prospect changed. Refresh before saving';end if;
 if l.archived_at is not null or l.replied_at is not null or l.stage='Won' or
  l.email_consent_status in ('unsubscribed','revoked','bounced','complained','opted_out') or exists(select 1 from public.tle_crm_email_events ev where ev.workspace_id=p_workspace_id and ev.lead_id=l.id and ev.event_type='email_failed') then raise exception 'Prospect requires review in CRM';end if;
 if p_date<(now() at time zone 'America/New_York')::date then raise exception 'Choose today or a future date';end if;
 update public.tle_crm_leads set followup=p_date where id=l.id and workspace_id=p_workspace_id;
 insert into public.tle_owner_growth_evidence(workspace_id,owner_id,lead_id,kind,title,data)
 values(p_workspace_id,p_owner_id,l.id,'followup','Next action scheduled',jsonb_build_object('date',p_date,'previous_date',l.followup,'note',left(p_note,500),'sends_email',false)) returning * into e;
 return to_jsonb(e);
end;$$;
revoke all on function public.tle_owner_growth_set_followup(uuid,uuid,uuid,date,date,text) from public,anon,authenticated;
grant execute on function public.tle_owner_growth_set_followup(uuid,uuid,uuid,date,date,text) to service_role;

-- The scheduler uses the existing private worker token; its value never leaves Vault into source/logs.
create schema if not exists private;
create function private.tle_owner_growth_dispatch() returns bigint language plpgsql security definer set search_path='' as $$
declare token text; request_id bigint;
begin
 if not exists(select 1 from public.tle_owner_growth_watches where active and next_check_at<=now() and (lease_until is null or lease_until<now())) then return null;end if;
 select decrypted_secret into token from vault.decrypted_secrets where name='tle_crm_worker_auth_token' limit 1;
 if token is null or length(token)<>64 then return null;end if;
 select net.http_post(url:='https://bowacxhmjvrqixtwaikv.supabase.co/functions/v1/tle-owner-growth',
  headers:=jsonb_build_object('Content-Type','application/json','x-tle-worker-token',token),
  body:='{"action":"scheduled_watch"}'::jsonb,timeout_milliseconds:=25000) into request_id;
 return request_id;
end;$$;
revoke all on function private.tle_owner_growth_dispatch() from public,anon,authenticated;
-- Install the cron only on the intended production database; staging remains manual.
-- Scheduled checks only run for pages the signed-in owner explicitly adds.
