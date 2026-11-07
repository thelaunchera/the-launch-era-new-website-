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
