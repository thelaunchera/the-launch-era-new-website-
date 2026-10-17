/** Guard public TLE service pages against obsolete weekend purchase cutoffs.
 * No network calls, customer records, checkout changes or bookings.
 * Actual buyer-set calendar weekdays remain available and are intentionally excluded. */
import {strict as assert} from 'node:assert';
import {existsSync,readFileSync,readdirSync} from 'node:fs';
import {join,relative,sep} from 'node:path';
const root=process.cwd();
const read=path=>readFileSync(join(root,path),'utf8');
function files(path){
 if(!existsSync(join(root,path)))return [];
 return readdirSync(join(root,path),{withFileTypes:true}).flatMap(entry=>{
  const nested=join(path,entry.name);
  return entry.isDirectory()?files(nested):entry.isFile()?[nested.split(sep).join('/')]:[];
 });
}
const marketing=[
 ...files('src/routes').filter(path=>/\.(tsx?|jsx?)$/.test(path)),
 ...files('src/components').filter(path=>/\.(tsx?|jsx?)$/.test(path)),
 ...files('public').filter(path=>/\.html$/.test(path)&&
   !/^public\/(?:command-center|cb-depot|demos)\//.test(path)),
 'public/command-center/buyer-account-preview.html'
];
const cutoff=/(?:saturday|sundays?\s+after|s[áa]bados?|next business day|next working period|starting in our next working period|during our available working periods|during business hours|horario laborable|horario laboral|próximo día hábil|siguiente día hábil)/i;
for(const path of marketing){
 const source=read(path);
 assert(!cutoff.test(source),'Outdated weekend/production restriction in marketing: '+path);
}
const pairs=[
 ['src/routes/virtual-assistant.tsx','src/routes/es.virtual-assistant.tsx',
  '/service-checkout/?offer=va&lang=en','/service-checkout/?offer=va&lang=es'],
 ['src/routes/website-automation.tsx','src/routes/es.website-automation.tsx',
  '/service-checkout/?offer=website-automation&lang=en','/service-checkout/?offer=website-automation&lang=es'],
 ['public/whatsapp-ai-agent/index.html','public/es/whatsapp-ai-agent/index.html',null,null]
];
for(const [en,es,enLink,esLink] of pairs){
 const enText=read(en),esText=read(es);
 assert(/48.hour|48 hours/i.test(enText),en+' must keep the 48-hour estimate');
 assert(/48 horas/i.test(esText),es+' must keep the 48-hour estimate');
 if(enLink)assert(enText.includes(enLink),en+' checkout link changed');
 if(esLink)assert(esText.includes(esLink),es+' checkout link changed');
}
assert(read('src/components/editorial-sections.tsx').includes('Estimated 48-hour production begins after intake review and kickoff confirmation.'),'Original production estimate missing');
assert(read('src/components/home-sales.tsx').includes('The estimated 48-hour production period starts then.'),'Booking FAQ estimate missing');
const preview=read('public/command-center/buyer-account-preview.html');
assert(preview.includes('Availability · Editable anytime'),'Availability mockup must not imply fixed operating days');
const operational=read('public/command-center/assets/command-center-app.js');
assert(operational.includes("['Sunday','Domingo']") && operational.includes("['Saturday','Sábado']"),'Customer-specific weekly availability editor must stay functional');
console.log('[TLE NO-WEEKEND-CUTOFF QA PASSED] '+marketing.length+' EN/ES public marketing files; 48-hour estimates, service checkouts and editable availability preserved.');
