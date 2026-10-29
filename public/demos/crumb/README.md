# CRUMB — cookie shop demo

Official editable source: `public/demos/crumb/` in this repository, alongside Casa Brownie.
Public route: `https://thelaunchera.com/demos/crumb/`.
Original AppDeploy prototype: `https://crumb-cookies-animated-demo-w1fcop.v2.appdeploy.ai/` (historical source only; future edits belong here).

## Edit here

- `index.html`: store sections, six flavors, local delivery and gift builder dialogs.
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
