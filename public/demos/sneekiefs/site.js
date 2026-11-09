(() => {
'use strict';
const base='./media/';
const products=[
 {id:'court-azure',name:'The Court 01',color:'Azure / Cream',type:'sneakers',price:89,image:base+'02-lifestyle-product.png',tag:'THE CLASSIC',desc:'Our retro court silhouette with vivid blue, cream accents and a warm gum sole.',sizes:['6','7','8','9','10','11','12'],swatches:['#3283BE','#f7f0de','#ae763b']},
 {id:'court-navy',name:'The Court 02',color:'Navy / Ivory',type:'sneakers',price:89,image:base+'01-blue-product.png',tag:'EVERYDAY FAVORITE',desc:'A navy-and-ivory take on the classic low-top. Easy to wear, hard to ignore.',sizes:['6','7','8','9','10','11','12'],swatches:['#102f51','#f1eade','#986d41']},
 {id:'court-coral',name:'The Court 03',color:'Coral / Sand',type:'sneakers',price:89,image:base+'08-coral-sneaker.png',tag:'NEW COLOR',desc:'A sunlit coral-toned statement pair with understated neutral details.',sizes:['6','7','8','9','10','11','12'],swatches:['#fd614b','#e4cb9b','#986d41']}
];
let cart=readBag(),selectedCategory='all',selectedProduct=null,selectedSize='',activeLayer=null,returnFocus=null;
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const money=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(n);
function readBag(){try{const b=JSON.parse(localStorage.getItem('sneekiefs-bag-v1')||'[]');return Array.isArray(b)?b.filter(x=>x&&typeof x.id==='string'&&Number.isInteger(x.qty)&&x.qty>0&&x.qty<=50).slice(0,30):[]}catch{return []}}
function saveBag(){try{localStorage.setItem('sneekiefs-bag-v1',JSON.stringify(cart))}catch{}}
function esc(s){return String(s).replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]))}
function productsForView(){const term=$('#catalog-search').value.trim().toLowerCase();return products.filter(p=>(selectedCategory==='all'||p.type===selectedCategory)&&(!term||[p.name,p.color,p.type,p.desc].some(s=>s.toLowerCase().includes(term))))}
function renderProducts(){
 const list=productsForView();
 $('#product-grid').innerHTML=list.length?list.map(p=>`<article class="product-card"><div class="product-photo"><img src="${p.image}" alt="${esc(p.name+' sneaker in '+p.color)}" loading="lazy"><span class="product-tag">${esc(p.tag)}</span><button class="product-quick" type="button" data-open-product="${p.id}" aria-label="Choose size for ${esc(p.name+' '+p.color)}">+</button></div><div class="product-name"><h3>${esc(p.name)}</h3><span class="product-price">${money(p.price)}</span></div><p class="product-color">${esc(p.color)}</p><div class="swatches" aria-label="Colors">${p.swatches.map(c=>`<span class="swatch" style="background:${c}"></span>`).join('')}</div></article>`).join(''):`<div class="no-results"><h3>${selectedCategory==='apparel'?'SPORTSWEAR IS ON ITS WAY.':'NO MATCHES FOUND.'}</h3><p>${selectedCategory==='apparel'?'Explore our current sneaker collection while we build the next drop.':'Try a different search or see all products.'}</p><button type="button" id="reset-filter">SHOW THE COLLECTION</button></div>`;
 $('#product-count').textContent=`${list.length} ${list.length===1?'STYLE':'STYLES'} / DISCOVER THE EDIT`;
 $$('#product-grid [data-open-product]').forEach(b=>b.addEventListener('click',()=>openProduct(b.dataset.openProduct)));
 $('#reset-filter')?.addEventListener('click',()=>{selectedCategory='all';$('#catalog-search').value='';updateFilters();renderProducts()});
}
function updateFilters(){$$('.filter').forEach(el=>{const yes=el.dataset.filter===selectedCategory;el.classList.toggle('active',yes);el.setAttribute('aria-pressed',String(yes))})}
function openLayer(el){closeLayer(false);returnFocus=document.activeElement;activeLayer=el;$('#overlay').hidden=false;el.classList.add('open');el.setAttribute('aria-hidden','false');document.body.classList.add('modal-open');el.focus({preventScroll:true})}
function closeLayer(restore=true){if(activeLayer){activeLayer.classList.remove('open');activeLayer.setAttribute('aria-hidden','true');activeLayer=null}$('#overlay').hidden=true;document.body.classList.remove('modal-open');if(restore&&returnFocus?.isConnected)returnFocus.focus({preventScroll:true})}
function openProduct(id){
 const p=products.find(q=>q.id===id);if(!p)return;selectedProduct=p;selectedSize='';
 $('#product-modal-body').innerHTML=`<div class="product-modal-inner"><img src="${p.image}" alt="${esc(p.name+' in '+p.color)}"><div class="product-modal-copy"><p class="micro">SNEEKIEFS / ${esc(p.tag)}</p><h2>${esc(p.name.toUpperCase())}</h2><p>${esc(p.desc)}</p><div class="modal-price">${money(p.price)}</div><div style="margin-top:24px;font-size:11px;font-weight:800;letter-spacing:.13em">CHOOSE YOUR US SIZE</div><div class="size-options" role="group" aria-label="Choose shoe size">${p.sizes.map(n=>`<button type="button" data-size="${n}" aria-pressed="false">${n}</button>`).join('')}</div><button class="pill pill-coral" id="confirm-add" disabled type="button">SELECT A SIZE <span aria-hidden="true">↗</span></button></div></div>`;
 $$('#product-modal [data-size]').forEach(btn=>btn.addEventListener('click',()=>{selectedSize=btn.dataset.size;$$('#product-modal [data-size]').forEach(x=>{x.classList.toggle('selected',x===btn);x.setAttribute('aria-pressed',String(x===btn))});$('#confirm-add').disabled=false;$('#confirm-add').innerHTML='ADD TO BAG <span aria-hidden="true">↗</span>'}));
 $('#confirm-add').addEventListener('click',()=>{if(!selectedSize)return;addToCart(selectedProduct.id,selectedSize);closeLayer(false);openLayer($('#bag-drawer'))});
 openLayer($('#product-modal'))
}
function addToCart(id,size){let it=cart.find(x=>x.id===id&&x.size===size);if(it)it.qty=Math.min(50,it.qty+1);else cart.push({id,size,qty:1});saveBag();renderBag()}
function renderBag(){
 cart=cart.filter(x=>products.some(p=>p.id===x.id));saveBag();
 const count=cart.reduce((n,x)=>n+x.qty,0);$('#bag-count').textContent=count;$('#bag-count-drawer').textContent=count;
 $('#bag-subtotal').textContent=money(cart.reduce((n,x)=>n+(products.find(p=>p.id===x.id)?.price||0)*x.qty,0));
 $('#checkout-button').disabled=!count;
 $('#bag-items').innerHTML=count?cart.map((item,i)=>{const p=products.find(q=>q.id===item.id);return `<div class="bag-item"><img src="${p.image}" alt="${esc(p.name)}"><div><h3>${esc(p.name)}</h3><p>${esc(p.color)} · US ${esc(item.size)}</p><strong>${money(p.price*item.qty)}</strong><div class="qty"><button type="button" data-qty="${i}" data-dir="-1" aria-label="Decrease quantity">−</button><span>${item.qty}</span><button type="button" data-qty="${i}" data-dir="1" aria-label="Increase quantity">+</button></div></div><button type="button" data-remove="${i}" aria-label="Remove ${esc(p.name)}">×</button></div>`}).join(''):'<div class="empty-bag"><h3>NOTHING IN THE BAG. YET.</h3><p>Find your next everyday favorites in the classic line.</p></div>';
 $$('#bag-items [data-qty]').forEach(b=>b.addEventListener('click',()=>{const i=+b.dataset.qty;if(!cart[i])return;cart[i].qty+=Number(b.dataset.dir);if(cart[i].qty<=0)cart.splice(i,1);renderBag()}));
 $$('#bag-items [data-remove]').forEach(b=>b.addEventListener('click',()=>{cart.splice(+b.dataset.remove,1);renderBag()}));
}
function openPolicy(type){const text={
 privacy:['PRIVACY','This concept storefront stores your shopping bag locally in your browser. It does not collect payment information or submit your details to a server. You can clear the bag by removing items or clearing browser data.'],
 terms:['STORE INFORMATION','Sneekiefs is presented as a digital storefront concept. Product descriptions, availability and prices shown here are illustrative. Browsing or trying the bag does not create a real purchase or contract.'],
 shipping:['SHIPPING & RETURNS','This is a storefront concept and no real orders are shipped. Shipping rates, delivery estimates and return eligibility would be confirmed by a real merchant before purchase.']
 }[type];if(!text)return;$('#policy-body').innerHTML=`<p class="micro">SNEEKIEFS / INFORMATION</p><h2>${text[0]}</h2><p>${text[1]}</p><button class="pill pill-coral" data-close>BACK TO SHOP <span aria-hidden="true">↗</span></button>`;$('#policy-body [data-close]').addEventListener('click',()=>closeLayer());openLayer($('#policy-modal'))}
function openCheckout(){
 if(!cart.length)return;
 const total=cart.reduce((n,x)=>n+(products.find(p=>p.id===x.id)?.price||0)*x.qty,0);
 $('#checkout-body').innerHTML=`<p class="micro">SNEEKIEFS / YOUR ORDER</p><h2>ONE MORE STEP.</h2><p>Review your picks before you finish.</p><div class="checkout-list">${cart.map(x=>{const p=products.find(q=>q.id===x.id);return `<div class="checkout-line"><span>${esc(p.name)} · US ${esc(x.size)} × ${x.qty}</span><strong>${money(p.price*x.qty)}</strong></div>`}).join('')}</div><div class="checkout-total"><span>SUBTOTAL</span><span>${money(total)}</span></div><div class="preview-note">This is a storefront preview. No payment is requested, and no real order will be placed.</div><button class="pill pill-coral" id="preview-order" type="button">FINISH PREVIEW <span aria-hidden="true">↗</span></button>`;
 $('#preview-order').addEventListener('click',()=>{cart=[];saveBag();renderBag();$('#checkout-body').innerHTML='<p class="micro">SNEEKIEFS / PREVIEW COMPLETE</p><h2>GOOD CHOICE.</h2><p>You have completed the shopping experience preview. No order was submitted and no payment was taken.</p><a class="pill pill-coral" href="#collection" id="preview-done">KEEP EXPLORING <span aria-hidden="true">↗</span></a>';$('#preview-done').addEventListener('click',()=>closeLayer())});
 openLayer($('#checkout-modal'));
}
$$('.filter').forEach(btn=>btn.addEventListener('click',()=>{selectedCategory=btn.dataset.filter;updateFilters();renderProducts()}));
$('#catalog-search').addEventListener('input',renderProducts);
$('#search-toggle').addEventListener('click',()=>{document.getElementById('collection').scrollIntoView({behavior:'smooth'});setTimeout(()=>$('#catalog-search').focus({preventScroll:true}),200)});
$('#bag-toggle').addEventListener('click',()=>openLayer($('#bag-drawer')));
$('#checkout-button').addEventListener('click',openCheckout);
$('#overlay').addEventListener('click',()=>closeLayer());
$$('button[data-close]').forEach(b=>b.addEventListener('click',()=>closeLayer()));
$$('[data-policy]').forEach(b=>b.addEventListener('click',()=>openPolicy(b.dataset.policy)));
document.addEventListener('keydown',event=>{if(event.key==='Escape'){if(activeLayer)closeLayer();else if($('#primary-nav').classList.contains('open'))toggleMenu(false)}if(event.key==='Tab'&&activeLayer){const els=[...activeLayer.querySelectorAll('button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled),[tabindex="0"]')].filter(x=>x.getClientRects().length);if(!els.length)return;const first=els[0],last=els[els.length-1];if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}}});
function toggleMenu(state){const n=$('#primary-nav'),btn=$('#menu-toggle');n.classList.toggle('open',state);btn.setAttribute('aria-expanded',String(state));btn.setAttribute('aria-label',state?'Close menu':'Open menu')}
$('#menu-toggle').addEventListener('click',()=>toggleMenu(!$('#primary-nav').classList.contains('open')));
$$('.nav a').forEach(a=>a.addEventListener('click',()=>toggleMenu(false)));
$('#year').textContent=new Date().getFullYear();
renderProducts();renderBag();
})();