import { Lightbulb, Code2, Rocket } from "lucide-react";
import { GsapReveal as Reveal } from "../lib/GsapReveal";
import { TiltCard } from "../lib/TiltCard";
import { useI18n } from "../i18n";

const STEPS = [
  { icon: Lightbulb, dir: "left" as const },
  { icon: Code2, dir: "up" as const },
  { icon: Rocket, dir: "right" as const },
];

export default function Method() {
  const { t } = useI18n();
  return (
    <section
      id="methode"
      className="relative overflow-hidden px-6 py-24 sm:px-10 sm:py-32"
      style={{ background: "var(--home-bg-soft)" }}
    >
      <div className="orb-field">
        <span className="orb orb-a" style={{ opacity: 0.28 }} />
      </div>

      <Reveal>
        <div className="relative z-10 mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold tracking-[0.3em]" style={{ color: "var(--accent-ink)" }}>
            {t.method.kicker}
          </span>
          <h2 className="font-display mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
            {t.method.title1} <span className="text-gradient-ink">{t.method.title2}</span>
          </h2>
        </div>
      </Reveal>

      <div className="relative z-10 mx-auto mt-16 grid max-w-5xl min-w-0 gap-6 sm:grid-cols-3">
        {STEPS.map((step, i) => (
          <Reveal key={i} dir={step.dir} delay={i * 90} className="min-w-0">
            <TiltCard maxTilt={7} className="h-full rounded-2xl">
              <div className="glass-light-solid h-full rounded-2xl p-8 transition-shadow duration-300 hover:shadow-[0_20px_50px_-24px_rgba(var(--accent-rgb),0.45)]">
                <step.icon size={26} strokeWidth={1.8} style={{ color: "var(--accent-ink)" }} aria-hidden="true" />
                <h3 className="font-display mt-5 text-xl font-bold">
                  {String(i + 1).padStart(2, "0")} · {t.method.steps[i].title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--home-text-muted)" }}>
                  {t.method.steps[i].text}
                </p>
              </div>
            </TiltCard>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
