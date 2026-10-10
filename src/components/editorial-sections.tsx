import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link } from '@tanstack/react-router';
import { ArrowRight, ArrowUpRight, Bell, CalendarCheck2, Check, CircleCheck, ClipboardList, MessageCircle, MessagesSquare, Send, Sparkles, Timer, Workflow } from 'lucide-react';
import { Button } from '@/components/ui/button';
import cleaner from '@/assets/cleaner-home.jpg';
import webapp from '@/assets/webapp-phone.jpg';
import website from '@/assets/website-workspace.jpg';
import assistant from '@/assets/assistant-workspace.jpg';
import { BookingWalkthrough, PainCards, ProductExplorer } from './home-sales';

export function Wave({foam=false}:{foam?:boolean}) { return foam ? <div className="foam-wave" aria-hidden="true"><svg viewBox="0 0 1440 110" preserveAspectRatio="none"><path d="M0 48C50 48 52 10 112 17C151 20 166 48 207 46C255 45 261 22 301 25C348 29 346 64 399 63C448 63 459 42 505 44C548 46 555 73 605 70C675 66 686 18 750 23C805 27 807 63 858 60C911 58 918 35 969 38C1020 41 1024 70 1071 68C1116 66 1132 28 1185 33C1232 37 1237 63 1288 61C1344 59 1370 32 1440 40V110H0Z"/></svg></div> : <svg className="soft-wave" viewBox="0 0 1440 70" preserveAspectRatio="none" aria-hidden="true"><path d="M0 41C220 2 290 72 510 43C730 13 790 2 980 28C1170 56 1270 7 1440 35V70H0Z"/></svg> }
const BOOKING_SALE_END=new Date('2026-11-01T04:00:00Z').getTime();
function useBookingPrice(){const [sale,setSale]=useState(()=>Date.now()<BOOKING_SALE_END);useEffect(()=>{const sync=()=>setSale(Date.now()<BOOKING_SALE_END);sync();const id=window.setInterval(sync,30000);return()=>window.clearInterval(id)},[]);return sale?'$19.99':'$99';}
const notifications = [{title:'Booking request received',text:'Your next opportunity is here.',icon:CalendarCheck2},{title:'Lead saved',text:'Organized in your Command Center.',icon:ClipboardList},{title:'Follow-up sent',text:'Keep the conversation moving.',icon:Send},{title:'Booking confirmed',text:'Your client is on the calendar.',icon:CircleCheck}];
const flow = [{title:'NEW LEAD',text:'Booking request comes in.',detail:'Your personalized Booking Page collects service details and available appointment requests.',icon:CalendarCheck2},{title:'TRACKED',text:'Added to your Command Center automatically.',detail:'Every inquiry has a home. No more searching through messages.',icon:ClipboardList},{title:'FOLLOWED UP',text:'The next step keeps moving.',detail:'A thoughtful follow-up keeps the conversation going.',icon:Send}];
export function HomeHero() {
 const [active,setActive]=useState(0);
 const [heroLoaded,setHeroLoaded]=useState(false);
 const heroImageRef=useRef<HTMLImageElement>(null);
 useEffect(()=>{if(heroImageRef.current?.complete)setHeroLoaded(true)},[]);
 return <><section className="hero-intro"><div className="eyebrow">BOOKING AUTOMATION + COMMAND CENTER FOR CLEANING BUSINESSES</div><h1>Keep cleaning.<br/>Keep your leads moving.</h1><p>Capture booking requests, organize leads, and follow up automatically.</p><p className="hero-production-note">Personalized in 24 hours once your intake and all required details are complete.</p></section><section className={`hero-photo ${heroLoaded?'hero-media-ready':'hero-media-loading'}`} aria-label="Your cleaning business, with a little more breathing room"><img ref={heroImageRef} className="hero-main-image" src={cleaner} alt="A professional cleaner carefully wiping a console in a bright modern home" width={1920} height={1024} loading="eager" fetchPriority="high" decoding="sync" onLoad={()=>setHeroLoaded(true)} onError={()=>setHeroLoaded(true)}/><div className="hero-notice-flow" aria-label="An example of your booking flow">{notifications.map((n,i)=><div className={`notification notice-${i+1}`} key={n.title}><span className="notice-icon"><n.icon size={19}/></span><div><strong>{n.title}</strong><p>{n.text}</p></div></div>)}</div><Wave foam/></section><section className="hero-copy"><div className="hero-cta-row"><Button variant="editorial" className="cta-button" asChild><a href="/booking-demo/?lang=en">Get my personalized demo <ArrowRight/></a></Button></div><p className="demo-delivery-note">Your personalized demo arrives automatically by email.</p><BookingWalkthrough/></section></>;
}
const services = [
 {title:'Booking Automation + Command Center',landing:'/booking-lead-automation',description:'Your personalized booking page and private workspace for prices, availability, and requests.',image:cleaner,alt:'Cleaner working in a bright residential home',tag:'YOUR BOOKING FLOW, CONNECTED',points:['A personalized Booking Page with available time slots','Your private Command Center with editable prices','Automatic follow-up to keep inquiries moving'],checkout:'/booking-lead-automation'},
 {title:'Cleaning Web App',landing:'/cleaning-web-app',description:'Your day-to-day business, in one place. Right from your phone.',image:webapp,alt:'A phone showing a softly blurred cleaning business management app on a bright desk',tag:'ONE PLACE FOR THE DAY TO DAY',points:['Calendar and jobs at a glance','Clients, quotes, and invoices together','Team and workflow, organized','Time and mileage, kept simple'],checkout:'/cleaning-web-app'},
 {title:'Website Automation',landing:'/website-automation',description:'Keep your current website. Organize incoming inquiries and keep follow-ups moving.',image:website,alt:'A laptop showing a cleaning business website',tag:'YOUR WEBSITE, CONNECTED TO WHAT’S NEXT',points:['Your existing website connected to the next step','Inquiry details routed into one clear flow','Follow-up that keeps the conversation moving'],checkout:'/website-automation'},
 {title:'Virtual Assistant',landing:'/virtual-assistant',description:'Thoughtful, behind-the-scenes support for your busy days.',image:assistant,alt:'A virtual assistant working at a laptop in her home office',tag:'A LITTLE HELP GOES A LONG WAY',points:['Help with your everyday admin','A more organized inbox and client information','Support shaped around your business'],checkout:'/virtual-assistant'}
];
export function SolutionsSection() {
 return <section id="solutions" className="solutions-section"><Wave/><div className="container"><div className="section-heading"><div className="eyebrow">LESS TO CHASE. MORE ROOM TO RUN YOUR BUSINESS.</div><h2 className="editorial">When a new inquiry comes in,<br/>give it a clear next step</h2><p>You already have enough to keep up with. Your system should help you know what’s next—not give you more to remember.</p></div><p className="service-rail-hint">Swipe to explore services →</p><div className="service-grid" aria-label="Cleaning business services">{services.map((s,i)=><a className="service-card" key={s.title} href={s.landing}><ServiceCard service={s} index={i}/></a>)}</div></div></section>;
}
function ServiceCard({service:s,index:i}:{service:typeof services[number],index:number}) {
 const sale=useBookingPrice()==="$19.99";
 const normalPrices=['', '$3.99/mo', '$41.99', '$34.99/mo'];
 return <>
  <div className="service-image"><img src={s.image} alt={s.alt} loading="lazy" width={1024} height={1024}/><span className="service-number">0{i+1}</span><span className="service-arrow"><ArrowUpRight size={18}/></span></div>
  {i===0
   ? <div className="booking-offer-line">{sale&&<span className="booking-offer-tag">The Fall Refresh Offer</span>}<span className="booking-offer-price service-price-pill">{sale&&<del>$99</del>}<strong>{sale?"$19.99":"$99"}</strong></span></div>
   : i>=2 ? <div className="booking-offer-line service-discount-offer"><span className="booking-offer-tag">30% OFF</span><span className="booking-offer-price service-price-pill"><del>{i===2?"$59.99":"$49.99/mo"}</del><strong>{normalPrices[i]}</strong></span></div> : <div className="service-card-price-line"><span className="service-price-pill"><strong>{normalPrices[i]}</strong></span></div>}
  <h3>{s.title}</h3><p>{s.description}</p><div className="card-tag">{s.tag}</div>
 </>;
}
export function ServiceChoiceSection() {
 return <section className="solutions-section"><Wave/><div className="container"><div className="section-heading"><div className="eyebrow">CHOOSE THE PROBLEM YOU WANT TO SOLVE.</div><h2 className="editorial">Start with what feels hardest right now.</h2><p>Bookings and follow-up, day-to-day operations, website handoffs, or admin support—choose the area that would make your next week feel lighter.</p></div><div className="service-grid">{services.map((s,i)=><a className="service-card" key={s.title} href={s.landing}><ServiceCard service={s} index={i}/></a>)}</div></div></section>;
}
export function FreeLeadTrackerSection(){return <section className="freebie-home-section"><div className="container"><div className="freebie-home-card"><div className="freebie-home-copy"><div className="eyebrow">FREE CLEANING LEAD TRACKER + STARTER KIT</div><h2 className="editorial">Still tracking cleaning leads in DMs, screenshots, and your memory?</h2><p>Get the free Cleaning Lead Tracker + Starter Kit. Give every inquiry a status, a follow-up date, and one clear next step.</p><div className="freebie-home-points"><span><Check/>Editable Lead Tracker</span><span><Check/>Follow-up scripts</span><span><Check/>10-minute lead reset</span></div><Button variant="editorial" className="cta-button" asChild><a href="/free-cleaning-lead-guide?utm_content=homepage_freebie_section">Get the Free Lead Tracker <ArrowRight/></a></Button><small>Free · Delivered directly to your inbox</small></div><div className="freebie-home-preview" aria-label="Lead Tracker preview"><div className="freebie-preview-head"><span>THE LAUNCH ERA</span><strong>Cleaning Lead Tracker</strong><p>A next step for every inquiry.</p></div><div className="freebie-preview-row"><div><b>Jessica R.</b><small>Deep cleaning inquiry</small></div><span className="status followup">Follow-up today</span></div><div className="freebie-preview-row"><div><b>Sarah M.</b><small>Recurring cleaning</small></div><span className="status booked">Booked ✓</span></div><div className="freebie-preview-row"><div><b>Amanda K.</b><small>Move-out cleaning</small></div><span className="status">New lead</span></div><div className="freebie-preview-note"><CircleCheck size={20}/><div><strong>Nothing left floating in your DMs.</strong><small>See who needs attention next.</small></div></div></div></div></div></section>}
export function ProblemSection() { return <section className="problem-section"><div className="container problem-layout"><div><div className="eyebrow">THE WORK THAT FOLLOWS YOU HOME.</div><h2 className="editorial">Still thinking about work<br/><em>after the last clean?</em></h2><p className="problem-intro">A quote waiting for a reply. A client’s address buried in messages. Tomorrow’s schedule still unfinished.</p></div><PainCards/></div></section> }
export function LeadTracker() { return <div><div className="tracker-scene"><div className="tracker"><div className="tracker-title"><h3>Your Command Center</h3><small>All caught up</small></div><p className="tracker-subtitle">A place for every inquiry. A next step for every lead.</p><div className="tracker-stats"><div><strong>12</strong><span>New inquiries</span></div><div><strong>8</strong><span>Followed up</span></div><div><strong>6</strong><span>Clients booked</span></div></div><div className="tracker-row header"><span>CLIENT</span><span>SERVICE</span><span>STATUS</span></div><div className="tracker-row"><strong>Sarah M.<small>Website inquiry</small></strong><span>Recurring clean</span><span className="status booked">Booked ✓</span></div><div className="tracker-row"><strong>Jessica R.<small>Booking form</small></strong><span>Deep clean</span><span className="status followup">Follow-up sent</span></div><div className="tracker-row"><strong>Amanda K.<small>Direct message</small></strong><span>Move-out clean</span><span className="status">New lead</span></div></div><div className="tracker-note"><CircleCheck size={23}/><div><strong>Follow-up? Already handled.</strong><p>The next step is right on time.</p></div></div></div><p className="tracker-caption">AN ILLUSTRATIVE LOOK AT A MORE ORGANIZED DAY.</p></div> }
export function BookingSection({detail=false}:{detail?:boolean}) { const price=useBookingPrice(); return <section id="booking-lead-automation" className="booking-section"><div className="container booking-layout"><div className="booking-copy"><div className="eyebrow">BOOKING AUTOMATION + COMMAND CENTER</div><h2 className="editorial">A better way to take requests<br/>and <em>keep them moving.</em></h2><p className="description">Your own Booking Page connects directly to your private Command Center. Manage services, prices, available times, and incoming requests in one workspace.</p><ul className="check-list"><li><Check/>Personalized Booking Page with available time slots</li><li><Check/>Editable prices, add-ons and hours in your Command Center</li><li><Check/>Follow-up that helps you stay in touch</li></ul>{price==="$19.99"&&<div className="booking-hero-offer"><span className="booking-offer-tag">The Fall Refresh Offer</span><span className="booking-offer-price"><del>$99</del><strong>$19.99</strong></span><span className="booking-offer-deadline">Ends Oct 31</span></div>}<p className="booking-production-note">24-hour production once your intake and all required details are complete.</p><Button variant="editorial" className="cta-button" asChild>{detail?<a href="/service-checkout/?offer=booking-flow&lang=en">Get Started — {price} <ArrowRight/></a>:<a href="/service-checkout/?offer=booking-flow&lang=en">Get my booking system — {price} <ArrowRight/></a>}</Button></div><div className="home-booking-explorer"><div className="product-preview-intro"><span className="eyebrow">TAKE A LOOK INSIDE</span><h3 className="editorial">See what comes with your system.</h3><p>Explore the Booking Page, Command Center, and follow-ups below.</p></div><ProductExplorer><LeadTracker/></ProductExplorer></div></div></section> }
export function ProcessSection() {
 return <section className="process-section"><div className="container">
  <div className="section-heading"><div className="eyebrow">SIMPLE TO START. BUILT AROUND YOU.</div><h2 className="editorial">A better flow, in three steps.</h2></div>
  <div className="process-grid">
   <div className="process-step"><div className="process-number">01</div><h3>Share your business details.</h3><p>Complete the setup form after purchase.</p></div>
   <div className="process-step"><div className="process-number">02</div><h3>We personalize your system.</h3><p>Your brand, services, prices, and booking flow.</p></div>
   <div className="process-step"><div className="process-number">03</div><h3>Open your workspace.</h3><p>Your access links arrive by email when ready.</p></div>
  </div>
  <div id="contacto" className="homepage-demo-contact" aria-label="Contact The Launch Era">
   <div className="homepage-contact-panel"><ContactForm/></div>
  </div>
 </div></section>;
}
export function FinalCTA() { const price=useBookingPrice(); return <section className="final-section"><Wave/><div className="eyebrow">GIVE YOUR NEXT INQUIRY A PLACE TO GO.</div><h2 className="editorial">Your next client should be<br/><em>easy to keep track of.</em></h2><p>Get your personalized Booking Page and private Command Center.</p><div className="final-actions"><Button variant="editorial" className="cta-button" asChild><a href="/service-checkout/?offer=booking-flow&lang=en">Get my booking system — {price} <ArrowRight/></a></Button></div><a className="final-contact-link" href="#contacto">Have a question? Send us an inquiry.</a></section> }
export function PageIntro({label,title,description}:{label:string,title:string,description:string}) { return <section className="page-intro"><div className="eyebrow">{label}</div><h1 className="editorial">{title}</h1><p>{description}</p></section> }
export function ContactForm() {
 const [status,setStatus]=useState<'idle'|'sending'|'sent'|'error'>('idle');
 const [name,setName]=useState('');
 const [error,setError]=useState('');
 async function submitInquiry(e:FormEvent<HTMLFormElement>){
  e.preventDefault();
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
     message:String(fd.get('message')||''),
     language:'en',
     source:'main_website',
     started_at:Date.now()-3000,
     website:''
    })
   });
   const data=await response.json().catch(()=>({}));
   if(!response.ok||!data?.ok) throw new Error(data?.error||'We couldn’t send your inquiry. Please try again.');
   setStatus('sent');
  }catch(err){setError(err instanceof Error?err.message:'We couldn’t send your inquiry. Please try again.');setStatus('error');}
 }
 return <div className="contact-form">{status==='sent'?<div className="form-confirm"><Sparkles size={30}/><h3 className="editorial">Thank you, {name.split(' ')[0]}.</h3><p>Your inquiry has been sent to The Launch Era. We’ll review it and follow up with you soon.</p><Button variant="outline" onClick={()=>setStatus('idle')}>Send another inquiry <ArrowRight/></Button></div>:<><h2 className="editorial">Tell us about your business.</h2><p>A few details to start a thoughtful conversation.</p><form onSubmit={submitInquiry}><div className="form-grid"><label className="field">Your name<input name="name" autoComplete="name" required value={name} onChange={e=>setName(e.target.value)} placeholder="First & last name"/></label><label className="field">Email address<input name="email" type="email" autoComplete="email" required placeholder="Where we can reach you"/></label></div><label className="field">Business name<input name="business" autoComplete="organization" required placeholder="Your cleaning business"/></label><label className="field">What can we help with?<select name="service" defaultValue="Booking Automation + Command Center">{services.map(s=><option key={s.title}>{s.title}</option>)}<option>I’m not sure yet</option></select></label><label className="field">What’s taking up too much of your time?<textarea name="message" required placeholder="Tell us a little about your day-to-day…"/></label>{status==='error'&&<p className="text-sm" role="alert">{error}</p>}<Button type="submit" variant="editorial" className="cta-button" disabled={status==='sending'}>{status==='sending'?'Sending…':'Send my inquiry'} <ArrowRight/></Button><p className="form-disclaimer">Your inquiry goes directly to The Launch Era. We’ll use these details only to respond to your request.</p></form></>}</div>
}
export function HelpContent() {
 return <div className="container help-layout">
  <div className="help-contact-intro">
   <div className="eyebrow">QUESTIONS OR A SPECIAL REQUEST?</div>
   <h2 className="editorial">Tell us what you need help with.</h2>
   <p>Use the form to reach The Launch Era. Questions about pricing, delivery, and what each service includes are answered on the corresponding service page.</p>
   <a className="service-demo-link" href="/#faq">See general questions <ArrowRight size={17}/></a>
  </div>
  <ContactForm/>
 </div>
}
