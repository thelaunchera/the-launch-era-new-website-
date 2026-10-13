---
name: the-launch-era-release-qa
description: Run this skill for ANY change to The Launch Era websites, booking pages, Command Centers, Cleaning App links, AI assistants, emails, auth/activation, follow-ups, private demos, checkout or any current/future client. Prevent wrong-company destinations, broken buttons, 404s, blank screens, duplicates and false delivery statuses.
version: 2026-10-12
---

# The Launch Era — release safety & incident memory

**MANDATORY**: Read \`ROUTE_MAP.md\` and \`INCIDENT_LOG.md\` beside this file BEFORE editing any route, email template, workflow, UI, landing, form, Supabase function, or client delivery. Consult actual deployed code and database first; the map is a checked reference, not permission to guess current implementation.

## Project boundaries
- **Active website:** \`thelaunchera/the-launch-era-new-website-\`; \`public/\` exposes standalone pages; \`src/routes/\` is the main site router. Production host \`https://thelaunchera.com\`.
- **Owner/tenant CRM Command Center:** \`thelaunchera/the-launch-era-crm\`, also mirrored at \`public/command-center/\` in active site. Official entry \`https://thelaunchera.com/command-center/\`.
- **Cleaning App:** \`thelaunchera/launch-Era-App-\`, public \`https://app.thelaunchera.com/\`.
- **Old website:** \`thelaunchera/The-launch-era-Website-\` is LEGACY; do not deploy an old route over the active site.
- **Backend:** Supabase production project \`bowacxhmjvrqixtwaikv\`; testing project \`afyiltvdfqnuyzcqsnoh\`. No silent mixing of testing with production.
- **Interest-confirmation UI:** AppDeploy app \`the-launch-era-interest-confirmation-odqbiw\`, page \`/interest.html\`; **live consent endpoint** Supabase Edge Function \`tle-crm-interest\`; personalized demo worker \`tle-crm-personalized-demo-worker\`.
- **Email:** Resend, verified business sender \`The Launch Era <hello@thelaunchera.com>\`. Never substitute a private sender or switch a customer's branding to TLE except the small \`Powered by The Launch Era\` credit.
- **Client isolation:** CB Depot is CAR DETAILING; preserve its branding, current infrastructure, photos, app icons, email recipients and legal pages. It is NOT a cleaning-business template. Keep its data/accounts separate from every other tenant. Preserve any specifically grandfathered Cloudflare URL for this client; future delivery uses the official TLE routes.

## Non-negotiable release gate
1. **Identify the owner of every action**: source repo/file, rendered URL, domain, tenant/workspace, recipients, language, button text, intended destination, fallback and required auth/token. Never assume a button's route from its appearance. Record in \`ROUTE_MAP.md\`.
2. **Verify all endpoints**: each navigation/CTA, quote form, booking submit, email CTA, client review, account activation, password reset, login, unsubscribe, terms/privacy, back/refresh and demo exit. Test **click** and resulting address + readable page + expected tenant, not only HTTP 200. Exclude destructive production actions from smoke tests; use isolated fixtures.
3. **Cross-domain confirmation**: browser-facing Supabase functions must send Access-Control-Allow-Origin on **every** response (success, error, duplicate/idempotent, preflight). Test OPTIONS + a non-mutating invalid POST, then a fixture end-to-end flow. A DB write with a browser "connection interrupted" is a release blocker.
4. **Consent & email workflow**: owner-sent first email -> "I'm Interested" -> second deliberate confirm -> consent event -> one acknowledgment -> one original personalized demo after at least 60 seconds -> at most two follow-ups. Confirm Resend accepted/delivered using event data; immediate provider GET may lag. Enforce idempotency. Record sent/delivered/opened distinctly. No fresh email after unsubscribe, bounce, reply or customer opt-out.
5. **Queue health**: check \`personalized_demo_requests\` for aged \`queued\`, \`processing\`, \`failed\`, \`needs_review\`; distinguish statuses starting \`test_\` from real prospects; reconcile with Resend BEFORE resending; inspect the worker and scheduled cron run. Never silently retry an email if the provider might already have sent it.
6. **Tenant & brand checks**: a user's email/login, booking data, receipts, client legal docs, notifications, favicon, logo, demo and follow-up must resolve to the correct business/workspace. A shared email address is NOT proof of shared business ownership. No copying CB Depot details into a cleaning client.
7. **Responsive QA**: widths 360, 390, 768/820, 1024, 1440; Android Chrome, iPhone/Safari, tablet & desktop. No 404, empty app, clipped hero/head, overlapping sidebar, blocked calendar, tiny consent control, broken scroll/footer, invisible CTA or horizontal overflow.
8. **Copy & service rules**: public TLE content English by default with properly localized Spanish counterparts; no Done-for-You Content or rebranding service; TLE's own sales checkout uses Stripe, but customer payments inside Cleaning App are Cash/Zelle/Check with no Stripe integration; no unapproved payment promises; AI assistants give short, human replies, ask only what is needed and provide a next step. Payments/quotes decided by human owner.
9. **Safe deployment**: run \`node scripts/qa-route-integrity.mjs --static\`, existing \`qa-auth-recovery.mjs\`, \`qa-client-release.mjs\` and relevant browser tests. Only then push. Live checks run separately from deployment to avoid testing stale GitHub Pages; verify production and update incident log. Never send live test emails or place bookings without explicit request.
10. **Stop conditions**: don't declare "fixed" after code-only changes. Check deploy is ready, routes are live, logs clean, database state correct, and browser confirms the expected result. If not verified, say "pending verification", record owner and exact blocker.

## Rapid incident playbook
- **404/wrong landing** → inspect actual URL, canonical/legacy routes, GitHub Pages deploy branch/path, auth redirect allowlist, source CTA and destination. Fix route/redirect, test direct visit + from email on mobile.
- **Button works but wrong client** → trace \`workspace_id\`, \`business_id\`, auth claims and account mapping, template URL parameters and tenant-specific assets; do not change unrelated clients.
- **"Connection interrupted" after confirmation** → inspect browser network/CORS on POST (incl. 200 responses), verify whether consent already changed, provider events and idempotency before reattempting.
- **Demo missing / stuck** → audit \`personalized_demo_requests\`, Resend email ID/status, \`tle_crm_email_events\` allowed event types, worker logs, cron; repair bookkeeping, NEVER duplicate a confirmed delivery.
- **Delivered in Resend but not visible in inbox** → distinguish server delivery from Inbox placement; inspect Spam/Promotions, DNS DKIM/SPF/DMARC and suppression. Do not assert it was read.
- **Reset link broken** → require recovery path and token handling; verify password reset points to the intended Command Center, not marketing landing or client preview.
- **Layout/blank screen/sidebar** → capture exact viewport/browser, inspect CSS load/network/status and overflow, verify back/navigation and refresh, retest all 5 widths.

## Skill maintenance
After EACH new incident, append dated: symptoms, affected tenant, source files/functions, root cause **verified vs suspected**, safe resolution, evidence of browser/provider/database verification and regression test added to \`INCIDENT_LOG.md\`. Update \`ROUTE_MAP.md\` whenever a path/button/hosting destination changes. A later agent must read these before making edits. Never store real access tokens, keys, passwords or personal client records in either file.
