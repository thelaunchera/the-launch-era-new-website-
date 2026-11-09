# The Launch Era — Approved Price Policy

**Approved:** October 17, 2026  
**Status:** FINAL / LOCKED for routine operations. Do not revise prices or promotions without the owner's explicit new authorization.

## Approved public offers (USD)

| Product | Installation or one-time charge | Recurring charge | Regular price shown for comparison |
| --- | ---: | ---: | ---: |
| Booking Automation + Command Center | **$15.00** | None | $49.99 (struck-through) |
| Website Automation | **$35.00** | None | $59.99 (struck-through) |
| VA Essential Support (up to 8 approved hours/month) | None | **$25.00/month** | $49.99/month (struck-through) |
| AI Booking Assistant | **$25.00** | **$14.00/month** | No invented comparison |
| AI Follow-Up Assistant | **$19.00** | **$7.00/month** | No invented comparison |
| AI Business Assistant (Booking + Follow-Up) | **$39.00** | **$19.00/month** | No invented comparison |

AI Assistant setup includes the first 30 days, **starting on delivery**; recurring billing begins after that interval. The AI Business monthly plan saves $2.00/month compared with the two separate plans ($14 + $7 = $21); $24 across 12 regular monthly payments.

## Current cleaning Booking + AI bundle — Nov 7, 2026

This is the **current public Booking Bundle offer** displayed in `/booking-bundle/` and `/experience-cleaning/`. Keep the website, checkout gateway, Stripe amount/metadata, receipt and fulfillment aligned.

| Cleaning booking package | Booking base | AI add-on setup | Total due now | AI recurring price | Timing |
| --- | ---: | ---: | ---: | ---: | --- |
| Booking Automation + Command Center only | $15 | — | **$15** | **None** | One-time |
| Booking + AI Booking Assistant | $15 | $10 | **$25** | **$12/month** | After the first 30 days from delivery |
| Booking + AI Follow-Up Assistant | $15 | $5 | **$20** | **$8/month** | After the first 30 days from delivery |
| Booking + AI Business Assistant | $15 | $14 | **$29** | **$16/month** | After the first 30 days from delivery |

**Important:** these are special combined-package prices, not standalone AI Assistant prices. A customer buying an AI Assistant separately still sees the standalone prices in the approved public-offers table above. Do not advertise a standalone price as if it were a bundle discount or vice versa. The 40% legacy `booking_ai_activation` toggle remains controlled separately; do not compound or activate the promotion on the newer special bundle tier without a reconciled, owner-approved price contract.

Current technical contract: website `public/assets/tle-booking-bundle.js` sends `bundle-20261029` to Supabase `tle-booking-bundle-checkout`, which validates current published prices and routes a Stripe LIVE Checkout Session through Make. Standalone Booking/AI/Website Automation/VA purchases use `create-tle-service-checkout` and distinct offer IDs. Website-for-Your-Business $15/$25 purchases are separate and must not be recalculated using cleaning bundle pricing. The Content Lab $10 price is also independent.

## Promotions and contracts — do not remove or change automatically

- Preserve the existing **40% discount on the combined setup/activation** when purchasing Booking + an eligible AI Assistant together, **only while the Supabase `tle_bundle_promotion` record `booking_ai_activation` is enabled**. This discount applies to the relevant one-time combined setup charges, **not** recurring monthly fees.
- Promotion discount math is `round(original_setup_cents * 0.60)` for **each eligible setup line**. At current prices and an active 40% promotion: Booking + AI Booking costs $24.00 setup total ($9 + $15); Booking + AI Follow-Up $20.40 ($9 + $11.40); Booking + AI Business $32.40 ($9 + $23.40). The following monthly price is the selected AI plan’s un-discounted recurring rate.
- Preserve current regular-price strikethroughs and promotional presentation. Never label a special rate `30% off` unless the stated regular price and sale price actually support that percentage.
- Do not alter existing purchasers' Stripe subscriptions, accepted payment terms, historical order records, and legacy checkout-verification support. Existing clients keep their contracted rates.
- Keep public-facing site offers in English, mirrored in natural Spanish; the intake, checkout, email, demo, agent knowledge, bundled pricing and backend validation must agree. Remove inaccurate weekend restrictions from public payment messaging.

## Change control

All future price or promotion updates require new **explicit owner approval** and a coordinated QA release. Do not silently “optimize” or arbitrarily round amounts again. Changes to unrelated website design or the app must not rewrite this price policy.
