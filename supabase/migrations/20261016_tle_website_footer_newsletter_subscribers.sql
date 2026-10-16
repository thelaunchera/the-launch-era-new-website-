-- Private, service-only newsletter opt-ins; website consent is recorded at insert/upsert.
create table if not exists public.tle_newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique check (length(email) between 6 and 254),
  language text not null default 'en' check (language in ('en','es')),
  consent_source text not null default 'site_footer' check (consent_source = 'site_footer'),
  status text not null default 'subscribed' check (status in ('subscribed','unsubscribed')),
  consent_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.tle_newsletter_subscribers enable row level security;
revoke all on public.tle_newsletter_subscribers from anon, authenticated;
comment on table public.tle_newsletter_subscribers is 'The Launch Era website footer newsletter opt-ins. No direct browser API access. Edge-only; send marketing messages with unsubscribe links and enforce status.';
