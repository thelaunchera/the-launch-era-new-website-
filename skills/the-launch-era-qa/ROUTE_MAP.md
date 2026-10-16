## Shared public FAQ topic tabs (2026-10-16)
- **Public EN/ES only:** shared marketing FAQ in homepage `/#faq`, website automation and virtual assistant pages, plus Booking Automation + Command Center and Cleaning App service-sales FAQs.
- **Source:** `src/components/faq-topic-tabs.tsx` and scoped `faq-topic-tabs.css`, consumed by existing `service-faq.tsx`, `home-sales.tsx`, `service-sales.tsx`. Existing question/answer text, accordions, checkout and demos are preserved; general privacy questions link to the existing public EN/ES Privacy Policy. No new routes or backend actions.
- **UX:** three Billing/Account/Privacy tabs (Pagos/Cuenta/Privacidad in ES), visible 2.5px moving blue underline, horizontal fade/slide of absolutely stacked panels, measured active height, native `details/summary` accordions. Tabs use roving tabindex, Left/Right/Home/End, paired `aria-controls`/`aria-labelledby`, `inert` inactive panels, focus-visible rings and reduced-motion instant state.
- **Release checks:** `node scripts/qa-faq-topic-tabs.mjs` in Pages build plus `node scripts/qa-route-integrity.mjs --static`; browser review of EN/ES 360/390/820/1024/1440 px and real keyboard/reduced-motion navigation. No private Command Center or client tenant changes.

# ROUTE_MAP.md — The Launch Era route & button registry

## Public fictional booking demo: inline calendar + cleaning frequency selector (2026-10-16)
- **Surface:** `/lead-private-preview.html?lang=en|es` only without a buyer `key` or `owner_preview=1`; code: `public/assets/tle-demo-inline-booking-v41.js/css`, `tle-demo-frequency-v41.js/css` and `tle-demo-readability-v41.css`. CSS is imported by the existing v38 sample style. JavaScript is loaded from the existing sample-only v27 loader after the page load.
- **Hero:** a responsive photo-led headline alongside a white calendar card on wide screens; on phone and tablet the card sits below the untouched photo. Real month dates; elapsed dates disabled; keyboard and touch day/time selection. Confirm switches to "Booked in demo", explicitly says nothing was booked or sent and only pre-fills local date and time fields. The real service selection and form still require deliberate visitor action; no network writes.
- **Frequency comparison:** three radio-semantic options One time / Weekly / Biweekly with arrow-key roving tabindex, sample starting price for Standard Cleaning ($120 per one-time visit), existing example discounts of 15% weekly and 10% biweekly, and illustrative annual savings of $936 (52 visits) and $312 (26 visits). Does not promise an actual contracted subscription/price, no new payment, invoice, lead or order. Hides in Business/Commercial category. "Customize" opens the existing residential flow and selects the chosen frequency.
- **Screenshot repair:** the white active Home/Residential pill must show dark-blue text; the booking studio background is powder blue rather than black. Existing service-card photo legibility is unchanged. Scoped CSS never themes client previews or CB Depot.
- **QA:** `scripts/qa-demo-inline-widgets-v41.mjs`, dedicated workflow `demo-inline-v41-qa.yml`, plus existing native navigation and route integrity checks. Verify EN/ES on phone/tablet/desktop and production only after deployment. No live booking/email/checkout test.


## Homepage time-of-day diorama + kinetic headline (2026-10-16)
- **Scope:** public EN homepage / and Spanish homepage /es/ only. New reusable component src/components/home-motion-interlude.tsx is inserted directly after the existing Booking Page / Command Center / Follow-ups ProductExplorer and before ProcessSection. No booking demo, live booking action, checkout, protected Command Center, client tenant, auth or backend route is altered.
- **Assets:** scoped src/components/home-motion-interlude.css and lazy-loaded public/assets/tle-home-time-of-day.js; the latter imports Three.js and its RoundedBoxGeometry/RoomEnvironment add-ons on demand. The React section always renders bilingual accessible copy plus static inline SVG fallback, so a blocked CDN or unavailable WebGL does not hide essential content.
- **Motion:** four daypart chapters scroll through day/dusk/night, with island/house/trees, sun/moon/halo, 160 stars, directional light, emissive windows, environment dimming and soft orbit. Only dedicated .tle-day-night gets the changing gradient, not the body. The two-row kinetic band scrolls in opposing 25s/29s seamless loops, pauses on hover, and is static for reduced motion.
- **Safety:** renderer uses conservative mobile pixel ratio, intersection-based pause, resize observer and full GPU asset disposal on unmount. Reduced motion displays an evening scene without continuous rendering; no user data, booking, API, email, payment, third-party tracking, or actual customer activity is generated.
- **QA:** node scripts/qa-home-time-of-day.mjs, node scripts/qa-route-integrity.mjs --static, build and visual inspection of EN/ES at 360/390/820/1024/1440 with iPhone Safari, reduced motion, CDN-blocked fallback and unchanged product tabs/CTAs. Code publication and live QA must be independently confirmed.



## Homepage booking scrollytelling (2026-10-16)
- Public EN `/` and ES `/es/` only, at `#hero-next` immediately after the existing scroll-photo hero and **before** the already-eligible `SmartWelcomeBundle` promotion. No route, navigation, checkout, price, provider, or tenant change.
- Shared `BookingWalkthrough` is in `src/components/home-sales.tsx` with scoped `src/components/booking-scrollytelling.css`. Three semantic `article` sections contain real EN/ES headings and paragraphs. A 100svh sticky scene is covered by 3 × 100svh reading steps with `margin-top:-100svh`; `data-step=0|1|2` drives decorative blue shape transform and icon fades via CSS. IntersectionObserver uses `rootMargin:-45% 0px -45% 0px`; disconnects on teardown.
- Original Request/Organized/Follow-up selectors remain native buttons with accessible `aria-pressed` and now scroll to the corresponding story heading. Keyboard focus outlines and `prefers-reduced-motion:reduce` (instant state changes, no smooth scroll) are required. Scene `aria-hidden=true`, copy remains reachable in reading order. iPhone story cards use a separate lower region and should never cover the controls. No fabricated customer data or background network calls.
- Unchanged offer CTA: `/booking-bundle/?lang=en|es&bundle=ai-booking&source=smart-welcome` exists only if read-only 40% pricing eligibility is verified; optional AI remains separately priced. Do not move the offer into the pinned scene.
- CI static guard: `node scripts/qa-booking-scrollytelling.mjs` in `pages.yml`. Verify production after Pages deploy, EN/ES at 360/390/820/1024/1440px, real scroll 0→1→2, button navigation, `prefers-reduced-motion`, no horizontal overflow and bundle after story.


## Public CTA visibility / cached asset fix (2026-10-16)
- Public EN/ES marketing CTA implementation existed but did not visibly communicate the promised animation: original `#D7EFFF` pulse matched the blue final chapter exactly; purchase CTA links had pulse only, not the requested moving border; CSS asset remained under `?v=20261016-1`, permitting old cached style to persist.
- Corrected shared primary CTA shell with accent `#568FB3` pulse, inner text above a 2px clipped conic border on purchase/signup CTA buttons, respecting `prefers-reduced-motion`. Preserved native links/destinations, and excluded /demo, /preview and Command Center.
- Cache-bust `/assets/tle-marketing-cta-motion.css?v=20261016-2` in `src/routes/__root.tsx` and EN/ES AI Assistants pages. Secondary demo-free gradient links and server-confirmed contact/freebie state machines unchanged.
- Added source and browser regressions for actual endcap contrast, computed pseudo-element animation, label visibility, 5 responsive widths, reduced motion and synthetic form sends without contacting production endpoints. Production live rollout must be separately verified.


## Booking Automation floating illustrative chips (2026-10-16)
- **Affected public routes only**: EN `/booking-lead-automation` and ES `/es/booking-lead-automation/`. Both render `src/components/booking-floating-chips.tsx` beside the existing heading, with its scoped `booking-floating-chips.css`.
- Four visually decorative sample activity chips (new signup, example revenue metric, example payment, message count) float on desktops; under 640px only signup + messages remain in their own layout row below the heading so neither title nor CTAs are obscured. Example disclaimer is visible in each chip; `aria-hidden=true` prevents duplicate assistive announcements. No real customer data, purchases, provider calls or analytics/events.
- Hover and click behavior of existing CTA `/booking-bundle/?lang=en|es` and personalized demo `/booking-demo/?lang=en|es` is unchanged; pricing, sale date and production copy unchanged. Motion uses CSS bobbing with staggered entry and fully disables under `prefers-reduced-motion`.
- QA: `node scripts/qa-booking-hero-floating-chips.mjs` (source guard), normal route integrity and production build; check EN/ES 360,390,820,1024,1440, reduced motion and no overflow. Live GitHub Pages verification required before marking publication complete.


## Public marketing CTA microinteractions (2026-10-16)
- Scope: active `thelaunchera/the-launch-era-new-website-` home, EN/ES service sales routes, approved AI Assistants marketing standalones, Cleaning App marketing landing, and real Contact/Lead Tracker forms only. CSS `public/assets/tle-marketing-cta-motion.css`; reusable native-anchor wrapper `src/components/marketing-cta.tsx`; real form button `src/components/morph-submit.tsx`. No changes to demos (including sample/booking demo), Command Center, owner preview, client-specific pages, checkout code or the external Cleaning App runtime.
- Purchase/signup CTAs: preserve original `href`, accessible link/keyboard behavior, icons and copy. Subtle 2.8s dual blue flat-fill ripple behind dark pill, delayed 450ms; no box-shadow animation or neon. Motion pauses on hover/focus and is omitted for reduced motion.
- Secondary non-demo `a.service-demo-link` and opt-in `.tle-cta-gradient` links receive a slow 3s soft-blue conic border with inner 2px inset cover, not applied when `href` contains demo/preview. A `#plans` AI sales anchor receives this border; its `#demo` link remains unmodified.
- Form submissions: `ContactForm` (EN help/home), `SpanishContact` and `FreebiePage` use three state `data-state=idle/loading/done` buttons with clip-path morph to circle, three staggered dots, SVG check and `aria-busy`/`aria-live` announcements. Green success is visible **only after** the existing `tle-contact`/`tle-freebie` endpoint returns successful `ok`; failure resets to idle and shows existing error text. After 1.45s of confirmation, original success panel takes over. No new send, customer data or automatic confirmation is introduced.
- Source-level assets: root stylesheet loaded after theme. Standalone `public/ai-booking-assistant/index.html` and `public/es/ai-booking-assistant/index.html` explicitly include the same CSS. No other standalone/public tenant pages include it.
- No new endpoints/destinations. Browser QA uses intercepted network responses only; never send real form submissions or create checkout sessions. Test 360,390,820,1024,1440 px, keyboard/reduced-motion and unchanged demos.

## Footer newsletter signup (2026-10-16)
- **Scope:** shared TanStack public SiteFooter for EN/ES marketing pages, source `src/components/site-shell.tsx`; no checkout, booking demo, Cleaning App, protected CRM or client-specific pages changed.
- **Assets:** `public/assets/tle-footer-newsletter.css` and `public/assets/tle-footer-newsletter.js`, both loaded by `src/routes/__root.tsx`. Native form submit handler, no widget dependencies. The form's 42px pill has inline validation/errors; its success mask animates from button to input after a real `ok:true` POST, keeps its done state, and uses reduced-motion opacity fallback.
- **Public POST/OPTIONS:** `https://bowacxhmjvrqixtwaikv.supabase.co/functions/v1/tle-newsletter-subscribe` (`supabase/functions/tle-newsletter-subscribe/index.ts`); browser input `email`, `language=en|es`, `source=site_footer`, `consent=true`, `started_at`, honeypot `company_web`. Failure leaves form editable and displays an error. CORS is limited to approved TLE hosts; no secret key is exposed in client JS.
- **Subscriber store:** `public.tle_newsletter_subscribers` in production (source migration `supabase/migrations/20261016_tle_website_footer_newsletter_subscribers.sql`), unique normalized email, consent timestamp/status/language, RLS enabled and anonymous direct access revoked. Newsletter **subscription storage only**: there is no automatic email campaign or welcome message from this form; every future mailing must check `status` and include a working unsubscribe method.
- **Privacy:** public footer includes a clear occasional-emails consent line and link to EN/ES privacy policies. No new routes. Static source checks and database RLS verified 2026-10-16; live browser submit and GitHub Pages post-deploy smoke tests must be completed before claiming production delivery.


## Homepage services GSAP five-phase palette (2026-10-16)
- **Scope**: existing six sales cards remain in place on EN `/#solutions`, ES `/es/#soluciones` and the shared EN `/solutions` presentation. Background/text colors shift only inside `.solutions-section[data-services-color-shift]`; does not theme the site header, demo, buyer previews, checkout, Cleaning App or Command Centers.
- **Entry navigation**: compact, five-phase progress wordmark with three decorative bars and a functioning internal Explore anchor, EN `#service-rail-en` / ES `#service-rail-es`. Existing per-card link destinations, photographs, offers, Stripe checkout flow, and the iPhone horizontal scroll-snap remain unchanged.
- **Motion (source of truth)**: `public/assets/tle-services-color-shift.js` loaded by `src/routes/__root.tsx`, independent of homepage JSX. It mounts on `#solutions` and `#soluciones`, observes client route changes, and reattaches to the horizontal rail after React updates. GSAP 3/ScrollTrigger uses `gsap.context` when CDN available; a native requestAnimationFrame+CSS fallback keeps the color shift working when unavailable. Scrolling advances five phases; phone swipes immediately paint the color from rail progress. Reduced motion has no animated transitions. The older `src/components/services-color-motion.tsx` is no longer the active controller.
- **CSS**: `public/assets/tle-services-color-shift.css` loaded in `src/routes/__root.tsx` after base SaaS styles. Card surfaces retain fixed dark typography to remain readable on blue/dark chapter backgrounds. Contrast tested above 4.5:1 for each section background/text pair. QA: EN/ES Chromium at 360/390/820/1440 for vertical scroll, swipe, CDN unavailable, reduced motion, unchanged destinations and visible nav; existing unrelated page overflow is tracked separately.


## Footer newsletter signup (2026-10-16)
- **Scope:** shared TanStack public SiteFooter for EN/ES marketing pages, source `src/components/site-shell.tsx`; no checkout, booking demo, Cleaning App, protected CRM or client-specific pages changed.
- **Assets:** `public/assets/tle-footer-newsletter.css` and `public/assets/tle-footer-newsletter.js`, both loaded by `src/routes/__root.tsx`. Native form submit handler, no widget dependencies. The form's 42px pill has inline validation/errors; its success mask animates from button to input after a real `ok:true` POST, keeps its done state, and uses reduced-motion opacity fallback.
- **Public POST/OPTIONS:** `https://bowacxhmjvrqixtwaikv.supabase.co/functions/v1/tle-newsletter-subscribe` (`supabase/functions/tle-newsletter-subscribe/index.ts`); browser input `email`, `language=en|es`, `source=site_footer`, `consent=true`, `started_at`, honeypot `company_web`. Failure leaves form editable and displays an error. CORS is limited to approved TLE hosts; no secret key is exposed in client JS.
- **Subscriber store:** `public.tle_newsletter_subscribers` in production (source migration `supabase/migrations/20261016_tle_website_footer_newsletter_subscribers.sql`), unique normalized email, consent timestamp/status/language, RLS enabled and anonymous direct access revoked. Newsletter **subscription storage only**: there is no automatic email campaign or welcome message from this form; every future mailing must check `status` and include a working unsubscribe method.
- **Privacy:** public footer includes a clear occasional-emails consent line and link to EN/ES privacy policies. No new routes. Static source checks and database RLS verified 2026-10-16; live browser submit and GitHub Pages post-deploy smoke tests must be completed before claiming production delivery.


## Homepage sticky photo-card hero (2026-10-16)
- **Scope**: public EN `/` and ES `/es/` only, using the existing `HomeHero` and SpanishHome markup. No demo, checkout, customer tenant or Command Center pages are modified.
- **Hero stage**: `public/assets/tle-hero-scroll.css` loaded after `tle-saas-ui-v1.css` by `src/routes/__root.tsx`. `.hero-scroll` is approximately 180svh; `.hero-scroll-stage` sticks at top at 100svh; the existing full-photo wrapper smoothly scales from 1 to .7, rounds from 0 to 24px, and fades headline/CTA by half progress.
- **Scroll controller**: `src/components/home-motion.tsx`, passive scroll + one requestAnimationFrame with progress clamped against section travel; clears listeners, inline progress, reveal class and temporary inert state on unmount or reduced motion. Card is static and readable when reduced motion is enabled.
- **CTA**: EN `Get my personalized demo` stays linked to `/booking-demo/?lang=en`; ES `Quiero mi demo personalizada` stays linked to `/booking-demo/?lang=es`. Each remains in the first visible hero screen, not hidden beneath the sticky stage. No payment, email or demo endpoint changes.
- **Next section anchor**: `/#hero-next` and `/es/#hero-next` scroll to the existing `BookingWalkthrough`; the hint link emerges behind the photo only near the end of its shrinking animation. Solutions and subsequent sections retain their original order.
- **QA**: `node scripts/qa-home-scroll-hero.mjs` for source guards, `node scripts/qa-home-scroll-hero.mjs --browser` with a local build for EN/ES visual behavior and reduced motion (360/390/820/1024/1440).

## Verified purchase social proof (2026-10-16)
- **Server-only public read route**: `https://bowacxhmjvrqixtwaikv.supabase.co/functions/v1/tle-public-purchase-proof` (`GET`/OPTIONS only), source `supabase/functions/tle-public-purchase-proof/index.ts`. Service-role reads are server-side; RLS tables must not be exposed directly to site visitors.
- **Source of truth**: `tle_booking_flow_accounts` rows written by the verified **live** Stripe checkout completion path; require `payment_status=paid`, `payment_provider=stripe`, non-null paid timestamp within seven days, `product_code=booking_flow_setup`, and `cs_live_` session format. Don't infer sales from leads, demo simulations, payment links, visits, intents, card clicks, Stripe test sessions or Cleaning App payments. AI add-on labels are drawn only from the same verified combined checkout row.
- **Contract**: `{show:boolean,kind?:"booking"|"booking_bundle"}`. No purchaser name, business name, email, amount, place, exact timestamp, raw purchase count or Stripe IDs returned. False/no data/errors hide silently. No follow-on purchases, email, checkout, lead or database writes.
- **Front-end**: `public/assets/tle-purchase-proof.js/css` mounted in `src/routes/__root.tsx`, only on public marketing route allowlist, EN/ES copy, once per session, ~7.5 seconds after data arrives, closes automatically after 4 seconds or via X. Never on checkout, demo, Command Center, activation, buyer, Cleaning App or CB Depot pages. Suppress while Jessie's chat or modal is open, support reduced motion and mobile safe area.
- **QA**: `scripts/qa-verified-purchase-proof.mjs` and `verified-purchase-proof-qa.yml`; verify live function GET/OPTIONS, non-mutating invalid method, and browser display at 360, 390, 820, 1024, 1440 EN/ES after release. Public deployment and Supabase function must be separately verified.


Verified against production page loads and repository sources on **2026-10-12**. This is a living contract; check code after every release. A page rendering does NOT prove a sensitive form action works.

## Sources of truth
- Main website: \`thelaunchera/the-launch-era-new-website-\`, \`src/routes/*\` + \`public/*\`, served from \`https://thelaunchera.com\`.
- Private Command Center: website \`public/command-center/*\` and \`thelaunchera/the-launch-era-crm\`; don't switch it back to previous infrastructure.
- Cleaning App: \`thelaunchera/launch-Era-App-\`, \`https://app.thelaunchera.com\`.
- Legacy site \`thelaunchera/The-launch-era-Website-\` is NOT the source for new deployments.
- Interest confirmation UI: AppDeploy \`the-launch-era-interest-confirmation-odqbiw\`, \`public/interest.html\`.
- Backend: Supabase Edge Functions in production project \`bowacxhmjvrqixtwaikv\`; test project is separate.

## Public routes (verified that they load)
| Route (on thelaunchera.com) | Source location in active repository | Purpose / expected result |
|---|---|---|
| \`/\` | \`src/routes/index.tsx\` | EN marketing home, TLE branding |
| \`/es/\` | \`src/routes/es.index.tsx\` | Spanish home |
| \`/solutions/\` | \`src/routes/solutions.tsx\` | Product navigation |
| \`/how-it-works/\` | \`src/routes/how-it-works.tsx\` | Explains process |
| \`/help/\` | \`src/routes/help.tsx\` | Contact/help |
| \`/booking-lead-automation/\` | \`src/routes/booking-lead-automation.tsx\` | Booking Automation offer |
| \`/cleaning-web-app/\` | \`src/routes/cleaning-web-app.tsx\` | Cleaning App offer |
| \`/booking-demo/\` | \`public/booking-demo/index.html\` | Personalized demo request |
| \`/booking-bundle/\` | \`public/booking-bundle/index.html\` | Booking + optional AI plan |
| \`/ai-booking-assistant/\` | \`public/ai-booking-assistant/index.html\` | AI Assistant offer |
| \`/es/ai-booking-assistant/\` | \`public/es/ai-booking-assistant/index.html\` | Spanish AI offer |
| \`/whatsapp-ai-agent/\` | \`public/whatsapp-ai-agent/index.html\` | Coming soon, do not imply active WhatsApp integration |
| \`/es/whatsapp-ai-agent/\` | \`public/es/whatsapp-ai-agent/index.html\` | Coming soon ES |
| \`/service-checkout/\` | \`public/service-checkout/index.html\` | Checkout transition; payment integration requires separate test |
| \`/booking-flow-intake/\` | \`public/booking-flow-intake/index.html\` | English booking setup form |
| \`/es/booking-flow-intake/\` | \`public/es/booking-flow-intake/index.html\` | Spanish setup |
| \`/booking-flow-payment-success/\` | \`public/booking-flow-payment-success/index.html\` | Payment status verification, never trust static URL alone |
| \`/lead-private-preview.html\` | \`public/lead-private-preview.html\` | **Shared personalized prospect demo** for the first outreach's confirmed-interest link, params \`rid/business/area/lang\`. New black/pink/light-blue cleaning hero and editorial cards load **only in sample mode**. Real buyer keys and owner-preview booking pages retain existing live designs and behavior; no real booking or email occurs from a sample. |
| \`/lead-demo-tracker.html\` | \`public/lead-demo-tracker.html\` | Demo Command Center preview |
| \`/demos/claudia/\` | \`public/demos/claudia/index.html\` | Named sample, NOT reusable across tenants |
| \`/demos/angela-so-fresh-clean-queen/\` | \`public/demos/angela-so-fresh-clean-queen/index.html\` | Named sample; isolation required |
| \`/client-review/\` | \`public/client-review/index.html\` | Tokenized private review/approve/request changes; valid token required |
| \`/client-legal/\` | \`public/client-legal/index.html\` | Client's own policies by identity/token, never TLE generic for CB Depot |
| \`/cb-depot/privacy/\` | \`public/cb-depot/privacy/index.html\` | CB Depot privacy ONLY |
| \`/cb-depot/terms/\` | \`public/cb-depot/terms/index.html\` | CB Depot terms ONLY |
| \`/privacy.html\` | \`public/privacy.html\` | The Launch Era privacy |
| \`/terms.html\` | \`public/terms.html\` | The Launch Era terms |
| \`/command-center/\` | \`public/command-center/index.html\` | Owner/tenant login and protected workspace |
| \`/command-center/access\`, \`/command-center/access.html\` | \`public/command-center/access.html\` | Private access/recovery request; BOTH forms loaded on Oct 12 |
| \`/command-center/lead-insights.html\` | \`public/command-center/lead-insights.html\` | Authenticated lead insight view; tenant scoped |
| \`/command-center/buyer-account-preview.html\` | \`public/command-center/buyer-account-preview.html\` | DEMO ONLY; no live customer data |
| \`/auth-recovery\`, \`/auth-recovery.html\` | \`public/auth-recovery.html\`; alias in \`public/auth-recovery/index.html\` | Reset password with recovery token -> Command Center, NOT site hero |
| \`/cleaning-app/\` | \`public/cleaning-app/index.html\` | Legacy marketing redirect to \`/cleaning-web-app/\` (observed) |
| \`https://app.thelaunchera.com/\` | \`thelaunchera/launch-Era-App-\` | Operational Cleaning App, separate from marketing site |

| \\`/command-center/ai-team.html\\` | \\`public/command-center/ai-team.html\\` + AI Team assets | Private The Launch Era internal owner role only; tasks, AI plans, approvals, evidence, audit. No buyer access or automatic external action. |\n
Other routes exist under \`src/routes/\`, \`public/es/\`, \`public/intake/\` and \`public/ai-booking-assistant/\`; \`scripts/qa-route-integrity.mjs\` scans the filesystem for static references. All routes must be added here when they become a production CTA.

## v38 service screen stack (2026-10-16)
- **Scope:** public **unkeyed** `/lead-private-preview.html` only (`lang=en/es`), existing `#bookingStarter` service chooser / residential details / review / residential quote / commercial quote / sample confirmation. Never run on `?key` or `?owner_preview=1`; no client records or real submissions.
- **Owner/files:** `public/lead-private-preview.html` delegates its existing `show(id,title,count)` to `public/assets/tle-demo-stack-nav-v38.js`, with `tle-demo-stack-nav-v38.css`. If JS is missing, legacy `show` still works. Buttons, payment paths, quote calculations, and backend are unchanged.
- **Interaction:** forward 450ms right-to-left push; outgoing step shifts left 28% and dims up to 0.16; back reverses. A left-edge touch gesture drags and velocity-snaps to the previous step. Covered pages are inert and hidden from accessibility; focus moves to the active `#title` heading. Reduced motion uses a 130ms opacity fade. Original top navigation's `Change service` and `Back to Demo Home` remain functional.
- **QA:** `scripts/qa-demo-stack-nav-v38.mjs` exercises EN/ES responsive forward/back/edge-swipe, focus, state retention and keyed isolation without sending demo requests. Run via `.github/workflows/demo-editorial-v6-qa.yml` alongside static route QA.

## v28 animated preview identity / sample nameplate (2026-10-15)
- **URL/scope**: public unkeyed `/lead-private-preview.html` (including `lang=en/es`, fictional business query); never runs when `?key` is present or `?owner_preview=1`. Existing buyer/owner headers, demos and all client booking data stay untouched.
- **Demo status line**: `.top .demo-top-label` presents two *always-visible* groups: localized `INTERACTIVE DEMO` / `DEMO INTERACTIVO` with an aria-hidden twinkling blue star, and `SAMPLE WEBSITE · NO LIVE BOOKINGS` / `SITIO DE EJEMPLO · SIN RESERVAS REALES`. Preserve truthful disclaimers; no animated auto-hiding of critical wording.
- **Business name**: current dynamic `#demoBrandName.tle-sample-wordmark` retains the exact supplied cleaning-business text, flower mark, descriptor and original `href="#leadHero"` (the v22 booking-mode back handler still works). v28 uses an elevated pill with a low-contrast light sweep and bloom glow; all decorations have pointer-safe/keyboard-visible controls and reduced-motion fallback.
- **Responsive**: centered max-width logo on phone; two compact lines for notice at ≤430px, one wrap-friendly line on larger screens. No layout shifting animation or new forms; old logos/links/hero unchanged. Assets: `public/assets/tle-demo-identity-v28.js/css` loaded last.
- **QA**: `scripts/qa-demo-v12.mjs` asserts localized disclaimers, correct business name, semantic brand anchor, radius, mobile bounds, reduced-motion, and no overflow on 360, 390, 820, 1024, 1440 in EN/ES. Confirm GitHub Pages + Actions before declaring published.

## v25 ambient bubbles in both blue chapters (2026-10-15)
- **Scope**: `/lead-private-preview.html` public unkeyed sample only; `?key` buyer/tenant and `?owner_preview=1` excluded. `tle-demo-floating-bubbles-v25.js/css` load after v24 scripts/styles.
- **Targets**: only `.tle-client-quicksteps` ("Cleaning made simpler", powder blue) and `#tleDemoBlueRibbon` (rotating copy banner). Each receives seven `aria-hidden` decorative bubbles behind copy, not hero, service photos, buttons, Sonny or gallery. The layer is `pointer-events:none`, zero impact on booking form/navigation.
- **Behavior**: CSS keyframes move translucent rings/soft highlights slowly (14–23s), starting in staggered positions. A single `IntersectionObserver` pauses animation offscreen. CSS `prefers-reduced-motion:reduce` switches to static faint bubbles; no JS scroll listeners or timers.
- **Routing**: unchanged. Existing blue-banner rotating messages, dots and animations continue to work. Underlying Steps CTA and Booking Studio unaffected. Existing section contrast remains; no new overlays on `#tleDemoAreas` or `#tleDemoFaq`.
- **QA**: `scripts/qa-demo-v12.mjs` checks existence of both groups (7 each), no pointer interception, screen-reader hiding, reduced-motion policy, no horizontal overflow at 360/390/820/1024/1440 EN/ES; one non-reduced-motion viewport checks bubbles run on both chapters only while visible. Live publication/CI must be verified separately.

## Public demo v29 — dark shadow gradient without business-name capsule (2026-10-15)
- **Where**: public **unkeyed** `/lead-private-preview.html` Luna Bloom/fictional sample, desktop/tablet/iPhone EN/ES. Never owner-preview or keyed customer links.
- **Why**: user rejected the pill behind `Luna Bloom Home Cleaning` in the sticky demo header. The v28 identity overlay explicitly drew a rounded border/gradient capsule around `#demoBrandName.tle-dynamic-brand-v28` (see `tle-demo-identity-v28.css`).
- **Change**: `tle-demo-shadow-wordmark-v29.css` loads after v28 and renders the nav as a dark-black-to-transparent shadow gradient instead of a solid strip, sets logo anchor border/background/radius/shadow to **none**, and gives `.tle-bloom-name` editorial Georgia serif with high-contrast white, text-only shadow, refined lighter small descriptor. Bloom emblem becomes a small unframed flourish. At 800px/380px breakpoints the name can wrap rather than clip. Focus-mode nav stays solid and its link continues routing back to the hero via existing v22 behavior.
- **Invariants**: original `#demoBrandName` href, brand text, subtitle, localization, responsive layout, Sonny, service card links and booking state unchanged. Existing QA updated to assert no capsule, Georgia font, dark gradient and bounded logo across viewports.

## Public demo — bottom Return home button (2026-10-15)
- **Path**: `/lead-private-preview.html` with no `key`/owner preview (Luna Bloom fictional sample); button `#bookingStarter #main .tle-return-home-link` at bottom of residential/quote service menu.
- **Reported failure**: tap appeared inert on iPhone because `href="#leadHero"` only updated the hash while `html.tle-demo-booking-active` CSS hides the hero. Initial category-button click enters focused booking mode in v22, making a bare anchor insufficient.
- **Fix**: `tle-demo-booking-focus-v22.js` attaches click to bottom link, prevents default and calls the existing `exit()` shared with the working upper Back to Demo Home button. `exit()` removes booking-active classes, `showMain()` resets to picker, updates hash and scrolls to visible `#leadHero`. Native `href` remains a progressive fallback. EN/ES label is available to accessibility tech; no customer data or backend actions.
- **Regression test**: `scripts/qa-demo-v12.mjs` clicks bottom Return home from a focused service picker and again from an unfocused state on EN/ES mobile/tablet/desktop, checks URL hash, visible hero, reset picker and mode class removed. Never publish as verified without the actual browser workflow result.

## v26 blue section, final CTA and reload stabilization (2026-10-15)
- **Scope**: unkeyed public `/lead-private-preview.html` only; keyed buyers, owner preview, CRM, Cleaning App, and forms unchanged. `tle-demo-finish-v26.css/js` loaded after v25.
- **Areas → FAQ**: neighboring dark chapters now intentionally contrast: `#tleDemoAreas > div` dark #102b3d→#0b2030 and FAQ #21485f→#173448, with a narrow sky-blue boundary. FAQ topic controls slightly rounder (~19px), not a boxy card grid.
- **Final sample action**: `.tle-demo-v12-end` now a powder-blue full-width chapter with readable dark Georgia title, shorter-rounded corners (~23px desktop/18px mobile), dark blue working `a[href="#bookingStarter"]`. Seven decorative, aria-hidden, pointer-events:none floating bubble elements inserted behind copy; original click destination preserved and booking v22 still hides marketing in focused mode.
- **Old yellow point**: deleted `#bookingStarter:before` and `.demo-service-showcase:after` yellow pseudo-element rules in HTML, plus stripe `.demo-booking-kicker:before`; v26 CSS prevents reintroduction. No unrelated accents removed.
- **Refresh jump**: source recording `ScreenRecording_10-15-2026 09-30-29_1.mp4` shows mobile hero/booking headline jumping vertically during page refresh. Fixed the public mobile hero to a consistent 660px CSS size instead of swapping `vh` / `svh` / clamp heights after scripts start; on a fresh reload with no hash, set `history.scrollRestoration=manual` and restore to top once. Hash deep links still work and booking navigation retained.
- **Visual effects**: v25 bubbles are more visible (contrast + border) in process and rotating banner; v26 adds the same view-gated effect to the final light-blue CTA. Honors reduced-motion.
- **QA**: responsive EN/ES browser tests for CTA, darker/lighter chapter backgrounds, no yellow pseudoelements, real bubble layer/animation and no horizontal overflow. No messages, bookings or payments are triggered by tests.

## v24 section contrast and unified photographic typography (2026-10-15)
- **Scope**: only the unkeyed public `/lead-private-preview.html` EN/ES with `html.tle-editorial-v23` class; loaded `tle-demo-chapter-contrast-v24.css/js` last. No changes to any owner preview, keyed prospect booking, client tenant, backend, payment, email or business assets.
- **Reason**: `.tle-client-quicksteps` ("Cleaning made simpler") matched the near-black cleaning service picker, making chapter boundaries indistinct on iPhone; photo/editorial headlines still used Prompt while v23's approved feature chapter used italic Georgia.
- **Fix**: powder-blue process chapter `#eef8fd → #d4ebf7 → #e6f4fb` with navy readable text, blue step circles and existing responsive 3-stage timeline; sample reviews alternate to storm blue, FAQ to slate blue, and photo/coverage boundary gains a fine stroke; no heavy tiles or new images.
- **Editorial titles**: apply consistent Georgia serif to process, `#demoCinematicStory h2`, `#demoHow h2`, `#tleDemoAreas h2`, reviews and FAQ titles; retain exact EN/ES copy but add italic focus to existing end clauses of 3 headings. Hero title and service card typography remain unchanged. Keep v23 scroll-pop targets and iOS-friendly reduced-motion behavior.
- **QA**: `scripts/qa-demo-v12.mjs` checks chapter gradient, text contrast, matching font, accents, neighboring background distinction and overflow across EN/ES and five viewport widths. Do not claim deployment or browser check success before Actions result.

## v23 photographed editorial guide + scroll pop (2026-10-15)
- **Scope**: public, unkeyed `/lead-private-preview.html` EN/ES only; when `?key` or `?owner_preview=1` exists, none of `tle-demo-editorial-pop-v23.js/css` is initialized. No effects on tenant/client websites or Cleaning App.
- **Content/appearance**: `.tle-demo-v12-why` becomes an ivory chapter (original big kitchen picture retained first; prominent serif headline with italic second line; subtle soft-blue curved washes). Three pill-like service actions replace static checkmarks, with house/sparkle/box icons and short secondary copy. Links have `href="#bookingStarter"` and activate their matching **existing residential service buttons** in order (regular/deep/move) without changing prices, click handlers or steps.
- **Large photo gallery**: `#tleDemoEditorialGallery` inserted immediately after why section, before the real-review placeholder carousel; two large original local images `/assets/lead-demo/sunroom.png` and `/assets/lead-demo/poolside-living.png` presented in rounded, elevated full-photo panels, editorial titles and working links to `#bookingStarter`.
- **Scroll pop**: `.tle-pop-on-scroll` is added only to large editorial image sections: the two gallery figures, `#demoCinematicStory .demo-cinematic-photo`, `#demoHow .demo-bottom-photo`, `#demoServices .demo-showcase-photo`, `#tleDemoAreas>img`, and `.tle-demo-v12-why>img`. `IntersectionObserver` reveals each one once with scale+elevation; reduced motion shows all immediately. **Never** style `#leadHero` or `.tle-service-photo-v21` thumbnail images.
- **Routing**: tapping any guide pill activates the existing booking workflow and `tle-demo-booking-active`; the photo gallery remains hidden inside booking-only mode; `Back to Demo Home` reveals it again. `scripts/qa-demo-v12.mjs` adds markup/ARIA/responsive checks, service pill functional test, and actual non-reduced-motion scroll-pop check.

## v22 reliable photo pipeline and focused booking (2026-10-15)
- **Scope**: only unkeyed public `/lead-private-preview.html` EN/ES. A `?key` or `?owner_preview=1` does NOT activate the marketing/booking focus scripts; live tenants retain their own booking flow.
- **Image root cause**: v21 cards hotlinked `drive.google.com/thumbnail` in the customer's browser, causing broken thumbnail placeholders or wrong fallback photos. `scripts/build_demo_photo_assets.py` now resolves seven user-owned, anyone-viewable Drive IDs at build time, converts them to local WebP (max 1080×760, under 400KB each) and writes `public/assets/demo-services/{regular,deep,move,office,retail,medical,floor}.webp`. Both `pages.yml` and `demo-editorial-v6-qa.yml` generate assets BEFORE bundling/testing. All seven original Drive photos imported without fallback in the first successful build. The browser fetches **only** `/assets/demo-services/*.webp`; an existing local source image is the build fallback when Google is temporarily unavailable.
- **Booking focus**: `tle-demo-booking-focus-v22.js/css` keep `#bookingStarter` as the single workspace. Clicking service categories, cards, showcase booking CTAs or progressing form steps sets `html.tle-demo-booking-active`. This hides `main.wrap`'s other tour sections *visually* but does not unmount forms or change handlers. An accessible **Back to Demo Home** button restores the cover `#leadHero`, the marketing tour and the original category-picker via `showMain()`; a **Change service** button returns to the picker while staying inside the focused booking studio. The demo logo also routes home. Sonny's small avatar remains available, but its initial popup stays hidden during the booking flow.
- **Invariants**: Eleven service cards retain their original click handlers and estimate/quote behaviors; no backend writes, payment, real booking, email, tenant branding or client data changes. `scripts/qa-demo-v12.mjs` tests all seven image decodes as local assets, mobile/tablet/desktop no-overflow, flow-only visibility and back-to-home restoration in EN/ES.
- **Design**: follows focused multi-step checkout patterns (literal progress, fewer distractions, backward navigation, one clear next action). Other marketing experiences are available explicitly through Home rather than under the active form.

## Drive photo service gallery (2026-10-15)
- Scope: public sample `/lead-private-preview.html` only (no `key`/owner preview); new `tle-demo-photo-services-v21.js/css` loaded after existing base layout.
- Sources: existing *user-owned*, already anyone-viewable Drive PNGs, rendered with resized `drive.google.com/thumbnail?id=...&sz=w960` and fallback to existing same-sector local demo photos. Individual source IDs in the JS map; files are cleaner at kitchen (regular), shower (deep), clean entry (move in/out), office, commercial glass, specialized entrance and commercial floor worker. No seasonal/Halloween imagery forced across services; 7 unique photos chosen in context.
- The first three residential and first four commercial `button.service` preserve their original `onclick`, quote/estimate types and pricing. Remaining two request buttons per category remain image-free, full-width editorial actions. No added services.
- New service selector pill is purely visual and keeps `setCategory` click handlers. No customer data or provider email/payment changes.
- QA: `scripts/qa-demo-v12.mjs` checks all eleven original service actions, seven unique image sources, responsive 360/390/820/1024/1440 and two languages, no horizontal overflow. Verify browser image decoding (Drive external assets with fallbacks) and GitHub Pages deployment before claiming verified.

## Interactive sample locality and FAQ redesign (2026-10-15)
- Public sample `/lead-private-preview.html` (no `?key` or `?owner_preview=1`) loads `tle-demo-purpose-v20.js/css` after existing demo scripts. Buyer/owner live routes are excluded; no backend or payment changes.
- `#tleDemoAreas`: visual photo retained but shortened on mobile, buttons in `#tleDemoAreaTags` select a **preview locality** (no ZIP-check or actual availability promises). When `?area=...` exists, ONLY that named supplied area is displayed; generic fictional Luna Bloom shows visibly marked illustration zones (Miami, Miami Beach, Coral Gables, Doral, Kendall); personalized leads without area see pending-coverage text, not fabricated cities. `.tle-area-v20-cta` goes to existing `#bookingStarter` sample flow. Buttons stay keyboard accessible, `aria-pressed` and explanatory feedback.
- `#tleDemoFaq`: four existing real sample FAQ details remain; `.tle-faq-v20-tab` selects exactly one visible expanded response. Topic actions go to `#bookingStarter` (estimates/scheduling/bookings) or explicitly open the existing Sonny assistant on click. No AI auto-open, no new bot.
- EN/ES supported; CSS animations skip reduced-motion. Regression checks in `scripts/qa-demo-v12.mjs` for 360/390/820/1024/1440 and live/owner isolation. Do not confuse illustrative locations with a real business operating footprint.

## Public sample review carousel / Sonny delayed hint / blue ribbon (2026-10-15)
- **Scope:** `/lead-private-preview.html` public sample only, not `?key` buyer pages or `?owner_preview=1`; unrelated TLE website, Command Center, and client booking routes untouched.
- **Sonny:** `public/assets/tle-demo-enhancements-v12.js` creates exactly one avatar and one **initially hidden** `#tleSonnyGreetingPopup`. After visitors scroll past ~300–460px, a short hint may appear once for 3.7 seconds, then disappear; manual click opens the existing chat. No automatic chat, extra bubble, or form submission.
- **Reviews:** `#tleDemoReviews` `.tle-demo-v12-reviewgrid` becomes horizontal scroll-snap with swipe, Previous/Next and 3 dot buttons. All three slides stay plainly marked as **sample layouts, not actual testimonials**. Auto-advances only when in view and motion is allowed, stops once manual carousel buttons are used.
- **Ribbon:** `#tleDemoBlueRibbon` appears immediately **after** `.tle-demo-v12-why` (finished-kitchen photo chapter) and **before** reviews. Three EN/ES human-centered short messages rotate in a soft-blue stars/bubbles banner, manual dot buttons, paused offscreen/on reduced-motion/hidden tab.
- **Files:** `public/assets/tle-demo-motion-v19.css`, `public/assets/tle-demo-motion-v19.js`, loader in `public/lead-private-preview.html`, regression assertions in `scripts/qa-demo-v12.mjs` run across EN/ES and 360/390/820/1024/1440.
- **Action destinations:** Carousel controls and banner dots are local UI-only. All original `#bookingStarter`, service, quote, contact, privacy and Sonny chat actions keep their existing destinations. No fabricated reviews, prices, real bookings or emails.

## Public sample contact and legal navigation (2026-10-15)
- **Scope:** `/lead-private-preview.html` without `key` and without `owner_preview=1`, using `public/assets/tle-demo-luna-bloom-v17.js` and `.css`. Generic default brand is **Luna Bloom Home Cleaning**; a `business=` query parameter still personalizes the prospect's demo.
- **Brand:** `#demoBrandName` → `#leadHero`. Single aligned wordmark + decorative blossom icon, EN/ES. No old TLE "ERA" second wordmark or stray "DEMO" next to it.
- **Footer/contact v18:** public demo no longer has a giant standalone Contact section. `#demoContact` is a closed-by-default `<details>` inside the same compact footer. On tap it expands fictional Miami location, reserved **(305) 555-0148** and `.example` mailbox (no clickable calls/emails). Nav Contact scrolls to and opens this panel. Original booking requests at `#bookingStarter` are unchanged (no email, call, payment or real booking).
- **Footer v18:** Minimal business name, Miami line, `Contact` expandable details, `Privacy` and `Terms` visible. `More` contains `Cookie Policy` and `Accessibility`. Their existing localized modal links still open `#tleDemoLegalDialog` with close/Escape. Original large contact section, 4-column footer, extra repeated demo warnings and CTA are removed. Only one subtle sample disclosure remains. These are sample policies, **not** TLE's or any tenant's legal policies.
- **Tenant isolation:** no rendering of Luna contact or policies when `key`/owner preview is present. No modifications to booking submission handlers, real-client branding, Supabase, Resend or public TLE legal documents.
- **QA:** `scripts/qa-demo-v12.mjs` tests phone/tablet/desktop, EN/ES mock identity, `.example` mailbox, reserved phone, legal open/close, no overflow and buyer isolation; browser/live verification required before resolved status.

## Button/link contract (source → destination → condition)
| Source / button | Expected destination or action | Must verify |
|---|---|---|
| Header The Launch Era wordmark | \`/\` or \`/es/\` | Correct language and TLE logo |
| Header Solutions / How it works / Help | \`/solutions/\`, \`/how-it-works/\`, \`/help/\`; ES may jump to anchors under \`/es/\` | No dead anchors |
| Booking CTA / See demo | \`/booking-demo/\` or approved service demo route | Do not send to blank landing |
| AI Assistant plans Get Started | \`/service-checkout/?offer=ai-booking\`, \`ai-followup\`, or \`ai-business\` | Correct offer; real activation only after successful payment |
| Booking intake / ES intake | \`/booking-flow-intake/\` / \`/es/booking-flow-intake/\` | User-token and form validation, no cross-business records |
| Command Center access "Back to main" | \`/command-center/?from=private-access\` | Tenant identity preserved after login |
| "Reset your password" email/action | \`/auth-recovery.html\` with valid auth session/recovery token, then \`/command-center/\` | Real reset fixture, no marketing page, no 404 |
| "I'm Interested" in first outreach email | GET \`https://bowacxhmjvrqixtwaikv.supabase.co/functions/v1/tle-crm-interest?lead=<UUID>\` → 302 AppDeploy \`/interest.html?lead=<UUID>\` | GET never grants consent; correct lead; no query parameter loss |
| "Yes, I'm Interested" on confirmation UI | POST \`tle-crm-interest?lead=<UUID>\` | Browser CORS on EVERY response and two-step authorization; no false error after DB update |
| After explicit consent | Resend acknowledgment → \`personalized_demo_requests\` → \`tle-crm-personalized-demo-worker\` → personal preview email | No duplicates, at least 60 seconds after acknowledgment, isolate tenant |
| Shared prospect demo "Choose your service" (sample-only hero) | `/lead-private-preview.html?...#demoServices` | One clear starting CTA to selectable services, then same-page `#bookingStarter` functional request; no duplicated sales CTAs. Keep dynamic `rid/business/area/lang`. |
| "TRY YOUR PERSONALIZED DEMO" email | \`/lead-private-preview.html?rid=...&business=...&area=...\` | Correct business name/area; NOT old client demo |
| "Open Demo Command Center" | \`/lead-demo-tracker.html\` with appropriate demo context | Demo only, no production client data |
| Client review "Approve" / "Request Changes" | Tokenized \`tle-client-review\` Edge Function | Correct client/revisions; no submit without valid token |
| Client policies/Unsubscribe | Correct tenant's legal routes and authenticated tokenized unsubscribe | No generic TLE policy for CB Depot |
| Customer booking submit/cancel/change | Business-scoped booking handler → customer acknowledgment → OWNER Command Center alert | No automatic irreversible cancel or charge |
| All "Refresh", Back, profile/settings & sidebar controls | Remain within current authenticated tenant and route | Mobile/tablet/desktop navigation, no lost sidebar |

## Redirect guardrails
- No stale \`pages.dev\`, Netlify, abandoned Cloudflare portal or obsolete GitHub Pages URLs in **new** onboarding emails. A **grandfathered client-specific** URL may remain where explicitly retained.
- Never redirect a password-reset link to the marketing home. Never redirect \`/command-center/\` to a client-specific landing without authorization.
- Never route CB Depot inquiries to TLE general CRM or cleaning services; branding/legal/assets are per-tenant.
- Do not treat a 200 response as proof of correct content: verify headline, tenant brand, empty/error placeholder, relevant module and resulting navigation.
- Routes requiring a token (review, approval, recovery, unsubscribe, payment) must show a helpful non-empty error if missing and never mutate state.
- Keep a real Next Step on errors: return to the correct private login/contact channel, not unrelated home.

## Test matrix
Repeat after ANY route/button/domain change: 360px phone, 390px phone, 820px tablet, 1024px tablet/laptop and 1440px desktop; test EN/ES, owner/client/worker access, current + future tenant fixture, expired token, missing token, duplicate click, browser refresh/back, popup and multi-tab. Never use a real customer's data to exercise destructive actions.

## Missing-route fallback (2026-10-12)
- Source: `public/404.html`; the Pages build `.github/workflows/pages.yml` now preserves it rather than replacing with `index.html`.
- Unknown URLs must return HTTP 404 with a branded, readable message and safe links to `/`, `/command-center/`, `/help/`.
- The CI live check uses a nonexistent path to catch an unexpectedly empty, redirected or unhelpful 404.


## Owner-only Jessy push alerts (2026-10-12)
- **Source/UI:** `public/command-center/index.html` loads `assets/jessy-push.js`; the private owner bridge `assets/command-center-app.js` provides JWT-scoped `TLEOwnerJessyGateway.pushAlerts()`. No owner push controls must render in buyer workspaces (including CB Depot).
- **App route:** `https://thelaunchera.com/command-center/` and local service worker `/command-center/sw.js`. Owner taps the small bell shortcut, then **Activate alerts / Activar avisos** within Notifications. On iOS 16.4+, requires Safari **Add to Home Screen** first and owner permission inside the installed PWA.
- **Backend:** `https://bowacxhmjvrqixtwaikv.supabase.co/functions/v1/tle-jessy-push` accepts only authenticated verified platform owner requests for `config|subscribe|unsubscribe|test`, with a server-token-only `dispatch` action; `public.tle_crm_push_subscriptions` stores tenant-scoped device subscriptions. VAPID signing keys remain server side in `owner_push_runtime`.
- **New private owner event:** AFTER INSERT of `tle_crm_notifications` limited to internally owned workspace and allow-listed `lead/demo/quote_request/won/system_ready` kinds. Server sends via Web Push only to that owner, using `tle_crm_push_dispatches` for dispatch dedupe. No client or end-customer notifications, changes or messages.
- **Notification click:** opens `/command-center/?from=jessy-alert`, never a customer's booking page, a generic marketing landing or a 404. Lock-screen copy excludes customer details.
- **Release tests:** ensure owner-only UI, service-worker scope, existing TLE brand icon, valid/invalid JWT responses, unsupported browser and iOS Safari non-standalone guidance, duplicate and expired subscriptions, token-protected dispatch, tenant scoping and user-initiated device test. Provider-accepted is NOT verified displayed. **Real iPhone/iPad acceptance is pending the owner's Home Screen opt-in and test tap.**


## Owner & buyer notification preferences (2026-10-12)
- Official route: `https://thelaunchera.com/command-center/`; authenticated owner or buyer → bell → **Alert settings**. Entry in `public/command-center/index.html`, client `assets/command-center-notification-settings.js`, gateway in `assets/command-center-app.js`, push handler `public/command-center/sw.js`.
- Original CRM mirror: `thelaunchera/the-launch-era-crm/index.html` and `notification-settings.js`; legacy Worker link is grandfathered, not the default for new deliveries.
- Back end: `tle-crm-alert-dispatch` Supabase Edge Function; `tle_crm_notification_preferences` (per workspace/user, default channels OFF); `tle_crm_push_subscriptions` (per-user device); `tle_crm_alert_delivery_attempts` (unique event+channel+user) and `tle_crm_alert_enqueue_insert` (AFTER notification insert). Exact allowed origins include official TLE and legacy CRM Worker.
- Email is **only the authenticated, verified user's account email**, sent from TLE transactional domain, with business name and no customer PII. Push needs explicit phone/device consent, iOS Safari **Add to Home Screen**, and is not SMS/WhatsApp.
- Event filters: `lead`, `quote_request`, `booking_received`, `appointment_change`, `customer_message`, `ai_message`, `followup_due`, `demo`, `won`, `system_ready`. Source mapper marks new confirmed Booking Page jobs `booking_received`, booking-change/customer-change source keys `appointment_change`. All existing notifications untouched.
- AI activity requires an actually active/delivered AI entitlement plus a genuine `ai_message` event after provider-verified handling; **choosing an alert does not purchase or activate AI nor authorize outgoing customer messages**.
- QA before claiming live: user from private owner and paid buyer logins, iPhone installed PWA notification authorization, a test push and explicit opt-in email test, provider event logs, CB Depot brand/isolation, preference ON/OFF for each channel, no duplicate send, no 404, live GitHub Pages release. Never use a real customer's details as QA fixture.

## Cleaning App public landing contract (2026-10-13)
- `/cleaning-web-app/` and `/es/cleaning-web-app/` render `src/components/cleaning-app-editorial.tsx` using `public/assets/tle-app-landing.css`. This is an English/Spanish public sales presentation only, not an authenticated app or tenant data source.
- Primary **Start free trial / Comenzar prueba gratis** and **Create my account / Crear mi cuenta** point to `https://app.thelaunchera.com/?entry=signup` (external Cleaning App signup). Secondary **Explore demo / Ver demo** and **See it in action / Ver cómo funciona** point to `/cleaning-app-demo/?lang=en|es` (public fictional demo; no real records).
- UI dashboard names, activity counts, statuses, times and pricing illustration are explicitly fictional sample data. No API, CRM, Supabase, customer data, email or booking mutation in the marketing visual.
- No FAQ or separate ServiceSales journey inside this landing. Trial terms appear in hero and closing price panel; Jessy launcher is compact on phone and its nudge hidden only on these two routes (chat panel remains available). Shared website footer and client pages remain unchanged.

## Public brand and demo update — 2026-10-13
- Shared sample prospect demo (/lead-private-preview.html without buyer key or owner preview) adds /assets/tle-demo-blue-v5.css, scoped only to html.demo-editorial. Keep rid/business/area/lang parameters, and original confirmed-interest demo path.
- Authenticated buyer and owner preview paths (?key=... and ?owner_preview=1) remain unchanged; blue sample CSS does not apply.
- Website EN/ES public marketing pages load /assets/tle-saas-ui-v1.css after existing brand CSS. Header Support/Ayuda and footer Contact/Contacto continue pointing to /help or /es#contacto, respectively; remove duplicate Get in Touch footer action.
- Homepage in-page contact form #contacto remains accessible. Final CTA still points to the existing booking checkout; the extra after-contact invitation was redundant and removed.

## Owner-reviewed production kickoff + Jessy intake readiness (2026-10-13)
- **Backend owner approval:** `tle-project-production-start` (version-controlled at `supabase/functions/tle-project-production-start/index.ts`) accepts authenticated internal platform owner action `status` or `approve` with `subject_type=booking|ai` and an existing paid/intake-complete order ID. Every production approval requires an explicit confirmation from the owner. Idempotent `tle_project_kickoffs` records keep one approval and one provider email request per project.
- **Owner UI:** `/command-center/` → Clients & Purchases / Booking setup or AI Assistants / Delivery → **Approve production start**, then second click **Confirm start and email buyer**. Never use this button from tenant accounts, public previews or demo data.
- **AI companion:** Owner Jessy asks “What is missing for each client?” / “¿Qué le falta a cada cliente?” and calls `tle-jessy-owner` read-only readiness. Shows only Booking Automation and AI Assistant orders presently stored in the connected backend. Missing optional photos/logos are not mandatory blockers; no approval or customer email is initiated by a Jessy checklist.
- **Email separation:** automatic intake receipt says the project is under review and production has not begun; the separate kickoff email follows the owner action. Email provider ambiguous/error status is `needs_review`; verify Resend before any manual resend; never auto-repeat.
- **Scope:** TLE sells its own services via Stripe. Cleaning App records clients’ payment methods as Cash, Zelle and Check without Stripe processing.
- **Verification:** release workflow static checks plus owner-authenticated UI, test recipient fixture and provider events are needed to sign off actual delivery; avoid sending to real clients for QA.

## Reference-approved sample Cleaning demo composition — 2026-10-13
- Public `/lead-private-preview.html?business=...&area=...&lang=en|es` `html.demo-editorial`: hero → `#bookingStarter` interactive `.panel` → `#demoCinematicStory` restored feature. Heading/circle CTA and populated service cards styled by `/assets/tle-demo-booking-v7.css`; client-specific buyer/owner preview modes unaffected.
- `#residentialServiceList` retains five interactive buttons (three priced cleaners, estimate, quote). `#commercialServiceList` retains six interactive buttons (estimates/quotes). Buttons and selected state must continue calling the original booking handlers.
- Spanish story title must be kept consistent in both `lead-private-preview.html` and the deferred sample-only script `tle-demo-cinematic-v1.js`, or the latter will overwrite it.
- Browser QA: `scripts/qa-demo-editorial-v7.mjs` tests phone 360/390, tablet 768/1024, desktop 1440, EN/ES, photo below booking, circular CTA, tabs and safe client preview isolation.
## Public sample midnight design — 2026-10-13
- Production public prospect preview `/lead-private-preview.html?business=...&area=...&lang=en|es` loads `/assets/tle-demo-midnight-v11.css` last, only when `html.demo-editorial` is present. Public sample hero image source: `/assets/cleaning-demo/tle-midnight-hero.avif` (self-hosted optimized AVIF).
- Hero `Choose your service` goes to the visible `#bookingStarter` service panel. `Begin` goes to `#categoryTabs`. `#residentialServiceList`, `#commercialServiceList` and quote/confirmation handlers remain identical. The lower photo feature stays `#demoCinematicStory` after the booking panel. Test EN/ES at widths 360/390/768/820/1024/1440.
- Black / ice-blue sample overrides MUST NOT reach `?key=` buyer views, `?owner_preview=1` or CB Depot pages. `scripts/qa-demo-editorial-v7.mjs` asserts sample-only styles, dark backgrounds and image readability.

## Website favicon (2026-10-13)
Main website root EN/ES declares /favicon.png (512x512), /favicon.ico and /apple-touch-icon.png (180x180). /favicon.svg is the same square TLE-on-light-blue mark. Client tenant favicon links and Command Center icons are separate and preserved. Google may refresh only after recrawl.

## Private AI Team v1 (2026-10-13)
- Owner sidebar `My AI Team` / `Mi equipo de IA` opens `https://thelaunchera.com/command-center/ai-team.html`. `public/command-center/assets/ai-team-entry.js` injects navigation only while `TLEOwnerJessyGateway.ready()` verifies the internal owner; it is never a buyer/client navigation item.
- Backend `tle-ai-team` validates the JWT, membership of `platform_admins`, and that the user created the internal workspace. Task and event tables have RLS with no direct anonymous/authenticated grants. No real customer record is mutated by the task board.
- Actions: `list`, `scan` (read-only aggregate counts), `create`, `assign`, `status`, `approve`, `complete` with evidence, `plan` (LLM suggestion only). AI planning does NOT execute a task. Email, payment, deployment and buyer data modifications are not AI Team actions.
- Standalone Jessie mounts only after owner checks and stays on `/command-center/ai-team.html`; back action returns to `/command-center/`.
- QA: unauthorized/buyer JWT denied; duplicate task submit rejected; XSS-safe rendered content; mobile 360/390, tablet 820/1024, desktop 1440, iOS Safari and desktop browser; navigation, refresh, logout and approvals checked before production release.


## Owner-only AI Team execution, source reviews (2026-10-13)
- Entry route remains `/command-center/ai-team.html`; no new public links or buyer routes.
- New authenticated `POST /functions/v1/tle-ai-team` action `run_agent`: only named, allow-listed `agent_key` values. Never accept untrusted URLs, SQL, client IDs, recipients or GitHub write operations from browser input.
- `jessie` = owner operations aggregates; `sales` = due lead and consent-flag aggregates only (not send authorization); `projects` = purchase/intake/delivery count audit; `developer` = public GitHub HEAD/CI read check; `qa` = read-only GET allowlist; `creative` = public route/page-title audit (NOT Metricool); `care` = support status aggregates. Every result identifies a source and partial coverage.
- `tle_ai_team_runs` stores real result metadata and safe aggregates, scoped to platform owner workspace. Deny direct anonymous/authenticated table access via RLS + revoked grants. Browser `AI Team` renders reports via text nodes, not HTML injection.
- Jessie on the private AI Team screen recognizes explicit Spanish/English check commands and calls the same authenticated gateway. Other Jessie screens continue existing action scope; no arbitrary execution through a chat prompt.
- Nothing in this feature sends email, messages, invoices, customer updates, checkout requests or GitHub commits. Do not call a report a completed client task. Existing owner approval and completion with evidence are separate actions.
- Before marking released: `node scripts/qa-ai-team.mjs`, GitHub `Private AI Team QA`, Pages deploy + route guard, owner session / buyer session browser acceptance, mobile/tablet/desktop check. Keep live authentication end-to-end pending if not exercised.


## 2026-10-13 — Owner AI Team unattended monitoring and work products
- Independent Supabase pg_cron job: `tle-owner-ai-team-morning-review` runs hourly but its procedure only executes at **08:00 America/New_York** (DST-safe), producing idempotent internal daily reports in `tle_ai_team_runs`; manual forced checks used only for QA.
- Three owner-task triggers are installed only on `tle_crm_support_requests`, `tle_booking_flow_accounts` and `tle_ai_agent_orders`. Their SECURITY DEFINER handler creates owner-scoped `tle_ai_team_tasks` only, never modifies buyer/client rows, sends mail or launches production. Deduplication keys: `support:<uuid>`, `paid-intake:<uuid>`, `intake-review:<uuid>`, `assistant-order:<uuid>`. Daily keys include Eastern date.
- `tle_ai_team_outputs` holds generated owner-reviewed drafts. Backend `compose_output` uses limited task context and available aggregate source facts; `review_output` changes internal review status only. Explicit no-send, no-publish, no-merge restriction. Do not treat an approved draft as deployed or sent.
- Board displays draft contents using textContent; approval/rejection and copy in private owner view. Keep manual owner verification for external communications, code releases, Metricool changes and customer operations.
- Run `node scripts/qa-ai-team.mjs` and `node scripts/qa-jessy-owner.mjs`, plus browser mobile/tablet/desktop checks. Confirm no unapproved outbound sends, no cross-tenant access and no duplicate trigger tasks.


## AI Team private Jessie delegation and audit — 2026-10-13
- Only on the owner-authenticated `/command-center/ai-team.html`, Jessie handles **explicit** `create task` / `crea tarea` commands and `draft` / `prepara borrador` requests by calling the same owner JWT gateway. A new task and work product remain draft state; no automatic recipient, email send, calendar change, payment, publication, deployment or buyer workspace modification is authorized.
- Supabase Edge Function `tle-ai-team` v5 lists `task_origin` and `run_origin`, distinguishing platform-triggered tasks and scheduled reports from human-initiated reviews. All content rendered as text, no HTML injection.
- `review_output` updates an output only if status remains `draft`, then inserts a private `output_approved` / `output_rejected` audit entry against the owning task. Work product creation inserts `output_created` audit event. Unrelated tenants cannot call these actions.
- Regression guards: `scripts/qa-ai-team.mjs`, `scripts/qa-jessy-owner.mjs` and `scripts/qa-safari-ai-team.mjs` (anonymous iPhone/tablet/desktop WebKit lock). Full owner-authenticated acceptance still requires the actual owner's session.


## AI Team automated internal notifications (2026-10-13)
- When the owner-only `tle_ai_team_record_automatic` creates a NEW internal review task, it also writes exactly one `tle_crm_notifications` record with `kind='ai_team'`, `workspace_id` equal to the authenticated platform owner's internal workspace, and unique `source_key='ai-team:<task uuid>'`. Deduplicated source events cannot create duplicate notices.
- Notification text contains no client identity or customer contact details; it is never a customer email and does not start a payment, publication or delivery workflow.
- Alerts remain subject to the existing owner Command Center notification/push preferences. Without push permission, the event remains an internal Command Center notice.
- The migration is tracked in `supabase/migrations/20261013_tle_ai_team_owner_notifications.sql`. Verify a genuine next event end-to-end; do not insert fake customer events on production for QA.


## Private AI drafting status, 2026-10-13
- Route: `/command-center/ai-team.html` → owner-only `ai-provider-check` button → Supabase `tle-ai-team` action `provider_check` (platform-admin JWT, internal workspace required). Tests a tiny OpenAI response with an Edge Function secret; never returns its value.
- Backend reports `configured`, `verified`, `reason` and public model name only. Reasons (e.g. `invalid_key`, `rate_or_billing_limit`) are sanitized; never log authorization headers.
- A generated work product has `generation_mode=ai` only after actual nonempty OpenAI content. A static fallback is saved with `generation_mode=template` and clearly labeled **Plantilla · Sin IA**. Jessie also distinguishes these. Both remain unsent and owner-reviewed.
- Schema `public.tle_ai_team_outputs.generation_mode` applied in Supabase and versioned in `supabase/migrations/20261013_tle_ai_team_generation_mode.sql`. In owner UI the test status is NOT a proof of client acceptance until run with the owner session.
- Regression: `scripts/qa-ai-team-ai-provider.mjs`, existing task/Jessie/route security and Safari tests.

## Smart Welcome — planned, not deployed (2026-10-14)
- No new public page route. Existing `/booking/?key=<UUID>` → `/base-booking.html?key=<UUID>` remains the only live buyer entry.
- The client-side `/assets/booking-smart-welcome.js` calls proposed `/functions/v1/tle-booking-smart-welcome` using a public booking key **only after** the verified released buyer model loads. Missing/disabled/expired welcome → original page unchanged.
- The Command Center buyer's verified share panel mounts `booking-smart-welcome-editor.js` only after delivery. `get` and `save` operations require a verified JWT and ownership; direct `anon/authenticated` table grants are revoked.
- Welcome CTA closes the overlay and scrolls to **the existing** `#booking`; dismiss/skip returns to the page without writes. No pricing modification, no automatic discounts, no new external checkout/lead route.
- Feature branch: `feature/smart-welcome-booking-20261014`. **Backend schema and Edge Function deployed to production default-off 2026-10-14; frontend release pending. CB Depot draft disabled; no client promotion enabled.** See `docs/SMART_WELCOME_BOOKING.md`.

## Smart Welcome returning-visitor alert — 2026-10-14
- **Entry stays unchanged:** `/booking/?key=<tenant-key>` redirects to `/base-booking.html?key=<tenant-key>`, where the released tenant's `tle-booking-smart-welcome` public configuration is fetched read-only after pricing/model loads. No routing, data, consent, booking form or calculation changes.
- **First visit:** full Smart Welcome modal; dismiss closes; primary CTA scrolls to existing `#booking` without new page navigation. **Returning visit:** keep the small inline offer card, and show a non-modal bottom welcome-back toast for 16 seconds with business-specific EN/ES copy, dismiss control and CTA to the same `#booking`. Clicking CTA closes toast then scrolls to booking. Direct `#booking` deep links do not trigger the toast.
- **CB Depot:** detail-specific text ('Welcome back to CB Depot!' / 'Ready for your next detail?'); dark `#07111C`, electric blue `#087DFF`; no duplicated panda logo, no invented promo or discount; real main-page logo stays intact.
- **Isolation:** per tenant's unique booking key in browser localStorage; no tracking, cookie or cross-tenant identity. Missing, expired or disabled configuration yields no overlay/toast.
- **QA:** `scripts/qa-smart-welcome-browser.mjs` checks arrival/repeat mobile and desktop, CTA/close and preserved booking forms; live origin still needs post-deployment smoke.

## The Launch Era marketing Smart Welcome Bundle — 2026-10-14
- **Only The Launch Era homepage:** React component `src/components/smart-welcome-bundle.tsx` is explicitly mounted by `src/routes/index.tsx` and `src/routes/es.index.tsx`; never on buyer/customer Booking Pages, Command Centers or CB Depot.
- **Visual:** the exact approved flyer is self-hosted at `/assets/promo/tle-smart-welcome-bundle-flyer.jpg`. The origin asset was matched to SHA-256 `4b81811c533c735b755bfcb960c71d470f060265289b5bce19ad186873a97ce3` and imported unchanged to Git. No duplicated non-working 'Get it now' image button; the whole flyer and separate accessible CTA are navigable.
- **New visitor:** modal after 1.1 seconds only once per browser session, optional dismiss, Escape and focus restoration. **In-page:** smaller flyer with CTA below homepage hero for later review. Existing hero/solutions/other links stay intact.
- **Live promotion check:** public GET to `tle-booking-bundle-checkout` must return `percent_off=40` and `plans.ai-booking`; otherwise the modal and inline 40%-off claim are both hidden. No writes, no payment collection, no offer price invention.
- **CTA:** `/booking-bundle/?lang=en|es&bundle=ai-booking&source=smart-welcome` renders the **existing** combined-checkout choice with AI Booking preselected; other AI plans and booking-only remain available. Last checkout price, discount and monthly cost are validated by the existing Supabase bundle checkout backend. No direct payment link.
- **Rate terms:** 40% off eligible combined activation only, not ongoing AI subscription. AI standard monthly price starts after the first 30 days from delivery. No impact on current/future customers, their invoices or client-specific offers.
- **QA:** `scripts/qa-smart-welcome-home.mjs` verifies exact poster, routes, scope, safe discount and CTA; Playwright `scripts/qa-smart-welcome-home-browser.mjs` checks first/repeat session, responsive EN/ES, accessibility and selection, without submitting checkout.

## Booking bundle storytelling landing — 2026-10-14
- The homepage Smart Welcome **Get the bundle** goes to the existing public `/booking-bundle/?lang=en&bundle=ai-booking&source=smart-welcome`. Its landing now presents an educational hero, mini interactive examples for Booking/Command Center/AI, and a full details area BEFORE the unchanged purchase selector.
- Image assets from the approved human-cleaners images are self-hosted at `public/assets/bundle-landing/bundle-{hero,booking,command,ai}.png` with original SHA-256 verified by `scripts/qa-bundle-sales-landing.mjs`. Images are marketing photography; actual interactive demo illustrations use safe fabricated local data.
- Locale `?lang=en|es` switches authored copy. `#experience` leads to sample demos; `#included` summarizes; `#choose-plan` scrolls to the existing checkout component. Header and logo return to The Launch Era main site. Booking demo link to `/booking-demo/` and public AI detail link to `/ai-booking-assistant/#demo`; NO private CRM preview or actual client credentials exposed.
- Offer badge reads the existing `tle-booking-bundle-checkout` **GET** and appears only when `percent_off=40` with a valid AI plan. All final prices and payment checks remain within existing `public/assets/tle-booking-bundle.js` using Supabase and Stripe; **no checkout POST from landing demos**. AI is optional, separately priced monthly, and 40% applies only to eligible combined activation.
- Nothing changes in CB Depot booking, other tenants' pages, app dashboard, customer messages, or source of truth for pricing. Browser test: `scripts/qa-bundle-sales-browser.mjs` tests widths 360/390/820/1440 and Spanish/localized examples, fake-GET only and checkout choice preservation.

## Marketing Smart Welcome homepage sizing fix — 2026-10-14
- User identified the **in-page** flyer block below the home hero as overlarge and visually repetitive, especially on iPhone. The full approved flyer still appears only in the original **first-session popup**, not twice on the page.
- `src/components/smart-welcome-bundle.tsx` now renders a compact horizontal promotion strip on desktop, small stacked strip on phones: 40%-off combined-activation label, short benefit, caveat about AI monthly fees, **one** `Explore the bundle` / `Ver paquete` CTA.
- The strip stays behind the real pricing GET gate; it links to the same public `/booking-bundle/?lang=...&bundle=ai-booking&source=smart-welcome` landing, not a payment redirect. All tenant booking pages, CB Depot, quotes, Command Center and public demos remain unchanged.
- Regression: browser QA at 360/390/820/1440 enforces inline height <=225px mobile or <=165px desktop, no repeated flyer image, and one functioning CTA.


## 2026-10-15 — Prospect demo and sales demo editorial extensions (v12)

- **Sample preview only:** `/lead-private-preview.html` without `key` or `owner_preview=1`. The enhancement script `public/assets/tle-demo-enhancements-v12.js` and CSS `public/assets/tle-demo-enhancements-v12.css` add `#tleDemoReviews`, `#tleDemoAreas`, `#tleDemoFaq` and a `#bookingStarter` closing CTA. Review slots are clearly labeled demo placeholders, never invented customer quotes; areas come only from the `area` query parameter, otherwise show explicitly unconfirmed placeholders. Background photographs use existing `/assets/lead-demo/` assets. No operational booking data, service keys, or forms are modified.
- **Robot AI icon:** `/assets/lead-demo/ai-demo-robot.webp`, derived from the user's supplied glowing robot avatar. Existing live AI booking assistant `public/assets/tle-ai-booking-chat.js` remains the same endpoint/prefill workflow. Enhancement updates only its sample-mode avatar, intro, guide actions, welcome nudge and clearly labels AI a separate optional service. It must never submit a real booking.
- **Sales demo:** `/booking-demo/` keeps its existing consent/payment-free personalized-demo form and existing Jessy backend, with the new icon and a form-guide panel. 'Help with form' focuses the `business` field only; 'Explore services' opens the existing Jessy assistant; 'AI is a separate add-on' explains service separation. Photos/review-layout/service-area previews on this sales page contain no false customer endorsements. Language toggle must not erase entered inputs.
- **No new route:** all added links remain on `/lead-private-preview.html` (`#demoServices`, `#tleDemoReviews`, `#tleDemoAreas`, `#tleDemoFaq`, `#bookingStarter`) or `/booking-demo/` (`#demoForm`); AI pricing links to existing `/ai-booking-assistant/`. Neither route should redirect to the Command Center or a client tenant.
- **Release verification:** validate `/assets/lead-demo/ai-demo-robot.webp`, `/assets/tle-demo-enhancements-v12.css` and `.js` load correctly on GitHub Pages; run deployed sample screens at 360/390/820/1024/1440 and EN/ES, check guide actions and assistant, and confirm owner-preview keys retain original behavior. Do not assert browser QA passed before it's observed.

## Sonny demo greeting and chat (2026-10-15)
- **Public SAMPLE only:** `/lead-private-preview.html?business=...&lang=en|es&sonny=1` uses `public/lead-private-preview.html`, `public/assets/tle-ai-booking-chat.js` and `public/assets/tle-demo-enhancements-v12.js`.
- The **in-page hero greeting** (`#tleSonnyInlineGreeting`) is a non-submitting introduction. “Let's chat” / “Chatear” explicitly opens Sonny; `sonny=1` does **not** auto-open a fullscreen chat or lock scrolling.
- The hero greeting and the small floating avatar alternate when the hero enters/exits view; the avatar is not a second assistant. Sonny chat field must keep dark text, placeholder and caret on white in mobile Safari, and remain separate from buyer/owner previews.
- Owner and buyer URLs with `key` or `owner_preview=1` bypass Sonny sample scripts. Closing the chat returns focus to the visible launcher/greeting. No booking, email or payment is sent by the greeting.

### Sonny single-bubble design — 2026-10-15
On `/lead-private-preview.html` sample only, `tle-demo-enhancements-v12.js` owns one `#tleSonnyGreetingPopup` anchored above the right-hand `.tle-ai-launch`. It is a compact dark-blue greeting that closes after approximately five seconds, on scroll, or when chat is opened. It is **not** a second assistant. Neither `#tleSonnyInlineHello` (the old wide bar) nor `#tleSonnyInlineGreeting` (the old white hero card) may render. `tle-demo-client-experience-v14.js` must not independently add another greeting. Opening Sonny requires a deliberate click, never the `?sonny=1` URL alone. The typing field retains black text and caret on white. Booking samples do not send orders or emails.

## 2026-10-15 — Jessie portrait and bundle preparation
- Public website `/assets/jessy-site.js` uses owner-approved `/assets/jessie-avatar.webp` and Jessie display name.
- Dedicated Command Center `Dashboard → Prepare bundles` opens authenticated Clients & Purchases and selects Booking + AI Bundle. Existing tenant-scoped controls manage Booking and AI separately; AI setup links use `https://thelaunchera.com/ai-booking-assistant/owner-delivery/`.

## 2026-10-15 — Round public assistant launcher
- Owner requested photo-only circular button at entry and after scroll. External invitation/accessible label: Chat with the assistant / Habla con la asistente. Jessie name retained only in the open chat. Existing scroll hides invitation; no chat, form, customer data or endpoint changes. Coverage fixture updated for initial round state and generic invitation; publication/browser evidence tracked by Actions.

## Jessie public website chat — broad help questions (2026-10-15)
- **Surface:** Public Jessie chat bubble at https://thelaunchera.com/ and supported service pages; widget route unchanged.
- **Source:** `supabase/functions/tle-jessy-chat/index.ts`, `knowledge.ts`, production Supabase Edge Function `tle-jessy-chat` in project `bowacxhmjvrqixtwaikv`.
- **Question:** `Que puedes ayudarme hoy` / `¿En qué me puedes ayudar?` / `What can you help me with today?` responds with bilingual verified TLE service overview, prices/demo guidance and one problem-discovery question.
- **No external action:** mode `capabilities`, cleared `selected_offer`, `next_action: none`; no checkout, contact submission, payment or booking.
- **Specific questions:** invoices, booking, pricing or policy continue through topical facts and current catalog, without leaking private information.
- **QA:** `node scripts/qa-jessie-capabilities.mjs` checks 13 intents, languages and reply scope.

## v30 compact cleaning demo / checkbox quote path (2026-10-15)
- **Route / scope:** `/lead-private-preview.html` ONLY when there is no `?key` and no `?owner_preview=1`. Production buyer booking pages, existing private owners, CB Depot tenant assets, lead IDs and live submission adapters are not edited.
- **Hero:** #leadHero background photo `/assets/cleaning-demo/hero-cleaner-original.jpg` remains the user's existing hosted asset; #leadHero .heroText displays on top of a dark-blue legibility gradient. Shorter height on desktop/tablet/mobile, no fake claims, no changes to customer name or demo disclaimer.
- **Flow:** marketing content is shortened via `tle-demo-compact-v30.css`: hide duplicate story, FAQ, why section and final promotional band; retain service cards, selectable demo bookings, sample-only reviews and service coverage. Existing #bookingStarter / #leadHero anchors and v22 focused booking controls are untouched.
- **New sample UI:** `tle-demo-compact-v30.js` adds actual checkbox checklists (multiple items) after frequency for residential, after size for quote, after size for commercial. Checking Other reveals an accessible textarea; incomplete Other description stops the sample save. Selected areas and custom request are added only to **sample** sessionStorage data/notes and to the residential review summary. Existing home details, date, time, estimated price, consent, routing and button semantics remain. Buttons appended to #residentialServiceList and #commercialServiceList route Other to existing `startQuote` and `startCommercial` functions; no new network submission.
- **Exclusions:** private/real buyer pages, owner's preview, personalized-demo-request `/booking-demo/`, payment and email logic. Check responsive widths 360/390/768/820/1024/1440 and tests before marking live.

## v31 Drive service photography + comparison gallery (2026-10-15)
- **Scoped URL:** `/lead-private-preview.html` public unkeyed sample only (EN/ES). Do not modify real buyer `?key`, owner `?owner_preview=1`, customer data or existing submission/email flows.
- **Source:** user-owned, anyone-readable Drive photo packs under `Luxury Residential Cleaning Photo Pack` and `Before & After`. No new Drive permissions or changes to originals. `scripts/build_demo_photo_assets.py` downloads 7 service source IDs, crops the clean right half of the retail before/after source, and generates 7 responsive local WebP files in `/assets/demo-services/`; the floor image depicts a clean floor edge and not a worker. The script also generates 6 matched sample before/after WebP files in `/assets/demo-transformations/`; files are published with the site, not hotlinked from Drive. CI requires all 7 service images; any incomplete comparison pair is dropped rather than faked.
- **Service cards:** `public/assets/tle-demo-photo-services-v21.js` uses new Drive IDs and person-free local fallbacks; `tle-demo-compact-v30.css` swaps marketing showcase backgrounds to cleaned rooms. The full-cover hero and its established photo stay unchanged.
- **Before/after UI:** `tle-demo-compact-v30.js/css` add `#tleV31Transformations` directly after `#demoServices`, 3 matched pairs (shower grout / bedroom / pantry), horizontal swipe and prev/next controls, Spanish localization and an explicit `illustrative images — not verified client results` disclaimer. Limit height, preserve unobstructed booking section. Hide incomplete photos if missing; never imply sample stock photos are real customer results.
- **Verification:** inspect 360/390/768/820/1024/1440, check image load in EN/ES, no worker in seven sample service images, no overflow, comparison pairs aligned, no unexpected external or customer submit, and private mode isolation.
