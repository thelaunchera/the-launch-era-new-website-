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
