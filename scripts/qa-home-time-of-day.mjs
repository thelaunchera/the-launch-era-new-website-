/* The old cleaning day/night 3D story was retired from The Launch Era
   homepage. Preserve its source for historical pages, and validate the
   new static editorial Jaramillo hero in both languages. */
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const read=p=>readFileSync(p,'utf8');
for(const [lang,route] of [['en','src/routes/index.tsx'],['es','src/routes/es.index.tsx']]){
 const s=read(route);
 assert(s.includes('<OfficialHome lang="'+lang+'" />'),lang+' universal home missing');
 assert(s.includes('hero-jaramillo.jpg'),lang+' Jaramillo hero missing');
 assert(!s.includes('HomeMotionInterlude'),lang+' retired cleaning-only 3D story should not be mounted');
}
for(const path of ['public/website-for-your-business/index.html','public/es/website-for-your-business/index.html']){
 const s=read(path);
 assert(s.includes('class="hero-copy"')&&s.includes('hero-jaramillo.jpg'),'Original human-led hero required');
 assert(s.includes('class="process-grid"'),'Simple four-step production journey required');
}
assert(existsSync('public/assets/tle-home-time-of-day.js'),'Keep historical animation assets for old clients');
console.log('[TLE TIME-OF-DAY QA] Retired cleaning motion safely archived and both new photo-led homepages checked');
