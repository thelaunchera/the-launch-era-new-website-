# FRESKA — Beverage Concept · The Launch Era

**Status:** Concept demo, owner visual approval and live Safari QA pending. No real business, orders, payments, emails, shipping, inventory or customer records are used.

## Original visual direction

- Working brand name: **FRESKA** (provisional until approved by owner).
- Photography: editorial pink-and-cobalt drink campaign created in the associated conversation, optimized to local WebP files. No external stock photography or assets from other demos.
- Palette: electric cobalt `#2349EF`, berry pink `#FB3A91`, blush `#FFF0F5`, mango `#FFD650`, soft cream `#FFF8F1`, near-black `#171520`.
- Type: Outfit display, Fraunces expressive italic accents, DM Sans UI/body.
- Wordmark: text-first typographic treatment, awaiting final owner approval. Favicon is a provisional initial and not a final approved logo.
- Layout: memorable lifestyle hero → six-flavor demo menu → editorial campaign → brand story → gallery → closing CTA → single original footer.
- One lead signature visual only: lifestyle photo hero. No autoplay videos, redundant ticker, or external widgets.
- EN default; ES toggle available. Default language respects `?lang=es`.

## Interactive demo behavior

- 6 illustrative flavors with **sample** USD prices and working add-to-bag / quantity / total / demo completion.
- Everything runs locally in memory: no payments, no backend, no persistence, no collected personal information, and no outgoing messages.
- Gallery image viewer with keyboard close and focus return.
- Responsive menus and accessible language toggle.
- Demo disclaimer and The Launch Era official policy navigation/credit.

## Required publication checks

1. Verify exact paths and all 9 WebP files resolve in deployment.
2. Run static QA scripts `qa-route-integrity.mjs --static` and `qa-demo-decorative-icons.mjs` in repository CI.
3. Test at 320, 360, 390, 768, 820, 1024, 1440 widths with no horizontal overflow; iPhone Safari menu/bag/gallery/EN/ES.
4. Confirm GitHub Pages deployment and `/demos/freska/` direct URL (including hard refresh), CSS, JS, favicon and images.
5. Ask owner to approve brand name/wordmark and photos before listing as finished in Studio or publishing to the Aula.
