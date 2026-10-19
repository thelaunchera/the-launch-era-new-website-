> Latest operator-run evidence and exact remaining gates: [Testing status](customer-assistant-testing-status.md). AI, request persistence/retries, Auth/API isolation and reminder queue eligibility have passed in Testing. After explicit owner authorization, the QA-only request receipt, owner notification and on-demand reminder reached Resend **delivered** (three messages, one mailbox). Production activation, scheduled end-to-end automation and private buyer browser/Safari checks remain pending.

# Customer web assistant: reviewed request handoff

## Result

An optional assistant on released, keyed Booking Pages helps a visitor prepare a service request using the business's published service catalog and approved EN/ES information. The visitor can edit the complete address, contact and preferred date/time, then explicitly submit. The existing `tle-booking-flow-inquiry` workflow records the request and handles its receipt/owner emails. The request remains pending human review; the assistant never reserves a slot, chooses a price or charges a payment.

The reviewed recent conversation (up to 12 messages, 500 characters each) is saved with the submission and can be opened from the buyer's existing request detail panel. Chatting alone never saves customer contacts or submits a lead. Appointment reminders and optional follow-up/care emails each require their own unchecked review choice; neither the AI draft nor mandatory submission consent opts the visitor in. Model input is sent to Groq after the visitor's deliberate message; a visible notice explains processing and the later handoff.

## Boundaries and source

- `public/assets/tle-customer-assistant.{js,css}` mounts only on top-level pages with a valid `key`. Neither the protected prospect demo nor owner previews can mount it. The default is no widget until the server explicitly enables this account.
- `supabase/functions/tle-customer-assistant/` reads business facts from the server. Browser-supplied business names, workspace IDs, prices and action claims cannot configure the agent. Configured HTTPS origins and a real non-internal booking workspace are checked.
- `tle_customer_assistant_configs` is server-only and defaults disabled. Provision only the exact approved optional module for a delivered, paid business; preserve the tenant's branding and use reviewed knowledge. No customer is enrolled by this change.
- `tle_customer_assistant_submissions` reserves the reviewed payload hash before forwarding. Retries keep the same external reference; changed details cannot overwrite a reserved reference. The existing intake's unique submission reference protects the upstream operation after ambiguous timeouts.
- The saved-chat action validates Supabase Auth, confirmed email, exact workspace ownership, buyer password verification when required, and the request's account-to-workspace mapping. It has no owner-preview bypass.
- All three new tables have RLS enabled and no client grants. The rate RPC uses `SECURITY INVOKER` and is executable only by the server role. There are daily business and per-IP ceilings. No browser secrets or real records are included.
- This does not change the separate commercial `customer-crm/` prototype, the internal AI Team, existing booking approvals, account billing or client data. The dedicated Command Center repository pins a separate source commit; its overlay/source must be updated through its normal reviewed release before this new buyer control appears on that host.

## Verification on 2026-10-19

- Exact handler plus real protocol: isolated fixtures passed approved catalog, two business contexts, EN/ES request payloads, model action/price guard, explicit consent, invalid details, unavailable channel, safe retries, saved chat and denied cross-business/expired-session access. No provider request, email or real booking was made.
- Existing route integrity: 355/355 links; auth recovery and all 21 client-release source checks passed.
- Only the existing **Testing** project `afyiltvdfqnuyzcqsnoh` received the new migration. Verified all three tables are RLS-enabled, `anon`/`authenticated` have no direct SELECT, and neither client role can execute the rate RPC. A rolled-back server-role test returned `[true,true,false,false]` for a limit of two.
- Testing security advisor: no new warning for these objects; expected informational notices state RLS is enabled without client policies, because access is server-only. Existing unrelated Testing warnings were not changed.
- Browser suite covers EN/ES at 360,390,820,1024,1440, consent, review, duplicate retry reference, receipt-failure copy and no live widget in demos/owner previews. All ten local Chromium scenarios passed, plus the three no-mount cases and disabled-business check. Screenshots were inspected at 390px, including Spanish review. Screenshots are synthetic evidence, not real customers; real mobile Safari remains pending.

## Still required before activation

Testing now has isolated pricing/request storage fixtures and candidate Edge Function v8, with Testing-only fenced intake. The authorized three-message QA run now verifies Testing mail dispatch and provider-level delivery; this is **not** proof of scheduled production automation. It still lacks full production-equivalent routing/UI fixtures, real buyer browser login, Safari and production reminder/follow-up end-to-end checks. Non-mutating preflight (204), invalid-message (400) and unauthenticated-conversation (401) checks passed with CORS on all responses. No production database, function or frontend deployment is claimed. Live AI, synthetic request and Auth/API access checks passed; next finish the full buyer-authenticated browser UI round trip and production-safe lifecycle QA for confirmation, rescheduling, cancellation and opt-in follow-ups. Check true provider acceptance separately from inbox delivery, the saved recent conversation, duplicate submission, a second buyer's denied access and mobile Safari. Confirm the dedicated Command Center's served source and align its reviewed overlay. Keep configs disabled until these checks pass.

Release the migration and function together before enabling the widget for an approved business. Public visitor actions require `verify_jwt=false`; the private conversation action verifies its own JWT. No owner/admin operations are exposed. Preserve the existing intake endpoint; no server secrets belong in the Git repository.

Rollback: disable the affected config first; revert widget/control source using the normal release path. Preserve saved request and conversation records and the existing intake/email service.
