import { Bot, CalendarDays, ClipboardList, FileText, LayoutDashboard, MessagesSquare, Send, Sparkles, Users, Workflow, type LucideIcon } from 'lucide-react';
import './workflow-logo-marquee.css';

type Language = 'en' | 'es';
type Wordmark = { en: string; es: string; Icon?: LucideIcon; brand?: boolean };

// First-party products and workflow features only. These are not third-party customer endorsements.
const firstRow: readonly Wordmark[] = [
  { en: 'The Launch Era', es: 'The Launch Era', brand: true },
  { en: 'Booking Page', es: 'Booking Page', Icon: CalendarDays },
  { en: 'Command Center', es: 'Command Center', Icon: LayoutDashboard },
  { en: 'Cleaning App', es: 'Cleaning App', Icon: Sparkles },
  { en: 'AI Assistants', es: 'Asistentes de IA', Icon: Bot },
  { en: 'Lead Follow-ups', es: 'Seguimiento de leads', Icon: Send },
];

const secondRow: readonly Wordmark[] = [
  { en: 'Client Requests', es: 'Solicitudes de clientes', Icon: Users },
  { en: 'Booking Calendar', es: 'Calendario de reservas', Icon: CalendarDays },
  { en: 'Quotes & Invoices', es: 'Cotizaciones y facturas', Icon: FileText },
  { en: 'Lead Tracker', es: 'Seguimiento de consultas', Icon: ClipboardList },
  { en: 'Automatic Follow-ups', es: 'Seguimientos automáticos', Icon: MessagesSquare },
  { en: 'Connected Workflows', es: 'Procesos conectados', Icon: Workflow },
];

function LogoRow({ items, lang, reverse = false }: { items: readonly Wordmark[]; lang: Language; reverse?: boolean }) {
  const words = items.map(item => item[lang]).join(', ');
  const renderSet = (duplicate: boolean) => (
    <div className="tle-wordmark-group" aria-hidden={duplicate} key={duplicate ? 'duplicate' : 'original'}>
      {items.map(item => {
        const Icon = item.Icon;
        return <span className="tle-wordmark" key={item.en}>
          {item.brand
            ? <img src="/assets/brand/tle-mark.svg" alt="" loading="lazy" width="32" height="32" />
            : Icon ? <Icon size={25} strokeWidth={1.6} aria-hidden="true" /> : null}
          <span>{item[lang]}</span>
        </span>;
      })}
    </div>
  );
  return <div className={`tle-logo-row${reverse ? ' tle-logo-row--reverse' : ''}`} role="img" aria-label={words}>
    <div className="tle-logo-track">{renderSet(false)}{renderSet(true)}</div>
  </div>;
}

/** Decorative, accessible marquee between the contact card and the final CTA. */
export function WorkflowLogoMarquee({ lang = 'en' }: { lang?: Language }) {
  const es = lang === 'es';
  return <section className="tle-logo-marquee" aria-labelledby={`tle-logo-marquee-heading-${lang}`}>
    <div className="tle-logo-marquee-intro">
      <h2 id={`tle-logo-marquee-heading-${lang}`}>{es ? 'UNA EXPERIENCIA MÁS CONECTADA' : 'ONE CONNECTED EXPERIENCE'}</h2>
      <p>{es ? 'Desde la primera consulta hasta la próxima reserva.' : 'From the first inquiry to the next booked clean.'}</p>
    </div>
    <div className="tle-logo-marquee-rows">
      <LogoRow items={firstRow} lang={lang} />
      <LogoRow items={secondRow} lang={lang} reverse />
    </div>
  </section>;
}
