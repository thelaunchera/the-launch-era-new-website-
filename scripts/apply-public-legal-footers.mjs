// Publication guard: keep one sitewide legal footer on every public HTML route.
// Does not rewrite branded footers, source assets, demo identity, checkout logic or client data.
import {readdir,readFile,writeFile,stat} from 'node:fs/promises';
import {join,relative} from 'node:path';
const root='.output/public',token='tle-global-legal-footer-20261109.js';
const tag='<script defer src="/assets/'+token+'"></script>';
const exists=await stat(join(root,'assets',token)).then(x=>x.isFile()).catch(()=>false);
if(!exists)throw Error('Unified legal footer asset missing from website build');
let checked=0,added=0,already=0;
async function walk(dir){
 for(const e of await readdir(dir,{withFileTypes:true})){
  const path=join(dir,e.name),rel=relative(root,path).replaceAll('\\','/');
  if(e.isDirectory()){
   if(rel==='brand-board'||rel.startsWith('brand-board/'))continue; // separate private branding editor
   await walk(path);continue;
  }
  if(!e.name.endsWith('.html')||e.name==='404.html')continue;
  let text=await readFile(path,'utf8');if(!/<\/body\s*>/i.test(text))continue;
  checked++;
  if(text.includes(token)){already++;continue}
  text=text.replace(/<\/body\s*>/i,tag+'\n</body>');
  await writeFile(path,text,'utf8');added++;
 }
}
await walk(root);
if(checked<25)throw Error('Public website output unexpectedly small: '+checked+' HTML files');
for(const file of ['index.html','es/index.html','website-for-your-business/index.html','es/website-for-your-business/index.html','intake/website/index.html','intake/website-plus/index.html','demos/sova/index.html','command-center/index.html']){
 const html=await readFile(join(root,file),'utf8');
 if(!html.includes(token))throw Error('Missing legal footer on built public route: '+file);
}
console.log('One shared legal footer: '+checked+' built routes checked, '+added+' injected, '+already+' already present, with no duplicate scripts.');
