import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';

const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const en = read('src/components/editorial-sections.tsx');
const es = read('src/routes/es.index.tsx');
const shared = read('src/components/home-sales.tsx');
const tone = read('src/components/booking-tone-shift.tsx');
const css = read('public/assets/tle-booking-tones.css');
const root = read('src/routes/__root.tsx');

for (const [label, source] of [['English', en], ['Spanish', es]]) {
  assert.match(source, /className="booking-section"><BookingToneShift\/>/, label + ': missing tone component');
  assert.match(source, /booking-bundle\/\?lang=(?:en|es)/, label + ': checkout destination removed');
  assert.match(source, /\$19\.99/, label + ': offer price must remain unchanged');
  assert.match(source, /12 PM ET/, label + ': Saturday timing must be visible');
  assert.match(source, /<ConnectedBookingFlow lang="(?:en|es)"\/>/, label + ': connected preview must stay interactive');
}
assert.match(shared, /TWO AUTOMATIC FOLLOW-UPS/, 'Follow-up count not explained');
assert.match(shared, /DOS SEGUIMIENTOS AUTOMÁTICOS/, 'Spanish follow-up count not explained');
assert.match(shared, /onClick=\{\(\)=>\{setView\(i\);track/, 'Explorer tabs must remain interactive');
assert.match(tone, /new IntersectionObserver\(schedule/, 'Missing native IntersectionObserver');
assert.match(tone, /rootMargin: '-45% 0px -45% 0px'/, 'Missing midpoint trigger');
assert.match(tone, /window\.addEventListener\('scroll', schedule/, 'Missing scroll fallback for wide/short screens');
assert.match(tone, /observer\?\.disconnect\(\)/, 'Missing observer cleanup');
assert.match(css, /background-color 700ms ease/, 'Tone animation missing');
assert.match(css, /prefers-reduced-motion: reduce/, 'Reduced motion not supported');
assert.match(css, /#FAF8F3/);
assert.match(css, /#EAF4FC/);
assert.match(root, /\/assets\/tle-booking-tones\.css\?v=20261016-1/, 'Asset not loaded');

function luminance(hex) {
  const rgb = hex.match(/[a-f\d]{2}/gi).map(s => parseInt(s, 16) / 255)
    .map(v => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  return rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722;
}
for (const bg of ['#FAF8F3', '#EAF4FC', '#FFFFFF']) {
  for (const fg of ['#191919', '#40596A', '#52616B']) {
    const [a, b] = [luminance(bg), luminance(fg)].sort((x,y) => y-x);
    assert.ok((a + 0.05) / (b + 0.05) >= 4.5, 'WCAG AA contrast failure ' + fg + '/' + bg);
  }
}
console.log('✅ Homepage EN/ES booking tones: copy, checkout, connected board, motion, cleanup and AA contrast guards passed');
