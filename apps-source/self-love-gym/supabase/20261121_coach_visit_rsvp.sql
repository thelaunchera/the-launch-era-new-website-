
-- One private, expiring RSVP token for each coach's individual training visit.
create table if not exists public.coach_visit_rsvps (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references auth.users(id) on delete cascade,
  session_id text not null,
  client_id text not null,
  visit_date date not null,
  visit_time time without time zone not null,
  token_hash text not null unique,
  status text not null default 'Pending'
    check (status in ('Pending', 'Confirmed', 'CannotAttend')),
  attendance_status text not null default 'Scheduled'
    check (attendance_status in ('Scheduled', 'Attended', 'NoShow')),
  issued_at timestamptz not null default now(),
  responded_at timestamptz,
  sent_at timestamptz,
  unique (coach_id, session_id)
);
create index if not exists coach_visit_rsvps_date_idx on public.coach_visit_rsvps(visit_date) where status = 'Pending';
alter table public.coach_visit_rsvps enable row level security;
revoke all on public.coach_visit_rsvps from anon, authenticated;
grant select on public.coach_visit_rsvps to authenticated;
create policy "Coach reads only their own RSVP statuses"
on public.coach_visit_rsvps for select to authenticated
using ((select auth.uid()) = coach_id);

-- Only authenticated coaches can issue a new random, session-specific link.
create or replace function public.issue_coach_visit_link(p_session_id text)
returns text language plpgsql security definer set search_path = ''
as $fn$
declare
  v_owner uuid := auth.uid();
  v_workspace jsonb;
  v_session jsonb;
  v_client jsonb;
  v_token text;
begin
  if v_owner is null then raise exception 'Please sign in.' using errcode='42501'; end if;
  if p_session_id is null or length(p_session_id) > 100 or length(p_session_id) < 1 then
    raise exception 'Invalid session ID.';
  end if;
  select workspace into v_workspace
  from public.coach_workspaces where user_id = v_owner;
  select item into v_session from jsonb_array_elements(coalesce(v_workspace->'sessions', '[]'::jsonb)) item
  where item->>'id' = p_session_id limit 1;
  if v_session is null then raise exception 'Session not found.'; end if;
  if coalesce(v_session->>'date','') !~ '^\d{4}-\d{2}-\d{2}$'
     or coalesce(v_session->>'startTime','') !~ '^([01]\d|2[0-3]):[0-5]\d$' then
    raise exception 'Set a valid date and start time before making a confirmation link.';
  end if;
  if (v_session->>'date')::date < (now() at time zone 'America/New_York')::date then
    raise exception 'Past visits cannot receive invitations.';
  end if;
  select item into v_client from jsonb_array_elements(coalesce(v_workspace->'clients','[]'::jsonb)) item
  where item->>'id' = v_session->>'clientId' limit 1;
  if v_client is null then raise exception 'Client not found.'; end if;
  v_token := encode(extensions.gen_random_bytes(32), 'hex');
  insert into public.coach_visit_rsvps
    (coach_id, session_id, client_id, visit_date, visit_time, token_hash)
  values
    (v_owner, p_session_id, v_session->>'clientId',
    (v_session->>'date')::date, (v_session->>'startTime')::time,
    encode(extensions.digest(v_token, 'sha256'), 'hex'))
  on conflict (coach_id, session_id) do update set
    client_id = excluded.client_id,
    visit_date = excluded.visit_date,
    visit_time = excluded.visit_time,
    token_hash = excluded.token_hash,
    status = 'Pending',
    attendance_status = 'Scheduled',
    issued_at = now(),
    responded_at = null,
    sent_at = null;
  return 'https://thelaunchera.com/apps/self-love-gym/?visit=' || v_token;
end;
$fn$;

-- Public callers can view only a minimal, token-scoped invitation, not the coach workspace.
create or replace function public.get_coach_visit(p_token text)
returns jsonb language plpgsql security definer set search_path = ''
as $fn$
declare
  v_row public.coach_visit_rsvps%rowtype;
  v_workspace jsonb;
  v_session jsonb;
  v_client jsonb;
begin
  if p_token is null or p_token !~ '^[0-9a-f]{64}$' then return null; end if;
  select * into v_row from public.coach_visit_rsvps
  where token_hash = encode(extensions.digest(p_token, 'sha256'), 'hex');
  if not found then return null; end if;
  select workspace into v_workspace from public.coach_workspaces where user_id = v_row.coach_id;
  select item into v_session from jsonb_array_elements(coalesce(v_workspace->'sessions','[]'::jsonb)) item
  where item->>'id' = v_row.session_id limit 1;
  if v_session is null
    or v_session->>'clientId' is distinct from v_row.client_id
    or v_session->>'date' is distinct from to_char(v_row.visit_date, 'YYYY-MM-DD')
    or v_session->>'startTime' is distinct from to_char(v_row.visit_time, 'HH24:MI')
    or v_row.visit_date < (now() at time zone 'America/New_York')::date
  then return null; end if;
  select item into v_client from jsonb_array_elements(coalesce(v_workspace->'clients','[]'::jsonb)) item
  where item->>'id' = v_row.client_id limit 1;
  if v_client is null then return null; end if;
  return jsonb_build_object(
    'firstName', split_part(coalesce(v_client->>'name','Client'), ' ', 1),
    'type', coalesce(v_session->>'type','Training'),
    'date', to_char(v_row.visit_date,'YYYY-MM-DD'),
    'startTime', to_char(v_row.visit_time,'HH24:MI'),
    'minutes', coalesce((v_session->>'minutes')::integer,45),
    'status', v_row.status
  );
end;
$fn$;

-- A bearer link confirms intent, never physical attendance.
create or replace function public.respond_coach_visit(p_token text, p_response text)
returns text language plpgsql security definer set search_path = ''
as $fn$
declare
  v_row public.coach_visit_rsvps%rowtype;
  v_visit jsonb;
begin
  if p_response not in ('Confirmed','CannotAttend') then
    raise exception 'Unsupported response.';
  end if;
  if p_token is null or p_token !~ '^[0-9a-f]{64}$' then
    raise exception 'Invalid invitation.';
  end if;
  select * into v_row from public.coach_visit_rsvps
  where token_hash = encode(extensions.digest(p_token, 'sha256'), 'hex')
  for update;
  if not found then raise exception 'Invitation not found.'; end if;
  -- Re-check the appointment after acquiring the row lock, so rescheduled URLs stop working.
  v_visit := public.get_coach_visit(p_token);
  if v_visit is null then raise exception 'Invitation expired or appointment changed.'; end if;
  update public.coach_visit_rsvps
     set status = p_response, responded_at = now()
   where id = v_row.id;
  return p_response;
end;
$fn$;

-- Only the logged-in coach can mark actual attendance.
create or replace function public.mark_coach_visit_attendance(p_session_id text, p_status text)
returns void language plpgsql security definer set search_path = ''
as $fn$
begin
  if auth.uid() is null then raise exception 'Sign in required.' using errcode='42501'; end if;
  if p_status not in ('Scheduled','Attended','NoShow') then raise exception 'Invalid attendance status.'; end if;
  update public.coach_visit_rsvps set attendance_status = p_status
  where coach_id = auth.uid() and session_id = p_session_id;
  if not found then raise exception 'Create the session invitation first.'; end if;
end;
$fn$;

-- Owner-safe status read never returns bearer tokens or other coaches' data.
create or replace function public.list_coach_visit_statuses()
returns jsonb language sql security definer set search_path = ''
as $fn$
select coalesce(jsonb_agg(jsonb_build_object(
  'sessionId', session_id, 'clientId', client_id,
  'date', to_char(visit_date,'YYYY-MM-DD'),
  'startTime', to_char(visit_time,'HH24:MI'),
  'status', status, 'attendanceStatus', attendance_status,
  'sentAt', sent_at, 'respondedAt', responded_at
)), '[]'::jsonb)
from public.coach_visit_rsvps
where coach_id = auth.uid();
$fn$;

revoke all on function public.issue_coach_visit_link(text) from public, anon;
grant execute on function public.issue_coach_visit_link(text) to authenticated;
revoke all on function public.get_coach_visit(text) from public;
grant execute on function public.get_coach_visit(text) to anon, authenticated;
revoke all on function public.respond_coach_visit(text,text) from public;
grant execute on function public.respond_coach_visit(text,text) to anon, authenticated;
revoke all on function public.mark_coach_visit_attendance(text,text) from public, anon;
grant execute on function public.mark_coach_visit_attendance(text,text) to authenticated;
revoke all on function public.list_coach_visit_statuses() from public, anon;
grant execute on function public.list_coach_visit_statuses() to authenticated;
