/* Dedicated wishlist view for product demos. Favorite lists never appear in the storefront. */
(()=>{'use strict';
const brand=document.documentElement.dataset.tleOneMotion;
if(!['lavender-edit','sneekiefs'].includes(brand))return;
const $=(sel,root=document)=>root.querySelector(sel);
const main=$('#main'),actions=brand==='lavender-edit'?
 $('header .actions'):$('header .header-tools');
if(!main||!actions)return;
const bag=brand==='lavender-edit'?
 $('.lb-cart-trigger',actions):$('#bagOpen',actions);
const heart=document.createElement('a');
heart.className='tle-wishlist-topbar';
heart.href='?view=wishlist';
heart.setAttribute('aria-controls','tle-wishlist');
heart.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M20.8 8.4c0 4.1-7.3 9.7-8.8 10.8-1.5-1.1-8.8-6.7-8.8-10.8A4.8 4.8 0 0 1 12 5.6a4.8 4.8 0 0 1 8.8 2.8Z"/></svg><span class="tle-wishlist-topbar-count" aria-hidden="true">0</span>';
actions.insertBefore(heart,bag);
if(bag&&!bag.hasAttribute('aria-label'))bag.setAttribute('aria-label','Shopping bag');
const badge=$('.tle-wishlist-topbar-count',heart);
const initialTitle=document.title;
let section,back,count,ready=false,shopScroll=0;
const isSavedView=()=>new URL(location.href).searchParams.get('view')==='wishlist';
const es=()=>document.documentElement.lang.toLowerCase().startsWith('es');
function refresh(){
 const n=count?.textContent?.trim()||'0';
 badge.textContent=n;
 heart.setAttribute('aria-label',(es()?'Ver favoritos':'View wishlist')+' ('+n+')');
 heart.title=es()?'Mis favoritos':'My wishlist';
 if(back)back.textContent=es()?'Seguir comprando':'Continue shopping';
 if(isSavedView())document.title=(es()?'Tus favoritos':'Your wishlist')+' | '+initialTitle;
}
function route(){
 const active=isSavedView();
 document.body.classList.toggle('tle-wishlist-view',active);
 if(section)section.hidden=!active;
 heart.setAttribute('aria-current',active?'page':'false');
 document.title=active?(es()?'Tus favoritos':'Your wishlist')+' | '+initialTitle:initialTitle;
 refresh();
}
function visitWishlist(event){
 if(!ready)return;
 event.preventDefault();
 if(isSavedView())return;
 shopScroll=window.scrollY;
 const url=new URL(location.href);url.searchParams.set('view','wishlist');url.hash='';
 history.pushState({tleSavedView:true},'',url.pathname+url.search);
 route();window.scrollTo(0,0);
}
function visitStore(event,hash=''){
 if(event)event.preventDefault();
 const url=new URL(location.href);url.searchParams.delete('view');url.hash=hash;
 history.pushState({tleSavedView:false},'',url.pathname+url.search+url.hash);
 route();
 if(hash){document.getElementById(hash.substring(1))?.scrollIntoView();}
 else window.scrollTo(0,shopScroll);
}
heart.addEventListener('click',visitWishlist);
window.addEventListener('popstate',()=>{
 route();
 requestAnimationFrame(()=>window.scrollTo(0,isSavedView()?0:shopScroll));
});
document.addEventListener('click',event=>{
 if(!ready||!isSavedView()||event.defaultPrevented||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
 const link=event.target.closest?.('a');
 if(!link||link===heart)return;
 if(link===back){visitStore(event);return;}
 const href=link.getAttribute('href')||'';
 if(href.startsWith('#'))visitStore(event,href);
});
function mount(){
 if(ready)return true;
 const found=$('#tle-wishlist');
 const liveCount=$('[data-wishlist-count]',found);
 if(!found||!liveCount)return false;
 ready=true;section=found;count=liveCount;
 document.querySelectorAll('.tle-wishlist-jump').forEach(node=>node.remove());
 // Keep the saved-product grid outside all shop sections. It is only visible on the wishlist route.
 main.append(section);
 back=document.createElement('a');back.className='tle-wishlist-back';
 back.href=location.pathname;section.prepend(back);
 new MutationObserver(refresh).observe(count,{subtree:true,childList:true,characterData:true});
 new MutationObserver(refresh).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
 route();
 return true;
}
function boot(){
 if(mount())return;
 const waiting=new MutationObserver(()=>{if(mount())waiting.disconnect()});
 waiting.observe(main,{childList:true,subtree:true});
 setTimeout(()=>waiting.disconnect(),15000);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();