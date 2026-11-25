import { Check } from "@getpapillon/papicons";
import { useI18n } from "../i18n";

export default function Prep() {
  const { t } = useI18n();
  const p = t.prep;
  return (
    <section id="preparer" className="cv scroll-mt-24 pt-24 sm:pt-32" aria-labelledby="prep-heading">
      <div className="wrap">
        <h2 id="prep-heading" className="font-display text-[clamp(3rem,7vw,6.6rem)] leading-[0.92] tracking-[-0.03em]" data-reveal="rise">
          {p.title}
        </h2>
        <p className="muted mt-8 max-w-3xl text-lg" data-reveal="rise" style={{ ["--i" as string]: 1 }}>
          {p.intro}
        </p>

        <div className="prep-grid mt-16">
          {p.groups.map((g, i) => (
            <div key={g.title} className="prep-col" data-reveal="rise" style={{ ["--i" as string]: i }}>
              <h3 className="text-[1.05rem] font-extrabold">{g.title}</h3>
              <ul className="mt-5 space-y-3">
                {g.items.map((it) => (
                  <li key={it} className="flex items-start gap-3 text-[0.98rem]" style={{ color: "var(--ink-2)" }}>
                    <Check size={15} className="mt-1 shrink-0" style={{ color: "var(--iris-ink)" }} aria-hidden="true" />
                    {it}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-10 max-w-3xl text-[1.02rem] font-semibold">{p.setup}</p>
      </div>

      <div className="risk-band mt-20">
        <div className="wrap grid gap-10 py-16 lg:grid-cols-12">
          <h3 className="font-display text-[clamp(2.4rem,4.6vw,4.2rem)] leading-[0.95] lg:col-span-4">{p.riskTitle}</h3>
          <ol className="space-y-6 lg:col-span-8">
            {p.risks.map((r, i) => (
              <li key={r} className="grid grid-cols-[2.5rem_1fr] gap-4 border-t pt-6 text-[1.02rem]" style={{ borderColor: "rgba(248,246,240,.18)" }}>
                <span className="tnum text-sm font-extrabold" style={{ color: "#fff010" }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>{r}</span>
              </li>
            ))}
          </ol>
          <p className="text-sm leading-relaxed lg:col-span-8 lg:col-start-5" style={{ color: "#cfc9e2" }}>
            {p.disclaimer}
          </p>
        </div>
      </div>
    </section>
  );
}
