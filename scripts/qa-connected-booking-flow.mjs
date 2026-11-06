/* Preserve historical cleaning flows for previous purchases while ensuring
   the official homepage has only the new website and automation packages. */
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const read=p=>readFileSync(p,'utf8');
const sourceEN=read('src/routes/index.tsx'),sourceES=read('src/routes/es.index.tsx');
const pages=[['en','public/website-for-your-business/index.html'],['es','public/es/website-for-your-business/index.html']];
assert(sourceEN.includes('<OfficialHome lang="en" />'));
assert(sourceES.includes('<OfficialHome lang="es" />'));
for(const [lang,path] of pages){
 const html=read(path);
 assert(html.includes('service-checkout/?offer=website-basic&lang='+lang));
 assert(html.includes('service-checkout/?offer=website-ai-crm&lang='+lang));
 assert(html.includes('hero-jaramillo.jpg'));
 assert.equal((html.match(/class="plan"/g)||[]).length,2,'Only two public packages');
 assert(!html.includes('Booking Automation + Command Center'));
}
assert(existsSync('public/booking-bundle/index.html'),'Historical customer page must not be deleted');
const archived=read('public/booking-bundle/index.html');
assert(/name="robots" content="noindex/.test(archived),'Retired sales route cannot remain discoverable');
console.log('[TLE UNIVERSAL WEBSITE] Two public packages, legacy booking route archived, protected buyer access retained');
