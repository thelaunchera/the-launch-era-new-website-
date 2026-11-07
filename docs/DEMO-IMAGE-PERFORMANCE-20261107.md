# Faster photo loading for demos · 2026-11-07

## Source-based diagnosis
Owner reports delayed photo loading in iPhone demo pages. The public demo tree has ~140 MiB of images. Six photo-heavy demos (Marea Wigs, La Vie in Pink, Golden Grid, SOVA, Lavender Edit, CRUMB) include many photographic PNG files weighing 1–3 MiB each.

## Resolution
- Keep ALL original source photographs and brand folders unchanged. Never alter master PNGs in GitHub, Studio or Drive.
- Build process uses Pillow (already installed in the Pages workflow) AFTER the website is built. Only the generated .output/public/demos/ tree is optimized.
- For PNG/JPG files above 320 kB, create a WebP file up to 1600 px on the longest side, quality 80, preserving transparency and EXIF rotation. Use only when WebP is at least 8% smaller.
- Update built HTML, CSS and JS links within each brand plus absolute /demos/ references in the main demo gallery. Keep original files as valid fallbacks.
- Preserve high-priority eager loading of the hero, and existing lazy loading of lower photos; switch two eagerly loaded library cards to lazy to reduce competition.
- GitHub Pages exposes /demos/image-performance.json with measured sizes, URL replacement counts and manifest of optimized assets. QA blocks deployments missing the image links or sufficient byte savings.
- No change to checkout, prices, booking, photo selection, logo, customer data or domain.

## Verification
Run the build pipeline with scripts/optimize_demo_photos.py and scripts/qa_demo_photo_performance.py, verify successful GitHub Pages publish, fetch /demos/image-performance.json and confirm public photos load. A confirmed size reduction is not the same as measured Safari load time; check the latter separately.