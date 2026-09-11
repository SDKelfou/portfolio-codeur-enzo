import { useEffect, useRef } from "react";
import { warpState } from "./warpState";
import { warpDom } from "./warpDom";

const LINE_COUNT = 28;

/** Always-mounted, normally-invisible full-viewport overlay that renders
 *  the "Reality Warp" page-transition effect: radial speed lines (canvas
 *  2D, cheap, driven purely by reading warpState.boost every frame — no
 *  separate tween to keep in sync) plus a few flash/chromatic-aberration
 *  layers that useRealityWarp() animates directly via GSAP through the
 *  warpDom registry. Lives once at the App root, above the routed pages,
 *  so it survives the navigate() call in the middle of the sequence. */
export function RealityWarpOverlay() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const flashRefs = useRef<(HTMLDivElement | null)[]>([]);
  const boomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    warpDom.flashLayers = flashRefs.current.filter((el): el is HTMLDivElement => el !== null);
    warpDom.boom = boomRef.current;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let wasIdle = true;
    const resize = () => {
      canvas.width = window.innerWidth * Math.min(window.devicePixelRatio || 1, 2);
      canvas.height = window.innerHeight * Math.min(window.devicePixelRatio || 1, 2);
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      raf = requestAnimationFrame(draw);
      const boost = warpState.boost;
      if (boost <= 0.001) {
        if (!wasIdle) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          wasIdle = true;
        }
        return;
      }
      wasIdle = false;
      const w = canvas.width;
      const h = canvas.height;
      const cx = w * 0.68;
      const cy = h * 0.46;
      ctx.clearRect(0, 0, w, h);
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      const maxLen = Math.max(w, h) * 0.62 * boost;
      for (let i = 0; i < LINE_COUNT; i++) {
        const angle = (i / LINE_COUNT) * Math.PI * 2;
        const len = maxLen * (0.55 + 0.45 * Math.sin(i * 12.9898));
        const innerR = maxLen * 0.12;
        const x1 = cx + Math.cos(angle) * innerR;
        const y1 = cy + Math.sin(angle) * innerR;
        const x2 = cx + Math.cos(angle) * (innerR + len);
        const y2 = cy + Math.sin(angle) * (innerR + len);
        ctx.strokeStyle = `rgba(255, 214, 170, ${0.16 * boost})`;
        ctx.lineWidth = 1.4 + boost * 2.2;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
      ctx.restore();
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[500]">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" style={{ mixBlendMode: "screen" }} />
      {/* Chromatic-aberration flash: three tinted, slightly offset layers
          that useRealityWarp() flashes in/out around the impact moment. */}
      <div
        ref={(el) => {
          flashRefs.current[0] = el;
        }}
        className="absolute inset-0 opacity-0"
        style={{ background: "#ff3b3b", mixBlendMode: "screen", transform: "translate3d(-6px,0,0)" }}
      />
      <div
        ref={(el) => {
          flashRefs.current[1] = el;
        }}
        className="absolute inset-0 opacity-0"
        style={{ background: "#20e0ff", mixBlendMode: "screen", transform: "translate3d(6px,0,0)" }}
      />
      <div
        ref={(el) => {
          flashRefs.current[2] = el;
        }}
        className="absolute inset-0 opacity-0"
        style={{ background: "#fff3d6", mixBlendMode: "screen" }}
      />
      {/* The central "impact" burst — a soft white/orange radial flash. */}
      <div
        ref={boomRef}
        className="absolute inset-0 opacity-0"
        style={{
          background: "radial-gradient(38% 38% at 68% 46%, rgba(255,255,255,0.95) 0%, rgba(255,150,60,0.55) 45%, transparent 72%)",
        }}
      />
    </div>
  );
}
