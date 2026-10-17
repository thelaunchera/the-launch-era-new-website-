import { MarketingCTA } from '@/components/marketing-cta';
import { ServiceFAQ } from '@/components/service-faq';
import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState, type FormEvent } from 'react';
import { ArrowRight, Globe2, MessageSquareText, Workflow, BellRing, Check, RotateCcw, Sparkles } from 'lucide-react';

export const Route=createFileRoute('/website-automation')({head:()=>({meta:[{title:'Website Automation for Cleaning Businesses | The Launch Era'},{name:'description',content:'Connect your existing cleaning business website to a clearer inquiry, routing and follow-up workflow.'},{property:'og:title',content:'Website Automation | The Launch Era'},{property:'og:description',content:'Turn website inquiries into organized next steps and follow-up.'},{name:'twitter:card',content:'summary_large_image'}],links:[{rel:'canonical',href:'https://thelaunchera.com/website-automation'},{rel:'alternate',hrefLang:'en-US',href:'https://thelaunchera.com/website-automation'},{rel:'alternate',hrefLang:'es-US',href:'https://thelaunchera.com/es/website-automation/'},{rel:'alternate',hrefLang:'x-default',href:'https://thelaunchera.com/website-automation'}]}),component:Page});

const stages=[
  {label:'01 · RECEIVED',title:'You have the details',detail:'Your customer’s name and service request show up together.',Icon:MessageSquareText},
  {label:'02 · ORGANIZED',title:'Everything in one place',detail:'No more searching through messages to find the details.',Icon:Workflow},
  {label:'03 · NEXT STEP',title:'Know who to follow up with',detail:'You can see who needs a reply and what to do next.',Icon:BellRing},
] as const;

function Page(){
  const [name,setName]=useState('Jordan M.');
  const [service,setService]=useState('Recurring cleaning');
  const [run,setRun]=useState(0);
  const [active,setActive]=useState(-1);

  useEffect(()=>{
    if(!run) return;
    setActive(0);
    const t1=window.setTimeout(()=>setActive(1),650);
    const t2=window.setTimeout(()=>setActive(2),1300);
    return()=>{window.clearTimeout(t1);window.clearTimeout(t2)};
  },[run]);

  function submit(e:FormEvent<HTMLFormElement>){
    e.preventDefault();
    if(!name.trim()) setName('New lead');
    setRun(v=>v+1);
  }

  function reset(){
    setActive(-1);
    setRun(0);
    setName('Jordan M.');
    setService('Recurring cleaning');
  }

  const current=active>=0?stages[active]:null;

  return <main style={{background:'#faf4f7'}}>
    <section className="container service-hero">
      <div className="eyebrow">WEBSITE AUTOMATION</div>
      <p className="booking-offer-line service-discount-offer"><span className="booking-offer-tag">SPECIAL OFFER</span><span className="booking-offer-price"><del>$59.99</del><strong>$31.99</strong></span></p><h1 className="editorial">Keep your website. Upgrade what happens next.</h1>
      <p>Already have a website? We help organize the inquiries from your existing contact or quote form, so you can respond and follow up without losing track.</p>
      <MarketingCTA className="cta-button service-cta" href="/service-checkout/?offer=website-automation&lang=en">Get Started — $31.99 <ArrowRight/></MarketingCTA><p className="muted" style={{fontSize:13,margin:"13px 0 10px",lineHeight:1.6}}>Initial setup: an estimated 48 hours of production after we receive your completed setup form and confirm the details.</p><div className="service-proof-strip" aria-label="Service details"><span>YOUR EXISTING WEBSITE</span><span>INQUIRY ROUTING</span><span>ONE-TIME SETUP</span></div>
    </section>

    <section className="container service-story">
      <div className="service-demo-kicker"><Sparkles/> TRY IT — INTERACTIVE EXAMPLE</div>

      <div className="web-automation-scene web-automation-live">
        <div className="web-browser">
          <div className="browser-bar"><i/><i/><i/><span>yourcleaningbusiness.com</span></div>
          <div className="browser-page">
            <Globe2/>
            <strong>New inquiry</strong>
            <p>See how a new customer request could reach you without getting lost.</p>
            <form className="automation-demo-form" onSubmit={submit}>
              <label>
                <span>Name + contact</span>
                <input value={name} onChange={e=>setName(e.target.value)} aria-label="Lead name or contact"/>
              </label>
              <label>
                <span>Service needed</span>
                <select value={service} onChange={e=>setService(e.target.value)} aria-label="Service needed">
                  <option>Recurring cleaning</option>
                  <option>Deep cleaning</option>
                  <option>Move-in / move-out</option>
                  <option>Office cleaning</option>
                  <option>Specialty cleaning</option>
                </select>
              </label>
              <button type="submit">See what happens <ArrowRight/></button>
            </form>
            <div className="automation-demo-note">
              <span>{active<0?'Ready when you are':'Demo lead'}</span>
              <strong>{active<0?'Try it out. This is an example, so nothing will be sent.':name+' · '+service}</strong>
            </div>
          </div>
        </div>

        <div className={"automation-spine "+(active>=0?'running':'')}>
          <span/><Workflow/><span/>
        </div>

        <div className="automation-results automation-results-live">
          {stages.map(({label,title,detail,Icon},i)=>{
            const done=active>=i;
            const selected=active===i;
            return <button
              type="button"
              key={label}
              className={(done?'done ':'')+(selected?'active ':'')}
              onClick={()=>active>=0&&setActive(i)}
              disabled={active<0}
            >
              <Icon/>
              <p><small>{label}</small><strong>{title}</strong><span>{detail}</span></p>
              <span className="stage-check">{done?<Check/>:<b>{i+1}</b>}</span>
            </button>
          })}
        </div>
      </div>

      <div className={"automation-live-status "+(active>=0?'show':'')}>
        <div>
          <small>{current?current.label:'TAKE A LOOK'}</small>
          <strong>{current?current.title:'Try a sample customer request.'}</strong>
          <p>{current?current.detail:'Try the example above, then tap any step to see how it helps.'}</p>
        </div>
        {active>=0&&<button type="button" onClick={reset}><RotateCcw/> Try another request</button>}
      </div>

      <div className="service-endcap">
        <span>YOUR WEBSITE</span><ArrowRight/><span>INQUIRY</span><ArrowRight/><span>AUTOMATION</span><ArrowRight/><strong>NEXT STEP ✓</strong>
        <small>Connect your existing inquiry form · One-time setup $31.99 · Keep new requests from getting lost.</small>
      </div>
    </section>
  <ServiceFAQ topic="website" lang="en"/></main>
}