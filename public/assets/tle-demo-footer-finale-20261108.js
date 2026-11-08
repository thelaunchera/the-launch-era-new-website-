/* TLE original demos | interactive branded footer finale and catalog-first ordering
   November 8 2026. Preserves actual products, prices, forms and all URL destinations. */
(() => {
 'use strict';
 const brand=document.documentElement.getAttribute('data-tle-one-motion');
 if(!brand)return;
 const info={
  'sova':{name:'SOVA',en:'Stay in your sound.',es:'Vuelve a tu propio ritmo.',menu:'#collection',kind:'collection'},
  'golden-grid':{name:'GOLDEN GRID',en:'Make the morning yours.',es:'Haz que la mañana sea tuya.',menu:'#collection',kind:'collection'},
  'casa-brownie':{name:'CASA BROWNIE',en:'Just one more brownie.',es:'¿Un brownie más?',menu:'#brownies',kind:'collection'},
  'crumb':{name:'CRUMB',en:'There’s always room for one more.',es:'Siempre cabe una galleta más.',menu:'#cookies',kind:'menu'},
  'havana-19':{name:'HAVANA 19',en:'Stay a little longer.',es:'Quédate un poquito más.',menu:'#kitchen',kind:'menu'},
  'ivory-and-bloom':{name:'IVORY & BLOOM',en:'Every detail tells a story.',es:'Cada detalle cuenta una historia.',menu:'#cake-gallery',kind:'collection'},
  'la-vie-in-pink':{name:'LA VIE IN PINK',en:'One more lovely little moment.',es:'Un momento bonito más.',menu:'#collection',kind:'menu'},
  'marea-wigs-miami':{name:'MAREA',en:'Find the look that feels like you.',es:'Encuentra el look que va contigo.',menu:'#collection',kind:'collection'},
  'aftr':{name:'AFTR',en:'The night is just getting started.',es:'La noche apenas comienza.',menu:'#offers',kind:'experiences'},
  'lavender-edit':{name:'THE LAVENDER EDIT',en:'Make space for softness.',es:'Haz espacio para la calma.',menu:'#gallery',kind:'collection'},
  'experience-cleaning':{name:'CLEANING EXPERIENCE',en:'Come home to something better.',es:'Vuelve a sentirte en casa.',menu:'#experience',kind:'booking'},
  'seasonal-brew':{name:'SEASONAL BREW',en:'A little more time for coffee.',es:'Un poquito más de café.',menu:'#flavors',kind:'menu'},
  'soluna-yoga':{name:'SOLUNA',en:'Your space to begin again.',es:'Tu espacio para comenzar de nuevo.',menu:'#memberships',kind:'plans'},
  'wok-social':{name:'WOK SOCIAL',en:'One more round of good flavor.',es:'Otra ronda de buen sabor.',menu:'#menu',kind:'menu'},
  'yummm':{name:'YUMMM',en:'Make room for a little joy.',es:'Haz espacio para algo dulce.',menu:'#counter',kind:'menu'},
  'jaramillo-boutique':{name:'JARAMILLO BOUTIQUE',en:'There’s another look waiting.',es:'Hay otro look esperándote.',menu:'#collections',kind:'collection'}
 };
 const spec=info[brand];
 if(!spec)return;
 const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)');
 const es=()=>document.documentElement.lang.toLowerCase().startsWith('es');
 const labels={
  menu:{en:'EXPLORE THE MENU',es:'VER EL MENÚ'},
  collection:{en:'EXPLORE THE COLLECTION',es:'VER LA COLECCIÓN'},
  plans:{en:'SEE MEMBERSHIPS',es:'VER MEMBRESÍAS'},
  experiences:{en:'EXPLORE EXPERIENCES',es:'VER EXPERIENCIAS'},
  booking:{en:'EXPLORE BOOKING',es:'VER LAS RESERVAS'}
 };
 const order={
  'havana-19':{anchor:'#story',targets:['#tle-demo-sample-prices','#kitchen']},
  'aftr':{anchor:'#tonight',targets:['#offers']},
  'lavender-edit':{anchor:'#ritual',targets:['#gallery']},
  'experience-cleaning':{anchor:'.hero.hero-cleaning-site',targets:['#tle-demo-sample-prices','#experience']},
  'soluna-yoga':{anchor:'#about',targets:['#memberships','#classes']},
  'wok-social':{anchor:'.hero + .ticker',targets:['#tle-demo-sample-prices','#menu']},
  'yummm':{anchor:'.feature-links',targets:['#counter']},
  'jaramillo-boutique':{anchor:'.hero',targets:['#collections']}
 };
 function bringCatalogForward(){
  const plan=order[brand];if(!plan)return;
  let anchor=document.querySelector(plan.anchor);if(!anchor)return;
  for(const selector of plan.targets){
   const section=document.querySelector(selector);
   if(!section||!section.isConnected||section===anchor||section.parentElement!==anchor.parentElement)continue;
   if(section.previousElementSibling!==anchor)anchor.after(section);
   anchor=section;
  }
 }
 const create=(tag,className)=>{const el=document.createElement(tag);el.className=className;return el};
 let installed;
 function footer(){
  const foot=[...document.querySelectorAll('footer')].find(el=>
   !el.matches('.bag-dialog-foot')&&!el.closest('dialog,[role="dialog"],[hidden]')
  );
  if(!foot)return;
  let stage=document.querySelector('.tle-footer-finale[data-tle-owned="true"]');
  if(stage?.nextElementSibling!==foot && stage)foot.before(stage);
  if(!stage){
   stage=create('section','tle-footer-finale');
   stage.dataset.tleOwned='true';
   stage.setAttribute('aria-label','Explore more');
   const frame=create('div','tle-footer-finale__frame');
   const top=create('div','tle-footer-finale__top');
   const kicker=create('p','tle-footer-finale__kicker');kicker.textContent=spec.name;
   const index=create('span','tle-footer-finale__index');index.textContent='THE NEXT LOOK';
   top.append(kicker,index);
   const body=create('div','tle-footer-finale__body');
   const title=create('h2','tle-footer-finale__title');
   const controls=create('div','tle-footer-finale__controls');
   const menu=create('a','tle-footer-finale__link');
   menu.href=spec.menu;
   const back=create('button','tle-footer-finale__return');
   back.type='button';
   back.addEventListener('click',()=>window.scrollTo({top:0,behavior:reduced?.matches?'auto':'smooth'}));
   controls.append(menu,back);
   body.append(title,controls);
   const rule=create('span','tle-footer-finale__rule');
   rule.setAttribute('aria-hidden','true');
   frame.append(top,body,rule);stage.append(frame);
   foot.before(stage);
   stage.dataset.tleReady='true';
   // Elements are readable from initial paint; observer only adds entrance polish.
   if(!reduced?.matches && 'IntersectionObserver' in window){
    const obs=new IntersectionObserver(entries=>{
     if(entries.some(entry=>entry.isIntersecting)){
      stage.classList.add('is-visible');obs.disconnect();
     }
    },{threshold:0.12});
    obs.observe(stage);
   }else stage.classList.add('is-visible');
  }
  const lang=es()?'es':'en';
  stage.querySelector('.tle-footer-finale__title').textContent=spec[lang];
  stage.querySelector('.tle-footer-finale__link').textContent=labels[spec.kind][lang];
  stage.querySelector('.tle-footer-finale__return').textContent=lang==='es'?'VOLVER ARRIBA':'BACK TO TOP';
  stage.querySelector('.tle-footer-finale__index').textContent=lang==='es'?'OTRA MIRADA':'ONE MORE LOOK';
  stage.setAttribute('aria-label',lang==='es'?'Explora de nuevo':'Explore one more time');
  installed=stage;
 }
 function render(){bringCatalogForward();footer()}
 function boot(){
  render();
  // React-based demo views and bilingual switches may recreate the footer.
  let queued=false;
  new MutationObserver(records=>{
   if(queued||!records.some(r=>[...r.addedNodes].some(node=>node.nodeType===1)))return;
   queued=true;
   requestAnimationFrame(()=>{queued=false;render()});
  }).observe(document.body,{subtree:true,childList:true});
  new MutationObserver(()=>render()).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
  reduced?.addEventListener?.('change',event=>{
   if(event.matches&&installed)installed.classList.add('is-visible');
  });
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
 else boot();
})();