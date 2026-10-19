# Product landing mobile reading audit — 2026-10-19

## Objective
Shorten repeat explanations for social/phone buyers without altering prices, checkout logic, client access, product features, demo request systems, billing terms or backend.

## Before (public visible content extracted from product pages; approximate)
- Cleaning App 1,076 words; Booking Automation 907; WhatsApp AI 848; Booking + Command Center + AI bundle 759; AI Assistants 438; Website Automation 382; Virtual Assistant 342. The figures include expandable FAQ and sample UI labels and do NOT measure viewport scroll directly.
- Most common overlap: scattered requests, lost follow-ups, one-place organization, repeated booking flow diagrams, decorative dashboard previews plus full embedded demos, repeated AI pricing cards plus plan selector.
- Mobile priorities: Booking, App, WhatsApp coming-soon preview, bundle and AI Assistants plan comparison.

## What was actually changed
1. Booking EN/ES: shorter demo and optional-AI disclaimers, corrected headline CTA to **Try the Booking Demo**; buyer retains public Sample Cleaning and separate signed Clara email request; end-of-page purchase CTA is primary with personalized demo as secondary. On widths <=760, hide repeated pain accordion, proof strip, and final decorative 4-node pipeline; keep benefit cards, setup and purchase FAQ, cross-product link and all genuine actions.
2. Cleaning App EN/ES: at <=760 hide the repeated full-width desktop+phone iframe illustration after the already-visible simulated dashboard. Replace with a clear one-tap interactive demo entry. Keep original complete visual block at desktop, full independent App demo, pricing, four capability cards and 30-day trial CTA.
3. Booking Bundle: at <=720 hide duplicate problem paragraph and repeat 3-column summary; retain actual Booking/Command Center/AI interactive examples, optional-AI pricing disclosure, real setup policies and checkout. Reduce mobile decorative photo height and whitespace.
4. AI Assistants: at <=700 hide the duplicate three-card pricing grid and keep the fully interactive three-option selector, its setup/monthly prices and all checkout routes. Desktop unchanged. Decorative stock photo hidden on phone.
5. WhatsApp AI: coming-soon remains explicit and no live integration claims. On phone hide decorative duplicate hero mockup and limit the six repeated feature cards to three; the demo, human-control explanations and FAQs remain. Desktop remains complete.
6. Website Automation and VA landings left intact because their content is short and their visual examples/checkout already have a focused path. Tested against mobile overflow and checkout presence.

## Safety
- No lead emails sent, no client data fetched, no customer booking, no payment or buyer interaction executed.
- No change to prices, terms, payment or phone number integrations, private Clara access, or fulfillment commitments.
- Changes reduce *mobile visual reading density*, not necessarily entire page HTML/SEO word counts. Desktop content is preserved.
- New `scripts/qa-mobile-product-conversion.mjs` and PR workflow test phone/desktop visibility, overflow, language, demo paths, checkout and interactive AI and WhatsApp demos.
- Existing `scripts/qa-booking-cross-link-mobile.mjs` adapted to the newly concise but still transparent copy and purchase-first footer. All other original safety and release gates must pass.

## After release
Check production in 360/390 px Safari/iPhone, iPad and desktop. Do not claim improved conversion until tracking verifies actual demo completions, checkout starts, verified payments and buyers' objections.
