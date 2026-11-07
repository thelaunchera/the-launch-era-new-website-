# The Launch Era | Distinct demo hero art direction | Nov 7, 2026
Source inspiration: "5 Hero Styles: The Workflow". These are independently adapted, brand-specific CSS motions; no source text or hero images are copied.

- **Wordmark** AFTR, SOVA: large brand lettering, visual product anchor, sequential entrance.
- **Split** Golden Grid, Lavender Edit, Claudia: large readable headline next to original work/photo. Claudia is a private sample booking page and keeps its simulation unchanged.
- **Full-Bleed** Casa Brownie (existing video + poster), CRUMB, Havana 19, La Vie in Pink, Ivory & Bloom, Angela: original hero photography is central with text/actions revealed in reading order.
- **Orbit-inspired** Marea Wigs: a small secondary verified campaign photo is layered over the existing main visual at desktop only; it is hidden on mobile to reduce download cost.
- `/demos/umbral/` is a redirect to Havana 19, not a separate demo. It intentionally remains unchanged.

Implementation: Every affected demo gets a single scoped CSS file `hero-art-direction-20261107.css` after existing styles. Each HTML change is only that stylesheet link. The code adds no scripts, fake products, fake team photos, new prices, customer data, form behavior, checkout changes, or new third-party fonts. Motion uses transform/scale/opacity and honors prefers-reduced-motion.

Pre-release QA: run `node scripts/qa-route-integrity.mjs --static` and existing Casa Brownie, CRUMB, Ivory & Bloom and Pages checks. Visual QA at 360, 390, 768, 1024, 1440; inspect actual photos, iPhone hero order, focusable CTAs, bilingual selectors, booking sample flows, no overflow and reduced motion. Do not claim deployment success until GitHub Pages and live routes verified.
