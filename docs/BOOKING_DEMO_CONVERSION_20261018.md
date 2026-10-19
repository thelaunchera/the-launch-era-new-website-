# Booking Demo — conversion experience (October 18, 2026)

**Status: STAGED ONLY. NOT DEPLOYED.** The live private demo is served from the protected \`tle-booking-demo-gate\` Supabase function, *not* the public GitHub tree. These files contain only public-ready styling/DOM enhancement logic, not any private demo markup, tokens, prospect data or auth bypass.

## Why
The existing private Booking Demo already includes a 3-step booking flow, Residential / Commercial and quote request options, Owner tab, and lead-status walkthrough. Do **not** duplicate or replace them. Instead demonstrate a memorable visual transformation, put the buyer's business name in a visual preview, and connect the currently non-purchasing closing button to the actual Booking Automation product page.

## Staged assets
- \`public/assets/tle-private-demo-conversion.css\` — scoped ivory/soft-black/powder-blue responsive section, accessible comparison handle and subtle interactions.
- \`public/assets/tle-private-demo-conversion.js\` — fail-closed mount requiring *both* \`#customerView\` and \`#ownerView\` inside the server-served, already-authorized demo. It adds Drive photo stories, a genuine matched Before/After slider, local-only branding, and real product CTA. It also ensures the hero's Try Booking Flow returns to customer form rather than an unrelated modal.
- Zero changes to the public request gate, sign-in, consent, owner preview rights, backend, checkout, price, email, service classification, or existing buyers.

## Reference direction (Pinterest — inspiration, never copy)
- Cleaning booking screen layout: https://www.pinterest.com/pin/237635317823809260/
- Cleaning editorial landing page: https://in.pinterest.com/pin/cleaning-landing-page-template-cleanly-with-booking-page--849139704715989333/
- Interactive before/after comparison: https://in.pinterest.com/pin/the-best-way-to-add-before-after-image-slider-to-your-site-create-an-awesome-slider-over-to-showcase-your-before-after--716776096925422235/
- Clean owner CRM: https://www.pinterest.com/pin/825847650413179548/

## Drive photos selected by owner library
Source images are licensed/owner-controlled *sample photographs*, not verified customer testimonials:
- Residential cleaner: Drive \`1S6jtvi5zjF_406RSvYqmKWWIu5IZwpmG\` → optimized \`/assets/demo-services/regular.webp\`
- Commercial cleaner: Drive \`1D56-v3lVV6FpBqW3FqYH442kiPVvjlLT\` → optimized \`/assets/demo-services/office.webp\`
- Same bathroom: \`1a7BDMhN69nn3JU1eaq3HhxepR0fVGOF0\` and \`1OWiVlmtTiDOs6ZYDyEOzo6bG8LAd915d\` → \`/assets/demo-transformations/grout-before.webp\`, \`grout-after.webp\`.
- Deep cleaning detail: \`1XeSx3BLRzsnBORYJfexjObaqRCCqrRLV\`; commercial entry glass \`173q939tEw2c0I1jLFv8nkMtQEECNib10\` available to broaden image usage after review.

These Drive assets are referenced by the existing \`scripts/build_demo_photo_assets.py\` image optimization pipeline. **The optimized images are NOT committed to the repo at this stage.** A release must generate and verify them and confirm they're served at the actual domain. If either comparison image fails to load, the component hides the comparison instead of faking the result.

## Controlled release plan — do not skip
1. Consolidate with other pending changes and secure approval for an end-of-day controlled batch. Rebase against latest \`main\` and ensure no concurrent edits to the server-only private Booking template.
2. Run \`python scripts/build_demo_photo_assets.py\` with Drive access and install optimized WebP output into the GitHub Pages build/public artifact. Verify exact image URLs, same-scene matching and iPhone crop.
3. Once the CSS/JS assets are hosted, add ONLY these tags to the **private server-side \`booking-template.ts\`** in \`tle-booking-demo-gate\` (not a public GitHub HTML route), using fully-qualified URLs:
   - \`<link rel="stylesheet" href="https://thelaunchera.com/assets/tle-private-demo-conversion.css?v=20261018">\`
   - \`<script defer src="https://thelaunchera.com/assets/tle-private-demo-conversion.js?v=20261018"></script>\`
   Do **not** commit original protected HTML to any public branch or create a static mirror.
4. Run the mandated \`node scripts/qa-route-integrity.mjs --static\`, consent/invitation and protected signed-link tests, and relevant browser checks on 360 / 390 / 768 / 820 / 1024 / 1440px. Verify all form and quote branches; try hero CTA, the owner tour, the Before/After range and business-name input; double-check no user data is submitted.
5. Verify pricing and actual next-step CTA \`/booking-lead-automation\` reaches the approved purchase/intake flow without invented promotions or broken checkout. Test owner-only preview and negative anonymous bypass.
6. Update \`skills/the-launch-era-qa/ROUTE_MAP.md\`, \`INCIDENT_LOG.md\` and record production deployment evidence only **after** live checks. Do not say published before the protected function and public asset host are both verified.

**Risk:** This PR does not itself activate the feature in the live signed demo. Source of truth for that demo remains the private Supabase Edge Function. Do not attempt to create a public mirror, send a live test email, or grant token-free access to verify layout.
