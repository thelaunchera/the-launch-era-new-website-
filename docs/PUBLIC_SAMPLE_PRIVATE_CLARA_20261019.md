# Public Sample Cleaning vs private Clara — 2026-10-19

Homepage main CTA See Demos points to /sample-cleaning/?lang=en&source=homepage. Spanish Ver demos points to /sample-cleaning/?lang=es&source=homepage.
Below hero, Request a More Personalized Demo links to /booking-demo/?lang=en&source=homepage-clara; Spanish equivalent uses lang=es.
Public Sample Cleaning is based on the owner's screenshot: Beautifully cleaned. Simply booked.; Sample Cleaning/Miami fictional business; real sample service selection and browser-only confirmation.
Public version removes original lead-specific configurations, live buyer adapter, AI chat API, personalized demo tracking POST and sessionStorage persistence. CSP connect-src none and form-action none.
Original /lead-private-preview.html and key-based buyer/owner views stay unchanged. Backend /booking-demo-reset.html serves Clara only after signed authorization. No emails or bookings sent by releasing the public HTML.
The existing /try-booking/ mini demo remains separate for the owner-workspace illustration. Public template links there as a secondary sample.
All public content English and Spanish; pricing and checkout unchanged.
Required release: node scripts/qa-sample-cleaning-public.mjs; node scripts/qa-public-booking-conversion.mjs; node scripts/qa-route-integrity.mjs --static; CI/browser and live production safety QA.