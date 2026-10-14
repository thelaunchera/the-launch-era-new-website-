import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import vm from 'node:vm';
const source=readFileSync('public/command-center/assets/jessy-owner.js','utf8');
new Function(source);
const fn=source.slice(source.indexOf('function onOwnerNotifications('),source.indexOf('function sync(){'));
for(const language of ['en','es'])for(const count of [1,2,50])for(const initial of [true,false]){
 const alert={hidden:true,textContent:'',isConnected:true};
 const box={owner:()=>true,root:{querySelector:()=>alert},language,open:false,notificationTimer:0,clearTimeout(){},setTimeout(){return 1},bubble(){}};
 vm.createContext(box);vm.runInContext(fn,box);box.onOwnerNotifications({detail:{unread:count,newCount:count,initial}});
 assert.equal(alert.hidden,false);assert(alert.textContent.length<=45);assert(!alert.textContent.includes('Command Center'));
 box.onOwnerNotifications({detail:{unread:0}});assert.equal(alert.hidden,true);
}
const css=readFileSync('public/command-center/assets/jessy-owner.css','utf8');
assert.match(css,/max-width:min\(250px,calc\(100dvw - 24px\)\)!important/);
console.log('PASS compact EN/ES owner alerts, singular/plural, 1-50 count and zero hides notification.');
