# The Launch Era — Approved Price Policy

**Approved:** October 29, 2026  
**Status:** Revised by the owner October 29, 2026. Price changes require the owner's explicit authorization.

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

## Bundle-only pricing update (approved October 29, 2026)

- **Booking + AI Follow-Up:** **$20 one-time** ($15 Booking + $5 bundled AI setup), then **$8/month** after the first 30 days from delivery.
- **Booking + AI Booking:** **$25 one-time** ($15 Booking + $10 bundled AI setup), then **$12/month** after the first 30 days from delivery.
- **Booking + AI Business:** **$29 one-time** ($15 Booking + $14 bundled AI setup), then **$16/month** after the first 30 days from delivery.
- These are bundle-specific offer prices, not the standalone AI prices in the catalog above. No 40% promotional discount or public strikethrough. Existing purchases keep the contracted setup and subscription rates.

## Simple prices, contracts, and disclosure (approved October 29)

- The previous 40% combined-activation promotion is retired. `tle_bundle_promotion.booking_ai_activation` must remain disabled. Never show a 40% badge, strike through AI setup charges, or reenable the discount without new owner authorization.
- Booking + Command Center is **$15 once, no monthly Booking fee**. Bundle-only AI setup amounts are **$10 (Booking AI) / $5 (Follow-Up) / $14 (Business)**. Combined upfront totals are **$25 / $20 / $29** respectively. Bundle monthly plans are **$12 / $8 / $16**, distinct from standalone AI prices.
- Checkout, public price cards, payment metadata, owner billing tools, and receipts must always match exactly. If the pricing endpoint reports a promotion or another price, fail closed rather than show a different charge.
- No public 1:1 setup-call offer. Buyer-only guidance requests are available from authenticated Command Center support after purchase; never solicit those calls from the sales page or public contact form.
- Public copy should present the customer's pain, one clear benefit, demo, clear one-time price, optional AI monthly plan and CTA. Detailed internal intake approvals, production workflow, support scope, exception lists and revision/QA protocols belong in private onboarding, terms or the owner workspace.
- Do not change historic payments, current subscriptions, contract terms, or existing customer accounts. The Launch Era uses **Stripe** for website products and AI agents; the Cleaning App's internal customer payment methods are separate (Cash, Zelle, Check).
- Public pages are English with natural Spanish equivalents. Avoid misleading "no monthly fee" statements for AI plans, and show the delivery-triggered recurring date clearly.

## Change control

All future price or promotion updates require new **explicit owner approval** and a coordinated QA release. Do not silently “optimize” or arbitrarily round amounts again. Changes to unrelated website design or the app must not rewrite this price policy.
