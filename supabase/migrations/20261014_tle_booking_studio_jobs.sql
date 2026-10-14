-- Owner-only Booking Studio project records. NOT a customer-facing agent table.
-- Requires verified platform admin + internal workspace in Edge Function.
create table if not exists public.tle_booking_studio_jobs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  owner_workspace_id uuid not null references public.tle_crm_workspaces(id) on delete cascade,
  booking_account_id uuid not null references public.tle_booking_flow_accounts(id) on delete cascade,
  stage text not null default 'research' check(stage in ('research','creative','development','qa','owner_review','approved','released','blocked')),
  research jsonb not null default '{}'::jsonb,
  design jsonb not null default '{}'::jsonb,
  build jsonb not null default '{}'::jsonb,
  qa jsonb not null default '{}'::jsonb,
  owner_review jsonb not null default '{}'::jsonb,
  audit jsonb not null default '[]'::jsonb,
  base_version text not null default 'v1-2026-10-14',
  revision integer not null default 1 check(revision>=1),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_workspace_id,booking_account_id)
);
create index if not exists tle_booking_studio_jobs_owner_idx
 on public.tle_booking_studio_jobs(owner_workspace_id,owner_id,updated_at desc);
alter table public.tle_booking_studio_jobs enable row level security;
revoke all on public.tle_booking_studio_jobs from anon,authenticated;
-- Access is exclusively through a server-side platform-admin-verified Edge Function
-- using the service role, with explicit workspace/account scoping on every request.
comment on table public.tle_booking_studio_jobs is
 'Owner internal Booking Studio project state; no buyer agents, public reads, direct user writes, publishing or client notifications.';
