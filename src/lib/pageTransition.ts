import { flushSync } from "react-dom";

/** Runs a route change inside a View Transition (a crack-shaped wipe,
 *  see index.css). Falls back to an instant change. Repeated clicks skip
 *  the transition in flight instead of queueing. */
type VT = { finished: Promise<void>; skipTransition: () => void };
let current: VT | null = null;

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
  vt.finished.finally(() => {
    if (current === vt) {
      root.classList.remove("vt-page");
      current = null;
    }
  });
}
