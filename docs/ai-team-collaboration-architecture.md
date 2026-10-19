# The Launch Era — AI Team: shared specialist handoffs (review branch)

**18 October 2026.** This document describes the change proposed in the isolated GitHub branch, NOT a live deployment or a completion certification.

## Already in the system

- Supabase production `tle-ai-team`: owner-only JWT, platform-admin and internal-workspace verification; seven role prompts; read-only specialist checks; AI-generated or template fallback drafts; owner-reviewed output ledger.
- Existing tables: `tle_ai_team_tasks`, `tle_ai_team_outputs`, `tle_ai_team_events` and `tle_ai_team_runs`. The same-task output ledger is the bounded short-term **shared context**. It is not proof of a persistent long-term memory service.
- Edge AI provider: Groq when configured, with fixed-template fallback on provider failure. An approval of a draft is not authority to send or publish.

## Phase 1 in this branch

A button on each active owner task requests two specialist drafts, based on the assigned lead specialist:

| Lead agent | First reviewer | Second reviewer |
| --- | --- | --- |
| Jessie | Projects | QA |
| Sales | Creative | QA |
| Projects | Developer | QA |
| Developer | Projects | QA |
| QA | Developer | Projects |
| Creative | Sales | QA |
| Care | Projects | QA |

The second reviewer receives a bounded excerpt of the first review, labeled **unverified**. Both receive the same task title and context. Existing recent outputs on the same task may also be used as untrusted suggestions. Each generated output is saved as **draft** in the current owner/workspace; each is reviewable individually and never executed. A repeat within 90 seconds reuses the recent role draft. External actions remain prohibited.

This is **coordinated drafting**, not autonomous execution. The system has no delegated access to ChatGPT's connected Gmail, Drive, Metricool or GitHub accounts. Agents never automatically send marketing emails, modify bookings, change prices, publish, deploy or process payments.

## Future phases — not enabled by this branch

**Verified knowledge (RAG):** establish owner-approved, dated source snapshots with document IDs and citations for FAQs, product offers and approved standard operating procedures. Query only source collections with matching workspace permissions. Surface unknown facts explicitly; no unsupported claims of semantic retrieval or citations now.

**Skills:** versioned repository instructions for briefs, design, QA, developer handoffs and client delivery; pin revisions per project and keep independent QA instructions read-only.

**MCP:** only vetted tool servers with short-lived scoped grants, allowlisted methods, tenant-aware authentication and action logs. Never reuse owner credentials in buyer sessions. Connector availability in a ChatGPT chat does not grant backend credentials.

**Memory:** store structured decisions and approved outcomes only with retention limits and source provenance, scoped by owner/workspace/task. Drafts may inform subsequent drafts but must not become authoritative records without review.

**Release actions:** require explicit per-action approvals and a different execution adapter, permission checks, idempotency keys, transactional audit events, dry-run preview, rollback and separate independent QA. Do not flip `AI_EXTERNAL_ACTIONS_ENABLED` until each adapter passes these gates.

## Acceptance tests before production

1. Run `node scripts/qa-ai-team-collaboration.mjs` and existing AI Team QA suites on the exact PR SHA; inspect the test logs.
2. Authenticate owner on desktop, iPhone Safari and tablet in EN/ES. Create a **synthetic** task, choose collaboration, verify two distinct reviewable outputs and that QA incorporates previous role's proposal as unverified context.
3. Verify nonowner/unauthenticated/cross-workspace requests and unauthorized origins are denied. Do not use real client PII or actual emails.
4. Confirm a fast duplicate request does not create extra drafts. Review and reject an individual output; nothing should be sent or published.
5. Recheck AI provider failure and ensure a template is transparently labeled; no silent fallback cost or unsupported success claim.
6. QA prior booking, sign-in, tenant isolation, payment and owner alert flows remain unchanged. Record outcome and rollback proof.
7. Only after review of the daily change queue and independent QA, merge/deploy the approved Edge Function and Command Center web asset; confirm live versions and browser results separately.

**Rollback:** revert the feature PR, redeploy ONLY `tle-ai-team` and the AI Team web asset; preserve customer and task rows. No database migrations are included.
