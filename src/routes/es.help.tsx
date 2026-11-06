import { createFileRoute } from '@tanstack/react-router';
import { PageIntro, HelpContent } from '@/components/editorial-sections';
export const Route = createFileRoute('/es/help')({
 head:()=>({meta:[
  {title:'Contacto | Websites y automatizaciones | The Launch Era'},
  {name:'description',content:'¿Tienes preguntas sobre websites, CRM, asistentes IA o automatizaciones para tu negocio? Contacta a The Launch Era.'},
  {name:'robots',content:'index,follow'},
  {property:'og:title',content:'Contacta a The Launch Era'}
 ],links:[{rel:'canonical',href:'https://thelaunchera.com/es/help'}]}),
 component:HelpES
});
function HelpES(){return <main><PageIntro label="¿TIENES PREGUNTAS?" title="Cuéntanos lo que necesitas." description="Creamos websites y automatizaciones para cualquier negocio. Comparte tu proyecto y te responderemos por correo."/><HelpContent lang="es"/></main>}