import { useEffect } from 'react';

/**
 * Public homepage-only tonal transition for the booking explanation and preview.
 * Changes no booking state, CTA destination, customer data or checkout behavior.
 */
export function BookingToneShift() {
  useEffect(() => {
    const section = document.querySelector<HTMLElement>('.sales-home .booking-section');
    const copy = section?.querySelector<HTMLElement>('.booking-copy');
    const preview = section?.querySelector<HTMLElement>('.home-booking-explorer');
    if (!section || !copy || !preview) return;

    let frame = 0;
    const paint = () => {
      frame = 0;
      if (!section.isConnected) return;
      const middle = window.innerHeight / 2;
      const outer = section.getBoundingClientRect();
      const intro = copy.getBoundingClientRect();
      const detail = preview.getBoundingClientRect();
      const visible = outer.bottom > window.innerHeight * .12 && outer.top < window.innerHeight * .88;
      section.dataset.bookingVisible = String(visible);
      if (!visible) return;

      // Stacked on phones: the section passing the viewport midpoint wins.
      // Side-by-side on desktop: shift at the visual midpoint of the shared story.
      const stacked = detail.top >= intro.bottom - 8;
      // Desktop columns share one visual row; use the preview's actual
      // viewport position rather than an arbitrary fraction of a tall wrapper.
      // Tablet previews can exceed the height of the text column.
      const second = stacked
        ? detail.top <= middle
        : detail.top + Math.min(detail.height * .18, 112) <= middle;
      section.dataset.tone = second ? '2' : '1';
    };
    const schedule = () => { if (!frame) frame = window.requestAnimationFrame(paint); };
    section.dataset.tone = '1';
    const observer = typeof IntersectionObserver === 'undefined' ? null :
      new IntersectionObserver(schedule, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });
    observer?.observe(copy);
    observer?.observe(preview);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    schedule();
    return () => {
      window.cancelAnimationFrame(frame);
      observer?.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      delete section.dataset.tone;
      delete section.dataset.bookingVisible;
    };
  }, []);

  return <div className="booking-tone-dots" aria-hidden="true"><span /><span /></div>;
}
