import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const root=path.resolve(process.argv[2] || '.output/public/demos/knockout-deli');
const needed=['index.html','styles.css','visual-polish.css','digital-menu.css','app.js','window-order.js','window-order.css',
 ...['01-hero-pastrami','02-menu-spread','03-pastrami-prep','04-customer-experience','05-breakfast-sandwich','06-cheesesteak-grill','07-order-online','08-real-truck-location','logo-knockout-deli-transparent'].map(x=>'assets/'+x+'.webp')];
const fail=m=>{console.error('Knockout QA: '+m);process.exitCode=1};
for(const rel of needed){const f=path.join(root,rel);if(!fs.existsSync(f)||fs.statSync(f).size===0)fail('Missing '+rel)}
if(process.exitCode)process.exit();
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const core=fs.readFileSync(path.join(root,'app.js'),'utf8');
const qr=fs.readFileSync(path.join(root,'window-order.js'),'utf8');
const css=fs.readFileSync(path.join(root,'window-order.css'),'utf8');
if(/<script[^>]+supabase|href=["'][^"']*admin|command-center|id=["']admin-/i.test(html))fail('Admin access must not be in public demo');
if(!core.includes('events: []'))fail('Events must not include invented dates');
if(/\bfetch\s*\(|XMLHttpRequest|localStorage\s*\.|sessionStorage\s*\.|WebSocket/.test(core+'\n'+qr))fail('Unapproved network write or persistence');
for(const id of ['window-order','menu','events','find-us','catering','order','follow','window-cart-dialog','window-sticky'])if(!html.includes('id="'+id+'"'))fail('Missing section '+id);
if(!html.includes('data-window-i18n')||!/\bes\s*:\s*\{[\s\S]{0,500}navWindow\s*:/.test(qr))fail('QR window ordering must support Spanish');
if(!html.includes('meta name="robots" content="noindex'))fail('Unlisted concept should not be indexed');
if(!html.includes('NOT AN OFFICIAL BUSINESS WEBSITE') || !qr.includes('previewAlert') || !qr.includes('activationHelp'))fail('Missing demo/order disclosure');
if(!html.includes('https://www.doordash.com/store/42538456'))fail('DoorDash option missing');
if(!html.includes('window-order.js') || !html.includes('window-order.css') || !html.includes('digital-menu.css'))fail('Menu or QR scripts not loaded');
if(!html.includes('id="menu-search"') || !html.includes('order-routing-note') || !html.includes('pickup-demo-phone') || !html.includes('direct-pay-truck'))fail('Pickup form or two ordering paths missing');
if(!qr.includes('preview-submit-disabled') || !qr.includes('submitInactive') || !qr.includes('activationHelp'))fail('Demo send-to-truck action must be disabled and clearly labeled');
if(!html.includes('https://linktr.ee/knockoutdeli'))fail('Existing physical QR destination must remain Linktree');
if(/js\.stripe\.com|api\.stripe\.com/i.test(html+qr+core))fail('Stripe must not be integrated in this proposal');
if(!qr.includes("new URLSearchParams(location.search).get('window')==='1'"))fail('QR entry URL missing');
if(!core.includes('data-add-item') || !qr.includes('data-qty-plus') || !qr.includes('data-qty-minus'))fail('Window basket interactions missing');
if(!css.includes('prefers-reduced-motion:reduce'))fail('Reduced-motion support missing');
for(const f of ['app.js','window-order.js']){const c=spawnSync(process.execPath,['--check',path.join(root,f)],{encoding:'utf8'});if(c.status!==0)fail(f+' syntax: '+c.stderr)}
for(const x of needed.filter(x=>x.endsWith('.webp'))){if(fs.statSync(path.join(root,x)).size>400000)fail('Unoptimized photo '+x)}
// Mobile editorial hero must present clean photography, not internal labels or oversized type over the food.
const polish=fs.readFileSync(path.join(root,'visual-polish.css'),'utf8');
for(const obsolete of ['class="photo-caption"','class="hero-photo-headline"','class="ticker"','class="concept-banner"','class="hero-stamp"']) {
 if(html.includes(obsolete))fail('Obsolete hero overlay: '+obsolete);
}
if(html.indexOf('id="menu"')>html.indexOf('id="window-order"'))fail('The real menu must follow the hero before the QR tutorial');
if(!html.includes('href="./visual-polish.css"'))fail('New editorial style not referenced');
if(!html.includes('class="button button-red hero-menu-cta"'))fail('Primary menu CTA must be available in hero');
if(!polish.includes('.hero-visual')||!polish.includes('object-fit:cover'))fail('Hero photo treatment missing');
if(!polish.includes('prefers-reduced-motion:reduce'))fail('Hero interactions lack reduced-motion support');
if(!process.exitCode)console.log('Knockout Deli QR-window demo QA passed ('+needed.length+' files)');
