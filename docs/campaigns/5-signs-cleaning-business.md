# The Launch Era — 5 Signs campaign (2026-11-03)

## Purpose
One ad angle → one sales landing → the existing Cleaning App product page. This is a cold-traffic campaign, not a demo, checkout, new price or new product.

- English landing: /5-signs-cleaning-business
- Spanish landing: /es/5-signs-cleaning-business
- Primary CTA EN: /cleaning-web-app
- Primary CTA ES: /es/cleaning-web-app/
- Secondary informational service link: /booking-lead-automation/ (ES /es/booking-lead-automation/)
- The Cleaning App and personalized Booking Page + Command Center are separate products. Do not imply that buying one includes the other.
- No form, lead capture, checkout or analytics event was added. Existing systems remain unchanged.
- No client demos, prices, promotional terms, payment rails, customer data, automations or backend functions are in scope.

## Ad copy (English, no invented results)
**Variant A · Message overload**
- Hook: "How many cleaning requests are hiding in your DMs?"
- Copy: "The missed quote. The client note you can't find. The job detail stuck in a text thread. These are signs your cleaning business needs a clearer workflow. Read the 5 signs."
- CTA label: "See the 5 signs"
- Destination: /5-signs-cleaning-business?utm_source=instagram&utm_medium=paid_social&utm_campaign=five_signs&utm_content=dm_overload

**Variant B · Admin friction**
- Hook: "Your next cleaning job shouldn't start with searching five apps."
- Copy: "Clients, quotes, bookings and job notes deserve one organized place. If you're still piecing everything together manually, start with these five signs."
- CTA label: "Read the signs"
- Destination: /5-signs-cleaning-business?utm_source=instagram&utm_medium=paid_social&utm_campaign=five_signs&utm_content=admin_friction

## Message-match checks
1. Ad speaks to residential and commercial cleaning business owners in the U.S.
2. First-screen hero promises exactly the same "5 signs" that the ad offers.
3. Body lists five specific, credible pains and shows where the Cleaning App helps.
4. The personalized Booking Page is labeled a separately purchased optional service.
5. Main CTA goes to the existing product page, not a demo or checkout.
6. No unverified stats, testimonials, fictional before/after results or sale claims.

## Future hero image
- Owner intends to commission a hero photograph later. Keep the current editorial illustration untouched until that image is expressly requested and approved. Do not imply the current art is a product screenshot.

## Prepublish gate (do not skip)
- Run build + TypeScript + static route integrity check and applicable browser QA; verify 360, 390, 768, 1024, 1440px.
- Verify English and Spanish direct-load, internal language link, title/meta/canonical/hreflang, CTA destinations and one primary offer.
- Verify that the added route has no effect on any /demos/, /booking-demo/, /cleaning-app-demo/, private tenant pages or checkout.
- Confirm deployment workflow and source branch before merging.
- Keep the route unlinked from main navigation during initial campaign testing.
- When testing page performance, compare the **same ad** routed to two destinations with equal conditions. Track product-page arrivals, legitimate signups and revenue per visitor as available. Avoid judging winners from a few clicks.
