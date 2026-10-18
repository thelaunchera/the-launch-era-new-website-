/* TLE private Booking Demo enhancement. No data writes, auth bypass or payments.
   PRIVATE TEMPLATE integration only; do not include on public demo request/gate. */
(()=>{'use strict';
const mount=()=>{
const owner=document.getElementById('ownerView'),customer=document.getElementById('customerView');
const booking=document.getElementById('try'),closing=document.querySelector('section.closing');
if(!owner||!customer||!booking||!closing||document.getElementById('tle-conversion-story'))return;
const product='https://thelaunchera.com/booking-lead-automation';
const oldSale=closing.querySelector('.buttons button[data-modal]');
if(oldSale){
 const a=document.createElement('a');a.href=product;a.className=oldSale.className;
 a.textContent='Get this setup for my business ↗';a.setAttribute('aria-label','Explore Booking Automation setup and pricing');
 oldSale.replaceWith(a);
}
const tryButton=document.querySelector('.premium-buttons a[href="#try"]');
if(tryButton)tryButton.addEventListener('click',e=>{
 e.preventDefault();e.stopImmediatePropagation();
 const tab=document.getElementById('customerTab');
 if(tab&&tab.getAttribute('aria-selected')!=='true')tab.click();
 booking.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});
},true);
const section=document.createElement('section');section.id='tle-conversion-story';
section.className='tle-conversion-story';section.setAttribute('aria-label','Cleaning photography and personalized booking preview');
section.innerHTML=[
'<div class="tle-conversion-inner">',
'<div class="tle-conversion-heading"><span class="tle-conversion-kicker">REAL CLEANING PHOTOGRAPHY · SAMPLE LIBRARY</span>',
'<h2>Show the care behind <em>every clean.</em></h2>',
'<p>Let customers see the quality of your work. These library photos show what a personalized cleaning page can look like.</p></div>',
'<div class="tle-conversion-grid"><div class="tle-photo-pair" id="tle-photo-pair">',
'<div class="tle-compare-images">',
'<img class="tle-compare-before" src="/assets/demo-transformations/grout-before.webp" loading="lazy" alt="Bathroom grout before cleaning">',
'<img class="tle-compare-after" src="/assets/demo-transformations/grout-after.webp" loading="lazy" alt="The same bathroom grout after cleaning">',
'<span class="tle-compare-label tle-label-before">Before</span><span class="tle-compare-label tle-label-after">After</span>',
'<span class="tle-compare-handle" aria-hidden="true">↔</span></div>',
'<label for="tle-compare-range">Drag to reveal the transformation</label>',
'<input id="tle-compare-range" type="range" min="0" max="100" value="52" aria-label="Reveal before-and-after cleaning">',
'<small>Illustrative photos from our library — not verified client results.</small></div>',
'<div class="tle-photo-stories">',
'<article><img src="/assets/demo-services/regular.webp" loading="lazy" alt="Residential cleaner vacuuming a living room"><span>RESIDENTIAL CLEANING</span></article>',
'<article><img src="/assets/demo-services/office.webp" loading="lazy" alt="Commercial cleaning team at work"><span>COMMERCIAL CLEANING</span></article>',
'</div></div>',
'<div class="tle-brand-peek"><div><span class="tle-conversion-kicker">PICTURE IT AS YOURS</span>',
'<h3>Imagine your business on this page.</h3>',
'<p>Your finished booking page uses your own photos, colors and brand.</p></div>',
'<div class="tle-peek-form"><label for="tle-business-name">Your cleaning business</label>',
'<input id="tle-business-name" type="text" maxlength="56" autocomplete="off" placeholder="Your Cleaning Co.">',
'<div class="tle-brand-card"><span>Booking experience for</span><strong id="tle-business-output">Your Cleaning Co.</strong>',
'<small>BOOK · QUOTE · FOLLOW UP</small></div><small>For this preview only. Nothing is submitted or stored.</small></div></div>',
'<div class="tle-conversion-close"><div><span class="tle-conversion-kicker">READY TO MAKE THIS YOURS?</span>',
'<h3>Stop chasing the details. Start with a system.</h3>',
'<p>See exactly what is included and take the next step for your business.</p></div>',
'<a class="tle-conversion-action" href="'+product+'">Get this setup for my business ↗</a></div></div>'
].join('');
closing.before(section);
const pair=section.querySelector('#tle-photo-pair');
const slider=section.querySelector('#tle-compare-range');
slider.addEventListener('input',()=>pair.style.setProperty('--compare-position',slider.value+'%'));
const photos=[pair.querySelector('.tle-compare-before'),pair.querySelector('.tle-compare-after')];
const fail=()=>{if(photos.some(img=>img.complete&&img.naturalWidth===0))pair.hidden=true;};
photos.forEach(img=>img.addEventListener('error',fail,{once:true}));fail();
const name=section.querySelector('#tle-business-name'),out=section.querySelector('#tle-business-output');
name.addEventListener('input',()=>{out.textContent=name.value.trim().slice(0,56)||'Your Cleaning Co.';});
const success=document.getElementById('bookSuccess');
if(success&&!success.querySelector('.tle-success-cta')){
 const a=document.createElement('a');a.className='tle-success-cta';a.href=product;
 a.textContent='Make this my booking system ↗';success.append(a);
}
};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();