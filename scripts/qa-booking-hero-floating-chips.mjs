import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const chips = read('src/components/booking-floating-chips.tsx');
const css = read('src/components/booking-floating-chips.css');
const en = read('src/routes/booking-lead-automation.tsx');
const es = read('src/routes/es.booking-lead-automation.tsx');

for (const [language, route, dest] of [
  ['en', en, '/booking-bundle/?lang=en'],
  ['es', es, '/booking-bundle/?lang=es'],
]) {
  assert(route.includes('booking-motion-hero'), `${language}: booking scoped hero missing`);
  assert(route.includes('booking-headline-stage'), `${language}: heading stage missing`);
  assert(route.includes(`<BookingFloatingChips lang="${language}" />`), `${language}: chips missing`);
  assert(route.includes(`href="${dest}"`), `${language}: purchase destination changed`);
  assert(route.includes(`href="/booking-demo/?lang=${language}&source=booking-landing"`), `${language}: personalized demo destination changed`);
}
assert(chips.includes('aria-hidden="true"'), 'Chips must be decorative to assistive tech');
assert(chips.includes('Illustrative example') && chips.includes('Ejemplo ilustrativo'), 'Missing sample data disclosures');
assert(chips.includes("['") === false || chips.includes('previewChips'), 'Invalid chips definition');
for (const id of ['signup', 'metric', 'payment', 'messages']) {
  assert(chips.includes(`id: '${id}'`), `Missing ${id} chip`);
}
for (const guard of ['@keyframes booking-chip-bob', '@keyframes booking-chip-enter', 'max-width: 640px', 'prefers-reduced-motion: reduce', '.booking-float-item--metric', '.booking-float-item--payment', 'pointer-events: none']) {
  assert(css.includes(guard), `Missing CSS guard: ${guard}`);
}
console.log('PASS: Booking EN/ES floating example chips, responsive/reduced motion and original CTA destinations.');
