import { useRef } from "react";
import type { PointerEvent } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { GsapReveal } from "../lib/GsapReveal";
import { useI18n } from "../i18n";

/** Dark banner CTA on Home driving into the full Catalogue page. */
export default function CatalogueTeaser() {
  const { t } = useI18n();
  const wrapRef = useRef<HTMLAnchorElement>(null);

  const handleMove = (e: PointerEvent<HTMLAnchorElement>) => {
    const el = wrapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--pointer-x", `${e.clientX - rect.left}px`);
    el.style.setProperty("--pointer-y", `${e.clientY - rect.top}px`);
  };

  return (
    <section className="relative px-6 py-20 sm:px-10 sm:py-28">
      <GsapReveal dir="scale">
        <Link
          href="/projets"
          aria-label={t.teaser.aria}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ref={wrapRef as any}
          onPointerMove={handleMove}
          className="group pointer-halo relative mx-auto flex max-w-5xl cursor-pointer flex-col items-center overflow-hidden rounded-[28px] px-8 py-16 text-center transition-transform duration-500 hover:scale-[1.01] sm:py-24"
          style={{ background: "linear-gradient(160deg, #0a0a0d, #131318)" }}
        >
          <div className="orb-field">
            <span className="orb orb-a" style={{ opacity: 0.5 }} />
            <span className="orb orb-b" style={{ opacity: 0.4 }} />
          </div>
          <div
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            style={{
              background:
                "radial-gradient(600px circle at var(--pointer-x,50%) var(--pointer-y,50%), rgba(var(--accent-rgb),0.18), transparent 60%)",
            }}
          />

          <span className="relative z-10 font-mono text-xs tracking-[0.4em]" style={{ color: "var(--accent)" }}>
            {t.teaser.kicker}
          </span>

          <h2 className="font-display relative z-10 mt-6 text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl">
            {t.teaser.title1} <span className="text-gradient">{t.teaser.title2}</span>
          </h2>

          <p className="relative z-10 mt-6 max-w-xl text-sm leading-relaxed text-white/60 sm:text-base">
            {t.teaser.text}
          </p>

          <span className="btn-accent glow-pulse relative z-10 mt-10 inline-flex items-center gap-2 rounded-full px-8 py-4 text-sm font-semibold transition-transform duration-300 group-hover:scale-105">
            {t.teaser.cta}
            <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
          </span>
        </Link>
      </GsapReveal>
    </section>
  );
}
