/* Marea: native saved looks behind the existing heart on a proper URL. No server writes. */
(()=>{'use strict';
if(document.documentElement.dataset.tleOneMotion!=='marea-wigs-miami')return;
const $=(s,r=document)=>r.querySelector(s);
const app=$('#app');if(!app)return;
const looks=[
 {id:'espresso',name:'Espresso Waves',photo:'10-waves.png',es:'Ondas largas · Espresso',en:'Long waves · Espresso'},
 {id:'bob',name:'The Miami Bob',photo:'05-bob-product.png',es:'Bob liso · Espresso',en:'Sleek bob · Espresso'},
 {id:'caramel',name:'Caramel Hours',photo:'09-caramel.png',es:'Ondas suaves · Caramelo',en:'Soft waves · Caramel'},
 {id:'curls',name:'After Hours Curls',photo:'07-curls.png',es:'Rizos definidos · Espresso',en:'Defined curls · Espresso'}
];
const lang=()=>document.documentElement.lang.toLowerCase().startsWith('en')?'en':'es';
const words={
 es:{back:'Seguir explorando',kicker:'TU SELECCIÓN',title:'Mis looks',lead:'Los estilos que quieres volver a mirar, todos en un solo lugar.',saved:'looks guardados',empty:'Todavía no tienes looks guardados. Toca el corazón en cualquier estilo de la colección.',explore:'Explorar la colección',remove:'Quitar',view:'Ver look',consult:'Preparar consulta',nav:'Mis looks'},
 en:{back:'Continue exploring',kicker:'THE SAVED EDIT',title:'My looks',lead:'All the styles you want to come back to, in one place.',saved:'saved looks',empty:'Nothing saved yet. Tap the heart on any look to keep it here.',explore:'Explore the collection',remove:'Remove',view:'View look',consult:'Prepare your consultation',nav:'My looks'}
};
const t=key=>words[lang()][key];
const saved=()=>{try{const r=JSON.parse(localStorage.getItem('marea-looks')||'[]');return Array.isArray(r)?looks.filter(x=>r.includes(x.id)):[]}catch{return []}};
const isWishlist=()=>new URL(location.href).searchParams.get('view')==='wishlist';
let section,back,scrollTop=0,removing=false;
function title(){return t('title')+' | Marea Wigs · Miami'}
function ensureSection(){
 if(!section){section=document.createElement('section');section.id='marea-wishlist';section.className='marea-wishlist-page';section.hidden=true;section.setAttribute('aria-labelledby','marea-wishlist-title');
 back=document.createElement('a');back.className='marea-wishlist-back';back.href=location.pathname;section.append(back);}
 if(!section.isConnected){const footer=$('#app > footer');if(footer)footer.before(section);else app.append(section);}
 return section;
}
function enhanceLinks(){
 const top=$('#app .saved-nav');
 if(top&&top.tagName!=='A'){
  const link=document.createElement('a');link.className=top.className;link.innerHTML=top.innerHTML;link.href='?view=wishlist';link.setAttribute('aria-label',top.getAttribute('aria-label')||t('nav'));link.setAttribute('aria-controls','marea-wishlist');top.replaceWith(link);
 }
 const footer=$('#app footer [data-action="saved"]');
 if(footer){const link=document.createElement('a');link.textContent=footer.textContent;link.href='?view=wishlist';link.dataset.mareaWishlistLink='';footer.replaceWith(link);}
 const nav=$('#app .saved-nav');if(nav){nav.setAttribute('title',t('nav'));nav.setAttribute('aria-current',isWishlist()?'page':'false');}
}
function card(look){
 const article=document.createElement('article');article.className='marea-wishlist-card';article.dataset.lookId=look.id;
 const photo=document.createElement('img');photo.src='/demos/marea-wigs-miami/resources/'+look.photo;photo.alt=look.name;photo.loading='lazy';photo.decoding='async';
 const info=document.createElement('div');info.className='marea-wishlist-card-copy';
 const name=document.createElement('h2');name.textContent=look.name;
 const desc=document.createElement('p');desc.textContent=look[lang()];
 const actions=document.createElement('div');actions.className='marea-wishlist-actions';
 const view=document.createElement('button');view.type='button';view.className='marea-wishlist-view';view.dataset.action='product';view.dataset.id=look.id;view.textContent=t('view');
 const remove=document.createElement('button');remove.type='button';remove.className='marea-wishlist-remove';remove.dataset.mareaRemove=look.id;remove.textContent=t('remove');remove.setAttribute('aria-label',t('remove')+': '+look.name);
 actions.append(view,remove);info.append(name,desc,actions);article.append(photo,info);return article;
}
function render(){
 ensureSection();back.textContent=t('back');
 section.querySelector('.marea-wishlist-content')?.remove();
 const box=document.createElement('div');box.className='marea-wishlist-content';
 const heading=document.createElement('div');heading.className='marea-wishlist-header';
 const kicker=document.createElement('p');kicker.className='marea-wishlist-kicker';kicker.textContent=t('kicker');
 const h=document.createElement('h1');h.id='marea-wishlist-title';h.textContent=t('title')+' ';
 const number=document.createElement('small');number.textContent=String(saved().length);number.setAttribute('aria-label',t('saved'));h.append(number);
 const lead=document.createElement('p');lead.className='marea-wishlist-lead';lead.textContent=t('lead');
 heading.append(kicker,h,lead);box.append(heading);
 const grid=document.createElement('div');grid.className='marea-wishlist-grid';grid.dataset.mareaWishlistGrid='';
 const list=saved();for(const look of list)grid.append(card(look));box.append(grid);
 if(!list.length){const empty=document.createElement('div');empty.className='marea-wishlist-empty';const p=document.createElement('p');p.textContent=t('empty');const link=document.createElement('a');link.href='#collection';link.textContent=t('explore');link.className='marea-wishlist-explore';empty.append(p,link);box.append(empty);}
 else{const consult=document.createElement('button');consult.type='button';consult.className='marea-wishlist-consult';consult.dataset.action='consult';consult.textContent=t('consult');box.append(consult);}
 section.append(box);
 enhanceLinks();
}
function show(){
 ensureSection();enhanceLinks();
 const active=isWishlist();document.body.classList.toggle('tle-marea-wishlist-page',active);section.hidden=!active;
 document.title=active?title():(lang()==='es'?'Marea Wigs · Miami — Un nuevo look. Muy tú.':'Marea Wigs · Miami — A new look. Still you.');
 if(active)render();
}
function open(event){
 event.preventDefault();if(isWishlist())return;
 scrollTop=scrollY;const url=new URL(location.href);url.searchParams.set('view','wishlist');url.hash='';
 history.pushState({mareaWishlist:true},'',url.pathname+url.search);show();window.scrollTo(0,0);
}
function goShop(event,hash=''){
 event.preventDefault();const url=new URL(location.href);url.searchParams.delete('view');url.hash=hash;
 history.pushState({mareaWishlist:false},'',url.pathname+url.search+url.hash);show();
 if(hash){document.getElementById(hash.slice(1))?.scrollIntoView();}else window.scrollTo(0,scrollTop);
}
function nativeSave(id){
 const proxy=document.createElement('button');proxy.type='button';proxy.hidden=true;proxy.dataset.action='save';proxy.dataset.id=id;document.body.append(proxy);proxy.click();proxy.remove();
}
function remove(id){
 if(removing||!saved().some(x=>x.id===id))return;
 const target=section?.querySelector('.marea-wishlist-card[data-look-id="'+id+'"]');
 if(!target)return;
 removing=true;
 const peers=Array.from(section.querySelectorAll('.marea-wishlist-card')).filter(el=>el!==target);
 const positions=new Map(peers.map(el=>[el,el.getBoundingClientRect()]));
 nativeSave(id);
 const finish=()=>{
  render();removing=false;
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  for(const el of peers){if(!el.isConnected)continue;const before=positions.get(el),after=el.getBoundingClientRect();
   const dx=before.left-after.left,dy=before.top-after.top;
   if((Math.abs(dx)>1||Math.abs(dy)>1)&&el.animate)el.animate([{transform:'translate('+dx+'px,'+dy+'px)'},{transform:'translate(0,0)'}],{duration:280,easing:'cubic-bezier(.22,1,.36,1)'});
  }
 };
 if(matchMedia('(prefers-reduced-motion: reduce)').matches||!target.animate){finish();return}
 target.classList.add('is-removing');
 const motion=target.animate([{opacity:1,transform:'scale(1)'},{opacity:0,transform:'scale(.88)'}],{duration:180,easing:'ease-in',fill:'forwards'});
 motion.finished.then(finish,finish);
}
document.addEventListener('click',event=>{
 const target=event.target instanceof Element?event.target:null;if(!target)return;
 const removeButton=target.closest('[data-marea-remove]');
 if(removeButton){event.preventDefault();event.stopImmediatePropagation();remove(removeButton.dataset.mareaRemove);return}
 const nav=target.closest('.saved-nav, [data-marea-wishlist-link]');
 if(nav&&!event.metaKey&&!event.ctrlKey&&!event.shiftKey&&!event.altKey){event.stopImmediatePropagation();open(event);return}
 if(!isWishlist())return;
 const link=target.closest('a');if(!link||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
 if(link===back){event.stopImmediatePropagation();goShop(event);return}
 const href=link.getAttribute('href')||'';if(href.startsWith('#')&&href.length>1){event.stopImmediatePropagation();goShop(event,href);}
},true);
document.addEventListener('click',event=>{
 if(event.target instanceof Element && event.target.closest('[data-action="save"]')&&!removing){queueMicrotask(()=>{if(isWishlist())render();enhanceLinks()})}
});
window.addEventListener('popstate',()=>{show();window.scrollTo(0,isWishlist()?0:scrollTop)});
const observer=new MutationObserver(()=>{if(!$('#app .header'))return;ensureSection();enhanceLinks();if(isWishlist()){section.hidden=false;render();}});
observer.observe(app,{childList:true});
function boot(){if(!$('#app .header'))return;ensureSection();enhanceLinks();show();}
boot();
})();
