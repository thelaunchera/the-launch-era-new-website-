# The Launch Era — Public Copy Standard

Applies to **all customer-facing work**: website, service pages, FAQs, checkout, onboarding, booking demos, Command Center UI, emails, notifications, guides, and future client builds. This is an internal editorial guide, **not copy to display on the website**.

## Who we're speaking to
Owners of cleaning businesses in the United States. They are busy serving customers, checking messages, managing jobs, quoting, and following up. Write like a helpful person who understands their day, not like software documentation.

## Voice
- **English** for public marketing by default; **Spanish** versions must carry the same real meaning and natural tone.
- Lead with a recognizable situation: a missed inquiry, a quote that went quiet, notes spread across messages, or a schedule that takes too much time to organize.
- Use a simple path: **hook → real problem → how our help works → concrete benefit → one clear next step**.
- Short sentences. Natural contractions. Warm, clear, modern, confident, premium. Understandable within three seconds.
- Name the benefit before the feature. Explain a feature only as much as the customer needs to decide what to do.
- Use the actual product names: **Booking Automation + Command Center**, **Cleaning App**, **Website Automation**, **Virtual Assistant**, **AI Assistants**.
- Prefer: “Your next customer’s request lands in one place” over “Lead routing workflow has been initiated.”
- Prefer: “We couldn't send this right now. Please try again.” over internal error details.

## Never put operational or developer-only text in public copy
No raw API responses, errors, tokens, URLs for infrastructure, webhooks, environment names, build status, QA/debug notes, data model terms, vendor names used only by our infrastructure, or placeholder strings. Don't surface terms like `Supabase`, `Resend`, `backend`, `payload`, `endpoint`, `staging`, `mock`, `CI`, or `deployment` to customers.

Keep honest, plain-language notices where needed: demo data is an example; a demo doesn't create a real booking; approval isn't delivery; price estimates aren't final prices; payment isn't verified until confirmed; a purchase's timeline starts when required details and approvals are complete. Do not hide material limits, prices, terms, or safety instructions just to make copy sound friendlier.

## Digital-first contact and setup language
- The Launch Era's public footers and intake introductions do not advertise a weekly office-hours timetable. People can send inquiries and submit setup forms at any time; human replies are not promised 24/7.
- Keep the distinction between always-available submission and the **48-hour estimated production window**, which begins only with completed payment, forms and required approvals during the next available production period. Preserve material Saturday cutoff conditions on offer pages, checkout and legal terms.
- A cleaning business customer **must still configure its own booking availability and policies**. Those operational hours are the customer's hours, not The Launch Era's customer-support hours.
- Maintain equivalent EN/ES phrasing and a direct contact link in the public footer. Do not claim a message was delivered without a confirmed provider result.

## Consistency / quality
- Keep English and Spanish pages equivalent, including offer, timing, FAQ, forms, review allowances, and error states.
- Never change pricing, discounts, cutoffs, access permissions, auto-confirm behavior, or delivery commitments during a copy-only revision.
- Payment boundary: **The Launch Era sells its own digital services through Stripe**. Customer payment options *recorded inside Cleaning App* are **Cash, Zelle, and Check**; never imply the Cleaning App charges cleaning customers via Stripe.
- Intake receipt is not a production kickoff. Only an owner-reviewed approval triggers the separate production-start email and estimated 48-hour production window. No duplicate kickoff messages.
- Be careful with the word “automatic”: say exactly **what** is automatic and under which conditions; do not imply a quote is a confirmed booking.
- Only claim work is live/finished after the relevant real checks pass. Illustrative panels must not imply employees or messages are active.
- Avoid generic promises such as “transform your business,” “supercharge growth,” or “revolutionize your workflow.”
- Before publishing: check desktop, tablet, and mobile; review every language; test the CTA and honest failure/success messages; confirm no developer text leaks into visible UI.
- Tests should protect **meaning and behavior**, rather than depend on an arbitrary phrase when an equivalent plain-language message is correct.
