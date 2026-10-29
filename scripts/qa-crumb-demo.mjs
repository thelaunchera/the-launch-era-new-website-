import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url);
const { JSDOM } = require('jsdom');
const fs = require('node:fs');
const assert = require('node:assert/strict');
const path = require('node:path');
const root = fileURLToPath(new URL('../public/demos/crumb/', import.meta.url));
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const code = fs.readFileSync(path.join(root, 'main.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');
const dom = new JSDOM(html, { url: 'https://crumb.example/', runScripts: 'outside-only' });
const w = dom.window;
w.HTMLDialogElement.prototype.showModal = function() { this.open = true; };
w.HTMLDialogElement.prototype.close = function() { this.open = false; };
w.HTMLElement.prototype.scrollIntoView = function() {};
w.eval(code);
const d = w.document;
const click = selector => d.querySelector(selector).click();
const count = () => Number(d.querySelector('#bag-count').textContent);
const results = [];
for (const size of [3, 6, 12]) {
  click(`[data-pack="${size}"]`);
  while(count() < size) click('.cookie [data-add="classic"]');
  assert.equal(count(), size);
  assert.equal(d.querySelector('#price-total').textContent, '$' + (size * 3.5).toFixed(2));
  assert.equal(d.querySelectorAll('#box-tray .box-cookie-slot.filled').length, size);
  click('.cookie [data-add="double"]');
  assert.equal(count(), size);
  assert.match(d.querySelector('#status-text').textContent, /Box is full/);
  results.push(`${size}-cookie capacity and excess-add guard passed`);
}
click('[data-pack="3"]');
assert.equal(count(), 3);
assert.equal(d.querySelector('#status-count').textContent, '3 / 3');
assert.equal(d.querySelectorAll('#box-tray .box-cookie-slot').length,3);
results.push('Shrinking from 12 to 3 keeps the bag within capacity');
click('[data-wrap="Ribbon Edition"]');
d.querySelector('#gift-note').value = 'Happy birthday <script>unsafe</script>';
click('#preview-button');
const preview = d.querySelector('#preview');
assert.equal(preview.hidden, false);
assert.match(preview.textContent, /Ribbon Edition/);
assert.match(preview.textContent, /Sample box total: \$10\.50/);
assert.match(preview.textContent, /3 × Classic Chocolate Chip · \$3\.50 each · \$10\.50/);
assert.match(preview.textContent, /Happy birthday <script>unsafe<\/script>/);
assert.equal(preview.querySelector('script'), null);
assert.equal(preview.querySelectorAll('img').length, 1);
assert.match(preview.querySelector('img').getAttribute('src'), /classic\.webp\?v=/);
results.push('Preview shows quantities, selected photos, packaging and safely rendered gift message');
for(let i=0;i<5;i++)click('[data-minus="classic"]');
assert.equal(count(), 0);
assert.equal(d.querySelector('#qty-classic').textContent, '0');
click('#preview-button');
assert.equal(preview.hidden, true);
assert.match(d.querySelector('#status-text').textContent, /Add 3 more cookies/);
assert.equal(d.querySelectorAll('#box-tray .box-cookie-slot.filled').length,0);
results.push('Minimum quantity and incomplete-box preview guards passed');
click('#close-builder');
click('.cookie [data-add="caramel"]');
assert.match(d.querySelector('#feedback-text').textContent, /Salted Caramel added/);
assert.equal(d.querySelector('#bag-feedback').hidden,false);
click('#feedback-open');
assert.equal(d.querySelector('#bag-feedback').hidden,true);
assert.equal(d.querySelector('#box-dialog').open,true);
click('#close-builder');
click('#open-delivery');
assert.equal(d.querySelector('#delivery-dialog').open, true);
assert.match(d.querySelector('#delivery-dialog').textContent, /does not accept delivery orders/);
click('#delivery-build');
assert.equal(d.querySelector('#delivery-dialog').open, false);
assert.equal(d.querySelector('#box-dialog').open, true);
results.push('Local delivery information opens and returns to gift builder');
const expectedPrices = {classic:350, double:450, caramel:550, raspberry:600, nutty:700, brownie:500};
for(const [id,cents] of Object.entries(expectedPrices)) {
  const formatted = '$' + (cents/100).toFixed(2);
  assert.equal(d.querySelector('[data-price-for="'+id+'"]').textContent,formatted+' each');
  assert.equal(d.querySelector('[data-builder-price="'+id+'"]').textContent,formatted);
}
assert.equal(d.querySelectorAll('[data-price-for]').length,6);
assert.equal(d.querySelectorAll('[data-builder-price]').length,6);
assert.equal(d.querySelector('#price-total').textContent,'$5.50');
click('.cookie [data-add="classic"]');
click('.cookie [data-add="nutty"]');
assert.equal(count(),3);
assert.equal(d.querySelector('#price-total').textContent,'$16.00');
assert.equal(d.querySelector('#price-label').textContent,'Your box total');
click('#preview-button');
assert.match(d.querySelector('#preview').textContent,/Sample box total: \$16\.00/);
assert.match(d.querySelector('#preview').textContent,/Nutty Dream · \$7\.00 each/);
assert.match(d.querySelector('#preview').textContent,/Packaging: Ribbon Edition · included/);
assert.match(html,/3 cookies · from \$10\.50/);
assert.match(html,/6 cookies · from \$21\.00/);
assert.match(html,/12 cookies · from \$42\.00/);
assert.match(html,/No real checkout/);
results.push('Six prices $3.50–$7.00, minimum box prices, live $16.00 mixed box, zero checkout');
assert.equal(d.querySelectorAll('.cookie').length, 6);

const compactTitles = {
  'gifting-title':'A little gift. Big joy.',
  'brand-glimpse-title':'Inside CRUMB.',
  'moment-title':'It started with a cookie.',
  'final-title':'Make their day.'
};
for(const [id,expected] of Object.entries(compactTitles)) assert.equal(d.getElementById(id).textContent,expected);
assert.match(css,/Compact headings for small screens/);
assert.match(html,/styles\.css\?v=20261029-crumb-powered-footer-v3/);
results.push('Compact iPhone section titles retain correct English copy and styling');

const expectedFlavors = [
  ['classic','Classic Chocolate Chip'],
  ['double','Double Chocolate'],
  ['caramel','Salted Caramel'],
  ['raspberry','White Chocolate Raspberry'],
  ['nutty','Nutty Dream'],
  ['brownie','Brownie Chip']
];
for(const [id,flavor] of expectedFlavors) {
  const card=d.querySelector('.cookie[data-card="'+id+'"]');
  assert.ok(card,'Flavor card missing: '+flavor);
  assert.equal(card.querySelector('h3').textContent,flavor);
  const image=card.querySelector('img');
  assert.match(image.getAttribute('src'),new RegExp('/'+id+'\\.webp\\?v=20261029-crumb-v7'));
  assert.equal(image.getAttribute('width'),'1024');
  assert.equal(image.getAttribute('height'),'1024');
  const file=path.join(root,'assets',id+'.webp');
  assert.ok(fs.existsSync(file) && fs.statSync(file).size>150000,'Missing high-quality photo '+id);
  const builder=d.querySelector('.flavor-row [data-add="'+id+'"]');
  assert.ok(builder,'Missing builder flavor '+id);
  assert.equal(builder.getAttribute('aria-label'),'Add '+flavor);
  assert.equal(builder.closest('.flavor-row').querySelector('strong').textContent,flavor);
}
assert.equal(d.querySelectorAll('.cookie img[src*="20261029-crumb-v7"]').length,6);
assert.equal(d.querySelectorAll('.flavor-row img[src*="20261029-crumb-v7"]').length,6);
assert.doesNotMatch(d.querySelector('#cookies').textContent,/White Chocolate Macadamia|Cookies & Cream|Cinnamon Sugar/);
assert.ok(code.includes('webp?v=20261029-crumb-v7'), 'Gift builder must load the same new photos');
results.push('All six new 1024px flavors, titles and builder photos match and load from local assets');
const heroMobileSource = d.querySelector('.hero picture source[media="(max-width: 600px)"]');
assert.ok(heroMobileSource);
assert.match(heroMobileSource.getAttribute('srcset'), /hero-mobile\.webp\?v=/);
const photoGrid = d.querySelectorAll('.brand-glimpse-gallery figure');
assert.equal(photoGrid.length, 3);
assert.equal(d.querySelectorAll('.brand-glimpse-gallery img[src*="brand-packaging.webp"]').length,1);
assert.equal(d.querySelectorAll('.brand-glimpse-gallery img[src*="brand-tasting.webp"]').length,0);
assert.equal(new Set([...d.querySelectorAll('.brand-glimpse-gallery img')].map(i=>i.getAttribute('src'))).size,3);
assert.equal(d.querySelector('.gift-photo img').getAttribute('src').includes('brand-gifts.webp'), true);
assert.equal(d.querySelector('.moment-photo img').getAttribute('src').includes('brand-lifestyle.webp'), true);
for(const name of ['hero-mobile','brand-gifts','brand-lifestyle','brand-storefront','brand-maker','brand-packaging']) {
 const p = path.join(root,'assets',name+'.webp');
 assert.ok(fs.existsSync(p) && fs.statSync(p).size > 20000, 'Missing brand image '+name);
}
assert.match(css,/\.brand-glimpse-gallery/);
assert.ok(css.includes('.hero { height:auto; min-height:0; aspect-ratio:16 / 9; background:#d9c0a6; }'));
assert.ok(css.includes('.hero { height:auto; min-height:0; aspect-ratio:4 / 5; }'));
assert.ok(css.includes('.hero picture img { display:block; width:100%; height:100%; object-fit:contain; object-position:center center; }'));
assert.ok(css.includes('.hero picture img { object-fit:contain; object-position:50% 50%; }'));
assert.ok(css.includes('.hero-strip { padding:44px 5% 34px;'));
assert.ok(css.includes('gap:14px; padding:30px 18px 28px;'));
results.push('Full hero photo visible without crop; text and CTAs lower on all screen sizes');
assert.match(css,/\.gift-copy \{ align-items:center/);
assert.equal(d.querySelectorAll('#box-tray .box-cookie-slot').length, 3);
assert.equal(d.querySelectorAll('.final-cta [data-open-builder]').length,1);
assert.equal(d.querySelectorAll('.bag-feedback').length,1);
assert.match(css, /\.builder-flavor-layout/);
assert.match(css, /object-position:18% 49%/);
assert.equal(d.querySelectorAll('.ribbon-banner,.ribbon-track,video,iframe').length, 0);
assert.equal(d.querySelectorAll('.cookie-visual > .add-cookie').length, 6);
assert.equal(d.querySelectorAll('.cookie-visual > .add-cookie').length, d.querySelectorAll('.cookie').length);
assert.ok(html.includes('hero.webp?v=20261029-crumb-v6'));
assert.match(html, /hero-mobile.webp\?v=20261029-crumb-v6/);
assert.equal(d.querySelectorAll('.crumb-marquee-row').length, 2);
assert.equal(d.querySelectorAll('.crumb-marquee-track span').length, 4);
assert.match(css, /@keyframes crumbBannerLeft/);
assert.match(css, /@keyframes crumbBannerRight/);
assert.ok(css.includes('.cookie:first-child, .cookie:nth-child(2), .cookie:last-child { grid-column:span 1; }'));
assert.ok(css.includes('aspect-ratio:16 / 9'));
assert.ok(css.includes('height:clamp(312px,83vw,420px)'));
assert.equal(d.querySelectorAll('.gps-visual .gps-route').length, 1);
assert.match(d.querySelector('#delivery-title').textContent, /We're in your area/);
assert.doesNotMatch(code, /navigator\.geolocation|watchPosition|getCurrentPosition/);
for(const link of d.querySelectorAll('a[href^="#"]'))assert.ok(d.getElementById(link.hash.slice(1)), 'Broken anchor: '+link.hash);
for(const image of d.querySelectorAll('img')) {
  const relative = image.getAttribute('src').split('?')[0];
  assert.ok(relative.startsWith('./assets/'), 'Every image is local to CRUMB');
  assert.ok(fs.existsSync(path.join(root, relative)), 'Missing asset: ' + relative);
  assert.ok(fs.statSync(path.join(root, relative)).size > 1000, 'Empty image: ' + relative);
}
for(const ref of ['styles.css','main.js'])assert.ok(fs.existsSync(path.join(root,ref)));
assert.match(html,/noindex,nofollow/);
assert.equal(new Set([...d.querySelectorAll('.cookie-visual img')].map(image=>image.src)).size,6);
assert.doesNotMatch(code,/fetch\(|sendBeacon|stripe|supabase/i);
assert.match(d.querySelector('#delivery').textContent, /Miami and surrounding areas/);
assert.equal(d.querySelectorAll('form').length,1,'only the demo contact form exists');
assert.equal(d.querySelectorAll('input[type="email"]').length,1,'email exists only inside the contact modal');
assert.equal(d.querySelectorAll('input[type="tel"]').length,0);
results.push('Six unique flavor image paths, section anchors, Miami copy and no old ribbon/payment form verified');

// Store experience remains a fictional demo: no real address, social profiles or sending.
assert.equal(d.querySelector('#story h2').textContent,'It started with a cookie.');
assert.match(d.querySelector('#story').textContent,/fictional bakery story/i);
assert.ok(d.querySelector('a[href="#story"]'));
assert.match(d.querySelector('.footer-location address').textContent,/128 Cookie Lane\s*Miami, FL 33131/);
assert.match(d.querySelector('.footer-location').textContent,/Fictional address · Not a real storefront/);
assert.equal(d.querySelectorAll('.footer-social [data-social]').length,2);
assert.match(d.querySelector('.footer-note').textContent,/No orders, payments or contact messages are accepted/);
const credits = d.querySelectorAll('.site-footer .footer-credit');
assert.equal(credits.length,1,'Studio credit should appear exactly once in footer');
assert.equal(credits[0].textContent.trim(),'Powered by The Launch Era');
assert.equal(credits[0].querySelector('a').getAttribute('href'),'https://thelaunchera.com/');
assert.ok(css.includes('.site-footer .footer-credit'),'Footer credit has responsive styling');
const contactDialog=d.querySelector('#contact-dialog');
const contactForm=d.querySelector('#contact-form');
const contactFeedback=d.querySelector('#contact-feedback');
assert.equal(contactDialog.open,false,'contact modal closed before any click');
click('.footer-contact-button');
assert.equal(contactDialog.open,true,'Contact Us opens a form');
assert.equal(contactForm.hidden,false);
assert.equal(contactFeedback.hidden,true);
assert.equal(contactForm.closest('dialog').id,'contact-dialog');
assert.match(contactDialog.textContent,/Your message will not be sent or saved/);
contactForm.dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));
assert.equal(contactFeedback.hidden,true,'empty form must not show a success');
d.querySelector('#contact-name').value='Sample Customer';
d.querySelector('#contact-email').value='sample@example.com';
d.querySelector('#contact-message').value='A question about gift boxes';
contactForm.dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));
assert.equal(contactForm.hidden,true,'a valid demo submission hides the form');
assert.equal(contactFeedback.hidden,false);
assert.match(contactFeedback.textContent,/Nothing was sent, stored or delivered/);
assert.equal(d.querySelector('#contact-email').value,'','demo form data cleared immediately');
click('#contact-again');
assert.equal(contactForm.hidden,false);
assert.equal(contactFeedback.hidden,true);
click('#close-contact');
assert.equal(contactDialog.open,false);
click('[data-open-contact]');
assert.equal(contactDialog.open,true,'story contact opens same reusable dialog');
click('#close-contact');
const socialDialog=d.querySelector('#social-dialog');
assert.equal(socialDialog.open,false);
click('[data-social="Instagram"]');
assert.equal(socialDialog.open,true);
assert.match(d.querySelector('#social-platform').textContent,/Instagram · fictional account preview/);
assert.match(socialDialog.textContent,/No real CRUMB account is linked/);
click('#close-social');
assert.equal(socialDialog.open,false);
click('[data-social="TikTok"]');
assert.match(d.querySelector('#social-platform').textContent,/TikTok · fictional account preview/);
click('#social-back');
assert.equal(socialDialog.open,false);
assert.equal(d.querySelectorAll('a[href*="instagram.com"],a[href*="tiktok.com"],a[href*="maps.google.com"]').length,0);
assert.doesNotMatch(code,/fetch\(|sendBeacon|localStorage|sessionStorage|XMLHttpRequest/i,'no contact transmission or storage');
assert.ok(css.includes('#contact-form[hidden],.contact-feedback[hidden] { display:none!important; }'));
assert.ok(html.includes('hero.webp?v=20261029-crumb-v6'),'approved hero remains unchanged');
results.push('Contact only opens on click, never transmits/stores data; fictional address/socials and brand story verified');



// Tablet framing and restrained flavor labeling acceptance guards.
const tabletRules = css.slice(css.lastIndexOf('/* CRUMB iPad/tablet final:'));
assert.match(tabletRules, /@media \(min-width: 601px\) and \(max-width: 1366px\)/);
assert.match(tabletRules, /\.hero picture img\s*\{[^}]*height:\s*auto;[^}]*object-fit:\s*contain;/);
assert.match(tabletRules, /\.hero-strip\s*\{[^}]*padding:\s*clamp\(50px, 6vw, 78px\)/);
assert.match(tabletRules, /\.hero-strip p\s*\{[^}]*font-size:\s*clamp\(36px, 4\.1vw, 54px\)/);
assert.match(tabletRules, /\.hero-strip \.button\s*\{[^}]*min-height:\s*52px;/);
const expectedFlags = {caramel:'Special',raspberry:'New Flavor',nutty:'Special'};
const flaggedCards = [...d.querySelectorAll('.cookie .cookie-flag')];
assert.equal(flaggedCards.length, 3);
for(const card of d.querySelectorAll('.cookie')) {
  const slug = card.getAttribute('data-card');
  const flag = card.querySelector('.cookie-flag');
  if (Object.hasOwn(expectedFlags,slug)) {
    assert.ok(flag, 'Missing flag: '+slug);
    assert.equal(flag.textContent.trim(),expectedFlags[slug]);
    assert.ok(flag.closest('.cookie-visual'), 'Flag must overlay picture');
  } else {
    assert.equal(flag,null,'Unexpected flag on '+slug);
  }
}
assert.match(css,/\.cookie-visual \.cookie-flag--new/);
results.push('Tablet hero natural image ratio, lower CTAs, exactly three product flavor flags');

console.log(JSON.stringify({method: 'DOM integration; dialog APIs simulated; not visual browser QA', passed: results}, null, 2));
