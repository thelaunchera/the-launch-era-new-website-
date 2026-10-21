# Owner sales tools

The owner can now research a public business page, schedule the next internal follow-up, prepare an interactive private demo concept, watch public page text and export source-backed reports from one authenticated workspace. Existing lead, consent, email and customer booking flows remain authoritative.

## Entry and behavior

`/command-center/sales-tools.html` uses the existing `tle-crm-auth` session. An owner-only shortcut is mounted in the Command Center header; the AI Team also links to it. Every backend action validates the Auth user, platform-admin record and that user's unique internal workspace. The browser cannot choose a workspace or owner ID. Sign-out clears loaded data and the demo iframe.

- **Next actions:** existing CRM lead/date and recent recorded email events. Saving a date and its audit is one transaction with an expected-date concurrency check. Replied, archived, won, opted-out and failed-email leads cannot be rescheduled through this shortcut. It does not authorize or send mail.
- **Research & basic SEO:** bounded single-page HTTPS HTML inspection with public-IP-pinned TLS, robots rules, strict size/deadline, no redirect/query-token forwarding, no JavaScript execution and no LLM. Stores the source URL, timestamp, observations and limitations. Missing HTML evidence is never labeled a broken feature. Published emails remain unverified. Fresh identical research is reused for five minutes.
- **Clara demo:** the existing private Clara preview, opened full-screen through authenticated `tle-booking-demo-gate` `owner_preview`. The selected UI language is applied without changing the original content or pretending it is personalized for the selected lead. No research or lead selection is required. No raw protected HTML is bundled or downloaded. Sonny uses a frame-verified narrow relay without owner credentials or booking fields. Closing, signing out or superseding an attempt clears content.
- **Monitoring:** explicit owner-added pages only, maximum 10; a service-only atomic lease prevents overlapping checks. Each target checks once per day, dispatched every 30 minutes. Initial baseline is distinct from changed/unchanged/error. Changes create owner-only bell notifications with source comparisons; text changes are not described as price changes. Paused targets stop scheduled scans.
- **Reports:** current loaded record counts, coverage limits and source references; JSON and native editable PPTX. Bundled PptxGenJS 4.0.1 includes its MIT license. No revenue or conversion inference.
- **Local documents:** ZIP with Windows launcher, optional pinned Python dependencies, Scrapling saved-page parsing, pypdf text extraction, PaddleOCR tiny CPU models and python-pptx report export. No credentials, document upload or automatic CRM import. Installation and model downloads need internet. Local OCR output always requires review.

## Seven references: implemented scope

| Reference | Decision |
| --- | --- |
| trycompai/crm | Keep TLE CRM; implement source evidence, scoped history and atomic next actions. No migration to a single-tenant CRM. |
| every-app/open-seo | No DataForSEO API or paid plan. Provide a clearly bounded HTML SEO check; rankings, volumes and backlink database are not implemented. |
| dgtlmoon/changedetection.io | Provide native bounded text monitoring in existing Supabase infrastructure; do not deploy another hosting stack. |
| JCodesMore/ai-website-cloner-template | Provide a new editable interactive concept template, without copying third-party sites or private Clara HTML. |
| hugohe3/ppt-master | Provide native source-backed reports with PptxGenJS/python-pptx; no LLM or PPT Master installation. |
| D4Vinci/Scrapling | Pin and test Scrapling 0.5 in the local saved-page extraction kit. Public live single-page research uses our existing runtime. |
| PaddlePaddle/PaddleOCR | Pin PaddleOCR 3.7.0 + PaddlePaddle 3.3.1, using tiny CPU models. Model download blocked in this environment; real OCR inference remains unverified. |

## Backend release

New Edge Function: `tle-owner-growth`. `verify_jwt=false` is deliberate: owner requests validate bearer tokens against Supabase Auth in the handler; the scheduled-watch action validates the existing private worker token via `tle_crm_worker_token_ok`. Worker credentials cannot run owner-list/edit/research actions. No unauthenticated data actions exist. Both tables and RPCs deny anon/authenticated access; the Edge Function uses service-role access after verification.

Migration: `20261020153503_owner_growth_evidence.sql`. Cron installation is separate, after production function activation:

```sql
select cron.schedule('tle-owner-growth-page-watch','*/30 * * * *',
  'select private.tle_owner_growth_dispatch();');
```

Rollback: pause/unschedule that single job and remove the Sales tools entry script/link; disable the new Edge Function. Preserve the additive evidence and watch records until the owner decides retention. Existing email workers, buyer workspaces and booking functions need no rollback.

## Verification status

- Source/runtime fixtures: passed owner/nonowner/origin separation, cross-workspace denial, private URL/IP rejection, robots, source-cache reuse, Eastern date boundaries, no-send action surface and concept script/injection checks.
- Testing database: passed grants/RLS, atomic date + audit, stale/cross-workspace/replied request denial and exclusive monitor claims. All synthetic rows rolled back. Testing has a reduced CRM schema; a test-only event table is also rolled back.
- Local synthetic PDF extraction, Scrapling saved HTML and native editable PowerPoint export passed.
- PaddleOCR dependencies installed; model hosts are blocked by this environment, so image inference was not certified. Windows GUI/hardware testing remains pending.
- Chromium/WebKit CI and production release checks completed; see the dated release evidence below. Real owner-device acceptance and OCR/Windows testing remain distinct.

No marketing emails, client bookings, charges, lead imports or automatic AI external actions are authorized by this feature.

## Production release verification — 2026-10-20, 16:15 UTC

- Website PR #305 merged as `d99564d10e44c8b362b629feb3c76a5da1b91866`; dedicated Command Center PR #20 merged as `f6db095d7a92156d1005fafa2f3777305c9a3daa`. Both Pages build/deploy jobs completed successfully (website run 39455202901; portal run 39455215866).
- Source `b6d1284d578fba3e1b78eb9136a3d7f0de95fb02` passed 20 responsive EN/ES Chromium/WebKit cases at 360/390/820/1024/1440: next action, public-source check, full concept/reset, tabs/overflow, real editable Office archive download, sign-out clearing and unauthorized lock. The isolated portal overlay also passed Chromium/WebKit CI (run 39454534329).
- Live `https://command.thelaunchera.com/sales-tools.html` and all seven companion assets match their reviewed source bytes by SHA-256. Deployment metadata confirms the sales-tools pin and preserves the original portal/AI Team pins. Exactly one header loader is served.
- Production `tle-owner-growth` v2 ACTIVE; both new tables have RLS with no anon/authenticated SELECT. Required lead/event fields and one internal workspace verified. Live OPTIONS returns 204 with Command Center CORS; unauthenticated list returns 401, foreign origin 403. Browser displays the owner sign-in requirement without exposing records.
- Prior synthetic public-page checks stored a baseline followed by unchanged evidence. The example.com synthetic watch is now paused; its audit remains labeled as QA. Native cron job `tle-owner-growth-page-watch` is active every 30 minutes, with daily per-page leases; dispatch with no due active target correctly returns null. No real page is monitored until the owner adds it. Private worker credential remains in Vault.
- Remaining acceptance: signed-in owner interaction on the owner's real account/device, a future natural cron due run, real PaddleOCR inference and Windows GUI/hardware. Browser fixture screenshots are synthetic QA, not evidence of an authenticated production-owner session. No real customer email, booking or payment was generated.

## 2026-10-20 — Replace basic sales concept with protected Clara preview
- Owner requested the same Clara demo in Sales tools. The Demos tab now opens Clara in a full-screen dialog through the existing authenticated `tle-booking-demo-gate` `owner_preview` action. It does not require a prospect selection or a successful website scan; it preserves Clara's original branding/content and passes only the owner-selected EN/ES language.
- No private template is copied to GitHub, downloaded, renamed after a prospect or made public. Existing invitation links, public demo, customer bookings, email and payment routes are unchanged.
- Opaque sandbox retains allow-scripts/allow-forms, with no same-origin permission. Sonny's relay verifies exact frame, opaque origin, open dialog, owner-page verification and attempt/generation; it never forwards owner credentials or booking fields. Close, sign-out and stale requests clear/abort protected content. Network errors and denial expose retry.
- Regression: `scripts/qa-owner-growth-browser.mjs` exercises 360/390/820/1024/1440 EN/ES Chromium/WebKit with synthetic protected HTML, not Clara's raw source. Checks full-screen display, gate auth/action, language, denial/retry, close/late response, Sonny auth isolation, sign-out, and existing follow-up/research/reports.
- Release status: code prepared; CI and updated dedicated portal source pin/deployment must complete before production success is claimed. The private gate and Sonny also require the narrow first-party CORS correction recorded below; no customer communication is required.

### Clara integration correction — production verified
- Production private gate v37 and Sonny v25 omitted the dedicated Command Center origin; a real unauthenticated request from that origin returned a generic 403 before reaching auth. Added only `https://command.thelaunchera.com` to their existing exact-origin allowlists, deploying gate v38 and Sonny v26. Custom owner verification, JWT settings, all private templates, AI handling and other origin entries remain byte-for-byte unchanged.
- Readback of all deployed files matched the intended originals plus that one allowlist entry. Live Command Center-origin gate now returns the expected owner-auth 401 with correct CORS, and invalid Sonny input returns 400 with correct CORS. No owner credentials, private HTML, model call, booking or email was used in this check.
- `scripts/qa-owner-growth-clara-origin.mjs` adds no-send production OPTIONS/auth/input/foreign-origin checks to the existing QA workflow. This supplements the 20 Chromium/WebKit EN/ES preview lifecycle cases; real signed-in owner acceptance remains separate.
