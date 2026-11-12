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
 head:()=>({meta:[{title:'Cleaning Business Automation & Booking | The Launch Era'},{name:'description',content:'Stop losing track of cleaning requests. Get a personalized Booking Page and private Admin Panel to organize quotes, bookings, and follow-ups.'},{property:'og:title',content:'The Launch Era — Cleaning bookings and follow-ups, organized.'},{property:'og:description',content:'A simpler way to manage cleaning requests. Booking Page + Admin Panel, personalized for your business.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}],links:[{rel:'preload',as:'image',href:HOME_HERO_PHOTO},{rel:'canonical',href:'https://thelaunchera.com/'},{rel:'alternate',hrefLang:'en-US',href:'https://thelaunchera.com/'},{rel:'alternate',hrefLang:'es-US',href:'https://thelaunchera.com/es'},{rel:'alternate',hrefLang:'x-default',href:'https://thelaunchera.com/'}]}),
 component:Index,
});
function Index(){return <main className="sales-home"><HomeMotion/><HomeHero/><SmartWelcomeBundle lang="en"/><PrimaryBookingOffer lang="en"/><SolutionsSection/><ProblemSection/><ProcessSection/><FinalCTA/><ServiceFAQ topic="general" lang="en"/><ContentLabReferral lang="en"/></main>}