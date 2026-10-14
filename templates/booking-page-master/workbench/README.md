# Booking Page Workbench · Design pass 01

**Status: isolated working source, not published.** This is the editable design workbench copied from frozen `../v1-2026-10-14/`. Public demos and existing buyers are unaffected.

## What's changed
- New responsive premium stylesheet: `assets/booking-workbench.css`.
- Softer ivory/blue surfaces, clearer contrast and typography hierarchy, deeper cards, spacious hero with readable dark overlay, touch-friendly CTAs, mobile-first adjustments, reduced-motion accessibility.
- Booking logic, Supabase endpoints, pricing, form behavior and client records are unchanged.
- Workbench JS assets are local copies, not shared mutable imports. No CB Depot-specific script is loaded.

## Next design decisions
1. Approve a final master layout using a **synthetic** cleaning business, including hero photo and photography license, mobile/tablet/desktop screenshots.
2. Create client-specific design profiles (image selection, section ordering, font, colors, tone) separate from protected booking engine.
3. Integrate authenticated tenant-specific config, owner-only private preview, automated QA and explicit publish approval.

## Important
- Opening this HTML directly may redirect to `/booking-demo/` or require real API data because the original production access guard is preserved. **Do not deploy this workbench directly or bypass authorization in production.**
- A public demo is for leads; a workbench is for design/QA; a buyer page is a tenant-scoped, approved release. They are distinct.
- No invented client reviews, prices, service areas, logos or business claims.
- Owner Jessie + six internal specialists remain separate from buyer agents.
- Source: `public/base-booking.html`, snapshot `../v1-2026-10-14/`.
- Track implementation in #73; no edits to the public demo or CB Depot.
