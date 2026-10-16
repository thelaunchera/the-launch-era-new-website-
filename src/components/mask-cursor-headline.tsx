import { useEffect, useRef, type ReactNode } from 'react';
import './mask-cursor-headline.css';

type MaskCursorHeadlineProps = { children: ReactNode };

/**
 * Decorative blue cursor reveal. The original h2 stays in the DOM and is
 * readable/indexable. The second copy is fully decorative and never intercepts
 * taps, clicks or keyboard focus.
 */
export function MaskCursorHeadline({ children }: MaskCursorHeadlineProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const maskRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapper = wrapRef.current;
    const mask = maskRef.current;
    if (!wrapper || !mask) return;

    const finePointer = window.matchMedia('(pointer: fine)');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let enabled = false;
    let pointerInside = false;
    let frame = 0;
    let x = 0, y = 0, targetX = 0, targetY = 0;
    let radius = 0, targetRadius = 0, radiusVelocity = 0;

    const render = () => {
      x += (targetX - x) * 0.14;
      y += (targetY - y) * 0.14;
      radiusVelocity = (radiusVelocity + (targetRadius - radius) * 0.3) * 0.45;
      radius = Math.max(0, radius + radiusVelocity);
      if (Math.abs(radius - targetRadius) < 0.1 && Math.abs(radiusVelocity) < 0.1) {
        radius = targetRadius;
        radiusVelocity = 0;
      }
      mask.style.clipPath = `circle(${radius.toFixed(2)}px at ${x.toFixed(2)}px ${y.toFixed(2)}px)`;
      if (Math.abs(targetX - x) > 0.1 || Math.abs(targetY - y) > 0.1 || radius !== targetRadius) {
        frame = window.requestAnimationFrame(render);
      } else {
        frame = 0;
      }
    };

    const startFrame = () => {
      if (!frame) frame = window.requestAnimationFrame(render);
    };
    const move = (event: PointerEvent) => {
      if (!enabled || event.pointerType === 'touch') return;
      const rect = wrapper.getBoundingClientRect();
      targetX = event.clientX - rect.left;
      targetY = event.clientY - rect.top;
      if (!pointerInside) {
        pointerInside = true;
        x = targetX;
        y = targetY;
      }
      // Supports linked/interactive headline variants without affecting these pages.
      targetRadius = event.target instanceof Element && event.target.closest('a, button') ? 70 : 45;
      startFrame();
    };
    const leave = () => {
      pointerInside = false;
      targetRadius = 0;
      if (enabled) startFrame();
    };
    const updateMode = () => {
      enabled = finePointer.matches && !reducedMotion.matches;
      wrapper.classList.toggle('tle-mask-headline--enabled', enabled);
      if (!enabled) {
        pointerInside = false;
        radius = 0;
        targetRadius = 0;
        radiusVelocity = 0;
        if (frame) window.cancelAnimationFrame(frame);
        frame = 0;
        mask.style.clipPath = 'circle(0px at 50% 50%)';
      }
    };

    wrapper.addEventListener('pointerenter', move);
    wrapper.addEventListener('pointermove', move);
    wrapper.addEventListener('pointerleave', leave);
    wrapper.addEventListener('pointercancel', leave);
    finePointer.addEventListener('change', updateMode);
    reducedMotion.addEventListener('change', updateMode);
    updateMode();

    return () => {
      wrapper.removeEventListener('pointerenter', move);
      wrapper.removeEventListener('pointermove', move);
      wrapper.removeEventListener('pointerleave', leave);
      wrapper.removeEventListener('pointercancel', leave);
      finePointer.removeEventListener('change', updateMode);
      reducedMotion.removeEventListener('change', updateMode);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className="tle-mask-headline" ref={wrapRef}>
      <h2 className="editorial tle-mask-headline__base">{children}</h2>
      <div className="tle-mask-headline__mask" ref={maskRef} aria-hidden="true">
        <h2 className="editorial tle-mask-headline__reveal">{children}</h2>
      </div>
    </div>
  );
}
