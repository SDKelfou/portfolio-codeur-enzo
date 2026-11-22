import type { MouseEvent } from "react";
import { Link } from "wouter";
import { MODES, useTheme } from "../lib/theme";
import { useConsent } from "../lib/consent";
import { useI18n } from "../i18n";
import { CONTACT_EMAIL } from "../lib/site";

const SWATCH: Record<string, string> = { ice: "#2fb4e8", neon: "#39ff88", violet: "#a855f7", obsidian: "#e8b44a" };

/** Site footer: legal links, cookie preferences and the accent-color picker. */
export default function ModeSwitcher() {
  const { mode, setMode } = useTheme();
  const { openBanner } = useConsent();
  const { t } = useI18n();
  const f = t.footer;

  const handleSelect = (id: typeof mode, e: MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMode(id, { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
  };

  return (
    <footer className="relative px-6 py-14 sm:px-10" style={{ background: "var(--home-bg-soft)" }}>
      <div
        className="mx-auto flex max-w-5xl flex-col items-center gap-8 border-t pt-10 text-center sm:flex-row sm:items-start sm:justify-between sm:text-left"
        style={{ borderColor: "var(--home-border)" }}
      >
        <div className="text-xs" style={{ color: "var(--home-text-muted)" }}>
          <p>
            © {new Date().getFullYear()} enzo.dev — {f.tagline}
          </p>
          <p className="mt-1">
            <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-[var(--accent-ink)]">
              {CONTACT_EMAIL}
            </a>
          </p>
          <nav aria-label={f.legal} className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-2 sm:justify-start">
            <Link href="/mentions-legales" className="underline-offset-2 hover:underline">
              {f.legal}
            </Link>
            <Link href="/confidentialite" className="underline-offset-2 hover:underline">
              {f.privacy}
            </Link>
            <Link href="/cgv" className="underline-offset-2 hover:underline">
              {f.terms}
            </Link>
            <button type="button" onClick={openBanner} className="underline-offset-2 hover:underline">
              {f.cookies}
            </button>
          </nav>
        </div>

        <div
          role="group"
          aria-label={f.colorModes}
          className="flex items-center gap-1 rounded-full border p-1"
          style={{ borderColor: "var(--home-border)" }}
        >
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={(e) => handleSelect(m.id, e)}
              aria-pressed={mode === m.id}
              aria-label={`${f.mode} ${f.modes[m.id]}`}
              className="flex h-11 w-11 items-center justify-center rounded-full transition-transform hover:scale-110"
              data-mode={m.id}
            >
              <span
                className="h-6 w-6 rounded-full border-2"
                style={{ background: SWATCH[m.id], borderColor: mode === m.id ? "var(--home-text)" : "transparent" }}
              />
            </button>
          ))}
        </div>
      </div>
    </footer>
  );
}
