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

- CRM/project/support/lead counts: existing scoped internal tables; some legacy organization-wide project summaries are aggregate-only and need reviewer scrutiny for cross-tenant concerns.
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
6. Run `node scripts/qa-ai-team.mjs`, `node scripts/qa-ai-team-commands.mjs`, `node scripts/qa-ai-team-gateway.mjs`, `node scripts/qa-ai-team-ai-provider.mjs`, `node scripts/qa-jessy-owner.mjs`. Record failures and exact repro.
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
