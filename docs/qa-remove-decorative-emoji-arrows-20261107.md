# No decorative emoji / arrow sweep — November 7, 2026

Owner's iPhone screenshot demonstrated that the Unicode U+2733 star from La Vie in Pink rendered as a bright green emoji instead of an editorial brand symbol. Remove these decorative glyphs, not photo assets or meaningful navigation.

- La Vie in Pink: removed 9 star characters in both editable React source and shipped JS. CTA/back/hero arrows removed from source and concealed in shipped bundle using scoped CSS. Product-card redundant circular arrow-only button is now a visible accessible "Ver"/"View" text control, with same onClick and 44px target. The clickable product photo retains its navigation. Keep menu, close, and check icons functional.
- Lavender Edit: remove star separators and typographic arrow icons in links.
- Havana 19 / Umbral legacy: remove decorative arrow glyphs in bilingual text and CTA copy; URLs and booking preview unchanged.
- Angela/Claudia: remove sparkle/mail emoji from demo labels without changing any sample-only notices or flows.
- Ivory & Bloom: remove "BACK TO TOP" trailing arrow; original link intact.
- Marea Wigs: a concurrent change already replaced the decorative star with a neutral middot in editable source and shipped bundle; it was not touched here.
- Other current GitHub demos were scanned for the same green star; no remaining copies found.

Release gates: CI verifies icon/arrow absence in source and deployed assets plus original CTA handling; GitHub Pages deployment must complete successfully; live route and Safari visual inspection are independent. Customer data, bookings, emails, checkout and auth untouched.