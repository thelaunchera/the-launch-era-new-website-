import { createFileRoute } from '@tanstack/react-router';
import { OfficialHome } from '@/components/official-home';
export const Route=createFileRoute('/')({
 head:()=>({
  meta:[
   {title:"Business Websites & Automations | The Launch Era"},
   {name:'description',content:"Professional websites for every business. Website setup from $15 or Website + AI Assistant + CRM for $25 setup plus $8 per month."},
   {name:'robots',content:'index,follow,max-image-preview:large'},
   {property:'og:title',content:"Business Websites & Automations | The Launch Era"},
   {property:'og:description',content:"Professional websites for every business. Website setup from $15 or Website + AI Assistant + CRM for $25 setup plus $8 per month."},
   {property:'og:image',content:'https://thelaunchera.com/assets/website-packages-20261105/hero-jaramillo.jpg'},
   {property:'og:image:width',content:'1536'},
   {property:'og:image:height',content:'1024'},
   {property:'og:image:alt',content:"Woman seated with laptop designing Jaramillo Boutique's website"},
   {property:'og:url',content:"https://thelaunchera.com/"},
   {property:'og:locale',content:'en_US'},
   {property:'og:type',content:'website'},
   {name:'twitter:card',content:'summary_large_image'},
   {name:'twitter:title',content:"Business Websites & Automations | The Launch Era"},
   {name:'twitter:description',content:"Professional websites for every business. Website setup from $15 or Website + AI Assistant + CRM for $25 setup plus $8 per month."},
   {name:'twitter:image',content:'https://thelaunchera.com/assets/website-packages-20261105/hero-jaramillo.jpg'}
  ],
  links:[
   {rel:'canonical',href:"https://thelaunchera.com/"},
   {rel:'alternate',hrefLang:'en-US',href:'https://thelaunchera.com/'},
   {rel:'alternate',hrefLang:'es-US',href:'https://thelaunchera.com/es'},
   {rel:'alternate',hrefLang:'x-default',href:'https://thelaunchera.com/'},
   {rel:'preload',as:'image',href:'/assets/website-packages-20261105/hero-jaramillo.jpg'},
   {rel:'stylesheet',href:'/assets/tle-website-official.css'}
  ]
 }),
 component:()=> <OfficialHome lang="en" />
});
