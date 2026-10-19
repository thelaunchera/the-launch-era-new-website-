-- The Launch Era AI Team: server-only per-task collaboration lock.
-- No customer, booking, payment, or email records are touched.
-- A separate temporary claim prevents two owner tabs / Edge isolates from
-- generating the same specialist drafts and paying for overlapping model calls.
create table if not exists public.tle_ai_team_collaboration_claims (
  task_id uuid primary key references public.tle_ai_team_tasks(id) on delete cascade,
  workspace_id uuid not null,
  owner_id uuid not null,
  token uuid not null,
  claimed_at timestamptz not null default now(),
  expires_at timestamptz not null,
  constraint tle_ai_collab_claim_positive_ttl check (expires_at > claimed_at)
);
alter table public.tle_ai_team_collaboration_claims enable row level security;
revoke all on public.tle_ai_team_collaboration_claims from public, anon, authenticated;
grant select, insert, delete on public.tle_ai_team_collaboration_claims to service_role;
comment on table public.tle_ai_team_collaboration_claims
  is 'Short-lived, service-role-only collaboration claims. No client grants or policies. Claims are released after output persistence.';
