# INCIDENT_LOG.md — failures, root causes and regression checks

**Convention:** ✅ corrected and verified; 🟡 reported/partial verification; 🔴 open. Every item must name source/destination and protect unrelated tenants. Information before 2026-10-12 may be based on earlier project work; inspect current code before assuming the fix is live.

| Date | Incident / impact | Root cause or finding | Safe fix / verification | State |
|---|---|---|---|---|
| 2026-10-12 | Cleaning Soflo sees **"We couldn't confirm your request — connection interrupted"** after clicking consent | \`tle-crm-interest\` browser POST returned HTML **without CORS response headers**, although the database recorded authorization | Added CORS to all generated HTML responses, retained OPTIONS handler; verified Supabase function version 11 live, production consent in \`tle_crm_leads\` authorized. Regression: browser OPTIONS + invalid POST, then fixture two-step consent | ✅ backend fixed; end-to-end new-browser fixture still mandatory |
| 2026-10-12 | Authorized Cleaning Soflo did not enter personalized-demo queue | \`tle_crm_email_events.event_type\` CHECK excluded \`interest_confirmed\`, \`confirmation_sent\`, \`demo_queued\` and other actual workflow event types; downstream insert failed silently | Migrated allowed event values; checked provider acknowledgment delivered; recorded event and created one demo row for this lead; NO duplicate email | ✅ |
| 2026-10-12 | Demo was delivered, CRM marked \`needs_review\` and no follow-ups | Worker required an immediate Resend GET after successful send; provider eventual consistency produced a false negative | Verified delivery of Resend message for Cleaning Soflo, reconciled \`personalized_demo_requests\` to \`sent\`, and \`demo_sent\` event; worker accepts valid provider 2xx + ID, later delivery tracked asynchronously | ✅ |
| 2026-10-12 | Consent changed but UI errored while follow-ups showed canceled | Existing automation canceled pre-consent follow-up rows upon confirmed interest; the demo step did not create/re-activate them | Once actual demo delivery verified, restored only the two authorized steps, 3 and 7 days after demo, without duplicates. Stop if replied/withdrawn/bounced | ✅ this case; regression fixture needed |
| 2026-10-12 | Prospect outreach flagged delivered at provider, CRM only \`email_sent\` | Resend webhook event ID was buried inside a longer description; CRM lookup didn't match | Normalize provider message IDs and reconcile event by id; never classify "sent" as "delivered" without provider confirmation | 🟡 inspect current webhook across future sends |
| 2026-10-12 | Someone did not see the first outreach email in Inbox | Resend marked \`delivered\`, not opened; Gmail Spam/Promotions placement invisible to provider | Verify recipient, SPF/DKIM (verified), suppressions, spam, and actual provider event. Do not blindly resend | ✅ sender verified, inbox placement beyond provider visibility |
| 2026-10-12 | CB Depot password reset opened the marketing landing / 404 | Stale auth redirect and mismatched \`/auth-recovery\` routing to website landing; possible old Command Center URLs | Canonical \`/auth-recovery.html\` plus \`/auth-recovery\` alias, session/token check and return to \`/command-center/\`. Live entry page load verified; real-token regression QA required | 🟡 |
| 2026-10-10 | Valid CB Depot activation links rejected | Token validator assumed fixed 64-character token length; not all valid invitations matched | Update token parsing based on token type and authentic provider data. Test invite and activation, including expired token and multi-device | 🟡 check fixture |
| 2026-10-11 | CB Depot favicon/logo appeared while TLE Command Center loaded | A CB Depot icon was used in shared startup/activation UI | Default to TLE logo; select per-tenant icons only after identity resolution; verify login loading on iPhone and desktop | 🟡 cache and tenant regression |
| 2026-10-10/12 | CB Depot customer detailers treated like generic cleaning customer; wrong legal/confirmations | Shared templates weren't always tenant/industry scoped | Resolve workspace/client business before template, favicon, legal, email and customer confirmation. Keep car-detailing specific. Test real tenant A vs fixture B. | 🟡 continue regression |
| 2026-10-11/12 | CB Depot approval/review links should not be permanent / out-of-scope | Review token and approval flow not fully isolated from permanent Test Center; revision counter per service | Show approve/request-changes only during delivery review; test 1 Booking revision, 2 AI revisions; leave permanent Test Center for self-tests/pricing changes | 🟡 |
| 2026-10-12 | Website responsive browser QA jobs failed repeatedly | GitHub Actions \`Website Responsive QA\` and \`Original Booking Base QA\` reported failures; cause varies per run (deploy-sync/hash wait or browser assertions), don't equate deployment success with test pass | Inspect latest failing job log, classify infrastructure-vs-product, fix test and underlying bug, rerun until green. Keep reports/screenshots | 🔴 verify workflow green |
| 2026-10-12 | CSS asset \`tle-editorial-refresh.css\` referenced but reportedly missing | Broken static CSS reference can cause 404 and visual regression | Static route-asset checker must verify every \`href/src\` asset exists; verify live network and remove or add missing asset only with matching design review | 🟡 inspect exact currently deployed reference |
| 2026-10-12 | Command Center/Booking UI compressed on desktop, sidebar vanishes on Calendar, tablet overflow | Layout breakpoint/width and shared sidebar behavior, potentially CSS/shell regressions | Test 360/390/820/1024/1440; preserve sidebar for every view, center greeting card, no empty footer/overlaps; compare tenant-specific hero crop | 🟡 |
| 2026-10-12 | AI Jessy routes user to Help instead of acting; navigation/focus issues | Agent action capability or UI routing not joined to authorized owner actions | Verify permissions for mark-read and navigation on all Command Center modules; no fake action claims; graceful fallback only when genuinely unauthorized | 🟡 |
| 2026-10-12 | Checkout and pricing legacy code references integrations user no longer wants | Active page code may still contain obsolete checkout handlers | Audit actual checkout with approved payment method and service list before next live purchase; avoid changing existing paid client transaction records | 🔴 product owner validation required |

## Queue snapshot: 2026-10-12 after Cleaning Soflo repair
- Production \`personalized_demo_requests\`: **9 sent**, **0 queued**, **0 processing**, **0 failed**, **0 needs_review**.
- Two \`test_demo_scheduled\` records remain from the owner's internal test mailbox, not real prospects. Do NOT send or convert to production automatically.
- Cleaning Soflo first contact → consent confirmed → acknowledgment delivered → original demo delivered → CRM \`sent\`, exactly two follow-ups (Oct 15 and Oct 19). No need to click permission again.
- Test project \`afyiltvdfqnuyzcqsnoh\` did not have the same demo tables at check time; do not confuse absence of tables with empty production queues.

## Mandatory SQL diagnostic (read only)
Run against production only with authorized connection:
\`\`\`sql
SELECT status, count(*), min(created_at) AS oldest
FROM public.personalized_demo_requests
GROUP BY status ORDER BY status;
SELECT id, business_name, status, created_at, sent_at
FROM public.personalized_demo_requests
WHERE status IN ('queued','processing','failed','needs_review')
ORDER BY created_at;
\`\`\`
For every aged/failed row compare provider Resend email ID and recipient, event log, worker attempts, and consent **before** any repair. Do not replay send API if already delivered.

## How to write new entries
Date | Tenant(s) impacted | actual steps | expected vs observed URL/state | file/function root cause (verified vs hypothesis) | minimal change | browser/provider/db evidence | regression guard | status/owner. Never save token values, personal customer info or credentials.
