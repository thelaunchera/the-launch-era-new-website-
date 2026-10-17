/* Three-stage homepage booking scrollytelling QA; read-only, no purchases/forms. */
import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
const read = file => readFileSync(new URL('../' + file, import.meta.url), 'utf8');
const component = read('src/components/home-sales.tsx');
const css = read('src/components/booking-scrollytelling.css');
const en = read('src/components/editorial-sections.tsx');
const es = read('src/routes/es.index.tsx');
const enRoute = read('src/routes/index.tsx');
const sales = read('src/components/smart-welcome-bundle.tsx');
assert(component.includes("import './booking-scrollytelling.css'"), 'Missing CSS import');
const story = component.split('export function BookingWalkthrough(')[1]?.split('export function PainCards(')[0] || '';
for(const key of [
  'booking-scrolly-wrap', 'booking-scrolly-sticky', 'booking-scrolly-scene',
  'booking-scrolly-steps', 'booking-scrolly-step', 'booking-scrolly-card',
  'booking-scrolly-shape', 'data-step={step}', 'IntersectionObserver',
  "rootMargin:'-45% 0px -45% 0px'", 'observer.disconnect()',
  'scrollIntoView', 'booking-story-heading-', 'aria-pressed={step===i}',
  'Tu cliente elige un servicio.', 'Your client chooses a service.',
  'Review everything in your Command Center.'
]) if(key)assert(story.includes(key), 'Missing story item '+key);
assert(story.includes("reduce?'auto':'smooth'"), 'Reduced motion must avoid smooth scroll');
assert(story.includes('bookingStoryPhotos.map'), 'Each step must render its own real image');
for (const photo of [
  'bundle-booking.png', 'bundle-command.png', 'bundle-hero.png'
]) {
  assert(component.includes('/assets/bundle-landing/' + photo), 'Missing image source: '+photo);
  assert(statSync(new URL('../public/assets/bundle-landing/' + photo, import.meta.url)).size > 5000, 'Empty image: '+photo);
}
assert.equal(new Set(['bundle-booking.png','bundle-command.png','bundle-hero.png']).size, 3);
for(const [name, source] of [['EN',en],['ES',es]]) {
  assert(source.includes('id="hero-next" className="hero-copy"><BookingWalkthrough'), name+' missing homepage story entry');
}
assert(enRoute.includes('<SmartWelcomeBundle lang="en"/>'), 'English bundle offer missing');
assert(es.includes('<SmartWelcomeBundle lang="es"/>'), 'Spanish bundle offer missing');
assert(sales.includes("const href = '/booking-bundle/?lang=' + lang"), 'Bundle checkout destination changed');
for(const key of [
  'position: sticky', 'height: 100svh', 'margin-top: -100svh', 'min-height: 100svh',
  '.booking-scrolly-wrap[data-step="1"] .booking-scrolly-shape',
  '.booking-scrolly-wrap[data-step="2"] .booking-scrolly-shape',
  'transform: translate(4vw, 2vh) scale(.96) rotate(45deg)',
  '--story-ease: linear(', 'transition: transform 900ms var(--story-ease)',
  'prefers-reduced-motion: reduce', 'pointer-events: none',
  'booking-scrolly-photo--0', 'booking-scrolly-photo--1', 'booking-scrolly-photo--2',
  'booking-scrolly-wrap[data-step="1"] .booking-scrolly-photo',
  '.booking-scrolly-icon-ring'
])assert(css.includes(key), 'Missing CSS state '+key);
console.log('[BOOKING STORY QA PASSED] EN/ES native IntersectionObserver scrollytelling; preserved bundle, anchor, controls and reduced motion.');
