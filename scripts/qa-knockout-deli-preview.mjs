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
for(const name of ['knockout-truck-event.webp','knockout-community.webp','knockout-live-music.webp'])if(!home.includes(name))fail('Missing event photograph '+name);
if(!home.includes('window=1#window-order')||!home.includes('location.replace'))fail('Existing QR entry must redirect into digital menu');
if(!home.includes('https://www.doordash.com/store/42538456'))fail('Existing external DoorDash link missing');
if(!home.includes('https://linktr.ee/knockoutdeli'))fail('Official contact/location link missing');
if(!style.includes('object-fit:cover')||!style.includes('@media(max-width:760px)')||!style.includes('prefers-reduced-motion:reduce'))fail('Responsive hero styling not verified');
if(!script.includes('aria-expanded')||!script.includes("'Escape'"))fail('Accessible mobile navigation missing');
for(const id of ['window-order','menu','events','find-us','catering','order','follow','window-cart-dialog','window-sticky','menu-grid']) if(!menu.includes('id="'+id+'"'))fail('Original digital menu capability missing '+id);
if(!menu.includes('href="./menu-only.css"')||!only.includes('.hero-section'))fail('Digital menu must not show legacy landing above products');
if(!menu.includes('BACK TO WEBSITE'))fail('Digital menu needs return path');
if(!menu.includes('data-window-i18n')||!/\bes\s*:\s*\{[\s\S]{0,500}navWindow\s*:/.test(qr))fail('Existing menu language switch missing');
if(!qr.includes('previewAlert')||!qr.includes('activationHelp')||!qr.includes('preview-submit-disabled'))fail('Demo must not imply submitted order');
if(!menu.includes('id="menu-search"')||!menu.includes('order-routing-note')||!menu.includes('pickup-demo-phone')||!menu.includes('direct-pay-truck'))fail('Current digital menu search / pickup-choice flows missing');
if(!menu.includes('digital-menu.css')||!menu.includes('window-order.css'))fail('Existing digital menu styles missing');
if(!menu.includes('https://linktr.ee/knockoutdeli'))fail('Existing physical QR Linktree route missing');
if(/js\.stripe\.com|api\.stripe\.com/i.test(home+menu+qr+core))fail('Stripe must not be claimed as live in demo');
if(!core.includes('events: []')||/\bfetch\s*\(|XMLHttpRequest|localStorage\s*\.|sessionStorage\s*\.|WebSocket/.test(core+'\n'+qr))fail('No network writes/persistence permitted in concept');
for(const f of ['app.js','window-order.js','landing.js']){const c=spawnSync(process.execPath,['--check',path.join(root,f)],{encoding:'utf8'});if(c.status!==0)fail(f+' invalid: '+c.stderr)}
for(const rel of required.filter(x=>x.endsWith('.webp')))if(fs.statSync(path.join(root,rel)).size>400000)fail('Unoptimized image '+rel);
if(!process.exitCode)console.log('Knockout Deli: business-led homepage and separate digital menu passed static QA ('+required.length+' files)');
