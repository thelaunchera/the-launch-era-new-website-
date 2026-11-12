/* Apply one brand-aware 84px switch to bilingual demo/landing assets during Pages build.
 * The source and translations of every demo remain independent and untouched.
 * Newly published demos with existing EN/ES controls inherit the styling automatically.
 */
import {readdirSync,readFileSync,writeFileSync,existsSync,statSync} from 'node:fs';
import {join,relative,dirname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=process.argv.includes('--root')?
 process.argv[process.argv.indexOf('--root')+1]:'.output/public';
const css='/assets/tle-ios-language-switch-20261111.css';
const js='/assets/tle-ios-language-switch-20261111.js';
const expected=['assets/tle-ios-language-switch-20261111.css','assets/tle-ios-language-switch-20261111.js'];
const publicDir=fileURLToPath(new URL('../public/',import.meta.url));
for(const asset of expected){if(!existsSync(join(root,asset))&&!existsSync(join(publicDir,asset)))throw Error('Missing switch asset: '+asset)}
const entries=[];
function walk(directory){
 for(const e of readdirSync(directory,{withFileTypes:true})){
  const p=join(directory,e.name);
  if(e.isDirectory())walk(p);
  else if(e.isFile()&&e.name.endsWith('.html'))entries.push(p);
 }
}
if(!existsSync(root))throw Error('Build output not found: '+root);
walk(root);
const route=(p)=>relative(root,p).split(sep).join('/');
// Guides have their own fully functional topbar EN/ES control. Never auto-inject a second
// iOS switch into either public guides locale; other demos and bilingual landings remain eligible.
const safeRoute=(p)=>!((p==='guias/index.html'||p==='es/guias/index.html'||p==='guias/library.html'||p==='es/guias/biblioteca.html')||p.startsWith('command-center/')||p.includes('owner-delivery')||
 p.includes('auth-recovery')||p.includes('website-delivery-admin')||
 p.includes('lead-private-preview')||p.includes('lead-demo-tracker')||
 p.includes('client-review')||p.includes('client-legal')||
 p.includes('client-start-guide')||p.startsWith('assets/'));
const languageControl=/(?:class=["'][^"']*(?:language-toggle|lang-switch|cb-language-selector|languageLabel|tle-website-language|langs|lang-btn)[^"']*["']|id=["'](?:lang|language|langToggle|locale|demoLanguage)["']|data-lang-option=["'](?:en|es)["']|class=["']lang["'][^>]*aria-label=["']Language)/i;
function alternate(path,html){
 if(!/(?:^|\/)(?:index\.html)$/.test(path))return '';
 const es=path.startsWith('es/');
 const counterpart=es?path.slice(3):'es/'+path;
 const file=join(root,counterpart);
 if(!existsSync(file)||!statSync(file).isFile())return '';
 const translated=readFileSync(es?join(root,path):file,'utf8');
 if(!/<html[^>]*lang=["']es(?:-|["'])/i.test(translated))return '';
 if(es&&!/<html[^>]*lang=["']es(?:-|["'])/i.test(html))return '';
 if(!es&&!/<html[^>]*lang=["']en(?:-|["'])/i.test(html))return '';
 // Only an existing, genuinely Spanish counterpart grants a navigation switch.
 const suffix=counterpart.replace(/index\.html$/,'');
 return '/'+suffix;
}
let updated=0,skipped=0,paired=0,existing=0;
for(const file of entries){
 const path=route(file);
 if(!safeRoute(path)){skipped++;continue;}
 const text=readFileSync(file,'utf8');
 if(!/<\/head>/i.test(text)||!/<\/body>/i.test(text)){skipped++;continue;}
 if(text.includes('tle-ios-language-switch-20261111.js')){skipped++;continue;}
 const control=languageControl.test(text);
 const alt=alternate(path,text);
 if(!control&&!alt){skipped++;continue;}
 const tag=alt&&!control?' data-tle-alternate-path="'+alt+'"':'';
 const src='<script defer src="'+js+'"'+tag+'></script>';
 const dst=text.replace(/<\/head>/i,'<link rel="stylesheet" href="'+css+'"></head>')
  .replace(/<\/body>/i,src+'</body>');
 if(dst===text)throw Error('Failed to install locale switch '+path);
 writeFileSync(file,dst);
 if(alt&&!control)paired++;
 if(control)existing++;
 updated++;
}
if(updated===0)throw Error('No bilingual pages were found for iOS switches');
console.log('iOS language UI installed: '+updated+' pages ('+existing+' existing language controls, '+paired+' paired translations); skipped '+skipped+' pages');
