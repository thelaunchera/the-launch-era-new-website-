# THE LAUNCH ERA — Hero Motion Production Board
**Internal creative production · 2026-11-08 · Not public website copy**

## Scope and approvals
16 concept demos. Existing websites/approved hero images are the reference of truth. The new 16 generated images are **candidate animation frames**, not automatically approved replacements or finished motion layers. Do not publish any replacement unless its source imagery, subject, brand identity, crop and typography space match the original. Do not put generic transparent overlays on the finished image and claim they represent object motion. One distinct narrative hero animation per brand; scroll, gallery, cart and form actions remain independently functional.

## Status at creation
- All 16 proposed visual motion ideas and their individual static candidate images are in the conversation/working environment. Their binary image files are **not uploaded by this document** to GitHub, Studio or Drive.
- Layered isolated elements, clean background fills, actual timed animation, real iPhone QA and final brand art approvals **are not yet done**.
- Existing original demo files and GitHub Pages deployments must not be overwritten as an unreviewed batch.
- The first eight images originated in a mix of individually generated frames and crops from a combined draft; always use a single individually generated full-resolution source, never an upscaled collage crop, as the final motion master.
- Visually inconsistent candidates to correct before any substitution: La Vie in Pink candidate is a tabletop croissant/coffee image while the specified hero is the storefront; Golden's candidate may omit the approved sky-blue packaging; cleaning candidate contains a generated uniform logotype; Jaramillo/Marea/other people may not be the identical approved person. CRUMB/Seasonal/WOK signage must be compared to actual source pixels. Preserve approved faces, logos and product shape.

## Deliverable contract per hero
`reference-original` (existing website asset, untouched)
`approved-static` (new source frame, only after review)
`background-clean.webp` (scene behind isolated moving element)
`foreground-object.png` (transparent cutout where needed)
`effect-overlay.webm` or `.mp4` (only when liquid/hair/steam/light cannot look realistic with CSS)
`motion.js/css` (single control, independent of checkout and forms)
`poster.webp` (mobile/reduced-motion fallback)
`README.md` (timings, layers, prompts, links, QA).

Do not render labels or replace the browser's text as raster images. On the live site prefer existing image as poster, then progressive enhancement. No jerky perpetual loops, extra horizontal scroll, huge MP4 background or auto-playing audio. For users with `prefers-reduced-motion: reduce`, show a fully readable still hero. Motion effects must be optional and pass iPhone 360/390px, desktop and WebKit testing.

## Per-demo creative direction / exact required extra asset

| # | Brand | One hero narrative effect | Layer or production requirement | Important visual lock |
|---|---|---|---|---|
| 01 | SOVA | Minimal hand adjustment + cup reflection | Hand/earcup cutout, optional 2-frame photographic match | Same model, ivory headphones, original cobalt-blue sofa |
| 02 | Golden Grid | Amber syrup flows onto waffle; surrounding clouds very subtle | Separate syrup matte or realistic short loop, full waffle/plate isolated if any rotation, clean blue-sky/background | Exact waffle photo, butter and **approved sky-blue pouch** |
| 03 | Casa Brownie | Dark chocolate lands on brownies | Chocolate flow matte + static original brownie/packaging background | Handmade brownie texture, kraft gifts and dusty pink ribbons |
| 04 | CRUMB | Original boutique door opens 5–8° | Layered door + clean original doorway + warm light mask | Approved powder-blue façade and all signage |
| 05 | Havana 19 | Warm entrance light and a soft leaf movement | Window-glow overlay and isolated foliage | Burgundy awning, original architecture and outdoor chairs |
| 06 | Ivory & Bloom | One gentle floral placement by artist | Arm/hand/flower layer, fixed full cake and studio | Same cake tiers, artist, blush flower arrangement |
| 07 | La Vie in Pink | Window illumination with tiny coffee steam | **First generate storefront-matching still**, window-light mask, steam overlay | Hero is store exterior, not generic croissant close-up; burgundy, brown, cream, olive |
| 08 | Marea Wigs Miami | Caramel waves move in a delicate breeze | Exact model/hair strand video matte and fixed background | Same person, original wig, Miami Art Deco scene |
| 09 | AFTR | One violet light sweep across club | Light-mask pass + static architecture; no excessive disco effects | Original venue, ultraviolet/magenta, negative space for title |
| 10 | Lavender Edit | Leaf shadows pass gently over bottle | Botanical shadow overlay ONLY, bottle remains absolutely still | Exact fragrance bottle, cap, label, soft violet |
| 11 | Experience Cleaning | Countertop clarity follows cleaning hand | Surface wipe/shine matte with original worker | Same uniform, no invented company logo, original home |
| 12 | Seasonal Brew | Sunlight moves and a few autumn leaves drift | Sunlight shadow pass + a few isolated leaves | Cream awning, original storefront signage/furniture |
| 13 | SOLUNA Yoga | Very subtle natural breathing | 2–3 compatible body frames or short video; lighting stays soft | Same practitioner, beginner pose and studio |
| 14 | WOK SOCIAL | Red lanterns sway slightly | Individual lantern/cable cutouts and natural warm kitchen glow | Original black/red shop and precise signage |
| 15 | YUMMM | Cream slowly marbles in iced coffee | Short genuine liquid-motion loop or masked scene | Approved hero cup, bakery photos and palette |
| 16 | Jaramillo Boutique | Burgundy fabric shifts subtly | Same model and garment 2–3 matching frames, controlled fabric mask | Exact approved face, hair, garment silhouette and ivory background |

## Implementation order
**Pilot first: Golden Grid.** Compare candidate against actual approved `/demos/golden-grid/resources/golden-1.png`. If missing the blue pouch or incompatible crop, keep approved original as hero, and build syrup + cloud motion only against it. Build and validate a separate staging proof *before* touching the published hero. Confirm a realistic falling syrup edge and no plate rotation unless plate has been cleanly segmented. Keep the brand ribbon already selected as the only below-hero motion.

**Next batch:** Casa Brownie, YUMMM, Lavender Edit (product/liquid/shadow motion); then CRUMB, Havana, WOK SOCIAL, Seasonal Brew (architectural lighting/props); then SOVA, Marea, Ivory, SOLUNA, Jaramillo (people/face/wardrobe consistency); then AFTR, La Vie in Pink, Experience Cleaning (special scene checks). Release only individually verified brands.

## Release gate per demo
1. Compare old and new hero at identical crop in desktop and 390px iPhone; no new face/logo/package, no collision with headline/CTA.
2. Validate layer edges, poster display before motion loads, no layout shift, no janky scroll or compromised forms, cart or age gate.
3. Test WebKit Safari/iPhone 360 and 390, browser CPU/memory and fallback to still on slower connection / reduced motion.
4. Upload only final approved assets to that demo's own source folder, preserving the original and history; update the exact demo once.
5. Verify GitHub Pages deployment and live asset link, then register original/animated image paths and status in the private Studio with no duplicate demo entries.

**Current state:** motion design and QA production specifications organized; no 16 hero animations claimed finished or published.


## Interactive cursor + scroll layer — 2026-11-08
**Implemented in code:** Both production repositories have a shared `tle-demo-scroll-art-20261108.{js,css}` extension for 16 brand-scoped heroes. Original imagery is preserved; the added layer uses mouse-position depth on hover-capable desktop, scroll-based image/copy separation on touch and desktop, and still photos under `prefers-reduced-motion`. The effect does not change checkout, language toggles, booking, forms, galleries, page routes or the approved hero's camera framing. Both shared assets and each of the 16 hero HTML pages now reference cache revision `v=3`, with Jaramillo sourced from its approved boutique branch.

**Verified:** Secondary repository browser workflow `42512071812` succeeded across Seasonal Brew, SOLUNA, WOK SOCIAL, YUMMM and Jaramillo on Chromium/iPhone, WebKit, desktop pointer and reduced-motion. Secondary Pages deploy `42512457306` succeeded. Main website Pages `42512297482` succeeded. Main editorial QA: under investigation because the preexisting 3-hero Playwright check did not find a visible Golden Grid hero after DOM load in CI; separate image/cursor QA has not been marked passed. Physical iPhone approval remains outstanding.

**Not yet done:** MP4 recordings from Canva, authentic isolated object-video layers for syrup/hair/fabric, video scrubbing based on scroll, public-video replacements, Studio/Drive uploads. These depend on reviewing the actual exported MP4 files and confirming visual continuity. Never mark the 16 cinematic videos complete based on CSS depth alone.


## Canva MP4 ingestion checkpoint — 8 November 2026

- 16 individual exported Canva MP4s received and identified from actual frames, all compressed, poster frames generated, and saved to their brand-specific Google Drive folders. Files are also packaged as a 16-video deployment archive in this conversation.
- **10 demos now contain a progressive video loader committed to production GitHub HTML**: CRUMB, Casa Brownie, Havana 19, Ivory & Bloom, AFTR, Lavender Edit, Seasonal Brew, WOK SOCIAL, SOLUNA Yoga and YUMMM. Both production repos include the loader. It sends no form or checkout events and does not alter the original still photograph; it activates video only when the expected same-directory MP4 is present. YUMMM loader targets its coffee slide, not its storefront slide.
- **6 demo videos intentionally held for original-art consistency**: Marea Wigs Miami, La Vie in Pink, Experience Cleaning, Jaramillo Boutique, SOVA, Golden Grid. Do not change the approved people, branding, storefront, clothing, or packaging without crop-by-crop QA.
- **Critical publishing blocker**: The connected GitHub text editing tools do not accept binary MP4 files or local file_uri, and the container has no public GitHub network access. All 16 video binaries are in Drive and the verified local deployment archive, **not in the GitHub repos**. Current GitHub Pages deployments therefore show the previously approved hero photographs, not the new videos. Do not report completion until each MP4 is actually committed through a capable binary upload method, deployed and verified.
- The code-level loader responds to cursor/scroll work already present and honors reduced-motion, browser visibility, and data saving. Once the actual MP4s are available in the matching /media paths, recheck autoplay, placement, faces and crops, gallery interactions, iPhone Safari and both repository deploy statuses.
- One empty `public/demos/crumb/media/.gitkeep` folder placeholder was created, without publishing any MP4.
