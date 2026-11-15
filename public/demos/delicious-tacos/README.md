# Owner walkthrough update — 15 November 2026

**Target audience: Delicious Tacos business owner, NOT restaurant customers.** This route has been repurposed from the original public-facing concept to a brief, explanatory, interactive **owner presentation**.

- Main linked route `/demos/delicious-tacos/` now offers a step-by-step walkthrough with a **simulated pickup order and simulated Admin Panel**. It cannot actually accept orders, take money, store customers, send notifications, or update backend systems.
- The original customer-facing concept is preserved, unchanged except its title, at `/demos/delicious-tacos/customer-preview.html` and is linked from the walkthrough.
- Photo retouching is a proposed service: customer submits genuine photos, TLE enhances light/crop/presentation, business approves before publishing; no real product imagery or menu details are represented as verified.
- Gallery and truck images are clearly labeled illustrative AI-generated concepts, NOT real photos of the business or staff.
- Owner-facing flow: menu → sample pickup request → new order in Admin Panel → preparing → ready → picked up. Four sample menu items and **sample prices** only. Orders and progress exist exclusively in the current browser session, without network calls or storage.
- Public marketing remains English with ES switch; the phrase "Admin Panel" is used instead of "Command Center".
- The existing Canva proposal has $89 one-time and $120/month options; **live pickup ordering, notifications, third-party costs and final scope must be agreed separately**, and truck staff handle accepting/preparing orders. Do not imply the simulation is deployed as a live service.
- This is an **unlisted GitHub Pages URL, not an access-controlled private site**. `noindex,nofollow,noarchive` is used, and it is intentionally excluded from the public demo catalog, but anyone holding the exact link can open it. A truly private version would require server-side authentication/another host.
- Required release QA: static no-side-effects checks, screenshots at 375/390/820/1440, sample pickup simulation and stage progression, EN/ES, distinct guest preview, source photos, navigation/CTA links and Pages deployment.
- No outreach to the prospect has been sent through this workflow.

---

# Delicious Tacos · independent prospect concept

**Status: UNAPPROVED DESIGN PROTOTYPE — NOT PUBLISHED, NOT CUSTOMER-AUTHORIZED.**

This brand-isolated concept is for The Launch Era's *qualified* prospect **Delicious Tacos Foodtruck** in Boynton Beach. It is not the restaurant's official website and has not been delivered to its owner. All information and imagery is subject to approval.

## Confirmed and conflicting details

- The official Florida DBPR mobile-food license for **DELICIOUS TACOS**, license **MFD6052364**, is active at **1950 S Federal Hwy, Boynton Beach, FL 33435**, based on an August 31, 2026 inspection: https://www.myfloridalicense.com/portalsearches/VerifyLicensee/InspectionDetail?ID=8169016&InspVisitID=13733999
- Boynton Beach CRA lists "Delicious Tacos" at **1954 Federal Hwy** and publicly lists phone **(561) 781-6080**: https://www.boyntonbeachcra.com/Home/Components/BusinessDirectory/BusinessDirectory/474/74?npage=4
- Restaurantji has a contradictory **1950 N Federal Hwy** listing. It identifies customer-mentioned asada, al pastor, chicken, chorizo and taco combos. https://www.restaurantji.com/fl/boynton-beach/delicious-tacos-foodtruck-/
- Roadtrippers/Yelp reviews for a similarly named "Delicioso Taco Truck" at **1950 S Federal Hwy** reference tacos and burritos and show the same phone. We should NOT assume that all menu details from similarly named listings are official without owner verification: https://maps.roadtrippers.com/us/boynton-beach-fl/food-drink/delicioso-taco-truck
- No reliable verified official Instagram profile, current official menu prices, current operating hours, ordering platform, logo or food photography was identified for this brand during research. Do not invent any.

## Creative direction (proposal awaiting explicit owner approval)

- Concept: understated Mexican street-food editorial; not sombreros, mascot emojis, copied storefronts or other clichés.
- Color direction: roasted red #AD3E24, warm paper #F5EFE4, ink #1B231E, maize #E0A23B, herb green #65755A. These are **proposed, not the business's established brand colors**.
- Proposed wordmark is only the live text 'Delicious Tacos' in the concept. No claim to represent an original authorized business logo.
- Hero: oversized typographic message and food-forward composition; accessible navigation and mobile-first menu.
- The draft landing page now uses **four individually generated, local WebP concept photographs**: overhead tacos, hand-held taco, hand-held quesadilla, and burrito with a **white disposable plastic fork**. They do **not** depict verified food or premises from Delicious Tacos and are labeled as illustrative concepts. The previously rejected eight SVG illustrations and stock-photo links have been removed. Business-authentic food photos still require confirmation/permission for final customer delivery.
- CTA: call existing public number and Google Maps *search* (not a guaranteed destination), no cart, checkout, fictitious booking, email sending, invented inventory or prices.

## Functional concept built
- Self-contained HTML/CSS/JS with four locally committed, optimized WebP images in `public/demos/delicious-tacos/media/`, no new dependencies or external photography CDN.
- English/Spanish switch; anchored sections; responsive mobile navigation with Escape; category filtering; call and map search links. Menu is an editorial text list beside one primary photo, not repeated image cards.
- Dynamic menu is **presentation-only**, using items from third-party public listings. No online ordering.
- All copy distinguishes business facts from design examples; bilingual unverified-data warnings and noindex.

## The mandatory approval gates (all still pending)

- [ ] Approve moodboard, palette, typography and copy direction.
- [x] The Launch Era founder selected the concept photo direction and requested disposable plastic fork, implemented November 15, 2026. These are AI-generated concept images only.
- [ ] Prospect/business owner approves real food photos, logo and actual venue imagery before official delivery.
- [ ] Approve actual brand logo/wordmark from owner.
- [ ] Confirm exact physical location, current hours, item names, ingredients, prices and channel for customer requests.
- [ ] Run and pass the project QA checklist and browser tests at 375, 390, 768/820, 1024 and 1440, EN/ES.
- [ ] Merge after approval; deploy GitHub Pages; verify real published URL, images, links and iPhone Safari.
- [ ] Register verified public demo URL, brand kit, original photos and source in private Studio; don't send prospect outreach without user request.

## Provenance / links

This draft is authored by The Launch Era. No screenshots or assets from another client's demo were copied. Neither images nor menu facts are presented as owner-approved; source data needs owner confirmation.

Code branch: `feature/delicious-tacos-concept-20261115` in `thelaunchera/the-launch-era-new-website-`. Intended future canonical route after approval: `/demos/delicious-tacos/`.

## Redesign based on user feedback · November 15, 2026
- Previous illustrated theme was rejected as generic / AI-looking; the visual layout and hero were replaced in the existing draft PR, not published.
- New design direction: editorial food concept photography, varied angles and human interaction, flat neutral surfaces, larger typography, text menu instead of six identical cards, minimal decoration, no false restaurant endorsement.
- The four web images were generated specifically for the concept: `taco-in-hand.webp`, `tacos-overhead.webp`, `quesadilla-hand.webp`, `burrito-disposable-fork.webp`. The latter is the corrected image with a white disposable fork; all four are separate locally stored assets, not a collage. Original concept files are stored in the brand's private Drive kit; customer-owned photographs remain to be obtained.
- The actual Taste Skill, Vercel, Playwright CLI skills and read-only DESIGN.md reference collection were installed in the main repository by PR #615. Design review uses them under TLE's existing approved-brand/release policies, without automatically copying another company's visual identity.

## Four local concept photos · November 15, 2026
- Founder explicitly requested overhead, hand-held quesadilla, taco in hand, and fork lifting food. Fork was replaced with a **white disposable plastic fork**.
- Web assets verified committed via GitHub Git Data API to this draft branch, encoded as WebP to reduce page weight. All image tags link to their actual local `./media/` files. No third-party image CDN or URL dependency.
- The conceptual backgrounds may not match the prospect's actual truck. Do not claim that they are enhanced photos from the owner's site or photographs of its current menu.
