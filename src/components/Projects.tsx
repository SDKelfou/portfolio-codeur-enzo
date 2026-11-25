import { ArrowRightUp } from "@getpapillon/papicons";
import { useI18n } from "../i18n";
import { PROJECTS } from "../lib/projects";

export default function Projects({ headingLevel = 2 }: { headingLevel?: 1 | 2 }) {
  const { t } = useI18n();
  const w = t.work;
  const H = headingLevel === 1 ? "h1" : "h2";

  return (
    <section id="realisations" className="cv scroll-mt-24 py-24 sm:py-32" aria-labelledby="work-heading">
      <div className="wrap">
        <div className="grid gap-6 lg:grid-cols-12">
          <H id="work-heading" className="h2 lg:col-span-7" data-reveal="rise">
            {w.title}
          </H>
          <p className="muted max-w-xl self-end text-lg lg:col-span-5" data-reveal="rise" style={{ ["--i" as string]: 1 }}>
            {w.intro}
          </p>
        </div>

        <ol className="mt-16 space-y-24 sm:mt-24 sm:space-y-32">
          {PROJECTS.map((p, i) => {
            const flip = i % 2 === 1;
            const copy = p.copy === "leos" ? w.leos : p.copy === "pizza" ? w.pizza : w.items[p.copy];
            return (
              <li key={p.slug} className="project grid items-center gap-8 lg:grid-cols-12 lg:gap-12">
                <a
                  href={p.href}
                  {...(p.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className={`block lg:col-span-7 ${flip ? "lg:order-2 lg:col-start-6" : ""}`}
                  aria-label={`${p.name} — ${p.example ? w.visitExample : w.visit}`}
                  tabIndex={-1}
                >
                  <div className="device-pair" data-reveal="rise">
                    <div className="device-desk">
                      <div className="device-bar" aria-hidden="true">
                        <i />
                        <i />
                        <i />
                        <span>{p.href.replace(/^https?:\/\//, "").replace(/\/$/, "") || p.href}</span>
                      </div>
                      <img src={p.image} alt={`${p.name} — aperçu ordinateur`} width={800} height={500} decoding="async" />
                    </div>
                    <div className="device-phone">
                      <img src={p.mobile} alt={`${p.name} — aperçu mobile`} width={300} height={650} decoding="async" />
                    </div>
                  </div>
                </a>

                <div className={`lg:col-span-5 ${flip ? "lg:order-1 lg:col-start-1" : ""}`}>
                  <p className="meta tnum" data-reveal="rise">
                    {String(i + 1).padStart(2, "0")} / {String(PROJECTS.length).padStart(2, "0")} · {copy.type}
                  </p>
                  <h3 className="mt-3 font-display text-[clamp(2.6rem,5.5vw,4.5rem)] leading-[0.95] tracking-[-0.02em]" data-reveal="rise" style={{ ["--i" as string]: 1 }}>
                    {p.name}
                  </h3>
                  {(p.example || p.inProgress || p.mockup) && (
                    <p className="mt-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold" style={{ borderColor: "var(--line-strong)", color: "var(--ink-2)" }}>
                      {p.inProgress && <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--light)", boxShadow: "0 0 0 1.5px var(--ink)" }} />}
                      {p.example ? w.example : p.mockup ? w.mockup : w.inProgress}
                    </p>
                  )}
                  <p className="muted mt-5 max-w-md text-[1.0625rem]" data-reveal="rise" style={{ ["--i" as string]: 2 }}>
                    {copy.text}
                  </p>
                  {p.tech.length > 0 && (
                    <p className="meta mt-4">
                      {w.tech} : {p.tech.join(" · ")}
                    </p>
                  )}
                  <a
                    href={p.href}
                    {...(p.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="btn btn-line mt-7"
                  >
                    {p.example ? w.visitExample : w.visit}
                    <ArrowRightUp size={16} className="go" aria-hidden="true" />
                  </a>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
