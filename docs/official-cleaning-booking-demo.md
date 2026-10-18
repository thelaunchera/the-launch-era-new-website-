# Official Cleaning Booking Demo — 2026-10-18

## Canonical delivery
- **Request:** `https://thelaunchera.com/booking-demo/?lang=en` or `?lang=es`; this is the public intake, **not** the sample HTML.
- **Private customer view:** `https://thelaunchera.com/booking-demo-reset.html?rid=<request-id>&access=<signed-token>` after the established one-click AppDeploy confirmation and original email. Never send a raw unauthenticated sample URL to prospects.
- **Owner access:** authenticated creator-only Command Center `My Booking Demo` preview, through the same existing `owner_preview` action.
- **Protected HTML:** Supabase production Edge Function `tle-booking-demo-gate` version **28**; `booking-template.ts` is imported by its existing server-side gate. The other templates (`booking-legacy-template.ts`, `tracker-template.ts`) were left intact.
- **Editable canonical source:** PRIVATE GitHub repo `thelaunchera/the-launch-era-crm`, file `private-demos/official-cleaning-booking/index.html` (current private source version). Do **not** copy this HTML into this public repo; the server-side gate must remain the only place the full markup is delivered.

## Demo behavior
This sample is based on the owner-uploaded “Cleaning Booking Page.html” and retains its hero, four service cards, three-step flow, comparison slider, review-card marquee, FAQ and final product CTA. It uses existing approved same-site cleaner photos. Text, prices, comparison art, sample company and review cards are visibly illustrative; there is no assertion of real verified testimonials, live bookings or exact availability.

The third step collects sample name, phone, full street address (unit optional), city, state, ZIP and date. **No customer information is persisted, emailed, sent via WhatsApp, or booked by the 3-step booking form.** Completion stays local on the recipient's device. Sonny's separate, opt-in chat transmits only the text intentionally submitted to the existing `tle-ai-booking-demo` service for a demo answer; it does not transmit booking-form fields or create bookings, payments, or customer emails. The final sales CTA points at `/booking-lead-automation/`; final buyer assets, pricing, schedules and policies remain configured through the actual onboarding.

## Security boundaries
- Never expose `private-demos/official-cleaning-booking/index.html` as `public/`, a GitHub Pages asset, or an unprotected direct link.
- Access control, `rid`, consent, signed token, OTP fallback, owner JWT/workspace ownership, session expiry, tenant isolation and Resend idempotency remain owned by the existing backend gate and invitation flow.
- Do not repurpose customer-keyed Booking Pages, CB Depot, the Cleaning App, or checkout endpoints.
- Source labels and sample policies must not be presented as business facts, and sample fields must not trigger customer outreach.

## Release verification
1. Inspect private source: no `wa.me`, no booking-form sends or fabricated live-booking claims; all inline scripts parse. Sonny's separately opt-in chat uses the existing AI function directly for verified visitors or a constrained Owner-only message relay for the sandboxed iframe.
2. Confirm production gate is active at version 28 and still denies an unauthenticated/invalid request.
3. Check public `booking-demo-reset.html` is a gate shell without embedded sample HTML.
4. Verify official `/booking-demo/` still collects confirmation via AppDeploy, without live test messages or bookings.
5. Run `node scripts/qa-route-integrity.mjs --static` and relevant protected funnel tests. Use authorized test mailbox and Owner login for positive browser QA before claiming the real end-to-end email delivery is verified.

## Known pending work
The uploaded template's before/after slider presently demonstrates the interaction with **illustrative gradients**, not a verified same-property photo pair. The main demo has an English/Spanish selector and localized interface; authenticated bilingual browser QA remains pending. Final photo-pair selection, live authenticated mobile/desktop visual QA and a real authorized email test are **not** implied by code deployment.

## Sonny and animated counters (2026-10-18)
- Animate true example values 3, 4, 0 and 1 upwards when the stats enter view over ~2 seconds; reduced-motion users see final values immediately. Never imply client performance statistics.
- One floating Sonny robot/avatar bubble with "Chat with AI Assistant" launcher, discreet greeting and EN/ES panel. No auto-open.
- An opted-in Sonny message is sent to the existing AI-only function with a fresh thread. Real booking form information is NOT forwarded. The signed lead view uses direct HTTPS fetch; the Owner sandbox has an opaque origin and passes only a validated chat prompt via a tightly scoped postMessage relay in Command Center, with no private tokens, no generalized proxy and no iframe same-origin privileges.
