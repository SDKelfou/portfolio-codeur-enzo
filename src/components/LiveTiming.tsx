import { useEffect, useState } from "react";
import { useI18n } from "../i18n";

export default function LiveTiming() {
  const { t, lang } = useI18n();
  const [ms, setMs] = useState<number | null>(null);

  useEffect(() => {
    const read = () => {
      const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
      const v = nav && nav.loadEventEnd > 0 ? nav.loadEventEnd : nav?.domContentLoadedEventEnd;
      if (v && v > 0) setMs(v);
    };
    if (document.readyState === "complete") window.setTimeout(read, 0);
    else window.addEventListener("load", () => window.setTimeout(read, 0), { once: true });
  }, []);

  const value =
    ms === null
      ? t.hero.measuring
      : `${new Intl.NumberFormat(lang, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(ms / 1000)} s`;

  return (
    <span className="inline-flex items-center gap-2">
      <span aria-hidden="true" className="inline-block h-2 w-2 rounded-full" style={{ background: "var(--light)", boxShadow: "0 0 0 2px var(--ink)" }} />
      {t.hero.loaded} <strong className="tnum" style={{ color: "var(--ink)" }} aria-live="polite">{value}</strong>
    </span>
  );
}
