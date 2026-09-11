import { useRef } from "react";
import type { PointerEvent } from "react";
import { GsapReveal } from "../lib/GsapReveal";
import { TiltCard } from "../lib/TiltCard";

/* ---------------------------------------------------------------------- */
/* 01 — Profondeur : parallax multi-couches piloté par le curseur          */
/* ---------------------------------------------------------------------- */

function DepthDemo() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const layers = useRef<(HTMLDivElement | null)[]>([]);

  const handleMove = (e: PointerEvent<HTMLDivElement>) => {
    const el = wrapRef.current;
    if (!el || e.pointerType === "touch") return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    layers.current.forEach((layer, i) => {
      if (!layer) return;
      const factor = (i + 1) * 10;
      layer.style.transform = `translate(${px * factor}px, ${py * factor}px)`;
    });
  };

  const handleLeave = () => {
    layers.current.forEach((layer) => {
      if (layer) layer.style.transform = "translate(0, 0)";
    });
  };

  return (
    <div
      ref={wrapRef}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      className="relative mt-4 h-40 overflow-hidden rounded-lg"
      style={{ background: "rgba(var(--accent-rgb),0.06)" }}
    >
      {[0.5, 0.75, 1].map((scale, i) => (
        <div
          key={i}
          ref={(el) => {
            layers.current[i] = el;
          }}
          className="absolute rounded-full transition-transform duration-150 ease-out"
          style={{
            width: `${scale * 70}px`,
            height: `${scale * 70}px`,
            left: `${20 + i * 22}%`,
            top: `${50 - scale * 25}%`,
            background: `rgba(var(--accent-rgb), ${0.5 - i * 0.12})`,
            filter: `blur(${(3 - i) * 2}px)`,
          }}
        />
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* 02 — Fluidité : blob organique animé en continu (SMIL path morph)       */
/* ---------------------------------------------------------------------- */

const BLOB_PATHS = [
  "M45,-58C58,-49,67,-33,70,-16C73,1,70,20,60,35C50,50,33,61,15,65C-3,69,-24,66,-40,55C-56,44,-67,25,-69,5C-71,-15,-64,-35,-50,-48C-36,-61,-15,-67,4,-70C23,-73,32,-67,45,-58Z",
  "M39,-51C51,-42,60,-28,64,-12C68,4,67,22,58,37C49,52,32,64,13,68C-6,72,-27,68,-43,57C-59,46,-70,28,-71,9C-72,-10,-63,-30,-49,-44C-35,-58,-16,-66,1,-67C18,-68,27,-60,39,-51Z",
  "M45,-58C58,-49,67,-33,70,-16C73,1,70,20,60,35C50,50,33,61,15,65C-3,69,-24,66,-40,55C-56,44,-67,25,-69,5C-71,-15,-64,-35,-50,-48C-36,-61,-15,-67,4,-70C23,-73,32,-67,45,-58Z",
];

function FluidDemo() {
  return (
    <div className="mt-4 flex h-40 items-center justify-center overflow-hidden rounded-lg" style={{ background: "rgba(var(--accent-rgb),0.06)" }}>
      <svg viewBox="-80 -80 160 160" className="h-32 w-32">
        <defs>
          <linearGradient id="blobGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--accent)" />
            <stop offset="100%" stopColor="var(--accent-2)" />
          </linearGradient>
        </defs>
        <path fill="url(#blobGrad)" opacity={0.85}>
          <animate attributeName="d" dur="7s" repeatCount="indefinite" values={BLOB_PATHS.join(";")} calcMode="spline" keySplines="0.45 0 0.55 1;0.45 0 0.55 1" />
        </path>
      </svg>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* 03 — Interaction : grille de points à effet magnétique                  */
/* ---------------------------------------------------------------------- */

function MagnetDemo() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const dots = useRef<(HTMLSpanElement | null)[]>([]);
  const cols = 7;
  const rows = 4;

  const handleMove = (e: PointerEvent<HTMLDivElement>) => {
    const el = wrapRef.current;
    if (!el || e.pointerType === "touch") return;
    const rect = el.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    dots.current.forEach((dot) => {
      if (!dot) return;
      const dx = Number(dot.dataset.x) - mx;
      const dy = Number(dot.dataset.y) - my;
      const dist = Math.hypot(dx, dy);
      const radius = 46;
      if (dist < radius) {
        const strength = (1 - dist / radius) * 14;
        const angle = Math.atan2(dy, dx);
        dot.style.transform = `translate(${Math.cos(angle) * strength}px, ${Math.sin(angle) * strength}px) scale(${1 + (1 - dist / radius) * 0.6})`;
        dot.style.opacity = "1";
      } else {
        dot.style.transform = "translate(0, 0) scale(1)";
        dot.style.opacity = "0.45";
      }
    });
  };

  const handleLeave = () => {
    dots.current.forEach((dot) => {
      if (!dot) return;
      dot.style.transform = "translate(0, 0) scale(1)";
      dot.style.opacity = "0.45";
    });
  };

  return (
    <div
      ref={wrapRef}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      className="relative mt-4 grid h-40 grid-cols-7 place-items-center gap-2 overflow-hidden rounded-lg px-3"
      style={{ background: "rgba(var(--accent-rgb),0.06)" }}
    >
      {Array.from({ length: cols * rows }).map((_, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        return (
          <span
            key={i}
            ref={(el) => {
              dots.current[i] = el;
              if (el) {
                el.dataset.x = String((col + 0.5) * (100 / cols) * 2.6);
                el.dataset.y = String((row + 0.5) * (100 / rows) * 1.15);
              }
            }}
            className="h-2 w-2 rounded-full opacity-45 transition-[transform,opacity] duration-100 ease-out"
            style={{ background: "var(--accent)" }}
          />
        );
      })}
    </div>
  );
}

/* ---------------------------------------------------------------------- */

const MODULES = [
  { key: "depth", title: "Profondeur", text: "Trois couches, trois vitesses. Bougez le curseur sur la zone.", visual: <DepthDemo />, dir: "left" as const },
  { key: "fluid", title: "Fluidité", text: "Une forme organique qui ne s'arrête jamais de respirer.", visual: <FluidDemo />, dir: "up" as const },
  { key: "magnet", title: "Interaction", text: "Chaque point réagit à votre présence. Approchez le curseur.", visual: <MagnetDemo />, dir: "right" as const },
];

/** Proof-of-capability strip: not screenshots, real running techniques —
 *  visitors can put their cursor on each and see it react immediately. */
export default function CapabilityDemos() {
  return (
    <section className="relative px-6 py-20 sm:px-10 sm:py-28">
      <GsapReveal>
        <div className="mx-auto max-w-2xl text-center">
          <span className="font-mono text-xs tracking-[0.3em]" style={{ color: "var(--accent-ink)" }}>
            CE DONT JE SUIS CAPABLE
          </span>
          <h2 className="font-display mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
            Pas des maquettes. <span className="text-gradient-ink">Du code, en direct.</span>
          </h2>
          <p className="mt-5 text-sm leading-relaxed" style={{ color: "var(--home-text-muted)" }}>
            Trois techniques que j'utilise vraiment sur mes projets. Passez le curseur dessus —
            tout ce que vous voyez tourne devant vous, là, maintenant.
          </p>
        </div>
      </GsapReveal>

      <div className="mx-auto mt-14 grid min-w-0 max-w-5xl gap-6 sm:grid-cols-3">
        {MODULES.map((mod, i) => (
          <GsapReveal key={mod.key} dir={mod.dir} delay={i * 90} className="min-w-0">
            <TiltCard maxTilt={6} className="h-full rounded-2xl">
              <div className="glass-light-solid h-full min-w-0 rounded-2xl p-7">
                <h3 className="font-display text-lg font-bold">
                  {String(i + 1).padStart(2, "0")} · {mod.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed" style={{ color: "var(--home-text-muted)" }}>
                  {mod.text}
                </p>
                {mod.visual}
              </div>
            </TiltCard>
          </GsapReveal>
        ))}
      </div>
    </section>
  );
}
