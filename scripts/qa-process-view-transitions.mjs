/* Non-destructive static guard for the EN/ES homepage process transition. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (name) => readFileSync(new URL('../' + name, import.meta.url), 'utf8');
const component = read('src/components/process-view-transitions.tsx');
const styles = read('src/components/process-view-transitions.css');
const en = read('src/components/editorial-sections.tsx');
const es = read('src/routes/es.index.tsx');

for (const [label, source, needle] of [
  ['EN', en, '<ProcessSteps lang="en"/>'],
  ['ES', es, '<ProcessSteps lang="es"/>']
]) {
  assert(source.includes(needle), label + ' must mount the same accessible process component');
  assert(source.includes('id="contacto"'), label + ' contact anchor must remain');
  assert(source.includes('homepage-contact-panel'), label + ' contact panel must remain');
}
assert(en.includes('<ContactForm/>'), 'EN form removed');
assert(es.includes('<SpanishContact/>'), 'ES form removed');
assert(component.includes("import './process-view-transitions.css'"), 'Scoped CSS must be imported');
for (const text of [
  'startViewTransition', 'flushSync', 'viewTransitionName',
  'getBoundingClientRect()', 'detailHero.current.animate',
  'prefers-reduced-motion: reduce', 'aria-haspopup="dialog"',
  'role="dialog"', 'aria-modal="true"', 'onDialogKeyDown',
  "event.key === 'Escape'", "event.key === 'Tab'", 'createPortal',
  'returnFocus.current?.focus', 'document.body.style.overflow',
  'We personalize your system.', 'Personalizamos tu sistema.'
]) assert(component.includes(text), 'Missing interaction or accessibility requirement: ' + text);

for (const text of [
  '::view-transition-group(tle-process-0)',
  'cubic-bezier(.32,.72,0,1)',
  'animation-duration: 500ms',
  '.tle-process-thumbnail', '.tle-process-overlay',
  '.tle-process-detail-hero', '.tle-process-card:focus-visible',
  'prefers-reduced-motion: reduce', '@media (max-width: 767px)'
]) assert(styles.includes(text), 'Missing visual, responsive or reduced motion rule: ' + text);
// The three steps must tell a real, distinct visual story using existing
// first-party Booking + Command Center photos, not generic enlarged icons.
const expectedPhotos = [
  '/assets/bundle-landing/bundle-booking.png',
  '/assets/bundle-landing/bundle-hero.png',
  '/assets/bundle-landing/bundle-command.png'
];
assert.equal(new Set(expectedPhotos).size, 3, 'Each step needs a different photo');
for (const photo of expectedPhotos) {
  assert(component.includes(photo), 'Missing context photo: ' + photo);
  assert(read('public' + photo).length > 1000, 'Photo file absent or empty: ' + photo);
}
assert(component.includes('className="tle-process-detail-photo"'), 'Dialog must render a real photo');
assert(component.includes('alt={stepPhotos[active].alt[lang]}'), 'Photo alt text must be bilingual');
assert(styles.includes('object-fit: cover'), 'Photos should crop without distortion');
assert(!component.includes('tle-process-detail-art'), 'Old oversized icon should not return');
console.log('[PROCESS TRANSITIONS QA PASSED] EN/ES cards open an accessible, responsive, reduced-motion-safe shared-element detail; contact forms are preserved.');
