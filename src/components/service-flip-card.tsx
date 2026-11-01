import type { ReactNode } from 'react';
import './service-flip-card.css';

/* Simple, dependable service cards. No 3D faces or tap-to-reveal state:
   the photo, name and next action must always be visible on iOS/Android. */
type Props = {
  title: string;
  description: string;
  href: string;
  points: string[];
  lang?: 'en' | 'es';
  children: ReactNode;
};

export function ServiceFlipCard({ title, href, lang = 'en', children }: Props) {
  const es = lang === 'es';
  return <article className="service-card tle-service-static">
    <a className="tle-service-static__link" href={href}
       aria-label={(es ? 'Conoce ' : 'Explore ') + title}>
      {children}
      <span className="tle-service-static__footer">
        <span className="tle-service-static__cta">{es ? 'Ver servicio' : 'See details'}</span>
      </span>
    </a>
  </article>;
}
