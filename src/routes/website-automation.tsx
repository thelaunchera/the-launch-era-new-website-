import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState, type FormEvent } from 'react';
import { ArrowRight, Globe2, MessageSquareText, Workflow, BellRing, Check, RotateCcw, Sparkles } from 'lucide-react';

export const Route=createFileRoute('/website-automation')({head:()=>({meta:[{title:'Website Automation for Cleaning Businesses | The Launch Era'},{name:'description',content:'Connect your existing cleaning business website to a clearer inquiry, routing and follow-up workflow.'},{property:'og:title',content:'Website Automation | The Launch Era'},{property:'og:description',content:'Turn website inquiries into organized next steps and follow-up.'},{name:'twitter:card',content:'summary_large_image'}],links:[{rel:'canonical',href:'https://thelaunchera.com/website-automation'},{rel:'alternate',hrefLang:'en-US',href:'https://thelaunchera.com/website-automation'},{rel:'alternate',hrefLang:'es-US',href:'https://thelaunchera.com/es/website-automation/'},{rel:'alternate',hrefLang:'x-default',href:'https://thelaunchera.com/website-automation'}]}),component:Page});

const stages=[
  {label:'01 · CAPTURED',title:'Inquiry organized',detail:'Name, contact and service are captured in one clean record.',Icon:MessageSquareText},
  {label:'02 · ROUTED',title:'Right next step',detail:'The inquiry is routed into the correct workflow instead of sitting in an inbox.',Icon:Workflow},
  {label:'03 · FOLLOW-UP',title:'Conversation keeps moving',detail:'A clear follow-up step is ready so the lead does not go quiet.',Icon:BellRing},
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
      <p className="booking-offer-line service-discount-offer"><span className="booking-offer-tag">30% OFF</span><span className="booking-offer-price"><del>$59.99</del><strong>$41.99</strong></span></p><h1 className="editorial">Keep your website. Upgrade what happens next.</h1>
      <p>Already have a website? We help organize the inquiries from your existing contact or quote form, so you can respond and follow up without losing track.</p>
      <a className="cta-button service-cta" href="/service-checkout/?offer=website-automation&lang=en">Get Started — $41.99 <ArrowRight/></a><div className="service-proof-strip" aria-label="Service details"><span>YOUR EXISTING WEBSITE</span><span>INQUIRY ROUTING</span><span>ONE-TIME SETUP</span></div>
    </section>

    <section className="container service-story">
      <div className="service-demo-kicker"><Sparkles/> TRY THE FLOW — THIS IS A LIVE PREVIEW</div>

      <div className="web-automation-scene web-automation-live">
        <div className="web-browser">
          <div className="browser-bar"><i/><i/><i/><span>yourcleaningbusiness.com</span></div>
          <div className="browser-page">
            <Globe2/>
            <strong>New inquiry</strong>
            <p>See what a cleaner lead flow feels like when the next step is already built in.</p>
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
              <button type="submit">Send inquiry <ArrowRight/></button>
            </form>
            <div className="automation-demo-note">
              <span>{active<0?'Ready to try':'Demo lead'}</span>
              <strong>{active<0?'Nothing is sent anywhere. Try the flow.':name+' · '+service}</strong>
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
          <small>{current?current.label:'LIVE PREVIEW'}</small>
          <strong>{current?current.title:'Send a sample inquiry to start.'}</strong>
          <p>{current?current.detail:'You can click each step after the flow starts to see what it is doing.'}</p>
        </div>
        {active>=0&&<button type="button" onClick={reset}><RotateCcw/> Try another inquiry</button>}
      </div>

      <div className="service-endcap">
        <span>YOUR WEBSITE</span><ArrowRight/><span>INQUIRY</span><ArrowRight/><span>AUTOMATION</span><ArrowRight/><strong>NEXT STEP ✓</strong>
        <small>Connect your existing inquiry form · One-time setup $41.99 · Keep every lead moving.</small>
      </div>
    </section>
  </main>
}