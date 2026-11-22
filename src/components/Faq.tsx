import { Plus } from "@getpapillon/papicons";
import { GsapReveal as Reveal } from "../lib/GsapReveal";
import { useI18n } from "../i18n";

/** Native <details> accordion: accessible and works without JS. */
export default function Faq() {
  const { t } = useI18n();
  return (
    <section id="faq" className="relative scroll-mt-20 px-6 py-24 sm:px-10 sm:py-28" style={{ background: "var(--home-bg-soft)" }}>
      <Reveal>
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold tracking-[0.3em]" style={{ color: "var(--accent-ink)" }}>
            {t.faq.kicker}
          </span>
          <h2 className="font-display mt-5 text-3xl font-bold tracking-tight sm:text-4xl">{t.faq.title}</h2>
        </div>
      </Reveal>
      <div className="mx-auto mt-12 max-w-3xl space-y-3">
        {t.faq.items.map((item) => (
          <details key={item.q} className="faq-item glass-light-solid group rounded-2xl px-6 py-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
              {item.q}
              <Plus size={18} className="shrink-0 transition-transform duration-300 group-open:rotate-45" style={{ color: "var(--accent-ink)" }} aria-hidden="true" />
            </summary>
            <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--home-text-muted)" }}>
              {item.a}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
