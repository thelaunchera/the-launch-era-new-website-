# Sweet Lisa’s Cafe — Editorial Demo v2 (visual concept)

## How to open
- Open `index.html` for the editorial story-driven website.
- Tap **View Digital Menu** to open `digital-menu.html`, which is intentionally separate from the homepage.
- Menu filters and the original-2025 breakfast flyer modal are interactive.
- All images are inside `assets/`. No network access is required except optional Google Fonts.

## Source & media notes
- Enhanced food illustrations were created from user-supplied reference images with AI. They are *visual concepts*, not verified unaltered food photos or proof of current offerings.
- The Sweet Lisa’s logo was cropped from the supplied Instagram profile reference. Keep the original identity.
- Original October 2025 breakfast flyer included for reference; price and hours were not carried into the live menu cards.
- Location references conflict between **109** and **111 N Greenwood Ave**. The demo points to a business search on Google Maps until the precise number is confirmed.
- No Stripe, checkout, online ordering, emails, automatic booking, CRM or Admin Panel is connected.

## Brand direction
Warm cream `#f7f1e9`, near-black `#181615`, editorial brick red `#982529`, muted sand `#eaded0`.
DM Serif Display + DM Sans, with local font fallbacks.

## QA
Run `python -m http.server 8000 --directory sweet-lisa-editorial-demo`, then view `/index.html` and `/digital-menu.html` at 375px, 768px and desktop sizes.