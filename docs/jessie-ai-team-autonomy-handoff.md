# Jessie / AI Team — Implementation handoff for independent QA

Tracking: [Issue #56](https://github.com/thelaunchera/the-launch-era-new-website-/issues/56)

**Ownership:** Implementation agent changes application code on one PR. A separate independent QA chat validates the PR before merge/production release. This document is a proposed build contract, not proof of successful tests.

## Implemented in this branch

1. `tle-jessy-owner`: owner bubble now uses the same provider precedence as `tle-ai-team` — GroqCloud via existing `GROQ_API_KEY` (`openai/gpt-oss-120b`) with OpenAI fallback only when Groq is not configured. Never expose key values in client responses or logs.
2. `tle-ai-team`: `team_brief` provides one server-authenticated, **read-only** review of Jessie + six specialists; returns scoped CRM counts, factual summaries, explicit partial coverage and limited actionable priorities. No recipient PII in the report. Does not create tasks, change clients, send messages, edit scheduled posts or deploy code.
3. `tle-jessy-owner`: brief request is forwarded to the canonical AI Team endpoint using the original authenticated owner JWT, where owner/\`platform_admins\`/internal-workspace validation runs again. No service-role token is forwarded to the browser. A short summary can be requested from the Jessy bubble on any owner page.
4. Private AI Team screen: one new responsive overview showing source-backed priorities, per-agent reports and partial/unavailable states. "Review my workspace" triggers this operation. The Jessy bubble's Today’s priorities shortcut uses the same briefing.
5. `capability_manifest` returns server-authenticated risk/permission tiers and explicitly disables all AI external side-effect actions.
6. A dedicated `deploy-jessie-owner.yml` GitHub workflow is added for the owner bubble; `deploy-jessie-ai-team.yml` already exists for AI Team. Both deploy only their named Edge Function and require GitHub's existing `SUPABASE_ACCESS_TOKEN` secret.
7. Browser cache versions changed for the private owner screens, so Safari loads current JS/CSS.

## Risk levels and authority

| Operation | Risk tier | Authorized capability |
| --- | --- | --- |
| `list`, `scan`, `team_brief`, `run_agent`, `provider_check`, `capability_manifest` | Read-only | Owner JWT and internal workspace checks |
| `plan`, `compose_output` | Draft-only | Owner can inspect generated content before any use |
| `create`, `assign`, `status` | Internal task state | Owner controls changes; not externally executed |
| `review_output`, `approve`, `complete` | Owner review/evidence | No email, post, checkout, delivery or deployment |
| Email sending, content publishing, Drive writes, client mutations, payments, app deployment | **Disabled** | Requires separate approved per-action implementation; no hidden blanket permissions |

**Kill switch:** `AI_EXTERNAL_ACTIONS_ENABLED=false` in `tle-ai-team`. All external execution adapters remain absent by design; merely approving a draft never sends or publishes it.

## Integration inventory (be honest about source access)

- CRM/project/support/lead counts: workspace-scoped internal tables. Booking projects require `tle_booking_flow_accounts.crm_workspace_id` to equal the authenticated internal workspace. Legacy AI orders lacking an enforceable workspace relationship are intentionally unavailable; never imply an unlinked order does not exist. Support requests require `workspace_id`. The original Jessy client-readiness endpoint is scoped the same way.
- Website/QA: HTTP GET probes only. Do not present them as browser E2E tests.
- GitHub: public commit / CI metadata checks only, not source edits by agent.
- Resend: **not connected directly to the AI Team production Edge Function**.
- Metricool: **not connected directly to the AI Team production Edge Function**.
- Google Drive: **not connected directly to the AI Team production Edge Function**.
- ChatGPT may access its separately connected apps; those permissions are not automatically delegated to the website backend. These last three integrations are deliberately non-operational pending scoped authorization, opt-in and independently verified fixtures.

## Independent reviewer test plan (not yet executed)

1. Verify server rejects anonymous and nonowner JWT on both functions; expired token / wrong tenant / CORS unauthorized origin return safe errors. Confirm no personal client data leaks in `team_brief`.
2. For EN and ES, run "Review my workspace" and "Today's priorities" from owner landing, AI Team standalone, Safari/iPhone and tablet/desktop. Check no overlap, cut-off controls, broken links or duplicate stacked summaries.
3. Confirm a single click triggers one read-only briefing. Verify seven reports, no recipient addresses, and partial/unavailable values are not displayed as zero or false passes. Check malformed/error responses.
4. Confirm `GROQ_API_KEY` resolution via existing secret and no fallback to OpenAI billing when Groq is configured but returns an error. Test one short owner question without fabricated metrics.
5. Verify existing controlled owner notification operations and WhatsApp preference-only methods were not modified; no unauthorized emails, WhatsApp sends, publication or checkout.
6. Run `node scripts/qa-jessie-unified-tenant.mjs` and `node scripts/qa-ai-team.mjs`, `node scripts/qa-ai-team-commands.mjs`, `node scripts/qa-ai-team-gateway.mjs`, `node scripts/qa-ai-team-ai-provider.mjs`, `node scripts/qa-jessy-owner.mjs`. Record failures and exact repro.
7. Review GitHub Actions before rollout. Confirm new function deploy is isolated, that `tle-jessy-owner` preserves current manual JWT checks and `--no-verify-jwt` gateway configuration, and the AI Team function retains `verify_jwt=true`.
8. Confirm rollback is possible by reverting only the PR and re-running both dedicated deploy workflows. Existing DB rows and customer instances must not be rewritten.

## Deferral / next PRs, requiring explicit permission and fixture QA

- Scoped, read-only Resend delivery/engagement analysis with safe counts, consent/suppression, reply checks.
- Metricool scheduled-post comparison and staging edits, with stable post IDs, image order and idempotent approval; **no auto-publication**.
- Drive asset retrieval via a private OAuth grant with folder-bound permissions; avoid access to unrelated client files.
- Owner-initiated, duplicate-safe task creation from evidence-based priorities; no surprise task spam.
- GitHub issue triage and QA defect proposals with independent release gate; no autonomously merged code.
- Client intake reminders and production-gate emails, only after contact scope, approval and idempotency E2E.

**Release gate:** PR must receive independent QA verdict on issue #56; only then merge to `main` and verify actual Supabase function versions and browser behavior. This implementation alone does not meet all autonomy acceptance criteria.


## 2026-10-14 implementation update: owner diagnostic and verified partial priorities

- Owner-only AI Team now has a responsive session verification panel. It calls `capability_manifest`, `team_brief` and `provider_check` with the owner's **existing** authenticated session; it does not show/export JWTs, client records, email addresses, API keys or tenant IDs. The optional copied QA summary contains only booleans, provider label, number of agents, coverage and viewport width.
- Jessie backend considers a trustworthy field independently from overall report coverage: a workspace-linked Booking account with missing intake still produces a Projects review priority even if unrelated legacy AI orders cannot be mapped. Similarly, a failed website GET is an observed negative check and can produce a QA route-priority while the report remains partial. The fields are constrained to explicit source labels; unavailable/null facts do not trigger false priorities. These counts do not certify client delivery or full browser QA.
- `tle-jessy-owner` now leaves unlinked website inquiries and legacy AI order counts as **null/unavailable** instead of reading platform-global aggregate records inside an owner-specific chat.
- New fixtures `scripts/qa-jessie-tenanted-edge-fixture.mjs` and `scripts/qa-jessie-owner-edge-fixture.mjs` execute actual Edge Function source under isolated mocked requests: two independent authorized workspaces, a nonowner, an invalid token/origin, 1 missing intake, 1 failed URL, an unavailable project source and Groq provider success/failure without OpenAI fallback. No live client records or secret values are involved.
- `scripts/qa-jessie-owner-diagnostic.mjs` checks functional UI handlers and confirms the copied QA report excludes simulated sensitive fields.
- Implementation agent also executed the in-memory fixture logic in isolation and observed PASS for both Edge source handlers. This is **not** an authenticated production E2E or an independent review verdict. GitHub Actions results must be tied to the exact PR head; do not infer green CI status from an earlier SHA.

### Owner verification after independent release approval

Open `/command-center/ai-team.html` while signed in as the internal owner; select **Verify my session / Verificar mi sesión**. Expect four separate indicators (owner session, seven agent reports, disabled external actions, live Groq answer). **Copy sanitized QA report** provides non-sensitive evidence for issue #56. Repeat in English and Spanish and on iPhone Safari, iPad and desktop; screenshots must not reveal private clients. Independent QA still must test unauthorized accounts and cross-workspace denial separately.

The PR remains subject to issue #56 approval and isolated release/rollback checks. No Resend, Metricool, Drive, payment or publish execution is enabled.
