# The Launch Era — Public Email Activation Matrix
Updated 2026-11-06. Source: live Make scenario inspection and Resend template metadata. This is an operational inventory, **not** authorization to send marketing to unrelated products' customers.

## Active integrations (actual Make status)
| Trigger | Make scenario | Email delivery action | State | Safeguards |
|---|---|---|---|---|
| Content Lab Stripe LIVE $10 payment | Content Lab — Stripe LIVE pago verificado → acceso y bienvenida | Published Resend template `tle-content-lab-welcome-editorial-es-20261106` | **Active / wired** | Stripe LIVE session verification, product & amount check, membership persisted, dedupe store |
| Course waitlist confirmation | Podcast Clase 01 — Bienvenida a lista de espera (confirmada) | Published Resend template `tle-class-waitlist-verified-es-20261106` | **Active / wired** | Confirmed class-only enrollment before send, Supabase send audit |
| Course recurring notices | Podcast Clase 01 — Recordatorio semanal solo espera confirmada | Preserved original dynamic Resend API copy, refreshed brand colors | **Active** | Weekly only confirmed members before opening, idempotency |
| Podcast voluntary episode updates signup | Podcast — Suscripción voluntaria a nuevos episodios | Published Resend template `tle-podcast-optin-verified-es-20261106` | **Active / wired** | Explicit consent + first registration check; unsub link kept |
| Podcast new episode published | Podcast — Supabase Publicado → avisar oyentes (enlace Spotify real), plus child scenario | Preserve existing dynamic episode art, Spotify link and opt-out | **Active** | Approved published episode only + deduplication |
| Podcast free guide request | Podcast — Guía gratis — Entrega verificada por correo | Preserve actual ES/EN PDF resource links; refreshed brand colors | **Active** | Valid guide request only; no marketing enrollment |
| Corporate footer newsletter opt-in | The Launch Era — Newsletter · bienvenida verificada ES/EN (6930009) | Published Resend welcome ES/EN via Supabase `tle-newsletter-subscribe` | **Active / live sign-up tested** | Explicit opt-in, signed unsubscribe confirmation, persistent sent marker, retry claim and Resend idempotency |
| Website checkout and verified purchase | Existing Stripe verify plus The Launch Era — Website · compra Stripe verificada → email único ES/EN (6930010) | Published Resend verified order ES/EN via Supabase `tle-website-order-confirm` | **Active / Make email tested; real paid end-to-end not yet observed** | Live Stripe proof and project write gate, single-send marker, retry claim, $25 + $8 monthly disclosure |

## Published Resend transactional templates
- `tle-content-lab-welcome-editorial-es-20261106`
- `tle-content-lab-welcome-editorial-en-20261106` — published, not wired to localized checkout; Spanish purchase welcome is wired
- `tle-class-waitlist-verified-es-20261106`
- `tle-podcast-optin-verified-es-20261106`
- `tle-newsletter-welcome-es-20261106` — published and live
- `tle-newsletter-welcome-en-20261106` — published and live
- `tle-website-verified-order-es-20261106` — published and live after verified payment
- `tle-website-verified-order-en-20261106` — published and live after verified payment

## Marketing templates not automatically sent
The earlier editorial invitation templates for Website, Content Lab, class, podcast, freebies and portfolio are **drafts** until their specific opt-in audiences, unsubscribe link, dynamic links, and enrollment triggers are verified. Buyers must not be subscribed to unrelated offers by purchasing a product. A promo email preview is not a transactional email.

Website sales email copy corrected on 2026-11-06: **$15 website one-time; advanced website $25 initial setup; its first month of AI + CRM service starts on verified completed-project delivery, with $8/month billing beginning after that first month**. This is not a newsletter subscription and should not start an unwanted campaign.

## Verified test sends
- Twelve initial branded previews sent to the owner's existing test inbox; Resend showed all **delivered**, 2026-11-06.
- Five later post-activation or corrected-billing previews: Content Lab, class, podcast and Website ES/EN; Resend showed all **delivered**, 2026-11-06.
- Live newsletter sign-up tests in ES and EN passed: new subscribers persisted, Make invoked the published template, Resend status `delivered`, and Supabase `welcome_sent_at` recorded success. A duplicate signup did not send another welcome.
- Signed newsletter unsubscribe POST moved the test address to `unsubscribed`; explicit re-opt-in restored `subscribed` without a duplicate welcome.
- Website Make-to-Resend tests for ES and EN delivered to internal Gmail aliases, with clear `[TEST]` subjects and no real payment, Stripe session or project created. Replaying the same website event produced no duplicate email at Resend.
- Internal newsletter QA subscriber aliases were removed from the database after testing; the temporary on-demand Make QA scenario was deactivated.
- **Limit:** The site has no recorded real paid website projects yet, so a genuine full Stripe LIVE → both Supabase project records → Make → Resend customer round-trip has not happened. The production route is configured and active; do not claim a paid end-to-end test.


## Operational status and remaining monitoring
1. **Activated and verified in production:** corporate newsletter ES/EN welcome, consent-aware opt-out, idempotent welcomes and both branded Make email scenarios. The previous class, Content Lab and podcast workflows remain active.
2. **Awaiting the first real website purchase:** confirm Stripe LIVE receipt, project registration in both Supabase projects, correct amount and email receipt in Resend; this cannot be simulated as a paid transaction without a purchase.
3. Future **marketing campaigns** are separate from transactional welcomes. Do not enroll buyers in unrelated promotions or automatically activate audience broadcasts.
4. Archived future freebie workflows intentionally remain inactive. Preserve episode titles, Spotify URLs, resource PDFs and existing user access gates.
5. Primary source paths: `supabase/functions/tle-newsletter-subscribe/index.ts`, `supabase/functions/tle-website-order-confirm/index.ts`, `public/website-payment-success/index.html`, `src/components/site-shell.tsx`.
6. Make production scenarios: `https://us2.make.com/2964061/scenarios/6930009` and `https://us2.make.com/2964061/scenarios/6930010`.

## Safe operations
- Do not disable working flows while replacing formatting.
- Do not modify price, subscription status, Stripe metadata, unverified recipients or customer access.
- No bulk newsletters or unsolicited campaigns.
- Distinct creative demo brands stay distinct visually under the same parent-company quality standards.

## Website delivery billing migration — 2026-11-06
- **New Stripe Checkout via Make (scenario 6423594):** new advanced orders use `mode=payment`, $25 one-time setup, `customer_creation=always`, and `payment_intent_data[setup_future_usage]=off_session`. Stripe metadata `payment_model=setup_now_bill_after_delivery_month`; no subscription created at purchase.
- **Monthly catalog:** new dedicated $8 USD/month product `prod_VZyFPaeR4fEfiX` and price `price_1UYoJ2CnlGzKRSIMEL4AfPB1` created via Make; no cleaning-only product reuse.
- **Checkout success:** primary and Studio Supabase functions verify Stripe paid LIVE sessions and store customer ID and payment intent; buyer email sent after both project and Studio payment records are saved. The template CTA receives a dynamic direct intake URL with the verified checkout session, not the sales landing.
- **Owner confirmation:** `https://thelaunchera.com/website-delivery-admin/` authenticates using the original company's Supabase admin role. Private Studio website inquiries link to it; only owner can mark an eligible paid, intake-complete website delivered with live HTTPS URL.
- **Deferred recurring activation:** Supabase function `tle-website-delivery-activate` stores an immutable delivery timestamp and first service-month end (next calendar month); private Make scenario **6930362** verifies LIVE Stripe Checkout, paid setup, customer and saved off-session payment method, creates a subscription to the dedicated price with trial ending at the first month end. Idempotency key derives from Stripe session; recorded subscription prevents future repeats.
- **Validation:** Make created a valid LIVE unpaid $25 checkout in payment mode with correct metadata; activation webhook test against this unpaid Checkout did **not** reach the subscription-creation module (two operations only). No real payment occurred and the website-project table had zero orders at the time of testing. A genuine purchase/delivery/first-payment round trip must still be observed before declaring it tested end to end.
- **Legacy:** older website subscriptions retain their existing Stripe contracts; no rewrite/cancellation of already-active plans.
- **GitHub QA:** `scripts/qa-website-checkout-flow.mjs` now enforces the delivery-based copy in both public landings and both intakes.


## Email frequency and creative calendar (confirmed 2026-11-06)
- **1st of each month**: reserve for the **monthly freebie**. One announcement maximum (a single digest if multiple resources launch that month), only after the resource is actually public, accessible, complete, and the relevant freebie audience has explicitly opted in for updates.
- **15th of each month**: single **The Launch Era editorial newsletter**, ideally 10:00 a.m. America/New_York. Not the 1st. Send only when the issue is approved and subscribers have consented to corporate updates.
- **On signup**: one-time welcome only. Keep consent/unsubscribe and duplicate-send protection.
- **On request**: deliver a specifically requested freebie once confirmed, regardless of the general promotional calendar. This transactional delivery is separate from monthly announcements.
- **Avoid overlap** with podcast, class and paid-product email sequences. Different email permissions and different lists: a freebie download alone is not consent to a corporate newsletter.
- As of the check, Supabase `tle_editorial_freebie_campaigns` has **two planned records on December 1, 2026** (`december_lavender_2026` and `november_web_one_prompt_2026`), **both `public_enabled=false`**, and the related archived Make workflows are **inactive**. This is not an active monthly announcement. Do not flip them on or send two announcements by mistake; resolve what is actually launching and combine into one digest if both are approved.
- At check, Make corporate newsletter scenario `6930009` handles **welcome** only. **No scheduled corporate newsletter campaign was active**; the new 15th-of-month cadence is an editorial plan, not proof of activation.
- **Before first production campaign**: configure approved-issue gating, active subscription and unsubscribe filtering, one-per-edition idempotency, EN/ES segmentation, and test emails. Never schedule unapproved messages blindly.
