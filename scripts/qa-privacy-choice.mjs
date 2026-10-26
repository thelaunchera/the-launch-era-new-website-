import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';
const source=readFileSync(new URL('../public/assets/privacy-controls.js',import.meta.url),'utf8');
function fixture({saved,signal=false,storageBlocked=false,site='tle',lang='en'}={}){
  const dom=new JSDOM(`<!doctype html><html lang="${lang}"><head><script data-site="${site}" data-ga-id="G-N5BHMC432Q">${source}</script></head><body><input id="account"></body></html>`,{
    url:'https://thelaunchera.com/?email=private@example.invalid#token',runScripts:'dangerously',
    beforeParse(w){
      if(saved)w.localStorage.setItem(site+'_privacy_choice_v1',JSON.stringify(saved));
      w.localStorage.setItem('account-session','keep-me');
      w.document.cookie='_ga=old; path=/';
      if(signal)Object.defineProperty(w.navigator,'globalPrivacyControl',{value:true});
      if(storageBlocked)Object.defineProperty(w,'localStorage',{get(){throw new Error('blocked')}});
    }
  });
  dom.window.document.dispatchEvent(new dom.window.Event('DOMContentLoaded'));
  return dom;
}
const tags=w=>w.document.querySelectorAll('script[src*="googletagmanager"]').length;
const click=(w,selector)=>w.document.querySelector(selector).click();
{
 const d=fixture(),w=d.window;
 assert.equal(w.TLEPrivacy.allowed(),false);
 assert.equal(tags(w),0,'No Google network request before consent');
 assert(!w.document.cookie.includes('_ga='),'Remove old optional analytics cookies before consent');
 click(w,'[data-reject]');
 assert.equal(tags(w),0,'Reject never loads Google');
 assert.equal(w.localStorage.getItem('account-session'),'keep-me','Keep authentication storage');
 click(w,'[data-privacy-settings]');
 click(w,'[data-accept]');
 assert.equal(w.TLEPrivacy.allowed(),true);
 assert.equal(tags(w),1,'Load tag once after explicit acceptance');
 const config=w.dataLayer.find(args=>args[0]==='config')[2];
 assert.equal(config.page_location,'https://thelaunchera.com/','Do not send URL email or token');
 click(w,'[data-privacy-settings]');
 click(w,'[data-reject]');
 const before=w.dataLayer.length;
 w.gtag('event','must-not-send');
 assert.equal(w.dataLayer.length,before,'Revocation blocks future queued events');
 assert.equal(w['ga-disable-G-N5BHMC432Q'],true);
 assert.equal(JSON.parse(w.localStorage.getItem('tle_privacy_choice_v1')).analytics,false);
 d.window.close();
}
for(const saved of [null,{version:1,analytics:true,expires:Date.now()-1},{version:2,analytics:true,expires:Date.now()+10000}]){
 const d=fixture({saved});assert.equal(tags(d.window),0,'Invalid or expired choice never enables analytics');d.window.close();
}
{
 const d=fixture({signal:true,saved:{version:1,analytics:true,expires:Date.now()+100000}}),w=d.window;
 assert.equal(w.TLEPrivacy.allowed(),false,'GPC overrides old analytics acceptance');
 assert.equal(tags(w),0);click(w,'[data-privacy-settings]');
 assert.equal(w.document.querySelector('[data-accept]').disabled,true);d.window.close();
}
{
 const d=fixture({storageBlocked:true,lang:'es'}),w=d.window;
 assert.match(w.document.querySelector('h2').textContent,/privacidad/);
 click(w,'[data-reject]');assert.equal(w.TLEPrivacy.allowed(),false);
 click(w,'[data-privacy-settings]');click(w,'[data-accept]');assert.equal(w.TLEPrivacy.allowed(),true,'In-memory choice works with storage blocked');d.window.close();
}
{
 const d=fixture(),w=d.window;
 w.localStorage.setItem('tle_privacy_choice_v1',JSON.stringify({version:1,analytics:true,expires:Date.now()+100000}));
 w.dispatchEvent(new w.StorageEvent('storage',{key:'tle_privacy_choice_v1'}));
 assert.equal(w.TLEPrivacy.allowed(),true);
 w.localStorage.removeItem('tle_privacy_choice_v1');
 w.dispatchEvent(new w.StorageEvent('storage',{key:'tle_privacy_choice_v1'}));
 assert.equal(w.TLEPrivacy.allowed(),false,'A second tab can revoke consent');d.window.close();
}
console.log('PASS privacy: default denial, accept/reject, revoke, GPC, expiry, storage failure, cross-tab, safe URL, preserved auth.');
