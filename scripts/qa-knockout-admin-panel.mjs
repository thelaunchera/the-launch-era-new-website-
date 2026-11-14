import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';

const root=path.resolve(process.argv[2]||'.output/public/demos/knockout-deli');
const admin=path.join(root,'admin-panel');
const html=fs.readFileSync(path.join(admin,'index.html'),'utf8');
const appPath=path.join(admin,'app.js');
const js=fs.readFileSync(appPath,'utf8');
const catalog=JSON.parse(fs.readFileSync(path.join(admin,'menu-catalog.json'),'utf8'));
const original=JSON.parse(fs.readFileSync('demo-source/knockout-deli/landing/menu-catalog.json','utf8'));
assert.deepEqual(catalog,original,'Admin Panel catalog must be copied directly from canonical Knockout source');
assert.ok(catalog.length>=30,'Full photographed menu must be available to the Admin Panel');
assert.equal(new Set(catalog.map(x=>x.id)).size,catalog.length,'Unique product IDs');
assert.equal(new Set(catalog.filter(x=>x.image).map(x=>x.image)).size,catalog.filter(x=>x.image).length,'No duplicated featured photos');
const required={
 jab:18,'upper-cut':18,'head-butt':18,combination:20,knockout:20,body:20,tko:20,
 'egg-mcdeli':10,'ali-shuffle':11,champ:11,eggs:7,ribeye:15,'chopped-cheese':15,
 underdog:11,'heavy-weight':15,pound:18,'square-knish':7,'round-knish':7,
 'meat-knish':10,holyfield:8,'loaded-fries':10,
 'brisket-half':14,'pastrami-half':14,'corned-beef-half':14,
 'coleslaw-pint':7,'cucumber-pint':7,'pickle-quart':10,'rye-bread':10,'can-soda':3,water:3
};
for(const [id,expected] of Object.entries(required))assert.equal(catalog.find(x=>x.id===id)?.price,expected,id+' must match original menu photo');
assert.ok(catalog.every(x=>x.nameEs&&x.categoryEs&&x.descriptionEs),'Localized menu fields');
assert.ok(html.includes('logo-knockout-deli-transparent.webp')&&html.includes('name="robots" content="noindex'),'Brand logo and private-preview SEO');
assert.ok(html.includes('INTERACTIVE DEMO')&&html.includes('No live business actions')||html.includes('No live business actions'),'Demo disclosure');
for(const marker of ['data-view="menu"','data-view="events"','data-view="locations"','data-view="alerts"','data-view="preview"','id="modal-content"','id="mobile-nav"'])
 assert.ok(html.includes(marker),'Admin Panel UI missing '+marker);
for(const marker of ['product-form','event-form','location-form','offer-form','alert-form','social-form','uploadImage(input)','localStorage','not sent'])
 assert.ok(js.toLowerCase().includes(marker.toLowerCase()),'Admin Panel interaction missing '+marker);
assert.ok(!/supabase\.co|\/functions\/v1|resend\.com|api\.stripe\.com|sendBeacon|XMLHttpRequest/i.test(js),'Demo may not send data to real customers or payment services');
const parsed=spawnSync(process.execPath,['--check',appPath],{encoding:'utf8'});
assert.equal(parsed.status,0,'Invalid Admin Panel JavaScript: '+parsed.stderr);
assert.ok(fs.statSync(path.join(root,'assets','logo-knockout-deli-transparent.webp')).size>1000,'Official logo required in built site');
const manifest=JSON.parse(fs.readFileSync(path.join(admin,'manifest.webmanifest'),'utf8'));
const serviceWorker=fs.readFileSync(path.join(admin,'sw.js'),'utf8');
assert.equal(manifest.display,'standalone','Admin Panel must offer installable app experience');
assert.equal(manifest.scope,'./','Installable app must stay scoped to Knockout admin only');
assert.ok(manifest.icons?.length>0&&fs.statSync(path.join(admin,'icon.svg')).size>100,'App icon missing');
assert.ok(html.includes('rel="manifest"')&&html.includes('id="menu-toggle"')&&html.includes('id="sidebar-backdrop"'),'Responsive app sidebar and install metadata missing');
for(const marker of ['data-view="dashboard"','data-view="requests"','data-view="notifications"','data-view="settings"','data-view="install"','id="notification-count"'])
 assert.ok(html.includes(marker),'Order-first sidebar missing '+marker);
for(const marker of ['function greetingText()','LET’S GET THE DAY STARTED.','function simulateIncomingOrder()','function saveOwnerSettings(','owner-settings-form','recordOwnerNotice("SMS"','recordOwnerNotice("EMAIL"','beforeinstallprompt','serviceWorker.register'])
 assert.ok(js.includes(marker),'Owner app functionality missing '+marker);
assert.ok(serviceWorker.includes('knockout-admin-preview-')&&!/showNotification|PushManager|pushSubscription/.test(serviceWorker),'App shell must not send push notifications');

console.log('Knockout Admin Panel QA passed: '+catalog.length+' official products, own logo, isolated browser-only controls, correct prices and no live network writes.');
