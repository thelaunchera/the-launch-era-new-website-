/* The Launch Era · Motion Heroes · Progressive cinematic playback.
 * MP4 assets supplied per brand. The approved original stays visible until a valid file loads.
 * No changes to user interaction, checkout, booking, language, or navigation. */
(()=>{'use strict';
const brand=document.documentElement.dataset.tleOneMotion;
const profiles={
 'crumb':{selector:'.hero',mobile:true},
 'casa-brownie':{selector:'.hero-photo'},
 'havana-19':{selector:'.hero',mobile:true},
 'ivory-and-bloom':{selector:'.hero .hero-photo'},
 'aftr':{selector:'.hero-image',mobile:true},
 'lavender-edit':{selector:'.hero-art'},
 'seasonal-brew':{selector:'.hero-media'}
};
const profile=profiles[brand];
if(!profile)return;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const mobile=matchMedia('(max-width: 900px)');
const saveData=navigator.connection?.saveData===true;
const file=new URL('media/hero-motion-20261108.mp4',location.href);
let video,host,observer,checked=false;
const eligible=()=>!saveData&&!document.hidden&&!reduced.matches&&(!profile.mobile||mobile.matches);
const stop=()=>{if(video){video.pause();video.style.opacity='0';}};
function sync(){
 if(!video)return;
 if(!eligible()){stop();return;}
 const rect=host.getBoundingClientRect();
 if(rect.bottom<=-50||rect.top>=innerHeight+50){stop();return;}
 video.play().then(()=>{if(video&&eligible()&&video.readyState>=2)video.style.opacity='1';}).catch(stop);
}
function mount(){
 if(video||!eligible())return;
 const target=document.querySelector(profile.selector);
 if(!target||target.getBoundingClientRect().width<1)return;
 host=target;
 if(getComputedStyle(target).position==='static')target.style.position='relative';
 const v=document.createElement('video');
 v.setAttribute('aria-hidden','true');
 v.setAttribute('playsinline','');
 v.setAttribute('muted','');
 v.setAttribute('loop','');
 v.setAttribute('disableRemotePlayback','');
 v.muted=true;v.defaultMuted=true;v.playsInline=true;v.loop=true;
 v.autoplay=true;v.preload='metadata';v.tabIndex=-1;
 v.disablePictureInPicture=true;
 v.style.cssText='position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center;z-index:1;opacity:0;pointer-events:none;transition:opacity .45s ease;transform:translateZ(0);';
 v.addEventListener('loadeddata',sync,{once:true});
 v.addEventListener('error',()=>{v.remove();video=null;host=null;},{once:true});
 if(brand==='crumb'||brand==='havana-19'){
   const original=target.querySelector(':scope > picture, :scope > img');
   if(original)original.insertAdjacentElement('afterend',v);else target.prepend(v);
   const overlay=target.querySelector('.hero-editorial-content,.hero-content,.hero-copy');
   if(overlay){overlay.style.position='relative';overlay.style.zIndex='3';}
 }else{
   target.appendChild(v);
   for(const el of target.children){if(el!==v&&!el.matches('img,picture,source')){const s=getComputedStyle(el);if(s.position==='static')el.style.position='relative';if(s.zIndex==='auto')el.style.zIndex='2';}}
 }
 v.src=file.href;video=v;
 observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting))sync();else stop();},{rootMargin:'80px'});
 observer.observe(target);
}
async function check(){
 if(checked)return;
 checked=true;
 try{
  const response=await fetch(file.href,{method:'HEAD',cache:'no-store'});
  if(!response.ok||!(response.headers.get('content-type')||'').includes('video/'))return;
  mount();
  if(!video){const mo=new MutationObserver(()=>{mount();if(video)mo.disconnect();});mo.observe(document.body,{childList:true,subtree:true});setTimeout(()=>mo.disconnect(),10000);}
 }catch(_){/* Keep approved original poster */ }
}
function state(){if(eligible()&&!video){checked=false;check();}else sync();}
document.addEventListener('visibilitychange',state);
reduced.addEventListener?.('change',state);
mobile.addEventListener?.('change',state);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',check,{once:true});else check();
})();