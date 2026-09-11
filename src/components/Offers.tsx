import { Check } from "lucide-react";
import { GsapReveal as Reveal } from "../lib/GsapReveal";
import { TiltCard } from "../lib/TiltCard";
import { useAudio } from "../lib/audio";

const OFFERS = [
  {
    name: "Essentiel",
    price: "599 €",
    period: "à partir de",
    text: "Un site vitrine clair et responsive, pour poser des bases solides en ligne.",
    features: ["Site one-page ou multi-sections", "Responsive mobile & desktop", "Mise en ligne accompagnée"],
    highlighted: false,
  },
  {
    name: "Direction artistique",
    price: "1200 €",
    period: "à partir de",
    text: "Une identité visuelle sur mesure, animations incluses, pour un site qui vous ressemble vraiment.",
    features: ["Direction artistique complète", "Animations & micro-interactions", "Structure multi-pages"],
    highlighted: true,
  },
  {
    name: "Création totale",
    price: "Sur devis",
    period: "",
    text: "Un projet plus ambitieux (application, outil sur mesure, expérience interactive) ? On en discute ensemble.",
    features: ["Cahier des charges personnalisé", "Fonctionnalités sur mesure", "Accompagnement de bout en bout"],
    highlighted: false,
  },
];

export default function Offers() {
  const { clickSfx } = useAudio();
  return (
    <section id="offres" className="relative px-6 py-24 sm:px-10 sm:py-32">
      <Reveal>
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold tracking-[0.3em]" style={{ color: "var(--accent-ink)" }}>
            OFFRES
          </span>
          <h2 className="font-display mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
            Un tarif honnête, <span className="text-gradient-ink">adapté à votre projet.</span>
          </h2>
          <p className="mt-5 text-base leading-relaxed" style={{ color: "var(--home-text-muted)" }}>
            Les prix ci-dessous sont des points de départ : chaque projet est différent,
            on ajuste ensemble selon vos besoins réels.
          </p>
        </div>
      </Reveal>

      <div className="mx-auto mt-14 grid max-w-5xl min-w-0 gap-6 lg:grid-cols-3">
        {OFFERS.map((offer, i) => (
          <Reveal key={offer.name} dir="up" delay={i * 100} className="min-w-0">
            <TiltCard maxTilt={offer.highlighted ? 10 : 7} className="h-full rounded-2xl">
              <div
                className={`flex h-full flex-col rounded-2xl p-8 transition-transform duration-300 ${
                  offer.highlighted ? "shadow-[0_24px_70px_-24px_rgba(var(--accent-rgb),0.55)]" : "glass-light-solid"
                }`}
                style={
                  offer.highlighted
                    ? { background: "var(--home-surface)", border: "1.5px solid var(--accent-strong)" }
                    : undefined
                }
              >
                {offer.highlighted && (
                  <span className="btn-accent mb-4 inline-block w-fit rounded-full px-3 py-1 text-[10px] font-bold tracking-[0.2em]">
                    LE PLUS CHOISI
                  </span>
                )}
                <h3 className="font-display text-lg font-bold">{offer.name}</h3>
                <div className="mt-4 flex items-baseline gap-2">
                  {offer.period && <span className="text-xs" style={{ color: "var(--home-text-muted)" }}>{offer.period}</span>}
                  <span className="font-display text-3xl font-bold">{offer.price}</span>
                </div>
                <p className="mt-4 text-sm leading-relaxed" style={{ color: "var(--home-text-muted)" }}>
                  {offer.text}
                </p>
                <ul className="mt-6 flex-1 space-y-3">
                  {offer.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm">
                      <Check size={16} className="mt-0.5 shrink-0" style={{ color: "var(--accent-ink)" }} aria-hidden="true" />
                      <span style={{ color: "var(--home-text-muted)" }}>{f}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href="mailto:enzo.entreprise@hotmail.com?subject=Mon%20projet"
                  onClick={clickSfx}
                  className={`mt-8 rounded-full px-6 py-3 text-center text-sm font-semibold transition-transform hover:scale-[1.03] ${
                    offer.highlighted ? "btn-accent" : "border"
                  }`}
                  style={offer.highlighted ? undefined : { borderColor: "var(--home-border)" }}
                >
                  En discuter
                </a>
              </div>
            </TiltCard>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
