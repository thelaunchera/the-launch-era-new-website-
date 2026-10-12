create table if not exists private.tle_crm_support_owner_notes (
 report_id uuid primary key references public.tle_crm_support_requests(id) on delete cascade,
 owner_note text not null check(char_length(owner_note)<=1200),
 updated_at timestamptz not null default now()
);
alter table private.tle_crm_support_owner_notes enable row level security;
revoke all on private.tle_crm_support_owner_notes from public,anon,authenticated;
insert into private.tle_crm_support_owner_notes(report_id,owner_note)
 select id,left(owner_note,1200) from public.tle_crm_support_requests where nullif(trim(owner_note),'') is not null
 on conflict(report_id) do nothing;
update public.tle_crm_support_requests set owner_note=null where owner_note is not null;
alter table public.tle_crm_support_requests add constraint tle_support_notes_private_only check(owner_note is null);
create or replace function public.tle_crm_owner_support_list(p_offset integer default 0)
returns jsonb language plpgsql security definer set search_path='' as $$
declare result jsonb;
begin
 if auth.uid() is null or not exists(select 1 from public.tle_crm_workspaces w where w.created_by=auth.uid() and w.is_internal) then raise exception 'Owner access required' using errcode='42501';end if;
 select coalesce(jsonb_agg(x.data order by x.created_at desc,x.id desc),'[]'::jsonb) into result from (
  select r.id,r.created_at,to_jsonb(r)||jsonb_build_object('owner_note',n.owner_note) as data
  from public.tle_crm_support_requests r left join private.tle_crm_support_owner_notes n on n.report_id=r.id
  order by r.created_at desc,r.id desc offset greatest(0,least(coalesce(p_offset,0),1000000)) limit 100
 )x;
 return result;
end $$;
create or replace function public.tle_crm_owner_support_update(p_report_id uuid,p_status text,p_owner_note text default null)
returns jsonb language plpgsql security definer set search_path='' as $$
declare r public.tle_crm_support_requests;note text:=nullif(trim(coalesce(p_owner_note,'')),'');
begin
 if auth.uid() is null or not exists(select 1 from public.tle_crm_workspaces w where w.created_by=auth.uid() and w.is_internal) then raise exception 'Owner access required' using errcode='42501';end if;
 if p_status is null or p_status not in ('open','in_progress','resolved') or char_length(note)>1200 then raise exception 'Invalid support update';end if;
 update public.tle_crm_support_requests set status=p_status,updated_at=now() where id=p_report_id returning * into r;
 if not found then raise exception 'Report not found';end if;
 if note is null then delete from private.tle_crm_support_owner_notes where report_id=p_report_id;
 else insert into private.tle_crm_support_owner_notes(report_id,owner_note,updated_at) values(p_report_id,note,now()) on conflict(report_id) do update set owner_note=excluded.owner_note,updated_at=excluded.updated_at;end if;
 return jsonb_build_object('id',r.id,'status',r.status,'owner_note',note);
end $$;
revoke all on function public.tle_crm_owner_support_list(integer) from public,anon;
revoke all on function public.tle_crm_owner_support_update(uuid,text,text) from public,anon;
grant execute on function public.tle_crm_owner_support_list(integer) to authenticated;
grant execute on function public.tle_crm_owner_support_update(uuid,text,text) to authenticated;
