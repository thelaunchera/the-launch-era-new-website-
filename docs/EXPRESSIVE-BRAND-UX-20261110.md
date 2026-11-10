# The Launch Era — expressive brand design, 10 November 2026

## Why
2026 design references favor unmistakable typography, strong palettes, restrained
handcrafted accents, accessible components and purposeful micro-interactions.
Research: Figma 2026 web design trends, Canva “Imperfect by Design”, Squarespace
Circle design trends and WCAG accessibility guidance.

## Phase 1: safe, brand-specific accents
Opt in **existing** demos only by linking `/assets/tle-expressive-brand-ux-20261110.css`
in the head. Source already has a matching `data-tle-one-motion` attribute.
Do not apply to clients, booking/checkout pages, authenticated views or every demo.

| Brand | Accent direction | Preserve |
| --- | --- | --- |
| La Vie in Pink | Patisserie ink-pink editorial underline and airy type | pink photography, native demo bag, hero |
| Havana 19 | Copper architectural rule and food-first titles | booking date/party form, hero colors, bilingual strings |
| Casa Brownie | Warm ribbon-inspired rule and gift-led text rhythm | interactive flavor selection, order preview and media |
| Golden Grid | Yellow/ink graphic segments and optimistic lettering | approved full-frame photo and tablet video gate |
| Sneekiefs | Sandstone-orange streetwear focus and navigation | selected sneaker photos, sizes, bag and wishlist |
| SOVA | Cobalt minimal typography and accessible focus | original high-res model hero and sound product UX |

Lavanda is deliberately **not** changed here while another owner-directed edit
is active; no edits should collide with that workflow.

## Shared UX requirements
- Keyboard and switch/voice controls stay recognizable. Focus rings work
  without hover; at least 44px tap targets for primary mobile navigation.
- Prefer brand-authored graphics in separate transparent images. Never add
  generic green emoji, starbursts or automatic fake logos.
- Any scroll/hover treatment must respect reduced motion and not animate
  customer actions, pricing, media, canvas content or checkout.
- Studio private projects and the commercial Content Lab retain separate owners
  and private data. Their shared stylesheet may improve navigation presentation
  but must not change editor state or exports.

## Verification boundary
Static regression: `node scripts/qa-expressive-brand-ux-20261110.mjs`.
Also run `node scripts/qa-route-integrity.mjs --static`,
`node scripts/qa-demo-decorative-icons.mjs`, applicable Playwright routes,
GitHub Pages deploy and actual mobile Safari / bilingual smoke checks.
A commit or PR is not evidence that production devices have been tested.
