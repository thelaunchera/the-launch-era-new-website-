# Smart Welcome — Booking Pages (release proposal + implementation)

**Status (2026-10-14):** production schema (additive, default-off) and `tle-booking-smart-welcome` Edge Function deployed and verified with read-only authorization/CORS smoke tests; frontend is awaiting release in feature PR #58. CB Depot detailing introduction saved as a disabled draft. No other customer enabled; no discounts created.

## Existing architecture verified 2026-10-14
- Public buyer entry: /booking/?key=<opaque UUID> redirects to /base-booking.html with key.
- /base-booking.html loads /assets/booking-template-live.js, whose public source is the release-gated \`tle-booking-flow-pricing\` Edge Function.
- Pricing, service catalog, opening hours, real lead submission, tracking and customer contact flows are independent of welcome content.
- Owner Command Center buyer dashboard displays \`buyerBookingShareCard\` only after final delivery and verifies the public booking link.
- Different Cleaning App \`public-welcome.js\` is an after-booking Welcome Packet — intentionally unchanged.
- Legacy Cleaning App \`booking_discounts\` are a different product/database flow and MUST NOT be treated as buyer Booking Page discounts.

## New files
- \`public/assets/booking-smart-welcome.js\` and \`.css\`: optional public presentation. Fetch failure, unpublished account, missing offer or inactive setting never blocks booking.
- \`supabase/functions/tle-booking-smart-welcome/index.ts\`: public read verifies released account + campaign window. Authenticated get/save verifies Auth user, workspace ownership, delivered account, and password sign-in when required.
- \`docs/smart-welcome-schema.sql\`: additive schema, service role only, RLS enabled, zero data migrations.
- \`public/command-center/assets/booking-smart-welcome-editor.js\` and \`.css\`: per-buyer editing only from a verified, delivered Booking Page link.
- \`scripts/qa-smart-welcome.mjs\`: static safety and syntax gate.

## Visitor behavior
1. First visit in this browser: optional, easily dismissed editor-approved welcome with business photo/logo and actual promotion terms; never claims a discounted booking price.
2. Returning browser: no automatic interruption; compact offer card beneath the hero. No fingerprinting, analytics cookies, or personal identification.
3. Deep link to #booking: only the compact card.
4. Disabled / expired / unpublished / blocked request: original Booking Page unchanged.
5. CTA goes to existing #booking on the same page. No changes to form fields, quote flow, submissions, service selection, lead or payment logic.
6. Responsive at 360, 390, 768/820, 1024, 1440 and keyboard accessible: Escape/close/skip, focus handling, Tab cycle, reduced-motion safe.
7. Spanish and English text; fallback to English; do not mix with the Cleaning App's four-language Welcome Packet.

## Promotion rule — deliberately limited in v1
Promotional copy is editorial only. A discount is NOT calculated, validated, or redeemed by this new function. An owner who advertises a deal must supply eligibility/expiration terms; requests continue through the existing price/quote flow. A future phase can add *separate*, fully tested price/quote discount logic with ledger, use limits and expiry, reviewed for each tenant. Do not claim a displayed percentage has automatically been applied.

## Before production
1. Review branch diff against main; reconcile concurrent agent changes before merge.
2. On the **testing** Supabase project only, inspect existing accounts and apply reviewed additive schema to a fresh fixture, using a real migration procedure (not the docs SQL as an untracked production edit).
3. Deploy Edge Function to testing, with verification config matching prod, and ensure access is allowed for the website's origin. Test OPTIONS and unauthenticated invalid POST.
4. Test unauthenticated public access with (a) absent key (b) invalid UUID (c) unpaid account (d) paid-but-unreleased account (e) released fixture with no welcome record (f) enabled fixture with active window (g) expired fixture. Verify response never leaks customer or workspace data.
5. Create two **test** owner workspaces, authenticate them, verify buyer A cannot read/update B even when passing B's ID; verify password account requires password AMR and owner-only override.
6. Test owner edit, publish, disable, date schedule, image fallback, bad URL, missing promo terms, mixed EN/ES and refresh.
7. Browser QA on widths 360, 390, 768, 820, 1024, 1440; iPhone/Safari and Android Chrome; keyboard/ESC, no scroll trap, sidebar intact; ensure prices, quotes, bookings, existing appointment link and notifications unchanged.
8. Test fixture bookings and quotes end-to-end; **never** submit real customer reservations or messages as a smoke test.
9. Verify original buyer QA and \`node scripts/qa-route-integrity.mjs --static\`.
10. Deploy schema/Edge Function FIRST, website second. Confirm live page for an approved fixture, and watch errors. Enable by default for **zero** clients. Buyers opt in per workspace.

## Rollback
- Turn enabled=false for affected account(s), or disable the frontend assets. Removing Smart Welcome JS/CSS does not remove or alter the underlying booking/pricing tables. No data deletion is necessary.
- Never drop other customer tables or overwrite branded photos/data. Avoid automatically sending email or activating a promotion for existing clients.

## CB Depot launch note (2026-10-14)
- The selected buyer is CB Depot, category `detailing`, with active paid delivered Booking Page.
- Custom theme: CB Depot charcoal `#07111C` and electric blue `#087DFF`, existing panda logo and buyer hero photo.
- Editorial English/Spanish welcome text only, **no claimed discount**. CTA stays in original detail booking/quote wizard.
- Browser fixture CI tested dark theme at 390px and six responsive widths. Existing route integrity and deployed endpoint non-mutating HTTP smoke passed.
- The testing Supabase project lacks comparable buyer/CRM tables, so live authenticated end-to-end cross-tenant testing remains unverified; do not state this is proven by mock tests alone.
- Enable CB Depot only after production deploy is confirmed, while every other business stays default-off.
