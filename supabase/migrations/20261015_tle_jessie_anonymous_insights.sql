-- Jessie analytics store only event categories and timestamp. Never messages or visitor identifiers.
CREATE TABLE IF NOT EXISTS public.tle_jessie_metrics (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  event_type text NOT NULL CHECK (event_type IN ('opened','lead_start','lead_saved','demo_open','demo_close','demo_lead_saved','diagnostic','comparison','pricing','recommendation','client_help','language_switch','answered')),
  service text NOT NULL CHECK (service IN ('general','booking','cleaning-app','website','va','ai-booking','ai-followup','ai-business')),
  intent text NOT NULL CHECK (intent IN ('general','demo','client_help','comparison','pricing','followups','operations','bookings')),
  language text NOT NULL CHECK (language IN ('en','es')),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS tle_jessie_metrics_by_date ON public.tle_jessie_metrics(created_at DESC);
ALTER TABLE public.tle_jessie_metrics ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.tle_jessie_metrics FROM anon, authenticated;
REVOKE ALL ON SEQUENCE public.tle_jessie_metrics_id_seq FROM anon, authenticated;
COMMENT ON TABLE public.tle_jessie_metrics IS 'Anonymized categories from public Jessie; no chat text, name, email, session, IP or customer ID.';
