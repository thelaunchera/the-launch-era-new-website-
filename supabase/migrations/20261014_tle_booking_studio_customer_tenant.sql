-- Separate the internal TLE owner workspace from each customer's CRM workspace.
-- Booking Studio is owned by the platform owner but produces only tenant-bound client work.
alter table public.tle_booking_studio_jobs
  add column if not exists client_workspace_id uuid references public.tle_crm_workspaces(id) on delete restrict;

-- Existing projects: backfill only from the booking account's authoritative tenant.
update public.tle_booking_studio_jobs as j
set client_workspace_id=a.crm_workspace_id
from public.tle_booking_flow_accounts as a
where a.id=j.booking_account_id and j.client_workspace_id is null and a.crm_workspace_id is not null;

-- Do not allow any job to proceed without a verified customer workspace.
alter table public.tle_booking_studio_jobs alter column client_workspace_id set not null;
create index if not exists tle_booking_studio_jobs_client_idx
  on public.tle_booking_studio_jobs(client_workspace_id,booking_account_id);
comment on column public.tle_booking_studio_jobs.owner_workspace_id is 'TLE internal owner workspace, not the customer tenant.';
comment on column public.tle_booking_studio_jobs.client_workspace_id is 'Verified buyer workspace from tle_booking_flow_accounts.crm_workspace_id; all client artifacts must be isolated to this tenant.';
