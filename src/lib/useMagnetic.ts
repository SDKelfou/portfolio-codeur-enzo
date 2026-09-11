import { useRef } from "react";
import type { PointerEvent } from "react";
import { gsap } from "./gsapSetup";
import { useReducedMotion } from "./useReducedMotion";

/** Magnetic hover: the element eases toward the cursor within its own
 *  bounds while hovered, and springs back on leave. Used on buttons and
 *  cards for that "premium, deliberate" micro-interaction feel. */
export function useMagnetic<T extends HTMLElement>(strength = 0.35) {
  const ref = useRef<T>(null);
  const reducedMotion = useReducedMotion();

  const onPointerMove = (e: PointerEvent<T>) => {
    if (reducedMotion) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - (rect.left + rect.width / 2);
    const y = e.clientY - (rect.top + rect.height / 2);
    gsap.to(el, { x: x * strength, y: y * strength, duration: 0.4, ease: "power3.out" });
  };

  const onPointerLeave = () => {
    if (reducedMotion) return;
    const el = ref.current;
    if (!el) return;
    gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1,0.4)" });
  };

  return { ref, onPointerMove, onPointerLeave };
}
