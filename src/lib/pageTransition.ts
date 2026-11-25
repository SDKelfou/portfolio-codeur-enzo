import { flushSync } from "react-dom";

type VT = { ready: Promise<void>; finished: Promise<void>; skipTransition: () => void };
let current: VT | null = null;

const DURATION = 760;

function waveFrames() {
  const steps = 18;
  const points = 28;
  const phase0 = Math.random() * Math.PI * 2;
  const frames: Keyframe[] = [];
  for (let f = 0; f <= steps; f++) {
    const p = f / steps;
    const e = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
    const base = 114 - e * 132;
    const amp = 2 + 9 * Math.sin(Math.PI * Math.min(1, e * 1.1));
    const phase = phase0 + e * Math.PI * 3;
    const edge: string[] = [];
    for (let k = points; k >= 0; k--) {
      const y = (k / points) * 100;
      const x = base + amp * Math.sin((y / 100) * Math.PI * 2.4 + phase) + amp * 0.35 * Math.sin((y / 100) * Math.PI * 6.2 - phase * 1.7);
      edge.push(`${x.toFixed(2)}% ${y.toFixed(2)}%`);
    }
    frames.push({ clipPath: `polygon(140% 0%, 140% 100%, ${edge.join(", ")})`, offset: p });
  }
  return frames;
}

export function withPageTransition(update: () => void, after?: () => void) {
  const doc = document as Document & { startViewTransition?: (cb: () => void) => VT };
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!doc.startViewTransition || reduced) {
    flushSync(update);
    after?.();
    return;
  }
  current?.skipTransition();
  const root = document.documentElement;
  root.classList.add("vt-page");
  const vt = doc.startViewTransition(() => {
    flushSync(update);
    after?.();
  });
  current = vt;
  vt.ready
    .then(() => {
      const easing = "linear";
      root.animate(waveFrames(), { duration: DURATION, easing, fill: "both", pseudoElement: "::view-transition-new(root)" });
      root.animate(
        [
          { transform: "none", filter: "none" },
          { transform: "perspective(1400px) translateX(-7%) rotateY(9deg) scale(0.94)", filter: "brightness(0.82)" },
        ],
        { duration: DURATION, easing: "cubic-bezier(.65,0,.35,1)", fill: "both", pseudoElement: "::view-transition-old(root)" }
      );
    })
    .catch(() => {});
  vt.finished.finally(() => {
    if (current === vt) {
      root.classList.remove("vt-page");
      current = null;
    }
  });
}
