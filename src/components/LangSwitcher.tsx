import { useEffect, useRef, useState } from "react";
import { Globe } from "@getpapillon/papicons";
import { useLocation } from "wouter";
import { LANGS, localizedPath, useI18n } from "../i18n";

/** Language picker: each language is a real URL (/en/…, /es/…), so the
 *  options are links, which also lets crawlers find every version. */
export default function LangSwitcher({ onPick, up = false }: { onPick?: () => void; up?: boolean }) {
  const { lang, t } = useI18n();
  const [location] = useLocation();
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
        aria-expanded={open}
        aria-label={t.nav.language}
        className="flex h-11 items-center gap-1.5 rounded-full border px-3 text-xs font-bold uppercase transition-colors hover:border-[var(--ink)]"
        style={{ borderColor: "var(--line-strong)" }}
      >
        <Globe size={16} aria-hidden="true" />
        {lang}
      </button>
      {open && (
        <ul
          className={`surface absolute right-0 z-50 w-48 overflow-hidden py-1.5 text-sm ${up ? "bottom-full mb-2" : "mt-2"}`}
          style={{ boxShadow: "var(--shadow)", borderRadius: 18 }}
        >
          {LANGS.map((l) => (
            <li key={l.code}>
              <a
                href={localizedPath(l.code, location)}
                hrefLang={l.code}
                lang={l.code}
                aria-current={l.code === lang ? "true" : undefined}
                onClick={() => {
                  setOpen(false);
                  onPick?.();
                }}
                className="flex items-center justify-between px-4 py-2.5 no-underline transition-colors hover:bg-[var(--bg)]"
                style={{ color: "var(--ink)", fontWeight: l.code === lang ? 700 : 500 }}
              >
                {l.label}
                <span className="meta uppercase">{l.code}</span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
