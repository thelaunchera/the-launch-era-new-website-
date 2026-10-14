alter table public.tle_booking_flow_accounts add column if not exists tle_sales_workspace_id uuid references public.tle_crm_workspaces(id);
alter table public.tle_ai_agent_orders add column if not exists tle_sales_workspace_id uuid references public.tle_crm_workspaces(id);
create index if not exists tle_booking_sales_workspace_idx on public.tle_booking_flow_accounts(tle_sales_workspace_id) where tle_sales_workspace_id is not null;
create index if not exists tle_ai_sales_workspace_idx on public.tle_ai_agent_orders(tle_sales_workspace_id) where tle_sales_workspace_id is not null;
create or replace function private.tle_assign_order_sales_workspace()
returns trigger language plpgsql security invoker set search_path=pg_catalog,public as $fn$
declare owners uuid[];
begin
 select array_agg(w.id) into owners from public.tle_crm_workspaces w
 where w.is_internal is true and exists(select 1 from public.platform_admins a where a.user_id=w.created_by);
 -- A single verified agency workspace is required; never infer from customer email.
 if coalesce(array_length(owners,1),0)=1 then new.tle_sales_workspace_id:=owners[1];
 else new.tle_sales_workspace_id:=null; end if;
 return new;
end $fn$;
revoke all on function private.tle_assign_order_sales_workspace() from public,anon,authenticated;
grant execute on function private.tle_assign_order_sales_workspace() to service_role;
create trigger tle_booking_assign_sales_workspace before insert on public.tle_booking_flow_accounts for each row execute function private.tle_assign_order_sales_workspace();
create trigger tle_ai_assign_sales_workspace before insert on public.tle_ai_agent_orders for each row execute function private.tle_assign_order_sales_workspace();
comment on column public.tle_booking_flow_accounts.tle_sales_workspace_id is 'Agency order ownership for owner agents. crm_workspace_id remains the buyer workspace. No legacy inference.';
comment on column public.tle_ai_agent_orders.tle_sales_workspace_id is 'Agency order ownership assigned on insert from a unique verified internal workspace. No email matching.';
