-- Use one bundled-order watchdog to avoid overlapping checks and repeated wakeups.
-- The existing tle-ai-team-bundle-stall-hourly is the authoritative routine.
-- General AI watcher already covers active-without-delivered_at anomalies.
do $reconcile$
begin
 if exists(select 1 from cron.job where jobname='tle-owner-bundle-integrity-hourly') then
   perform cron.unschedule('tle-owner-bundle-integrity-hourly');
 end if;
end
$reconcile$;
