# The Launch Era — Demo market audit (10 Nov 2026)

Status: **source audit + safe draft changes**, NOT final live-browser signoff.
No public promise that a concept demo has a real store, live checkout, availability, appointment, email delivery or inventory.

## Evidence and benchmarks

- Baymard Institute, *Homepage and Category Navigation UX 2026* (updated 13 Oct 2026): prioritize visible, intuitive categories on mobile and orientation in menus. https://baymard.com/research-articles/ecommerce-navigation-best-practice
- Baymard Institute, *Product Page UX 2026* (updated 18 Mar 2026): product details and clear decisions matter as much as photographs. https://baymard.com/research-articles/current-state-ecommerce-product-page-ux
- Toast, *Restaurant Reservation Data* (2026): a substantial share of diners begin reservations on the restaurant's own site; make the reservation or ordering action obvious, while distinguishing requests from confirmed bookings. https://pos.toasttab.com/blog/data/restaurant-wait-times-and-reservations-data
- Square, online booking guidance: service selection, appointment availability and clear booking actions must be accurately distinguished from mere preview. https://squareup.com/help/us/en/article/5355-set-up-online-booking-with-square-appointments

## Repositories and routes inspected

1. Official site: `thelaunchera/the-launch-era-new-website-`, `public/demos/<slug>/`; active canonical domain `https://thelaunchera.com/demos/<slug>/`.
2. Secondary demo site: `thelaunchera/demo-booking-landing-`, `demos/<slug>/`, copied by Pages workflow into `https://thelaunchera.github.io/demo-booking-landing-/<slug>/`. Do not link to `/demos/<slug>/` on that separate deployment.

## Summary of current opportunities

| Brand | Source-observed existing experience | Most useful next check or change | Risk/priority |
| --- | --- | --- | --- |
| Casa Brownie | Bilingual, flavors, local sample bag and 3-step browser-only order demo | Test iPhone flavor -> quantity -> order review, including small header language controls; retain original photos and hero poster | P1 mobile |
| CRUMB | Six cookie flavors, bag and gift-box builder | Test options and pricing consistency; respect intentional `noindex` | P1 flow |
| FRESKA | Bilingual drink catalog and sample bag | Validate menu selection and mobile bag closing/focus | P1 mobile |
| Golden Grid | Editorial product gallery, approved hero video, sample prices and order preview | Add one semantic H1 and sharing/SEO metadata without touching video | Done in draft PR #503 |
| Havana 19 | Original dining imagery, reservation entry and sample menu-order journey | Test that booking request is never described as a confirmed table without human email; test calendar on mobile | P1 booking |
| Ivory & Bloom | Wedding cake collection and date-based inquiry | Test enquiry preview on mobile; preserve intentional `noindex` and approved product photographs | P1 inquiry |
| La Vie in Pink | Six real demo menu cards with visible prices, native product bag and sample checkout | Test native six-item flow; do NOT add generic three-product price block or second cart | P0 QA mismatch corrected in PR #503 |
| Lavanda Boutique | 15 original photos, film, sample three-item bag | Test bag quantity and demo confirmation on iPhone; keep approved photos/film and product values | P1 mobile |
| Marea Wigs Miami | Compiled, styled beauty site and sample service-price overlay | Check compiled React experience in browser before assuming missing functionalities | P2 |
| Sneekiefs | Bilingual sneaker collection and browser-only bag/order preview | Test size selection, mobile bag, and all original local campaign images | P1 shopping |
| SOVA | Compiled headphone brand experience, original campaign | Verify tap-card descriptions and mobile image framing in Safari before redesigning | P1 |
| Umbral | Legacy/alternate Havana route | Ensure canonical redirect remains intact; do not duplicate Havana as a second active demo | Keep redirect |
| AFTR | Nightclub event/VIP guest list concept with original media | Check 21+ gate, VIP sample request and hero playback without making real availability claims | P1 |
| Angela's So Fresh Clean Queen | Private sample cleaning booking form | Keep private/demo data out of public catalogue; test only with fictitious customer data | Privacy |
| NAIL ROOM | Nail services, photography lightbox and appointment-request preview | Clarify selected dates are examples, not checked availability; keep form browser-only | Done in draft PR #26 |
| Seasonal Brew | Seasonal menu, product bag and local hero media | Verify shared sample order and brand gallery; improve share image URL | Done in draft PR #26 |
| SOLUNA Yoga | Coming-soon landing and early list UI | Verify sign-up does not imply real delivery without provider; keep original lead capture behavior | P1 trust |
| WOK SOCIAL | Food gallery, six dish detail buttons, shared three-item sample order overlay | Preserve existing sample ordering journey, fix duplicate image loading hint and share metadata | Done in draft PR #26 |
| YUMMM | Browsable sweet/coffee menu, original media and personalized sample box | Test full sample box preview and cart controls on phone; preserve approved hero media | P1 shopping |

## Changes prepared (not shipped)

- Official repo PR #503: five brand-specific OG/canonical previews, Golden Grid H1/SEO, test correction for La Vie's existing six-item native menu.
- Secondary repo PR #26: five OG/canonical previews, NAIL ROOM sample date copy, WOK SOCIAL hero image loading attribute.
- No backend connections, payment processing, customer data, real email, inventory writes, photos/videos, legal terms or live booking systems changed.

## Release gate

1. PR diff must contain only intended files; review added OG URLs against existing original file paths.
2. Run `node scripts/qa-route-integrity.mjs --static` and affected Playwright price placement, editorial heroes and owner center checks in CI.
3. Any test failure must be diagnosed before merge. The previous price-placement test expected an injected price block on La Vie, but the current site intentionally uses six native priced items.
4. Test published GitHub Pages and physical iPhone Safari at 360/390 plus tablet/desktop; verify menu, order preview, video poster, keyboard focus and reduced-motion.
5. Do not call demo “finished” or add to Aula automatically. Record outcome in Studio *after* verification, without creating duplicate demo entries.

Source audit is not a full user study or a browser inspection of every route.
