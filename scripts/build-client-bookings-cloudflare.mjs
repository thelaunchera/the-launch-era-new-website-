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
// Do not silently turn missing tenant-specific routes into the marketing website.
for(const route of ['booking/return','cb-depot/privacy','cb-depot/terms']){
 mkdirSync(out+'/'+route,{recursive:true});
 writeFileSync(out+'/'+route+'/index.html','<!doctype html><html lang="en"><meta charset="utf-8"><meta name="robots" content="noindex,nofollow"><title>Not available yet</title><body><main><h1>This feature is not available yet</h1><p>Please contact the business directly. No booking or cancellation has been processed.</p></main></body></html>');
}
writeFileSync(out+'/index.html','<!doctype html><html lang="en"><meta charset="utf-8"><meta name="robots" content="noindex,nofollow"><title>Booking pages are being prepared</title><body><h1>Booking pages are being prepared</h1><p>Please use the verified booking link provided by your service provider.</p></body></html>');
writeFileSync(out+'/_headers','/*\n  X-Robots-Tag: noindex, nofollow\n  X-Content-Type-Options: nosniff\n');
console.log('Staging artifact generated at '+out+'; NOT customer-ready. Tenant key, callback routing, legal links and QA require verification.');
