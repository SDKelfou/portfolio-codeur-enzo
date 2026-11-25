import Layout from "../components/Layout";
import TLink from "../components/TLink";
import { useI18n } from "../i18n";
import { getLegal } from "../legal/content";
import type { LegalPageKey } from "../legal/content";
import { usePageMeta } from "../lib/head";

export default function Legal({ page }: { page: LegalPageKey }) {
  const { lang, t } = useI18n();
  const doc = getLegal(lang, page);
  usePageMeta(`${doc.title} — enzo.dev`, doc.sections[0]?.p[0] ?? doc.title);

  return (
    <Layout>
      <article className="wrap max-w-4xl pb-24 pt-36 sm:pt-44">
        <h1 className="font-display text-[clamp(3rem,8vw,6rem)] leading-[0.92] tracking-[-0.025em]">{doc.title}</h1>
        <p className="meta mt-4">{t.legalPage.updated}</p>
        {t.legalPage.fallback && lang !== "en" && (
          <p className="surface mt-8 p-4 text-sm" style={{ color: "var(--ink-2)", borderRadius: "var(--r-md)" }}>
            {t.legalPage.fallback}
          </p>
        )}
        {doc.sections.map((s) => (
          <section key={s.h} id={s.id} className="mt-12 scroll-mt-28 border-t pt-8" style={{ borderColor: "var(--line)" }}>
            <h2 className="text-xl font-extrabold">{s.h}</h2>
            {s.p.map((para) => (
              <p key={para} className="muted mt-3 max-w-[68ch]">
                {para}
              </p>
            ))}
          </section>
        ))}
        <TLink href="/" className="btn btn-line mt-14">
          {t.legalPage.back}
        </TLink>
      </article>
    </Layout>
  );
}
