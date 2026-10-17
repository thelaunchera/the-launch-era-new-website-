# CB Depot — independent Booking Link release gate

Customer: CB Depot. Domain ownership: no customer domain.

## Do not change the live link yet
- Existing Booking Page: public/booking/index.html redirects keyed requests to public/base-booking.html.
- The current booking key is a private customer credential; never hard-code it in this repository, a public redirect, a DNS record, or an example URL.
- Reuse CB Depot's existing approved design, services, photos, favicon and customer workspace.
- A separate neutral domain or hosting-owned hostname must be allocated and verified before delivery.
- Do not use thelaunchera.com or command.thelaunchera.com as the public booking hostname.
- No placeholder URL should be delivered to the customer.

## Release checklist
1. Verify CB Depot's paid account, authorized booking key, and client workspace through the production owner API.
2. Provision a customer-isolated booking host using a connected hosting provider; confirm HTTPS and public DNS.
3. Route only CB Depot's approved build and tenant-scoped booking API to that host.
4. Test real booking request, quote, cancellation, reschedule and customer/owner notifications without contacting the customer during QA.
5. Test 390px mobile, 768px tablet and 1440px desktop, and verify favicon/branding and legal pages.
6. Confirm no cross-tenant data and no TLE website redirects.
7. Owner approval, then client approval, then activate and send the verified URL once.

Status: BLOCKED — neutral booking hostname and customer-specific authenticated configuration not yet verified. No customer-facing URL exists.
