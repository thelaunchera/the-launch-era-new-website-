/* Public Booking Demo chapter only. Desktop keeps GSAP horizontal pinning.
   On phones vertical scroll moves the same photos horizontally through a
   shorter sticky scene. Reduced motion retains accessible native swipe. */
(() => {
 'use strict';
 const section=document.getElementById('bookingBubbleStory');
 const track=document.getElementById('bookingStoryTrack');
 const windowEl=section?.querySelector('.booking-story-window');
 const progress=document.getElementById('bookingStoryProgress');
 const fill=document.getElementById('bookingStoryProgressFill');
 if(!section||!track||!windowEl||!progress||!fill||section.dataset.storyBound)return;
 section.dataset.storyBound='true';
 const cards=[...track.querySelectorAll('[data-booking-story-card]')];
 const hint=document.getElementById('bookingStoryHint');
 const reduce=window.matchMedia('(prefers-reduced-motion: reduce)');
 const short=window.matchMedia('(max-height: 610px) and (orientation: landscape)');
 const mobile=window.matchMedia('(max-width: 760px)');
 let controller=null;
 let destroyed=false;
 let booting=false;
 let mobileActive=false;
 let mobileFrame=0;
 const pinStage=section.querySelector('.booking-story-pin-stage');

 const updateHint=()=>{
  if(!hint)return;
  const es=document.documentElement.lang.toLowerCase().startsWith('es');
  if(mobile.matches)hint.textContent=es?'Desliza para ver cada foto a tu ritmo →':'Swipe through the photos at your own pace →';
  else hint.textContent=es?'Desliza para seguir el recorrido →':'Scroll to follow the booking journey →';
 };
 const updateNativeProgress=()=>{
  if(section.classList.contains('is-gsap-ready')||mobileActive)return;
  const total=Math.max(0,windowEl.scrollWidth-windowEl.clientWidth);
  const percent=total>1?Math.max(0,Math.min(100,Math.round(100*windowEl.scrollLeft/total))):100;
  fill.style.transform='scaleX('+(percent/100)+')';
  progress.setAttribute('aria-valuenow',String(percent));
 };
 const showNative=()=>{
  section.classList.remove('is-gsap-ready');
  track.style.removeProperty('transform');
  updateHint();
  updateNativeProgress();
 };
 windowEl.addEventListener('scroll',updateNativeProgress,{passive:true});

 // On phones the journey is one compact swipe gallery, rather than a long
 // pinned scroll chapter. Each photo waits for an intentional swipe or click.
 const slides=[track.querySelector('.booking-story-intro-panel'),...cards].filter(Boolean);
 const prev=document.getElementById('bookingStoryPrev');
 const next=document.getElementById('bookingStoryNext');
 const count=document.getElementById('bookingStoryCount');
 let navFrame=0;
 let activeSlide=0;
 const closestSlide=()=>{
  const left=windowEl.getBoundingClientRect().left+16;
  let best=0,dist=Infinity;
  slides.forEach((slide,i)=>{
   const d=Math.abs(slide.getBoundingClientRect().left-left);
   if(d<dist){dist=d;best=i;}
  });
  return best;
 };
 const updateNav=()=>{
  if(!mobile.matches||!slides.length)return;
  activeSlide=closestSlide();
  if(count)count.textContent=(activeSlide+1)+' / '+slides.length;
  if(prev)prev.disabled=activeSlide===0;
  if(next)next.disabled=activeSlide===slides.length-1;
 };
 const cancelNav=()=>{
  if(navFrame){cancelAnimationFrame(navFrame);navFrame=0;}
  windowEl.style.removeProperty('scroll-snap-type');
 };
 const goSlide=index=>{
  if(!mobile.matches||!slides.length)return;
  const i=Math.max(0,Math.min(slides.length-1,index));
  const rect=windowEl.getBoundingClientRect();
  const dx=slides[i].getBoundingClientRect().left-rect.left-16;
  const start=windowEl.scrollLeft;
  const max=Math.max(0,windowEl.scrollWidth-windowEl.clientWidth);
  const target=Math.max(0,Math.min(max,start+dx));
  cancelNav();
  if(reduce.matches){windowEl.scrollLeft=target;updateNav();return;}
  windowEl.style.setProperty('scroll-snap-type','none','important');
  const began=performance.now();
  const duration=850;
  const tick=now=>{
   const p=Math.max(0,Math.min(1,(now-began)/duration));
   const eased=1-Math.pow(1-p,3);
   windowEl.scrollLeft=start+(target-start)*eased;
   if(p<1){navFrame=requestAnimationFrame(tick);}
   else{navFrame=0;windowEl.style.removeProperty('scroll-snap-type');updateNav();}
  };
  navFrame=requestAnimationFrame(tick);
 };
 prev?.addEventListener('click',()=>goSlide(closestSlide()-1));
 next?.addEventListener('click',()=>goSlide(closestSlide()+1));
 windowEl.addEventListener('touchstart',cancelNav,{passive:true});
 windowEl.addEventListener('pointerdown',cancelNav,{passive:true});
 windowEl.addEventListener('scroll',updateNav,{passive:true});
 window.addEventListener('resize',updateNav,{passive:true});

 // Calculate horizontal translation from the REAL card track width. The last
 // card must still occupy the stage when vertical progress reaches 100%.
 const renderMobile=()=>{
  mobileFrame=0;
  if(!mobileActive||destroyed)return;
  const travel=Math.max(1,section.offsetHeight-pinStage.clientHeight);
  const fraction=Math.max(0,Math.min(1,-section.getBoundingClientRect().top/travel));
  const maxX=Math.max(0,track.scrollWidth-windowEl.clientWidth);
  const x=maxX*fraction;
  track.style.transform='translate3d('+-x+'px,0,0)';
  fill.style.transform='scaleX('+fraction+')';
  progress.setAttribute('aria-valuenow',String(Math.round(fraction*100)));
  cards.forEach(card=>{
   const art=card.querySelector('.booking-story-card-art');
   if(!art)return;
   const r=card.getBoundingClientRect();
   const dx=Math.min(1,Math.abs((r.left+r.right)*.5-windowEl.clientWidth*.5)/windowEl.clientWidth);
   const prominence=1-dx;
   art.style.transform='scale('+(0.93+0.07*prominence)+')';
   art.style.opacity=String(0.82+0.18*prominence);
  });
 };
 const scheduleMobile=()=>{
  if(mobileActive&&!mobileFrame)mobileFrame=requestAnimationFrame(renderMobile);
 };
 const enableMobile=()=>{
  if(mobileActive||!pinStage)return;
  mobileActive=true;
  section.classList.add('is-mobile-scroll-story');
  windowEl.scrollLeft=0;
  updateHint();
  renderMobile();
 };
 const disableMobile=()=>{
  if(!mobileActive)return;
  mobileActive=false;
  if(mobileFrame){cancelAnimationFrame(mobileFrame);mobileFrame=0;}
  section.classList.remove('is-mobile-scroll-story');
  track.style.removeProperty('transform');
  cards.forEach(card=>{
   const art=card.querySelector('.booking-story-card-art');
   art?.style.removeProperty('transform');
   art?.style.removeProperty('opacity');
  });
  showNative();
 };
 window.addEventListener('scroll',scheduleMobile,{passive:true});
 window.addEventListener('resize',scheduleMobile,{passive:true});

 const addScript=(src,ready)=>{
  if(ready())return Promise.resolve();
  return new Promise((resolve,reject)=>{
   const script=document.createElement('script');
   script.src=src;script.async=true;script.dataset.tleStoryVendor='true';
   script.addEventListener('load',()=>ready()?resolve():reject(new Error('GSAP export missing')),{once:true});
   script.addEventListener('error',()=>reject(new Error('GSAP vendor unavailable')),{once:true});
   document.head.appendChild(script);
  });
 };
 const init=async()=>{
  if(destroyed)return;
  showNative();
  // Mobile uses a compact CSS-sticky stage controlled by vertical scrolling,
  // preserving the original cinematic direction without a long GSAP spacer.
  if(mobile.matches){showNative();return;}
  if(reduce.matches||short.matches||mobile.matches||controller||booting)return;
  booting=true;
  try{
   await addScript('/assets/vendor/gsap-3.14.2.min.js',()=>!!window.gsap);
   await addScript('/assets/vendor/ScrollTrigger-3.14.2.min.js',()=>!!window.ScrollTrigger);
   if(destroyed||reduce.matches||short.matches||mobile.matches)return;
   const gsap=window.gsap,ScrollTrigger=window.ScrollTrigger;
   gsap.registerPlugin(ScrollTrigger);
   const mm=gsap.matchMedia();
   controller=mm;
   mm.add('(min-width: 761px) and (min-height: 611px) and (prefers-reduced-motion: no-preference)',()=>{
    const ctx=gsap.context(()=>{
     section.classList.add('is-gsap-ready');
     const width=()=>Math.max(1,track.scrollWidth-section.clientWidth);
     gsap.set(fill,{scaleX:0});
     const h=gsap.to(track,{
      x:()=>-width(),
      ease:'none',
      scrollTrigger:{
       id:'booking-demo-horizontal-journey',
       trigger:section,start:'top top',end:()=>'+='+width(),
       pin:true,scrub:0.6,invalidateOnRefresh:true,anticipatePin:1,
       onUpdate:self=>{
        gsap.set(fill,{scaleX:self.progress});
        progress.setAttribute('aria-valuenow',String(Math.round(self.progress*100)));
       }
      }
     });
     cards.forEach(card=>{
      const art=card.querySelector('.booking-story-card-art');
      const number=card.querySelector('.story-step-outline');
      if(art)gsap.fromTo(art,{scale:.78,opacity:.35},{
       scale:1,opacity:1,ease:'none',
       scrollTrigger:{
        trigger:card,containerAnimation:h,
        start:'left 92%',end:'left 46%',scrub:true
       }
      });
      if(number)gsap.fromTo(number,{xPercent:70},{
       xPercent:-30,ease:'none',
       scrollTrigger:{
        trigger:card,containerAnimation:h,
        start:'left right',end:'right left',scrub:true
       }
      });
     });
    },section);
    ScrollTrigger.refresh();
    return ()=>{ctx.revert();showNative()};
   });
  }catch(e){
   // Photo browsing and the sample booking form still work offline/without GSAP.
   showNative();
  }finally{booting=false;}
 };
 const onViewportChange=()=>{
  if(destroyed)return;
  if(mobile.matches){
   if(controller){controller.revert();controller=null;}
   disableMobile();
   showNative();
  }else{
   disableMobile();
   if(reduce.matches||short.matches){
    if(controller){controller.revert();controller=null;}
    showNative();
   }else if(!controller&&!booting){
    init();
   }
  }
 };
 reduce.addEventListener?.('change',onViewportChange);
 short.addEventListener?.('change',onViewportChange);
 mobile.addEventListener?.('change',onViewportChange);
 const dispose=()=>{
  cancelNav();
  window.removeEventListener('resize',updateNav);
  destroyed=true;
  controller?.revert();
  disableMobile();
  showNative();
  windowEl.removeEventListener('scroll',updateNativeProgress);
  window.removeEventListener('scroll',scheduleMobile);
  window.removeEventListener('resize',scheduleMobile);
  reduce.removeEventListener?.('change',onViewportChange);
  short.removeEventListener?.('change',onViewportChange);
  mobile.removeEventListener?.('change',onViewportChange);
 };
 window.addEventListener('pagehide',dispose,{once:true});
 init();
 updateNav();
})();


/* TLE BUBBLE DRIFT V1 — independent canvas backdrop for the private Booking
   Demo story and real three-step form; no form/OTP/GSAP code is changed. */
(() => {
 'use strict';
 if(!document.getElementById('tleDemoCurtainPage'))return;
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
 const areas=[
  {root:document.getElementById('bookingBubbleStory'),count:72,dark:true},
  {root:document.getElementById('bookingPage'),count:60,dark:false}
 ];
 for(const area of areas){
  const host=area.root;
  if(!host||host.querySelector(':scope > .tle-depth-bubble-canvas'))continue;
  const canvas=document.createElement('canvas');
  canvas.className='tle-depth-bubble-canvas';
  canvas.setAttribute('aria-hidden','true');
  canvas.setAttribute('role','presentation');
  const ctx=canvas.getContext('2d',{alpha:true});
  if(!ctx)continue;
  host.insertBefore(canvas,host.firstChild);
  host.classList.add('has-depth-bubble-canvas');
  let w=0,h=0,ratio=1,frame=0,last=0,visible=false,alive=true;
  let particles=[];
  const rand=(min,max)=>min+Math.random()*(max-min);
  const make=(fromBottom=false)=>({
   x:rand(0,w),
   y:fromBottom?h+rand(4,25):rand(0,h),
   z:Math.random(),
   phase:rand(0,Math.PI*2),
   time:rand(0,Math.PI*2)
  });
  const paint=()=>{
   ctx.clearRect(0,0,w,h);
   for(const bubble of particles){
    const z=bubble.z,rad=2.4+z*8.3;
    const alpha=(.17+z*.40)*(area.dark?1:.68);
    const x=bubble.x+Math.sin(bubble.time+bubble.phase)*(1.2+z*4.1);
    const y=bubble.y;
    if(x+rad<0||x-rad>w||y+rad<0||y-rad>h)continue;
    ctx.beginPath();
    ctx.arc(x,y,rad,0,Math.PI*2);
    ctx.fillStyle=area.dark?'rgba(208,240,255,'+(alpha*.17)+')':'rgba(60,122,169,'+(alpha*.10)+')';
    ctx.fill();
    ctx.strokeStyle=area.dark?'rgba(226,246,255,'+alpha+')':'rgba(43,107,151,'+alpha+')';
    ctx.lineWidth=Math.max(.8,Math.min(1.3,rad*.14));
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x-rad*.26,y-rad*.24,Math.max(.5,rad*.33),3.46,4.96);
    ctx.strokeStyle=area.dark?'rgba(255,255,255,'+(alpha*.80)+')':'rgba(255,255,255,'+(alpha*.9)+')';
    ctx.lineWidth=Math.max(.65,rad*.11);
    ctx.stroke();
   }
  };
  const size=()=>{
   if(!alive)return;
   const width=Math.round(host.clientWidth),height=Math.round(host.clientHeight);
   if(width<1||height<1)return;
   const oldW=w,oldH=h;
   w=width;h=height;
   ratio=Math.min(2,window.devicePixelRatio||1);
   canvas.width=Math.round(w*ratio);
   canvas.height=Math.round(h*ratio);
   ctx.setTransform(ratio,0,0,ratio,0,0);
   if(particles.length){
    for(const b of particles){b.x*=w/Math.max(oldW,1);b.y*=h/Math.max(oldH,1);}
   }else{
    const count=window.innerWidth<=600?Math.round(area.count*.65):area.count;
    particles=Array.from({length:count},()=>make());
   }
   paint();
  };
  const cancel=()=>{if(frame){cancelAnimationFrame(frame);frame=0;}last=0;};
  const allowed=()=>alive&&visible&&!document.hidden&&!reduced.matches&&w>0&&h>0;
  const tick=now=>{
   frame=0;
   if(!allowed())return;
   const dt=last?Math.min((now-last)/1000,.05):0;
   last=now;
   for(const p of particles){
    p.y-=(6+p.z*17)*dt;
    p.time+=dt*(.35+p.z*.7);
    if(p.y<-(3+p.z*10))Object.assign(p,make(true));
   }
   paint();
   frame=requestAnimationFrame(tick);
  };
  const sync=()=>{
   if(!allowed()){cancel();if(reduced.matches)paint();return;}
   if(!frame)frame=requestAnimationFrame(tick);
  };
  size();
  const observer=typeof IntersectionObserver==='function'
   ?new IntersectionObserver(entries=>{visible=!!entries[0]?.isIntersecting;sync();},{threshold:0})
   :null;
  if(observer)observer.observe(host);else visible=true;
  const resize=typeof ResizeObserver==='function'?new ResizeObserver(()=>{size();sync();}):null;
  if(resize)resize.observe(host);
  window.addEventListener('resize',size,{passive:true});
  document.addEventListener('visibilitychange',sync);
  reduced.addEventListener?.('change',sync);
  window.addEventListener('pagehide',()=>{
   alive=false;cancel();resize?.disconnect();observer?.disconnect();
   document.removeEventListener('visibilitychange',sync);
   window.removeEventListener('resize',size);
   reduced.removeEventListener?.('change',sync);
  },{once:true});
  sync();
 }
})();
