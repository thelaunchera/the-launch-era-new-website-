# Customer assistant: operator-run Testing status, 2026-10-19

Testing project: `afyiltvdfqnuyzcqsnoh`. Source: draft PR #297. Production is unchanged.

## Authorized real-mail QA proof — October 19, 2026 (19:23–19:24 UTC)

- **Resend provider verification:** exactly three QA-tagged transactional messages to the sole authorized real mailbox `hello@thelaunchera.com` have status **delivered**: customer request receipt (19:23:03 UTC), owner quote alert (19:23:11 UTC), and next-day appointment reminder (19:24:19 UTC). Delivered is provider-level delivery, not human read/open.
- **Testing database verification:** fixed references 4 and 5 each appear once in the request table, and the corresponding assistant submissions are unique. The dedicated reminder outbox contains one `reminder_24h` item with status `sent` and no second reminder row. Repeating the script returned the original request identifier and did not produce another email.
- The actual Testing reminder was dispatched on-demand during the QA run; this is **not** proof that a production cron/worker is installed or that real bookings trigger the full automation. Read-only schema check confirmed that `cron.job` is absent in Testing.
- The latest operator session reports QA auto-sending and CRM validations disabled after verification. This read-only connector audit cannot inspect Edge Function environment-variable values, so it **cannot independently prove** `TLE_ASSISTANT_QA_MAIL_ENABLED` is currently off. The source has a feature gate and is fenced to two synthetic businesses, five fixed references, quote-only requests, and the authorized test mailbox. **No additional sends were initiated in this audit.**
- Production read-only cross-check: the new assistant Edge Function and its config/submission tables are absent from the production Supabase project, and GitHub PR #297 remains a **draft, not merged**. No customer-facing activation was performed.

**Remaining release gates:** full private buyer Command Center browser login/conversation retrieval and isolation, real Safari/iPhone UX, dedicated served-source alignment, and an owner-reviewed production rollout. Real appointment/cancellation/reschedule dispatch and optional care follow-ups are **not end-to-end verified** in production. Do not enable production customer configs or automatic sends as a side effect of this QA.

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
- Earlier automated approval review blocked sending before explicit authorization; the owner subsequently authorized sending test messages **only** to `hello@thelaunchera.com`. The authorized fixed-reference test was then run and all three QA messages were confirmed delivered by Resend (see latest proof above).
- The authorized receipt and owner-notification scenarios targeted only `hello@thelaunchera.com` with QA subject/body markers. Existing `.invalid` no-send fixtures remain supported. The route for fixed mail references requires `TLE_ASSISTANT_QA_MAIL_ENABLED=true`; after the authorized run the operator reports this was switched back off. Verify its live value in the operator environment before any further test.
- **Testing receipt, owner notification, and on-demand reminder delivery are now verified at the Resend provider level**. Production-triggered reminders, booking status transitions, cancellation/reschedule propagation, and opt-in follow-up scheduling/delivery are not verified end to end. A sending-only key cannot read the provider reply monitor required by the real managed follow-up worker; do not weaken that fail-closed protection or silently broaden permissions.
- Dedicated Command Center served-source alignment, full authenticated buyer browser UI, real Safari and reviewed production release remain pending. Testing-only fixtures/QA scripts must never be deployed as customer infrastructure.

## Testing source and fences

`supabase/testing/customer-assistant-intake-prerequisites.sql` supplies the request storage subset. `supabase/testing/assistant-intake/` is derived from deployed intake v48 with a Testing project fence, only two synthetic business keys, five fixed test references (two mail-capable references disabled by default), quote-only action, no production Make webhook and a sole-real-recipient fence at hello@thelaunchera.com. It is not production parity for routing or booking-slot claims.

`supabase/testing/customer-assistant-reminder-prerequisites.sql` copies the live queue scheduler and claim functions, creates Testing-only tables and installs no cron. `customer-assistant-reminder-qa.sql` rolls back all eligibility changes.

`scripts/qa-customer-assistant-testing.py` repeats fixed synthetic references. `scripts/qa-customer-assistant-testing-browser.mjs` is an operator-run, one-time fresh fixture submission; reusing its reserved reference with a different AI transcript correctly conflicts. It is not part of generic CI and requires a fresh allowed reference for another new conversation.

No real customer booking, payment, customer email or production activation occurred. Do not declare the feature production-ready.
