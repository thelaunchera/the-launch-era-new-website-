# CRUMB — cookie shop demo

Official editable source: `public/demos/crumb/` in this repository, alongside Casa Brownie.
Public route: `https://thelaunchera.com/demos/crumb/`.
Original AppDeploy prototype: `https://crumb-cookies-animated-demo-w1fcop.v2.appdeploy.ai/` (historical source only; future edits belong here).

## Edit here

- `index.html`: store sections, six flavors, editorial photo-first flavor grid, animated Miami location route and gift builder dialogs.
- `styles.css`: editorial typography, warm palette and responsive layouts.
- `main.js`: shared bag state, capacities 3/6/12, packaging, gift note, preview and local delivery information.
- `assets/`: nine self-hosted WebP photos; six new flavor photographs plus the existing approved hero, gift box and lifestyle photos. Original generated PNGs are preserved in the saved redesign package.

Use relative asset paths. Keep the version query on CSS/JS/photos current after updates to avoid stale mobile styles. No separate build or AppDeploy credit is required for this standalone page: the site's existing publication copies public files.

CRUMB is a fictional Miami store for education. No orders, prices, delivery commitments, payments, customer records, analytics or emails. The removed ribbon must stay removed. All public copy is US English.

## QA

`node --check public/demos/crumb/main.js`
`node scripts/qa-crumb-demo.mjs` (uses the existing jsdom dev dependency)
`node scripts/qa-route-integrity.mjs --static`

DOM checks cover sizes 3/6/12, excess additions, reducing size, zero minimum, preview guard, selected photos, packaging, gift-message safety, bag state and delivery-dialog flow. DOM dialog methods are simulated, so these checks are not visual/browser QA.

Responsive visual acceptance at 360/390/820/1024/1440 and live publication must be verified separately. No mobile/desktop screenshot is claimed from the earlier AppDeploy preparation.

## 29 Oct editorial / location refinement

The six flavors now use a signature lead photograph and a varied-width editorial grid, closer food crops, and overlay add-to-bag controls (all six keep the original bag behavior and accessible labels). The existing delivery section has a CSS/SVG map-route draw and soft location-marker pulse adapted from the Motion Library route/pin concept. It illustrates **Miami only**: never uses GPS, browser location permissions, visitor address, or live coverage promises. Follow `prefers-reduced-motion`. All marketing copy stays English; CRUMB is a fictional educational demo.

## Approved CRUMB hero and final mobile merchandising

The hero image at `assets/hero.webp` is replaced in-place with the owner's approved 1536×864 boutique photograph (compressed WebP). The mobile hero uses full 16:9 framing so the wall sign, cookies and gift packaging remain visible; no motion or overlaid heading was added. Six cookie images display in consistent square cards on phone and desktop; the photo add control is a compact "Add +" pill with its original `data-add` events and accessible flavor labels. An existing two-direction marquee concept is implemented as two subtle rows immediately before the lifestyle photo, with reduced-motion support. CRUMB stays a fictional demo with no real checkout, orders, or GPS data.

## Premium UX polish (29 October 2026)

- Preserve the approved CRUMB storefront photograph, but give it a taller left-focused mobile crop for a stronger first impression; keep the header photo-first with no overlay text or video.
- Six evenly sized product cards and refined accessible 44px `Add +` actions; clicking a cookie confirms the flavor and capacity with a dismissible in-session toast. No payment or network capture.
- The builder now renders a responsive live visual tray with precisely 3, 6 or 12 positions, the selected cookies in real time, and a wrapper color/ribbon treatment. The existing quantities, packaging selection, safe gift note and preview remain.
- Retain the existing double-direction marquees and animated illustrative Miami location section, streamline its concept disclosure, and add a compact final call to build a box before the footer.
- No product ratings, fictitious testimonials, prices, real delivery service, geolocation permission, checkout, or customer data collection are introduced.

## Photo-first visual identity update — 29 October 2026
- Six newly generated and compressed WebP assets are self-hosted under `assets/`: `hero-mobile.webp`, `brand-gifts.webp`, `brand-lifestyle.webp`, `brand-storefront.webp`, `brand-maker.webp`, `brand-tasting.webp`. All images are concept imagery for the CRUMB demo, not evidence of a real physical store/team or actual delivery.
- The portrait interior cookie-counter photo is used only by a `picture/source` media query in the mobile hero. Desktop keeps the previously approved wide `hero.webp`.
- The branded gift-box photo replaces the older gifting image and the CRUMB lifestyle photo replaces the older portrait; the remaining photos appear in a compact three-image editorial strip with swipe on phones, avoiding a long stacked gallery.
- Text headings, marketing copy and principal actions are centered, especially on mobile. Flavor selectors and live gift-box logic are unchanged; no checkout/payments/real GPS are introduced. The existing six flavor product photos remain intact.

## Selección de fotografías sin repetición (29 oct)
- Se sustituyeron las imágenes anteriores de fachada, regalo, persona y equipo por las cuatro fotos nuevas aprobadas; ninguna escena de esas categorías aparece dos veces en la página.
- La quinta foto nueva es la bolsa CRUMB (`brand-packaging.webp`), que **reemplaza** la foto de plato de cookies en la galería de identidad. Así la galería compacta muestra fachada, equipo y packaging, no otro producto servido.
- La sexta imagen recibida (plato con tres cookies) se omitió expresamente por redundancia; no se añadió una sección extra.
- Las seis fotos individuales del catálogo de sabores y el hero móvil aprobado permanecen sin cambios. Imágenes conceptuales, no prueba de tienda real.

## High-quality cookie product photos and matching flavors (29 Oct 2026)
All six product photos in `assets/` are individual **1024×1024 WebP images encoded at quality 96**, not mosaics. The supplied reference photos were exported at 1024px; these are the source resolution (not claimed 4K), with white top-divider artifacts removed from the final three. The first three existing file paths were updated in place, while the other three flavors now use accurately named files.

**Live catalog:** Classic Chocolate Chip (`classic`), Double Chocolate (`double`), Salted Caramel (`caramel`), White Chocolate Raspberry (`raspberry`), Nutty Dream (`nutty`), Brownie Chip (`brownie`). Product names, descriptions, visible photos, builder options, accessible labels, toast notifications, box preview and tray all correspond; do not revert labels to the previous macadamia/cream/cinnamon set unless restoring matching photography.

No hero, main gift image, layout, active payment, local delivery claims or unrelated demos changed.

## Compact editorial headings on mobile (29 Oct)
Shorten oversized section headers instead of stacking long phrases: gift `A little gift. Big joy.`, brand `Inside CRUMB.`, lifestyle `Made to share.`, closing CTA `Make their day.`. On mobile only, reduce font size and vertical spacing while preserving the centered Cormorant typography and product imagery. The previous lifestyle message remains in the supporting paragraph. Cache-bust CSS to show the changes reliably on iOS.
