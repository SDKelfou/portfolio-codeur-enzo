import { useEffect, useRef, useState } from "react";
import { useI18n } from "../i18n";
import { currentTheme } from "../lib/theme";
import type { Theme } from "../lib/theme";
import { fractureTheme, preloadFracture } from "../lib/fracture";

export default function ThemeSwitch({ className = "" }: { className?: string }) {
  const { t } = useI18n();
  const [theme, setTheme] = useState<Theme>("light");
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setTheme(currentTheme());
    const ric = (window as Window & { requestIdleCallback?: (cb: () => void) => number }).requestIdleCallback;
    if (ric) ric(preloadFracture);
    else window.setTimeout(preloadFracture, 2000);
    const sync = (e: Event) => setTheme((e as CustomEvent<Theme>).detail);
    window.addEventListener("enzo:theme", sync);
    return () => window.removeEventListener("enzo:theme", sync);
  }, []);

  const next: Theme = theme === "dark" ? "light" : "dark";

  return (
    <button
      ref={ref}
      type="button"
      className={`theme-switch ${className}`}
      aria-label={theme === "dark" ? t.nav.toLight : t.nav.toDark}
      title={theme === "dark" ? t.nav.toLight : t.nav.toDark}
      onClick={() => ref.current && fractureTheme(next, ref.current)}
    >
      <span className="core" aria-hidden="true" />
    </button>
  );
}
