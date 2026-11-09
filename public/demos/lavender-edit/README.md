# The Lavender Edit — visual demo

**Project:** The Lavender Edit, a fictional soft-luxury beauty editorial concept designed by The Launch Era. This is a showcase demo, **not a live store**.

## Route
- https://thelaunchera.com/demos/lavender-edit/ (subject to publication/hosting verification)
- Source folder: public/demos/lavender-edit/

## Photo provenance
Original Drive folder: https://drive.google.com/drive/folders/1qD7EmHCyKEs-aHUFlloKP9-nDuv1q7Ug
Original visuals folder: https://drive.google.com/drive/folders/1zqzLqSkPobH0DQnGfmFAhNkJ0o2YxQNm
Prompts file: https://drive.google.com/file/d/1YoVsthcjmxEamdB7CKah75eHzsnpWL4g/view

Eight unique original files were copied to `photos/` for reliable image loading; the source originals remain untouched in Google Drive. Each source photo is used once (not duplicated). Generated imagery is a **concept illustration**; the items and copy are not evidence of real merchandise, ingredients, benefits or prices.

## Photo → section mapping
1. 01_Soft_Lavender_Hero.png → immersive hero.
2. 02_Lavender_Mood_Macro.png → mood / abstract material close-up.
3. 03_Lavender_Ritual.png → brand story / ritual.
4. 04_Cream_Texture.png → formula texture.
5. 05_Lavender_Gifting.png → gifting feature.
6. 06_Editorial_Type.png → gallery editorial.
7. 07_Daily_Ritual.png → gallery ritual.
8. 08_After_Hours.png → gallery after hours.

## Rebuild guide
Use one fully-bleed vertical hero photograph, generous space, oversized high-contrast serif, and a restrained lavender/ivory/plum color palette. Build alternating editorial sections with unique individual photographs, maintain the phone-first vertical rhythm, provide EN/ES controls, and avoid stock testimonials, prices, fake product claims, shopping cart or checkout without a real business. Do not bake artificial endorsements into copy.

**QA checklist:** test all eight image requests; test EN/ES switch; test 375px screen, sticky navigation and accessible mobile menu; check anchor scrolling and copyright footer.

Powered by The Launch Era.

## Interactive storefront (2026-11-09)
- **Shopping demonstration, never real commerce.** The existing three original illustrative price examples are reused as the only demo product catalog. Pricing is not duplicated or invented inside the cart.
- Customers can select **Add to bag**, change quantities, remove selections, review a demo subtotal and complete a clearly simulated purchase without card, address or personal information.
- The confirmation does not send an order, charge a card, write customer information or issue a receipt. Cart state is held in memory only and resets on page refresh.
- The navigation now includes an anchored Shop / Comprar link and a Bag / Bolsa control, both localized EN/ES.
- The approved lavender purple `#7952B3` and golden sunlight `#F4B85D` palette, fifteen original/new photos, and lower-page film stay unchanged.
- Source: `boutique-shop-20261109.js`, `boutique-shop-20261109.css`, `index.html`.
