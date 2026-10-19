# The Launch Era — conversion sprint (19–31 October 2026)

Status: execution playbook, not proof of sales.

## Main public offer
- Booking Automation + Command Center is the focused product. Approved website price remains $15 one-time; comparison remains $49.99. AI assistants are optional and separately charged. Follow TLE_PRICING_POLICY.md.
- Website / and /es/ link first to /try-booking/?lang=en|es&source=homepage, a client-safe and browser-only sample.
- This is an illustrative mini-flow (service, space, date, owner review), not the full private customer template and not a live quote, booking calendar, payment or CRM record.
- Customers can still request a signed, personalized demo through /booking-demo/, retaining existing consent, authentication, expiration and tenant isolation.
- Purchase CTA goes to /booking-bundle/?lang=en|es&source=public-sample. No checkout rules or billing provider changed.

## Sales-friendly product message (public English)
Stop losing track of cleaning requests. Let every inquiry have a clear next step, without complicated software.

## Three demo-led video cuts
1. 20 seconds: 'A cleaning request comes in while you're on a job.' Show sample service and space input and tap Continue.
2. 20 seconds: 'What happens after the customer clicks submit?' Show example ticket appearing in simulated owner preview, clearly captioned 'Sample only'.
3. 20 seconds: 'No more hunting through messages.' Show an actual private product screen recording only if authorized, with client data masked; explain real owner controls versus demo.
Use genuine product UI and human founder delivery. Do not present sample booking events as completed real jobs, testimonials, revenue growth or confirmed automation sends.

## Manual lead qualification and outreach (no bulk sending)
- Focus operators with visible website/contact-form friction or owners self-reporting reliance on messages, spreadsheets or manual booking.
- Ask a specific question first: 'Hi! When someone requests a cleaning quote, do you manage it in messages or through a booking system? I built a simple interactive booking example and would be happy to share it if useful.'
- After interest: share https://thelaunchera.com/try-booking/?lang=en&utm_source=outreach&utm_campaign=oct26-first-customers . Follow consent and suppression preferences. No unsolicited commercial SMS.
- Log actual conversations and explicit requests; never invent leads, responses, demonstrations, customers or sales.

## Funnel diagnostics
- Public marketing CTA: public_booking_sample_click.
- Sample view: sample_booking_view; interaction: sample_booking_started, sample_booking_step, sample_booking_completed.
- Decision clicks: sample_booking_checkout_click and sample_booking_private_demo_click.
- Existing checkout events and verified payment records must be reconciled separately; a click or a demo completion is not a purchase.
- GA4 for the sample uses the existing measurement ID and is disabled in automation/WebDriver tests. Production event delivery requires verification.

## Release safety
- Static: node scripts/qa-public-booking-conversion.mjs and node scripts/qa-route-integrity.mjs --static.
- Gate: existing private booking-demo-reset and personalized-demo flow remain unchanged; no protected content in public.
- Browser: test 360, 390, 768/820, 1024, 1440. Check English and Spanish, next/back, date validation, result preview, restart, purchase link, owner preview button, reduced motion and Safari.
- Production: verify GitHub Pages build & publish, then visit live routes and confirm real billing route and server-side private access still reject anonymous viewers.

## Commercial decision
On October 31 review qualified contacts, replies, demos requested, sample started/completed, checkout initiated, verified purchases and objections. If qualified prospects engage but do not purchase, adjust proof/offer based on objections; do not repeatedly lower prices or build new features without evidence.
