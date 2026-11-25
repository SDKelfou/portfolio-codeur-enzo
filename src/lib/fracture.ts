import { flushSync } from "react-dom";
import { applyTheme } from "./theme";
import type { Theme } from "./theme";

/**
 * REALITY FRACTURE — the theme switch.
 *
 * No drawn lines. The screen shatters into a fresh, random Voronoi mosaic
 * on every click (fine shards near the impact, larger ones further out),
 * and the new theme spreads through it the way a crack runs through
 * glass: a shortest-path walk over the shard graph with random, uneven
 * "resistance" on every edge, so the front forks, races down some paths,
 * stalls on others. You see the surface turn shard by shard; you never
 * see a line.
 *
 * Rendering: the View Transitions API freezes the old theme and renders
 * the new one live beneath it; the new view is masked by one SVG image
 * whose shards are grouped into time buckets with CSS animation delays.
 * The mask is decoded before the transition starts, so there is never a
 * frame where the whole new theme flashes through.
 */

const SPREAD = 820; // ms for the fracture to cross the screen
const FLIP = 120; // ms for one shard to turn
const BUCKET = 12; // ms granularity of the shard timeline
const STYLE_ID = "fracture-mask";

type ViewTransition = {
  ready: Promise<void>;
  finished: Promise<void>;
  skipTransition: () => void;
};

let active: ViewTransition | null = null;
let token = 0;

function gauss() {
  // Box–Muller
  return Math.sqrt(-2 * Math.log(Math.random() || 1e-9)) * Math.cos(2 * Math.PI * Math.random());
}

/** tiny binary min-heap for Dijkstra */
class Heap {
  private a: [number, number][] = [];
  push(v: [number, number]) {
    const a = this.a;
    a.push(v);
    let i = a.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (a[p][0] <= a[i][0]) break;
      [a[p], a[i]] = [a[i], a[p]];
      i = p;
    }
  }
  pop() {
    const a = this.a;
    const top = a[0];
    const last = a.pop()!;
    if (a.length) {
      a[0] = last;
      let i = 0;
      for (;;) {
        const l = i * 2 + 1;
        const r = l + 1;
        let m = i;
        if (l < a.length && a[l][0] < a[m][0]) m = l;
        if (r < a.length && a[r][0] < a[m][0]) m = r;
        if (m === i) break;
        [a[m], a[i]] = [a[i], a[m]];
        i = m;
      }
    }
    return top;
  }
  get size() {
    return this.a.length;
  }
}

async function buildMask(W: number, H: number, ox: number, oy: number) {
  const { Delaunay } = await import("d3-delaunay");
  const maxD = Math.hypot(Math.max(ox, W - ox), Math.max(oy, H - oy));
  const n = Math.round(Math.min(2600, Math.max(700, (W * H) / 850)));

  // denser near the impact point, like real shatter patterns
  const pts = new Float64Array(n * 2);
  for (let i = 0; i < n; i++) {
    let x: number;
    let y: number;
    if (Math.random() < 0.38) {
      const a = Math.random() * Math.PI * 2;
      const r = maxD * Math.pow(Math.random(), 2.1);
      x = ox + Math.cos(a) * r;
      y = oy + Math.sin(a) * r;
    } else {
      x = Math.random() * W;
      y = Math.random() * H;
    }
    pts[i * 2] = Math.min(W, Math.max(0, x));
    pts[i * 2 + 1] = Math.min(H, Math.max(0, y));
  }

  const delaunay = new Delaunay(pts);
  const voronoi = delaunay.voronoi([0, 0, W, H]);
  const start = delaunay.find(ox, oy);

  // crack propagation: shortest paths with random, heavy-tailed resistance
  const time = new Float64Array(n).fill(Infinity);
  time[start] = 0;
  const heap = new Heap();
  heap.push([0, start]);
  while (heap.size) {
    const [t, i] = heap.pop();
    if (t > time[i]) continue;
    for (const j of delaunay.neighbors(i)) {
      const dx = pts[j * 2] - pts[i * 2];
      const dy = pts[j * 2 + 1] - pts[i * 2 + 1];
      const resist = Math.exp(gauss() * 0.85); // log-normal: some paths race, some stall
      const nt = t + Math.hypot(dx, dy) * resist;
      if (nt < time[j]) {
        time[j] = nt;
        heap.push([nt, j]);
      }
    }
  }

  // rank-based timing: the broken area grows at an even pace and the last
  // shards never linger (no long tail at the end of the animation)
  const order = Array.from({ length: n }, (_, i) => i).sort((a, b) => time[a] - time[b]);
  const rank = new Float64Array(n);
  order.forEach((cell, k) => (rank[cell] = k / Math.max(1, n - 1)));

  const buckets = new Map<number, string[]>();
  for (let i = 0; i < n; i++) {
    const poly = voronoi.cellPolygon(i);
    if (!poly) continue;
    const delay = Math.round((Math.pow(rank[i], 0.85) * SPREAD) / BUCKET) * BUCKET;
    let d = "";
    for (let k = 0; k < poly.length - 1; k++) d += `${k ? "L" : "M"}${poly[k][0].toFixed(1)} ${poly[k][1].toFixed(1)}`;
    d += "Z";
    const list = buckets.get(delay);
    if (list) list.push(d);
    else buckets.set(delay, [d]);
  }

  let paths = "";
  let lines = "";
  let last = 0;
  for (const [delay, list] of buckets) {
    const d = list.join("");
    paths += `<path style="animation-delay:${delay}ms" d="${d}"/>`;
    // the crack itself: each shard's outline flashes as it breaks, then fades
    lines += `<path style="animation-delay:${Math.max(0, delay - 70)}ms" d="${d}"/>`;
    last = Math.max(last, delay);
  }
  // a thin same-colour stroke overlaps neighbouring shards: no seam lines
  const mask =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">` +
    `<style>path{fill:#fff;stroke:#fff;stroke-width:1.4;stroke-linejoin:round;opacity:0;animation:f ${FLIP}ms ease-out forwards}@keyframes f{to{opacity:1}}</style>` +
    paths +
    `</svg>`;
  const crack =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">` +
    `<style>path{fill:none;stroke:#fff010;stroke-width:1.3;stroke-linejoin:round;opacity:0;animation:c 360ms ease-out forwards;filter:drop-shadow(0 0 1.5px #24222d)}@keyframes c{25%{opacity:.95}to{opacity:0}}</style>` +
    lines +
    `</svg>`;
  return {
    src: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(mask)}`,
    lines: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(crack)}`,
    total: last + FLIP,
  };
}

function setMaskStyle(src: string | null) {
  let el = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
  if (!src) {
    el?.remove();
    return;
  }
  if (!el) {
    el = document.createElement("style");
    el.id = STYLE_ID;
    document.head.appendChild(el);
  }
  const url = `url("${src}")`;
  el.textContent = `::view-transition-new(root){-webkit-mask-image:${url};mask-image:${url};-webkit-mask-size:100% 100%;mask-size:100% 100%;-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat}`;
}

/** warm the Voronoi chunk once the page is idle, so the first click is instant */
export function preloadFracture() {
  import("d3-delaunay").catch(() => {});
}

export async function fractureTheme(next: Theme, button: HTMLElement) {
  const doc = document as Document & { startViewTransition?: (cb: () => void) => ViewTransition };
  const root = document.documentElement;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const my = ++token;

  if (active) {
    active.skipTransition();
    active = null;
  }
  setMaskStyle(null);

  if (!doc.startViewTransition) {
    root.classList.add("theme-fade");
    applyTheme(next);
    window.setTimeout(() => root.classList.remove("theme-fade"), 360);
    return;
  }

  if (reduced) {
    const vt = doc.startViewTransition(() => flushSync(() => applyTheme(next)));
    vt.ready
      .then(() => root.animate({ opacity: [0, 1] }, { duration: 160, pseudoElement: "::view-transition-new(root)" }))
      .catch(() => {});
    return;
  }

  button.classList.add("is-cracking");
  const r = button.getBoundingClientRect();
  let mask: { src: string; lines: string; total: number };
  try {
    mask = await buildMask(window.innerWidth, window.innerHeight, r.left + r.width / 2, r.top + r.height / 2);
    // decode first: the transition must never show an unmasked frame
    const img = new Image();
    img.src = mask.src;
    const lineImg = new Image();
    lineImg.src = mask.lines;
    await Promise.all([img.decode().catch(() => {}), lineImg.decode().catch(() => {})]);
  } catch {
    button.classList.remove("is-cracking");
    applyTheme(next);
    return;
  }
  if (my !== token) return; // a newer click took over while we prepared

  setMaskStyle(mask.src);
  // the crack lines ride above both snapshots in their own transition group
  const overlay = document.createElement("img");
  overlay.className = "fracture-lines";
  overlay.alt = "";
  overlay.src = mask.lines;
  const vt = doc.startViewTransition(() => {
    flushSync(() => applyTheme(next));
    document.body.appendChild(overlay);
  });
  active = vt;

  vt.ready
    .then(() => {
      // holds the transition open while the mask image animates itself
      root.animate({ opacity: [1, 1] }, { duration: mask.total + 120, pseudoElement: "::view-transition-new(root)" });
    })
    .catch(() => {});

  vt.finished
    .catch(() => {})
    .finally(() => {
      button.classList.remove("is-cracking");
      overlay.remove();
      if (active === vt) {
        active = null;
        setMaskStyle(null);
      }
    });
}
