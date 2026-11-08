/* SOVA Listening Stories — new campaign photo strip; preserve current hero, products, and gallery. */
(() => {
  'use strict';
  if(document.documentElement.dataset.tleOneMotion !== 'sova') return;
  const photos=[
    ['MUSIC','SOVA_01_MUSIC.png',503,508,'A young man listening with black over-ear headphones'],
    ['RELAX','SOVA_02_RELAX.png',494,508,'A woman enjoying music with ivory over-ear headphones'],
    ['VIBE','SOVA_03_VIBE.png',503,508,'A smiling man wearing black over-ear headphones'],
    ['FOCUS','SOVA_04_FOCUS.png',759,498,'A woman wearing blush-pink over-ear headphones'],
    ['DREAM','SOVA_05_DREAM.png',760,498,'A man with dark headphones absorbed in the sound']
  ];
  const copy={
    en:{kicker:'SOVA / THE LISTENING EDIT',title:'YOUR SOUND.<br>YOUR SPACE.',intro:'Five moods. One feeling: completely in your element.',swipe:'SWIPE TO EXPLORE',view:'Open photo',caption:'Listen your way'},
    es:{kicker:'SOVA / ESCUCHA A TU MANERA',title:'TU SONIDO.<br>TU ESPACIO.',intro:'Cinco formas de sentir la música, a tu manera.',swipe:'DESLIZA PARA EXPLORAR',view:'Ver fotografía',caption:'A tu ritmo'}
  };
  let queued=false;
  function locale(){
    const selected=Array.from(document.querySelectorAll('.language-switch button')).find(b=>b.getAttribute('aria-pressed')==='true');
    const label=selected?.textContent?.trim().toLowerCase();
    if(label==='es'||label==='español') return 'es';
    if(label==='en'||label==='english') return 'en';
    return (document.documentElement.lang||'en').toLowerCase().startsWith('es')?'es':'en';
  }
  function renderCopy(section){
    const c=copy[locale()];
    section.querySelector('.sova-people-kicker').textContent=c.kicker;
    section.querySelector('.sova-people-title').innerHTML=c.title;
    section.querySelector('.sova-people-lead').textContent=c.intro;
    section.querySelector('.sova-people-swipe').textContent=c.swipe;
    section.querySelectorAll('.sova-people-card').forEach((card,index)=>{
      card.setAttribute('aria-label',c.view+' '+photos[index][0]);
      card.querySelector('em').textContent=c.caption;
    });
  }
  function render(){
    const campaign=document.querySelector('#campaign')||document.querySelector('section.campaign');
    if(!campaign)return;
    let section=document.getElementById('sova-moods');
    if(!section){
      section=document.createElement('section');
      section.className='section sova-people';
      section.id='sova-moods';
      section.setAttribute('aria-labelledby','sova-people-title');
      section.innerHTML='<div class="sova-people-head"><div><p class="eyebrow sova-people-kicker"></p><h2 id="sova-people-title" class="sova-people-title"></h2></div><p class="sova-people-lead"></p></div><p class="sova-people-swipe"></p><div class="sova-people-grid"></div>';
      const grid=section.querySelector('.sova-people-grid');
      for(const [name,filename,width,height,alt] of photos){
        const link=document.createElement('a');
        link.className='sova-people-card';
        link.href=new URL('./media/'+filename,document.baseURI).href;
        link.target='_blank';link.rel='noopener noreferrer';
        const frame=document.createElement('span');frame.className='sova-people-image';
        const img=document.createElement('img');
        img.src=link.href;img.alt=alt;img.loading='lazy';img.decoding='async';img.width=width;img.height=height;
        frame.appendChild(img);
        const caption=document.createElement('span');caption.className='sova-people-caption';
        const title=document.createElement('strong');title.textContent=String(grid.children.length+1).padStart(2,'0')+' / '+name;
        const description=document.createElement('em');
        caption.append(title,description);link.append(frame,caption);grid.appendChild(link);
      }
      campaign.before(section);
    }
    renderCopy(section);
  }
  function schedule(){
    if(queued)return;queued=true;
    requestAnimationFrame(()=>{queued=false;render();});
  }
  function start(){
    schedule();
    const root=document.getElementById('app');
    if(root)new MutationObserver(records=>{
      if(records.some(r=>Array.from(r.addedNodes).concat(Array.from(r.removedNodes)).some(n=>
        n.nodeType===1&&(n.matches?.('#campaign,.campaign,#sova-moods')||n.querySelector?.('#campaign,.campaign,#sova-moods')))))schedule();
    }).observe(root,{childList:true,subtree:true});
    document.addEventListener('click',e=>{
      if(e.target.closest?.('.language-switch'))setTimeout(schedule,0);
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
