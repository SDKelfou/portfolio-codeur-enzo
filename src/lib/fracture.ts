import { applyTheme } from "./theme";
import type { Theme } from "./theme";

/**
 * REALITY FRACTURE — the theme switch.
 *
 * The screen cracks from the button: a fresh random Voronoi shatter on
 * every click (fine shards at the impact, larger further away). Thin dark
 * crack lines run ahead of the break, then each shard turns into the new
 * theme's material. Once the whole surface has turned, the theme switches
 * underneath and the shards dissolve to reveal it.
 *
 * Everything is drawn frame by frame on one canvas (only the shards that
 * change are drawn each frame), so the timing is exact and nothing
 * depends on how the browser schedules image animations: no flash, no
 * hitch at the end.
 */

const SPREAD = 600; // ms for the fracture to cross the screen
const FLIP = 110; // ms for one shard to turn
const LEAD = 100; // ms a crack line appears before its shard turns
const REVEAL = 340; // ms for the shards to fall away, revealing the new theme

const BG: Record<Theme, string> = { light: "#f8f6f0", dark: "#101016" };
// the crack is drawn in the old surface's ink: dark lines on porcelain, light on obsidian
const CRACK_ON: Record<Theme, string> = { light: "rgba(16,16,22,.92)", dark: "rgba(248,246,240,.85)" };

let running: { cancel: () => void } | null = null;

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

interface Shard {
  poly: Float64Array; // x0,y0,x1,y1,...
  delay: number;
}

async function shatter(W: number, H: number, ox: number, oy: number): Promise<Shard[]> {
  const { Delaunay } = await import("d3-delaunay");
  const maxD = Math.hypot(Math.max(ox, W - ox), Math.max(oy, H - oy));
  const n = Math.round(Math.min(2400, Math.max(650, (W * H) / 900)));
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

  // crack propagation: shortest paths with random heavy-tailed resistance
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
  // rank-based timing: the broken area grows at an even pace, no straggler
  const order = Array.from({ length: n }, (_, i) => i).sort((a, b) => time[a] - time[b]);
  const shards: Shard[] = [];
  order.forEach((cell, k) => {
    const p = voronoi.cellPolygon(cell);
    if (!p) return;
    const poly = new Float64Array((p.length - 1) * 2);
    for (let q = 0; q < p.length - 1; q++) {
      poly[q * 2] = p[q][0];
      poly[q * 2 + 1] = p[q][1];
    }
    shards.push({ poly, delay: LEAD + Math.pow(k / Math.max(1, n - 1), 0.85) * SPREAD });
  });
  return shards;
}

function trace(ctx: CanvasRenderingContext2D, poly: Float64Array) {
  ctx.moveTo(poly[0], poly[1]);
  for (let i = 2; i < poly.length; i += 2) ctx.lineTo(poly[i], poly[i + 1]);
  ctx.closePath();
}

/** warm the Voronoi chunk once the page is idle, so the first click is instant */
export function preloadFracture() {
  import("d3-delaunay").catch(() => {});
}

export async function fractureTheme(next: Theme, button: HTMLElement) {
  const root = document.documentElement;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // a click during a fracture finishes it at once
  running?.cancel();

  if (reduced) {
    root.classList.add("theme-fade");
    applyTheme(next);
    window.setTimeout(() => root.classList.remove("theme-fade"), 360);
    return;
  }

  const W = window.innerWidth;
  const H = window.innerHeight;
  const r = button.getBoundingClientRect();
  const ox = r.left + r.width / 2;
  const oy = r.top + r.height / 2;
  button.classList.add("is-cracking");

  let shards: Shard[];
  try {
    shards = await shatter(W, H, ox, oy);
  } catch {
    button.classList.remove("is-cracking");
    applyTheme(next);
    return;
  }

  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  const canvas = document.createElement("canvas");
  canvas.className = "fracture-canvas";
  canvas.width = Math.round(W * dpr);
  canvas.height = Math.round(H * dpr);
  canvas.setAttribute("aria-hidden", "true");
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d")!;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.lineJoin = "round";

  const fill = BG[next];
  const crack = CRACK_ON[next === "dark" ? "light" : "dark"];
  let lineIdx = 0; // next shard whose crack line is not drawn yet
  let fillIdx = 0; // first shard not yet fully turned
  let raf = 0;
  let done = false;
  const t0 = performance.now();
  const end = LEAD + SPREAD + FLIP;

  // phase 2: the theme has switched under a solid sheet; the shards now
  // fall away one by one (same order as they broke), revealing it
  const reveal = () => {
    const r0 = performance.now();
    ctx.globalCompositeOperation = "destination-out";
    ctx.fillStyle = "#000";
    ctx.strokeStyle = "#000";
    let idx = 0;
    const n = shards.length;
    const step = (now: number) => {
      const t = now - r0;
      ctx.lineWidth = 1.6;
      for (let i = idx; i < n; i++) {
        const d = (i / n) * (REVEAL - 120);
        if (d > t) break;
        const k = Math.min(1, (t - d) / 120);
        ctx.globalAlpha = 0.35 + 0.65 * k;
        ctx.beginPath();
        trace(ctx, shards[i].poly);
        ctx.fill();
        ctx.stroke();
        if (k >= 1 && i === idx) idx++;
      }
      if (t >= REVEAL) {
        canvas.remove();
        running = null;
      } else raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    // safety net: a background tab pauses animation frames; never leave the sheet behind
    window.setTimeout(() => {
      if (canvas.isConnected) {
        canvas.remove();
        running = null;
      }
    }, REVEAL + 600);
  };

  const finish = (instant = false) => {
    if (done) return;
    done = true;
    cancelAnimationFrame(raf);
    ctx.globalAlpha = 1;
    ctx.fillStyle = fill;
    ctx.fillRect(0, 0, W, H);
    applyTheme(next);
    button.classList.remove("is-cracking");
    if (instant) {
      canvas.remove();
      running = null;
    } else reveal();
  };

  const frame = (now: number) => {
    const t = now - t0;
    // 1. crack lines run ahead of the break
    ctx.globalAlpha = 1;
    ctx.strokeStyle = crack;
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    while (lineIdx < shards.length && shards[lineIdx].delay - LEAD <= t) {
      trace(ctx, shards[lineIdx].poly);
      lineIdx++;
    }
    ctx.stroke();
    // 2. shards in their flip window get painted again, more opaque each frame
    ctx.fillStyle = fill;
    ctx.strokeStyle = fill;
    ctx.lineWidth = 1.4; // same-colour hairline hides antialiasing seams
    let allDone = true;
    for (let i = fillIdx; i < shards.length && shards[i].delay <= t; i++) {
      const k = Math.min(1, (t - shards[i].delay) / FLIP);
      ctx.globalAlpha = 0.3 + 0.7 * k;
      ctx.beginPath();
      trace(ctx, shards[i].poly);
      ctx.fill();
      ctx.stroke();
      if (k < 1) allDone = false;
      else if (allDone) fillIdx = i + 1;
    }
    if (t >= end) finish();
    else raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);

  running = {
    cancel: () => {
      cancelAnimationFrame(raf);
      if (!done) finish(true);
      canvas.remove();
      running = null;
    },
  };
}
