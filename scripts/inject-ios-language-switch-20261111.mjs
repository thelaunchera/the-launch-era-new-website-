/* Enhance only native, working EN/ES selectors in the published HTML.
   Leaves monolingual demos, favicons, translations, routing and source files intact. */
import {readdir,readFile,writeFile} from 'node:fs/promises';
import {join,relative} from 'node:path';
import {existsSync} from 'node:fs';
const root=process.argv.includes('--root')?process.argv[process.argv.indexOf('--root')+1]:'.output/public';
if(!root||!existsSync(root))throw Error('Published build root missing: '+root);
const css='/assets/tle-ios-language-switch-20261111.css';
const js='/assets/tle-ios-language-switch-20261111.js';
if(!existsSync(join(root,css.slice(1)))||!existsSync(join(root,js.slice(1))))throw Error('Switch assets missing from Pages build');
let changed=0,eligible=0;
const perRoute=[];
const qualify=html=>{
 const grouped=/<(?:div|span|nav)[^>]*class=["'][^"']*(?:language-toggle|lang-switch|cb-language-selector|langs)(?:\s|["'])/i.test(html);
 const singleton=/<(?:button|select)[^>]*id=["'](?:langToggle|language|lang|locale|demoLanguage)["'][^>]*>/i.test(html);
 const alternate=/<a\b[^>]*(?:class=["'][^"']*tle-website-language[^"']*["']|hreflang=["'](?:es|en)["'])[^>]*href=["']\/[^"']+["']/i.test(html)||
    /<a\b[^>]*href=["']\/[^"']+["'][^>]*(?:class=["'][^"']*tle-website-language[^"']*["']|hreflang=["'](?:es|en)["'])/i.test(html);
 return grouped||singleton||alternate;
};
async function walk(dir){
 for(const d of await readdir(dir,{withFileTypes:true})){
  const path=join(dir,d.name);
  if(d.isDirectory()){await walk(path);continue}
  if(!d.isFile()||!d.name.endsWith('.html'))continue;
  let html=await readFile(path,'utf8');
  if(!qualify(html))continue;
  eligible++;
  if(html.includes('tle-ios-language-switch-20261111'))continue;
  if(!/<\/head>/i.test(html)||!/<\/body>/i.test(html))continue;
  html=html.replace(/<\/head>/i,`<link rel="stylesheet" href="${css}?v=1"></head>`);
  html=html.replace(/<\/body>/i,`<script defer src="${js}?v=1"></script></body>`);
  await writeFile(path,html);
  changed++;
  perRoute.push(relative(root,path).replaceAll('\\','/'));
 }
}
await walk(root);
if(eligible<5)throw Error('Expected >=5 genuinely bilingual pages, found '+eligible);
console.log('iOS language switch enhanced '+changed+' pages; eligible '+eligible);
console.log(perRoute.slice(0,32).join('\n'));
