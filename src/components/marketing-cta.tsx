import type { AnchorHTMLAttributes, ReactNode } from 'react';

/* Presentation only. The native anchor keeps its real destination and behavior. */
type MarketingCTAProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'children'> & {
  children: ReactNode;
};
export function MarketingCTA({children,className='',href,...attrs}:MarketingCTAProps){
  // The demo and sample experiences must never receive promotional motion.
  if (!href || /demo|preview|\/command-center/i.test(href)){
    return <a {...attrs} href={href} className={className}>{children}</a>;
  }
  return <span className="tle-cta-pulse-shell">
    <span className="tle-cta-pulse-ring" aria-hidden="true"/>
    <span className="tle-cta-pulse-ring" aria-hidden="true"/>
    <a {...attrs} href={href} className={`${className} tle-cta-pulse-button`.trim()}>{children}</a>
  </span>;
}
