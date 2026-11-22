import { Check, Info, Lock, Globe } from "@getpapillon/papicons";
import { GsapReveal as Reveal } from "../lib/GsapReveal";
import { TiltCard } from "../lib/TiltCard";
import { useI18n } from "../i18n";
import { STRIPE_LINKS } from "../lib/site";
import { presetQuote } from "../lib/quoteEvents";

/** Index 1 (Direction artistique) is the highlighted card; index 0 is the
 *  only fixed-price offer and can carry a Stripe payment link. */
const HIGHLIGHTED = 1;

export default function Offers() {
  const { t } = useI18n();
  const o = t.offers;

  return (
    <section id="offres" className="relative scroll-mt-20 px-6 py-24 sm:px-10 sm:py-32">
      <Reveal>
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold tracking-[0.3em]" style={{ color: "var(--accent-ink)" }}>
            {o.kicker}
          </span>
          <h2 className="font-display mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
            {o.title1} <span className="text-gradient-ink">{o.title2}</span>
          </h2>
          <p className="mt-5 text-base leading-relaxed" style={{ color: "var(--home-text-muted)" }}>
            {o.intro}
          </p>
        </div>
      </Reveal>

      <div className="mx-auto mt-14 grid max-w-5xl min-w-0 gap-6 lg:grid-cols-3">
        {o.items.map((offer, i) => {
          const highlighted = i === HIGHLIGHTED;
          const stripe = i === 0 ? STRIPE_LINKS.essentiel : "";
          return (
            <Reveal key={i} dir="up" delay={i * 100} className="min-w-0">
              <TiltCard maxTilt={highlighted ? 8 : 6} className="h-full rounded-2xl">
                <div
                  className={`flex h-full flex-col rounded-2xl p-8 ${
                    highlighted ? "shadow-[0_24px_70px_-24px_rgba(var(--accent-rgb),0.55)]" : "glass-light-solid"
                  }`}
                  style={highlighted ? { background: "var(--home-surface)", border: "1.5px solid var(--accent-strong)" } : undefined}
                >
                  {highlighted && (
                    <span className="btn-accent mb-4 inline-block w-fit rounded-full px-3 py-1 text-[10px] font-bold tracking-[0.2em]">
                      {o.popular}
                    </span>
                  )}
                  <h3 className="font-display text-lg font-bold">{offer.name}</h3>
                  <div className="mt-4 flex items-baseline gap-2">
                    {offer.price && (
                      <span className="text-xs" style={{ color: "var(--home-text-muted)" }}>
                        {o.from}
                      </span>
                    )}
                    <span className="font-display text-3xl font-bold">{offer.price || o.onQuote}</span>
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
                  <button
                    type="button"
                    onClick={() => presetQuote({ offer: i })}
                    className={`mt-8 rounded-full px-6 py-3 text-center text-sm font-semibold transition-transform hover:scale-[1.03] ${
                      highlighted ? "btn-accent" : "border"
                    }`}
                    style={highlighted ? undefined : { borderColor: "var(--home-border)" }}
                  >
                    {o.cta}
                  </button>
                  {stripe && (
                    <a
                      href={stripe}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-accent mt-3 inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-transform hover:scale-[1.03]"
                    >
                      <Lock size={14} aria-hidden="true" />
                      {o.pay}
                    </a>
                  )}
                </div>
              </TiltCard>
            </Reveal>
          );
        })}
      </div>

      <Reveal>
        <div
          className="mx-auto mt-6 flex max-w-5xl flex-col gap-6 rounded-2xl border p-8 md:flex-row md:items-center md:justify-between"
          style={{ borderColor: "var(--home-border)", background: "var(--home-surface)" }}
        >
          <div className="md:max-w-md">
            <span className="text-[10px] font-bold tracking-[0.2em]" style={{ color: "var(--accent-ink)" }}>
              {t.care.kicker}
            </span>
            <h3 className="font-display mt-2 flex items-center gap-2 text-lg font-bold">
              <Globe size={20} style={{ color: "var(--accent-ink)" }} aria-hidden="true" />
              {t.care.name}
            </h3>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="font-display text-3xl font-bold">{t.care.price}</span>
              <span className="text-sm" style={{ color: "var(--home-text-muted)" }}>
                {t.care.period}
              </span>
            </div>
            <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--home-text-muted)" }}>
              {t.care.text}
            </p>
          </div>
          <div className="flex flex-col gap-5 md:items-end">
            <ul className="space-y-2.5">
              {t.care.features.map((feat) => (
                <li key={feat} className="flex items-start gap-2.5 text-sm">
                  <Check size={16} className="mt-0.5 shrink-0" style={{ color: "var(--accent-ink)" }} aria-hidden="true" />
                  <span style={{ color: "var(--home-text-muted)" }}>{feat}</span>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => presetQuote({ care: true })}
              className="w-full rounded-full border px-6 py-3 text-sm font-semibold transition-transform hover:scale-[1.03] md:w-auto"
              style={{ borderColor: "var(--accent-strong)" }}
            >
              {t.care.cta}
            </button>
          </div>
        </div>
      </Reveal>

      <Reveal>
        <p
          className="glass-light-solid mx-auto mt-10 flex max-w-3xl items-start gap-3 rounded-2xl p-5 text-sm leading-relaxed"
          style={{ color: "var(--home-text-muted)" }}
        >
          <Info size={18} className="mt-0.5 shrink-0" style={{ color: "var(--accent-ink)" }} aria-hidden="true" />
          {o.note}
        </p>
      </Reveal>
    </section>
  );
}
