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
assert(story.includes('El sistema da seguimiento por ti.') && story.includes('Your system follows up for you.'),'EN/ES follow-up step must lead with the benefit');
assert(story.includes('Envía recordatorios automáticamente y se detiene cuando el cliente responde.') && story.includes('Automatic reminders go out when there’s no reply—and stop when the customer responds.'),'Automatic reminders must stop on reply in the EN/ES story');
assert(!story.includes('Dos seguimientos automáticos.') && !story.includes('Two automatic follow-ups.'),'Hero storytelling should not lead with an internal limit');
assert(component.includes('hasta dos seguimientos automáticos') && component.includes('up to two automatic follow-ups'),'Detailed FAQ must truthfully disclose the maximum');

for (const photo of [
  'booking.webp', 'command.webp', 'hero.webp'
]) {
  const asset = 'optimized/'+photo;
  assert(component.includes('/assets/bundle-landing/' + asset), 'Missing optimized image source: '+asset);
  const bytes=statSync(new URL('../public/assets/bundle-landing/' + asset, import.meta.url)).size;
  assert(bytes > 5000 && bytes < 320000, 'Oversized or missing WebP: '+asset+' bytes '+bytes);
}
assert.equal(new Set(['booking.webp','command.webp','hero.webp']).size, 3);
const steps=read('src/components/process-view-transitions.tsx');
for (const photo of ['booking-thumb.webp','command-thumb.webp','hero-thumb.webp']) {
  assert(steps.includes('/assets/bundle-landing/optimized/'+photo),'Process thumbnail missing '+photo);
  const bytes=statSync(new URL('../public/assets/bundle-landing/optimized/'+photo,import.meta.url)).size;
  assert(bytes>2000&&bytes<90000,'Thumbnail oversized or missing '+photo);
}
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
