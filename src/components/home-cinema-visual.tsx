import { useEffect, useRef, useState } from 'react';

type Lang = 'en' | 'es';

const SCENES = {
  en: [
    { label: '01 / THE REQUEST', title: 'You keep cleaning.', detail: 'Your booking link is ready when a customer reaches out.', tab: 'Request' },
    { label: '02 / BOOKING PAGE', title: 'The details come together.', detail: 'Your customer shares the service and requested time.', tab: 'Booking' },
    { label: '03 / COMMAND CENTER', title: 'You know what comes next.', detail: 'Review requests and keep track of follow-ups.', tab: 'Next step' },
  ],
  es: [
    { label: '01 / LA SOLICITUD', title: 'Tú sigues limpiando.', detail: 'Tu enlace de reservas está listo cuando llega una consulta.', tab: 'Consulta' },
    { label: '02 / BOOKING PAGE', title: 'Los detalles llegan juntos.', detail: 'El cliente comparte el servicio y el horario solicitado.', tab: 'Reserva' },
    { label: '03 / COMMAND CENTER', title: 'Sabes cuál es el siguiente paso.', detail: 'Revisa solicitudes y da seguimiento desde un lugar.', tab: 'Siguiente' },
  ],
} as const;

/** Editorial story only. Not a live lead feed; no personal/customer data. */
export function HomeCinemaVisual({lang = 'en'}: {lang?: Lang}) {
  const [step, setStep] = useState(0);
  const stageRef = useRef<HTMLDivElement>(null);
  const chosenByVisitor = useRef(false);

  useEffect(() => {
    const node = stageRef.current;
    if (!node || !('IntersectionObserver' in window)) return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const dataSaver = (navigator as Navigator & {connection?: {saveData?: boolean}}).connection?.saveData;
    if (motion.matches || dataSaver) return;
    let seen = false;
    let clock: number | undefined;
    const sync = () => {
      if (clock !== undefined) { window.clearInterval(clock); clock = undefined; }
      if (seen && !document.hidden && !chosenByVisitor.current && !motion.matches) {
        clock = window.setInterval(() => setStep(current => (current + 1) % 3), 5200);
      }
    };
    const observer = new IntersectionObserver(entries => {
      seen = Boolean(entries[0]?.isIntersecting);
      sync();
    }, {threshold: .25});
    observer.observe(node);
    document.addEventListener('visibilitychange', sync);
    motion.addEventListener('change', sync);
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', sync);
      motion.removeEventListener('change', sync);
      if (clock !== undefined) window.clearInterval(clock);
    };
  }, []);

  const scenes = SCENES[lang];
  const copy = scenes[step];
  return <div ref={stageRef} className="tle-cinema" data-step={step} aria-label={lang==='es'?'Recorrido visual de la Booking Page al Command Center':'Visual journey from Booking Page to Command Center'}>
    <div className="tle-cinema-media" aria-hidden="true">
      <img src="/assets/tle-booking-interface.jpg" className="tle-cinema-ui tle-cinema-ui--booking" alt="" loading="lazy" decoding="async" width="960" height="640"/>
      <img src={step > 0 ? "/assets/bundle-landing/bundle-command.png" : undefined} className="tle-cinema-ui tle-cinema-ui--command" alt="" loading="lazy" decoding="async" width="960" height="640"/>
    </div>
    <div className="tle-cinema-content">
      <span className="tle-cinema-overline">THE LAUNCH ERA <span aria-hidden="true">/</span> {copy.label}</span>
      <div className="tle-cinema-copy" key={step}>
        <strong>{copy.title}</strong>
        <p>{copy.detail}</p>
      </div>
      <div className="tle-cinema-tabs" role="group" aria-label={lang==='es'?'Explora los tres pasos del sistema':'Explore the three steps of the system'}>
        {scenes.map((scene,i)=><button key={scene.label} type="button" aria-pressed={step===i} onClick={()=>{chosenByVisitor.current=true;setStep(i);}}>
          <span className="tle-cinema-tab-number">0{i+1}</span><span>{scene.tab}</span>
        </button>)}
      </div>
    </div>
  </div>;
}
