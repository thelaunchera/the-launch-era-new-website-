import { ArrowRight } from 'lucide-react';

/** The homepage scroll anchor stays native: first tap navigates to #hero-next.
 * The two word copies are purely visual; assistive technology sees one label.
 * Desktop hover/keyboard focus and phone press animate without JS handlers. */
export function HeroSplitWordLink({ lang = 'en' }: { lang?: 'en' | 'es' }) {
  const es = lang === 'es';
  const title = es ? 'Descubre cómo funciona' : 'See how it works';
  const reveal = es ? 'Ver el flujo' : 'Explore the flow';

  return (
    <a
      className="tle-hero-split-link"
      href="#hero-next"
      aria-label={es ? 'Descubre cómo funciona el sistema de reservas' : 'See how the booking flow works'}
    >
      <span className="tle-hero-split-stack" aria-hidden="true">
        <span className="tle-hero-split-front tle-hero-split-upper">
          {title}<ArrowRight size={18} aria-hidden="true" />
        </span>
        <span className="tle-hero-split-front tle-hero-split-lower">
          {title}<ArrowRight size={18} aria-hidden="true" />
        </span>
        <span className="tle-hero-split-reveal">
          {reveal}<ArrowRight size={18} aria-hidden="true" />
        </span>
      </span>
    </a>
  );
}
