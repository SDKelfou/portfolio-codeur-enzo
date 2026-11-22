import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import fr from "./fr";
import type { Dict } from "./fr";
import en from "./en";
import es from "./es";
import de from "./de";
import it from "./it";
import pt from "./pt";
import nl from "./nl";

export const LANGS = [
  { code: "fr", label: "Français" },
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "de", label: "Deutsch" },
  { code: "it", label: "Italiano" },
  { code: "pt", label: "Português" },
  { code: "nl", label: "Nederlands" },
] as const;

export type Lang = (typeof LANGS)[number]["code"];

const DICTS: Record<Lang, Dict> = { fr, en, es, de, it, pt, nl };
const STORAGE_KEY = "enzo-dev-lang";

function isLang(v: unknown): v is Lang {
  return typeof v === "string" && LANGS.some((l) => l.code === v);
}

/** URL ?lang= wins (shareable links), then the stored choice, then the
 *  browser's language list, then French. */
function detectLang(): Lang {
  try {
    const fromUrl = new URLSearchParams(window.location.search).get("lang");
    if (isLang(fromUrl)) return fromUrl;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isLang(stored)) return stored;
  } catch {
    /* ignore */
  }
  const prefs = navigator.languages?.length ? navigator.languages : [navigator.language];
  for (const p of prefs) {
    const base = p?.slice(0, 2).toLowerCase();
    if (isLang(base)) return base;
  }
  return "fr";
}

interface I18nApi {
  lang: Lang;
  t: Dict;
  setLang: (lang: Lang) => void;
}

const I18nCtx = createContext<I18nApi | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(detectLang);
  const t = DICTS[lang];

  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = t.meta.title;
    document.querySelector('meta[name="description"]')?.setAttribute("content", t.meta.description);
    document.querySelector('meta[property="og:title"]')?.setAttribute("content", t.meta.title);
    document.querySelector('meta[property="og:description"]')?.setAttribute("content", t.meta.description);
  }, [lang, t]);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
      const url = new URL(window.location.href);
      if (url.searchParams.has("lang")) {
        url.searchParams.set("lang", next);
        window.history.replaceState(null, "", url);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo(() => ({ lang, t, setLang }), [lang, t, setLang]);
  return <I18nCtx.Provider value={value}>{children}</I18nCtx.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nCtx);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
