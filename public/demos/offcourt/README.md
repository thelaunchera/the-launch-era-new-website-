# OFFCOURT. — Sneaker Boutique Concept
Status: **DRAFT · VISUAL APPROVAL PENDING · NOT PUBLISHED TO MAIN**
Created 2026-11-09 in the official The Launch Era GitHub repository.

## Why this draft exists
The owner requested the sneaker demo website. An audit of the public `public/demos/` collection in the official repository and `demos/` in the existing secondary demo repository found no sneaker-specific demo. This is a **new proposed concept**, not an edit to an existing approved sneaker brand.

## Proposed moodboard (NOT YET APPROVED)
- Working brand: OFFCOURT. (provisional wordmark, NOT final logo)
- Direction: streetwear editorial meets independent sneaker boutique. Large type, impactful red running-shoe hero, cream product grid, inky black feature, no ornamental icons, mobile-first story.
- Palette: warm paper `#f4f0e9`, black `#191919`, signal red `#f2492f`, off-white `#faf8f3`.
- Type: Archivo Black / Space Grotesk / DM Sans.
- Hero: split editorial on desktop, stacked copy + full-width photograph on iPhone. One static signature hero. No auto-moving ticker.
- Proposed logo: text-only working wordmark; owner must approve final original logo.

## Working features in source
- English/Spanish toggle, collection filters and sorting, six concept products, size selection, product detail overlay, cart with quantities and removable items, **simulated** order summary, responsive layout, keyboard/ESC modal controls, reduced-motion support.
- Nothing uses a database, checkout, real inventory, provider API, personal information or payments.
- Demonstration pricing only. Orders are not sent or placed.

## Temporary imagery — replace before release
Photos in `index.html` and `script.js` are external **Unsplash editorial reference photography**, not original OFFCOURT assets. Some show real third-party shoe brands. They cannot be treated as images of an actual product offered by this fictional store. Replace the entire set with **approved, distinct original brand-specific shoe, streetwear model and lifestyle photos** before public publication. Credits / licenses should be checked before public release:
- `https://unsplash.com/` (Unsplash License reference; each individual item is linked via `images.unsplash.com`).
- Need original hero shoe, six distinct sneaker product images, human editorial shot, product detail alternate views, mobile crops.
- Do not mix photos from SOVA, AFTR, Golden Grid, Lavender Edit or other demos.

## Required approval and release tasks
1. Owner reviews / approves moodboard, palette, brand name.
2. Produce original, realistic and individually approved photos; organize photos, prompts and provenance in brand-specific Drive folder.
3. Approve original transparent logo / wordmark and verify readable small size.
4. Replace temporary sources with optimized local photos in `assets/` and updated alt text; add favicon, OG card and brand kit.
5. Run mandated QA and check external media, cart + size selections, no real orders, EN/ES, 320/360/390/768/820/1024/1440 widths; test real iPhone Safari.
6. Merge, confirm GitHub Pages deployment and live `/demos/offcourt/` route; register only one canonical demo in Studio with verified URLs and asset provenance. Owner decides whether to display it on public gallery or in classroom.

## Open locally
Serve `public/` as the site root, for example:
`python3 -m http.server 8080 --directory public`
Then open `http://localhost:8080/demos/offcourt/`.

## Footers / privacy
Uses its own single footer and standard official TLE public policy routes. Never assert sales, shipping or automatic confirmation. Powered by The Launch Era.
