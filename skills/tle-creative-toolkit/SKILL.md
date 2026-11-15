---
name: tle-creative-toolkit
description: Use for The Launch Era website and client demo design, image-reference-to-code, visual QA, and improving generic-looking frontend work. Adapts five publicly documented design/code/QA resources to TLE's existing approved brand and release process.
version: 2026-11-15
---

# The Launch Era — creative design-to-code workflow

This is a LOCAL TLE operating skill, not a copy or an automatic installer of third-party code. Its purpose is to make design work repeatable and improve finished UI without touching production runtime dependencies.

## First: non-negotiable project safety

1. Read AGENTS.md, DESIGN.md, DESIGN_SYSTEM.md (for TLE pages), skills/the-launch-era-qa/SKILL.md, its ROUTE_MAP.md and INCIDENT_LOG.md, and docs/DEMO-PRODUCTION-PIPELINE.md.
2. Identify the correct repo, route, client/tenant, approved assets, current design, language, and hosting destination. Check prior demos and Studio before creating anything new. The public corporate site, private Studio, commercial Content Lab, Cleaning App, customer Admin Panel, and brand demos are distinct products and data scopes.
3. Preserve approved functionality: auth, checkout, client booking, inquiries, prices, forms, emails, automations and client assets. A visual task never authorizes changing them.
4. New demo creative order stays: approved moodboard -> approved original individual photos -> approved logo -> build. No screenshot or image-to-code technique bypasses this.

## Source-to-purpose mapping

| Resource | External source | Use in TLE | Constraint |
| --- | --- | --- | --- |
| Taste Skill | https://github.com/Leonxlnx/taste-skill | Art direction, careful copy hierarchy, photo selection, calm motion and avoidance of generic UI | Apply selectively, not its rigid layout rules if they conflict with TLE approvals |
| Web Design Guidelines | https://github.com/vercel-labs/agent-skills/tree/main/skills/web-design-guidelines | Audit accessibility, buttons, contrast, layout, focus, input states and mobile UX | Reference current original guidelines; keep existing TLE QA gates |
| Image to Code | https://github.com/Leonxlnx/taste-skill/blob/main/skills/image-to-code-skill/SKILL.md | Extract layout, type, rhythm and interactions from an owner-approved original visual reference | Do not generate a replacement for an already-approved brand/photo/logo or copy a third-party site |
| Awesome DESIGN.md | https://github.com/VoltAgent/awesome-design-md | Use the design-token/specification format for TLE's own DESIGN.md and each brand brief | Other brands' identities are inspiration, not copyable templates |
| Playwright CLI | https://github.com/microsoft/playwright-cli | Optional interactive browser review, screenshots, console and navigation evidence | Developer/QA only; never import into client bundle or run write actions on production customer data |

The resource repos include MIT-licensed instruction/design resources and the Playwright CLI is Apache-2.0; inspect each current license/asset attribution before copying any file. Reference links do not install code or transfer third-party copyright. Prefer locally authored instructions, not vendor files.

## Design and implementation steps

### 1. Creative brief
- For client demos, duplicate the LOCAL template docs/DEMO-DESIGN-BRIEF-TEMPLATE.md to the brand's private approved workspace, NOT another client's folder or an automatically published route.
- Define brand character, distinct visual motif, type pairing, palette, page sections, hero crop, approved photos and logo, interactions, English/Spanish copy and real CTAs.
- Ensure moodboard, individual photos and logo have received the required owner approval before implementation.

### 2. Design-to-code
- Start from approved screenshots, brand board, reference compositions and individual assets, not a generic CSS starter.
- Analyze layout proportions, responsive breakpoints, typography, actual text, layering, image focal points and effects. Record elements that cannot be converted directly from a static image (interactions, menus, checkout, navigation).
- Build real semantic HTML/CSS/React as appropriate. Keep text editable and actions functional; do not use one big baked screenshot as the webpage.
- For the main TLE website use DESIGN.md + DESIGN_SYSTEM.md. For client demos apply their own approved identity, not TLE colors.
- Prefer a single brand-specific signature interaction, meaningful transitions, responsive layout, accessible keyboard support and prefers-reduced-motion.

### 3. QA and evidence
- Execute node scripts/qa-route-integrity.mjs --static and all existing checks relevant to the changed routes. Follow the existing QA skill.
- Browser-check widths 375/390, 768/820, 1024 and 1440 where possible, with iPhone/Safari acceptance separately. Check navigation, buttons, form states, menus, photo crops, page overflow, keyboard focus, reduced motion, console and network.
- Optional developer-only CLI: Node 20+ is required for Playwright CLI. Install with npm install -g @playwright/cli@latest and consult upstream --help; or use npx playwright cli with Playwright 1.59+ already available. This is NOT a required dependency for deployment. Existing Playwright test files remain authoritative.
- Save a before/after visual comparison and list the exact tested URLs, devices, pass/fail findings and outstanding gaps. A screenshot alone does not validate the underlying interaction.
- Never call a demo published before GitHub Pages URL, deployment and functional browser checks are confirmed.

### 4. Safe handoff
- Keep work on a review branch and PR. No direct overwrite of published tenant data and no new integrations to Supabase, Make, Stripe, CRM, forms or email without a separately scoped task.
- Record the canonical GitHub Pages URL, source repo and Drive kit in private Studio only after confirmed publication. Do not expose private client materials in public demos or upload to commercial Content Lab.

## Quality definition
Original to the client's brand; design-faithful without copying others; readable and polished on iPhone; separate approved photos and logo; functional interactions; no decorative clutter; tested existing functionality; truthful publication status.