import { ArrowUpRight } from "lucide-react";
import { GsapReveal as Reveal } from "../lib/GsapReveal";
import { TiltCard } from "../lib/TiltCard";
import { useAudio } from "../lib/audio";

const PROJECTS = [
  {
    name: "KL",
    type: "Chaîne YouTube",
    text: "Habillage et présence en ligne pensés pour une audience créative.",
    href: "https://www.youtube.com/@KL",
  },
  {
    name: "Doktor",
    type: "Portfolio",
    text: "Un portfolio clair, orienté conversion, pour présenter un univers créatif.",
    href: "https://doktor-portfolio.example.com",
  },
  {
    name: "Unique Melba",
    type: "Site vitrine",
    text: "Direction artistique sur mesure et structure responsive de bout en bout.",
    href: "https://unique-melba.example.com",
  },
];

export default function Projects() {
  const { clickSfx } = useAudio();
  return (
    <section id="projets" className="relative overflow-hidden px-6 py-24 sm:px-10 sm:py-32" style={{ background: "var(--home-bg-soft)" }}>
      <div className="orb-field">
        <span className="orb orb-b" style={{ opacity: 0.25 }} />
      </div>

      <Reveal>
        <div className="relative z-10 mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold tracking-[0.3em]" style={{ color: "var(--accent-ink)" }}>
            PROJETS
          </span>
          <h2 className="font-display mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
            Des projets réels, <span className="text-gradient-ink">livrés.</span>
          </h2>
        </div>
      </Reveal>

      <div className="relative z-10 mx-auto mt-14 grid max-w-5xl min-w-0 gap-6 sm:grid-cols-3">
        {PROJECTS.map((p, i) => (
          <Reveal key={p.name} dir="up" delay={i * 90} className="min-w-0">
            <TiltCard
              as="a"
              href={p.href}
              target="_blank"
              rel="noreferrer"
              onClick={clickSfx}
              maxTilt={9}
              className="group flex h-full rounded-2xl"
            >
              <div className="glass-light-solid flex h-full flex-col rounded-2xl p-8 transition-transform duration-300 group-hover:-translate-y-1">
                <div className="flex items-start justify-between">
                  <h3 className="font-display text-xl font-bold">{p.name}</h3>
                  <ArrowUpRight
                    size={18}
                    className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    style={{ color: "var(--accent-ink)" }}
                    aria-hidden="true"
                  />
                </div>
                <span className="mt-1 text-xs font-semibold tracking-[0.15em]" style={{ color: "var(--accent-ink)" }}>
                  {p.type.toUpperCase()}
                </span>
                <p className="mt-4 flex-1 text-sm leading-relaxed" style={{ color: "var(--home-text-muted)" }}>
                  {p.text}
                </p>
              </div>
            </TiltCard>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
