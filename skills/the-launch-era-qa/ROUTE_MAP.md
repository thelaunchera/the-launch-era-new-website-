# ROUTE_MAP.md — The Launch Era route & button registry
Verified against production page loads and repository sources on **2026-10-12**. This is a living contract; check code after every release. A page rendering does NOT prove a sensitive form action works.

## Sources of truth
- Main website: \`thelaunchera/the-launch-era-new-website-\`, \`src/routes/*\` + \`public/*\`, served from \`https://thelaunchera.com\`.
- Private Command Center: website \`public/command-center/*\` and \`thelaunchera/the-launch-era-crm\`; don't switch it back to previous infrastructure.
- Cleaning App: \`thelaunchera/launch-Era-App-\`, \`https://app.thelaunchera.com\`.
- Legacy site \`thelaunchera/The-launch-era-Website-\` is NOT the source for new deployments.
- Interest confirmation UI: AppDeploy \`the-launch-era-interest-confirmation-odqbiw\`, \`public/interest.html\`.
- Backend: Supabase Edge Functions in production project \`bowacxhmjvrqixtwaikv\`; test project is separate.

## Public routes (verified that they load)
| Route (on thelaunchera.com) | Source location in active repository | Purpose / expected result |
|---|---|---|
| \`/\` | \`src/routes/index.tsx\` | EN marketing home, TLE branding |
| \`/es/\` | \`src/routes/es.index.tsx\` | Spanish home |
| \`/solutions/\` | \`src/routes/solutions.tsx\` | Product navigation |
| \`/how-it-works/\` | \`src/routes/how-it-works.tsx\` | Explains process |
| \`/help/\` | \`src/routes/help.tsx\` | Contact/help |
| \`/booking-lead-automation/\` | \`src/routes/booking-lead-automation.tsx\` | Booking Automation offer |
| \`/cleaning-web-app/\` | \`src/routes/cleaning-web-app.tsx\` | Cleaning App offer |
| \`/booking-demo/\` | \`public/booking-demo/index.html\` | Personalized demo request |
| \`/booking-bundle/\` | \`public/booking-bundle/index.html\` | Booking + optional AI plan |
| \`/ai-booking-assistant/\` | \`public/ai-booking-assistant/index.html\` | AI Assistant offer |
| \`/es/ai-booking-assistant/\` | \`public/es/ai-booking-assistant/index.html\` | Spanish AI offer |
| \`/whatsapp-ai-agent/\` | \`public/whatsapp-ai-agent/index.html\` | Coming soon, do not imply active WhatsApp integration |
| \`/es/whatsapp-ai-agent/\` | \`public/es/whatsapp-ai-agent/index.html\` | Coming soon ES |
| \`/service-checkout/\` | \`public/service-checkout/index.html\` | Checkout transition; payment integration requires separate test |
| \`/booking-flow-intake/\` | \`public/booking-flow-intake/index.html\` | English booking setup form |
| \`/es/booking-flow-intake/\` | \`public/es/booking-flow-intake/index.html\` | Spanish setup |
| \`/booking-flow-payment-success/\` | \`public/booking-flow-payment-success/index.html\` | Payment status verification, never trust static URL alone |
| \`/lead-private-preview.html\` | \`public/lead-private-preview.html\` | **Shared personalized prospect demo** for the first outreach's confirmed-interest link, params \`rid/business/area/lang\`. New black/pink/light-blue cleaning hero and editorial cards load **only in sample mode**. Real buyer keys and owner-preview booking pages retain existing live designs and behavior; no real booking or email occurs from a sample. |
| \`/lead-demo-tracker.html\` | \`public/lead-demo-tracker.html\` | Demo Command Center preview |
| \`/demos/claudia/\` | \`public/demos/claudia/index.html\` | Named sample, NOT reusable across tenants |
| \`/demos/angela-so-fresh-clean-queen/\` | \`public/demos/angela-so-fresh-clean-queen/index.html\` | Named sample; isolation required |
| \`/client-review/\` | \`public/client-review/index.html\` | Tokenized private review/approve/request changes; valid token required |
| \`/client-legal/\` | \`public/client-legal/index.html\` | Client's own policies by identity/token, never TLE generic for CB Depot |
| \`/cb-depot/privacy/\` | \`public/cb-depot/privacy/index.html\` | CB Depot privacy ONLY |
| \`/cb-depot/terms/\` | \`public/cb-depot/terms/index.html\` | CB Depot terms ONLY |
| \`/privacy.html\` | \`public/privacy.html\` | The Launch Era privacy |
| \`/terms.html\` | \`public/terms.html\` | The Launch Era terms |
| \`/command-center/\` | \`public/command-center/index.html\` | Owner/tenant login and protected workspace |
| \`/command-center/access\`, \`/command-center/access.html\` | \`public/command-center/access.html\` | Private access/recovery request; BOTH forms loaded on Oct 12 |
| \`/command-center/lead-insights.html\` | \`public/command-center/lead-insights.html\` | Authenticated lead insight view; tenant scoped |
| \`/command-center/buyer-account-preview.html\` | \`public/command-center/buyer-account-preview.html\` | DEMO ONLY; no live customer data |
| \`/auth-recovery\`, \`/auth-recovery.html\` | \`public/auth-recovery.html\`; alias in \`public/auth-recovery/index.html\` | Reset password with recovery token -> Command Center, NOT site hero |
| \`/cleaning-app/\` | \`public/cleaning-app/index.html\` | Legacy marketing redirect to \`/cleaning-web-app/\` (observed) |
| \`https://app.thelaunchera.com/\` | \`thelaunchera/launch-Era-App-\` | Operational Cleaning App, separate from marketing site |

| \\`/command-center/ai-team.html\\` | \\`public/command-center/ai-team.html\\` + AI Team assets | Private The Launch Era internal owner role only; tasks, AI plans, approvals, evidence, audit. No buyer access or automatic external action. |\n
Other routes exist under \`src/routes/\`, \`public/es/\`, \`public/intake/\` and \`public/ai-booking-assistant/\`; \`scripts/qa-route-integrity.mjs\` scans the filesystem for static references. All routes must be added here when they become a production CTA.

## Public sample contact and legal navigation (2026-10-15)
- **Scope:** `/lead-private-preview.html` without `key` and without `owner_preview=1`, using `public/assets/tle-demo-luna-bloom-v17.js` and `.css`. Generic default brand is **Luna Bloom Home Cleaning**; a `business=` query parameter still personalizes the prospect's demo.
- **Brand:** `#demoBrandName` → `#leadHero`. Single aligned wordmark + decorative blossom icon, EN/ES. No old TLE "ERA" second wordmark or stray "DEMO" next to it.
- **Footer/contact:** `#demoContact` within the same demo → fictional Miami location, reserved **(305) 555-0148** and `.example` mailbox, explicitly disclosed as mock data. Contact CTA → `#bookingStarter` existing demo request form (no email, call, payment or real booking).
- **Footer quick links:** `#leadHero` (home), `#demoServices` (services), `#bookingStarter` (request), `#demoContact` (contact). Legal links `#demoPrivacy`, `#demoTerms`, `#demoCookies`, `#demoAccessibility` open `#tleDemoLegalDialog` with localized sample text and working close/Escape. The legal links are demonstration policies, **not** TLE's actual terms or any tenant's legal policies.
- **Tenant isolation:** no rendering of Luna contact or policies when `key`/owner preview is present. No modifications to booking submission handlers, real-client branding, Supabase, Resend or public TLE legal documents.
- **QA:** `scripts/qa-demo-v12.mjs` tests phone/tablet/desktop, EN/ES mock identity, `.example` mailbox, reserved phone, legal open/close, no overflow and buyer isolation; browser/live verification required before resolved status.

## Button/link contract (source → destination → condition)
| Source / button | Expected destination or action | Must verify |
|---|---|---|
| Header The Launch Era wordmark | \`/\` or \`/es/\` | Correct language and TLE logo |
| Header Solutions / How it works / Help | \`/solutions/\`, \`/how-it-works/\`, \`/help/\`; ES may jump to anchors under \`/es/\` | No dead anchors |
| Booking CTA / See demo | \`/booking-demo/\` or approved service demo route | Do not send to blank landing |
| AI Assistant plans Get Started | \`/service-checkout/?offer=ai-booking\`, \`ai-followup\`, or \`ai-business\` | Correct offer; real activation only after successful payment |
| Booking intake / ES intake | \`/booking-flow-intake/\` / \`/es/booking-flow-intake/\` | User-token and form validation, no cross-business records |
| Command Center access "Back to main" | \`/command-center/?from=private-access\` | Tenant identity preserved after login |
| "Reset your password" email/action | \`/auth-recovery.html\` with valid auth session/recovery token, then \`/command-center/\` | Real reset fixture, no marketing page, no 404 |
| "I'm Interested" in first outreach email | GET \`https://bowacxhmjvrqixtwaikv.supabase.co/functions/v1/tle-crm-interest?lead=<UUID>\` → 302 AppDeploy \`/interest.html?lead=<UUID>\` | GET never grants consent; correct lead; no query parameter loss |
| "Yes, I'm Interested" on confirmation UI | POST \`tle-crm-interest?lead=<UUID>\` | Browser CORS on EVERY response and two-step authorization; no false error after DB update |
| After explicit consent | Resend acknowledgment → \`personalized_demo_requests\` → \`tle-crm-personalized-demo-worker\` → personal preview email | No duplicates, at least 60 seconds after acknowledgment, isolate tenant |
| Shared prospect demo "Choose your service" (sample-only hero) | `/lead-private-preview.html?...#demoServices` | One clear starting CTA to selectable services, then same-page `#bookingStarter` functional request; no duplicated sales CTAs. Keep dynamic `rid/business/area/lang`. |
| "TRY YOUR PERSONALIZED DEMO" email | \`/lead-private-preview.html?rid=...&business=...&area=...\` | Correct business name/area; NOT old client demo |
| "Open Demo Command Center" | \`/lead-demo-tracker.html\` with appropriate demo context | Demo only, no production client data |
| Client review "Approve" / "Request Changes" | Tokenized \`tle-client-review\` Edge Function | Correct client/revisions; no submit without valid token |
| Client policies/Unsubscribe | Correct tenant's legal routes and authenticated tokenized unsubscribe | No generic TLE policy for CB Depot |
| Customer booking submit/cancel/change | Business-scoped booking handler → customer acknowledgment → OWNER Command Center alert | No automatic irreversible cancel or charge |
| All "Refresh", Back, profile/settings & sidebar controls | Remain within current authenticated tenant and route | Mobile/tablet/desktop navigation, no lost sidebar |

## Redirect guardrails
- No stale \`pages.dev\`, Netlify, abandoned Cloudflare portal or obsolete GitHub Pages URLs in **new** onboarding emails. A **grandfathered client-specific** URL may remain where explicitly retained.
- Never redirect a password-reset link to the marketing home. Never redirect \`/command-center/\` to a client-specific landing without authorization.
- Never route CB Depot inquiries to TLE general CRM or cleaning services; branding/legal/assets are per-tenant.
- Do not treat a 200 response as proof of correct content: verify headline, tenant brand, empty/error placeholder, relevant module and resulting navigation.
- Routes requiring a token (review, approval, recovery, unsubscribe, payment) must show a helpful non-empty error if missing and never mutate state.
- Keep a real Next Step on errors: return to the correct private login/contact channel, not unrelated home.

## Test matrix
Repeat after ANY route/button/domain change: 360px phone, 390px phone, 820px tablet, 1024px tablet/laptop and 1440px desktop; test EN/ES, owner/client/worker access, current + future tenant fixture, expired token, missing token, duplicate click, browser refresh/back, popup and multi-tab. Never use a real customer's data to exercise destructive actions.

## Missing-route fallback (2026-10-12)
- Source: `public/404.html`; the Pages build `.github/workflows/pages.yml` now preserves it rather than replacing with `index.html`.
- Unknown URLs must return HTTP 404 with a branded, readable message and safe links to `/`, `/command-center/`, `/help/`.
- The CI live check uses a nonexistent path to catch an unexpectedly empty, redirected or unhelpful 404.


## Owner-only Jessy push alerts (2026-10-12)
- **Source/UI:** `public/command-center/index.html` loads `assets/jessy-push.js`; the private owner bridge `assets/command-center-app.js` provides JWT-scoped `TLEOwnerJessyGateway.pushAlerts()`. No owner push controls must render in buyer workspaces (including CB Depot).
- **App route:** `https://thelaunchera.com/command-center/` and local service worker `/command-center/sw.js`. Owner taps the small bell shortcut, then **Activate alerts / Activar avisos** within Notifications. On iOS 16.4+, requires Safari **Add to Home Screen** first and owner permission inside the installed PWA.
- **Backend:** `https://bowacxhmjvrqixtwaikv.supabase.co/functions/v1/tle-jessy-push` accepts only authenticated verified platform owner requests for `config|subscribe|unsubscribe|test`, with a server-token-only `dispatch` action; `public.tle_crm_push_subscriptions` stores tenant-scoped device subscriptions. VAPID signing keys remain server side in `owner_push_runtime`.
- **New private owner event:** AFTER INSERT of `tle_crm_notifications` limited to internally owned workspace and allow-listed `lead/demo/quote_request/won/system_ready` kinds. Server sends via Web Push only to that owner, using `tle_crm_push_dispatches` for dispatch dedupe. No client or end-customer notifications, changes or messages.
- **Notification click:** opens `/command-center/?from=jessy-alert`, never a customer's booking page, a generic marketing landing or a 404. Lock-screen copy excludes customer details.
- **Release tests:** ensure owner-only UI, service-worker scope, existing TLE brand icon, valid/invalid JWT responses, unsupported browser and iOS Safari non-standalone guidance, duplicate and expired subscriptions, token-protected dispatch, tenant scoping and user-initiated device test. Provider-accepted is NOT verified displayed. **Real iPhone/iPad acceptance is pending the owner's Home Screen opt-in and test tap.**


## Owner & buyer notification preferences (2026-10-12)
- Official route: `https://thelaunchera.com/command-center/`; authenticated owner or buyer → bell → **Alert settings**. Entry in `public/command-center/index.html`, client `assets/command-center-notification-settings.js`, gateway in `assets/command-center-app.js`, push handler `public/command-center/sw.js`.
- Original CRM mirror: `thelaunchera/the-launch-era-crm/index.html` and `notification-settings.js`; legacy Worker link is grandfathered, not the default for new deliveries.
- Back end: `tle-crm-alert-dispatch` Supabase Edge Function; `tle_crm_notification_preferences` (per workspace/user, default channels OFF); `tle_crm_push_subscriptions` (per-user device); `tle_crm_alert_delivery_attempts` (unique event+channel+user) and `tle_crm_alert_enqueue_insert` (AFTER notification insert). Exact allowed origins include official TLE and legacy CRM Worker.
- Email is **only the authenticated, verified user's account email**, sent from TLE transactional domain, with business name and no customer PII. Push needs explicit phone/device consent, iOS Safari **Add to Home Screen**, and is not SMS/WhatsApp.
- Event filters: `lead`, `quote_request`, `booking_received`, `appointment_change`, `customer_message`, `ai_message`, `followup_due`, `demo`, `won`, `system_ready`. Source mapper marks new confirmed Booking Page jobs `booking_received`, booking-change/customer-change source keys `appointment_change`. All existing notifications untouched.
- AI activity requires an actually active/delivered AI entitlement plus a genuine `ai_message` event after provider-verified handling; **choosing an alert does not purchase or activate AI nor authorize outgoing customer messages**.
- QA before claiming live: user from private owner and paid buyer logins, iPhone installed PWA notification authorization, a test push and explicit opt-in email test, provider event logs, CB Depot brand/isolation, preference ON/OFF for each channel, no duplicate send, no 404, live GitHub Pages release. Never use a real customer's details as QA fixture.

## Cleaning App public landing contract (2026-10-13)
- `/cleaning-web-app/` and `/es/cleaning-web-app/` render `src/components/cleaning-app-editorial.tsx` using `public/assets/tle-app-landing.css`. This is an English/Spanish public sales presentation only, not an authenticated app or tenant data source.
- Primary **Start free trial / Comenzar prueba gratis** and **Create my account / Crear mi cuenta** point to `https://app.thelaunchera.com/?entry=signup` (external Cleaning App signup). Secondary **Explore demo / Ver demo** and **See it in action / Ver cómo funciona** point to `/cleaning-app-demo/?lang=en|es` (public fictional demo; no real records).
- UI dashboard names, activity counts, statuses, times and pricing illustration are explicitly fictional sample data. No API, CRM, Supabase, customer data, email or booking mutation in the marketing visual.
- No FAQ or separate ServiceSales journey inside this landing. Trial terms appear in hero and closing price panel; Jessy launcher is compact on phone and its nudge hidden only on these two routes (chat panel remains available). Shared website footer and client pages remain unchanged.

## Public brand and demo update — 2026-10-13
- Shared sample prospect demo (/lead-private-preview.html without buyer key or owner preview) adds /assets/tle-demo-blue-v5.css, scoped only to html.demo-editorial. Keep rid/business/area/lang parameters, and original confirmed-interest demo path.
- Authenticated buyer and owner preview paths (?key=... and ?owner_preview=1) remain unchanged; blue sample CSS does not apply.
- Website EN/ES public marketing pages load /assets/tle-saas-ui-v1.css after existing brand CSS. Header Support/Ayuda and footer Contact/Contacto continue pointing to /help or /es#contacto, respectively; remove duplicate Get in Touch footer action.
- Homepage in-page contact form #contacto remains accessible. Final CTA still points to the existing booking checkout; the extra after-contact invitation was redundant and removed.

## Owner-reviewed production kickoff + Jessy intake readiness (2026-10-13)
- **Backend owner approval:** `tle-project-production-start` (version-controlled at `supabase/functions/tle-project-production-start/index.ts`) accepts authenticated internal platform owner action `status` or `approve` with `subject_type=booking|ai` and an existing paid/intake-complete order ID. Every production approval requires an explicit confirmation from the owner. Idempotent `tle_project_kickoffs` records keep one approval and one provider email request per project.
- **Owner UI:** `/command-center/` → Clients & Purchases / Booking setup or AI Assistants / Delivery → **Approve production start**, then second click **Confirm start and email buyer**. Never use this button from tenant accounts, public previews or demo data.
- **AI companion:** Owner Jessy asks “What is missing for each client?” / “¿Qué le falta a cada cliente?” and calls `tle-jessy-owner` read-only readiness. Shows only Booking Automation and AI Assistant orders presently stored in the connected backend. Missing optional photos/logos are not mandatory blockers; no approval or customer email is initiated by a Jessy checklist.
- **Email separation:** automatic intake receipt says the project is under review and production has not begun; the separate kickoff email follows the owner action. Email provider ambiguous/error status is `needs_review`; verify Resend before any manual resend; never auto-repeat.
- **Scope:** TLE sells its own services via Stripe. Cleaning App records clients’ payment methods as Cash, Zelle and Check without Stripe processing.
- **Verification:** release workflow static checks plus owner-authenticated UI, test recipient fixture and provider events are needed to sign off actual delivery; avoid sending to real clients for QA.

## Reference-approved sample Cleaning demo composition — 2026-10-13
- Public `/lead-private-preview.html?business=...&area=...&lang=en|es` `html.demo-editorial`: hero → `#bookingStarter` interactive `.panel` → `#demoCinematicStory` restored feature. Heading/circle CTA and populated service cards styled by `/assets/tle-demo-booking-v7.css`; client-specific buyer/owner preview modes unaffected.
- `#residentialServiceList` retains five interactive buttons (three priced cleaners, estimate, quote). `#commercialServiceList` retains six interactive buttons (estimates/quotes). Buttons and selected state must continue calling the original booking handlers.
- Spanish story title must be kept consistent in both `lead-private-preview.html` and the deferred sample-only script `tle-demo-cinematic-v1.js`, or the latter will overwrite it.
- Browser QA: `scripts/qa-demo-editorial-v7.mjs` tests phone 360/390, tablet 768/1024, desktop 1440, EN/ES, photo below booking, circular CTA, tabs and safe client preview isolation.
## Public sample midnight design — 2026-10-13
- Production public prospect preview `/lead-private-preview.html?business=...&area=...&lang=en|es` loads `/assets/tle-demo-midnight-v11.css` last, only when `html.demo-editorial` is present. Public sample hero image source: `/assets/cleaning-demo/tle-midnight-hero.avif` (self-hosted optimized AVIF).
- Hero `Choose your service` goes to the visible `#bookingStarter` service panel. `Begin` goes to `#categoryTabs`. `#residentialServiceList`, `#commercialServiceList` and quote/confirmation handlers remain identical. The lower photo feature stays `#demoCinematicStory` after the booking panel. Test EN/ES at widths 360/390/768/820/1024/1440.
- Black / ice-blue sample overrides MUST NOT reach `?key=` buyer views, `?owner_preview=1` or CB Depot pages. `scripts/qa-demo-editorial-v7.mjs` asserts sample-only styles, dark backgrounds and image readability.

## Website favicon (2026-10-13)
Main website root EN/ES declares /favicon.png (512x512), /favicon.ico and /apple-touch-icon.png (180x180). /favicon.svg is the same square TLE-on-light-blue mark. Client tenant favicon links and Command Center icons are separate and preserved. Google may refresh only after recrawl.

## Private AI Team v1 (2026-10-13)
- Owner sidebar `My AI Team` / `Mi equipo de IA` opens `https://thelaunchera.com/command-center/ai-team.html`. `public/command-center/assets/ai-team-entry.js` injects navigation only while `TLEOwnerJessyGateway.ready()` verifies the internal owner; it is never a buyer/client navigation item.
- Backend `tle-ai-team` validates the JWT, membership of `platform_admins`, and that the user created the internal workspace. Task and event tables have RLS with no direct anonymous/authenticated grants. No real customer record is mutated by the task board.
- Actions: `list`, `scan` (read-only aggregate counts), `create`, `assign`, `status`, `approve`, `complete` with evidence, `plan` (LLM suggestion only). AI planning does NOT execute a task. Email, payment, deployment and buyer data modifications are not AI Team actions.
- Standalone Jessie mounts only after owner checks and stays on `/command-center/ai-team.html`; back action returns to `/command-center/`.
- QA: unauthorized/buyer JWT denied; duplicate task submit rejected; XSS-safe rendered content; mobile 360/390, tablet 820/1024, desktop 1440, iOS Safari and desktop browser; navigation, refresh, logout and approvals checked before production release.


## Owner-only AI Team execution, source reviews (2026-10-13)
- Entry route remains `/command-center/ai-team.html`; no new public links or buyer routes.
- New authenticated `POST /functions/v1/tle-ai-team` action `run_agent`: only named, allow-listed `agent_key` values. Never accept untrusted URLs, SQL, client IDs, recipients or GitHub write operations from browser input.
- `jessie` = owner operations aggregates; `sales` = due lead and consent-flag aggregates only (not send authorization); `projects` = purchase/intake/delivery count audit; `developer` = public GitHub HEAD/CI read check; `qa` = read-only GET allowlist; `creative` = public route/page-title audit (NOT Metricool); `care` = support status aggregates. Every result identifies a source and partial coverage.
- `tle_ai_team_runs` stores real result metadata and safe aggregates, scoped to platform owner workspace. Deny direct anonymous/authenticated table access via RLS + revoked grants. Browser `AI Team` renders reports via text nodes, not HTML injection.
- Jessie on the private AI Team screen recognizes explicit Spanish/English check commands and calls the same authenticated gateway. Other Jessie screens continue existing action scope; no arbitrary execution through a chat prompt.
- Nothing in this feature sends email, messages, invoices, customer updates, checkout requests or GitHub commits. Do not call a report a completed client task. Existing owner approval and completion with evidence are separate actions.
- Before marking released: `node scripts/qa-ai-team.mjs`, GitHub `Private AI Team QA`, Pages deploy + route guard, owner session / buyer session browser acceptance, mobile/tablet/desktop check. Keep live authentication end-to-end pending if not exercised.


## 2026-10-13 — Owner AI Team unattended monitoring and work products
- Independent Supabase pg_cron job: `tle-owner-ai-team-morning-review` runs hourly but its procedure only executes at **08:00 America/New_York** (DST-safe), producing idempotent internal daily reports in `tle_ai_team_runs`; manual forced checks used only for QA.
- Three owner-task triggers are installed only on `tle_crm_support_requests`, `tle_booking_flow_accounts` and `tle_ai_agent_orders`. Their SECURITY DEFINER handler creates owner-scoped `tle_ai_team_tasks` only, never modifies buyer/client rows, sends mail or launches production. Deduplication keys: `support:<uuid>`, `paid-intake:<uuid>`, `intake-review:<uuid>`, `assistant-order:<uuid>`. Daily keys include Eastern date.
- `tle_ai_team_outputs` holds generated owner-reviewed drafts. Backend `compose_output` uses limited task context and available aggregate source facts; `review_output` changes internal review status only. Explicit no-send, no-publish, no-merge restriction. Do not treat an approved draft as deployed or sent.
- Board displays draft contents using textContent; approval/rejection and copy in private owner view. Keep manual owner verification for external communications, code releases, Metricool changes and customer operations.
- Run `node scripts/qa-ai-team.mjs` and `node scripts/qa-jessy-owner.mjs`, plus browser mobile/tablet/desktop checks. Confirm no unapproved outbound sends, no cross-tenant access and no duplicate trigger tasks.


## AI Team private Jessie delegation and audit — 2026-10-13
- Only on the owner-authenticated `/command-center/ai-team.html`, Jessie handles **explicit** `create task` / `crea tarea` commands and `draft` / `prepara borrador` requests by calling the same owner JWT gateway. A new task and work product remain draft state; no automatic recipient, email send, calendar change, payment, publication, deployment or buyer workspace modification is authorized.
- Supabase Edge Function `tle-ai-team` v5 lists `task_origin` and `run_origin`, distinguishing platform-triggered tasks and scheduled reports from human-initiated reviews. All content rendered as text, no HTML injection.
- `review_output` updates an output only if status remains `draft`, then inserts a private `output_approved` / `output_rejected` audit entry against the owning task. Work product creation inserts `output_created` audit event. Unrelated tenants cannot call these actions.
- Regression guards: `scripts/qa-ai-team.mjs`, `scripts/qa-jessy-owner.mjs` and `scripts/qa-safari-ai-team.mjs` (anonymous iPhone/tablet/desktop WebKit lock). Full owner-authenticated acceptance still requires the actual owner's session.


## AI Team automated internal notifications (2026-10-13)
- When the owner-only `tle_ai_team_record_automatic` creates a NEW internal review task, it also writes exactly one `tle_crm_notifications` record with `kind='ai_team'`, `workspace_id` equal to the authenticated platform owner's internal workspace, and unique `source_key='ai-team:<task uuid>'`. Deduplicated source events cannot create duplicate notices.
- Notification text contains no client identity or customer contact details; it is never a customer email and does not start a payment, publication or delivery workflow.
- Alerts remain subject to the existing owner Command Center notification/push preferences. Without push permission, the event remains an internal Command Center notice.
- The migration is tracked in `supabase/migrations/20261013_tle_ai_team_owner_notifications.sql`. Verify a genuine next event end-to-end; do not insert fake customer events on production for QA.


## Private AI drafting status, 2026-10-13
- Route: `/command-center/ai-team.html` → owner-only `ai-provider-check` button → Supabase `tle-ai-team` action `provider_check` (platform-admin JWT, internal workspace required). Tests a tiny OpenAI response with an Edge Function secret; never returns its value.
- Backend reports `configured`, `verified`, `reason` and public model name only. Reasons (e.g. `invalid_key`, `rate_or_billing_limit`) are sanitized; never log authorization headers.
- A generated work product has `generation_mode=ai` only after actual nonempty OpenAI content. A static fallback is saved with `generation_mode=template` and clearly labeled **Plantilla · Sin IA**. Jessie also distinguishes these. Both remain unsent and owner-reviewed.
- Schema `public.tle_ai_team_outputs.generation_mode` applied in Supabase and versioned in `supabase/migrations/20261013_tle_ai_team_generation_mode.sql`. In owner UI the test status is NOT a proof of client acceptance until run with the owner session.
- Regression: `scripts/qa-ai-team-ai-provider.mjs`, existing task/Jessie/route security and Safari tests.

## Smart Welcome — planned, not deployed (2026-10-14)
- No new public page route. Existing `/booking/?key=<UUID>` → `/base-booking.html?key=<UUID>` remains the only live buyer entry.
- The client-side `/assets/booking-smart-welcome.js` calls proposed `/functions/v1/tle-booking-smart-welcome` using a public booking key **only after** the verified released buyer model loads. Missing/disabled/expired welcome → original page unchanged.
- The Command Center buyer's verified share panel mounts `booking-smart-welcome-editor.js` only after delivery. `get` and `save` operations require a verified JWT and ownership; direct `anon/authenticated` table grants are revoked.
- Welcome CTA closes the overlay and scrolls to **the existing** `#booking`; dismiss/skip returns to the page without writes. No pricing modification, no automatic discounts, no new external checkout/lead route.
- Feature branch: `feature/smart-welcome-booking-20261014`. **Backend schema and Edge Function deployed to production default-off 2026-10-14; frontend release pending. CB Depot draft disabled; no client promotion enabled.** See `docs/SMART_WELCOME_BOOKING.md`.

## Smart Welcome returning-visitor alert — 2026-10-14
- **Entry stays unchanged:** `/booking/?key=<tenant-key>` redirects to `/base-booking.html?key=<tenant-key>`, where the released tenant's `tle-booking-smart-welcome` public configuration is fetched read-only after pricing/model loads. No routing, data, consent, booking form or calculation changes.
- **First visit:** full Smart Welcome modal; dismiss closes; primary CTA scrolls to existing `#booking` without new page navigation. **Returning visit:** keep the small inline offer card, and show a non-modal bottom welcome-back toast for 16 seconds with business-specific EN/ES copy, dismiss control and CTA to the same `#booking`. Clicking CTA closes toast then scrolls to booking. Direct `#booking` deep links do not trigger the toast.
- **CB Depot:** detail-specific text ('Welcome back to CB Depot!' / 'Ready for your next detail?'); dark `#07111C`, electric blue `#087DFF`; no duplicated panda logo, no invented promo or discount; real main-page logo stays intact.
- **Isolation:** per tenant's unique booking key in browser localStorage; no tracking, cookie or cross-tenant identity. Missing, expired or disabled configuration yields no overlay/toast.
- **QA:** `scripts/qa-smart-welcome-browser.mjs` checks arrival/repeat mobile and desktop, CTA/close and preserved booking forms; live origin still needs post-deployment smoke.

## The Launch Era marketing Smart Welcome Bundle — 2026-10-14
- **Only The Launch Era homepage:** React component `src/components/smart-welcome-bundle.tsx` is explicitly mounted by `src/routes/index.tsx` and `src/routes/es.index.tsx`; never on buyer/customer Booking Pages, Command Centers or CB Depot.
- **Visual:** the exact approved flyer is self-hosted at `/assets/promo/tle-smart-welcome-bundle-flyer.jpg`. The origin asset was matched to SHA-256 `4b81811c533c735b755bfcb960c71d470f060265289b5bce19ad186873a97ce3` and imported unchanged to Git. No duplicated non-working 'Get it now' image button; the whole flyer and separate accessible CTA are navigable.
- **New visitor:** modal after 1.1 seconds only once per browser session, optional dismiss, Escape and focus restoration. **In-page:** smaller flyer with CTA below homepage hero for later review. Existing hero/solutions/other links stay intact.
- **Live promotion check:** public GET to `tle-booking-bundle-checkout` must return `percent_off=40` and `plans.ai-booking`; otherwise the modal and inline 40%-off claim are both hidden. No writes, no payment collection, no offer price invention.
- **CTA:** `/booking-bundle/?lang=en|es&bundle=ai-booking&source=smart-welcome` renders the **existing** combined-checkout choice with AI Booking preselected; other AI plans and booking-only remain available. Last checkout price, discount and monthly cost are validated by the existing Supabase bundle checkout backend. No direct payment link.
- **Rate terms:** 40% off eligible combined activation only, not ongoing AI subscription. AI standard monthly price starts after the first 30 days from delivery. No impact on current/future customers, their invoices or client-specific offers.
- **QA:** `scripts/qa-smart-welcome-home.mjs` verifies exact poster, routes, scope, safe discount and CTA; Playwright `scripts/qa-smart-welcome-home-browser.mjs` checks first/repeat session, responsive EN/ES, accessibility and selection, without submitting checkout.

## Booking bundle storytelling landing — 2026-10-14
- The homepage Smart Welcome **Get the bundle** goes to the existing public `/booking-bundle/?lang=en&bundle=ai-booking&source=smart-welcome`. Its landing now presents an educational hero, mini interactive examples for Booking/Command Center/AI, and a full details area BEFORE the unchanged purchase selector.
- Image assets from the approved human-cleaners images are self-hosted at `public/assets/bundle-landing/bundle-{hero,booking,command,ai}.png` with original SHA-256 verified by `scripts/qa-bundle-sales-landing.mjs`. Images are marketing photography; actual interactive demo illustrations use safe fabricated local data.
- Locale `?lang=en|es` switches authored copy. `#experience` leads to sample demos; `#included` summarizes; `#choose-plan` scrolls to the existing checkout component. Header and logo return to The Launch Era main site. Booking demo link to `/booking-demo/` and public AI detail link to `/ai-booking-assistant/#demo`; NO private CRM preview or actual client credentials exposed.
- Offer badge reads the existing `tle-booking-bundle-checkout` **GET** and appears only when `percent_off=40` with a valid AI plan. All final prices and payment checks remain within existing `public/assets/tle-booking-bundle.js` using Supabase and Stripe; **no checkout POST from landing demos**. AI is optional, separately priced monthly, and 40% applies only to eligible combined activation.
- Nothing changes in CB Depot booking, other tenants' pages, app dashboard, customer messages, or source of truth for pricing. Browser test: `scripts/qa-bundle-sales-browser.mjs` tests widths 360/390/820/1440 and Spanish/localized examples, fake-GET only and checkout choice preservation.

## Marketing Smart Welcome homepage sizing fix — 2026-10-14
- User identified the **in-page** flyer block below the home hero as overlarge and visually repetitive, especially on iPhone. The full approved flyer still appears only in the original **first-session popup**, not twice on the page.
- `src/components/smart-welcome-bundle.tsx` now renders a compact horizontal promotion strip on desktop, small stacked strip on phones: 40%-off combined-activation label, short benefit, caveat about AI monthly fees, **one** `Explore the bundle` / `Ver paquete` CTA.
- The strip stays behind the real pricing GET gate; it links to the same public `/booking-bundle/?lang=...&bundle=ai-booking&source=smart-welcome` landing, not a payment redirect. All tenant booking pages, CB Depot, quotes, Command Center and public demos remain unchanged.
- Regression: browser QA at 360/390/820/1440 enforces inline height <=225px mobile or <=165px desktop, no repeated flyer image, and one functioning CTA.


## 2026-10-15 — Prospect demo and sales demo editorial extensions (v12)

- **Sample preview only:** `/lead-private-preview.html` without `key` or `owner_preview=1`. The enhancement script `public/assets/tle-demo-enhancements-v12.js` and CSS `public/assets/tle-demo-enhancements-v12.css` add `#tleDemoReviews`, `#tleDemoAreas`, `#tleDemoFaq` and a `#bookingStarter` closing CTA. Review slots are clearly labeled demo placeholders, never invented customer quotes; areas come only from the `area` query parameter, otherwise show explicitly unconfirmed placeholders. Background photographs use existing `/assets/lead-demo/` assets. No operational booking data, service keys, or forms are modified.
- **Robot AI icon:** `/assets/lead-demo/ai-demo-robot.webp`, derived from the user's supplied glowing robot avatar. Existing live AI booking assistant `public/assets/tle-ai-booking-chat.js` remains the same endpoint/prefill workflow. Enhancement updates only its sample-mode avatar, intro, guide actions, welcome nudge and clearly labels AI a separate optional service. It must never submit a real booking.
- **Sales demo:** `/booking-demo/` keeps its existing consent/payment-free personalized-demo form and existing Jessy backend, with the new icon and a form-guide panel. 'Help with form' focuses the `business` field only; 'Explore services' opens the existing Jessy assistant; 'AI is a separate add-on' explains service separation. Photos/review-layout/service-area previews on this sales page contain no false customer endorsements. Language toggle must not erase entered inputs.
- **No new route:** all added links remain on `/lead-private-preview.html` (`#demoServices`, `#tleDemoReviews`, `#tleDemoAreas`, `#tleDemoFaq`, `#bookingStarter`) or `/booking-demo/` (`#demoForm`); AI pricing links to existing `/ai-booking-assistant/`. Neither route should redirect to the Command Center or a client tenant.
- **Release verification:** validate `/assets/lead-demo/ai-demo-robot.webp`, `/assets/tle-demo-enhancements-v12.css` and `.js` load correctly on GitHub Pages; run deployed sample screens at 360/390/820/1024/1440 and EN/ES, check guide actions and assistant, and confirm owner-preview keys retain original behavior. Do not assert browser QA passed before it's observed.

## Sonny demo greeting and chat (2026-10-15)
- **Public SAMPLE only:** `/lead-private-preview.html?business=...&lang=en|es&sonny=1` uses `public/lead-private-preview.html`, `public/assets/tle-ai-booking-chat.js` and `public/assets/tle-demo-enhancements-v12.js`.
- The **in-page hero greeting** (`#tleSonnyInlineGreeting`) is a non-submitting introduction. “Let's chat” / “Chatear” explicitly opens Sonny; `sonny=1` does **not** auto-open a fullscreen chat or lock scrolling.
- The hero greeting and the small floating avatar alternate when the hero enters/exits view; the avatar is not a second assistant. Sonny chat field must keep dark text, placeholder and caret on white in mobile Safari, and remain separate from buyer/owner previews.
- Owner and buyer URLs with `key` or `owner_preview=1` bypass Sonny sample scripts. Closing the chat returns focus to the visible launcher/greeting. No booking, email or payment is sent by the greeting.

### Sonny single-bubble design — 2026-10-15
On `/lead-private-preview.html` sample only, `tle-demo-enhancements-v12.js` owns one `#tleSonnyGreetingPopup` anchored above the right-hand `.tle-ai-launch`. It is a compact dark-blue greeting that closes after approximately five seconds, on scroll, or when chat is opened. It is **not** a second assistant. Neither `#tleSonnyInlineHello` (the old wide bar) nor `#tleSonnyInlineGreeting` (the old white hero card) may render. `tle-demo-client-experience-v14.js` must not independently add another greeting. Opening Sonny requires a deliberate click, never the `?sonny=1` URL alone. The typing field retains black text and caret on white. Booking samples do not send orders or emails.
