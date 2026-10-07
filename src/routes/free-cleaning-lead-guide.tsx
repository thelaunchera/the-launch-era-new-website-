import { createFileRoute } from '@tanstack/react-router';
import { FreebiePage } from '@/components/freebie-page';

export const Route=createFileRoute('/free-cleaning-lead-guide')({
  head:()=>({meta:[
    {title:'Free Cleaning Lead-to-Booking Starter Kit | The Launch Era'},
    {name:'description',content:'Free Lead-to-Booking Starter Kit with follow-up scripts, a 10-minute lead reset and an editable tracker for cleaning business owners.'}
  ]}),
  component:()=> <FreebiePage language="en"/>,
});
