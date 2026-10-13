-- Applied through Supabase migration tle_ai_team_output_review_audit_events_v1 on 2026-10-13.
-- Allows distinct private audit events for prepared drafts and their explicit owner review.
-- Does not permit emails, posts, deploys or changes to customer records.
alter table public.tle_ai_team_events drop constraint if exists tle_ai_team_events_action_check;
alter table public.tle_ai_team_events
 add constraint tle_ai_team_events_action_check
 check (action in ('created','assigned','status_changed','approved','completed','cancelled',
                  'output_created','output_approved','output_rejected'));
comment on table public.tle_ai_team_events
 is 'Private audit trail; output approval means review only, never delivery, sending, payment or publication.';
