<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep shared website navigation and footer in the root route, with reusable editorial sections outside routes, so every page has consistent chrome.
- Keep contact requests presentation-only until a delivery service is connected; never imply a request was sent without delivery.
- Use leaf-route metadata and real route links for every major website section so each page is shareable and independently described.

## Mandatory TLE QA skill (all future client releases)
Before any change to websites, buttons, Command Centers, authentication, emails, demos, booking, AI assistant, client branding or Supabase functions, read `skills/the-launch-era-qa/SKILL.md`, `skills/the-launch-era-qa/ROUTE_MAP.md` and `skills/the-launch-era-qa/INCIDENT_LOG.md`. Update the map and incident log when modifying routes or fixing bugs. Run `node scripts/qa-route-integrity.mjs --static` and relevant existing Playwright checks before claiming success. Keep current/future tenants isolated (CB Depot is car detailing; do not reuse its data, assets, legal pages or messages for cleaners). Do not silently modify or resend real customer data. Do not claim a fix without browser/provider/database verification.

## Permanent demo creative order — 2026-11-07 (owner approved)
Applies to **all new TLE demo brands**, never fabricate/skip these gates:
1. MOODBOARD first: establish distinct editorial direction, colors, readable typography, mobile hero structure, logo references and brand-specific patterns; obtain an approved direction.
2. PHOTOS second: prepare separate original photographs for each site section and human/store/product shots, with correct brand names, sources, licenses, aspect ratios and prompts; approve the visual set. Never use one brand's photo in another.
3. LOGO third: finalize and approve one original, legible, high-quality logo/wordmark (including appropriate transparent light/dark versions) consistent with the approved moodboard.
4. DEMO LAST: only after approved moodboard + photos + logo, build the working bilingual mobile-first website in GitHub and publish via GitHub Pages, then verify links, brand assets, Safari and record in Studio. No app deploy, no placeholder presented as a finished demo.
Do not mark a demo 'finished' or publicly publish its kit to the class automatically. Owner explicitly unlocks classroom bonuses.

### Global visual prohibitions for current and future demos
- **No** starburst Unicode glyphs that render as fluorescent/green emoji, green emoji, mail/sparkle emoji fillers, decorative blue arrows, diagonal-arrow buttons, or substitute middot/star badges in place of a real brand logo. Specific examples forbidden as ornamental UI: ✳, ✱, ❇, 🟩, 🟢, ✅, 💚, ✨, 📩.
- Do **not** replace a banned emoji with another random star, icon or dot. Remove the ornament. Text-only CTAs with 44px+ touch targets are preferred; keep meaningful accessibility, Back and Close controls working.
- Brand-specific logos and approved original visual assets are the only identifying marks. Do not use an invented generic symbol as a logo. Avoid decorative arrows in every new demo and remove from existing ones when found.
- Test at iPhone width, including reduced-motion and clear CTA spacing. The enforced source+compiled symbol scan is `node scripts/qa-demo-decorative-icons.mjs`.


## Adapted TLE creative and visual QA workflow — 2026-11-15
For frontend design, redesign, brand demo work or visually weak interfaces, also read `DESIGN.md` and `skills/tle-creative-toolkit/SKILL.md`. Use the brand-isolated `docs/DEMO-DESIGN-BRIEF-TEMPLATE.md` only as a starting structure after checking existing approved assets. Taste Skill, Vercel Web Design Guidelines, Image to Code, Awesome DESIGN.md, and Playwright CLI are design/QA references, not runtime dependencies or permission to clone another company's visual identity.
Preserve the approved moodboard → individual photos → logo → demo order, the existing mandatory QA skill, route/tenant privacy, production logic, and GitHub Pages validation. External skill or CLI installation must never silently modify release dependencies or published client sites.


## REAL installed upstream design skills (2026-11-15)
The original third-party skill directories are vendored (with pinned upstream commits and available license notices), not paraphrased, in:
- `.agents/skills/design-taste-frontend/` — current upstream Taste Skill with its real scripts, assets, references, and browser quality gate.
- `.agents/skills/web-design-guidelines/` — Vercel's original web-design-guidelines SKILL.md.
- `.agents/skills/playwright-cli/` — Microsoft's Playwright CLI original SKILL.md + references. To install the executable locally, run `bash scripts/install-real-design-skills.sh --with-cli` (Node 22+); CI installs it in an isolated developer-only location.
- `.agents/design-inspirations/{airbnb,figma,apple}/DESIGN.md` — read-only patterns from VoltAgent; these are NOT TLE's or a prospect's brand identities.
Read `docs/DESIGN-SKILL-INSTALLATION.md` and the applicable upstream `SKILL.md` before any redesign. Run the actual checkers after implementation. Upstream scripts are third-party tools and must not receive secrets or execute real customer actions. Project-specific brand approvals, privacy, separate client assets, and mandatory TLE QA gates override any generic upstream guideline. In particular, do NOT let a generic rule replace a business's verified phone/address, functional links, or legally required content.
The previously linked `skills/image-to-code-skill/SKILL.md` path is no longer present in the current Taste Skill upstream repository; use its live design-to-code process instead, without claiming that missing historical skill was installed.
