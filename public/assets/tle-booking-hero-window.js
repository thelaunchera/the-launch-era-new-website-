/* Scoped only to public, unkeyed /booking-demo-reset.html.
 * No booking writes, fake verified reviews or new Sonny endpoints.
 */
(() => {
  'use strict';
  const hero=document.getElementById('tleBookingHero');
  if(!hero)return;
  if(location.search.includes('owner_preview=1')||new URLSearchParams(location.search).has('key'))return;
  const stage=hero.querySelector('.tle-window-stage');
  const front=hero.querySelector('.tle-window-front');
  const lens=document.getElementById('tleWindowEnter');
  const button=document.getElementById('tleWindowContinue');
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)');
  const limited=window.matchMedia('(pointer:coarse)');
  let requested=false,lastP=-1;
  const clamp=x=>Math.min(1,Math.max(0,x));
  function render(){
    requested=false;
    if(reduce.matches){
      hero.classList.add('reduced','is-complete');
      hero.style.setProperty('--hero-progress','1');
      hero.style.setProperty('--hero-caption','1');
      hero.style.setProperty('--hero-front-opacity','0');
      return;
    }
    hero.classList.remove('reduced');
    const distance=Math.max(1,hero.offsetHeight-stage.clientHeight);
    const rect=hero.getBoundingClientRect();
    const p=clamp((-rect.top)/distance);
    if(Math.abs(p-lastP)<.002)return;
    lastP=p;
    // Centered lens: scale from 1 to viewport-width / lens-width, capped to
    // prevent pathological zoom on very narrow screens.
    const target=Math.min(limited.matches?3.1:4,stage.clientWidth/Math.max(1,lens.offsetWidth));
    const t=clamp((p-.05)/.78);
    const smooth=t*t*(3-2*t);
    const scale=1+(target-1)*smooth;
    const fade=1-clamp((p-.70)/.16);
    const caption=clamp((p-.72)/.18);
    hero.style.setProperty('--hero-zoom',scale.toFixed(4));
    hero.style.setProperty('--hero-progress',p.toFixed(4));
    hero.style.setProperty('--hero-front-opacity',fade.toFixed(3));
    hero.style.setProperty('--hero-caption',caption.toFixed(3));
    const complete=p>.85;
    hero.classList.toggle('is-complete',complete);
    // Avoid a sticky, invisible front layer blocking final calls to action.
    front.style.pointerEvents=complete?'none':'none';
  }
  function request(){
    if(requested)return;
    requested=true;
    requestAnimationFrame(render);
  }
  function advance(){
    if(reduce.matches){
      button?.focus({preventScroll:true});
      document.getElementById('bookingPage')?.scrollIntoView({behavior:'auto'});
      return;
    }
    const pageEnd=window.scrollY+hero.getBoundingClientRect().top+Math.max(0,hero.offsetHeight-stage.clientHeight);
    window.scrollTo({top:pageEnd,behavior:'smooth'});
  }
  lens.addEventListener('click',advance);
  window.addEventListener('scroll',request,{passive:true});
  window.addEventListener('resize',()=>{lastP=-1;request();},{passive:true});
  reduce.addEventListener?.('change',()=>{lastP=-1;request()});
  request();

  const labels={
    en:{ey:'A BETTER WAY TO BOOK',heading:'Make booking',old:'decent',new:'remarkable',
      intro:'A beautiful first impression. Easy service choices. A cleaner way to request a visit.',
      enter:'Step inside the demo',cta:'Explore cleaning services',hint:'Scroll or tap to explore',
      reviewsEy:'CUSTOMER REVIEWS',reviewsHead:'The space for your customers’ words.',
      reviewsIntro:'These are layout examples—not real customer reviews. Replace them only with authentic, approved feedback.',
      badge:'SAMPLE REVIEW',review1:'An approved customer review will appear here.',
      review2:'A second genuine review can highlight the experience.',
      review3:'Add another verified customer comment with permission.',
      samples:'EXAMPLE · NOT A VERIFIED REVIEW',
      baEy:'BEFORE & AFTER',baHead:'See the difference in the details.',
      baIntro:'The same three comparison examples used in the earlier demo, without an auto-playing gallery.',
      baNote:'Illustrative demo-library photos. These are not verified transformations by this business.',
      before:'Before',after:'After',bed:'Bedroom refresh',track:'Window track detail',grout:'Shower tile & grout'},
    es:{ey:'UNA FORMA MÁS FÁCIL DE RESERVAR',heading:'Haz que reservar sea',old:'normal',new:'extraordinario',
      intro:'Una primera impresión bonita, servicios claros y una forma sencilla de solicitar tu limpieza.',
      enter:'Entra al demo',cta:'Explorar servicios de limpieza',hint:'Desliza o toca para explorar',
      reviewsEy:'RESEÑAS DE CLIENTES',reviewsHead:'Un espacio para las opiniones de tus clientes.',
      reviewsIntro:'Estas tarjetas son ejemplos de diseño, no reseñas reales. Sustituir solo por opiniones auténticas y autorizadas.',
      badge:'RESEÑA DE EJEMPLO',review1:'Aquí aparecerá una reseña aprobada de un cliente.',
      review2:'Una segunda reseña auténtica puede describir la experiencia.',
      review3:'Añade otro comentario verificado, con autorización.',
      samples:'EJEMPLO · NO ES UNA RESEÑA VERIFICADA',
      baEy:'ANTES Y DESPUÉS',baHead:'La diferencia está en los detalles.',
      baIntro:'Los mismos tres ejemplos comparativos del demo anterior, sin galería automática.',
      baNote:'Fotos ilustrativas de la biblioteca. No son trabajos verificados de este negocio.',
      before:'Antes',after:'Después',bed:'Habitación renovada',track:'Rieles de ventanas',grout:'Juntas de ducha'}
  };
  function updateCopy(){
    const copy=labels[document.getElementById('language')?.value==='es'?'es':'en'];
    for(const [key,value] of Object.entries(copy)){
      document.querySelectorAll('[data-hero-i18n="'+key+'"]').forEach(node=>node.textContent=value);
    }
    document.getElementById('tleBookingHeadline')?.setAttribute('aria-label',copy.heading+' '+copy.new+'.');
    document.getElementById('tleWindowEnter')?.setAttribute('aria-label',copy.enter);
  }
  document.getElementById('language')?.addEventListener('change',updateCopy);
  updateCopy();

  const compareCards=[...document.querySelectorAll('.tle-compare-card')];
  compareCards.forEach(card=>{
    const before=card.querySelector('img[data-before]');
    const after=card.querySelector('img[data-after]');
    const slider=card.querySelector('input[type="range"]');
    if(!before||!after||!slider)return;
    let failures=0;
    const check=()=>{failures++;if(failures)card.hidden=true};
    // Only real matched before/after pairs from the original demo library.
    // Missing source -> hide the affected pair, never show a fake image.
    before.src=before.dataset.before;
    after.src=after.dataset.after;
    before.addEventListener('error',check,{once:true});
    after.addEventListener('error',check,{once:true});
    slider.addEventListener('input',()=>card.style.setProperty('--split',slider.value+'%'));
  });
  // If paired sample images failed to build, hide only the unavailable card.
  // Never substitute random unrelated before/after imagery.
})();
