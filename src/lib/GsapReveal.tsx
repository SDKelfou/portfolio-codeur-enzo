import { useLayoutEffect, useRef } from "react";
import type { ReactNode } from "react";
import { ensureGsap, gsap } from "./gsapSetup";
import { useReducedMotion } from "./useReducedMotion";

interface GsapRevealProps {
  children: ReactNode;
  dir?: "up" | "left" | "right" | "scale";
  delay?: number;
  className?: string;
  as?: "div" | "li";
  distance?: number;
}

/** Scroll-triggered reveal, GSAP/ScrollTrigger-powered: fades in and slides
 *  from the given direction as the element crosses into view. Each mount
 *  gets its own gsap.context() so ScrollTrigger instances are cleaned up
 *  correctly on unmount (route changes, etc). */
export function GsapReveal({ children, dir = "up", delay = 0, className = "", as = "div", distance = 56 }: GsapRevealProps) {
  const ref = useRef<HTMLDivElement | HTMLLIElement>(null);
  const reducedMotion = useReducedMotion();

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || reducedMotion) return;
    ensureGsap();

    const from: gsap.TweenVars = { opacity: 0 };
    if (dir === "up") from.y = distance;
    if (dir === "left") from.x = -distance;
    if (dir === "right") from.x = distance;
    if (dir === "scale") from.scale = 0.88;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        from,
        {
          opacity: 1,
          x: 0,
          y: 0,
          scale: 1,
          duration: 0.95,
          delay: delay / 1000,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 88%",
            toggleActions: "play none none none",
          },
        }
      );
    });

    return () => ctx.revert();
  }, [dir, delay, distance, reducedMotion]);

  const Tag = as;
  return (
    <Tag
      ref={ref as never}
      className={className}
      style={reducedMotion ? undefined : { opacity: 0 }}
    >
      {children}
    </Tag>
  );
}
