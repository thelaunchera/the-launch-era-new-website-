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

Website sales email copy corrected on 2026-11-06: **$15 website one-time; advanced website $25 today plus $8/month AI service after 30 days**. This is not a newsletter subscription and should not start an unwanted campaign.

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
