# The Launch Era — actual external design-tool installation

This is a **real checked-in installation** of the original upstream tools, not a summary of five links. The installation runs in an isolated GitHub review branch and commits selected original skill files back into the project.

## Installed source and pin

| Original source | Installed project path | Pinned upstream revision |
| --- | --- | --- |
| Leonxlnx/taste-skill (current `design-taste-frontend` 2.5.1) | `.agents/skills/design-taste-frontend/` | `f6b76575f949707b4e3c37cd86cb44b0b98643e8` |
| vercel-labs/agent-skills `web-design-guidelines` | `.agents/skills/web-design-guidelines/` | `1a2c79d4e6c4a2283dc2c614b6538cbe1ed5ca62` |
| microsoft/playwright-cli `playwright-cli` skills | `.agents/skills/playwright-cli/` | `b21724888b8100b05ef8dee3a92f2bb03bf4dcde` |
| VoltAgent/awesome-design-md, selected DESIGN.md references | `.agents/design-inspirations/` | `fcc70284932276d085f01ef9f83edde90b1258cb` |

There are **four distinct upstream repositories** behind the five Instagram resources: Taste Skill and Image to Code came from the same repository. The old `skills/image-to-code-skill/SKILL.md` URL no longer exists on current main; don't pretend it was installed. Taste's currently maintained `design-taste-frontend` skill includes the image-first workflow, photography references and real browser checking.

## Use

First read the repository's **existing** `AGENTS.md`, `DESIGN.md`, `DESIGN_SYSTEM.md` (for TLE corporate pages), and mandatory `skills/the-launch-era-qa/SKILL.md`. Then read the original installed `.agents/skills/design-taste-frontend/SKILL.md`, especially `references/photos.md`, `references/sections.md`, `references/layout-v4.md`, `references/copy.md` and its `scripts/consistency.mjs` / `scripts/gate.mjs`.

To refresh the exact same vetted versions locally or on another agent:

```sh
bash scripts/install-real-design-skills.sh
```

For the optional *real executable* Playwright CLI in development/QA (not production):

```sh
bash scripts/install-real-design-skills.sh --with-cli
.tools/playwright-cli/node_modules/.bin/playwright-cli --help
```

The upstream skills are authored for agents; committing SKILL.md files makes them discoverable in `.agents/skills`, but **does not automatically rewrite** any website. A redesign task must explicitly apply the relevant skill and run the tests.

**Design principles for Delicious Tacos and other restaurants:** use genuine owner-supplied food photography first, or clearly labeled licensed stand-ins while waiting for permission; no repeated synthetic SVG taco art, card grids and fake-brand graphic decorations as the entire visual identity. Establish a real subject, believable brand tone, distinct photo directions, deliberate hierarchy, mobile navigation and menu behavior. Avoid copying Airbnb, Apple or other reference brands.

## Security and licensing

- Vendor content remains unmodified; original source files and copyright notices stay available at `docs/vendor-licenses/`.
- Source pins prevent silently pulling breaking updates.
- The Vercel source `web-design-guidelines` is fetched as an original skill file; the pinned repo does not publish a root LICENSE in this snapshot. Do not assert an unsupported license. Check licensing before redistributing outside this project's authorized use.
- Playwright executable installs under `.tools/` only in the local/CI workflow; it is intentionally **not** added to the public site's `package.json` or deployment output.
- Never allow upstream screenshots, content examples or code to access API secrets, mutate real customers, send emails or create orders. The repo's TLE tenant, brand, route, accessibility and privacy policy has priority.
- Design references are learning material, not license to copy anyone else's brand.
- To upgrade, review source changes and update the pinned SHAs explicitly; rerun QA before merging.

## QA and scope

The installation CI verifies actual upstream source files, Taste checkers, optional Playwright CLI `--help` and existing route integrity. It does **not** claim Delicious Tacos has been redesigned. That work belongs to its isolated demo PR. Browser QA and owner-approved photography remain separate release gates.
