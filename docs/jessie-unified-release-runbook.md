# Jessie unified Command Center — controlled release and rollback

Coordination: [issue #56](https://github.com/thelaunchera/the-launch-era-new-website-/issues/56). Active candidate: [PR #60](https://github.com/thelaunchera/the-launch-era-new-website-/pull/60). This is an operator checklist, **not a release authorization**.

## Verified baseline before any release (2026-10-14)

- Supabase project `bowacxhmjvrqixtwaikv`: `tle-ai-team` **v27 ACTIVE**, gateway JWT verification enabled; `tle-jessy-owner` **v17 ACTIVE**, gateway JWT verification disabled but owner JWT validated in function code. Neither has unified `team_brief`.
- Hosting of `thelaunchera.com` is GitHub Pages via `.github/workflows/pages.yml`, building `.output/public` with Bun and publishing `CNAME=thelaunchera.com`. A legacy Cloudflare Workers preview check is **not** hosting verification.
- Candidate contains seven-agent read-only briefing, owner-safe diagnostic, Groq preference, workspace-scoped data, and no direct Resend/Metricool/Drive actions. `AI_EXTERNAL_ACTIONS_ENABLED=false`.
- Test types are distinct: signed-off **source/static/fixture/CI** versus unverified **real authenticated browser/provider/other-tenant** evidence. Passing CI is not permission to deploy.

## Release blockers / evidence required from independent QA

1. Record explicit **PASS for PR #60's exact head SHA** in issue #56. Capture the green *Private AI Team QA*, *Smart Welcome Booking QA* and *Jessie GitHub Pages Release Build QA* runs on the same commit. Confirm the PR is still mergeable with the latest main and there is no overwrite of Smart Welcome.
2. Test an **owner-authenticated preview/staging environment** using the proposed code, not current production v27/v17. Confirm 7 reports, one-click briefing, owner diagnostic `capability_manifest`, strict `external_actions_enabled=false`, successful real Groq response, and safe provider-unavailable behavior. No test accounts / preview are yet provisioned; this is genuinely **pending**.
3. Run negative owner/nonowner/cross-workspace tests against the **proposed/staged code**, not just mocks. Do not use real client names, emails, passwords or tokens in issue comments. Without safe staging accounts, mark as blocked, not passed.
4. Independent browser QA on real iPhone/Safari, iPad/tablet and desktop: EN/ES, responsive cards, sidebar visibility, no overflow, accessible buttons, action labels, logout and re-login. Check the current site as baseline but do not claim it validates branch-only UI.
5. Confirm the production release window and rollback owner. Do not merge while any criterion remains unverified.

## Controlled production sequence — *only after* explicit release approval

1. Capture current `main` SHA, both deployed Supabase version IDs and `verify_jwt` settings in a private release log. Keep the pre-merge code in Git history for rollback; never copy API secrets into artifacts.
2. Merge approved **PR #60** normally; never force-merge or disable branch protection. Abort and re-review if `main` changed in ways overlapping the release.
3. Confirm `Deploy Jessie AI Team to Supabase` succeeds, reports a version above 27, and the running function includes `team_brief`. If `tle-jessy-owner` deploys first due to independent workflow scheduling, do **not** mark the full release healthy until both new backend versions are active; the owner briefing may temporarily return 503. Do not send or publish during the transition.
4. Confirm `Deploy Jessie Owner Bubble to Supabase` succeeds, reports a version above 17, and includes delegated `ownerTeamBrief`. Confirm its gateway setting remains `verify_jwt=false` with internal JWT checks. `tle-ai-team` must remain `verify_jwt=true`.
5. Confirm `Deploy website to GitHub Pages` succeeds on the merge SHA, including live `/command-center/` and `/command-center/ai-team.html` HTML/assets. No dependence on Cloudflare.
6. Repeat the signed-in owner diagnostic and seven-agent read-only briefing in EN/ES on iPhone, iPad and desktop; confirm real Groq provider and no false claims. Record only redacted `Copy sanitized QA report` output.
7. Check one representative existing client workflow and Smart Welcome with non-mutating observations, and check no external emails/posting/checkouts occurred.
8. Record the precise version IDs, SHA, independent reviewer verdict and actual browser outcomes in issue #56. Only then call the release complete.

## Rollback if any check fails

- Stop rollout/disable further dispatch. Do not delete customer rows or reset CRM data.
- Revert **only Jessie release changes** from the merge using GitHub revert/cherry-pick as appropriate; preserve intervening unrelated commits and Smart Welcome changes. Run the repo's QA. Push the approved rollback as a normal PR to `main`, which triggers the normal GitHub Pages and two Supabase workflows.
- In Supabase verify the **deployed source** of both Edge Functions is the restored pre-release code, not simply a version number; version IDs increment even on rollback. Confirm `tle-ai-team` still has gateway JWT validation and `tle-jessy-owner` still has internal owner JWT validation.
- Check GitHub Pages restored scripts, private signin and recovery routes, and a no-side-effects owner check. Record incident, root cause and rollback SHA in issue #56. Avoid claiming full recovery until both backend functions and Pages are verified.
- If one backend deploy succeeded and the other failed, avoid toggling unrelated services. Roll back the affected function using the last known-good `main` source and its isolated deploy workflow; verify the functioning pair.

## Postrelease scope deliberately NOT included

No autonomous sending, publishing, client updates, charges, code merges, Drive file edits, or authorizations transferred to external systems. Resend, Metricool and Google Drive production connectors require a separate reviewed authorization+consent+idempotency integration.
