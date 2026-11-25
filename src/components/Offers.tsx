import { Lock, ArrowRight } from "@getpapillon/papicons";
import { useI18n } from "../i18n";
import { STRIPE_LINKS } from "../lib/site";
import { presetQuote } from "../lib/quoteEvents";

const FEATURED = 1;

export default function Offers() {
  const { t } = useI18n();
  const o = t.offers;
  const c = t.care;

  return (
    <section id="tarifs" className="scroll-mt-24 pt-24 sm:pt-32" aria-labelledby="pricing-heading">
      <div className="wrap">
        <div className="grid gap-6 lg:grid-cols-12">
          <h2 id="pricing-heading" className="h2 lg:col-span-6" data-reveal="rise">
            {o.title}
          </h2>
          <p className="muted self-end text-lg lg:col-span-6" data-reveal="rise" style={{ ["--i" as string]: 1 }}>
            {o.intro}
          </p>
        </div>

        <ol className="mt-14 border-t" style={{ borderColor: "var(--ink)" }}>
          {o.items.map((offer, i) => {
            const featured = i === FEATURED;
            const stripe = i === 0 ? STRIPE_LINKS.essentiel : "";
            return (
              <li key={offer.name} className="price-row" data-featured={featured} data-reveal="rise" style={{ ["--i" as string]: i }}>
                <div className="pr-name">
                  <h3 className="text-[1.35rem] font-extrabold">{offer.name}</h3>
                  {featured && <span className="pr-flag">{o.popular}</span>}
                  <p className="muted mt-2 max-w-sm text-[0.98rem]">{offer.text}</p>
                </div>
                <p className="pr-price">
                  {offer.price && <span className="meta block">{o.from}</span>}
                  <span className="font-display tnum">{offer.price || o.onQuote}</span>
                </p>
                <p className="pr-feats">{offer.features.join(" · ")}</p>
                <div className="pr-cta">
                  <button type="button" onClick={() => presetQuote({ offer: i })} className={`btn ${featured ? "btn-light" : "btn-line"}`}>
                    {o.cta}
                    <ArrowRight size={16} aria-hidden="true" />
                  </button>
                  {stripe && (
                    <a href={stripe} target="_blank" rel="noopener noreferrer" className="link mt-3 inline-flex items-center gap-1.5 text-sm font-semibold">
                      <Lock size={13} aria-hidden="true" />
                      {o.pay}
                    </a>
                  )}
                </div>
              </li>
            );
          })}
        </ol>

        <p className="muted mt-8 max-w-3xl text-[0.98rem]" data-reveal="rise">
          {o.note}
        </p>
      </div>

      <div className="care-band mt-20" data-reveal="rise">
        <div className="wrap grid gap-8 py-14 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-5">
            <p className="text-sm font-bold uppercase tracking-[0.1em]" style={{ color: "#fff010" }}>
              {c.label}
            </p>
            <h3 className="mt-3 font-display text-[clamp(2.4rem,4.4vw,3.6rem)] leading-none">
              {c.name}, <span className="tnum">{c.price}</span>
              <span className="text-[0.5em]"> {c.period}</span>
            </h3>
            <p className="mt-4 max-w-md" style={{ color: "#cfc9e2" }}>
              {c.text}
            </p>
          </div>
          <p className="text-[1.02rem] leading-relaxed lg:col-span-4" style={{ color: "#eeeaf8" }}>
            {c.features.join(" · ")}
          </p>
          <div className="lg:col-span-3 lg:text-right">
            <button type="button" onClick={() => presetQuote({ care: true })} className="btn btn-light">
              {c.cta}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
