import { createFileRoute } from '@tanstack/react-router';
import { OfficialHome } from '@/components/official-home';
export const Route=createFileRoute('/es/')({
 head:()=>({
  meta:[
   {title:"Websites y automatizaciones para negocios | The Launch Era"},
   {name:'description',content:"Diseñamos websites para cualquier negocio. Website desde $15 o Website + Asistente IA + CRM por $25 de configuración y $8 al mes."},
   {name:'robots',content:'index,follow,max-image-preview:large'},
   {property:'og:title',content:"Websites y automatizaciones para negocios | The Launch Era"},
   {property:'og:description',content:"Diseñamos websites para cualquier negocio. Website desde $15 o Website + Asistente IA + CRM por $25 de configuración y $8 al mes."},
   {property:'og:image',content:'https://thelaunchera.com/assets/website-packages-20261105/hero-jaramillo.jpg'},
   {property:'og:image:width',content:'1536'},
   {property:'og:image:height',content:'1024'},
   {property:'og:image:alt',content:"Mujer sentada trabajando en el website de Jaramillo Boutique"},
   {property:'og:url',content:"https://thelaunchera.com/es"},
   {property:'og:locale',content:'es_US'},
   {property:'og:type',content:'website'},
   {name:'twitter:card',content:'summary_large_image'},
   {name:'twitter:title',content:"Websites y automatizaciones para negocios | The Launch Era"},
   {name:'twitter:description',content:"Diseñamos websites para cualquier negocio. Website desde $15 o Website + Asistente IA + CRM por $25 de configuración y $8 al mes."},
   {name:'twitter:image',content:'https://thelaunchera.com/assets/website-packages-20261105/hero-jaramillo.jpg'}
  ],
  links:[
   {rel:'canonical',href:"https://thelaunchera.com/es"},
   {rel:'alternate',hrefLang:'en-US',href:'https://thelaunchera.com/'},
   {rel:'alternate',hrefLang:'es-US',href:'https://thelaunchera.com/es'},
   {rel:'alternate',hrefLang:'x-default',href:'https://thelaunchera.com/'},
   {rel:'preload',as:'image',href:'/assets/website-packages-20261105/hero-jaramillo.jpg'},
   {rel:'stylesheet',href:'/assets/tle-website-official.css'}
  ]
 }),
 component:()=> <OfficialHome lang="es" />
});
