-- Only the server's service role may read or write these challenge/session hashes.
-- A public rid is a database lookup key, never an access credential.
create table if not exists public.tle_booking_demo_access (
  demo_id uuid primary key references public.personalized_demo_requests(id) on delete cascade,
  challenge_hash text,
  challenge_expires_at timestamptz,
  challenge_attempts integer not null default 0 check(challenge_attempts between 0 and 10),
  challenge_sent_at timestamptz,
  send_window_start timestamptz,
  send_count integer not null default 0 check(send_count between 0 and 30),
  session_hash text,
  session_expires_at timestamptz,
  updated_at timestamptz not null default now()
);
alter table public.tle_booking_demo_access enable row level security;
revoke all on public.tle_booking_demo_access from anon, authenticated;
create index if not exists tle_booking_demo_access_session_expiry_idx
  on public.tle_booking_demo_access(session_expires_at);
comment on table public.tle_booking_demo_access is
  'Email-verified Booking Automation preview tokens. Service-role access only; no plaintext email codes/tokens.';
