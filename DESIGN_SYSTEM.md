# The Launch Era — Website Design System
Updated 2026-10-12. Use for all public English and Spanish sales pages, demo CTAs, and future sections. Do not apply sales-page overrides to the private Command Center, booking forms or Cleaning App runtime.

## One visual language
Soft Blue Editorial: clear, premium, modern, calm; no mismatched templates, heavy glass effects, mixed decorative fonts, or giant isolated cards.

### Color tokens
| Use | Color | Hex |
| --- | --- | --- |
| Main background | Warm Ivory | `#FAF8F3` |
| Secondary surface / calm highlight | Cool Blue | `#D7EFFF` |
| Main text, primary CTA, dark story panel | Soft Black | `#191919` |
| Rare promotion or small accent only | Butter Yellow | `#F2D85B` |
| Support background | Ice Blue | `#EAF4FC` |
| Body secondary text | Slate | `#52616B` |
| Borders | Pale Slate | `#D9E3E8` |

No mauve, sage green, pink, brown or extra accent colors on public pages. Blue is a soft corporate background, not dark navy.

### Typography
- Headlines: Prompt, weights 500–600 only, consistent sentence case.
- Body/UI: Futura where installed, else loaded DM Sans. Do not mix Libre Caslon, Georgia and other display serifs into public page headlines.
- Readable body copy: approximately 14–16 px; diagrams can use 11–13 px, but core selling text must not drop below 13 px on desktop.
- Limit headlines to 2–3 comfortable lines, with balanced wrapping and a max width.

### Layout / desktop
- Content max width 1170 px, with 32 px side gutters on most desktop screens.
- Header approximately 76 px.
- Photo hero 515–625 px on desktop; one clear value statement, no excessive upper whitespace.
- 3 columns for home service cards from 768 px upward, consistent image aspect ratios and titles.
- Sections around 45–60 px vertical padding; avoid blank 100+ px transition gaps.
- Rounded corners 16–23 px; understated borders and shadows.
- Primary CTA soft black; secondary CTA cool blue; Butter Yellow only for offer badges.
- Keep photos real and human; screenshot-based product previews whenever practical. No heavy blur or overpowering white wash.
- Never turn the experience into 5 unrelated full-screen visual themes.

### Scroll behavior
Maintain a smooth editorial hierarchy: hero → solution cards → problem → preview → how it works → inquiry → CTA. Reduce unnecessary motions, hover shifts and large empty space. Do not add sticky overlays that hide content, and preserve reduced-motion support.

### Responsive and QA
Test English and Spanish at 320, 390, 768, 1024, 1280, and 1440 px. Check no horizontal scrolling or clipped CTA, all forms and chat widgets readable, cards align, headings wrap, and anchors remain accessible. Never change approved copy, product names, prices, checkout behavior, consent wording, or automations as part of a visual-only edit.

### Implementation
The central visual override is `public/assets/tle-editorial-refresh.css`; `src/routes/__root.tsx` loads it **after** `/assets/tle-sales.css` and `/assets/tle-mobile.css`. Preserve this order. New public pages must reuse the same palette and font pair.
## SaaS product design rule — 2026-10-13
- Use recognizable product surfaces or clearly labeled fictional demo data, never decorative dashboards that imply real customers.
- One primary action per decision point; hero and closing CTA can serve the same goal, but never repeat Get in Touch twice in the footer or put extra contact links immediately after the inquiry form.
- UI affordance: a compact diagonal arrow inside a rounded-square icon container, not dozens of oversized free-standing arrows in flow diagrams. Preserve accessible text labels.
- Depth comes from careful spacing, responsive cards, readable typography and clear states; avoid ornamental soap bubbles and heavy AI-like collages.
- Public marketing SaaS layer: public/assets/tle-saas-ui-v1.css. Public prospect sample theme only: public/assets/tle-demo-blue-v5.css. Never touch client-specific booking forms or Command Centers through those selectors.
- Respect prefers-reduced-motion and real keyboard focus rings. Verify 360/390/820/1440 widths.

## Public Cleaning demo booking layout contract — 2026-10-13
- Follow the approved editorial booking reference: light ivory sample panel with `Choose a service`, two accessible residential/commercial tabs, rich service cards with real SVG icons and integrated rounded arrow affordances, then a split home photograph + charcoal `A BETTER EXPERIENCE` directly **below the booking panel**. Do not place this feature above the service selector or hide it again.
- `public/assets/tle-demo-booking-v7.css` is loaded after v6 and owns the public sample version. Do not apply to authenticated buyer or owner previews (`html:not(.demo-editorial)`).
- Use Prompt for headings and Futura with loaded DM Sans fallback for body/UI. Keep minimum readable service labels, keyboard focus, rounded primary `Begin` anchor and no false CTA-looking static status badge.
- Preserve all `startResidential`, `startQuote`, `startCommercial`, `showMain`, `setCategory`, booking state and service prices. Only public sample cosmetic layout and translations may be edited.
- Sample flow hero CTA and Services menu go to `#bookingStarter`. `#demoCinematicStory` must be immediately after the `.panel`, before any optional footer or extra marketing section; do not introduce redundant sections above booking.
