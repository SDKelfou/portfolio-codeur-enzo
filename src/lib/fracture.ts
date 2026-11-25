import { flushSync } from "react-dom";
import { applyTheme, currentTheme } from "./theme";
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
  const cells: { poly: Float64Array; delay: number }[] = [];
  order.forEach((cell, k) => {
    const p = voronoi.cellPolygon(cell);
    if (!p) return;
    const delay = LEADIN + Math.round((Math.pow(k / Math.max(1, n - 1), 0.85) * SPREAD) / BUCKET) * BUCKET;
    const poly = new Float64Array((p.length - 1) * 2);
    for (let q = 0; q < p.length - 1; q++) {
      poly[q * 2] = p[q][0];
      poly[q * 2 + 1] = p[q][1];
    }
    cells.push({ poly, delay });
    let d = "";
    for (let q = 0; q < p.length - 1; q++) d += `${q ? "L" : "M"}${p[q][0].toFixed(1)} ${p[q][1].toFixed(1)}`;
    d += "Z";
    const list = buckets.get(delay);
    if (list) list.push(d);
    else buckets.set(delay, [d]);
  });

  let fills = "";
  let last = 0;
  for (const [delay, list] of buckets) {
    fills += `<path style="animation-delay:${delay}ms" d="${list.join("")}"/>`;
    last = Math.max(last, delay);
  }
  const mask =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${Math.ceil(W / 2)}" height="${Math.ceil(H / 2)}" viewBox="0 0 ${W} ${H}">` +
    `<style>path{fill:#fff;stroke:#fff;stroke-width:2.4;stroke-linejoin:round;opacity:0;animation:f ${FLIP}ms ease-out forwards}@keyframes f{to{opacity:1}}</style>` +
    fills +
    `</svg>`;
  return { mask: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(mask)}`, cells, lineColor, total: last + FLIP };
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
  let masks: Awaited<ReturnType<typeof buildMasks>>;
  try {
    masks = await buildMasks(
      window.innerWidth,
      window.innerHeight,
      r.left + r.width / 2,
      r.top + r.height / 2,
      next === "dark" ? "rgba(16,16,22,.95)" : "rgba(248,246,240,.9)"
    );
  } catch {
    button.classList.remove("is-cracking");
    applyTheme(next);
    return;
  }
  if (my !== token) return;

  const W = window.innerWidth;
  const H = window.innerHeight;
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  const canvas = document.createElement("canvas");
  canvas.className = "fracture-lines";
  canvas.width = Math.round(W * dpr);
  canvas.height = Math.round(H * dpr);
  const ctx = canvas.getContext("2d")!;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.lineJoin = "round";
  ctx.lineWidth = 1.15;
  ctx.strokeStyle = masks.lineColor;
  let startedAt = 0;
  let raf = 0;
  const LIFE = 380;
  const AHEAD = 90;

  const draw = () => {
    const t = performance.now() - startedAt;
    ctx.clearRect(0, 0, W, H);
    const cells = masks.cells;
    for (let i = 0; i < cells.length; i++) {
      const age = t - (cells[i].delay - AHEAD);
      if (age < 0) break;
      if (age > LIFE) continue;
      ctx.globalAlpha = age < LIFE * 0.2 ? age / (LIFE * 0.2) : 1 - (age - LIFE * 0.2) / (LIFE * 0.8);
      const poly = cells[i].poly;
      ctx.beginPath();
      ctx.moveTo(poly[0], poly[1]);
      for (let k = 2; k < poly.length; k += 2) ctx.lineTo(poly[k], poly[k + 1]);
      ctx.closePath();
      ctx.stroke();
    }
    if (t < masks.total + LIFE) raf = requestAnimationFrame(draw);
  };

  const vt = doc.startViewTransition(async () => {
    flushSync(() => applyTheme(next));
    setMaskStyle(masks.mask);
    document.body.appendChild(canvas);
    const probe = new Image();
    probe.src = masks.mask;
    await probe.decode().catch(() => {});
    startedAt = performance.now();
    raf = requestAnimationFrame(draw);
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
      cancelAnimationFrame(raf);
      canvas.remove();
      if (active === vt) {
        active = null;
        setMaskStyle(null);
      }
    });
}

let target: Theme | null = null;

export function toggleTheme(button: HTMLElement) {
  const base = target ?? currentTheme();
  const next: Theme = base === "dark" ? "light" : "dark";
  target = next;
  fractureTheme(next, button).finally(() => {
    if (target === next && currentTheme() === next) target = null;
  });
  return next;
}
