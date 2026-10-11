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
