import { useEffect, useRef } from "react";

/**
 * LIVING PARTICLES — fine mineral dust orbiting the sculpture.
 * One 2D canvas, started only after the page has loaded and the browser
 * is idle, density scaled to the area, DPR capped, paused when off-screen
 * or in a background tab, a single still frame under reduced motion.
 * A theme fracture blows the dust outward; it then drifts back.
 */
export default function Particles() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lowPower = (navigator as Navigator & { hardwareConcurrency?: number }).hardwareConcurrency !== undefined && navigator.hardwareConcurrency <= 2;
    let raf = 0;
    let running = false;
    let visible = true;
    let w = 0;
    let h = 0;
    let rgb = "87,72,140";
    let burst = 0;

    type P = { a: number; r: number; speed: number; size: number; alpha: number; wobble: number; vx: number; vy: number; x: number; y: number };
    let ps: P[] = [];

    const readColor = () => {
      rgb = getComputedStyle(document.documentElement).getPropertyValue("--particle").trim() || rgb;
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round(Math.min(lowPower ? 24 : 64, (w * h) / 5200));
      ps = Array.from({ length: count }, () => {
        const r = Math.min(w, h) * (0.3 + Math.random() * 0.42);
        return {
          a: Math.random() * Math.PI * 2,
          r,
          speed: (0.00008 + Math.random() * 0.00016) * (Math.random() < 0.5 ? -1 : 1),
          size: 0.6 + Math.random() * 1.6,
          alpha: 0.25 + Math.random() * 0.55,
          wobble: Math.random() * 1000,
          vx: 0,
          vy: 0,
          x: 0,
          y: 0,
        };
      });
    };

    let last = performance.now();
    const frame = (now: number) => {
      const dt = Math.min(48, now - last);
      last = now;
      ctx.clearRect(0, 0, w, h);
      const cx = w / 2;
      const cy = h * 0.48;
      burst *= 0.94;
      for (const p of ps) {
        p.a += p.speed * dt;
        const wob = Math.sin((now + p.wobble) * 0.0006) * 10;
        const tx = cx + Math.cos(p.a) * (p.r + wob);
        const ty = cy + Math.sin(p.a) * (p.r + wob) * 0.82;
        // spring toward the orbit; the burst pushes dust away from the core
        p.vx += (tx - p.x) * 0.02 + ((p.x - cx) / (w || 1)) * burst * 9;
        p.vy += (ty - p.y) * 0.02 + ((p.y - cy) / (h || 1)) * burst * 9;
        p.vx *= 0.86;
        p.vy *= 0.86;
        p.x += p.vx;
        p.y += p.vy;
        ctx.fillStyle = `rgba(${rgb},${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      if (running) raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (running || reduced || !visible || document.hidden) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const place = () => {
      for (const p of ps) {
        p.x = w / 2 + Math.cos(p.a) * p.r;
        p.y = h * 0.48 + Math.sin(p.a) * p.r * 0.82;
      }
    };

    const boot = () => {
      readColor();
      resize();
      place();
      canvas.style.opacity = "1";
      if (reduced) frame(performance.now());
      else start();
    };

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) start();
      else stop();
    });
    io.observe(canvas);

    const onVis = () => (document.hidden ? stop() : start());
    const onTheme = () => {
      readColor();
      burst = 1;
      if (reduced) frame(performance.now());
    };
    const onResize = () => {
      resize();
      place();
    };
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("enzo:theme", onTheme);
    window.addEventListener("resize", onResize);

    // never compete with the first paint
    let idle = 0;
    const schedule = () => {
      const ric = (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
      idle = ric ? ric(boot, { timeout: 2500 }) : window.setTimeout(boot, 1200);
    };
    if (document.readyState === "complete") schedule();
    else window.addEventListener("load", schedule, { once: true });

    return () => {
      stop();
      io.disconnect();
      window.clearTimeout(idle);
      window.removeEventListener("load", schedule);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("enzo:theme", onTheme);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
      style={{ opacity: 0, transition: "opacity 1.2s var(--ease-out)" }}
    />
  );
}
