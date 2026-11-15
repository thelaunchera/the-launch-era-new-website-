# DESIGN.md — The Launch Era

This file is the agent-facing visual contract for design and frontend work. It adapts the DESIGN.md approach to our own brand; it is NOT a third-party brand template.

## Source of truth and precedence

1. Approved owner instructions, approved brand assets, and actual user-visible requirements.
2. AGENTS.md and skills/the-launch-era-qa/SKILL.md for safety, routes, privacy, and release checks.
3. DESIGN_SYSTEM.md for The Launch Era corporate website; docs/brand-system/the-launch-era-public-design-system-20261106.md when relevant.
4. docs/DEMO-PRODUCTION-PIPELINE.md and the approved brand-specific design brief for each demo.
5. skills/tle-creative-toolkit/SKILL.md for the design-to-code workflow.

A client demo must NOT inherit the corporate palette or identity when it has its own approved brand direction. Never clone or imply affiliation with brands analyzed in third-party DESIGN.md collections.

## Corporate palette and usage

| Token | Value | Use |
| --- | --- | --- |
| Ivory | #FAF8F3 | Main surface |
| Soft Blue | #D7EFFF | Editorial secondary panels |
| Ice Blue | #EAF4FC | Quiet support surface |
| Black | #191919 | Main text / primary CTA |
| Yellow | #F2D85B | Small promotional accent only |
| Slate | #52616B | Secondary copy |
| Border | #D9E3E8 | Fine separators |

Use Prompt for headings (500–600) and Futura for UI/body where available (DM Sans fallback). Keep strong hierarchy, intentional photography, honest product previews, and one primary action per decision. No gratuitous cards, borrowed badges, decorative arrows, green/star emojis, or irrelevant glass overlays.

## Layout and mobile

- Build for 375/390 px iPhone first, then validate at 320/360, 768/820, 1024, 1280 and 1440 px as appropriate.
- Use a consistent max content width around 1170 px on TLE sales pages, balanced margins, readable line lengths, and touch targets at least 44 px.
- Reflow in both English and Spanish; TLE public marketing copy is English-first unless an owner instruction says otherwise. Never mix text from different brands.
- Maintain accessible labels, semantic controls, keyboard focus, contrast, reduced-motion support, and logical Back / Close behavior.
- Keep hero media clear and crop-safe on phones. Never replace an approved original hero asset without authorization.

## Custom demo visual contract

Before constructing or publishing a new demo: (1) approved moodboard, (2) approved individual original photos, (3) approved logo/wordmark, (4) implementation, browser QA and publication on GitHub Pages. Refer to docs/DEMO-PRODUCTION-PIPELINE.md. Keep one canonical demo per brand and assets in that brand's own area. Do not treat reference screenshots or generated design concepts as finished source assets.

## Quality and release

Follow existing repo QA rather than replacing it with a new design check. Run node scripts/qa-route-integrity.mjs --static plus relevant existing Playwright/browser checks. Inspect responsive views, interactions, console/network errors, and image licenses. A code commit or screenshot is not proof that the published site works.

For external resources and the optional Playwright CLI reviewer workflow, read skills/tle-creative-toolkit/SKILL.md.