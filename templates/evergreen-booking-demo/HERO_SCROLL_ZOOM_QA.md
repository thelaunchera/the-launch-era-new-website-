# Hero scroll expansion — 2026-10-18

Only the hero visual is wrapped in a short sticky runway. Its photo scales progressively on native page scroll, corners open toward a full-width mobile photo, and scrolling up reverses the effect. No libraries, scroll hijacking or endless animation loop. Work is requestAnimationFrame-throttled and paused outside visibility; reduced motion uses the original static card without the runway.

Chromium/Playwright passed 360, 390, 820, 1024, 1440: photo width increases by more than 5px on scroll, reverses when returning to top, no horizontal overflow, no runtime errors. Reduced-motion transform stays none. Scrolled 390px screenshot inspected. Static route integrity 353/353 passed. Physical Safari testing remains pending. No production route/gate or customer records changed.
