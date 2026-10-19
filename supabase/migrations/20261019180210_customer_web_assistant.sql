-- Optional customer module. No customer is enrolled or enabled by this migration.
create table public.tle_customer_assistant_configs (
  account_id uuid primary key references public.tle_booking_flow_accounts(id) on delete cascade,
  enabled boolean not null default false,
  knowledge_en text not null default '' check (length(knowledge_en)<=5000),
  knowledge_es text not null default '' check (length(knowledge_es)<=5000),
  allowed_origins text[] not null default '{}',
  approved_by uuid references auth.users(id),
  approved_at timestamptz,
  updated_at timestamptz not null default now(),
  check (not enabled or (approved_by is not null and approved_at is not null))
);
alter table public.tle_customer_assistant_configs enable row level security;
revoke all on public.tle_customer_assistant_configs from public,anon,authenticated;
grant select,insert,update,delete on public.tle_customer_assistant_configs to service_role;
comment on table public.tle_customer_assistant_configs is 'Server-provisioned optional assistant; explicit account mapping and owner approval required. No browser writes.';

-- Saved only after the visitor deliberately reviews and confirms submission.
-- request_id is validated against the existing intake response by the Edge Function.
create table public.tle_customer_assistant_submissions (
  account_id uuid not null references public.tle_booking_flow_accounts(id) on delete cascade,
  external_ref text not null check (external_ref ~ '^req_[0-9a-f-]{36}$'),
  payload_hash text not null check (payload_hash ~ '^[0-9a-f]{64}$'),
  messages jsonb not null default '[]' check (jsonb_typeof(messages)='array' and jsonb_array_length(messages)<=12),
  request_id uuid unique,
  result jsonb,
  created_at timestamptz not null default now(),
  primary key (account_id,external_ref)
);
alter table public.tle_customer_assistant_submissions enable row level security;
revoke all on public.tle_customer_assistant_submissions from public,anon,authenticated;
grant select,insert,update,delete on public.tle_customer_assistant_submissions to service_role;

create table public.tle_customer_assistant_usage (
  key_hash text not null check (key_hash ~ '^[0-9a-f]{64}$'),
  usage_day date not null,
  used integer not null check (used>0),
  primary key (key_hash,usage_day)
);
alter table public.tle_customer_assistant_usage enable row level security;
revoke all on public.tle_customer_assistant_usage from public,anon,authenticated;
grant select,insert,update,delete on public.tle_customer_assistant_usage to service_role;
create function public.tle_customer_assistant_consume(p_key text,p_day date,p_limit integer)
returns boolean language plpgsql security invoker set search_path=pg_catalog,public as $$
declare consumed integer;
begin
  if p_limit<1 or p_limit>500 or p_key !~ '^[0-9a-f]{64}$' or p_day<>current_date then
    return false;
  end if;
  insert into public.tle_customer_assistant_usage(key_hash,usage_day,used) values(p_key,p_day,1)
  on conflict(key_hash,usage_day) do update set used=tle_customer_assistant_usage.used+1
  where tle_customer_assistant_usage.used<p_limit
  returning used into consumed;
  return consumed is not null;
end;
$$;
revoke all on function public.tle_customer_assistant_consume(text,date,integer) from public,anon,authenticated;
grant execute on function public.tle_customer_assistant_consume(text,date,integer) to service_role;
