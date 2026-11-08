/* Golden Grid / accessible human moments lightbox; preserves original nine-image gallery */
(() => {
  const ready = () => {
    const modal = document.getElementById('gg-human-lightbox');
    const cards = [...document.querySelectorAll('#gg-human-moments [data-gg-human]')];
    if(!modal || cards.length !== 3) return;
    const image = modal.querySelector('[data-gg-human-large]');
    const count = modal.querySelector('[data-gg-human-count]');
    const pictures = cards.map(card => card.querySelector('img'));
    let current=0, touchX=null;
    const show = index => {
      current = (index+pictures.length)%pictures.length;
      image.src = pictures[current].getAttribute('src');
      image.alt = pictures[current].alt;
      count.textContent = String(current+1).padStart(2,'0') + ' / 03';
    };
    cards.forEach((card,index) => card.addEventListener('click',() => {
      show(index); if(!modal.open) modal.showModal();
    }));
    modal.querySelector('[data-gg-human-close]').addEventListener('click',() => modal.close());
    modal.querySelector('[data-gg-human-prev]').addEventListener('click',() => show(current-1));
    modal.querySelector('[data-gg-human-next]').addEventListener('click',() => show(current+1));
    modal.addEventListener('click',event=>{
      if(event.target!==modal)return;
      const b=modal.getBoundingClientRect();
      if(event.clientX<b.left||event.clientX>b.right||event.clientY<b.top||event.clientY>b.bottom)modal.close();
    });
    modal.addEventListener('keydown',event=>{
      if(event.key==='ArrowLeft'){event.stopPropagation();event.preventDefault();show(current-1);}
      if(event.key==='ArrowRight'){event.stopPropagation();event.preventDefault();show(current+1);}
    });
    image.addEventListener('touchstart',event=>{touchX=event.touches[0]?.clientX??null;},{passive:true});
    image.addEventListener('touchend',event=>{
      if(touchX===null)return;
      const delta=(event.changedTouches[0]?.clientX??touchX)-touchX;touchX=null;
      if(Math.abs(delta)>60)show(current+(delta<0?1:-1));
    },{passive:true});
    modal.addEventListener('close',()=>{image.removeAttribute('src');});
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready,{once:true});
  else ready();
})();
