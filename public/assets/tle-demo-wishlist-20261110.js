/* TLE wishlist: session-scoped client-side demo. No stock, checkout, or server writes. */
(()=>{'use strict';
const brand=document.documentElement.dataset.tleOneMotion;
if(!['lavender-edit','sneekiefs'].includes(brand))return;
const $=(selector,root=document)=>root.querySelector(selector);
const $$=(selector,root=document)=>Array.from(root.querySelectorAll(selector));
const copy={
 en:{kicker:'THE SAVED EDIT',heading:'Your wishlist',lead:'The pieces you want to come back to.',empty:'Nothing saved yet. Tap the heart on any product to keep it here.',save:'Save to wishlist',unsave:'Remove from wishlist',move:'Move to bag',remove:'Remove',size:'Select size / US',choose:'Choose a size',needSize:'Choose a size before moving this pair.',moved:'Moved to bag',view:'View saved pieces'},
 es:{kicker:'TU SELECCIÓN',heading:'Tus favoritos',lead:'Guarda aquí lo que más te guste.',empty:'Todavía no tienes favoritos. Toca el corazón en cualquier producto para guardarlo.',save:'Guardar en favoritos',unsave:'Quitar de favoritos',move:'Mover a la bolsa',remove:'Quitar',size:'Selecciona talla / US',choose:'Elige una talla',needSize:'Elige una talla antes de mover este par.',moved:'Añadido a la bolsa',view:'Ver favoritos'}
};
const lang=()=>document.documentElement.lang.toLowerCase().startsWith('es')?'es':'en';
const t=key=>copy[lang()][key];
const source=()=>brand==='lavender-edit'?$('#tle-demo-sample-prices'):$('#collection');
const gridSource=()=>brand==='lavender-edit'?$$('#tle-demo-sample-prices .tle-price-card'):$$('#productGrid .product-card');
const products=new Map(),saved=new Map();
const storageKey='tle-wishlist-'+brand+'-v1';
let section,grid,empty,status,jump,countBadge,observer,installed=false;
function snapshot(){
 const nodes=gridSource();
 if(brand==='lavender-edit'){
  const items=window.TLE_DEMO_PRICE_CATALOGS?.['lavender-edit']?.items||[];
  nodes.forEach((node,index)=>{const item=items[index];if(item)products.set(String(index),{id:String(index),name:item.name,price:new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(item.priceCents/100),image:item.image||$('img',node)?.getAttribute('src')||'',node});});
 }else{
  nodes.forEach(node=>{const id=node.dataset.product;
   if(!id)return;
   const name=$('.product-meta h3',node)?.textContent?.trim();
   if(!name)return;
   products.set(id,{id,name,price:$('.product-meta > strong',node)?.textContent?.trim()||'',image:$('.product-photo img',node)?.getAttribute('src')||'',node});
  });
 }
 return products.size>0;
}
function store(){try{sessionStorage.setItem(storageKey,JSON.stringify([...saved]))}catch{}}
function restore(){try{const rows=JSON.parse(sessionStorage.getItem(storageKey)||'[]');if(Array.isArray(rows))for(const row of rows){if(Array.isArray(row)&&products.has(String(row[0])))saved.set(String(row[0]),{size:row[1]?.size||''})}}catch{}}
function setStatus(message){if(status)status.textContent=message;}
function updateCount(){
 const n=saved.size;
 if(countBadge)countBadge.textContent=String(n);
 const h=$('[data-wishlist-count]',section);if(h)h.textContent=String(n);
 if(jump)jump.setAttribute('aria-label',t('view')+': '+n);
}
const heartMarkup='<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M20.8 8.4c0 4.1-7.3 9.7-8.8 10.8-1.5-1.1-8.8-6.7-8.8-10.8A4.8 4.8 0 0 1 12 5.6a4.8 4.8 0 0 1 8.8 2.8Z"/></svg>';
function updateHearts(){
 for(const node of gridSource()){
  const id=brand==='lavender-edit'?String(gridSource().indexOf(node)):node.dataset.product;
  const host=brand==='lavender-edit'?node:$('.product-photo',node);
  if(!id||!host||!products.has(id))continue;
  host.classList.add('tle-wishlist-source-host');
  let button=$('.tle-wishlist-heart',host);
  if(!button){button=document.createElement('button');button.type='button';button.className='tle-wishlist-heart';button.innerHTML=heartMarkup;host.append(button)}
  button.dataset.wishToggle=id;
  const active=saved.has(id);
  button.setAttribute('aria-pressed',String(active));
  button.setAttribute('aria-label',(active?t('unsave'):t('save'))+': '+products.get(id).name);
 }
}
function card(product,selection){
 const article=document.createElement('article');article.className='tle-wishlist-card';article.dataset.wishCard=product.id;
 const image=document.createElement('img');image.src=product.image;image.alt=product.name;image.loading='lazy';image.decoding='async';article.append(image);
 const details=document.createElement('div');details.className='tle-wishlist-details';
 const name=document.createElement('h3');name.textContent=product.name;
 const price=document.createElement('p');price.className='tle-wishlist-price';price.textContent=product.price;
 details.append(name,price);
 if(brand==='sneekiefs'){
  const label=document.createElement('label');label.className='tle-wishlist-size';
  const labelText=document.createElement('span');labelText.textContent=t('size');
  const select=document.createElement('select');select.dataset.wishSize=product.id;select.setAttribute('aria-label',t('size')+': '+product.name);
  const placeholder=document.createElement('option');placeholder.value='';placeholder.textContent=t('choose');select.append(placeholder);
  for(const size of [7,8,9,10,11,12]){const option=document.createElement('option');option.value=String(size);option.textContent=String(size);select.append(option)}
  select.value=selection.size||'';label.append(labelText,select);details.append(label);
 }
 const actions=document.createElement('div');actions.className='tle-wishlist-actions';
 const move=document.createElement('button');move.type='button';move.className='tle-wishlist-move';move.dataset.wishMove=product.id;move.textContent=t('move');
 const remove=document.createElement('button');remove.type='button';remove.className='tle-wishlist-remove';remove.dataset.wishRemove=product.id;remove.textContent=t('remove');remove.setAttribute('aria-label',t('unsave')+': '+product.name);
 actions.append(move,remove);details.append(actions);article.append(details);return article;
}
function updateEmpty(){if(empty)empty.hidden=saved.size!==0}
function render(){
 if(!grid)return;
 const nodes=[];for(const [id,selection] of saved){const product=products.get(id);if(product)nodes.push(card(product,selection))}
 grid.replaceChildren(...nodes);
 updateEmpty();updateCount();updateHearts();
}
function translate(){
 if(!section)return;
 $('[data-wishlist-kicker]',section).textContent=t('kicker');
 $('[data-wishlist-title]',section).firstChild.textContent=t('heading')+' ';
 $('[data-wishlist-lead]',section).textContent=t('lead');
 empty.textContent=t('empty');
 $('[data-wishlist-jump]',source())?.setAttribute('title',t('view'));
 $('[data-wishlist-jump-label]',source())?.replaceChildren(document.createTextNode(t('view')));
 render();
}
function remove(id){
 const node=$('[data-wish-card]',grid);const target=$$('[data-wish-card]',grid).find(el=>el.dataset.wishCard===id);
 if(!saved.has(id)||!target||target.classList.contains('is-removing'))return;
 saved.delete(id);store();updateCount();updateHearts();target.classList.add('is-removing');
 const peers=$$('[data-wish-card]',grid).filter(el=>el!==target);
 const positions=new Map(peers.map(el=>[el,el.getBoundingClientRect()]));
 const finish=()=>{
  if(!target.isConnected)return;
  target.remove();updateEmpty();
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  for(const el of peers){if(!el.isConnected)continue;const a=positions.get(el),b=el.getBoundingClientRect();const dx=a.left-b.left,dy=a.top-b.top;
   if((Math.abs(dx)>1||Math.abs(dy)>1)&&el.animate)el.animate([{transform:'translate('+dx+'px,'+dy+'px)'},{transform:'translate(0,0)'}],{duration:280,easing:'cubic-bezier(.22,1,.36,1)'});
  }
 };
 if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){finish();return}
 if(target.animate){const motion=target.animate([{opacity:1,transform:'scale(1)'},{opacity:0,transform:'scale(.88)'}],{duration:170,easing:'ease-in',fill:'forwards'});motion.finished.then(finish,finish)}else finish();
}
function toggle(id){
 if(!products.has(id))return;
 if(saved.has(id)){remove(id);setStatus(t('unsave')+': '+products.get(id).name);return}
 const nativeSize=brand==='sneekiefs'?$('.product-card[data-product="'+id+'"] .size.selected')?.dataset.size:'';
 saved.set(id,{size:nativeSize||''});store();render();setStatus(t('save')+': '+products.get(id).name);
}
function setup(){
 if(installed)return;
 const host=source();if(!host||!snapshot())return false;
 installed=true;restore();
 const jumpRoot=brand==='lavender-edit'?$('.tle-price-grid',host):$('#productGrid',host);
 if(jumpRoot){jump=document.createElement('a');jump.className='tle-wishlist-jump';jump.href='#tle-wishlist';jump.dataset.wishlistJump='';const title=document.createElement('span');title.dataset.wishlistJumpLabel='';title.textContent=t('view');const b=document.createElement('b');const count=document.createElement('span');count.textContent='0';b.append(count);countBadge=count;jump.append(title,b);jumpRoot.insertAdjacentElement('afterend',jump)}
 section=document.createElement('section');section.id='tle-wishlist';section.className='tle-wishlist';section.setAttribute('aria-labelledby','tle-wishlist-title');
 section.innerHTML='<div class="tle-wishlist-header"><div><p class="tle-wishlist-kicker" data-wishlist-kicker></p><h2 id="tle-wishlist-title" data-wishlist-title>Your wishlist <small data-wishlist-count>0</small></h2></div><p class="tle-wishlist-lead" data-wishlist-lead></p></div><div class="tle-wishlist-grid" data-wishlist-grid></div><p class="tle-wishlist-empty" data-wishlist-empty></p><div class="tle-wishlist-status" role="status" aria-live="polite" data-wishlist-status></div>';
 host.insertAdjacentElement('afterend',section);
 grid=$('[data-wishlist-grid]',section);empty=$('[data-wishlist-empty]',section);status=$('[data-wishlist-status]',section);
 translate();
 document.addEventListener('click',event=>{
  const target=event.target instanceof Element?event.target:null;if(!target)return;
  const save=target.closest('[data-wish-toggle]');if(save){toggle(save.dataset.wishToggle);return}
  const removeButton=target.closest('[data-wish-remove]');if(removeButton){remove(removeButton.dataset.wishRemove);setStatus(t('unsave'));return}
  const move=target.closest('[data-wish-move]');if(!move)return;
  const id=move.dataset.wishMove,entry=saved.get(id),product=products.get(id);if(!entry||!product)return;
  if(brand==='sneekiefs'&&!entry.size){const select=$('[data-wish-size]',move.closest('.tle-wishlist-card'));select?.focus();select?.setCustomValidity(t('needSize'));select?.reportValidity();return}
  const adapter=window.TLEWishlistCart;
  if(adapter?.brand!==brand||typeof adapter.add!=='function')return;
  if(adapter.add(id,{size:entry.size})===true){remove(id);setStatus(t('moved')+': '+product.name)}
 });
 document.addEventListener('change',event=>{
  const select=event.target.closest?.('[data-wish-size]');if(!select)return;
  const entry=saved.get(select.dataset.wishSize);if(!entry)return;
  entry.size=select.value;select.setCustomValidity('');store();
 });
 observer=new MutationObserver(()=>{snapshot();updateHearts()});
 observer.observe(brand==='lavender-edit'?host:$('#productGrid'),{childList:true,subtree:true});
 new MutationObserver(()=>translate()).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
 return true;
}
// The price catalog is rendered asynchronously, after deferred scripts have run.
function initialize(){
 if(setup())return;
 const watcher=new MutationObserver(()=>{if(setup())watcher.disconnect()});
 watcher.observe(document.body,{childList:true,subtree:true});
 setTimeout(()=>watcher.disconnect(),15000);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initialize,{once:true});
else initialize();
})();
