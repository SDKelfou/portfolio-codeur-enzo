import { ArrowRight, Check } from "@getpapillon/papicons";
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
    <section id="pourquoi" className="cv scroll-mt-24 py-24 sm:py-32" style={{ background: "var(--bg-2)" }} aria-labelledby="why-heading">
      <div className="wrap">
        <div className="grid gap-6 lg:grid-cols-12">
          <h2 id="why-heading" className="h2 lg:col-span-7" data-reveal="rise">
            {w.title}
          </h2>
          <p className="muted self-end text-lg lg:col-span-5" data-reveal="rise" style={{ ["--i" as string]: 1 }}>
            {w.intro}
          </p>
        </div>
        <div className="mt-14 grid gap-5 lg:grid-cols-2">
          {sides.map(({ key, data, featured }, i) => (
            <article
              key={key}
              className="flex flex-col rounded-[var(--r-xl)] border p-7 sm:p-10"
              style={{
                borderColor: featured ? "var(--ink)" : "var(--line)",
                background: featured ? "var(--surface)" : "transparent",
                boxShadow: featured ? "var(--shadow)" : "none",
              }}
              data-reveal="rise"
            >
              <h3 className="font-display text-[clamp(2rem,3.4vw,2.9rem)] leading-[1.02]" style={{ ["--i" as string]: i }}>
                {data.title}
              </h3>
              <p className="muted mt-4 text-[1.05rem]">{data.text}</p>
              <ul className="mt-6 flex-1 space-y-3">
                {data.points.map((p) => (
                  <li key={p} className="flex items-start gap-3">
                    <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full" style={{ background: featured ? "var(--light)" : "var(--lav)", color: "#24222d" }}>
                      <Check size={13} />
                    </span>
                    <span className="font-semibold">{p}</span>
                  </li>
                ))}
              </ul>
              <TLink href="/contact#contact" className={`btn mt-8 self-start ${featured ? "btn-light" : "btn-line"}`}>
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
