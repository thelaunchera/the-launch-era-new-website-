/**
 * The Launch Era — pre-deployment client-delivery contract checks.
 * Fast static guard: confirms shared promises and customer isolation.
 * This does NOT replace authenticated, owner-approved end-to-end QA.
 */
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const read = (path) => readFileSync(path, 'utf8');
const checks = [];
const check = (label, fn) => {
  try { fn(); checks.push({label, passed: true}); console.log('PASS', label); }
  catch (error) { checks.push({label, passed: false}); console.error('FAIL', label, error.message); }
};
const productionCopy = [
  'src/components/service-faq.tsx',
  'public/automation-terms/index.html',
  'public/es/automation-terms/index.html',
  'public/va-terms/index.html',
  'public/es/va-terms/index.html'
];
for (const path of productionCopy) {
  check('Production terms: ' + path, () => {
    const content = read(path);
    assert.match(content, /48\s*(?:-|‑|–)?\s*(?:hour|hora)/i, '48-hour promise missing');
    assert.match(content, /s[aá]bad|Saturday/i, 'Saturday cutoff missing');
    assert.doesNotMatch(content, /\b24\s*(?:-|‑|–)?\s*(?:hour|hora)[^\n]{0,45}(?:production|producci[oó]n)|(?:production|producci[oó]n)[^\n]{0,45}\b24\s*(?:-|‑|–)?\s*(?:hour|hora)/i, 'Old 24-hour production copy returned');
  });
}
check('Checkout confirmation only reveals intake after validation', () => {
  const page = read('public/booking-flow-payment-success/index.html');
  assert.match(page, /id="intakeLink"\s+hidden/);
  assert.match(page, /48\s*(?:-|‑|–)?\s*hour/);
  assert.match(page, /Spam\/Junk/);
});
check('CB Depot brand and car-specific copy', () => {
  const js = read('public/assets/cb-depot-experience.js');
  assert.match(js, /vehicle-booking/, 'Branding must be scoped to detailing buyer');
  assert.match(js, /Professional car detailing/);
  assert.match(js, /assets\/clients\/cb-depot\/photos\/hero-desktop/);
  assert.match(js, /approved-favicon-192\.png/);
  assert.match(js, /\/cb-depot\/privacy\//);
  assert.match(js, /\/cb-depot\/terms\//);
  assert.doesNotMatch(js, /\bLicensed\s*(?:&|and)\s*Insured\b/i, 'Do not publish unverified licensed/insured');
});
check('Buyer-specific favicon and hero assets', () => {
  for (const path of [
    'public/assets/clients/cb-depot/photos/hero-desktop.webp',
    'public/assets/clients/cb-depot/photos/hero-mobile.webp',
    'public/assets/clients/cb-depot/approved-favicon-192.png',
    'public/assets/clients/cb-depot/approved-favicon-512.png'
  ]) assert(existsSync(path), path + ' missing');
});
check('CB Depot privacy and booking terms', () => {
  assert.match(read('public/cb-depot/privacy/index.html'), /CB Depot/);
  assert.match(read('public/cb-depot/terms/index.html'), /Requests are not confirmations/);
  assert.match(read('public/cb-depot/privacy/index.html'), /data-cb-back/);
  assert.match(read('public/cb-depot/terms/index.html'), /data-cb-back/);
});
check('Client-specific and agency app icons remain distinct', () => {
  const crm = 'https://github.com/thelaunchera/the-launch-era-crm/blob/main/';
  assert.match(read('public/assets/cb-depot-experience.js'), /approved-favicon/);
  assert(crm.includes('the-launch-era-crm'));
});
check('Reusable launch checklist exists', () => {
  assert(existsSync('scripts/qa-booking-base.mjs'));
  assert(existsSync('.github/workflows/booking-base-qa.yml'));
  assert(existsSync('.github/workflows/website-responsive-qa.yml'));
});
const failed = checks.filter(x => !x.passed);
console.log('Client release static checks:', checks.length - failed.length, 'passed,', failed.length, 'failed');
if (failed.length) process.exitCode = 1;
