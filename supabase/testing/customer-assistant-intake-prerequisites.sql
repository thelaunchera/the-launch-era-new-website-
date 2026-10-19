-- Testing only. Request-storage parity for assistant quote requests; no production routing or cron installation.
create table if not exists public.tle_booking_flow_leads (
 id uuid primary key default gen_random_uuid(), account_id uuid not null references public.tle_booking_flow_accounts(id),
 external_ref text, source text not null default 'booking_page', request_type text not null default 'booking',
 customer_name text not null,customer_email text not null,customer_phone text,preferred_language text default 'en',
 service_name text,service_address text,requested_start_at timestamptz,status text not null default 'new',
 follow_up_at timestamptz,follow_up_sent_at timestamptz,follow_up_count integer not null default 0,last_contacted_at timestamptz,
 notes text,raw_payload jsonb not null default '{}',manage_token_hash text,manage_token_expires_at timestamptz,
 created_at timestamptz not null default now(),updated_at timestamptz not null default now(),workflow_stage text not null default 'new',
 unique(account_id,external_ref)
);
create table if not exists public.tle_booking_page_branding (
 account_id uuid primary key references public.tle_booking_flow_accounts(id),business_name text not null default '',
 logo_image text not null default '',primary_color text not null default '#191919',accent_color text not null default '#087DFF',design_reviewed_at timestamptz
);
alter table public.tle_booking_flow_leads enable row level security;
alter table public.tle_booking_page_branding enable row level security;
revoke all on public.tle_booking_flow_leads,public.tle_booking_page_branding from anon,authenticated;
grant all on public.tle_booking_flow_leads,public.tle_booking_page_branding to service_role;
alter table public.tle_booking_flow_accounts add column if not exists notification_email text;
alter table public.tle_booking_flow_accounts add column if not exists follow_up_enabled boolean not null default false;
alter table public.tle_booking_flow_accounts add column if not exists follow_up_delay_hours integer default 24;
alter table public.tle_booking_flow_accounts add column if not exists language text default 'en';
alter table public.tle_booking_flow_pricing add column if not exists addons jsonb default '[]';
alter table public.tle_booking_flow_pricing add column if not exists currency text default 'USD';
alter table public.tle_booking_flow_pricing add column if not exists quote_policy text default 'always_review';
alter table public.tle_booking_flow_pricing add column if not exists auto_confirm_flat boolean default false;
alter table public.tle_booking_flow_accounts add column if not exists owner_email text;
