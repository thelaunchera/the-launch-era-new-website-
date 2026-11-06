/* 2026 official Jaramillo hero release gate.
   The previous cleaning-business scroll cinema is archived and intentionally not on / or /es. */
import assert from 'node:assert/strict';
import {readFileSync,existsSync,statSync} from 'node:fs';
const read=p=>readFileSync(p,'utf8');
const routes=[['src/routes/index.tsx','en'],['src/routes/es.index.tsx','es']];
const pages=[['public/website-for-your-business/index.html','en'],['public/es/website-for-your-business/index.html','es']];
const image='public/assets/website-packages-20261105/hero-jaramillo.jpg';
assert(existsSync(image),'User-approved original Jaramillo hero photo must exist');
const file=readFileSync(image);
assert(file[0]===0xff&&file[1]===0xd8&&file[2]===0xff,'Hero must be a genuine JPEG file');
assert(statSync(image).size>150000,'Do not reduce the hero to a tiny blurry thumbnail');
for(const [path,lang] of routes){
 const s=read(path);
 assert(s.includes('<OfficialHome lang="'+lang+'" />'),lang+' should render new official website');
 assert(s.includes('hero-jaramillo.jpg'),lang+' must preload Jaramillo photo');
 assert(!s.includes('HOME_HERO_PHOTO'),'Retired cleaning hero should not be used');
}
for(const [path,lang] of pages){
 const html=read(path);
 assert(html.includes('src="/assets/website-packages-20261105/hero-jaramillo.jpg"'),lang+' first fold uses exact photo');
 assert(html.includes('fetchpriority="high"'),'Original hero must load early');
 assert(html.includes('class="hero-copy"'),'Hero copy must be on the actual photograph');
 assert(html.includes('href="#paquetes"'),'Hero CTA must reach pricing');
 assert(html.includes('id="website-basic"')&&html.includes('id="website-ai-crm"'),'Two packages must be visible');
 assert(!html.includes('src="/assets/hero-cleaner-lights-20261017.jpg"'),'Old cleaning hero cannot return');
}
const css=read('public/assets/tle-website-official.css');
assert(css.includes('.hero>img'),'Hero composition should be photo-led');
assert(css.includes('max-width:780px'),'Mobile typography and composition styles must exist');
assert(css.includes('prefers-reduced-motion'),'Reduced-motion behavior required');
console.log('[TLE HERO RELEASE] Original seated Jaramillo JPEG, premium first fold and two bilingual packages verified');
