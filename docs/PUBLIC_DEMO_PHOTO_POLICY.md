# Public demo photo policy — The Launch Era

**Owner directive (2026-11-10):** People visiting any public demo must not see a download button for brand photography. Campaign pictures are view-only previews.

## Public surface
- Never show `Download original PNG`, `Descargar PNG original`, equivalent download text, or an `<a download>` link to a public brand photo.
- Photo dialogs may show a larger picture and support Close / Previous / Next.
- The small public-demo media guard `/assets/tle-demo-view-only-media-20261110.js` is included in every `public/demos/**/index.html` and in the five standalone showcase roots: `/booking-demo/`, `/cleaning-app-demo/`, `/experience-cleaning/`, `/sample-cleaning/`, and `/portfolio/`. It discourages casual image drag, desktop right-click saving and iOS long-press context menus without disabling gallery clicks.
- Preserve all editorial photos, thumbnails, screen-reader alt text, shopping and booking UI, reduced-motion preferences and brand-specific animations.
- Keep source files `demo-source/**/index.html` in sync so a future build does not drop the guard.
- New demos must pass `node scripts/qa-public-demo-view-only-media-20261110.mjs` and the iPhone-size browser test.

## Private administration
This rule **does not apply** to private Studio, brand board creator, Content Lab owners, existing admin libraries, PNG exports or licensed product downloads. Their legitimate editing/export workflows must remain available.

## Technical limit
A public image rendered in a browser is retrievable from page resources or can be screen-captured. Removing save actions and blocking context menus **cannot guarantee protection from copying**. Do not tell customers or the owner that images are impossible to save.

For stronger protection of master assets, store originals behind authenticated access and publish only purpose-made lower-resolution or watermarked website previews. That would require a separate approved asset migration with visual QA so demo photography is not degraded unintentionally.
