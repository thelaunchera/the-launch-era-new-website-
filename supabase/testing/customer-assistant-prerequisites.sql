-- TESTING ONLY: apply solely to project afyiltvdfqnuyzcqsnoh.
-- This intentionally does not live in supabase/migrations and must never ship to production.
alter table public.tle_booking_flow_accounts
 add column if not exists business_name text,
 add column if not exists business_category text,
 add column if not exists booking_public_key uuid,
 add column if not exists booking_page_url text,
 add column if not exists timezone text;
alter table public.tle_crm_workspaces
 add column if not exists password_login_required boolean not null default false,
 add column if not exists password_setup_completed_at timestamptz;
create table if not exists public.tle_booking_flow_pricing(
 account_id uuid primary key references public.tle_booking_flow_accounts(id),
 services jsonb not null default '[]',addons jsonb not null default '[]',
 currency text not null default 'USD',quote_policy text not null default 'always_review',
 auto_confirm_flat boolean not null default false
);
alter table public.tle_booking_flow_pricing enable row level security;
revoke all on public.tle_booking_flow_pricing from public,anon,authenticated;
grant select,insert,update,delete on public.tle_booking_flow_pricing to service_role;
