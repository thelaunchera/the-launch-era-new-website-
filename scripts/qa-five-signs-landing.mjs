import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const read = (path) => readFileSync(path, 'utf8');
const component = read('src/components/five-signs-cleaning.tsx');
const english = read('src/routes/5-signs-cleaning-business.tsx');
const spanish = read('src/routes/es.5-signs-cleaning-business.tsx');
const css = read('public/assets/tle-five-signs.css');
const deploy = read('.github/workflows/pages.yml');

assert.match(english, /createFileRoute\('\/5-signs-cleaning-business'\)/);
assert.match(spanish, /createFileRoute\('\/es\/5-signs-cleaning-business'\)/);
assert.match(english, /<FiveSignsCleaning lang="en"/);
assert.match(spanish, /<FiveSignsCleaning lang="es"/);
for (const file of [english, spanish]) {
  assert.match(file, /canonical/);
  assert.match(file, /hre[fF]Lang: 'en-US'/);
  assert.match(file, /hre[fF]Lang: 'es-US'/);
  assert.match(file, /tle-five-signs\.css/);
}
assert.match(component, /'\/cleaning-web-app'/);
assert.match(component, /'\/es\/cleaning-web-app\/'/);
assert.match(component, /'\/booking-lead-automation'/);
assert.match(component, /'\/es\/booking-lead-automation\/'/);
assert.match(component, /This is a separate service/);
assert.match(component, /Es un servicio independiente/);
assert.match(component, /Editorial illustration, not an App screenshot/);
assert.doesNotMatch(component, /\/demos\/|\/booking-demo\/|\/cleaning-app-demo\/|\/service-checkout\/|stripe|payment_link/i);
assert.equal((component.match(/title: '/g) || []).length, 10, 'five signs in each language');
assert.match(css, /^\.tle-five-signs\{/);
assert.match(css, /@media\(max-width:560px\)/);
assert.match(css, /@media\(prefers-reduced-motion:reduce\)/);
assert.match(deploy, /free-cleaning-lead-guide 5-signs-cleaning-business es/);
assert.match(deploy, /es\/free-cleaning-lead-guide es\/5-signs-cleaning-business/);
console.log('5 Signs marketing route: bilingual copy, isolated CSS, safe product links and Pages fallback OK');
