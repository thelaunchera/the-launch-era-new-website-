import { ConnectedBookingFlow, HeroConnectionBackdrop } from './connected-booking-flow';
import { ServiceFlipCard } from './service-flip-card';
import { SuccessConfirmation } from './success-confirmation';
import { ProcessSteps } from './process-view-transitions';
import { MorphSubmit } from '@/components/morph-submit';
import { ContactSteps } from '@/components/contact-stepper';
import { MarketingCTA } from '@/components/marketing-cta';
import { BookingBenefits } from './home-motion';
import { BookingToneShift } from './booking-tone-shift';
import { HeroSplitWordLink } from './hero-split-word-link';
import { useHeroWipe } from './use-hero-wipe';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link } from '@tanstack/react-router';
import { ArrowRight, ArrowUpRight, Bell, CalendarCheck2, Check, CircleCheck, ClipboardList, MessageCircle, MessagesSquare, Send, Sparkles, Timer, Workflow } from 'lucide-react';
import { Button } from '@/components/ui/button';
import cleaner from '@/assets/cleaner-home.jpg';
import { HOME_HERO_PHOTO } from '@/lib/home-hero-photo';
import webapp from '@/assets/webapp-phone.jpg';
import website from '@/assets/website-workspace.jpg';
import assistant from '@/assets/assistant-workspace.jpg';
const aiAgentsPhoto = 'https://images.unsplash.com/photo-1758626099012-2904337e9c60?auto=format&fit=crop&w=1000&q=85';
import { BookingWalkthrough, PainCards, ProductExplorer } from './home-sales';
import { MaskCursorHeadline } from './mask-cursor-headline';
import { WhatsAppOfferPrice } from './whatsapp-offer';

export function Wave({foam=false}:{foam?:boolean}) { return foam ? <div className="foam-wave" aria-hidden="true"><svg viewBox="0 0 1440 110" preserveAspectRatio="none"><path d="M0 48C50 48 52 10 112 17C151 20 166 48 207 46C255 45 261 22 301 25C348 29 346 64 399 63C448 63 459 42 505 44C548 46 555 73 605 70C675 66 686 18 750 23C805 27 807 63 858 60C911 58 918 35 969 38C1020 41 1024 70 1071 68C1116 66 1132 28 1185 33C1232 37 1237 63 1288 61C1344 59 1370 32 1440 40V110H0Z"/></svg></div> : <svg className="soft-wave" viewBox="0 0 1440 70" preserveAspectRatio="none" aria-hidden="true"><path d="M0 41C220 2 290 72 510 43C730 13 790 2 980 28C1170 56 1270 7 1440 35V70H0Z"/></svg> }
const BOOKING_SALE_END=new Date('2026-11-01T04:00:00Z').getTime();
function useBookingPrice(){const [sale,setSale]=useState(()=>Date.now()<BOOKING_SALE_END);useEffect(()=>{const sync=()=>setSale(Date.now()<BOOKING_SALE_END);sync();const id=window.setInterval(sync,30000);return()=>window.clearInterval(id)},[]);return {price:'$15',sale:true};}
const notifications = [
 {app:'BOOKING PAGE',when:'now',title:'New booking request',text:'A customer would like a cleaning quote.',icon:CalendarCheck2},
 {app:'COMMAND CENTER',when:'12m ago',title:'Follow-up sent',text:'Your customer got a friendly reminder.',icon:Send},
 {app:'QUOTES',when:'preview',title:'Quote ready to review',text:'Keep the next step organized.',icon:ClipboardList},
 {app:'BOOKING PAGE',when:'preview',title:'Booking confirmed',text:'One more job on the calendar.',icon:CircleCheck}
];
const flow = [{title:'NEW LEAD',text:'Booking request comes in.',detail:'Your personalized Booking Page collects service details and available appointment requests.',icon:CalendarCheck2},{title:'TRACKED',text:'Added to your Command Center automatically.',detail:'Every inquiry has a home. No more searching through messages.',icon:ClipboardList},{title:'FOLLOWED UP',text:'The next step keeps moving.',detail:'A thoughtful follow-up keeps the conversation going.',icon:Send}];
export function HomeHero() {
 const [active,setActive]=useState(0);
 const [heroLoaded,setHeroLoaded]=useState(false);
 const heroImageRef=useRef<HTMLImageElement>(null);
 const {heroRef,revealed}=useHeroWipe();
 useEffect(()=>{if(heroImageRef.current?.complete)setHeroLoaded(true)},[]);
 return <><section className="hero-scroll" aria-label="An example of The Launch Era booking experience"><div className="hero-scroll-stage"><HeroConnectionBackdrop lang="en"/><div className="hero-scroll-reveal"><span>YOUR BOOKING FLOW</span><HeroSplitWordLink lang="en"/></div><div ref={heroRef} data-wipe-visible={revealed && heroLoaded} className={`hero-photo hero-scroll-frame hero-split ${heroLoaded?'hero-media-ready':'hero-media-loading'}`}>
 <div className="tle-hero-soft-mesh" aria-hidden="true"><span/><span/><span/><span/></div>
 <div className="hero-intro">
   <div className="eyebrow">FOR CLEANING BUSINESS OWNERS</div>
   <h1 className="tle-hero-heading-shine">Less time chasing messages. More time for your business.</h1>
   <p>Booking requests, quotes and follow-ups. All in one place.</p>
   <div className="hero-cta-row"><Button variant="editorial" className="cta-button" asChild><a href="/booking-demo/?lang=en">Get my personalized demo <ArrowRight/></a></Button></div>
   <p className="demo-delivery-note">Your private demo arrives by email.</p>
 </div>
 <div className="hero-split-visual">
 <img ref={heroImageRef} className="hero-main-image" src={HOME_HERO_PHOTO} alt="Cleaning professional wiping a countertop in a bright modern living room with pendant lights" width={1122} height={1402} loading="eager" fetchPriority="high" decoding="sync" onLoad={()=>setHeroLoaded(true)} onError={()=>setHeroLoaded(true)}/>
 <div className="hero-notice-flow" aria-hidden="true">
   {notifications.map((n,i)=>{const Icon=n.icon;return <div className={`notification notice-${i+1}`} key={n.title}>
     <span className="notice-icon" aria-hidden="true"><Icon size={17}/></span>
     <div className="notice-body"><div className="notice-meta"><span>{n.app}</span><time>{n.when}</time></div><strong>{n.title}</strong><p>{n.text}</p></div>
   </div>})}
 </div></div>
 </div></div></section><section id="hero-next" className="hero-copy"><BookingWalkthrough/></section></>;
}
const services = [
 {title:'Booking Automation + Command Center',landing:'/booking-lead-automation',description:'Your Booking Page and private workspace, connected.',image:cleaner,alt:'Cleaner working in a bright residential home',tag:'YOUR BOOKING FLOW, CONNECTED',points:['Booking Page with available times','Edit prices in your Command Center','Up to two automatic follow-ups'],checkout:'/booking-lead-automation'},
 {title:'AI Assistants',landing:'/ai-booking-assistant/',description:'Booking questions, follow-ups, or both. For your Booking Page or website.',image:aiAgentsPhoto,alt:'Modern AI technology workspace with a laptop and a blue-toned digital assistant screen',tag:'BOOKING AI + FOLLOW-UP AI',points:['AI Booking','AI Follow-Up','Both together'],checkout:'/ai-booking-assistant/'},
 {title:'WhatsApp AI Agent',landing:'/whatsapp-ai-agent/',description:'Organize WhatsApp inquiries with AI. Coming soon.',image:'https://images.unsplash.com/photo-1758611974917-f7f7a58b74b0?auto=format&fit=crop&w=1200&q=85',alt:'Small business owner using her phone beside a laptop in a bright workspace',tag:'WHATSAPP CONVERSATIONS, ORGANIZED',points:['Answers questions on WhatsApp','Custom quotes remain under your control','Human follow-up when it matters'],checkout:'/whatsapp-ai-agent/'},
 {title:'Cleaning Web App',landing:'/cleaning-web-app',description:'Your day-to-day business, in one place. Right from your phone.',image:webapp,alt:'A phone showing a softly blurred cleaning business management app on a bright desk',tag:'ONE PLACE FOR THE DAY TO DAY',points:['Calendar and jobs at a glance','Clients, quotes, and invoices together','Team and workflow, organized','Time and mileage, kept simple'],checkout:'/cleaning-web-app'},
 {title:'Website Automation',landing:'/website-automation',description:'Keep your website. Organize inquiries and follow-ups.',image:website,alt:'A laptop showing a cleaning business website',tag:'YOUR WEBSITE, CONNECTED TO WHAT’S NEXT',points:['Your existing website connected to the next step','Inquiry details routed into one clear flow','Follow-up that keeps the conversation moving'],checkout:'/website-automation'},
 {title:'Virtual Assistant',landing:'/virtual-assistant',description:'Thoughtful, behind-the-scenes support for your busy days.',image:assistant,alt:'A virtual assistant working at a laptop in her home office',tag:'A LITTLE HELP GOES A LONG WAY',points:['Help with your everyday admin','A more organized inbox and client information','Support shaped around your business'],checkout:'/virtual-assistant'}
];
export function SolutionsSection() {
 return <section id="solutions" className="solutions-section"><Wave/><div className="container"><div className="section-heading"><div className="eyebrow">LESS TO CHASE. MORE ROOM TO RUN YOUR BUSINESS.</div><h2 className="editorial">A new cleaning request<br/>shouldn’t get lost in your messages.</h2><p>See every request and its next step in one place.</p></div><p className="service-rail-hint">Explore our solutions</p><div className="service-grid" aria-label="Cleaning business services">{services.map((s,i)=><ServiceFlipCard key={s.title} title={s.title} href={s.landing} description={s.description} points={s.points}><ServiceCard service={s} index={i}/></ServiceFlipCard>)}</div></div></section>;
}
function ServiceCard({service:s,index:i}:{service:typeof services[number],index:number}) {
 const {sale}=useBookingPrice();
 const isBooking=s.title==='Booking Automation + Command Center';
 const isAi=s.title==='AI Assistants';
 const isWhats=s.title==='WhatsApp AI Agent';
 const isApp=s.title==='Cleaning Web App';
 const isWebsite=s.title==='Website Automation';
 const isVa=s.title==='Virtual Assistant';
 return <>
  <div className="service-image"><img src={s.image} alt={s.alt} loading="lazy" width={1024} height={1024} onError={isAi?(e)=>{e.currentTarget.onerror=null;e.currentTarget.src=assistant;}:undefined}/><span className="service-number">0{i+1}</span><span className="service-arrow"><ArrowUpRight size={18}/></span></div>
  {isBooking
   ? <div className="booking-offer-line">{sale&&<span className="booking-offer-tag">Current offer</span>}<span className="booking-offer-price service-price-pill">{sale&&<del>$49.99</del>}<strong>{sale?"$15":"$49.99"}</strong></span></div>
   : isAi
     ? <div className="service-card-price-line"><span className="service-price-pill service-ai-price"><strong>From $19 setup</strong></span></div>
     : isWhats ? <WhatsAppOfferPrice lang="en"/>
     : isWebsite||isVa
       ? <div className="booking-offer-line service-discount-offer"><span className="booking-offer-tag">SPECIAL OFFER</span><span className="booking-offer-price service-price-pill"><del>{isWebsite?"$59.99":"$49.99/mo"}</del><strong>{isWebsite?"$35":"$25/mo"}</strong></span></div>
       : isApp
         ? <div className="service-card-price-line"><span className="service-price-pill"><strong>$3.99/mo</strong></span></div> : null}
  <h3>{s.title}</h3><p>{s.description}</p><div className="card-tag">{s.tag}</div>
 </>;
}
export function ServiceChoiceSection() {
 return <section className="solutions-section"><Wave/><div className="container"><div className="section-heading"><div className="eyebrow">CHOOSE THE PROBLEM YOU WANT TO SOLVE.</div><h2 className="editorial">Start with what feels hardest right now.</h2><p>Choose the help your business needs most.</p></div><div className="service-grid">{services.map((s,i)=><ServiceFlipCard key={s.title} title={s.title} href={s.landing} description={s.description} points={s.points}><ServiceCard service={s} index={i}/></ServiceFlipCard>)}</div></div></section>;
}
export function FreeLeadTrackerSection(){return <section className="freebie-home-section"><div className="container"><div className="freebie-home-card"><div className="freebie-home-copy"><div className="eyebrow">FREE CLEANING LEAD TRACKER + STARTER KIT</div><h2 className="editorial">Still tracking cleaning leads in DMs, screenshots, and your memory?</h2><p>Free tracker, follow-up scripts and a clear next step for each inquiry.</p><div className="freebie-home-points"><span><Check/>Editable Lead Tracker</span><span><Check/>Follow-up scripts</span><span><Check/>10-minute lead reset</span></div><MarketingCTA className="cta-button" href="/free-cleaning-lead-guide?utm_content=homepage_freebie_section">Get the Free Lead Tracker <ArrowRight/></MarketingCTA><small>Free · Delivered directly to your inbox</small></div><div className="freebie-home-preview" aria-label="Lead Tracker preview"><div className="freebie-preview-head"><span>THE LAUNCH ERA</span><strong>Cleaning Lead Tracker</strong><p>A next step for every inquiry.</p></div><div className="freebie-preview-row"><div><b>Jessica R.</b><small>Deep cleaning inquiry</small></div><span className="status followup">Follow-up today</span></div><div className="freebie-preview-row"><div><b>Sarah M.</b><small>Recurring cleaning</small></div><span className="status booked">Booked ✓</span></div><div className="freebie-preview-row"><div><b>Amanda K.</b><small>Move-out cleaning</small></div><span className="status">New lead</span></div><div className="freebie-preview-note"><CircleCheck size={20}/><div><strong>Nothing left floating in your DMs.</strong><small>See who needs attention next.</small></div></div></div></div></div></section>}
export function ProblemSection() { return <section className="problem-section"><div className="container problem-layout"><div><div className="eyebrow">THE WORK THAT FOLLOWS YOU HOME.</div><MaskCursorHeadline>Still thinking about work<br/><em>after the last clean?</em></MaskCursorHeadline><p className="problem-intro">A quote waiting for a reply. A client’s address buried in messages. Tomorrow’s schedule still unfinished.</p></div><PainCards/></div></section> }
export function LeadTracker() { return <div><div className="tracker-scene"><div className="tracker"><div className="tracker-title"><h3>Your Command Center</h3><small>All caught up</small></div><p className="tracker-subtitle">A place for every inquiry. A next step for every lead.</p><div className="tracker-stats"><div><strong>12</strong><span>New inquiries</span></div><div><strong>8</strong><span>Followed up</span></div><div><strong>6</strong><span>Clients booked</span></div></div><div className="tracker-row header"><span>CLIENT</span><span>SERVICE</span><span>STATUS</span></div><div className="tracker-row"><strong>Sarah M.<small>Website inquiry</small></strong><span>Recurring clean</span><span className="status booked">Booked ✓</span></div><div className="tracker-row"><strong>Jessica R.<small>Booking form</small></strong><span>Deep clean</span><span className="status followup">Follow-up sent</span></div><div className="tracker-row"><strong>Amanda K.<small>Direct message</small></strong><span>Move-out clean</span><span className="status">New lead</span></div></div><div className="tracker-note"><CircleCheck size={23}/><div><strong>Follow-up? Already handled.</strong><p>The next step is right on time.</p></div></div></div><p className="tracker-caption">AN ILLUSTRATIVE LOOK AT A MORE ORGANIZED DAY.</p></div> }
export function BookingSection({detail=false}:{detail?:boolean}) { const {price,sale}=useBookingPrice(); return <section id="booking-lead-automation" className="booking-section"><BookingToneShift/><div className="container booking-layout"><div className="booking-copy"><div className="eyebrow">BOOKING AUTOMATION + COMMAND CENTER</div><h2 className="editorial">Bookings in one place.<br/><em>Less chasing messages.</em></h2><p className="description">Your Booking Page and private Command Center, connected.</p><BookingBenefits/>{sale&&<div className="booking-hero-offer"><span className="booking-offer-tag">Current offer</span><span className="booking-offer-price"><del>$49.99</del><strong>$15</strong></span><span className="booking-offer-deadline">Current offer</span></div>}<p className="booking-production-note">Estimated 48 hours after setup review and kickoff email.</p><Button variant="editorial" className="cta-button" asChild>{detail?<a href="/booking-bundle/?lang=en">Get Started — {price} <ArrowRight/></a>:<a href="/booking-bundle/?lang=en">Get my booking system — {price} <ArrowRight/></a>}</Button></div><div className="home-booking-explorer tle-flow-explorer"><ConnectedBookingFlow lang="en"/></div></div></section> }
export function ProcessSection() {
 return <section className="process-section"><div className="container">
  <div className="section-heading"><div className="eyebrow">SIMPLE TO START. BUILT AROUND YOU.</div><h2 className="editorial">A better flow, in three steps.</h2></div>
  <ProcessSteps lang="en"/>
  <div id="contacto" className="homepage-demo-contact" aria-label="Contact The Launch Era">
   <div className="homepage-contact-panel"><ContactForm/></div>
  </div>
 </div></section>;
}
export function FinalCTA() { const {price}=useBookingPrice(); return <section className="final-section"><Wave/><div className="eyebrow">GIVE YOUR NEXT INQUIRY A PLACE TO GO.</div><h2 className="editorial">Your next client should be<br/><em>easy to keep track of.</em></h2><p>Get your personalized Booking Page and private Command Center.</p><div className="final-actions"><MarketingCTA className="cta-button" href="/booking-bundle/?lang=en">Get my booking system — {price} <ArrowRight/></MarketingCTA></div></section> }
export function PageIntro({label,title,description}:{label:string,title:string,description:string}) { return <section className="page-intro"><div className="eyebrow">{label}</div><h1 className="editorial">{title}</h1><p>{description}</p></section> }
export function ContactForm() {
 const [status,setStatus]=useState<'idle'|'sending'|'done'|'sent'|'error'>('idle');
 const [name,setName]=useState('');
 const [serviceChoice,setServiceChoice]=useState('Booking Automation + Command Center');
 useEffect(()=>{try{if(new URLSearchParams(window.location.search).get('topic')==='setup-call')setServiceChoice('1:1 Setup Guidance Call')}catch{}},[]);
 const isCall=serviceChoice==='1:1 Setup Guidance Call';
 const [error,setError]=useState('');
 const sendingRef=useRef(false);
 const [receipt,setReceipt]=useState({ name:'', email:'', business:'', service:'' });
 async function submitInquiry(e:FormEvent<HTMLFormElement>){
  e.preventDefault();
  if(sendingRef.current || status==='sending' || status==='sent') return;
  sendingRef.current=true;
  setStatus('sending'); setError('');
  const form=e.currentTarget;
  const fd=new FormData(form);
  try{
   const response=await fetch('https://bowacxhmjvrqixtwaikv.supabase.co/functions/v1/tle-contact',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({
     name:String(fd.get('name')||''),
     email:String(fd.get('email')||''),
     business_name:String(fd.get('business')||''),
     help_needed:[String(fd.get('service')||'')].filter(Boolean),
     message:isCall?String(fd.get('message')||'')+'\nPreferred time windows: '+String(fd.get('call_availability')||'Not specified')+'\nCall type: setup guidance request; not booked yet':String(fd.get('message')||''),
     language:'en',
     source:isCall?'setup_guidance_call':'main_website',
     started_at:Date.now()-3000,
     website:''
    })
   });
   const data=await response.json().catch(()=>({}));
   if(!response.ok||!data?.ok) throw new Error(data?.error||'We couldn’t send your inquiry. Please try again.');
   // Only the backend's acknowledged insert/duplicate can open the confirmation.
   setReceipt({
    name:String(fd.get('name')||''),
    email:String(fd.get('email')||''),
    business:String(fd.get('business')||''),
    service:String(fd.get('service')||'')
   });
   setStatus('done');
   await new Promise<void>(resolve => window.setTimeout(resolve, 780));
   setStatus('sent');
  }catch(err){
   setError(err instanceof Error?err.message:'We couldn’t send your inquiry. Please try again.');
   setStatus('error');
   sendingRef.current=false;
  }
 }
 return <div className="contact-form">{status==='sent'?<SuccessConfirmation
  language="en" kind="contact" compact
  name={receipt.name} email={receipt.email} business={receipt.business} service={receipt.service}
  onAgain={()=>{sendingRef.current=false;setError('');setStatus('idle');}}
 />:<><h2 className="editorial">Tell us about your business.</h2><p>What would you like help with?</p><ContactSteps
  language="en"
  status={status}
  onSubmit={submitInquiry}
  panels={[
   <><div className="form-grid"><label className="field">Your name<input name="name" autoComplete="name" required value={name} onChange={e=>setName(e.target.value)} placeholder="First & last name"/></label><label className="field">Email address<input name="email" type="email" autoComplete="email" required placeholder="Where we can reach you"/></label></div></>,
   <><label className="field">Business name<input name="business" autoComplete="organization" required placeholder="Your cleaning business"/></label><label className="field">What can we help with?<select name="service" value={serviceChoice} onChange={e=>setServiceChoice(e.target.value)}>{services.map(s=><option key={s.title}>{s.title}</option>)}<option value="1:1 Setup Guidance Call">1:1 Setup Guidance Call (20 minutes)</option><option>I’m not sure yet</option></select></label></>,
   <><label className="field">{isCall?"What would you like help learning?":"What’s taking up too much of your time?"}<textarea name="message" required placeholder={isCall?"e.g. How to change my services and prices":"Tell us a little about your day-to-day…"}/></label>{isCall&&<><p className="form-disclaimer">Tell us what you need help with and when you're generally available. We'll email you to arrange a time; submitting this form does not book an appointment.</p><label className="field">Preferred time windows (optional)<input name="call_availability" maxLength={180} placeholder="e.g. Tuesday or Thursday afternoons (Eastern Time)"/></label></>}</>
  ]}
  error={status==='error'?<p className="text-sm" role="alert">{error}</p>:null}
  finish={<MorphSubmit status={status} language="en">Finish &amp; send <ArrowRight size={17}/></MorphSubmit>}
  disclaimer="Your inquiry goes directly to The Launch Era. We’ll use these details only to respond to your request."
 /></>}</div>
}
export function HelpContent() {
 return <div className="container help-layout">
  <div className="help-contact-intro">
   <div className="eyebrow">QUESTIONS OR A SPECIAL REQUEST?</div>
   <h2 className="editorial">Tell us what you need help with.</h2>
   <p>Send your question. Service pages have pricing and details.</p>
   <a className="service-demo-link" href="/#faq">See general questions <ArrowRight size={17}/></a>
  </div>
  <ContactForm/>
 </div>
}
