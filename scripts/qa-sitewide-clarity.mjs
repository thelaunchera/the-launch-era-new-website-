/* New official public offer and historical client-only route clarity. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(p,'utf8');
const en=read('public/website-for-your-business/index.html'),es=read('public/es/website-for-your-business/index.html');
const homeEn=read('src/routes/index.tsx'),homeEs=read('src/routes/es.index.tsx');
const checkout=read('public/service-checkout/index.html');
const termsEN=read('public/terms.html'),termsES=read('public/es/terms.html');
for(const [name,body,lang] of [['EN',en,'en'],['ES',es,'es']]){
 assert(body.includes('/service-checkout/?offer=website-basic&lang='+lang),name+' website checkout missing');
 assert(body.includes('/service-checkout/?offer=website-ai-crm&lang='+lang),name+' IA+CRM checkout missing');
 for(const amount of ['$15','$25','$8','$33'])assert(body.includes(amount),name+' price missing '+amount);
 assert(!/lead catcher|captador de leads|@@TODO|INSERT_COPY_HERE/.test(body),name+' public copy unpolished');
 assert(body.includes('hero-jaramillo.jpg'),name+' original hero missing');
 assert(body.includes('optional-app.svg'),name+' discreet optional app missing');
}
assert(homeEn.includes('<OfficialHome lang="en" />'));
assert(homeEs.includes('<OfficialHome lang="es" />'));
assert(checkout.includes("'website-ai-crm':{cents:3300"),'Recurring AI first checkout must be $33');
assert(termsEN.includes('$8')&&termsES.includes('$8'),'Monthly care terms must be disclosed in both languages');
assert(!/Cleaning Web App|Virtual Assistant support/.test(termsEN),'Old offerings leaked into current public legal terms');
console.log('[TLE SITEWIDE CLARITY] Current two packages, accurate monthly care, bilingual SEO and customer-facing terms');
