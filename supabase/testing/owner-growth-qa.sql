-- TESTING project only. All synthetic records are rolled back; no HTTP/email calls.
begin;
-- The Testing project intentionally has a reduced CRM schema. This fixture-only
-- table is transactional and is removed by ROLLBACK, never by a production migration.
create table if not exists public.tle_crm_email_events (id uuid default gen_random_uuid(),workspace_id uuid,lead_id uuid,event_type text,created_at timestamptz default now());
do $$
declare actor uuid; ws uuid; prospect uuid; watch uuid; n integer; result jsonb; rejected boolean;
 nextday date := (now() at time zone 'America/New_York')::date+1;
begin
 if has_table_privilege('authenticated','public.tle_owner_growth_evidence','SELECT')
  or has_table_privilege('anon','public.tle_owner_growth_watches','SELECT')
  or has_function_privilege('authenticated','public.tle_owner_growth_claim_watch(uuid,uuid,uuid)','EXECUTE')
  or has_function_privilege('anon','public.tle_owner_growth_set_followup(uuid,uuid,uuid,date,date,text)','EXECUTE') then
  raise exception 'Public/authenticated access is not blocked';end if;
 if (select count(*) from pg_class where oid in ('public.tle_owner_growth_evidence'::regclass,'public.tle_owner_growth_watches'::regclass) and relrowsecurity)<>2 then raise exception 'RLS not enabled';end if;
 select id into actor from auth.users order by created_at limit 1;
 if actor is null then raise exception 'A testing auth fixture is required';end if;
 insert into public.platform_admins(user_id) values(actor) on conflict do nothing;
 insert into public.tle_crm_workspaces(name,created_by,is_internal) values('__GROWTH_ROLLBACK_QA__',actor,true) returning id into ws;
 insert into public.tle_crm_leads(workspace_id,stage,email_consent_status,email_followup_enabled) values(ws,'New','unknown',false) returning id into prospect;
 result:=public.tle_owner_growth_set_followup(ws,actor,prospect,null,nextday,'Synthetic next step');
 if result->>'kind'<>'followup' or not exists(select 1 from public.tle_crm_leads where id=prospect and followup=nextday) then raise exception 'Date and audit did not commit together';end if;
 rejected:=false;
 begin perform public.tle_owner_growth_set_followup(ws,actor,prospect,null,nextday+1,'Stale request');exception when others then rejected:=true;end;
 if not rejected then raise exception 'Stale expected date accepted';end if;
 rejected:=false;
 begin perform public.tle_owner_growth_set_followup(gen_random_uuid(),actor,prospect,nextday,nextday+1,'Wrong workspace');exception when others then rejected:=true;end;
 if not rejected then raise exception 'Cross-workspace update accepted';end if;
 update public.tle_crm_leads set replied_at=now() where id=prospect;
 rejected:=false;
 begin perform public.tle_owner_growth_set_followup(ws,actor,prospect,nextday,nextday+1,'Reply block');exception when others then rejected:=true;end;
 if not rejected then raise exception 'Replied prospect accepted';end if;
 insert into public.tle_owner_growth_watches(workspace_id,owner_id,url,label) values(ws,actor,'https://example.com/','Synthetic rollback watch') returning id into watch;
 select count(*) into n from public.tle_owner_growth_claim_watch(ws,actor,watch);
 if n<>1 then raise exception 'First watch claim failed';end if;
 select count(*) into n from public.tle_owner_growth_claim_watch(ws,actor,watch);
 if n<>0 then raise exception 'Concurrent watch claim accepted';end if;
 select count(*) into n from public.tle_owner_growth_claim_watch(gen_random_uuid(),actor,watch);
 if n<>0 then raise exception 'Cross-workspace watch claimed';end if;
end;$$;
rollback;
select 'PASS: RLS/grants, atomic date + evidence, stale update rejection, workspace isolation, reply stop, watch lease; all fixtures rolled back.' as result;
