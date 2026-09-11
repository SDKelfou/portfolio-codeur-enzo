import { useLayoutEffect, useRef } from "react";
import { ensureGsap, gsap } from "./gsapSetup";
import { useReducedMotion } from "./useReducedMotion";

/** ScrollTrigger-scrubbed parallax: the element drifts vertically tied
 *  directly to scroll position (not time), so it never drifts out of sync.
 *  `speed` in roughly -0.3..0.3; positive drifts down, negative up. */
export function useGsapParallax<T extends HTMLElement>(speed = 0.15) {
  const ref = useRef<T>(null);
  const reducedMotion = useReducedMotion();

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || reducedMotion) return;
    ensureGsap();

    const ctx = gsap.context(() => {
      gsap.to(el, {
        yPercent: speed * 100,
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    });

    return () => ctx.revert();
  }, [speed, reducedMotion]);

  return ref;
}
