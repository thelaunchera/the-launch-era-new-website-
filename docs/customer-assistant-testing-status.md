# Customer assistant: operator-run Testing status, 2026-10-19

Testing project: `afyiltvdfqnuyzcqsnoh`. Source: draft PR #297. Production is unchanged.

## Verified

- Live Groq EN/ES replies passed after a dedicated seven-day Testing key and `GROQ_MODEL=openai/gpt-oss-20b` were configured. The former Llama model returned upstream `model_not_found`. Key expires October 26, 2026; no key value is in source.
- Two synthetic businesses have separate workspaces/catalogs. Real config API returns the correct service for each.
- The complete mobile widget → real Testing AI → editable review and consent → real Testing intake request passed in Spanish at 390px, through the explicit test transport proxy. This is the actual widget and deployed handlers, not provider mocks. Production URLs are never called by this runner. Real iPhone/Safari is still pending.
- Live synthetic API submission and repeat returned the same request ID. Changed consent on a reserved reference returned 409. The database has three unique fixture references, all status `new`; two complete requests belong to business B. Business A's first diagnostic intake intentionally omitted address and is not full-form evidence.
- Found and fixed a real integration defect: PostgREST `return=minimal` inserts return empty HTTP 201. The assistant previously tried to parse JSON and stopped before intake. Handler now accepts empty successful responses; isolated regression reproduces 201.
- Both optional permissions are separate, unchecked EN/ES review controls, strict boolean flags outside the AI draft, locked during submit and included in the retry fingerprint/hash. Caller/model draft fields cannot grant consent. Confirming submission does not check either optional permission.
- Testing Auth generated and consumed no-send magic links for the two synthetic identities internally, obtained real sessions, read the correct saved conversation and denied the other workspace (403) and invalid token (401). Tokens/links were never returned or logged. Sessions were signed out. The temporary QA endpoint was replaced by a 410 handler with JWT verification. This verifies Auth/API isolation, not the complete dedicated Command Center browser login UI.
- Exact current production reminder scheduler functions were copied to Testing without cron. A rolled-back SQL scenario passed: only confirmed+opted-in appointments queue a single 24h reminder; refresh deduplicates; opt-out, completion and schedule changes cancel old reminders. Nothing was left scheduled or emailed.
- Ten isolated Chromium EN/ES review/retry cases passed at 360/390/820/1024/1440, including default unchecked permissions, independent selection and preserved retry choices. Existing route guard passed 355/355; auth recovery and client-release 21/21 passed.

## Mail connection and remaining release gates

- Resend domain is verified and sending-enabled. The separate domain-restricted sending-only key is now saved as Testing `TLE_CRM_RESEND_API_KEY` after the owner continued the explicitly described setup. No secret value is in source or a persistent artifact.
- Automatic approval review separately blocked executing the test-mail script: it required an explicit statement authorizing the external sends; “Continua” was not accepted. Read-only checks found no request rows for fixed mail references 4/5 and no matching test messages in Resend. No retry or alternate send path was attempted.
- Prepared receipt and owner-notification scenarios target only `hello@thelaunchera.com`, label subjects/body QA TEST and remove actionable links from test templates. Existing no-send `.invalid` fixtures remain supported. New send-capable references require `TLE_ASSISTANT_QA_MAIL_ENABLED=true`, which has NOT been set, so the prepared route is disabled pending explicit authorization.
- Email acceptance/delivery and reminder-worker dispatch remain NOT verified. Optional-follow-up scheduling still requires accepted receipt mail and dispatch verification. A sending-only key cannot read the provider reply monitor required by the real managed follow-up worker; do not weaken that fail-closed protection or silently broaden permissions.
- Dedicated Command Center served-source alignment, full authenticated buyer browser UI, real Safari and reviewed production release remain pending. Testing-only fixtures/QA scripts must never be deployed as customer infrastructure.

## Testing source and fences

`supabase/testing/customer-assistant-intake-prerequisites.sql` supplies the request storage subset. `supabase/testing/assistant-intake/` is derived from deployed intake v48 with a Testing project fence, only two synthetic business keys, five fixed test references (two mail-capable references disabled by default), quote-only action, no production Make webhook and a sole-real-recipient fence at hello@thelaunchera.com. It is not production parity for routing or booking-slot claims.

`supabase/testing/customer-assistant-reminder-prerequisites.sql` copies the live queue scheduler and claim functions, creates Testing-only tables and installs no cron. `customer-assistant-reminder-qa.sql` rolls back all eligibility changes.

`scripts/qa-customer-assistant-testing.py` repeats fixed synthetic references. `scripts/qa-customer-assistant-testing-browser.mjs` is an operator-run, one-time fresh fixture submission; reusing its reserved reference with a different AI transcript correctly conflicts. It is not part of generic CI and requires a fresh allowed reference for another new conversation.

No real customer booking, payment, customer email or production activation occurred. Do not declare the feature production-ready.
