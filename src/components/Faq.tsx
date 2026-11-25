import { Plus } from "@getpapillon/papicons";
import { useI18n } from "../i18n";

export default function Faq() {
  const { t } = useI18n();
  return (
    <section id="faq" className="cv scroll-mt-24 py-24 sm:py-32" aria-labelledby="faq-heading">
      <div className="wrap grid gap-10 lg:grid-cols-12">
        <h2 id="faq-heading" className="h2 lg:col-span-4" data-reveal="rise">
          {t.faq.title}
        </h2>
        <div className="lg:col-span-8">
          {t.faq.items.map((item) => (
            <details key={item.q} className="faq-item border-t" style={{ borderColor: "var(--line-strong)" }}>
              <summary className="flex items-center justify-between gap-6 py-6 text-[1.1rem] font-bold">
                {item.q}
                <Plus size={18} className="plus shrink-0" aria-hidden="true" />
              </summary>
              <p className="muted max-w-2xl pb-7 text-[1.0625rem]">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
