# Owner sales tools

The owner can now research a public business page, schedule the next internal follow-up, prepare an interactive private demo concept, watch public page text and export source-backed reports from one authenticated workspace. Existing lead, consent, email and customer booking flows remain authoritative.

## Entry and behavior

`/command-center/sales-tools.html` uses the existing `tle-crm-auth` session. An owner-only shortcut is mounted in the Command Center header; the AI Team also links to it. Every backend action validates the Auth user, platform-admin record and that user's unique internal workspace. The browser cannot choose a workspace or owner ID. Sign-out clears loaded data and the demo iframe.

- **Next actions:** existing CRM lead/date and recent recorded email events. Saving a date and its audit is one transaction with an expected-date concurrency check. Replied, archived, won, opted-out and failed-email leads cannot be rescheduled through this shortcut. It does not authorize or send mail.
- **Research & basic SEO:** bounded single-page HTTPS HTML inspection with public-IP-pinned TLS, robots rules, strict size/deadline, no redirect/query-token forwarding, no JavaScript execution and no LLM. Stores the source URL, timestamp, observations and limitations. Missing HTML evidence is never labeled a broken feature. Published emails remain unverified. Fresh identical research is reused for five minutes.
- **Demo concepts:** an original bilingual TLE concept template. Business name and user-supplied services are escaped; preview uses an opaque sandbox and a CSP denying connections and form submission. Three-step service/date/review sample, reset, approved illustrative photos, no fake reviews, prices or customer results. Download is private; nothing is published or emailed. The existing Clara source/access gate is not reused.
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
- Browser/CI and production verification must be recorded separately. Local Playwright browser downloads were blocked; the GitHub workflow runs Chromium and WebKit responsive EN/ES tests without real customer/provider calls.

No marketing emails, client bookings, charges, lead imports or automatic AI external actions are authorized by this feature.
