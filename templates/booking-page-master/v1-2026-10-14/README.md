# TLE Booking Page — Independent Master Copy v1 (2026-10-14)

This is the **source-of-truth working copy for future client Booking Pages**, requested by the owner. It is **not** the public demo, not a deployed site, and not a client deployment. Work on a NEW client-specific branch/folder generated from this version; do not mutate this frozen snapshot.

## Original sources copied
- `public/base-booking.html` → `base-booking.html`
- `public/assets/booking-base.js` → `assets/booking-base.js`
- `public/assets/booking-template-live.js` → `assets/booking-template-live.js`
- `public/assets/booking-template-language.js` → `assets/booking-template-language.js`
- `public/assets/booking-smart-welcome.js` → `assets/booking-smart-welcome.js`
- `public/assets/cb-depot-experience.js` → `reference-only/cb-depot-experience.js`

The master HTML changes **only** the five script imports to the local copies and removes the CB Depot-specific script import. The CB Depot extension is archived in `reference-only` for historical comparison, **not** automatically applied to future buyers. Other original hardcoded paths, assets, demo/lead examples and backend URLs are preserved for subsequent cleanup; do not deploy this source as-is or assume it is a fully isolated client instance.

## Workflow for each sale
1. Paid order + verified tenant + completed intake; owner approves production start.
2. Create a new tenant-scoped design/config instance **from this frozen master**, not from the public demo or another client's page. Use a separate branch/PR; keep customer assets and tenant data segregated.
3. AI Creative tailors hero composition, imagery, branding, layout, copy and service presentation to the client's real business (never generic logo swap). No invented photos, reviews, prices or claims.
4. AI Developer connects authorized services, add-ons, quotes, frequency/ZIP logic, lead tracking and approved notifications without altering another tenant or shared live template.
5. AI QA tests phone/tablet/desktop, links, consent, actual booking/quote submissions, mail, permissions, no tenant leaks, EN/ES, accessibility, performance, and rollback.
6. Jessie presents private preview and QA results to owner. Only owner-approved changes may publish or send to client.

## Rules
- **Never modify** `public/booking-demo/index.html`, `public/base-booking.html`, `public/booking/index.html` or existing client installations as part of copying this master.
- No buyer agents are included. Owner Jessie and the owner's internal AI specialists remain separate.
- This repository folder is a **source snapshot**, not an automatically deployed preview. Frontend code still expects the original application routes and Supabase APIs; integrating an actual new buyer requires server-side tenant-scoped authorization and release QA.
- After an approved upgrade, create `v2-YYYY-MM-DD` and preserve v1; do not silently change existing client deployments.
- Track production builder integration and QA in GitHub issue #73.
