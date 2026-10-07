import { createFileRoute } from '@tanstack/react-router';
import { HomeHero, SolutionsSection, ProblemSection, BookingSection, ProcessSection, FinalCTA } from '@/components/editorial-sections';
export const Route = createFileRoute('/')({
 head:()=>({meta:[{title:'THE LAUNCH ERA — Your client is ready to book.'},{name:'description',content:'Booking + Lead Automation and practical systems for cleaning business owners in the U.S. Less chasing. More breathing room.'},{property:'og:title',content:'THE LAUNCH ERA — Your client is ready to book.'},{property:'og:description',content:'Your system should be too. Thoughtful booking and lead automation for your cleaning business.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]}),
 component:Index,
});
function Index(){return <main><HomeHero/><SolutionsSection/><ProblemSection/><BookingSection/><ProcessSection/><FinalCTA/></main>}