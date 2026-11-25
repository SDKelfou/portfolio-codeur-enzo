import { flushSync } from "react-dom";
import { applyTheme } from "./theme";
import type { Theme } from "./theme";

const SPREAD = 700;
const FLIP = 120;
const LEADIN = 60;
const BUCKET = 12;
const STYLE_ID = "fracture-mask";

type ViewTransition = {
  ready: Promise<void>;
  finished: Promise<void>;
  skipTransition: () => void;
};

let active: ViewTransition | null = null;
let token = 0;

function gauss() {
  return Math.sqrt(-2 * Math.log(Math.random() || 1e-9)) * Math.cos(2 * Math.PI * Math.random());
}

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

async function buildMasks(W: number, H: number, ox: number, oy: number, lineColor: string) {
  const { Delaunay } = await import("d3-delaunay");
  const maxD = Math.hypot(Math.max(ox, W - ox), Math.max(oy, H - oy));
  const n = Math.round(Math.min(1500, Math.max(600, (W * H) / 1200)));
  const pts = new Float64Array(n * 2);
  for (let i = 0; i < n; i++) {
    let x: number;
    let y: number;
    if (Math.random() < 0.4) {
      const a = Math.random() * Math.PI * 2;
      const r = maxD * Math.pow(Math.random(), 2.2);
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

  const time = new Float64Array(n).fill(Infinity);
  time[start] = 0;
  const heap = new Heap();
  heap.push([0, start]);
  while (heap.size) {
    const [t, i] = heap.pop();
    if (t > time[i]) continue;
    for (const j of delaunay.neighbors(i)) {
      const nt = t + Math.hypot(pts[j * 2] - pts[i * 2], pts[j * 2 + 1] - pts[i * 2 + 1]) * Math.exp(gauss() * 0.85);
      if (nt < time[j]) {
        time[j] = nt;
        heap.push([nt, j]);
      }
    }
  }
  const order = Array.from({ length: n }, (_, i) => i).sort((a, b) => time[a] - time[b]);

  const buckets = new Map<number, string[]>();
  order.forEach((cell, k) => {
    const p = voronoi.cellPolygon(cell);
    if (!p) return;
    const delay = LEADIN + Math.round((Math.pow(k / Math.max(1, n - 1), 0.85) * SPREAD) / BUCKET) * BUCKET;
    let d = "";
    for (let q = 0; q < p.length - 1; q++) d += `${q ? "L" : "M"}${p[q][0].toFixed(1)} ${p[q][1].toFixed(1)}`;
    d += "Z";
    const list = buckets.get(delay);
    if (list) list.push(d);
    else buckets.set(delay, [d]);
  });

  let fills = "";
  let lines = "";
  let last = 0;
  for (const [delay, list] of buckets) {
    const d = list.join("");
    fills += `<path style="animation-delay:${delay}ms" d="${d}"/>`;
    lines += `<path style="animation-delay:${delay - 90}ms" d="${d}"/>`;
    last = Math.max(last, delay);
  }
  const head = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`;
  const mask =
    head +
    `<style>path{fill:#fff;stroke:#fff;stroke-width:1.4;stroke-linejoin:round;opacity:0;animation:f ${FLIP}ms ease-out forwards}@keyframes f{to{opacity:1}}</style>` +
    fills +
    `</svg>`;
  const crack =
    head +
    `<style>path{fill:none;stroke:${lineColor};stroke-width:1.2;stroke-linejoin:round;opacity:0;animation:c 420ms ease-out forwards}@keyframes c{20%{opacity:1}to{opacity:0}}</style>` +
    lines +
    `</svg>`;
  const enc = (s: string) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(s)}`;
  return { mask: enc(mask), crack: enc(crack), total: last + FLIP };
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
  document.querySelectorAll(".fracture-lines").forEach((n) => n.remove());

  if (!doc.startViewTransition || reduced) {
    root.classList.add("theme-fade");
    applyTheme(next);
    window.setTimeout(() => root.classList.remove("theme-fade"), 360);
    return;
  }

  button.classList.add("is-cracking");
  const r = button.getBoundingClientRect();
  let masks: { mask: string; crack: string; total: number };
  try {
    masks = await buildMasks(
      window.innerWidth,
      window.innerHeight,
      r.left + r.width / 2,
      r.top + r.height / 2,
      next === "dark" ? "#101016" : "#f8f6f0"
    );
  } catch {
    button.classList.remove("is-cracking");
    applyTheme(next);
    return;
  }
  if (my !== token) return;

  const lines = document.createElement("img");
  lines.className = "fracture-lines";
  lines.alt = "";
  let startedAt = 0;

  const vt = doc.startViewTransition(async () => {
    flushSync(() => applyTheme(next));
    setMaskStyle(masks.mask);
    lines.src = masks.crack;
    document.body.appendChild(lines);
    const probe = new Image();
    probe.src = masks.mask;
    await Promise.all([probe.decode().catch(() => {}), lines.decode().catch(() => {})]);
    startedAt = performance.now();
  });
  active = vt;

  vt.ready
    .then(() => {
      const remaining = Math.max(200, startedAt + masks.total + 80 - performance.now());
      root.animate({ opacity: [1, 1] }, { duration: remaining, pseudoElement: "::view-transition-new(root)" });
    })
    .catch(() => {});

  vt.finished
    .catch(() => {})
    .finally(() => {
      button.classList.remove("is-cracking");
      lines.remove();
      if (active === vt) {
        active = null;
        setMaskStyle(null);
      }
    });
}
