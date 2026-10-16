import { useEffect, useId, useRef, useState, type CSSProperties, type FormEvent, type ReactNode } from 'react';
import './contact-stepper.css';

type ContactStatus = 'idle' | 'sending' | 'done' | 'sent' | 'error';

type ContactStepsProps = {
  language: 'en' | 'es';
  status: ContactStatus;
  panels: readonly ReactNode[];
  finish: ReactNode;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void | Promise<void>;
  error?: ReactNode;
  disclaimer: ReactNode;
};

const STEP_COUNT = 3;

/** Presentation layer only. The existing contact handler stays responsible for actual delivery. */
export function ContactSteps({ language, status, panels, finish, onSubmit, error, disclaimer }: ContactStepsProps) {
  const es = language === 'es';
  const labels = es ? ['Contacto', 'Negocio', 'Mensaje'] : ['Contact', 'Business', 'Message'];
  const [step, setStep] = useState(0);
  const [height, setHeight] = useState<number | null>(null);
  const fieldsets = useRef<Array<HTMLFieldSetElement | null>>([]);
  const didMount = useRef(false);
  const id = useId().replace(/:/g, '');
  const busy = status === 'sending' || status === 'done';

  useEffect(() => {
    const panel = fieldsets.current[step];
    if (!panel) return;
    const measure = () => setHeight(Math.ceil(panel.getBoundingClientRect().height));
    measure();
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
    observer?.observe(panel);
    window.addEventListener('resize', measure, { passive: true });
    return () => { observer?.disconnect(); window.removeEventListener('resize', measure); };
  }, [step, panels]);

  useEffect(() => {
    if (!didMount.current) { didMount.current = true; return; }
    const field = fieldsets.current[step]?.querySelector<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>('input, select, textarea');
    field?.focus({ preventScroll: true });
  }, [step]);

  const validStep = (index: number) => {
    const panel = fieldsets.current[index];
    if (!panel) return false;
    const fields = Array.from(panel.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>('input, select, textarea'));
    for (const field of fields) {
      if (field.required && !field.value.trim()) {
        field.setCustomValidity(es ? 'Completa este campo.' : 'Please complete this field.');
        field.addEventListener('input', () => field.setCustomValidity(''), { once: true });
      }
      if (!field.checkValidity()) {
        field.focus({ preventScroll: false });
        field.reportValidity();
        return false;
      }
    }
    return true;
  };

  const advance = () => {
    if (busy || !validStep(step)) return;
    setStep(current => Math.min(STEP_COUNT - 1, current + 1));
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;
    if (step !== STEP_COUNT - 1) { advance(); return; }
    if (!validStep(step)) return;
    // Autofill can update earlier fields; do not send if a previous step is invalid.
    for (let index = 0; index < STEP_COUNT - 1; index++) {
      const panel = fieldsets.current[index];
      if (panel && Array.from(panel.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>('input, select, textarea')).some(field => !field.checkValidity())) {
        setStep(index);
        return;
      }
    }
    void onSubmit(event);
  };

  const shift = `${(-100 * step) / STEP_COUNT}%`;
  const progress = step / (STEP_COUNT - 1);

  return <form className="tle-contact-steps" onSubmit={submit} noValidate data-step={step}>
    <div className="tle-contact-progress" aria-label={es ? 'Progreso del formulario' : 'Form progress'}>
      <div className="tle-contact-progress-line" aria-hidden="true"><span style={{ transform: `scaleX(${progress})` }} /></div>
      {labels.map((label, index) => <div className="tle-contact-progress-point" key={label} data-state={index < step ? 'complete' : index === step ? 'current' : 'upcoming'}>
        <span className="tle-contact-progress-dot" aria-hidden="true">{index < step ? '✓' : index + 1}</span>
        <span className="tle-contact-progress-label">{label}</span>
      </div>)}
    </div>
    <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
      {es ? `Paso ${step + 1} de ${STEP_COUNT}: ${labels[step]}` : `Step ${step + 1} of ${STEP_COUNT}: ${labels[step]}`}
    </p>
    <div className="tle-contact-viewport" style={height === null ? undefined : { height: `${height}px` }}>
      <div className="tle-contact-track" style={{ '--tle-contact-shift': shift } as CSSProperties}>
        {panels.map((fields, index) => <fieldset
          key={index}
          ref={node => { fieldsets.current[index] = node; }}
          className="tle-contact-panel"
          inert={index !== step}
          aria-hidden={index !== step}
          aria-labelledby={`${id}-label-${index}`}
        >
          <legend id={`${id}-label-${index}`}>{labels[index]}</legend>
          {fields}
        </fieldset>)}
      </div>
    </div>
    {error}
    <div className="tle-contact-actions">
      {step > 0 && <button className="tle-contact-back" type="button" onClick={() => setStep(current => current - 1)} disabled={busy}>{es ? 'Atrás' : 'Back'}</button>}
      {step < STEP_COUNT - 1 ? <button className="tle-contact-next" type="button" onClick={advance} disabled={busy}>{es ? 'Siguiente' : 'Next'} <span aria-hidden="true">→</span></button> : finish}
    </div>
    <p className="form-disclaimer">{disclaimer}</p>
  </form>;
}
