import { createFileRoute } from '@tanstack/react-router';
import { FreebiePage } from '@/components/freebie-page';

export const Route=createFileRoute('/es/free-cleaning-lead-guide')({
  head:()=>({meta:[
    {title:'Free Cleaning Lead Tracker Gratis | The Launch Era'},
    {name:'description',content:'Cleaning Lead Tracker gratis con guiones de seguimiento, reset de leads en 10 minutos y Starter Kit práctico para negocios de limpieza.'},
    {property:'og:title',content:'Free Cleaning Lead Tracker Gratis | The Launch Era'},
    {property:'og:description',content:'Cleaning Lead Tracker gratis, guiones de seguimiento y un reset práctico de leads para negocios de limpieza.'},
    {property:'og:type',content:'website'},
    {name:'twitter:card',content:'summary_large_image'}
  ],links:[{rel:'canonical',href:'https://thelaunchera.com/es/free-cleaning-lead-guide'},{rel:'alternate',hrefLang:'en-US',href:'https://thelaunchera.com/free-cleaning-lead-guide'},{rel:'alternate',hrefLang:'es-US',href:'https://thelaunchera.com/es/free-cleaning-lead-guide'},{rel:'alternate',hrefLang:'x-default',href:'https://thelaunchera.com/free-cleaning-lead-guide'}]}),
  component:()=> <FreebiePage language="es"/>,
});
