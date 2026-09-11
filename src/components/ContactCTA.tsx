import { GsapReveal as Reveal } from "../lib/GsapReveal";
import { useAudio } from "../lib/audio";
import { useMagnetic } from "../lib/useMagnetic";

export default function ContactCTA() {
  const { clickSfx, hoverSfx } = useAudio();
  const cta = useMagnetic<HTMLAnchorElement>(0.25);
  return (
    <section className="relative overflow-hidden px-6 py-24 text-center sm:px-10 sm:py-32">
      <div className="orb-field">
        <span className="orb orb-a" style={{ opacity: 0.3 }} />
        <span className="orb orb-b" style={{ opacity: 0.25 }} />
      </div>
      <Reveal dir="scale" className="relative z-10">
        <div className="glass-light mx-auto max-w-2xl rounded-2xl px-8 py-16">
          <span className="text-xs font-semibold tracking-[0.3em]" style={{ color: "var(--accent-ink)" }}>
            PARLONS-EN
          </span>
          <h2 className="font-display mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
            Une idée en tête ? <span className="text-gradient-ink">Écrivez-moi.</span>
          </h2>
          <p className="mt-5 text-base leading-relaxed" style={{ color: "var(--home-text-muted)" }}>
            Racontez-moi votre projet en quelques lignes — je réponds personnellement,
            sans détour commercial.
          </p>
          <a
            ref={cta.ref}
            href="mailto:enzo.entreprise@hotmail.com?subject=Mon%20projet"
            onClick={clickSfx}
            onPointerEnter={hoverSfx}
            onPointerMove={cta.onPointerMove}
            onPointerLeave={cta.onPointerLeave}
            className="btn-accent glow-pulse mt-9 inline-block rounded-full px-9 py-4 text-sm font-semibold shadow-[0_16px_45px_-16px_rgba(var(--accent-rgb),0.9)] will-change-transform"
          >
            Écrire à enzo.entreprise@hotmail.com
          </a>
        </div>
      </Reveal>
    </section>
  );
}
