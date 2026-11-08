# Hero Motion — Canva batch 1 (10 exports)

Staging / not published. Preserve the approved original hero photographs. User has provided ten distinct 5.013-second portrait MP4 exports (512×682); sound has been removed and H.264 fast-start copies prepared. Videos are available in the conversation asset package, not yet in the GitHub repository. DO NOT claim any cinematic video is deployed until the binary file is actually committed and Pages/Safari are checked.

| Source order | Brand | Expected relative file | Status |
|---|---|---|---|
| 1 | CRUMB | public/demos/crumb/media/hero-motion-20261108.mp4 | Pending binary + QA |
| 2 | Casa Brownie | public/demos/casa-brownie/media/hero-motion-20261108.mp4 | Pending binary + QA |
| 3 | Havana 19 | public/demos/havana-19/media/hero-motion-20261108.mp4 | Pending binary + QA |
| 4 | Ivory & Bloom | public/demos/ivory-and-bloom/media/hero-motion-20261108.mp4 | Pending binary + QA |
| 5 | Marea Wigs Miami | public/demos/marea-wigs-miami/media/hero-motion-20261108.mp4 | **HOLD** — exact approved face and wig comparison |
| 6 | La Vie in Pink | public/demos/la-vie-in-pink/media/hero-motion-20261108.mp4 | **HOLD** — exported coffee/croissant scene differs from approved storefront hero |
| 7 | AFTR | public/demos/aftr/media/hero-motion-20261108.mp4 | Pending binary + QA |
| 8 | Lavender Edit | public/demos/lavender-edit/media/hero-motion-20261108.mp4 | Pending binary + QA |
| 9 | Experience Cleaning | public/experience-cleaning/media/hero-motion-20261108.mp4 | **HOLD** — ensure no invented uniform logo and same worker/home |

Each folder must also contain `hero-motion-poster.webp`. Existing approval images remain unchanged; helper progressive enhancement is in `public/assets/tle-demo-scroll-art-20261108.js` on this staging branch. The missing asset HEAD probe is deliberate; a missing video produces no visible change. Wide hero videos are mobile-first because portrait video at 512px is not sufficient for full-bleed desktop. Existing desktop cursor/scroll depth remains functional.

To release: commit each approved MP4 and poster in its expected folder; inspect actual original and export side-by-side; verify responsive media, cursor and scroll, reduced motion, image fallback, no autoplay audio, checkout, gallery, reservations and URLs. Only then merge/release and update the private Studio once; do not duplicate demos.
