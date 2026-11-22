import { Link } from "wouter";
import { useI18n } from "../i18n";

export default function NotFound() {
  const { t } = useI18n();
  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center"
      style={{ background: "var(--home-bg)", color: "var(--home-text)" }}
    >
      <span className="font-display text-sm tracking-[0.3em]" style={{ color: "var(--accent-ink)" }}>
        404
      </span>
      <h1 className="font-display text-3xl font-bold sm:text-4xl">{t.notFound.title}</h1>
      <p className="max-w-md" style={{ color: "var(--home-text-muted)" }}>
        {t.notFound.text}
      </p>
      <Link href="/" className="btn-accent rounded-full px-6 py-3 text-sm font-semibold transition-transform hover:scale-[1.03]">
        {t.notFound.back}
      </Link>
    </main>
  );
}
