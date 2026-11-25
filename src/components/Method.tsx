import { useI18n } from "../i18n";

export default function Method() {
  const { t } = useI18n();
  const m = t.method;
  return (
    <section id="methode" className="cv scroll-mt-24 py-24 sm:py-32" style={{ background: "var(--bg-2)" }} aria-labelledby="method-heading">
      <div className="wrap">
        <div className="grid gap-6 lg:grid-cols-12">
          <h2 id="method-heading" className="h2 lg:col-span-8" data-reveal="rise">
            {m.title}
          </h2>
          <p className="muted self-end text-lg lg:col-span-4" data-reveal="rise" style={{ ["--i" as string]: 1 }}>
            {m.intro}
          </p>
        </div>
        <ol className="mt-14 sm:mt-20">
          {m.steps.map((s, i) => (
            <li key={s.title} className="relative grid gap-3 py-9 sm:grid-cols-12 sm:gap-8 sm:py-12">
              <span className="absolute inset-x-0 top-0 h-px" style={{ background: "var(--line-strong)" }} data-reveal="crack" />
              <p className="meta tnum font-bold uppercase tracking-[0.08em] sm:col-span-3 sm:pt-3" style={{ color: "var(--ink)" }}>
                {s.when}
              </p>
              <h3 className="font-display text-[clamp(2.4rem,5vw,4rem)] leading-none sm:col-span-4" data-reveal="rise" style={{ ["--i" as string]: i }}>
                {s.title}
              </h3>
              <p className="muted max-w-md text-[1.0625rem] sm:col-span-5 sm:pt-2" data-reveal="rise" style={{ ["--i" as string]: i + 1 }}>
                {s.text}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
