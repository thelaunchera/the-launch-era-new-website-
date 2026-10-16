# CRM UI & Functional Upgrade — Safe implementation plan

**Status:** Phase 1 source change prepared for review, not released.
**Primary owner application:** `public/command-center/` in this repository.
**Dedicated Command Center site:** `thelaunchera/the-launch-era-command-center`; its deployment workflow currently checks out a **pinned commit** from this repository. A source change here will not become live until that separate deployment reference is deliberately updated and validated.
**Legacy/other CRM:** `thelaunchera/the-launch-era-crm` is a separate codebase. Do not assume its public pages are the new sellable CRM.

## Security and product boundaries

1. Keep The Launch Era's internal Command Center private. Owner-only modules include Idea Vault, internal AI assistants, lead prospecting, client purchase simulations, bundles, fulfillment, production QA, internal outreach, and private operations.
2. A commercially sold CRM needs its **own buyer build and protected routes**, and its own explicit feature/permission matrix. Do not ship owner-only modules in a buyer JavaScript bundle merely hidden by CSS.
3. Current Command Center code contains internal and buyer sections in a shared HTML/app script. UI hiding is not an acceptable final isolation boundary for the commercial CRM. This requires a dedicated commercial build plus server-side access controls before release.
4. For backend tables, use workspace-scoped authorization and RLS with real negative tests (buyer A cannot read/write buyer B or the owner). Verify Edge Functions independently, especially any that use service-role credentials.
5. Do not reuse the private owner's automations, assistant tools/prompts, campaign lists, operations, or production tables in the commercial product.

## Current implementation and the eight screens

| Requested screen | Existing building block | Safe next step / blocker |
|---|---|---|
| Sales Pipeline | Existing `#board` with real stages New, Contacted, Follow-up, Won; stage updates persist to `tle_crm_leads` with workspace constraint | Phase 1 adds owner-only drag gestures and visual polish; moving within a column is not persisted, because the existing lead model has no verified ordering contract. Do not substitute Qualified/Proposal/Negotiation without a migration and data reconciliation. |
| Contact Profile | `#editor` drawer with Overview/Emails/Notes, lead details | Compose the new profile view around existing real actions and events. No fabricated online-presence dot, deal amounts, or audit timeline. |
| Lead Management | Existing filter/search, lead stage and contact restrictions | Add optional table view based on real lead columns; do not invent scores or ownership assignments. Respect outreach opt-out rules. |
| Unified Inbox | Website inquiries, existing email event history and contact interactions | Cross-channel thread only after verified Email/SMS/Chat provider integrations. WhatsApp tables are staging only; do not activate or invent incoming messages. |
| Email Sequence Builder | Real outreach email/follow-up settings and records | Requires distinct step definitions and sending rules. No timer-generated replies or sample metrics. Preserve consent, unsubscribe, bounce and stop rules. |
| Booking Calendar | Buyer booking calendar, owner client calendar, availability and request flows | Preserve owner-vs-buyer semantics. Add week scheduling view only after event normalization, timezone and overlap verification. |
| Sales Forecast | No verified CRM deal value, probability and quota schema | **Blocked pending a real deal/amount model.** Never compute fictitious revenue from lead counts. |
| Tasks & Follow-ups | Lead follow-up dates and calendar; separate owner AI Team task system | Add normal CRM task ledger and permissions independently of private AI Team. Avoid duplicate auto follow-ups. |

## Phase 1 changes (this branch)

- New `public/command-center/assets/crm-ui-upgrade.css`: isolated `body.crm-owner-view` styling for the existing owner pipeline, selected navigation, owner lead drawer and mobile horizontal board.
- New `public/command-center/assets/crm-pipeline-enhancements.js`: accessible drag handle and keyboard arrow stage moves. It calls the **existing** `select onchange` handler, which executes the authorized workspace-scoped database update. This module does not store local fake records or make its own direct database calls.
- Update `public/command-center/index.html` to load these two assets.
- No buyer brand, payments, data, Edge Functions, workflow configuration, dedicated-portal pinned commit, or database schema changed.

**Important limitation:** Pointer drops currently change **stage only**. The reference prompt's arbitrary intra-column reordering and full FLIP of all neighbors require persisted order fields plus transactional update semantics and browser QA. Do not claim those are implemented.

## Required verification before publication

- Run `node scripts/qa-crm-ui-phase1-static.mjs`.
- Execute browser interactions with actual authorized sessions for owner and two isolated synthetic buyer workspaces. Check keyboard stage updates, pointer/touch drag, denied/failed saves and refresh persistence.
- Test at 375, 768, 1024 and 1440px widths; check Safari phone/tablet plus desktop browser.
- Confirm opt-out restrictions on any lead stage changes and absence of duplicate emails or notifications.
- Confirm owner-only enhancements do not execute or alter layout in customer workspaces.
- Inspect Supabase RLS and Edge Function authorization on a **testing project**; do not assume a hidden sidebar secures any endpoint.
- After approval, update the separate dedicated Command Center repository's pinned source **only in a reviewed release**; run its existing build and Playwright QA suite. Keep rollback SHA.
- Do not ship the future commercial CRM until it is an owner-free build with independent buyer auth/role tests.

## Rollback

Remove the two phase-one asset tags from the Command Center HTML or revert the branch. Original `command-center-app.js`, its persisted actions, and the deployed dedicated Command Center are unchanged by this branch.
