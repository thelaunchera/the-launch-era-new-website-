# Website checklist review — 26 October 2026

Scope: The Launch Era public marketing routes and demos, Cleaning App public shell, and the separate podcast landing/product pages. CB Depot, customer records, private owner systems and protected demo content are outside this change.

| Video item | Evidence / result |
|---|---|
| 1. Privacy policy | Existing TLE EN/ES expanded with actual providers, optional statistics and data choices. Podcast has its own policy. |
| 2. Terms | Existing TLE service conditions preserved. Podcast gets a separate terms page. |
| 3. Refund policy | Visible review/cancellation/help route; no invented automatic refund or blanket denial. Product-specific terms and statutory rights preserved. |
| 4. Cookie policy | Separate EN/ES TLE and Spanish podcast pages explain browser storage, providers and choices. |
| 5. Cookie consent | Optional GA, assistant metrics, App visit metrics and podcast audio statistics denied until opt-in; reject/reopen/revoke; GPC/DNT respected. |
| 6. Form notices | Privacy links beside contact collection; podcast newsletter purpose explicit; free-guide optional newsletter box stays unchecked. |
| 7. Minimize collection | No new DOB, ID upload or sensitive fields. Analytics excludes full page URL query/hash; podcast session ID created only with consent. |
| 8. Third-party SDKs | Existing Google Analytics, Supabase, Make, Resend, Stripe, AI, fonts and remote assets reviewed by source. Google does not load before consent. Other providers required for requested functionality remain. Not a full backend security audit. |
| 9. Dark patterns | Accept/reject have the same size/style. No preselected optional statistics; no consent wall. Existing offer dates and commercial terms untouched. |
| 10. Hidden fees | Existing one-time/monthly pricing preserved. Podcast single payment/digital-only disclosure and links shown near purchase. Final provider checkout/tax totals not transaction-tested. |
| 11. Fake reviews | Public cleaning sample already labels illustrative proofs/reviews/examples. No new fabricated review. Verified-only purchase-proof logic preserved. |
| 12. Unsupported claims | TLE terms clarify samples and no guaranteed bookings/revenue. Podcast content is reflection, without a promised personal outcome. |
| 13. Alternative text | Existing production hero and product-image alt text reviewed; new controls/policies add no unlabeled images. Full asset-by-asset accessibility certification remains outside verified scope. |
| 14. Contrast | New privacy controls and policy text use dark text on ivory/soft blue and visible focus. Existing global site contrast requires rendered audit; browser service timed out. |
| 15. Keyboard | New controls use native buttons/links; visible focus, reopening focus and Escape support. Existing keyboard tests retained; live browser suite pending CI. |
| 16. Business details | Brand and public support email present. No private home address invented/published. A verified business postal address is still needed for a complete commercial-email footer audit. |
| 17. Children's data | Adult-service scope and under-13 reporting instructions. No unnecessary age/DOB/parental-consent form added to general adult-facing pages. |
| 18. Unsubscribe | Podcast existing baja page and newsletter separation preserved. TLE exposes email opt-out without sign-in. Actual outgoing commercial templates/provider suppression were not sent or modified. |
| 19. Font/image licenses | Podcast local font license files exist. TLE uses Google font families/system fallbacks and existing images. Original commercial image/asset permissions still require owner's documentation; not certified by code. |
| 20. Data deletion request | Public TLE email request and podcast help route visible. Explicitly a review request, never an automatic deletion or fake success state. |

Validation: privacy behavior test (default/reject/accept/revoke/GPC/expiry/blocked-storage/cross-tab/safe URL/auth preservation); static routes and existing recovery/client/newsletter guards. Production website build passed. Existing full Vitest routing suite hits a pre-existing Vite public-JS import in home-motion-interlude.tsx; unrelated file was not changed. Remote deployment and browser evidence are recorded separately after release.

References consulted: FTC CAN-SPAM compliance guide https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business ; ICO consent implementation https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guidance-on-the-use-of-storage-and-access-technologies/how-do-we-manage-consent-in-practice/ ; W3C WCAG 2.2 https://www.w3.org/TR/WCAG22/ . These are implementation references, not a certification of legal compliance or a determination that every jurisdiction applies.
