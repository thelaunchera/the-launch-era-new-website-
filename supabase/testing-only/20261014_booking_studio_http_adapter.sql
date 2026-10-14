-- ONLY Supabase TESTING project afyiltvdfqnuyzcqsnoh.
-- Staging HTTP adapter table. Public schema for PostgREST routing,
-- NOT public permissions. No real customer data or email.
create table if not exists public.tle_booking_studio_staging_requests(
 id uuid primary key default gen_random_uuid(),
 tenant_id uuid not null references auth.users(id) on delete cascade,
 kind text not null check(kind in ('booking_request','quote_request')),
 service_name text not null check(length(service_name) between 1 and 120),
 service_area text not null check(service_area in ('Miami','Miami Beach')),
 frequency text not null check(frequency in ('one_time','weekly','biweekly','monthly')),
 estimated_total numeric(12,2) check(estimated_total is null or estimated_total>=0),
 consent_to_contact boolean not null check(consent_to_contact),
 confirmed boolean not null default false check(not confirmed),
 customer_notified boolean not null default false check(not customer_notified),
 synthetic_only boolean not null default true check(synthetic_only),
 created_at timestamptz not null default now()
);
create index if not exists tle_booking_studio_staging_tenant_idx on public.tle_booking_studio_staging_requests(tenant_id,created_at desc);
revoke all on public.tle_booking_studio_staging_requests from public,anon,authenticated;
alter table public.tle_booking_studio_staging_requests enable row level security;
alter table public.tle_booking_studio_staging_requests force row level security;
drop policy if exists staging_auth_tenant_only on public.tle_booking_studio_staging_requests;
create policy staging_auth_tenant_only on public.tle_booking_studio_staging_requests
 for all to authenticated using (tenant_id=auth.uid()) with check (tenant_id=auth.uid());
comment on table public.tle_booking_studio_staging_requests is 'Supabase TESTING only: synthetic requests; service-role Edge adapter, no emails, no real customer records.';
