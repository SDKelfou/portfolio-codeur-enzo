import { flushSync } from "react-dom";
import { applyTheme } from "./theme";
import type { Theme } from "./theme";

/**
 * REALITY FRACTURE — the theme switch.
 *
 * No drawn crack lines. The screen is split into thousands of invisible
 * shards (a jittered triangle mesh that tiles perfectly), and each shard
 * flips to the new theme on its own beat, spreading from the button along
 * irregular fronts. You never see a line, you just watch the surface turn
 * shard by shard and understand that it cracked.
 *
 * How: the View Transitions API keeps a frozen snapshot of the old theme
 * and renders the new one live underneath. The new view gets a mask: one
 * SVG image whose shards are grouped into time buckets, each bucket with
 * its own CSS animation delay. The browser runs it as a single image, so
 * the main thread does nothing per frame. Nothing in the DOM is duplicated.
 */

const SPREAD = 760; // ms for the front to cross the screen
const FLIP = 130; // ms for one shard to turn
const BUCKET = 14; // ms granularity of the shard timeline
const STYLE_ID = "fracture-mask";

type ViewTransition = {
  ready: Promise<void>;
  finished: Promise<void>;
  skipTransition: () => void;
};

let active: ViewTransition | null = null;

const rand = (a: number, b: number) => a + Math.random() * (b - a);

function buildMask(W: number, H: number, ox: number, oy: number) {
  // shard size scales with the screen so the count stays bounded
  const cell = Math.max(16, Math.min(30, Math.sqrt((W * H) / 2200)));
  const cols = Math.ceil(W / cell) + 1;
  const rows = Math.ceil(H / cell) + 1;
  const jitter = cell * 0.42;

  const px: number[] = [];
  const py: number[] = [];
  for (let r = 0; r <= rows; r++) {
    for (let c = 0; c <= cols; c++) {
      const edgeX = c === 0 || c === cols;
      const edgeY = r === 0 || r === rows;
      px.push(c * cell + (edgeX ? 0 : rand(-jitter, jitter)));
      py.push(r * cell + (edgeY ? 0 : rand(-jitter, jitter)));
    }
  }
  const idx = (r: number, c: number) => r * (cols + 1) + c;

  const maxD = Math.hypot(Math.max(ox, W - ox), Math.max(oy, H - oy));
  const f1 = rand(0, Math.PI * 2);
  const f2 = rand(0, Math.PI * 2);
  const k1 = Math.round(rand(3, 5));
  const k2 = Math.round(rand(7, 11));
  const buckets = new Map<number, string[]>();

  const push = (a: number, b: number, c: number) => {
    const cx = (px[a] + px[b] + px[c]) / 3;
    const cy = (py[a] + py[b] + py[c]) / 3;
    const ang = Math.atan2(cy - oy, cx - ox);
    // irregular fronts: the fracture runs further along a few directions
    const ridge = 1 + 0.26 * Math.sin(k1 * ang + f1) + 0.12 * Math.sin(k2 * ang + f2);
    const u = Math.min(1.05, (Math.hypot(cx - ox, cy - oy) / maxD) * ridge + rand(-0.05, 0.05));
    const delay = Math.max(0, Math.round((u * SPREAD) / BUCKET) * BUCKET);
    const d = `M${px[a] | 0} ${py[a] | 0}L${px[b] | 0} ${py[b] | 0}L${px[c] | 0} ${py[c] | 0}Z`;
    const list = buckets.get(delay);
    if (list) list.push(d);
    else buckets.set(delay, [d]);
  };

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const a = idx(r, c);
      const b = idx(r, c + 1);
      const d = idx(r + 1, c);
      const e = idx(r + 1, c + 1);
      if (Math.random() < 0.5) {
        push(a, b, e);
        push(a, e, d);
      } else {
        push(a, b, d);
        push(b, e, d);
      }
    }
  }

  let paths = "";
  let last = 0;
  for (const [delay, list] of buckets) {
    paths += `<path style="animation-delay:${delay}ms" d="${list.join("")}"/>`;
    last = Math.max(last, delay);
  }
  // a thin same-colour stroke makes neighbouring shards overlap, so no
  // antialiasing seam ever shows as a line
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">` +
    `<style>path{fill:#fff;stroke:#fff;stroke-width:1.6;stroke-linejoin:round;opacity:0;animation:f ${FLIP}ms linear forwards}@keyframes f{to{opacity:1}}</style>` +
    paths +
    `</svg>`;
  return { url: `url("data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}")`, total: last + FLIP };
}

function setMaskStyle(css: string | null) {
  let el = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
  if (!css) {
    el?.remove();
    return;
  }
  if (!el) {
    el = document.createElement("style");
    el.id = STYLE_ID;
    document.head.appendChild(el);
  }
  el.textContent = css;
}

export function fractureTheme(next: Theme, button: HTMLElement, onApplied?: () => void) {
  const doc = document as Document & { startViewTransition?: (cb: () => void) => ViewTransition };
  const root = document.documentElement;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const apply = () => {
    applyTheme(next);
    onApplied?.();
  };

  // rapid repeat clicks: finish the running fracture instantly, start anew
  if (active) {
    active.skipTransition();
    active = null;
    setMaskStyle(null);
  }

  if (!doc.startViewTransition) {
    root.classList.add("theme-fade");
    apply();
    window.setTimeout(() => root.classList.remove("theme-fade"), 360);
    return;
  }

  if (reduced) {
    const vt = doc.startViewTransition(() => flushSync(apply));
    vt.ready
      .then(() => root.animate({ opacity: [0, 1] }, { duration: 160, pseudoElement: "::view-transition-new(root)" }))
      .catch(() => {});
    return;
  }

  const r = button.getBoundingClientRect();
  const ox = r.left + r.width / 2;
  const oy = r.top + r.height / 2;
  const W = window.innerWidth;
  const H = window.innerHeight;
  const { url, total } = buildMask(W, H, ox, oy);

  button.classList.add("is-cracking");
  const sculpture = document.querySelector(".sculpture");

  setMaskStyle(
    `::view-transition-new(root){-webkit-mask-image:${url};mask-image:${url};-webkit-mask-size:100% 100%;mask-size:100% 100%;-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat}`
  );

  const vt = doc.startViewTransition(() => flushSync(apply));
  active = vt;

  vt.ready
    .then(() => {
      sculpture?.classList.add("is-split");
      // keeps the transition alive while the shards turn (the mask image
      // animates by itself; this only holds the pseudo-element in place)
      root.animate({ opacity: [1, 1] }, { duration: total + 40, pseudoElement: "::view-transition-new(root)" });
      // the old surface sinks a touch as it breaks up
      root.animate([{ transform: "none" }, { transform: "scale(.994)" }], {
        duration: total,
        easing: "ease-out",
        fill: "both",
        pseudoElement: "::view-transition-old(root)",
      });
    })
    .catch(() => {});

  vt.finished
    .catch(() => {})
    .finally(() => {
      button.classList.remove("is-cracking");
      window.setTimeout(() => sculpture?.classList.remove("is-split"), 140);
      if (active === vt) {
        active = null;
        setMaskStyle(null);
      }
    });
}
