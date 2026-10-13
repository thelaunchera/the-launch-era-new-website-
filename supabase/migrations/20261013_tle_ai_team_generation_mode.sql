-- Production migration originally applied 2026-10-13.
-- Permanently distinguish genuine OpenAI text from static fallback templates.
-- This does not give the client or buyer direct access to drafts.
alter table public.tle_ai_team_outputs
 add column if not exists generation_mode text not null default 'ai';
alter table public.tle_ai_team_outputs
 drop constraint if exists tle_ai_team_outputs_generation_mode_check;
alter table public.tle_ai_team_outputs
 add constraint tle_ai_team_outputs_generation_mode_check
 check(generation_mode in ('ai','template'));
comment on column public.tle_ai_team_outputs.generation_mode is
 'ai means OpenAI returned content; template means a fixed built-in draft without model generation.';
