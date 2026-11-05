# The Launch Era Brand Board Studio

This is the editable Brand Board included in the main The Launch Era website.

- Public URL after GitHub Pages publishes: https://thelaunchera.com/brand-board/
- Source: `brand-board-studio/` in `the-launch-era-new-website-`
- Official photos: linked from each original demo; they are not duplicated
- CRUMB: approved blue identity, using #477BB3, #C9E2F4 and the current hero, lifestyle, cookie products and packaging
- Projects: vertical brand-by-brand sidebar with a collapsible individual-card drawer for phones

The existing GitHub Pages workflow compiles this Vite project with `bun install && bun run build` after the main website build, placing the files in `.output/public/brand-board/`, while preserving the original domain CNAME.

## Important: local data

User-created boards, photo uploads and edits are stored in localStorage and IndexedDB *per site origin*, not a shared account. Moving from AppDeploy to thelaunchera.com does not transfer them automatically. Use **Respaldo** on the original URL, then **Importar respaldo** on the new domain to migrate edits. Never delete an older instance before creating a backup.

## Maintenance

Work on `brand-board-studio/src/`. It is separate from The Content Lab and from the private Studio. The former AppDeploy app remains independent and its updates do not sync automatically.

Run `bun install` and `bun run dev` from `brand-board-studio/` for development. Main website build and route QA are unchanged.
