import { useEffect, useRef } from 'react';
import './success-confirmation.css';

type Language = 'en' | 'es';
type Detail = { label: string; value: string };
type Props = {
  language: Language;
  kind: 'contact' | 'freebie';
  name?: string;
  email?: string;
  business?: string;
  service?: string;
  emailSent?: boolean;
  onAgain?: () => void;
  compact?: boolean;
};

/**
 * Never mount this component on submit intent or an unconfirmed network result.
 * Render it only after the existing API responds with HTTP success + {ok:true}.
 */
export function SuccessConfirmation({
  language, kind, name, email, business, service, emailSent = false, onAgain, compact = false
}: Props) {
  const es = language === 'es';
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { heading.current?.focus({ preventScroll: true }); }, []);

  const isContact = kind === 'contact';
  const headingText = isContact
    ? (es ? '¡Consulta recibida!' : 'Request received!')
    : emailSent
      ? (es ? '¡Solicitud recibida!' : 'Request received!')
      : (es ? 'Recibimos tu solicitud' : 'We received your request');
  const details: Detail[] = isContact
    ? [
        ...(name ? [{ label: es ? 'Nombre' : 'Name', value: name }] : []),
        ...(business ? [{ label: es ? 'Negocio' : 'Business', value: business }] : []),
        ...(service ? [{ label: es ? 'Servicio' : 'Service', value: service }] : []),
        ...(email ? [{ label: es ? 'Respuesta a' : 'Reply to', value: email }] : [])
      ]
    : (email ? [{label: es ? 'Correo' : 'Email', value: email}, {label: es ? 'Recurso' : 'Resource', value: 'Cleaning Lead Tracker + Starter Kit'}] : []);

  const explanation = isContact
    ? (es
      ? 'Tu mensaje quedó registrado. Revisaremos la consulta y te responderemos por correo.'
      : 'Your message has been saved. We’ll review your request and reply by email.')
    : emailSent
      ? (es
        ? 'Tu solicitud quedó registrada y el envío del recurso fue aceptado. Revisa tu correo y, si no aparece, Promociones o Spam.'
        : 'Your request was saved and the resource email was accepted for sending. Check your inbox, then Promotions or Spam.')
      : (es
        ? 'Tu solicitud quedó registrada. El envío del correo aún no está confirmado; no necesitas enviar otra solicitud.'
        : 'Your request was saved. Email delivery has not been confirmed yet; there’s no need to resubmit.');

  return <section
    className={'tle-success-card' + (compact ? ' tle-success-compact' : '')}
    data-success-kind={kind}
    role="status"
    aria-live="polite"
    aria-atomic="true"
  >
    <div className="tle-success-disc" aria-hidden="true">
      <span className="tle-success-ring"/>
      <svg viewBox="0 0 76 76" fill="none" aria-hidden="true">
        <circle cx="38" cy="38" r="37" fill="#E7F5ED"/>
        <path className="tle-success-check" d="M23 38.5 33.2 49 54 27.5" pathLength="1" stroke="#218856" strokeWidth="4.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
    <div className="tle-success-eyebrow">{es ? 'THE LAUNCH ERA · CONFIRMACIÓN' : 'THE LAUNCH ERA · CONFIRMATION'}</div>
    <h2 className="tle-success-title" ref={heading} tabIndex={-1}>{headingText}</h2>
    <p className="tle-success-copy">{explanation}</p>
    {details.length > 0 && <dl className="tle-success-summary">
      {details.map((item, index) => <div className="tle-success-row" key={item.label} style={{ '--tle-row-index': index } as React.CSSProperties}>
        <dt>{item.label}</dt><dd>{item.value}</dd>
      </div>)}
    </dl>}
    <div className="tle-success-actions">
      {isContact && onAgain && <button className="tle-success-primary" type="button" onClick={onAgain}>
        {es ? 'Enviar otra consulta' : 'Send another inquiry'}
      </button>}
      <a href={es ? '/es/#soluciones' : '/#solutions'} className={isContact ? 'tle-success-secondary' : 'tle-success-primary'}>
        {es ? 'Explorar servicios' : 'Explore services'}
      </a>
    </div>
  </section>;
}
