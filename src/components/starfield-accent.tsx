import { useEffect, useRef, useState } from "react";
import "./starfield-accent.css";

/** Decorative, isolated Three.js scene. The host owns scrolling and pointer input. */
export function StarfieldAccent() {
  const host = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const node = host.current;
    if (!node) return;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    let raf = 0;
    let x = 0,
      y = 0,
      active = false;
    const send = () => {
      raf = 0;
      const rect = node.getBoundingClientRect();
      frame.current?.contentWindow?.postMessage(
        {
          type: "tle-starfield",
          visible: visible && !document.hidden && !motion.matches,
          scroll: Math.min(
            1,
            Math.max(0, scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight)),
          ),
          x: ((x - rect.left) / Math.max(1, rect.width)) * 2 - 1,
          y: 1 - ((y - rect.top) / Math.max(1, rect.height)) * 2,
          active: active && x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom,
        },
        location.origin,
      );
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(send);
    };
    const pointer = (event: PointerEvent) => {
      x = event.clientX;
      y = event.clientY;
      active = true;
      schedule();
    };
    const leave = () => {
      active = false;
      schedule();
    };
    const preferences = () => {
      setMounted(!motion.matches && visible);
      schedule();
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? false;
      if (visible && !motion.matches) setMounted(true);
      schedule();
    });
    observer.observe(node);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("pointermove", pointer, { passive: true });
    window.addEventListener("blur", leave);
    document.documentElement.addEventListener("pointerleave", leave);
    window.addEventListener("message", schedule);
    document.addEventListener("visibilitychange", schedule);
    motion.addEventListener("change", preferences);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("pointermove", pointer);
      window.removeEventListener("blur", leave);
      document.documentElement.removeEventListener("pointerleave", leave);
      window.removeEventListener("message", schedule);
      document.removeEventListener("visibilitychange", schedule);
      motion.removeEventListener("change", preferences);
    };
  }, []);
  return (
    <div ref={host} className="tle-starfield-accent" aria-hidden="true">
      {mounted && (
        <iframe
          ref={frame}
          src="/assets/tle-starfield-scene.html?v=20261018-1"
          title=""
          tabIndex={-1}
        />
      )}
    </div>
  );
}
