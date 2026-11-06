/* Retired cleaning promotional pop-up: preserve its assets for historical
   access, but do not display it on the new universal homepage. */
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
const read=p=>readFileSync(p,'utf8');
const en=read('src/routes/index.tsx'),es=read('src/routes/es.index.tsx');
const hero=read('src/components/official-home.tsx');
const file='public/assets/promo/tle-smart-welcome-bundle-flyer.jpg';
assert(existsSync(file),'Preserve legacy marketing artifact for existing records');
const data=readFileSync(file);
assert.equal(createHash('sha256').update(data).digest('hex'),'4b81811c533c735b755bfcb960c71d470f060265289b5bce19ad186873a97ce3');
assert(!en.includes('<SmartWelcomeBundle')&&!es.includes('<SmartWelcomeBundle'),'Retired cleaning promotion must not be in homepage');
assert(en.includes('<OfficialHome lang="en" />')&&es.includes('<OfficialHome lang="es" />'),'Both locales must use the same official landing experience');
assert(hero.includes('Website for')&&hero.includes('Website para'),'Bilingual website must sell services for any business');
assert(hero.includes('service-checkout/?offer=website-basic'),'New package must lead to Stripe first');
console.log('[TLE HOME QA] Historical flyer preserved, no retired popup, current bilingual website packages visible');
