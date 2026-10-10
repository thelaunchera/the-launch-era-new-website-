import { createFileRoute } from '@tanstack/react-router';
import { ServiceFAQ } from '@/components/service-faq';
import cleaner from '@/assets/cleaner-home.jpg';
import { HomeHero, SolutionsSection, ProblemSection, BookingSection, ProcessSection, FinalCTA } from '@/components/editorial-sections';
export const Route = createFileRoute('/')({
 head:()=>({meta:[{title:'THE LAUNCH ERA — Your client is ready to book.'},{name:'description',content:'Booking Automation + Command Center and practical systems for cleaning business owners in the U.S. Less chasing. More breathing room.'},{property:'og:title',content:'THE LAUNCH ERA — Your client is ready to book.'},{property:'og:description',content:'Your system should be too. Thoughtful booking and lead automation for your cleaning business.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}],links:[{rel:'preload',as:'image',href:cleaner},{rel:'canonical',href:'https://thelaunchera.com/'},{rel:'alternate',hrefLang:'en-US',href:'https://thelaunchera.com/'},{rel:'alternate',hrefLang:'es-US',href:'https://thelaunchera.com/es'},{rel:'alternate',hrefLang:'x-default',href:'https://thelaunchera.com/'}]}),
 component:Index,
});
function Index(){return <main className="sales-home"><HomeHero/><SolutionsSection/><ProblemSection/><BookingSection/><ProcessSection/><FinalCTA/><ServiceFAQ topic="general" lang="en"/></main>}