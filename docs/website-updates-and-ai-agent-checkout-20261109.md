# The Launch Era — Website Updates & Optional AI Agent SOP
**Date:** 2026-11-09 · **Internal operating guide · not public marketing copy**

## Offers
- Website + Command Center: **$15 USD one-time**; create a new website or perform explicitly approved small improvements on an existing website.
- Website + Advanced Command Center: **$25 USD one-time**; approved enhanced inquiry/customer organization and email workflows. **No AI agent, no monthly website subscription**.
- Optional AI Agent: **$8 USD/month**, purchased in its own Stripe Checkout. First charge and subscription begin at the separate checkout, not when the $15/$25 website is bought. Limited business FAQs and inquiry capture as scoped; no unlimited AI usage or automatic website maintenance. Prior AI+CRM customers retain their contracts.

## Approved purchase journey
1. Buyer selects $15 or $25, reviews their one-time price on /website-checkout/, and can select **Add AI agent — $8/month**. Default unchecked.
2. The website fee is paid and validated by Stripe (through Make) first. If the agent was selected, show a **separate** optional $8/month Stripe Checkout or **Continue without agent**; do not add hidden recurring items to the website cart.
3. The agent subscription is independently verified before accepting setup notes. Save private proof and brief in `tle_studio_website_agent_orders`; never mistake a checkout link or unpaid session for an active subscription.
4. New website buyer completes their existing paid intake. Do not skip or replace it with the agent intake. Customer receives the normal verified website purchase email; agent subscription/customer notice needs its own tested email flow.
5. The owner reviews agent brief, decides supported FAQ/contact-capture scope, tests behavior and privacy before enabling. Nothing is automatically installed on another company's site merely because payment was verified.

## Website revision workflow — new sites hosted by The Launch Era
1. Locate customer business account, order scope, source repository, live URL, linked Command Center and backup/version.
2. Confirm requested change **in writing** (exact section, new text/photo/price/action).
3. Create a branch/checkpoint in the client's project; do not alter unrelated demos or brands.
4. Make focused edits. For changes controlled by the connected Command Center (products, prices, availability), publish from the authorized owner's workspace; do not claim all site sections sync automatically.
5. QA in desktop, tablet, iPhone: hero crop, tap targets, navigation, inquiry email, forms, catalog, accessibility, mobile scroll, legal links. Existing live payment flows must be preserved.
6. Share a preview, collect approval, publish to that customer's website, verify live URL and send an email with change summary. Log changes and rollback version.
7. One original included revision is not an unlimited ongoing maintenance entitlement. Subsequent requests are scoped/quoted separately before billable work.

## Websites built with another provider
1. Collect URL, provider (WordPress, Wix, Shopify, Squarespace, Webflow, Framer or custom code), exact request, screenshots, and user-authorized collaborator invitation.
2. Check editor role, plan restrictions, apps, ecommerce/payment, email and domain dependencies **before accepting the work**.
3. Back up or duplicate the theme/page (when platform supports it); never ask the customer to send their password in an intake or email.
4. Edit **inside their platform** when permitted; do not promise GitHub sync, direct changes to inaccessible code, or full website redesign for a small scoped package.
5. Preview and request approval; publish in the original platform with tests for mobile, forms, cart, booking and legal notices.
6. Confirm completion with before/after evidence and remove or reduce collaborator permissions when no longer required.
7. When direct editing isn't possible, offer an alternative rebuilt page or migration **with separate approval**. A new TLE site is not a silent change to the original provider site.

## Customer update requests
- During original production: use existing design review and included revision option in Command Center when the buyer has it.
- After delivery: customer uses support/contact (not the error-only bug form) or responds to delivery email, listing URL, section, desired change, assets and deadline.
- Staff reviews entitlement and feasibility, gives a written quote if outside included revision, and schedules after acceptance.
- Do not promise automatic AI-led updates or background monitoring. Do not tell customers their site is changed until the live URL has been verified.

## Technical implementation & release guard
- Working GitHub PR: #482 (draft). Do not say public checkout is live before CI, payment gates, confirmation, email and mobile QA pass and the branch is deployed.
- Stripe LIVE via Make scenario 6423594; module route website-agent 53/54. Price `price_1UZrkWCnlGzKRSIMjrRiKjAX` for optional $8/month. No product duplication.
- Supabase fhrv public checkout creation validates origin and offers; separate agent confirm verifies Stripe and stores only paid sessions in a service-role-only table with RLS. Check API error states.
- Stripe `mode=payment` cannot contain a recurring optional item. Keep website and agent subscription checkouts distinct; clearly disclose price and renewal.
- Test with unpaid references; **never make a real charge just for QA**.
- The new subscription starts at its actual Stripe purchase. Do not reuse the old after-delivery $8/month AI+CRM rule for this optional product.
- Update EN/ES legal and email statements coherently, preserving historical subscribers.
