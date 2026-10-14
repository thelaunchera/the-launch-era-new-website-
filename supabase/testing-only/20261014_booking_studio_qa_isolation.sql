-- TESTING PROJECT ONLY: afyiltvdfqnuyzcqsnoh.
-- Do NOT apply to production. No real customer data, emails or bookings.
begin;
create schema if not exists booking_studio_qa;
revoke all on schema booking_studio_qa from public, anon, authenticated;
do $$ begin
 if not exists (select 1 from pg_roles where rolname='booking_studio_qa_runner') then
  create role booking_studio_qa_runner nologin nobypassrls;
 end if;
end $$;
grant usage on schema booking_studio_qa to booking_studio_qa_runner;
create table if not exists booking_studio_qa.synthetic_requests(
 id uuid primary key default gen_random_uuid(),
 tenant_id uuid not null,
 kind text not null check (kind in ('booking_request','quote_request')),
 service_name text not null check (length(service_name) between 1 and 120),
 service_area text not null check (length(service_area) between 1 and 90),
 frequency text not null check (frequency in ('one_time','weekly','biweekly','monthly')),
 estimated_total numeric(12,2) check (estimated_total is null or estimated_total >= 0),
 consent_to_contact boolean not null check (consent_to_contact),
 confirmed boolean not null default false check (not confirmed),
 customer_notified boolean not null default false check (not customer_notified),
 synthetic_only boolean not null default true check (synthetic_only),
 created_at timestamptz not null default now()
);
create index if not exists synthetic_requests_tenant_idx on booking_studio_qa.synthetic_requests(tenant_id,created_at desc);
revoke all on booking_studio_qa.synthetic_requests from public, anon, authenticated;
grant select,insert on booking_studio_qa.synthetic_requests to booking_studio_qa_runner;
alter table booking_studio_qa.synthetic_requests enable row level security;
alter table booking_studio_qa.synthetic_requests force row level security;
drop policy if exists synthetic_requests_tenant on booking_studio_qa.synthetic_requests;
create policy synthetic_requests_tenant on booking_studio_qa.synthetic_requests
 for all to booking_studio_qa_runner
 using (tenant_id = nullif(current_setting('booking_studio_qa.tenant_id',true),'')::uuid)
 with check (tenant_id = nullif(current_setting('booking_studio_qa.tenant_id',true),'')::uuid);
comment on table booking_studio_qa.synthetic_requests is
 'SYNTHETIC QA ONLY. Separate Supabase Testing project. No production clients, notification or publication.';
commit;
