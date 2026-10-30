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
  'gifting-title':'Thoughtful, without overthinking it.',
  'brand-glimpse-title':'Inside CRUMB.',
  'moment-title':'It started with a cookie.',
  'final-title':'Next time, bring CRUMB.'
};
for(const [id,expected] of Object.entries(compactTitles)) assert.equal(d.getElementById(id).textContent,expected);
assert.match(css,/Compact headings for small screens/);
assert.match(html,/styles\.css\?v=20261030-crumb-pain-first-gifts-v13/);
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
assert.match(heroMobileSource.getAttribute('srcset'), /CRUMB_Storefront_Approved_20261030\.webp\?v=/);
assert.match(css,/scroll-snap-type:x mandatory/,'Mobile gallery enables snap carousel');
assert.match(css,/flex:0 0 min\(84vw,360px\)/,'Mobile photos use consistent full-card width with a small preview of the next photo');
assert.match(css,/scroll-snap-stop:always/,'Mobile cards snap one at a time');
assert.match(css,/object-fit:contain/,'All mobile gallery photographs fit without clipping');
assert.ok(html.includes('styles.css?v=20261030-crumb-pain-first-gifts-v13'), 'Updated CSS must bypass stale iOS browser cache');
assert.ok(html.includes('main.js?v=20261030-crumb-gallery-tablet-v3'), 'Updated carousel controller must bypass stale iOS browser cache');
assert.equal(d.querySelectorAll('.crumb-gallery-dot').length,3,'Three accessible slide selectors');
click('[data-crumb-slide="2"]');
assert.equal(d.querySelector('.crumb-gallery-counter').textContent,'3 / 3','Third packaging photo is reachable via a dot');
assert.equal(d.querySelector('[data-crumb-slide="2"]').getAttribute('aria-current'),'true');
click('[data-crumb-slide="0"]');
assert.equal(d.querySelector('.crumb-gallery-counter').textContent,'1 / 3');
const photoGrid = d.querySelectorAll('.brand-glimpse-gallery figure');
assert.equal(photoGrid.length, 3);
assert.equal(d.querySelectorAll('.brand-glimpse-gallery img[src*="CRUMB_02_Bolsa_Azul.png"]').length,1);
assert.equal(d.querySelectorAll('.brand-glimpse-gallery img[src*="CRUMB_Inside_Cookie_Moment_Blue.svg"]').length,1);
assert.equal(d.querySelectorAll('.brand-glimpse-gallery img[src*="CRUMB_Inside_Made_With_Care_Blue.svg"]').length,1);
assert.equal(d.querySelectorAll('.brand-glimpse-gallery img[src*="CRUMB_Storefront_Hero_Blue.png"]').length,0,'Do not repeat storefront in gallery');
assert.equal(new Set([...d.querySelectorAll('.brand-glimpse-gallery img')].map(i=>i.getAttribute('src'))).size,3);
assert.equal(d.querySelector('.gift-photo img').getAttribute('src').includes('CRUMB_03_Gift_Box_Azul.png'), true);
assert.equal(d.querySelector('.moment-photo img').getAttribute('src').includes('CRUMB_Our_Story_Approved_20261030.webp'), true);
assert.equal(d.querySelector('.moment-photo img').getAttribute('width'), '1092');
assert.equal(d.querySelector('.moment-photo img').getAttribute('height'), '1440');
assert.ok(css.includes('CRUMB Our Story photo 2026-10-30: keep full portrait visible on phones'));
assert.ok(fs.statSync(path.join(root,'assets','CRUMB_Our_Story_Approved_20261030.webp')).size>100000);
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
results.push('Editorial storefront hero preserves CTA and readable copy at desktop and mobile breakpoints');
assert.match(css,/\.gift-copy \{ align-items:center/);
assert.equal(d.querySelectorAll('#box-tray .box-cookie-slot').length, 3);
assert.equal(d.querySelectorAll('.final-cta [data-open-builder]').length,1);
assert.equal(d.querySelectorAll('.bag-feedback').length,1);
assert.match(css, /\.builder-flavor-layout/);
assert.match(css, /object-position:18% 49%/);
assert.equal(d.querySelectorAll('.ribbon-banner,.ribbon-track,video,iframe').length, 0);
assert.equal(d.querySelectorAll('.hero-editorial-content h2').length,1,'Storefront hero gets headline text in HTML rather than in the photograph');
assert.match(d.querySelector('.hero-editorial-content h2').textContent,/What shouldI bring\?Cookies\./);
assert.equal(d.querySelector('.hero-editorial-cta').getAttribute('href'),'#cookies');
assert.equal(d.querySelectorAll('.hero-perks > span').length,4);
assert.equal(d.querySelectorAll('.cookie-brand-stamp svg').length,6,'Six original cookie-logo doodles, never a dog mascot');
assert.equal(d.querySelectorAll('.cookie-note-left').length,6);
assert.equal(d.querySelectorAll('.cookie-note-bottom').length,6);
assert.ok(css.includes('grid-template-columns:repeat(4,minmax(0,1fr))'),'Four editorial flavor cards per large desktop row');
assert.ok(css.includes('background:repeating-linear-gradient(90deg,#C9E2F4 0 19px,#FFF5CE 19px 38px)'),'Approved blue/cream stripes');
assert.ok(css.includes('CRUMB v12: petite plus visual / consistent full-bleed Inside slides'), 'Newest petite-plus/gallery CSS is applied');
assert.match(css,/min-width:44px/,'Every add button keeps an accessible 44px tap target');
assert.match(css,/\.add-cookie::before[\s\S]*?width:32px/,'The plus has a petite visible blue circle');
assert.match(css,/\.add-cookie::before[\s\S]*?width:30px/,'Mobile plus has a 30px visible circle');
assert.match(css,/\.brand-glimpse \.brand-glimpse-gallery figure img,[\s\S]*?height:min\(84vw,360px\)/,'All three mobile gallery photos share square height');
assert.match(css,/\.brand-glimpse \.brand-glimpse-gallery figure:nth-child\(3\) img \{[\s\S]*?object-position:50% 56%/,'Third portrait packaging photo is intentionally cropped with no sidebars');
assert.equal(d.querySelectorAll('.cookie-visual > .add-cookie').length, 6);
assert.equal(d.querySelectorAll('.cookie-visual > .add-cookie').length, d.querySelectorAll('.cookie').length);
assert.ok(html.includes('CRUMB_Storefront_Approved_20261030.webp?v=1'));
assert.match(html, /CRUMB_Storefront_Approved_20261030\.webp\?v=1/);
assert.ok(css.includes('background:#DCEFFA') && css.includes('background:#477BB3'),'The CRUMB moving banners use approved blues');
assert.ok(css.includes('html, body { width:100%; max-width:100%; overflow-x:clip; }'),'Prevent cross-device horizontal overflow');
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
assert.ok(html.includes('CRUMB_Storefront_Approved_20261030.webp?v=1'),'approved storefront is the hero');
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
results.push('Editorial hero, six striped cards, working add buttons and exactly three flavor flags validated');


// Tablet-only storefront hero: no text panel, overlay or crop. Mobile/desktop unchanged.
const tabletHeroPhoto = css.slice(css.lastIndexOf('/* CRUMB · photo-only storefront hero on tablets'));
assert.match(tabletHeroPhoto, /@media \(min-width: 601px\) and \(max-width: 1366px\)/);
assert.match(tabletHeroPhoto, /\.hero\.hero-editorial\s*\{[^}]*height:\s*auto;[^}]*min-height:\s*0;/s);
assert.match(tabletHeroPhoto, /\.hero\.hero-editorial::after\s*\{[^}]*content:\s*none;[^}]*display:\s*none;/s);
assert.match(tabletHeroPhoto, /\.hero\.hero-editorial \.hero-editorial-content\s*\{\s*display:\s*none;/);
assert.match(tabletHeroPhoto, /\.hero\.hero-editorial picture\s*\{[^}]*position:\s*relative;[^}]*width:\s*100%;[^}]*height:\s*auto;/s);
assert.match(tabletHeroPhoto, /\.hero\.hero-editorial picture img\s*\{[^}]*width:\s*100%;[^}]*height:\s*auto;[^}]*object-fit:\s*contain;/s);
assert.match(html, /styles\.css\?v=20261030-crumb-pain-first-gifts-v13/);
assert.match(html, /CRUMB_Storefront_Approved_20261030\.webp/);
assert.ok(d.querySelector('.hero-editorial-content'), 'original hero copy kept for phone/desktop');
results.push('Tablet shows approved storefront photo alone; no blue panel, text, CTA or cropping');


// Tablet flavor gallery regression: photographs, copy, pricing and bag actions are preserved.
const tabletGridCSS = css.slice(css.lastIndexOf('/* CRUMB tablet-only cookie gallery repair'));
assert.match(tabletGridCSS, /@media \(min-width: 601px\) and \(max-width: 1366px\)/);
assert.match(tabletGridCSS, /grid-template-columns: repeat\(3, minmax\(0, 1fr\)\)/);
assert.match(tabletGridCSS, /@media \(min-width: 601px\) and \(max-width: 759px\)/);
assert.match(tabletGridCSS, /grid-template-columns: repeat\(2, minmax\(0, 1fr\)\)/);
assert.match(tabletGridCSS, /background: #FFFCF7/);
assert.match(tabletGridCSS, /-webkit-mask-image: none/);
assert.match(tabletGridCSS, /display: none/);
assert.match(tabletGridCSS, /position: static !important/);
assert.match(tabletGridCSS, /border-radius: 50%/);
assert.match(tabletGridCSS, /\.cookie-detail \.cookie-price/);
assert.match(tabletGridCSS, /\.cookie-detail p/);
assert.match(html, /styles\.css\?v=20261030-crumb-pain-first-gifts-v13/);
assert.equal(d.querySelectorAll('.cookie-grid .cookie').length, 6, 'all six flavors preserved');
assert.equal(d.querySelectorAll('.cookie-grid .cookie [data-add]').length, 6, 'all six Add controls preserved');
assert.equal(d.querySelectorAll('.cookie-grid .cookie .cookie-price').length, 6, 'all six prices preserved');
results.push('Clean tablet photo-first gallery and six interactive flavor cards validated');



// Responsive visual contract: tablet Inside CRUMB is the same 3-image swipe carousel as phone.
// Only narrow desktop/tablet/mobile widths get the refreshed powder-blue/butter-yellow cookie edit.
const responsiveCrumb = css.slice(css.lastIndexOf('/* CRUMB 2026-10-30 · Inside carousel'));
assert.ok(responsiveCrumb.startsWith('/* CRUMB 2026-10-30 · Inside carousel'));
assert.ok(responsiveCrumb.includes('@media (min-width: 601px) and (max-width: 1366px)'));
assert.ok(responsiveCrumb.includes('.brand-glimpse .brand-glimpse-gallery'));
assert.ok(responsiveCrumb.includes('scroll-snap-type: x mandatory'));
assert.ok(responsiveCrumb.includes('scroll-snap-stop: always'));
assert.ok(responsiveCrumb.includes('.brand-glimpse .crumb-gallery-controls'));
assert.ok(responsiveCrumb.includes('display: flex'));
assert.ok(responsiveCrumb.includes('@media (max-width: 1366px)'));
assert.ok(responsiveCrumb.includes('repeating-linear-gradient(90deg, #C9E2F4 0 22px, #FFF1C9 22px 44px)'));
assert.ok(responsiveCrumb.includes('display: contents'));
assert.ok(responsiveCrumb.includes('.cookie-detail h3'));
assert.ok(responsiveCrumb.includes('.cookie-detail .cookie-price'));
assert.ok(responsiveCrumb.includes('-webkit-mask-image: none'));
assert.ok(responsiveCrumb.includes('.cookie-grid .cookie-note { display: none; }'));
assert.ok(responsiveCrumb.includes('@media (max-width: 759px)'));
assert.ok(responsiveCrumb.includes('grid-template-columns: repeat(2, minmax(0, 1fr))'));
assert.ok(code.includes("window.matchMedia('(max-width:1366px)').matches"), 'Tablet gallery must support keyboard arrows');
assert.match(html, /styles\.css\?v=20261030-crumb-pain-first-gifts-v13/);
assert.match(html, /main\.js\?v=20261030-crumb-gallery-tablet-v3/);
assert.ok(css.includes('/* CRUMB Inside gallery — remove picture-in-a-box matte, preserve 3 slides */'), 'CRUMB gallery removes the blue photo-frame background');
assert.match(css,/\.brand-glimpse \.brand-glimpse-gallery figure img,[\s\S]*?object-fit: cover/,'Photos fill their slide without pale blue side-bars');
assert.match(css,/\.brand-glimpse \.brand-glimpse-gallery figure:nth-child\(3\) img \{[\s\S]*?object-position: center 61%/,'Packaging crop keeps the branded bag and cookies in view');
assert.equal(d.querySelectorAll('.brand-glimpse-gallery figure').length,3);
assert.equal(d.querySelectorAll('.cookie-grid > .cookie').length,6);
assert.equal(d.querySelectorAll('.cookie-grid [data-add]').length,6);
assert.equal(d.querySelectorAll('.cookie-grid .cookie-price').length,6);
results.push('Tablet Inside CRUMB carousel and six legible blue/butter cards for phone/tablet verified');

// Mobile-only hero regression: brand photo appears uncut, with centered editorial copy beneath it.
const mobileHeroRules = css.slice(css.lastIndexOf('/* CRUMB 2026-10-30 · refined small-phone hero'));
assert.match(mobileHeroRules, /@media \(max-width: 600px\)/);
assert.match(mobileHeroRules, /\.hero\.hero-editorial\s*\{[^}]*flex-direction:\s*column;/s);
assert.match(mobileHeroRules, /\.hero\.hero-editorial::after\s*\{[^}]*content:\s*none;/s);
assert.match(mobileHeroRules, /\.hero\.hero-editorial picture\s*\{[^}]*position:\s*relative;/s);
assert.match(mobileHeroRules, /\.hero\.hero-editorial picture img\s*\{[^}]*height:\s*auto;[^}]*object-fit:\s*contain;/s);
assert.match(mobileHeroRules, /\.hero\.hero-editorial \.hero-editorial-content\s*\{[^}]*align-items:\s*center;[^}]*text-align:\s*center;/s);
assert.match(mobileHeroRules, /\.hero\.hero-editorial \.hero-editorial-content h2\s*\{[^}]*text-align:\s*center;/s);
assert.match(mobileHeroRules, /\.hero\.hero-editorial \.hero-editorial-cta\s*\{[^}]*margin:\s*0 auto;/s);
assert.match(mobileHeroRules, /\.hero\.hero-editorial \+ \.hero-perks\s*\{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/s);
assert.match(mobileHeroRules, /\.hero\.hero-editorial \+ \.hero-perks > span\s*\{[^}]*align-items:\s*center;/s);
assert.equal(d.querySelector('.hero-eyebrow'), null, 'Remove duplicated FRESH COOKIES · GOOD MOOD headline');
assert.match(html, /What should<br>I bring\?<br>Cookies\./, 'Keep approved hero title');
assert.equal(d.querySelectorAll('.hero-perks > span').length, 4, 'Keep four benefit items');
assert.match(html, /styles\.css\?v=20261030-crumb-pain-first-gifts-v13/, 'New hero CSS loaded');
results.push('Mobile CRUMB hero shows full bakery photo, centered CTA/copy/perks; tablet photo-only layout preserved');



// Cata-inspired problem-first copy: gift doubt -> flavor proof -> box action.
assert.equal(d.querySelector('.hero-editorial-content h2')?.textContent,'What shouldI bring?Cookies.');
assert.equal(d.querySelector('.hero-editorial-cta')?.getAttribute('href'),'#cookies');
assert.equal(d.getElementById('cookies-title')?.textContent,'Start with their favorite.');
assert.match(d.querySelector('.gift-copy p')?.textContent || '', /Pick their flavors, choose a box size/);
assert.equal(d.querySelectorAll('[data-open-builder]').length >= 2,true);
assert.match(html, /What should<br>I bring\?<br>Cookies\./);
assert.match(css, /CRUMB pain-first editorial gift messaging/);
assert.match(css, /white-space: normal/);
assert.ok(html.includes('Fictional address · Not a real storefront'));
assert.ok(html.includes('No orders, payments or contact messages are accepted.'));
results.push('Gift-doubt hero, six-flavor proof and gift-box CTAs verified; demonstration disclaimers preserved');

console.log(JSON.stringify({method: 'DOM integration; dialog APIs simulated; not visual browser QA', passed: results}, null, 2));
