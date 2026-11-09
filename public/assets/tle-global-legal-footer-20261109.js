/* The Launch Era — unified legal navigation. Additive only: preserves each brand's original footer. */
(()=>{'use strict';
 if(window.__tleUnifiedLegalFooter)return;window.__tleUnifiedLegalFooter=true;
 const local=()=>document.documentElement.lang?.toLowerCase().startsWith('es')||location.pathname.startsWith('/es/');
 const policies=es=>es?[
  ['/es/privacy.html','Privacidad'],['/es/terms.html','Términos'],['/es/refunds.html','Reembolsos'],['/es/cookies.html','Cookies'],['/es/privacy-choices.html','Tus datos']
 ]:[
  ['/privacy.html','Privacy'],['/terms.html','Terms'],['/refunds.html','Refunds'],['/cookies.html','Cookies'],['/privacy-choices.html','Your data']
 ];
 const css=`#tle-global-legal-nav{box-sizing:border-box;clear:both;position:relative;z-index:2;margin:18px auto 0;padding:15px 18px max(17px,env(safe-area-inset-bottom,17px));max-width:100%;border-top:1px solid currentColor;color:inherit;font:400 12px/1.6 system-ui,-apple-system,sans-serif;letter-spacing:normal;text-transform:none;text-align:center;opacity:.9}#tle-global-legal-nav *,#tle-global-legal-nav *:before{box-sizing:border-box}#tle-global-legal-nav .tle-legal-links{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:5px 13px;margin:0 auto 8px;max-width:940px}#tle-global-legal-nav a{display:inline-flex;align-items:center;min-height:37px;padding:4px 3px;color:inherit!important;text-decoration:underline;text-underline-offset:3px;white-space:normal;font:inherit;opacity:1}#tle-global-legal-nav a:focus-visible{outline:2px solid currentColor;outline-offset:2px;border-radius:4px}#tle-global-legal-nav .tle-legal-powered{font-size:11px;margin:0;line-height:1.6}#tle-global-legal-nav .tle-demo-disclosure{font-size:11px;margin:0 auto 8px;max-width:740px;line-height:1.55}#tle-global-legal-nav:not(.in-branded-footer){background:#FAF8F3;color:#191919;border-top-color:#d8d2c6}#tle-global-legal-nav.in-branded-footer{border-top-color:color-mix(in srgb,currentColor 20%,transparent)}@media(max-width:480px){#tle-global-legal-nav{padding:16px 12px max(18px,env(safe-area-inset-bottom,18px))}#tle-global-legal-nav .tle-legal-links{gap:2px 10px}#tle-global-legal-nav a{min-height:43px;font-size:12px}}`;
 function install(){
  if(!document.body||document.querySelector('#tle-global-legal-nav'))return;
  const es=local(),p=policies(es),path=location.pathname,links=p.map(([href,label])=>({href,label}));
  const existing=[...document.querySelectorAll('footer')].find(f=>f.id==='public-policy-links'||f.querySelector('.library-footer-legal'));
  if(existing){const hrefs=[...existing.querySelectorAll('a[href]')].map(a=>a.getAttribute('href'));if(p.every(([href])=>hrefs.includes(href)))return;}
  let footer=[...document.querySelectorAll('footer')].filter(f=>!f.closest('dialog,[hidden],template')).pop();
  if(footer&&footer.closest('#app,#root,#studio-root,[role="application"]'))footer=null;
  let host=footer;
  if(!host){host=document.createElement('footer');host.setAttribute('aria-label',es?'Avisos legales de The Launch Era':'The Launch Era legal information');document.body.append(host)}
  const bar=document.createElement('div');bar.id='tle-global-legal-nav';if(footer)bar.classList.add('in-branded-footer');
  const nav=document.createElement('nav');nav.className='tle-legal-links';nav.setAttribute('aria-label',es?'Políticas y privacidad':'Legal and privacy policies');
  for(const {href,label} of links){const a=document.createElement('a');a.href=href;a.textContent=label;nav.append(a)}
  if(/^\/demos\/[^/]+\/?.*$/.test(path)&&!/^\/demos\/(?:owner-center|photo-gallery)\//.test(path)){
   const intro=document.createElement('p');intro.className='tle-demo-disclosure';intro.textContent=es?'Concepto de demostración. Los pedidos y reservas de muestra no son transacciones reales.':'Concept demonstration. Sample orders and bookings are not real transactions.';bar.append(intro)
  }
  bar.append(nav);
  const credit=document.createElement('p');credit.className='tle-legal-powered';
  const year=String(new Date().getFullYear());const copy=document.createTextNode('© '+year+' The Launch Era · ');
  const a=document.createElement('a');a.href='https://thelaunchera.com/';a.textContent='Powered by The Launch Era';credit.append(copy,a);bar.append(credit);
  host.append(bar);
  if(!document.getElementById('tle-global-legal-footer-style')){const style=document.createElement('style');style.id='tle-global-legal-footer-style';style.textContent=css;document.head.append(style)}
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();