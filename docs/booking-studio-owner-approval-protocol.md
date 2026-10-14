# Booking Studio · Owner approval and handoff protocol (STAGING)
**Status:** QA-only blueprint. No client delivery, emails, production releases, paid-order creation, or external website changes are authorized by this document.

## 0. Eligibility gate — verified purchase, never a simulated sale
- Source: actual paid Booking Page order linked to a unique client workspace, verified intake and explicit owner start approval.
- Match `order_id`, `verified_tenant_id`, business identity, contact email, services, pricing modes, areas, and booking policy.
- **Reject** unpaid, incomplete, cross-tenant, duplicate, delivered or fabricated purchases. Never substitute synthetic fixtures for a real paid order.
- Assign an internal job and immutable audit history. The client cannot see the owner's AI Team.

## 1. AI Research — source-backed client brief
- Review client-submitted intake, public website/social profiles and brand assets where access is lawful.
- Record URLs, verified facts, unverified claims, unknowns and a follow-up question list. Do not infer reviews, credentials, prices, licenses, team photos or service regions.
- Preserve the client's voice, service area and sector. Keep customer information tenant-scoped.

## 2. AI Creative — individual design, not a generic skin
- Provide a distinct hero composition, type system, contrast-safe palette, service cards, section order, human headline and supporting copy.
- Use photos licensed by the business or from an authorized library. Record each image's license/rights.
- Explain **why** this specific composition suits the business. Reject copy-paste layouts and generic text; never overwrite the business's identity with TLE branding.
- Client-facing copy in English unless the verified intake specifies otherwise; check English/Spanish parity when both are requested.

## 3. AI Developer — isolated private build
- Build from the versioned Booking Page master, not the public marketing demo.
- Bind only the verified client's services, price/quote modes, frequencies, add-ons, zip/service-area rules, estimated-price disclosure and consent.
- Do not expose owner-only AI Team, owner service keys, another client's data, checkout internals, or production tokens.
- Save source commit and a private preview identifier. No publishing, email or customer access at this stage.

## 4. AI QA — evidence for all 18 gates
- tenant isolation; verified payment; verified intake; image rights; brand accuracy; no invented claims;
  services/prices; booking versus quote; frequency/add-ons; service area; email permissions;
  working links; phone; tablet; desktop; accessibility; EN/ES; customer data protection.
- Each passing gate requires specific evidence (test result, screenshot or trace); a missing or failed gate returns to Developer.
- Test at least phone 390 px, tablet 768–1024 px and desktop 1440 px. Check no horizontal overflow, cropped CTAs or consent, unusable form fields or broken images.
- Test request-a-quote separately from bookable services; confirm no real confirmation, email, payment or customer record is created by synthetic tests.

## 5. Jessie → owner review (private)
- Jessie summarizes verified facts, design rationale, exact changes, screenshot links, QA evidence and unresolved questions.
- Owner actions: **Approve private design** or **Request changes** with required notes.
- Request changes returns the project to Creative, then Developer and full QA. Prior QA approval does not carry over to a changed build.
- Approval is recorded with verified owner identity and timestamp; it does **not** publish or notify anyone.

## 6. Release is a separate authorization
- Only after private approval, confirmed tenant isolation, a current successful QA run and **a second explicit owner publish authorization** may the release adapter be considered.
- Verify the buyer's assigned Command Center URL, private sign-in, recovery, 12-hour policy, service links and legal/consent before any release.
- Never route a buyer's Command Center to thelaunchera.com or command.thelaunchera.com; use the tenant-assigned destination.
- Customer handoff and operational emails require separate approval and idempotency checks; no duplicates.
- Keep an audit record of deployment, rollback route, release time and who approved it.

## Revision and failure rules
- Owner request for changes: send back to Creative with precise notes; re-build and re-run every QA gate.
- QA failure: send to Developer, block owner approval until a new passing QA result.
- Stale payment/intake, tenant mismatch, missing photo rights, or any unverified claim: block forward progression.
- Preview and Testing pages: noindex, private, synthetic only; never become a client deliverable.
- Client revision allowances, if applicable, are governed by the specific paid service agreement; do not silently grant or consume customer revisions through an internal owner QA cycle.

## Definition of done
A private, customer-specific Booking Page design exists; evidence-backed research and licensed assets are recorded; all 18 QA gates pass on current build; Jessie presents the result; owner privately approves it. **Production release and customer notification remain disabled until separately authorized.**
