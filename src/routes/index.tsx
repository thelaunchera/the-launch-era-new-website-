import { HomeMotion } from '@/components/home-motion';
import { WorkflowLogoMarquee } from '@/components/workflow-logo-marquee';
import { HomeMotionInterlude } from '@/components/home-motion-interlude';
import { PrimaryBookingOffer } from '@/components/primary-booking-offer';
import { ContentLabReferral } from '@/components/content-lab-referral';
import { createFileRoute } from '@tanstack/react-router';
import { ServiceFAQ } from '@/components/service-faq';
import { SmartWelcomeBundle } from '@/components/smart-welcome-bundle';
import { HOME_HERO_PHOTO } from '@/lib/home-hero-photo';
import { HomeHero, SolutionsSection, ProblemSection, ProcessSection, FinalCTA } from '@/components/editorial-sections';
export const Route = createFileRoute('/')({
 head:()=>({meta:[{title:'The Launch Era | Websites, AI Tools & Business Automation'},{name:'description',content:'Custom websites, booking pages and AI-powered tools for small businesses. Explore The Launch Era’s websites, business systems, creative resources and demos.'},{property:'og:title',content:'The Launch Era — Websites & Smart Tools for Business'},{property:'og:description',content:'Custom websites, AI assistants, booking pages and digital tools to help small businesses grow.'},{property:'og:type',content:'website'},{property:'og:url',content:'https://thelaunchera.com/'},{name:'twitter:card',content:'summary_large_image'}],links:[{rel:'preload',as:'image',href:HOME_HERO_PHOTO},{rel:'canonical',href:'https://thelaunchera.com/'},{rel:'alternate',hrefLang:'en-US',href:'https://thelaunchera.com/'},{rel:'alternate',hrefLang:'es-US',href:'https://thelaunchera.com/es'},{rel:'alternate',hrefLang:'x-default',href:'https://thelaunchera.com/'}]}),
 component:Index,
});
function Index(){return <main className="sales-home"><HomeMotion/><HomeHero/><SmartWelcomeBundle lang="en"/><PrimaryBookingOffer lang="en"/><SolutionsSection/><ProblemSection/><ProcessSection/><FinalCTA/><ServiceFAQ topic="general" lang="en"/><ContentLabReferral lang="en"/></main>}