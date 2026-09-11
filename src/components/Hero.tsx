import { lazy, Suspense, useEffect, useState } from "react";
import { Link } from "wouter";
import { useAudio } from "../lib/audio";
import { useMagnetic } from "../lib/useMagnetic";
import { useReducedMotion } from "../lib/useReducedMotion";
import { useTheme, MODE_COLORS } from "../lib/theme";
import { StaticFallback } from "../lib/three/StaticFallback";
import { useRealityWarp } from "../lib/warp/useRealityWarp";

// three.js + @react-three/fiber + @react-three/drei are a genuinely heavy
// dependency — code-split it into its own chunk so the headline/CTAs paint
// immediately from the tiny StaticFallback gradient, then the real 3D
// scene streams in and cross-fades once ready instead of blocking first
// paint for every visitor.
const HeroScene = lazy(() => import("../lib/three/HeroScene"));

export default function Hero() {
  const { clickSfx, hoverSfx } = useAudio();
  const { mode } = useTheme();
  const reducedMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const primaryCta = useMagnetic<HTMLButtonElement>(0.3);
  const secondaryCta = useMagnetic<HTMLAnchorElement>(0.3);
  const { triggerWarp } = useRealityWarp();

  useEffect(() => {
    const t = window.setTimeout(() => setMounted(true), 80);
    return () => window.clearTimeout(t);
  }, []);

  const enter = (delayMs: number) => ({
    opacity: mounted || reducedMotion ? 1 : 0,
    transform: mounted || reducedMotion ? "none" : "translateY(24px)",
    transition: `opacity 0.7s var(--ease-out) ${delayMs}ms, transform 0.8s var(--ease-spring) ${delayMs}ms`,
  });

  return (
    <section
      id="top"
      className="dark-scope relative flex min-h-[100svh] flex-col justify-center overflow-hidden px-6 pb-24 pt-32 sm:px-10 sm:pt-40"
      style={{ background: "#07070a" }}
    >
      <Suspense fallback={<StaticFallback colors={MODE_COLORS[mode]} />}>
        <HeroScene />
      </Suspense>

      {/* Legibility scrim so the headline always reads over the shader,
          whatever hue the current accent mode swings toward. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ background: "linear-gradient(100deg, rgba(5,5,7,0.75) 0%, rgba(5,5,7,0.35) 46%, rgba(5,5,7,0.08) 75%)" }}
      />

      <div className="relative z-10 mx-auto w-full max-w-6xl">
        <span
          style={{ ...enter(0), borderColor: "rgba(244,243,238,0.18)", color: "var(--accent)" }}
          className="inline-block rounded-full border px-4 py-1.5 text-xs font-semibold tracking-[0.2em] backdrop-blur-sm"
        >
          ENZO.DEV · CODEUR WEB
        </span>

        <h1
          id="hero-heading"
          tabIndex={-1}
          style={enter(90)}
          className="font-display mt-7 max-w-3xl text-5xl font-bold leading-[1.02] tracking-tight text-white outline-none sm:text-7xl lg:text-[6.5rem]"
        >
          Faites décoller <span className="text-gradient">votre projet.</span>
        </h1>

        <p style={{ ...enter(190), color: "rgba(244,243,238,0.72)" }} className="mt-7 max-w-lg text-base leading-relaxed sm:text-lg">
          Sous vos yeux, pas dans six mois. Je code en direct, sur mesure, sans template
          recyclé — chaque interaction est pensée pour transformer vos visiteurs en clients.
        </p>

        <div style={enter(300)} className="mt-11 flex flex-col gap-4 sm:flex-row sm:items-center">
          {/* The "Reality Warp" trigger: a real navigation to /projets, just
              staged through a full-screen boost/impact sequence first
              instead of a plain route swap — see useRealityWarp(). A
              button (not a Link) since the transition itself, not a plain
              href, drives when the route actually changes. */}
          <button
            type="button"
            ref={primaryCta.ref}
            onClick={() => triggerWarp("/projets")}
            onPointerEnter={hoverSfx}
            onPointerMove={primaryCta.onPointerMove}
            onPointerLeave={primaryCta.onPointerLeave}
            className="btn-accent glow-pulse rounded-full px-8 py-3.5 text-center text-sm font-semibold shadow-[0_14px_45px_-16px_rgba(var(--accent-rgb),0.85)] will-change-transform"
          >
            Voir de quoi je suis capable
          </button>
          {/* eslint-disable @typescript-eslint/no-explicit-any */}
          <Link
            {...({
              ref: secondaryCta.ref,
              href: "/contact",
              onClick: clickSfx,
              onPointerEnter: hoverSfx,
              onPointerMove: secondaryCta.onPointerMove,
              onPointerLeave: secondaryCta.onPointerLeave,
              className:
                "rounded-full border px-8 py-3.5 text-center text-sm font-semibold text-white/85 backdrop-blur-sm transition-colors hover:text-white will-change-transform",
              style: { borderColor: "rgba(244,243,238,0.22)" },
            } as any)}
          >
            Parlons de votre idée →
          </Link>
          {/* eslint-enable @typescript-eslint/no-explicit-any */}
        </div>
      </div>

      <div style={enter(520)} className="pointer-events-none absolute inset-x-0 bottom-8 z-10 flex flex-col items-center gap-2">
        <span className="font-mono text-[10px] tracking-[0.3em]" style={{ color: "rgba(244,243,238,0.45)" }}>
          DÉFILEZ
        </span>
        <span className="h-8 w-px animate-pulse" style={{ background: "var(--accent)" }} />
      </div>
    </section>
  );
}
