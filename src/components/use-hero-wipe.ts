import { useEffect, useRef, useState } from 'react';

/** Reveal once when the actual hero enters the viewport; CSS handles the motion. */
export function useHeroWipe() {
  const heroRef = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    if (!('IntersectionObserver' in window)) {
      setRevealed(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) {
        setRevealed(true);
        observer.disconnect();
      }
    }, { threshold: 0.12 });
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  return { heroRef, revealed };
}
