/* Scroll progress and gallery card arrivals, zero dependencies.
   Photo filtering, modal, multilingual text and parent embed picker remain owned by the page. */
(() => {
  const init = () => {
    const grid = document.getElementById('photo-grid');
    if (!grid) return;
    const bar = document.createElement('div');
    bar.id = 'tle-gallery-progress';
    bar.setAttribute('aria-hidden','true');
    document.body.appendChild(bar);
    let progressPending = false;
    const paintProgress = () => {
      progressPending = false;
      const doc = document.scrollingElement || document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      bar.style.transform = 'scaleX('+(max > 0 ? Math.max(0,Math.min(1,doc.scrollTop/max)) : 0)+')';
    };
    const onScroll = () => {
      if (progressPending) return;
      progressPending = true;
      window.requestAnimationFrame(paintProgress);
    };
    window.addEventListener('scroll',onScroll,{passive:true});
    window.addEventListener('resize',onScroll,{passive:true});
    const noMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!noMotion && 'IntersectionObserver' in window) {
      const cards = new WeakSet();
      const observer = new IntersectionObserver(entries => {
        for (const entry of entries) entry.target.classList.toggle('tle-photo-visible',entry.isIntersecting);
      },{threshold:.07,rootMargin:'0px 0px -18px 0px'});
      const watch = () => {
        for (const card of grid.querySelectorAll('.photo')) {
          if (cards.has(card)) continue;
          cards.add(card);
          observer.observe(card);
        }
        onScroll();
      };
      let watchPending = false;
      const mutation = new MutationObserver(() => {
        if (watchPending) return;
        watchPending = true;
        window.requestAnimationFrame(() => {watchPending = false;watch();});
      });
      mutation.observe(grid,{childList:true,subtree:false});
      watch();
    }
    onScroll();
  };
  if (document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
