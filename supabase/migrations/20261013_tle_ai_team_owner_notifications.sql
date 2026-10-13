-- Applied in production as tle_ai_team_owner_notifications_on_new_tasks_20261013.
-- Creates one private owner Command Center notification for each NEW, deduplicated
-- AI Team automatic task. Never sends email, publishes, charges or modifies buyer data.
create or replace function public.tle_ai_team_record_automatic(
 p_agent text,p_title text,p_description text,p_priority text,p_source text,p_origin text default 'platform_event'
) returns uuid
language plpgsql security definer set search_path=pg_catalog,public
as $$
declare v_owner uuid; v_ws uuid; v_id uuid;
begin
 if p_agent not in ('jessie','sales','projects','developer','qa','creative','care')
 or p_priority not in ('normal','high','urgent')
 or p_origin not in ('platform_event','daily_review')
 or length(p_source)<8 or length(p_source)>150
 then return null; end if;
 select w.id,w.created_by into v_ws,v_owner
 from public.tle_crm_workspaces w
 where w.is_internal is true
 and exists(select 1 from public.platform_admins a where a.user_id=w.created_by)
 order by w.created_at asc limit 1;
 if v_ws is null then return null; end if;
 insert into public.tle_ai_team_tasks
 (workspace_id,owner_id,agent_key,title,description,status,priority,approval_required,automation_key,task_origin)
 values (v_ws,v_owner,p_agent,left(p_title,160),left(p_description,3000),'planned',p_priority,true,p_source,p_origin)
 on conflict (workspace_id,automation_key) where automation_key is not null do nothing
 returning id into v_id;
 if v_id is not null then
  insert into public.tle_ai_team_events(workspace_id,task_id,actor_id,action,summary)
  values(v_ws,v_id,v_owner,'created','Automated '||p_origin||' alert; owner approval required');
  begin
   insert into public.tle_crm_notifications(workspace_id,kind,title,body,source_key)
   values(v_ws,'ai_team','AI Team: task needs review','Jessie created an internal review task. Open AI Team to see it. No client message was sent.','ai-team:'||v_id)
   on conflict (workspace_id,source_key) do nothing;
  exception when others then
    raise warning 'AI Team owner notification unavailable: %',sqlstate;
  end;
 end if;
 return v_id;
exception when others then
 raise warning 'Owner AI Team automatic task could not be recorded: %',sqlstate;
 return null;
end $$;
revoke all on function public.tle_ai_team_record_automatic(text,text,text,text,text,text)
 from public,anon,authenticated;
