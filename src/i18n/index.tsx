import { createContext, useContext, useEffect, useMemo } from "react";
import type { ReactNode } from "react";
import type { Dict } from "./fr";

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

/** Only the visitor's language ships with the page: the others are
 *  separate chunks (switching language is a full page load anyway). */
const LOADERS: Record<Lang, () => Promise<{ default: Dict }>> = {
  fr: () => import("./fr"),
  en: () => import("./en"),
  es: () => import("./es"),
  de: () => import("./de"),
  it: () => import("./it"),
  pt: () => import("./pt"),
  nl: () => import("./nl"),
};
const cache: Partial<Record<Lang, Dict>> = {};

export function registerDict(lang: Lang, dict: Dict) {
  cache[lang] = dict;
}

export async function loadDict(lang: Lang) {
  if (!cache[lang]) cache[lang] = (await LOADERS[lang]()).default;
  return cache[lang]!;
}

export function isLang(v: unknown): v is Lang {
  return typeof v === "string" && LANGS.some((l) => l.code === v);
}

/** French lives at the root, every other language under its own prefix
 *  (/en/, /es/…) so each version is a real, indexable URL. */
export function splitPath(fullPath: string): { lang: Lang; rest: string } {
  const m = fullPath.match(/^\/([a-z]{2})(\/.*)?$/);
  if (m && isLang(m[1]) && m[1] !== "fr") return { lang: m[1], rest: m[2] || "/" };
  return { lang: "fr", rest: fullPath || "/" };
}

export function langBase(lang: Lang) {
  return lang === "fr" ? "" : `/${lang}`;
}

export function localizedPath(lang: Lang, rest: string) {
  const base = langBase(lang);
  if (rest === "/" || rest === "") return base || "/";
  return `${base}${rest}`;
}

interface I18nApi {
  lang: Lang;
  t: Dict;
}

const I18nCtx = createContext<I18nApi | null>(null);

export function I18nProvider({ lang, children }: { lang: Lang; children: ReactNode }) {
  const value = useMemo(() => ({ lang, t: (cache[lang] ?? cache.fr)! }), [lang]);

  useEffect(() => {
    document.documentElement.lang = lang;
    try {
      window.localStorage.setItem("enzo-dev-lang", lang);
    } catch {
      /* ignore */
    }
  }, [lang]);

  return <I18nCtx.Provider value={value}>{children}</I18nCtx.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nCtx);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
