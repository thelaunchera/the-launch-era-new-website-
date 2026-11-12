import {mkdtempSync,mkdirSync,readFileSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';

const temp=mkdtempSync(join(tmpdir(),'tle-guides-ios-skip-'));
const read=p=>readFileSync(resolve('public',p),'utf8');
try{
 for(const [name,content] of [
  ['guias/index.html',read('guias/index.html')],
  ['es/guias/index.html',read('es/guias/index.html')],
  ['guias/library.html',read('guias/library.html')],
  ['es/guias/biblioteca.html',read('es/guias/biblioteca.html')],
  ['sample/index.html','<!doctype html><html lang="en"><head></head><body><header>Demo</header></body></html>'],
  ['es/sample/index.html','<!doctype html><html lang="es"><head></head><body><header>Ejemplo</header></body></html>']
 ]){
  mkdirSync(join(temp,name.slice(0,name.lastIndexOf('/'))),{recursive:true});
  writeFileSync(join(temp,name),content);
 }
 execFileSync(process.execPath,['scripts/install-ios-language-switch-20261111.mjs','--root',temp],{stdio:'pipe'});
 for(const path of ['guias/index.html','es/guias/index.html']){
  assert.ok(!readFileSync(join(temp,path),'utf8').includes('tle-ios-language-switch-20261111.js'));
 }
 for(const path of ['guias/library.html','es/guias/biblioteca.html']){
  const html=readFileSync(join(temp,path),'utf8');
  assert.ok(!html.includes('tle-ios-language-switch-20261111.js'),path+' must not receive duplicated switch');
  assert.equal((html.match(/class="lang"/g)||[]).length,1,path+' has exactly one language control');
 }
 for(const path of ['sample/index.html','es/sample/index.html']){
  const html=readFileSync(join(temp,path),'utf8');
  assert.ok(html.includes('tle-ios-language-switch-20261111.js'),path+' should keep existing sitewide injection');
 }
 console.log('[TLE GUIDES IOS] EN/ES have one built selector while unrelated bilingual demo switches remain installed: OK');
}finally{rmSync(temp,{recursive:true,force:true});}
