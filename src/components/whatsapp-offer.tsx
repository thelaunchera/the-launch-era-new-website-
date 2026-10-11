import { useEffect, useState } from 'react';

// Offer runs through November 30, 2026, Eastern Time. No checkout is enabled until production QA.
const OFFER_END=Date.parse('2026-12-01T05:00:00Z');
export const WHATSAPP_MONTHLY_USD=14.99;
export function WhatsAppOfferPrice({lang='en'}:{lang?:'en'|'es'}) {
 const es=lang==='es';
 const [onSale,setOnSale]=useState(true);
 useEffect(()=>{
  const sync=()=>setOnSale(Date.now()<OFFER_END);
  sync();
  const interval=window.setInterval(sync,60000);
  return()=>window.clearInterval(interval);
 },[]);
 return <div className="booking-offer-line service-discount-offer" aria-label={es?'Oferta de instalación de WhatsApp AI Agent':'WhatsApp AI Agent setup offer'}>
  {onSale&&<span className="booking-offer-tag">{es?'OFERTA HASTA NOV. 30':'OFFER ENDS NOV 30'}</span>}
  <span className="booking-offer-price service-price-pill">
   {onSale&&<del>$78</del>}<strong>{onSale?'$48':'$78'}</strong>
  </span>
  <span style={{fontSize:11,fontWeight:700,color:'#486780',lineHeight:1.4}}>{es?'instalación · después $14.99/mes':'setup · then $14.99/mo'}</span>
 </div>;
}
