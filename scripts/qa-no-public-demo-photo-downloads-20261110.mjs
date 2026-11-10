// Public demo imagery is for viewing, not offered as stock-photo downloads.
// This check intentionally excludes the private Brand Board Studio and the paid editor,
// which have legitimate owner-only export functions.
import assert from 'node:assert/strict';
import {readFileSync,readdirSync,statSync} from 'node:fs';
import {resolve,dirname,join,relative} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const scopes=['public/demos','demo-source','public/portfolio','public/experience-cleaning','public/sample-cleaning'];
const forbiddenLabel=/(?:Download original PNG|Descargar PNG original|download its individual PNG|descargar su PNG individual)/i;
const downloadAnchor=/<a\b[^>]{0,700}\bdownload\s*(?:=|\b)/gi;
let checked=0;
const errors=[];
function visit(path){
  for(const entry of readdirSync(path,{withFileTypes:true})){
    if(['node_modules','dist','.output','.git'].includes(entry.name))continue;
    const file=join(path,entry.name);
    if(entry.isDirectory())visit(file);
    else if(entry.isFile() && /\.(?:html|jsx?|tsx?)$/i.test(entry.name)){
      checked++;
      const data=readFileSync(file,'utf8');
      if(forbiddenLabel.test(data)) errors.push(relative(root,file)+': downloadable-photo copy');
      if(downloadAnchor.test(data)) errors.push(relative(root,file)+': public download anchor');
      downloadAnchor.lastIndex=0;
      // Images must remain viewable; only forbid downloadable links, not image src.
    }
  }
}
for(const scope of scopes)visit(resolve(root,scope));
for(const path of ['demo-source/sova/src/site.js','public/demos/sova/assets/index-C3ToK82y.js']){
  const content=readFileSync(resolve(root,path),'utf8');
  assert.match(content,/photo-navigation/,path+' keeps the gallery navigation');
  assert.doesNotMatch(content,/download="SOVA-|Download original PNG|Descargar PNG original/,path+' has no photo downloads');
}
assert.deepEqual(errors,[],errors.join('\n'));
console.log('Public demo photo-download audit passed: '+checked+' public demo source files; private editor exports untouched.');
