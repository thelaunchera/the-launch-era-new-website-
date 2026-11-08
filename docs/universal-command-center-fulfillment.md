# Universal Command Center — website package delivery & activation

**Status (Nov 8, 2026):** Real private catalog and public catalog routes are deployed. The existing Cleaning/Detailing CRM is live. **Provisioning a new buyer of the $15 website product into their own verified Command Center is NOT yet automatic and NOT confirmed end-to-end.** Do not advertise instant access or mark it delivered until the checklist is passed for an actual paid customer.

## Commercial scope (two existing Stripe offers only)

| | website-basic | website-ai-crm |
|---|---|---|
| Setup price | $15 | $25 |
| Website format | Digital Menu / Product Catalog / Services + Requests | Same |
| Private buyer Command Center after verified delivery | Basic: inquiries, contacts, catalog manager | Same plus agreed AI/advanced email automation |
| Email notifications | Configured new inquiry alerts | Configured email workflows / follow-ups |
| Messaging | Email only; SMS excluded | Email only; SMS excluded |
| Ongoing AI+CRM fee | No AI monthly fee included in basic offer | $8/month begins after first service month, starting on delivery |
| Real table inventory/order checkout/revenue reporting | Not part of base | Not part unless separately designed/integrated |

**Never confuse a reservation request with a confirmed table.** Restaurant-specific requests should stay pending until availability is checked and confirmation is approved. Only promise email confirmations/reminders if the configured booking workflow has actually passed QA; do not imply SMS or automatic confirmation merely because a sample preview exists.

## Existing components (do not duplicate)

- Production: GitHub Pages repository `thelaunchera/the-launch-era-new-website-`.
- Private CRM: `/command-center/` (shared real buyer workspace + owner-only internal section).
- Buyer catalog editor: `/command-center/catalog.html`, authenticated user token, workspace owner authorization.
- Published catalog: `/business-catalog/?key=<random uuid>`; publishes only approved available items.
- Catalog Edge API `tle-crm-catalog` in Supabase project `bowacxhmjvrqixtwaikv`.
- Data table `public.tle_crm_catalogs` (RLS on; no direct anonymous/authenticated access).
- Website checkout remains `/website-checkout/?offer=website-basic|website-ai-crm&lang=en|es`.
- Payment-gated website intake `/intake/website/` is in separate Supabase project `fhrvuhikrybobidxpvnh`.
- Buyer intake records `website_format` and optional `menu_pdf_url` in `goals` until server-side structured provisioning is implemented.

## Secure post-payment activation plan (must implement + prove before claiming instant readiness)

1. Confirm a real Stripe payment via existing server-authorized Make/Stripe workflow for *the exact checkout session* and correct offer amount. Do not trust browser query params or `goals` text for paid entitlement.
2. Process verified website intake from `fhrvuhikrybobidxpvnh`, link with matching paid session, purchaser email and package slug to the CRM owner-facing record. Keep identity proofs server-side and idempotent; never duplicate a project/workspace on webhook retry.
3. Owner reviews project, approves production + delivery. No provisional or anonymous workspace access.
4. Create or reuse a tenant-isolated non-internal `tle_crm_workspaces` record and a verified buyer Auth account in `bowacxhmjvrqixtwaikv`. Resolve and verify exact user identity before `created_by` assignment. Preserve internal-owner-only permission boundaries. Buyer catalog mode follows approved website format. Do not modify or repurpose an existing cleaning client.
5. Enforce package entitlements server-side: `website-basic` can use inquiries/contacts and catalog manager, but cannot activate AI or advanced follow-ups; `website-ai-crm` receives approved advanced services according to verified paid entitlement and delivery. Hiding UI buttons is not sufficient.
6. Activate correct email sender, recipient, verified templates and triggered events only after delivery and owner approval. For restaurant table requests: pending -> staff/verified availability approval -> confirmation email -> optional consentful reminder email with opt-out controls appropriate to content. No SMS.
7. Verify on iPhone: buyer A cannot see buyer B data, cannot see owner workspace, cannot edit another catalog, cannot access AI-only tools via API. Test price change -> save -> publicly published catalog -> sold-out toggle -> reset/revoke; PDF import with text and scanned document. Make sure unpaid sessions have zero access.
8. Verify actual live client demo, paid entitlement, output URL, email sending and cancellation path; report QA before customer-facing claims. Current catalog has zero rows, so public sharing with a published product has NOT been exercised live.

## Functional scope now vs later

Now implemented: dedicated real tenant catalog with price/discount/availability, best-effort local text-PDF suggestions, private access verification, published public catalog. Existing CRM provides customer inquiries and booking pages for previously activated clients.

Not implemented/verified here: automatic onboarding for new $15 buyers from separate checkout, real restaurant seat/capacity rules, automatic table confirmations/reminders, real POS orders/revenue/popular products/busiest hours analytics, direct integration of catalog widgets into all customer websites. These require deliberate tenant-safe implementation and tests.

**Do not activate SMS or silently create production customer records while developing.**
