import { Bell, CircleCheck, MessageCircle, TrendingUp } from 'lucide-react';
import type { CSSProperties } from 'react';
import './booking-floating-chips.css';

type Language = 'en' | 'es';

const previewChips = [
  { id: 'signup', Icon: Bell, en: 'New signup · Maya R.', es: 'Nuevo registro · Maya R.', duration: '3.3s', delay: '-1.1s' },
  { id: 'metric', Icon: TrendingUp, en: '+24% revenue', es: '+24% ingresos', duration: '4.1s', delay: '-2.4s' },
  { id: 'payment', Icon: CircleCheck, en: 'Paid $480', es: 'Pagado $480', duration: '3.7s', delay: '-.7s' },
  { id: 'messages', Icon: MessageCircle, en: '3 new messages', es: '3 mensajes nuevos', duration: '3.9s', delay: '-3.2s' },
] as const;

/** Decorative sample UI only: no real clients, revenue claims, purchases or events. */
export function BookingFloatingChips({ lang = 'en' }: { lang?: Language }) {
  return (
    <div className="booking-float-field" aria-hidden="true">
      {previewChips.map(({ id, Icon, en, es, duration, delay }, index) => (
        <div
          key={id}
          className={`booking-float-item booking-float-item--${id}`}
          style={{
            '--chip-duration': duration,
            '--chip-phase': delay,
            '--chip-enter-delay': `${index * 100}ms`,
          } as CSSProperties}
        >
          <div className="booking-float-pill">
            <span className="booking-float-icon"><Icon size={17} strokeWidth={2} /></span>
            <span className="booking-float-copy">
              <strong>{lang === 'es' ? es : en}</strong>
              <small>{lang === 'es' ? 'Ejemplo ilustrativo' : 'Illustrative example'}</small>
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
