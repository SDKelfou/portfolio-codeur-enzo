import { ArrowRight } from "@getpapillon/papicons";
import { useI18n } from "../i18n";
import TLink from "./TLink";

export default function Why() {
  const { t } = useI18n();
  const w = t.why;
  const sides = [
    { key: "no", data: w.noSite, featured: true },
    { key: "has", data: w.hasSite, featured: false },
  ];
  return (
    <section id="pourquoi" className="cv scroll-mt-24 py-24 sm:py-32" aria-labelledby="why-heading">
      <div className="wrap">
        <h2 id="why-heading" className="font-display max-w-5xl text-[clamp(3rem,7.6vw,7rem)] leading-[0.92] tracking-[-0.03em]" data-reveal="rise">
          {w.title}
        </h2>
        <p className="muted mt-8 max-w-2xl text-lg" data-reveal="rise" style={{ ["--i" as string]: 1 }}>
          {w.intro}
        </p>
        <div className="why-split mt-16">
          {sides.map(({ key, data, featured }) => (
            <article key={key} className="why-side" data-featured={featured} data-reveal="rise">
              <h3 className="font-display text-[clamp(2rem,3.4vw,2.9rem)] leading-[1.02]">
                <span className={featured ? "marker" : undefined}>{data.title}</span>
              </h3>
              <p className="muted mt-4 max-w-md text-[1.05rem]">{data.text}</p>
              <ul className="mt-7 space-y-3">
                {data.points.map((p, i) => (
                  <li key={p} className="why-point">
                    <span className="tnum">{String(i + 1).padStart(2, "0")}</span>
                    {p}
                  </li>
                ))}
              </ul>
              <TLink href="/contact#contact" className={`btn mt-9 ${featured ? "btn-light" : "btn-line"}`}>
                {data.cta}
                <ArrowRight size={16} aria-hidden="true" />
              </TLink>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
