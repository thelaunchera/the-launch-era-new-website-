import { useEffect, useRef } from 'react';
import { useRouterState } from '@tanstack/react-router';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args:any[])=>void;
    tleTrackEvent?: (name:string,params?:Record<string,unknown>)=>void;
  }
}

function detectedTrafficSource(){
  const qs=new URLSearchParams(location.search);
  const explicit=(qs.get('utm_source')||qs.get('source')||'').trim().toLowerCase();
  if(explicit) return explicit;
  const ref=(document.referrer||'').toLowerCase();
  if(ref.includes('instagram.com')||ref.includes('l.instagram.com')) return 'instagram';
  if(ref.includes('facebook.com')||ref.includes('l.facebook.com')) return 'facebook';
  if(ref.includes('google.')) return 'google';
  try{return (sessionStorage.getItem('tleTrafficSource')||'direct').toLowerCase()}catch{return 'direct'}
}

function currentProduct(pathname=location.pathname){
  if(pathname.includes('free-cleaning-lead-guide')) return 'free_lead_tracker';
  if(pathname.includes('booking-lead-automation')) return 'booking_lead_automation';
  if(pathname.includes('cleaning-web-app')) return 'cleaning_web_app';
  if(pathname.includes('website-automation')) return 'website_automation';
  if(pathname.includes('virtual-assistant')) return 'virtual_assistant';
  return 'main_website';
}

export function Analytics(){
  const pathname=useRouterState({select:(state)=>state.location.pathname});
  const lastTrackedRoute=useRef('');
  useEffect(()=>{
    const host=location.hostname.toLowerCase();
    const enabled=(host==='thelaunchera.com'||host==='www.thelaunchera.com'||host==='thelaunchera.github.io')&&!navigator.webdriver;
    const source=detectedTrafficSource();
    const qs=new URLSearchParams(location.search);
    let campaign=(qs.get('utm_campaign')||'').trim();
    let medium=(qs.get('utm_medium')||'').trim().toLowerCase();
    try{
      if(!campaign) campaign=sessionStorage.getItem('tleTrafficCampaign')||'';
      if(!medium) medium=sessionStorage.getItem('tleTrafficMedium')||'';
      sessionStorage.setItem('tleTrafficSource',source);
      if(campaign) sessionStorage.setItem('tleTrafficCampaign',campaign);
      if(medium) sessionStorage.setItem('tleTrafficMedium',medium);
      if(!sessionStorage.getItem('tleLandingPath')) sessionStorage.setItem('tleLandingPath',location.pathname+location.search);
    }catch{}

    window.tleTrackEvent=(name,params={})=>{
      if(enabled&&window.gtag) window.gtag('event',name,{
        site_surface:'main_website',
        page_path:location.pathname,
        traffic_source:source,
        traffic_medium:medium||undefined,
        traffic_campaign:campaign||undefined,
        ...(name==='checkout_click'||name==='trial_click'||name==='booking_demo_click'?{transport_type:'beacon'}:{}),
        ...params
      });
    };

    const custom=(e:Event)=>{
      const d=(e as CustomEvent<{event?:string;[key:string]:unknown}>).detail||{};
      const {event,...params}=d;
      if(event) window.tleTrackEvent?.(event,params);
    };
    window.addEventListener('tle:analytics',custom as EventListener);

    if(!enabled) return()=>window.removeEventListener('tle:analytics',custom as EventListener);

    const click=(e:MouseEvent)=>{
      const a=(e.target as HTMLElement)?.closest?.('a[href]') as HTMLAnchorElement|null;
      if(!a) return;
      const u=new URL(a.href,location.href);
      const activeSource=detectedTrafficSource();
      const service=a.closest('.service-card')?.querySelector('h3')?.textContent?.trim();

      if(service) window.tleTrackEvent?.('service_select',{
        service_name:service,
        destination:u.pathname,
        product:currentProduct(u.pathname)
      });

      if(a.classList.contains('service-cta')){
        window.tleTrackEvent?.('service_cta_click',{
          product:currentProduct(),
          destination:u.hostname+u.pathname
        });
      }

      if(u.hostname==='app.thelaunchera.com'){
        if(activeSource&&activeSource!=='direct') u.searchParams.set('src',activeSource);
        a.href=u.toString();
        window.tleTrackEvent?.('trial_click',{
          product:'cleaning_web_app',
          destination:u.toString()
        });
      }else if(u.pathname.includes('/service-checkout/')){
        if(activeSource&&activeSource!=='direct') u.searchParams.set('source',activeSource);
        a.href=u.toString();
        window.tleTrackEvent?.('checkout_click',{
          product:currentProduct(),
          offer:u.searchParams.get('offer')||undefined,
          destination:u.pathname
        });
      }else if(u.pathname.includes('/booking-demo')){
        window.tleTrackEvent?.('booking_demo_click',{product:'booking_lead_automation'});
      }else if(u.pathname.includes('/help')||u.hash==='#contacto'){
        window.tleTrackEvent?.('contact_start',{product:currentProduct()});
      }
    };

    document.addEventListener('click',click,true);
    return()=>{
      document.removeEventListener('click',click,true);
      window.removeEventListener('tle:analytics',custom as EventListener);
    };
  },[]);
  useEffect(()=>{
    // Count each actual route visit once, even when a user enters a service directly.
    // A route visited again later in the session is a new visit, not a duplicate.
    const key=pathname.replace(/\/+$/,'')||'/';
    if(lastTrackedRoute.current===key) return;
    lastTrackedRoute.current=key;
    const product=currentProduct(key);
    let referrerHost='direct';
    try{if(document.referrer) referrerHost=new URL(document.referrer).hostname;}catch{}
    window.tleTrackEvent?.('landing_view',{
      landing_path:key,
      product,
      referrer_host:referrerHost
    });
    if(product!=='main_website'&&product!=='free_lead_tracker'){
      window.tleTrackEvent?.('service_view',{
        product,
        language:key.startsWith('/es/')?'es':'en',
        landing_path:key
      });
    }
  },[pathname]);
  return null;
}
