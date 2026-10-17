import { HomeMotion } from '@/components/home-motion';
import { WorkflowLogoMarquee } from '@/components/workflow-logo-marquee';
import { HomeMotionInterlude } from '@/components/home-motion-interlude';
import { createFileRoute } from '@tanstack/react-router';
import { ServiceFAQ } from '@/components/service-faq';
import { SmartWelcomeBundle } from '@/components/smart-welcome-bundle';
import { HOME_HERO_PHOTO } from '@/lib/home-hero-photo';
import { HomeHero, SolutionsSection, ProblemSection, ProcessSection, FinalCTA } from '@/components/editorial-sections';
export const Route = createFileRoute('/')({
 head:()=>({meta:[{title:'Cleaning Business Automation & Booking | The Launch Era'},{name:'description',content:'Booking automation, lead follow-ups, AI assistants and cleaning business management tools for U.S. cleaning business owners. Keep bookings and clients organized.'},{property:'og:title',content:'THE LAUNCH ERA — Your client is ready to book.'},{property:'og:description',content:'Make booking requests, follow-ups and cleaning business operations easier with The Launch Era.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}],links:[{rel:'preload',as:'image',href:HOME_HERO_PHOTO},{rel:'canonical',href:'https://thelaunchera.com/'},{rel:'alternate',hrefLang:'en-US',href:'https://thelaunchera.com/'},{rel:'alternate',hrefLang:'es-US',href:'https://thelaunchera.com/es'},{rel:'alternate',hrefLang:'x-default',href:'https://thelaunchera.com/'}]}),
 component:Index,
});
function Index(){return <main className="sales-home"><HomeMotion/><HomeHero/><SmartWelcomeBundle lang="en"/><SolutionsSection/><ProblemSection/><HomeMotionInterlude lang="en"/><ProcessSection/><FinalCTA/><WorkflowLogoMarquee lang="en"/><ServiceFAQ topic="general" lang="en"/></main>}