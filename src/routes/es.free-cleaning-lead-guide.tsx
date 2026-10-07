import { createFileRoute } from '@tanstack/react-router';
import { FreebiePage } from '@/components/freebie-page';

export const Route=createFileRoute('/es/free-cleaning-lead-guide')({
  head:()=>({meta:[
    {title:'Starter Kit Gratis de Leads | The Launch Era'},
    {name:'description',content:'Starter Kit gratis con guiones de seguimiento, reset de leads en 10 minutos y tracker editable para negocios de limpieza.'},
    {property:'og:title',content:'Starter Kit Gratis de Leads | The Launch Era'},
    {property:'og:description',content:'Guiones de seguimiento, reset de leads en 10 minutos y tracker editable para negocios de limpieza.'},
    {property:'og:type',content:'website'},
    {name:'twitter:card',content:'summary_large_image'}
  ]}),
  component:()=> <FreebiePage language="es"/>,
});
