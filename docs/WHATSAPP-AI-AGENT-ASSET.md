# WhatsApp AI Agent — first asset
Date: 2026-10-11
Status: PREVIEW ONLY — NOT CONNECTED OR FOR SALE

## What was created
- Interactive English and Spanish preview at /whatsapp-ai-agent/ and /es/whatsapp-ai-agent/
- Three realistic cleaning-business conversations: quote request, flat-rate booking, human handoff.
- Simulated owner-side summary. No message or real personal data is collected, no booking is written, and no third-party API call is made.
- Pages intentionally have noindex until actual production product can be supported.

## Production architecture (future, not implemented)
1. The client's own approved WhatsApp Business Cloud account connects to a tenant-specific webhook.
2. Verify inbound webhook authenticity, identify tenant from verified business number, and deduplicate by message id.
3. Only process supported inbound message types, safely record conversation metadata in that tenant's private account.
4. Route the message through business-specific services, languages, price rules, operating hours, and escalation settings.
5. For custom/special/commercial work: collect minimal relevant info, create a pending inquiry, never claim an approved price.
6. For eligible flat-rate services: check availability and owner auto-confirm flag before any confirmation. Otherwise create a pending request.
7. Preserve conversation state and human takeover. Do not send duplicates or request data already collected.
8. Respect opt-in, WhatsApp's conversation window and template approval rules, and customer opt-out.
9. Sync event status to the correct private Command Center account and provide customer-visible handoff without internal system details.
10. Store credentials server-side only, apply per-tenant isolation, never embed access tokens in public pages.

## Launch prerequisites
- Working Make/Meta connection for a sandbox or authorized test number.
- Meta webhook verification, credentials, message pricing disclosure and approved templates where necessary.
- Real end-to-end tests: EN/ES, quote accept/decline/discuss, flat-rate auto-confirm OFF/ON and busy slot, human takeover, duplicate incoming event, unsupported message, opt-out, WhatsApp 24h policy, wrong-tenant access.
- Agree on WhatsApp-channel offer, monthly operating costs, setup fee, client phone ownership, and billing start after delivery.
- Review, then replace preview-only labels and noindex; create checkout/intake support only after QA.
- Do not modify currently running customer automation before these tests pass.

## Commercial terms approved for product-preview display (2026-10-11)
- Promotional installation: USD 48 through November 30, 2026, 11:59 PM Eastern.
- Regular installation: USD 78 beginning December 1, 2026.
- Proposed operational subscription: USD 14.99/month after the included first 30 days, measured from completed delivery, not purchase. Confirm recurring billing policy before enabling checkout.
- Meta Business Platform message charges and any additional provider charges are paid directly by the individual cleaning business, not TLE. Price is NOT a fixed all-inclusive WhatsApp messaging bundle.
- No checkout, fulfillment, SMS/WhatsApp campaign, and no claim that real integration is live until signed-off QA.
- Implementation target: estimated 48 hours after complete intake and authorized Meta connection during business hours; not a guarantee while the phone account is unapproved.

## Customer intake (do not ask for passwords/OTP)
### Step 1: business and contact
- Legal or trade name; owner/admin email; preferred operating language EN/ES (optionally both); website and Instagram link if any; service ZIP codes and regular hours.
### Step 2: WhatsApp readiness
- Current setup: personal WhatsApp / WhatsApp Business app / already Cloud API / new phone / none.
- Business-owned phone in international format (only when ready), country, and whether it needs to remain available in the Business mobile app.
- Meta business portfolio admin must authorize access themselves; never solicit login credentials, 2FA recovery codes, 6-digit PINs or persistent tokens through intake. Any permission grants take place through Meta/Make.
- Check Meta WhatsApp Coexistence eligibility BEFORE suggesting removal of an existing Business app number. Personal WhatsApp accounts cannot be used directly for a Cloud API agent.
### Step 3: service configuration
- Property types and areas served, main flat-price services, main custom-estimate services, add-ons, minimum fees, ZIP/distance rules.
- Calendar/availability source, schedule, whether auto-confirm enabled for eligible flat rate only, cancellation conditions.
- Business FAQ, tone, language behavior, greeting and after-hours responses, name of human handoff contact, escalation cases (price disputes, safety, commercial jobs), privacy and consent, opt-out, last contact rules.
### Step 4: authorized connection, test and delivery
1. Verify the business Meta account and number; set up WhatsApp Business app if needed (free) or obtain compatible business number.
2. Owner grants WhatsApp Business messaging/management permission via Meta. Confirm any chargeable messaging and its billing owner.
3. Register number or eligible coexistence flow; link Make WhatsApp Business Cloud to the correct verified account.
4. Verify webhooks, incoming message ID deduplication, language choice, tenant/phone isolation, bounded retries, opt-outs, no duplicate responses.
5. Map inbound/outbound messages to private Command Center conversation and linked inquiry (not a shared dashboard), with human takeover and status history.
6. Run EN/ES real message tests on authorized sandbox/approved number, including flat-rate OFF and occupied-slot/quote approval cases.
7. Show owner the test results and obtain approval; activate only after passing the checklist. Provide secure account access, not credentials.
