import { Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

function SaleCountdown() {
 const saleEndsAt = new Date('2026-10-11T11:01:04Z').getTime();
 const [remaining,setRemaining] = useState(() => Math.max(0, saleEndsAt - Date.now()));
 useEffect(() => {
   const tick = () => setRemaining(Math.max(0, saleEndsAt - Date.now()));
   tick();
   const timer = window.setInterval(tick, 1000);
   return () => window.clearInterval(timer);
 }, []);
 const days = Math.floor(remaining / 86400000);
 const hours = Math.floor((remaining % 86400000) / 3600000);
 const minutes = Math.floor((remaining % 3600000) / 60000);
 const seconds = Math.floor((remaining % 60000) / 1000);
 if (remaining <= 0) return <span className="sale-countdown">LIMITED-TIME OFFER ENDED</span>;
 return <span className="sale-countdown" aria-label={`Discount ends in ${days} days, ${hours} hours, ${minutes} minutes and ${seconds} seconds`}>
   <span className="sale-label">DISCOUNT ENDS IN</span>
   <strong>{days}<small>D</small></strong><span>:</span>
   <strong>{String(hours).padStart(2,'0')}<small>H</small></strong><span>:</span>
   <strong>{String(minutes).padStart(2,'0')}<small>M</small></strong><span>:</span>
   <strong>{String(seconds).padStart(2,'0')}<small>S</small></strong>
 </span>;
}

export function SiteHeader() {
 const [open,setOpen] = useState(false);
 return <><div className="announcement"><span>Built for residential cleaning business owners in the U.S.</span><SaleCountdown/></div><header className="site-header"><div className="nav-inner"><nav className="desktop-nav" aria-label="Main navigation"><Link to="/solutions">Solutions</Link><Link to="/how-it-works">How It Works</Link></nav><Link to="/" className="wordmark" onClick={()=>setOpen(false)}>THE LAUNCH ERA</Link><nav className="desktop-nav nav-right" aria-label="More navigation"><Link to="/booking-lead-automation">Booking + Lead Automation</Link><Link to="/help">Help <ArrowUpRight size={11} className="inline" /></Link></nav><Button variant="ghost" size="icon" className="mobile-menu-trigger" aria-label={open?'Close navigation':'Open navigation'} aria-expanded={open} onClick={()=>setOpen(!open)}>{open?<X/>:<Menu/>}</Button></div>{open&&<nav className="mobile-nav" aria-label="Mobile navigation"><Link to="/solutions" onClick={()=>setOpen(false)}>Solutions</Link><Link to="/how-it-works" onClick={()=>setOpen(false)}>How It Works</Link><Link to="/booking-lead-automation" onClick={()=>setOpen(false)}>Booking + Lead Automation</Link><Link to="/help" onClick={()=>setOpen(false)}>Help & Get in Touch <ArrowUpRight size={14} className="inline"/></Link></nav>}</header></>;
}
export function SiteFooter() { return <footer className="site-footer"><div className="container"><div className="footer-top"><div><Link className="wordmark" to="/">THE LAUNCH ERA</Link><p>A little less admin. A lot more possibility.</p></div><nav className="footer-links" aria-label="Footer navigation"><Link to="/solutions">Solutions</Link><Link to="/how-it-works">How It Works</Link><Link to="/help">Get in Touch ↗</Link></nav></div><div className="footer-bottom"><span>© 2026 THE LAUNCH ERA. All rights reserved.</span><span>Thoughtfully built for U.S. residential cleaning businesses.</span></div></div></footer> }