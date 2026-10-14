-- Smart Welcome for paid buyer Booking Pages. Additive and default-off.
-- PRE-RELEASE ONLY: apply via reviewed Supabase migration to the intended environment.
-- Existing clients, booking leads, prices, discounts, jobs and messages are untouched.
create table if not exists public.tle_booking_smart_welcome (
  account_id uuid primary key references public.tle_booking_flow_accounts(id),
  enabled boolean not null default false,
  headline_en text not null default '',
  headline_es text not null default '',
  description_en text not null default '',
  description_es text not null default '',
  offer_en text not null default '',
  offer_es text not null default '',
  terms_en text not null default '',
  terms_es text not null default '',
  cta_en text not null default '',
  cta_es text not null default '',
  image_url text not null default '',
  starts_at timestamptz,
  ends_at timestamptz,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id),
  constraint tle_sw_valid_window check (starts_at is null or ends_at is null or starts_at < ends_at),
  constraint tle_sw_headline_en_length check (char_length(headline_en) <= 125),
  constraint tle_sw_headline_es_length check (char_length(headline_es) <= 125),
  constraint tle_sw_description_en_length check (char_length(description_en) <= 360),
  constraint tle_sw_description_es_length check (char_length(description_es) <= 360),
  constraint tle_sw_offer_en_length check (char_length(offer_en) <= 140),
  constraint tle_sw_offer_es_length check (char_length(offer_es) <= 140),
  constraint tle_sw_terms_en_length check (char_length(terms_en) <= 240),
  constraint tle_sw_terms_es_length check (char_length(terms_es) <= 240),
  constraint tle_sw_cta_en_length check (char_length(cta_en) <= 70),
  constraint tle_sw_cta_es_length check (char_length(cta_es) <= 70)
);
comment on table public.tle_booking_smart_welcome is
 'Booking Page Smart Welcome editorial/offer copy. Default off, tenant isolated. Service role only; public reads and authenticated writes through tle-booking-smart-welcome with release/ownership checks. Does not calculate or redeem discounts.';
alter table public.tle_booking_smart_welcome enable row level security;
revoke all on public.tle_booking_smart_welcome from PUBLIC, anon, authenticated;
grant select,insert,update,delete on public.tle_booking_smart_welcome to service_role;
-- Intentionally NO anon/authenticated RLS policies: all access via authorization-checked Edge Function.
