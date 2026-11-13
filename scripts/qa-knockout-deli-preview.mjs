import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const root=path.resolve(process.argv[2] || '.output/public/demos/knockout-deli');
const required=['index.html','menu.html','landing.css','landing.js','menu-only.css','styles.css','visual-polish.css','digital-menu.css','app.js','window-order.js','window-order.css',
 ...['01-hero-pastrami','02-menu-spread','03-pastrami-prep','04-customer-experience','05-breakfast-sandwich','06-cheesesteak-grill','07-order-online','08-real-truck-location','logo-knockout-deli-transparent','knockout-truck-event','knockout-community','knockout-live-music'].map(x=>'assets/'+x+'.webp')];
const fail = msg => { console.error('Knockout Deli QA: '+msg); process.exitCode=1 };
for(const rel of required){const f=path.join(root,rel);if(!fs.existsSync(f)||fs.statSync(f).size===0)fail('Missing or empty '+rel)}
if(process.exitCode)process.exit();
const home=fs.readFileSync(path.join(root,'index.html'),'utf8');
const menu=fs.readFileSync(path.join(root,'menu.html'),'utf8');
const core=fs.readFileSync(path.join(root,'app.js'),'utf8');
const qr=fs.readFileSync(path.join(root,'window-order.js'),'utf8');
const style=fs.readFileSync(path.join(root,'landing.css'),'utf8');
const script=fs.readFileSync(path.join(root,'landing.js'),'utf8');
const only=fs.readFileSync(path.join(root,'menu-only.css'),'utf8');
for(const [label,html] of [['home',home],['menu',menu]]){
  if(!html.includes('name="robots" content="noindex'))fail(label+' may be accidentally indexed');
  if(/supabase|command-center|href=["'][^"']*\/admin/i.test(html))fail(label+' should not expose Admin Panel');
  if(!html.includes('NOT AN OFFICIAL BUSINESS WEBSITE'))fail(label+' missing concept disclosure');
}
if(home.includes('id="menu-grid"')||home.includes('id="window-cart-dialog"'))fail('Landing must not put order items above business story');
for(const id of ['about','food','events','find'])if(!home.includes('id="'+id+'"'))fail('Missing business/story section '+id);
if(!home.includes('href="./menu.html"')||!home.includes('VIEW MENU & ORDER'))fail('Independent digital menu CTA missing');
if(!home.includes('class="intro-photo-caption"') || !home.includes('EVENT PHOTO · UPDATED FOR EACH EVENT'))
  fail('Event truck photograph must explain that its image changes for every event');
if(!home.includes('FOTO DEL EVENTO · SE CAMBIA PARA CADA EVENTO'))
  fail('Event photo update message must be available in Spanish');
if(!fs.readFileSync(path.join(root,'landing.css'),'utf8').includes('KNOCKOUT EVENT PHOTO ROTATION CAPTION'))
  fail('Event photo label must have visible responsive editorial styling');

for(const name of ['knockout-community.webp','04-customer-experience.webp'])if(!home.includes(name))fail('Missing unique events photograph '+name);
const heroMarkup=(home.split('<div class="hero-photo">')[1]||'').split('</div>')[0];
const eventsMarkup=(home.split('<div class="events-photos">')[1]||'').split('</div>')[0];
if(!heroMarkup.includes('src="./assets/knockout-live-music.webp"'))fail('Original website must use the tank-free evening-truck photo in hero');
if(!home.includes('rel="preload" href="./assets/knockout-live-music.webp"'))fail('Hero preload must follow the new photo');
if(home.includes('knockout-truck-event.webp'))fail('Tank photo must no longer appear in original homepage markup');
if(eventsMarkup.includes('knockout-live-music.webp')||!eventsMarkup.includes('04-customer-experience.webp'))fail('Do not repeat hero photo in events section');
if(!home.includes('window=1#window-order')||!home.includes('location.replace'))fail('Legacy deep-link to digital menu missing');
if(!home.includes('https://www.doordash.com/store/42538456'))fail('Existing external DoorDash link missing');
if(!home.includes('https://linktr.ee/knockoutdeli'))fail('Official contact/location link missing');
// Demo catering remains an accessible, local-only inquiry preview.
const eventsSection = (home.split('<section class="events-section"')[1] || '').split('</section>')[0] || '';
const cateringDialog = (home.split('<dialog id="catering-dialog"')[1] || '').split('</dialog>')[0] || '';
if(!eventsSection.includes('id="open-catering-form"') || eventsSection.includes('href="https://linktr.ee/knockoutdeli"'))fail('Catering CTA must open the demo form');
if(!cateringDialog.includes('id="knockout-catering-demo"') || !cateringDialog.includes('onsubmit="return false"'))fail('No-send catering form missing');
for(const id of ['catering-name','catering-email','catering-phone','catering-type','catering-date','catering-guests','catering-location','catering-message','catering-preview-status'])if(!cateringDialog.includes('id="'+id+'"'))fail('Catering form field missing '+id);
if(!cateringDialog.includes('not saved or sent') || !cateringDialog.includes('no se guarda ni se envía'))fail('Catering must disclose no data storage / no delivery in EN and ES');
if(!script.includes('cateringDialog?.showModal()') || !script.includes('cateringForm.reportValidity()') || !script.includes('cateringForm.reset()'))fail('Catering form interaction or safe preview missing');
if(!style.includes('.catering-dialog::backdrop') || !style.includes('@media(max-width:640px)'))fail('Catering modal responsive styles missing');

if(!home.includes('id="knockout-signup-demo"')||!home.includes('id="subscriber-language"')||!home.includes('id="subscriber-consent"'))fail('Subscription demo fields / language / consent missing');
const findCard = home.match(/<div class="find-card">([\s\S]*?)<\/div>\s*<\/section>/)?.[1] || '';
if(!findCard || findCard.includes('linktr.ee') || !findCard.includes('type="submit"'))fail('Find card must use a demo form, not Linktree');
if(!findCard.includes('No information is saved')||!findCard.toLowerCase().includes('no se guarda información'))fail('Bilingual disclosure of nonfunctional demo missing');
if(!script.includes("event.preventDefault()")||!script.includes("subscriberForm.reportValidity()")||!script.includes("subscriberForm.reset()"))fail('Safe simulated subscribe handling missing');
if(/fetch\s*\(|XMLHttpRequest|localStorage|sessionStorage|sendBeacon/i.test(script))fail('Subscription demo must have no network requests or persistence');
if(!style.includes('.signup-fields')||!style.includes('@media(max-width:480px)'))fail('Subscription demo responsive styles missing');

if(!style.includes('object-fit:cover')||!style.includes('@media(max-width:760px)')||!style.includes('prefers-reduced-motion:reduce'))fail('Responsive hero styling not verified');
if(!script.includes('aria-expanded')||!script.includes("'Escape'"))fail('Accessible mobile navigation missing');
for(const id of ['window-order','menu','events','find-us','catering','order','follow','window-cart-dialog','window-sticky','menu-grid']) if(!menu.includes('id="'+id+'"'))fail('Original digital menu capability missing '+id);
if(!menu.includes('href="./menu-only.css"')||!only.includes('.hero-section'))fail('Digital menu must not show legacy landing above products');
if(!menu.includes('BACK TO WEBSITE'))fail('Digital menu needs return path');
// Checkout stages must remain readable on phones and tablets. The styles are
// applied only to menu.html, after the unpacked legacy demo CSS.
for(const marker of ['checkout-steps','pickup-preview-form','ahead-pickup-fields','checkout-form-actions']){
  if(!menu.includes('class="' + marker) && !menu.includes(' ' + marker + '"'))fail('Pickup checkout markup missing '+marker);
  if(!only.includes('#window-cart-dialog .' + marker))fail('Pickup checkout style missing '+marker);
}
if(menu.includes('class="checkout-pickup-cards"')||menu.includes('class="pickup-option-switch"'))fail('Pickup should have no redundant method choice');
if(!menu.includes('type="hidden" name="method" value="ahead"'))fail('Single pickup method missing');
if(!only.includes('#window-cart-dialog [hidden]') || !only.includes('@media (max-width: 700px)')){
  fail('Checkout responsive or hidden-state guard missing');
}

if(!menu.includes('data-window-i18n')||!/\bes\s*:\s*\{[\s\S]{0,500}navWindow\s*:/.test(qr))fail('Existing menu language switch missing');
if(!qr.includes('previewAlert')||!qr.includes('activationHelp')||!qr.includes('preview-submit-disabled'))fail('Demo must not imply submitted order');
if(!menu.includes('id="menu-search"')||!menu.includes('order-routing-note')||!menu.includes('pickup-demo-phone')||!menu.includes('direct-pay-truck'))fail('Current digital menu search / pickup-choice flows missing');
if(!menu.includes('digital-menu.css')||!menu.includes('window-order.css'))fail('Existing digital menu styles missing');

// Ensure no visible QR instructions reappear when English/Spanish is switched.
const forbiddenMenuCopy = /(?:PICKUP AT THE TRUCK\s*\/\s*QR MENU|AT THE SERVICE WINDOW\s*\/\s*QR MENU|MENÚ QR|SCAN THE QR|ESCANEA EL QR|QR CODE|CÓDIGO QR)/i;
if(forbiddenMenuCopy.test(menu+'\n'+qr))fail('QR copy remains in the menu or its translations');
if(!/DIGITAL MENU/i.test(menu)||!/OPEN THE MENU|OPEN\./i.test(menu+'\n'+qr))fail('Digital menu copy was not updated');
if(!menu.includes('https://linktr.ee/knockoutdeli'))fail('Business contact link missing');
if(/js\.stripe\.com|api\.stripe\.com/i.test(home+menu+qr+core))fail('Stripe must not be claimed as live in demo');
if(!core.includes('events: []')||/\bfetch\s*\(|XMLHttpRequest|localStorage\s*\.|sessionStorage\s*\.|WebSocket/.test(core+'\n'+qr))fail('No network writes/persistence permitted in concept');
for(const f of ['app.js','window-order.js','landing.js']){const c=spawnSync(process.execPath,['--check',path.join(root,f)],{encoding:'utf8'});if(c.status!==0)fail(f+' invalid: '+c.stderr)}
for(const rel of required.filter(x=>x.endsWith('.webp')))if(fs.statSync(path.join(root,rel)).size>400000)fail('Unoptimized image '+rel);
if(!process.exitCode)console.log('Knockout Deli: business-led homepage and separate digital menu passed static QA ('+required.length+' files)');

const originalLandingStyle=fs.readFileSync(path.join(root,'landing.css'),'utf8');
if(!originalLandingStyle.includes('KNOCKOUT ROUNDED HERO OVERLAP')||!originalLandingStyle.includes('border-radius:26px 26px 0 0!important;'))fail('Homepage mobile hero must overlap photo with rounded corners');
