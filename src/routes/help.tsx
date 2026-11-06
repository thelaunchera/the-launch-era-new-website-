import { createFileRoute } from '@tanstack/react-router';
import { PageIntro, HelpContent } from '@/components/editorial-sections';
export const Route = createFileRoute('/help')({
 head:()=>({meta:[
  {title:'Contact The Launch Era | Websites & Business Automations'},
  {name:'description',content:'Questions about professional websites, AI assistants, automated CRM and custom business automations? Contact The Launch Era.'},
  {property:'og:title',content:'Contact The Launch Era'},
  {name:'robots',content:'index,follow'}
 ],links:[{rel:'canonical',href:'https://thelaunchera.com/help'}]}),
 component:Help
});
function Help(){return <main><PageIntro label="QUESTIONS ABOUT YOUR PROJECT?" title="Tell us what you have in mind." description="We design websites and automations for any business. Share your needs and we’ll reply by email."/><HelpContent lang="en"/></main>}