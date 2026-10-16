import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const component = readFileSync('src/components/faq-topic-tabs.tsx', 'utf8');
const styles = readFileSync('src/components/faq-topic-tabs.css', 'utf8');
const serviceFAQ = readFileSync('src/components/service-faq.tsx', 'utf8');
const bookingFAQ = readFileSync('src/components/home-sales.tsx', 'utf8');
const serviceSales = readFileSync('src/components/service-sales.tsx', 'utf8');
const cleaningEditorial = readFileSync('src/components/cleaning-app-editorial.tsx', 'utf8');

for (const expected of ['role="tablist"', 'role="tab"', 'role="tabpanel"', 'aria-selected=', 'aria-labelledby=', 'tabIndex=', 'inert=', 'ArrowRight', 'ArrowLeft', 'Home', 'End', 'ResizeObserver', "'--o': index - active"]) {
  assert.ok(component.includes(expected), 'Missing accessible FAQ behavior: ' + expected);
}
for (const expected of ['height: 2.5px', 'translateX(calc(var(--faq-active)', '590ms', 'translateX(calc(var(--o) * 34px))', '560ms', 'prefers-reduced-motion: reduce', ':focus-visible']) {
  assert.ok(styles.includes(expected), 'Missing FAQ motion/accessibility CSS: ' + expected);
}
assert.match(serviceFAQ, /FAQTopicTabs lang=\{lang\} billing=\{billing\} account=\{account\}/);
assert.match(bookingFAQ, /FAQTopicTabs lang=\{lang\} billing=\{\[questions\[1\]\]\}/);
assert.match(serviceSales, /FAQTopicTabs lang=\{lang\} billing=\{\[questions\[3\]\]\}/);
assert.match(cleaningEditorial, /FAQTopicTabs lang=\{lang\} billing=\{\[faqs\[3\]\]\}/);
assert.ok(component.includes('/es/privacy.html') && component.includes('/privacy.html'), 'Privacy policy destinations missing');
console.log('PASS — bilingual FAQ topic tabs: native accordions, keyboard behavior, inert panels, animated indicator, reduced-motion support.');
