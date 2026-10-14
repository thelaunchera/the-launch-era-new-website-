// Isolated Cloudflare Pages staging artifact. Never copies the entire public/ directory.
import {cpSync,copyFileSync,existsSync,mkdirSync,rmSync,writeFileSync} from 'node:fs';
const out='dist-client-bookings';
rmSync(out,{recursive:true,force:true});mkdirSync(out+'/assets',{recursive:true});mkdirSync(out+'/assets/clients/cb-depot',{recursive:true});
for(const f of ['booking-base.css','booking-base.js','booking-smart-welcome.css','booking-smart-welcome.js','booking-template-live.js','booking-template-language.js','cb-depot-experience.js','cb-depot-premium.css'])copyFileSync('public/assets/'+f,out+'/assets/'+f);
cpSync('public/assets/clients/cb-depot',out+'/assets/clients/cb-depot',{recursive:true});
copyFileSync('public/base-booking.html',out+'/base-booking.html');
// The booking template references this image outside the client-specific folder.
const sharedImage='public/assets/images/1200x1200/housekeeper-making-a-bed.jpg';
if(existsSync(sharedImage)){
 mkdirSync(out+'/assets/images/1200x1200',{recursive:true});
 copyFileSync(sharedImage,out+'/assets/images/1200x1200/housekeeper-making-a-bed.jpg');
}
// Publish the existing booking management and legal pages, not placeholder copies.
for(const route of ['booking/return','cb-depot/privacy','cb-depot/terms']){
 mkdirSync(out+'/'+route,{recursive:true});
 copyFileSync('public/'+route+'/index.html',out+'/'+route+'/index.html');
}
// Stable client-facing link. The booking public key is a public routing identifier,
// never a login token. Keep private preview and owner credentials out of this file.
mkdirSync(out+'/cb-depot',{recursive:true});
const cbDepotBookingKey='05a5f9ae-9b1b-4b1c-9e06-392940e028b1';
writeFileSync(out+'/cb-depot/index.html',`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><meta name="referrer" content="no-referrer"><title>CB Depot · Book Detailing</title><script>const p=new URLSearchParams(location.search);const u=new URL('/booking/',location.origin);u.searchParams.set('key','${cbDepotBookingKey}');if(p.get('lang')==='es')u.searchParams.set('lang','es');location.replace(u.pathname+u.search+location.hash);<\/script></head><body><p>Opening CB Depot booking page… <a href="/booking/?key=${cbDepotBookingKey}">Continue to CB Depot</a></p></body></html>`);
// Preserve /booking/ links used by CB Depot's policy pages.
mkdirSync(out+'/booking',{recursive:true});
copyFileSync('public/base-booking.html',out+'/booking/index.html');
writeFileSync(out+'/index.html','<!doctype html><html lang="en"><meta charset="utf-8"><meta name="robots" content="noindex,nofollow"><title>Booking pages are being prepared</title><body><h1>Booking pages are being prepared</h1><p>Please use the verified booking link provided by your service provider.</p></body></html>');
writeFileSync(out+'/_headers','/*\n  X-Robots-Tag: noindex, nofollow\n  X-Content-Type-Options: nosniff\n');
console.log('Staging artifact generated at '+out+'; NOT customer-ready. Tenant key, callback routing, legal links and QA require verification.');
