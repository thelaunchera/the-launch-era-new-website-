import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read = (path) => readFileSync(new URL('../'+path, import.meta.url), 'utf8');
const site = read('src/components/site-shell.tsx');
const footer = read('src/components/footer-theme-sweep.css');
const toast = read('public/assets/tle-purchase-proof.css');
const toastJs = read('public/assets/tle-purchase-proof.js');
const root = read('src/routes/__root.tsx');
const contact = read('src/components/contact-stepper.tsx');
for (const guard of [
 'role="switch"', 'aria-checked={dark}', 'tle_footer_theme_v1',
 'prefers-color-scheme: dark','startViewTransition','flushSync',
 'tle-footer-theme-control','tle-footer-dark-layer'
]) assert(site.includes(guard), 'Footer theme missing: '+guard);
for (const label of ['Solutions','How It Works','Contact','Privacy','Terms']) assert(site.includes(label), 'Footer link missing: '+label);
assert.equal((site.match(/data-tle-newsletter/g)||[]).length,1,'A theme must never clone the newsletter form');
assert.equal((site.match(/<nav className="footer-links"/g)||[]).length,1,'Do not clone real footer links');
for(const guard of ['::view-transition-new(tle-footer)','::view-transition-old(tle-footer)',
 'clip-path:circle(150%','clip-path:circle(0%','900ms cubic-bezier(.55,0,.15,1)',
 'prefers-reduced-motion:reduce','tle-footer-icon-moon','tle-footer-icon-sun','translateX(20px)','outline:3px'])
 assert(footer.includes(guard),'Footer motion/contrast missing: '+guard);
assert(footer.includes('.tle-footer-dark .tle-newsletter-consent'), 'Newsletter consent must contrast in dark mode');
assert(toast.includes('width:min(221px'),'Verified toast should be small on iPhone');
assert(toastJs.includes('footerVisible()') && toastJs.includes('dismissNearFooter'), 'Purchase notices cannot block footer content');
assert(root.includes('tle-purchase-proof.css?v=20261016-mini3') && root.includes('tle-purchase-proof.js?v=20261016-mini3'),'Toast styling/script must be cache refreshed');
assert(contact.includes('validStep(step)') && contact.includes('inert={index !== step}'),'Contact validation and inactive panels are mandatory');
console.log('PASS — Public footer theme, newsletter/link uniqueness, mobile toast and contact protections.');
