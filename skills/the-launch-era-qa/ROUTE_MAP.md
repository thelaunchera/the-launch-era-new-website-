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

Other routes exist under \`src/routes/\`, \`public/es/\`, \`public/intake/\` and \`public/ai-booking-assistant/\`; \`scripts/qa-route-integrity.mjs\` scans the filesystem for static references. All routes must be added here when they become a production CTA.

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
