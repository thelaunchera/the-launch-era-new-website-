# Customer assistant: operator-run Testing status, 2026-10-19

The owner does not need to find a real customer or manually submit a booking. Operator-run verification uses only synthetic businesses in the existing Testing project `afyiltvdfqnuyzcqsnoh`.

## Completed

- Added the missing Testing account/catalog prerequisites from `supabase/testing/customer-assistant-prerequisites.sql`. No production schema change.
- Created two `[QA ONLY]` business accounts, each with its own workspace and distinct service. Synthetic Auth identities use `example.invalid`, have no password and cannot be used to sign in. No invitation, password reset or customer email was sent. These are fixture identities, not verified human buyers.
- The real deployed Testing API returned HTTP 200 for both business configurations and the correct separate catalog (`deep-a` versus `office-b`). These were live database/API checks, not mocked responses.
- Deployed candidate `tle-customer-assistant` v2 only in Testing. Added distinct error codes for missing provider configuration and provider unavailability, without exposing secret values.
- Live EN/ES message attempts returned HTTP 503. A subsequent v2 live check confirmed `provider_not_configured`: `GROQ_API_KEY` is absent in the Testing function environment. A real AI response has NOT passed.
- Existing isolated-handler regression passed after the diagnostic-code change. The preceding ten bilingual Chromium review/retry cases remain the UI evidence.

## Exact remaining work

1. Configure the Testing AI provider credential using an approved account configuration interface; the available Supabase connector does not expose a secrets-setting operation. Do not retrieve or log production secret values as a workaround.
2. Use complete Testing intake/email prerequisites to verify actual request recording, deduplicated handoff and the buyer-authenticated saved conversation. The two fixture identities do not prove an authenticated sign-in round trip.
3. Verify provider receipt/owner notifications with an explicitly designated test recipient. Existing no-send fixtures are not email delivery evidence. Keep all real buyer accounts and production automation unchanged.
4. Finish the explicit reminder/follow-up consent controls before claiming those automations work for the new assistant. The current reviewed submission leaves both optional choices false.

No real customer booking, payment, email or production activation occurred. Source remains draft PR #297. This status does not declare the feature production-ready.
