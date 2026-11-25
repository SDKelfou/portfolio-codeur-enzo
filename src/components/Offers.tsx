import { Check, Lock, Globe, ArrowRight } from "@getpapillon/papicons";
import { useI18n } from "../i18n";
import { STRIPE_LINKS } from "../lib/site";
import { presetQuote } from "../lib/quoteEvents";

/** Index 1 (Direction artistique) keeps the existing "recommended"
 *  intention; index 0 is the only fixed price and may carry Stripe. */
const FEATURED = 1;

export default function Offers() {
  const { t } = useI18n();
  const o = t.offers;
  const c = t.care;

  return (
    <section id="tarifs" className="cv scroll-mt-24 py-24 sm:py-32" aria-labelledby="pricing-heading">
      <div className="wrap">
        <div className="grid gap-6 lg:grid-cols-12">
          <h2 id="pricing-heading" className="h2 lg:col-span-6" data-reveal="rise">
            {o.title}
          </h2>
          <p className="muted self-end text-lg lg:col-span-6" data-reveal="rise" style={{ ["--i" as string]: 1 }}>
            {o.intro}
          </p>
        </div>

        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {o.items.map((offer, i) => {
            const featured = i === FEATURED;
            const stripe = i === 0 ? STRIPE_LINKS.essentiel : "";
            return (
              <article key={offer.name} className="price-card" data-featured={featured} data-reveal="rise" style={{ ["--i" as string]: i }}>
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-lg font-extrabold">{offer.name}</h3>
                  {featured && (
                    <span className="rounded-full px-3 py-1 text-xs font-bold" style={{ background: "var(--light)", color: "var(--light-ink)" }}>
                      {o.popular}
                    </span>
                  )}
                </div>
                <p className="mt-6 flex items-baseline gap-2">
                  {offer.price && <span className="meta">{o.from}</span>}
                  <span className="font-display tnum text-[3.4rem] leading-none tracking-[-0.02em]">{offer.price || o.onQuote}</span>
                </p>
                <p className="muted mt-4 text-[0.98rem]">{offer.text}</p>
                <ul className="mt-6 flex-1 space-y-3 border-t pt-6" style={{ borderColor: "var(--line)" }}>
                  {offer.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-[0.95rem]">
                      <Check size={16} className="mt-1 shrink-0" style={{ color: "var(--iris-ink)" }} aria-hidden="true" />
                      <span style={{ color: "var(--ink-2)" }}>{f}</span>
                    </li>
                  ))}
                </ul>
                <button type="button" onClick={() => presetQuote({ offer: i })} className={`btn mt-8 w-full ${featured ? "btn-light" : "btn-line"}`}>
                  {o.cta}
                  <ArrowRight size={16} aria-hidden="true" />
                </button>
                {stripe && (
                  <a href={stripe} target="_blank" rel="noopener noreferrer" className="btn btn-line mt-3 w-full">
                    <Lock size={15} aria-hidden="true" />
                    {o.pay}
                  </a>
                )}
              </article>
            );
          })}
        </div>

        <article
          className="mt-5 grid gap-8 rounded-[28px] border p-7 sm:p-10 lg:grid-cols-12 lg:items-center"
          style={{ borderColor: "var(--line)", background: "var(--bg-2)" }}
          data-reveal="rise"
        >
          <div className="lg:col-span-5">
            <p className="meta font-bold uppercase tracking-[0.08em]">{c.label}</p>
            <h3 className="mt-2 flex items-center gap-2.5 text-xl font-extrabold">
              <Globe size={20} style={{ color: "var(--iris-ink)" }} aria-hidden="true" />
              {c.name}
            </h3>
            <p className="mt-4 flex items-baseline gap-1.5">
              <span className="font-display tnum text-[3rem] leading-none">{c.price}</span>
              <span className="muted">{c.period}</span>
            </p>
            <p className="muted mt-4">{c.text}</p>
          </div>
          <ul className="space-y-3 lg:col-span-4">
            {c.features.map((f) => (
              <li key={f} className="flex items-start gap-3 text-[0.95rem]">
                <Check size={16} className="mt-1 shrink-0" style={{ color: "var(--iris-ink)" }} aria-hidden="true" />
                <span style={{ color: "var(--ink-2)" }}>{f}</span>
              </li>
            ))}
          </ul>
          <div className="lg:col-span-3 lg:text-right">
            <button type="button" onClick={() => presetQuote({ care: true })} className="btn btn-line w-full lg:w-auto">
              {c.cta}
            </button>
          </div>
        </article>

        <p className="muted mt-8 max-w-3xl text-[0.95rem]" data-reveal="rise">
          {o.note}
        </p>
      </div>
    </section>
  );
}
