# Direct before/after interaction — 2026-10-18

Previously the comparison responded only to the range below the image. Add direct pointer dragging on the entire photo, a visible 44px draggable handle, pointer capture and cancel cleanup, touch-action:pan-y for vertical page scrolling, keyboard arrows/Home/End and synchronized range/ARIA values. Typography reduced while preserving the chosen editorial and color direction.

Playwright Chromium passed for all three pairs: desktop mouse drag and emulated mobile touch swipe; footer range, keyboard and handle synchronized; no runtime errors or external requests in the self-contained file. These checks are not a physical Safari test. Existing service zoom and form continuation tests passed at 360/390/820/1024/1440. Updated mobile and desktop screenshots inspected; embedded fonts loaded. Static route integrity passed (353/353). Production and protected access gate unchanged.
