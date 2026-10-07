import { createFileRoute } from '@tanstack/react-router';
import { FreebiePage } from '@/components/freebie-page';

export const Route=createFileRoute('/free-cleaning-lead-guide')({
  head:()=>({meta:[
    {title:'Free Cleaning Lead Tracker | The Launch Era'},
    {name:'description',content:'Get the free Cleaning Lead Tracker, follow-up scripts, a 10-minute lead reset and a practical Starter Kit for cleaning business owners.'},
    {property:'og:title',content:'Free Cleaning Lead-to-Booking Starter Kit | The Launch Era'},
    {property:'og:description',content:'Free Cleaning Lead Tracker, follow-up scripts and a practical lead reset for cleaning business owners.'},
    {property:'og:type',content:'website'},
    {name:'twitter:card',content:'summary_large_image'}
  ],links:[{rel:'canonical',href:'https://thelaunchera.com/free-cleaning-lead-guide'},{rel:'alternate',hrefLang:'en-US',href:'https://thelaunchera.com/free-cleaning-lead-guide'},{rel:'alternate',hrefLang:'es-US',href:'https://thelaunchera.com/es/free-cleaning-lead-guide'},{rel:'alternate',hrefLang:'x-default',href:'https://thelaunchera.com/free-cleaning-lead-guide'}]}),
  component:()=> <FreebiePage language="en"/>,
});
