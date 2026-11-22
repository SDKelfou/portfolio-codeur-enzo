import { ArrowRightUp } from "@getpapillon/papicons";
import { GsapReveal as Reveal } from "../lib/GsapReveal";
import { TiltCard } from "../lib/TiltCard";
import { useI18n } from "../i18n";

const PROJECTS = [
  {
    name: "NEXUS",
    image: "/projets/nexus.webp",
    type: "Logiciel",
    text: "Logiciel conçu et développé par moi pour optimiser un PC Windows : nettoyage, monitoring, pilotes, confidentialité et IA locale.",
    href: "https://nexus-multitools.nexus-multitools.workers.dev/",
    external: true,
  },
  {
    name: "Café Mistral",
    image: "/projets/cafe-mistral.webp",
    type: "Site vitrine · exemple",
    text: "Un café-bar de village imaginaire : carte, horaires et bouton d'appel visibles dès l'ouverture. À visiter comme le ferait un client.",
    href: "/exemples/cafe-mistral/",
    external: false,
  },
  {
    name: "Atelier Lune",
    image: "/projets/atelier-lune.webp",
    type: "Site vitrine · exemple",
    text: "Un salon de coiffure imaginaire, à l'ambiance douce et élégante : tarifs clairs, accès simple, prise de rendez-vous par téléphone.",
    href: "/exemples/atelier-lune/",
    external: false,
  },
];

export default function Projects() {
  const { t } = useI18n();
  return (
    <section id="projets" className="relative overflow-hidden px-6 py-24 sm:px-10 sm:py-32" style={{ background: "var(--home-bg-soft)" }}>
      <div className="orb-field">
        <span className="orb orb-b" style={{ opacity: 0.25 }} />
      </div>

      <Reveal>
        <div className="relative z-10 mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold tracking-[0.3em]" style={{ color: "var(--accent-ink)" }}>
            {t.projects.kicker}
          </span>
          <h2 className="font-display mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
            {t.projects.title1} <span className="text-gradient-ink">{t.projects.title2}</span>
          </h2>
        </div>
      </Reveal>

      <div className="relative z-10 mx-auto mt-14 grid max-w-5xl min-w-0 gap-6 sm:grid-cols-3">
        {PROJECTS.map((p, i) => (
          <Reveal key={p.name} dir="up" delay={i * 90} className="min-w-0">
            <TiltCard
              as="a"
              href={p.href}
              {...(p.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              maxTilt={9}
              className="group flex h-full rounded-2xl"
            >
              <div className="glass-light-solid flex h-full flex-col overflow-hidden rounded-2xl transition-transform duration-300 group-hover:-translate-y-1">
                <div className="aspect-[16/10] overflow-hidden border-b" style={{ borderColor: "var(--home-border)" }}>
                  <img
                    src={p.image}
                    alt={`${p.name} — aperçu`}
                    width={800}
                    height={500}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.04]"
                  />
                </div>
                <div className="flex flex-1 flex-col p-7">
                <div className="flex items-start justify-between">
                  <h3 className="font-display text-xl font-bold">{p.name}</h3>
                  <ArrowRightUp
                    size={18}
                    className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    style={{ color: "var(--accent-ink)" }}
                    aria-hidden="true"
                  />
                </div>
                <span className="mt-1 text-xs font-semibold tracking-[0.15em]" style={{ color: "var(--accent-ink)" }}>
                  {t.projects.items[i].type.toUpperCase()}
                </span>
                <p className="mt-4 flex-1 text-sm leading-relaxed" style={{ color: "var(--home-text-muted)" }}>
                  {t.projects.items[i].text}
                </p>
                </div>
              </div>
            </TiltCard>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
