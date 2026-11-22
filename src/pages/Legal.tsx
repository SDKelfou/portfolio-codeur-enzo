import { useEffect } from "react";
import { Link } from "wouter";
import Nav from "../components/Nav";
import ModeSwitcher from "../components/ModeSwitcher";
import { useI18n } from "../i18n";
import { getLegal } from "../legal/content";
import type { LegalPageKey } from "../legal/content";

export default function Legal({ page }: { page: LegalPageKey }) {
  const { lang, t } = useI18n();
  const doc = getLegal(lang, page);

  useEffect(() => {
    document.title = `${doc.title} — enzo.dev`;
  }, [doc.title]);

  return (
    <main style={{ background: "var(--home-bg)", color: "var(--home-text)" }}>
      <a href="#legal-heading" className="skip-link">
        {t.skip}
      </a>
      <Nav />
      <article className="mx-auto max-w-3xl px-6 pb-24 pt-32 sm:px-10 sm:pt-40">
        <h1 id="legal-heading" tabIndex={-1} className="font-display text-3xl font-bold tracking-tight outline-none sm:text-4xl">
          {doc.title}
        </h1>
        <p className="mt-3 text-xs" style={{ color: "var(--home-text-muted)" }}>
          {t.legalPage.updated}
        </p>
        {t.legalPage.fallback && lang !== "en" && (
          <p className="glass-light-solid mt-6 rounded-xl p-4 text-sm" style={{ color: "var(--home-text-muted)" }}>
            {t.legalPage.fallback}
          </p>
        )}
        {doc.sections.map((s) => (
          <section key={s.h} id={s.id} className="mt-10 scroll-mt-24">
            <h2 className="font-display text-xl font-bold">{s.h}</h2>
            {s.p.map((para) => (
              <p key={para} className="mt-3 text-sm leading-relaxed sm:text-base" style={{ color: "var(--home-text-muted)" }}>
                {para}
              </p>
            ))}
          </section>
        ))}
        <Link href="/" className="btn-accent mt-14 inline-block rounded-full px-6 py-3 text-sm font-semibold">
          {t.legalPage.back}
        </Link>
      </article>
      <ModeSwitcher />
    </main>
  );
}
