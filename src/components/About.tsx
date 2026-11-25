import { useI18n } from "../i18n";
import { Mark } from "./Nav";

export default function About() {
  const { t, lang } = useI18n();
  const a = t.about;
  const [qo, qc] = lang === "fr" ? ["« ", " »"] : lang === "de" ? ["„", "“"] : ["“", "”"];
  return (
    <section id="a-propos" className="cv scroll-mt-24 overflow-hidden py-24 sm:py-32" style={{ background: "var(--bg-2)" }} aria-labelledby="about-heading">
      <div className="wrap">
        <h2 id="about-heading" className="h2 max-w-4xl" data-reveal="rise">
          {a.title}
        </h2>
        <blockquote className="mt-10 max-w-4xl font-display text-[clamp(1.75rem,3.4vw,3rem)] italic leading-[1.12]" style={{ color: "var(--ink-2)" }} data-reveal="rise">
          <span aria-hidden="true" style={{ color: "var(--iris-ink)" }}>
            {qo}
          </span>
          {a.quote}
          <span aria-hidden="true" style={{ color: "var(--iris-ink)" }}>
            {qc}
          </span>
        </blockquote>

        <div className="mt-16 grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5" data-reveal="rise">
            <div className="flex items-center gap-3">
              <Mark size={34} />
              <p className="text-xl font-extrabold">Enzo</p>
            </div>
            <p className="muted mt-5 text-[1.0625rem]">{a.text}</p>
          </div>
          <div className="lg:col-span-4" data-reveal="rise" style={{ ["--i" as string]: 1 }}>
            <h3 className="text-sm font-extrabold uppercase tracking-[0.08em]">{a.howTitle}</h3>
            <ul className="mt-4 space-y-4">
              {a.how.map((x) => (
                <li key={x} className="border-t pt-4 text-[0.98rem]" style={{ borderColor: "var(--line-strong)", color: "var(--ink-2)" }}>
                  {x}
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-3" data-reveal="rise" style={{ ["--i" as string]: 2 }}>
            <h3 className="text-sm font-extrabold uppercase tracking-[0.08em]">{a.skillsTitle}</h3>
            <ul className="mt-4 flex flex-wrap gap-2 lg:flex-col lg:items-start">
              {a.skills.map((s) => (
                <li key={s} className="rounded-full border px-3.5 py-1.5 text-[0.9rem] font-semibold" style={{ borderColor: "var(--line-strong)" }}>
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
