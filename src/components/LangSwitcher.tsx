import { useEffect, useRef, useState } from "react";
import { Globe } from "@getpapillon/papicons";
import { LANGS, useI18n } from "../i18n";

/** Compact language picker: globe + current code, opens a list of the
 *  seven languages written in their own language. */
export default function LangSwitcher() {
  const { lang, setLang, t } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t.nav.language}
        className="flex h-11 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold uppercase transition-transform hover:scale-105"
        style={{ borderColor: "var(--home-border)" }}
      >
        <Globe size={16} aria-hidden="true" />
        {lang}
      </button>
      {open && (
        <ul
          role="listbox"
          aria-label={t.nav.language}
          className="glass-light-solid absolute right-0 mt-2 w-44 overflow-hidden rounded-xl border py-1 text-sm shadow-[0_20px_50px_-20px_rgba(0,0,0,0.45)]"
          style={{ borderColor: "var(--home-border)" }}
        >
          {LANGS.map((l) => (
            <li key={l.code} role="option" aria-selected={l.code === lang}>
              <button
                type="button"
                lang={l.code}
                onClick={() => {
                  setLang(l.code);
                  setOpen(false);
                }}
                className="flex w-full items-center justify-between px-4 py-2.5 text-left transition-colors hover:text-[var(--accent-ink)]"
                style={l.code === lang ? { color: "var(--accent-ink)", fontWeight: 600 } : undefined}
              >
                {l.label}
                <span className="text-[10px] uppercase opacity-60">{l.code}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
