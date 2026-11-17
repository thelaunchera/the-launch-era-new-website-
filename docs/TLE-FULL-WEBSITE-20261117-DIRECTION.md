# The Launch Era — full website creative direction (November 17, 2026)

**Status:** creative review / not deployed. This branch intentionally does NOT modify the live homepage, private Studio, Content Lab, checkout, clients or automations.

## Goal
Replace the cleaning-only sales-first impression of the public main site with an authentic, broad creative-studio website, using the existing production repository and its actual assets. This is a **full multi-page site**, not a one-page sales landing.

## Page architecture
- **Home**: hero “Your idea deserves to be seen.”; editorial work highlights; studio point of view; services; contact.
- **Work**: six real, interactive concept demo destinations, clearly labeled *concept demos*, not fake customer case studies; category filters.
- **Services**: Websites & digital experiences; creative content & direction; smart business systems. No unapproved pricing or performance claims.
- **About**: independent creative studio positioning, authentic existing founder portrait.
- **Contact**: direct mailto to the verified public company address, no fake delivery form.

## Visual system
Warm Ivory #FAF8F3 / Ink #191919 / Soft Blue #D7EFFF / accent Yellow #F2D85B. Prompt titles, DM Sans fallback; editorial imagery and typographic storytelling, measured animations, accessible mobile-first navigation, reduced-motion behavior. Avoid decorative AI-template cards, false screenshots and excessive copy.

## Existing assets and routes confirmed on main
- Brand: public/assets/brand/tle-wordmark.svg
- Preview images: public/portfolio/assets/website-demo-freska.webp; website-demo-crumb.webp; dailin-portrait.webp
- Demo destinations: /demos/freska/, /demos/crumb/, /demos/sova/, /demos/golden-grid/, /demos/casa-brownie/, /demos/penn-nails-spa/

## Prototype files produced separately for review
A downloadable 8-file HTML/CSS/JS prototype contains 5 real pages + shared styles, behavior and README. It has not been uploaded to the working site. Integration with TanStack Start and all existing production routes will be a separately tested step after visual review.

## QA so far
Local DOM/Chromium rendering at 375, 390, 768 and 1440 px: menu opens/closes with Escape; work filters show 2 lifestyle projects and restore 6; page-wide horizontal overflow absent after mobile CSS correction; no client-side page errors. Asset images were not rendered in this offline test. Local HTTP navigation was blocked (ERR_BLOCKED_BY_ADMINISTRATOR), so live URLs, deployment and Safari remain unverified. Existing source routes and asset paths were confirmed through GitHub API.

## Release gate
Before replacing main site: integrate into src/routes + shared site shell; plan bilingual URL/localization; preserve legacy public URLs; run node scripts/qa-route-integrity.mjs --static and existing route QA; test image load, forms, CTAs, responsive 360/390/768/820/1024/1440, Safari, reduced motion and production deploy.
