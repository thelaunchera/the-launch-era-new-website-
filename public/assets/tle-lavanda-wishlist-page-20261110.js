/* Lavanda-only wishlist navigation. Reuses the existing wishlist/cart; Sneekiefs is unchanged. */
(()=>{'use strict';
if(document.documentElement.dataset.tleOneMotion!=='lavender-edit')return;
const $=(s,r=document)=>r.querySelector(s);
const main=$('#main'),actions=$('header .actions');
if(!main||!actions)return;
const top=document.createElement('a');
top.className='tle-lavanda-wishlist-topbar';
top.href='?view=wishlist';
top.setAttribute('aria-controls','tle-wishlist');
top.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M20.8 8.4c0 4.1-7.3 9.7-8.8 10.8-1.5-1.1-8.8-6.7-8.8-10.8A4.8 4.8 0 0 1 12 5.6a4.8 4.8 0 0 1 8.8 2.8Z"/></svg><span class="tle-lavanda-wishlist-badge" aria-hidden="true">0</span>';
actions.insertBefore(top,$('.lb-cart-trigger',actions));
const badge=$('.tle-lavanda-wishlist-badge',top);
const baseTitle=document.title;
let section,back,shopScroll=0,ready=false;
const isWishlist=()=>new URL(location.href).searchParams.get('view')==='wishlist';
const spanish=()=>document.documentElement.lang.toLowerCase().startsWith('es');
function updateCopy(){
 const n=$('[data-wishlist-count]',section)?.textContent?.trim()||'0';
 badge.textContent=n;
 top.setAttribute('aria-label',(spanish()?'Ver favoritos':'View wishlist')+' ('+n+')');
 top.title=spanish()?'Mis favoritos':'My wishlist';
 if(back)back.textContent=spanish()?'Seguir comprando':'Continue shopping';
 if(isWishlist())document.title=(spanish()?'Tus favoritos':'Your wishlist')+' | '+baseTitle;
}
function show(){
 const active=isWishlist();
 document.body.classList.toggle('tle-lavanda-wishlist-page',active);
 if(section)section.hidden=!active;
 top.setAttribute('aria-current',active?'page':'false');
 document.title=active?(spanish()?'Tus favoritos':'Your wishlist')+' | '+baseTitle:baseTitle;
 updateCopy();
}
function openWishlist(event){
 if(!ready)return; // The destination still works as a regular URL before initialization.
 event.preventDefault();
 if(isWishlist())return;
 shopScroll=window.scrollY;
 const url=new URL(location.href);url.searchParams.set('view','wishlist');url.hash='';
 history.pushState({tleLavandaWishlist:true},'',url.pathname+url.search);
 show();window.scrollTo(0,0);
}
function goShopping(event,hash=''){
 event?.preventDefault();
 const url=new URL(location.href);url.searchParams.delete('view');url.hash=hash;
 history.pushState({tleLavandaWishlist:false},'',url.pathname+url.search+url.hash);
 show();
 if(hash){const target=document.getElementById(hash.slice(1));target?.scrollIntoView();}
 else window.scrollTo(0,shopScroll);
}
top.addEventListener('click',openWishlist);
window.addEventListener('popstate',()=>{show();window.scrollTo(0,isWishlist()?0:shopScroll)});
document.addEventListener('click',event=>{
 if(!ready||!isWishlist()||event.defaultPrevented||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
 const link=event.target.closest?.('a');if(!link)return;
 if(link===back){goShopping(event);return;}
 const href=link.getAttribute('href')||'';
 if(href.startsWith('#')&&href.length>1){goShopping(event,href);}
});
function install(){
 if(ready)return true;
 const wishlist=$('#tle-wishlist'),count=$('#tle-wishlist [data-wishlist-count]');
 if(!wishlist||!count)return false;
 ready=true;section=wishlist;
 $('.tle-wishlist-jump',main)?.remove();
 main.append(wishlist);
 back=document.createElement('a');back.className='tle-lavanda-wishlist-back';back.href=location.pathname;section.prepend(back);
 new MutationObserver(updateCopy).observe(count,{childList:true,subtree:true,characterData:true});
 new MutationObserver(updateCopy).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
 show();
 return true;
}
function boot(){
 if(install())return;
 const watcher=new MutationObserver(()=>{if(install())watcher.disconnect()});
 watcher.observe(main,{subtree:true,childList:true});
 setTimeout(()=>watcher.disconnect(),15000);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
