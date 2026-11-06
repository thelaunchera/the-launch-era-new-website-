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
| Website checkout generation and verification | The Launch Era — Website Packages Checkout & Verification | Stripe checkout/verify **only** | **Active for checkout; email confirmation NOT wired** | Original Stripe verification preserved; no premature post-purchase email |

## Published Resend transactional templates
- `tle-content-lab-welcome-editorial-es-20261106`
- `tle-content-lab-welcome-editorial-en-20261106` — published, not wired to localized checkout; Spanish purchase welcome is wired
- `tle-class-waitlist-verified-es-20261106`
- `tle-podcast-optin-verified-es-20261106`

## Marketing templates not automatically sent
The earlier editorial invitation templates for Website, Content Lab, class, podcast, freebies and portfolio are **drafts** until their specific opt-in audiences, unsubscribe link, dynamic links, and enrollment triggers are verified. Buyers must not be subscribed to unrelated offers by purchasing a product. A promo email preview is not a transactional email.

Website sales email copy corrected on 2026-11-06: **$15 website one-time; advanced website $25 today plus $8/month AI service after 30 days**. This is not a newsletter subscription and should not start an unwanted campaign.

## Verified test sends
- Twelve initial branded previews sent to the owner's existing test inbox; Resend showed all **delivered**, 2026-11-06.
- Five later post-activation or corrected-billing previews: Content Lab, class, podcast and Website ES/EN; Resend showed all **delivered**, 2026-11-06.
- These are visual/delivery tests of email content. They do **not** establish a completed live buyer signup+Stripe+Make+Supabase integration round-trip. Do not claim otherwise.

## Next integration work before full rollout
1. The corporate footer newsletter form `tle-newsletter-subscribe` currently saves consenting subscribers to `tle_newsletter_subscribers` but **does not send a welcome**. Implement permission-aware subscription welcome, opt-out management and single-send dedupe before enabling marketing sends.
2. Website post-payment flow currently confirms through two Supabase functions, calling the existing Make Stripe verification and recording project data, but does not yet connect to a branded receipt+intake email. Add only after dedupe, correct package billing, confirmed Stripe LIVE and project record verified.
3. Freebie-specific automated access for archived December/January workflows remains **inactive intentionally**, not part of the current portfolio-wide rollout.
4. Preserve original dynamic emails for episode art/title, course weekly date and ES/EN guide PDF URLs; don't replace them with generic static sales templates.
5. Perform full real-user end-to-end signup and consent/unsubscribe tests before calling the entire email ecosystem completed.

## Safe operations
- Do not disable working flows while replacing formatting.
- Do not modify price, subscription status, Stripe metadata, unverified recipients or customer access.
- No bulk newsletters or unsolicited campaigns.
- Distinct creative demo brands stay distinct visually under the same parent-company quality standards.
