import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

export type Mode = "ice" | "neon" | "violet" | "obsidian";
export type Scheme = "light" | "dark";

export const MODES: { id: Mode; label: string }[] = [
  { id: "ice", label: "Glace" },
  { id: "neon", label: "Néon" },
  { id: "violet", label: "Violet" },
  { id: "obsidian", label: "Obsidienne" },
];

/** Mirrors the CSS tokens in index.css — kept in TS too so the 3D hero
 *  scene (WebGL, can't read custom properties per-vertex) can recolor
 *  itself from the same source of truth when the visitor changes mode. */
export const MODE_COLORS: Record<Mode, { accent: string; accent2: string; strong: string }> = {
  ice: { accent: "#17c3ff", accent2: "#6a5bff", strong: "#0f7fb8" },
  neon: { accent: "#39ff88", accent2: "#d6ff2f", strong: "#12c25f" },
  violet: { accent: "#b565ff", accent2: "#ff5ec4", strong: "#8b2ee8" },
  obsidian: { accent: "#f5c14e", accent2: "#ff6a3d", strong: "#c98a2c" },
};

const MODE_KEY = "enzo-dev-mode";
const SCHEME_KEY = "enzo-dev-scheme";

interface ThemeApi {
  mode: Mode;
  setMode: (mode: Mode, origin?: { x: number; y: number }) => void;
  isChangingMode: boolean;
  scheme: Scheme;
  toggleScheme: () => void;
}

const ThemeCtx = createContext<ThemeApi | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<Mode>("ice");
  // Premium/cinematic direction defaults to dark — the shader-gradient hero
  // is built to be seen on a dark stage. Visitors keep full control: an
  // explicit system preference for light, or a stored choice, still wins.
  const [scheme, setScheme] = useState<Scheme>("dark");
  const [isChangingMode, setIsChangingMode] = useState(false);

  useEffect(() => {
    try {
      const storedMode = window.localStorage.getItem(MODE_KEY) as Mode | null;
      if (storedMode && MODES.some((m) => m.id === storedMode)) setModeState(storedMode);

      // Only an explicit, previously-saved choice (made via the toggle)
      // overrides the dark default. We deliberately do NOT fall back to
      // `prefers-color-scheme` here: most browsers report "light" by
      // default even when the visitor has no real preference, which would
      // silently undo the premium/cinematic dark staging for most
      // first-time visitors.
      const storedScheme = window.localStorage.getItem(SCHEME_KEY) as Scheme | null;
      if (storedScheme === "light" || storedScheme === "dark") {
        setScheme(storedScheme);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-mode", mode);
  }, [mode]);

  useEffect(() => {
    document.documentElement.setAttribute("data-scheme", scheme);
    // Keep the mobile browser-chrome color in sync with the actual page
    // background instead of leaving it permanently dark.
    const meta = document.querySelector('meta[name="theme-color"]');
    meta?.setAttribute("content", scheme === "dark" ? "#08080a" : "#faf9f6");
  }, [scheme]);

  const setMode = useCallback(
    (next: Mode, origin?: { x: number; y: number }) => {
      if (next === mode) return;
      if (origin) {
        document.documentElement.style.setProperty("--sweep-x", `${origin.x}px`);
        document.documentElement.style.setProperty("--sweep-y", `${origin.y}px`);
      }
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      setModeState(next);
      try {
        window.localStorage.setItem(MODE_KEY, next);
      } catch {
        /* ignore */
      }
      if (!reduced) {
        setIsChangingMode(true);
        document.documentElement.classList.add("mode-changing");
        window.setTimeout(() => {
          setIsChangingMode(false);
          document.documentElement.classList.remove("mode-changing");
        }, 700);
      }
    },
    [mode]
  );

  const toggleScheme = useCallback(() => {
    setScheme((prev) => {
      const next = prev === "light" ? "dark" : "light";
      try {
        window.localStorage.setItem(SCHEME_KEY, next);
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ mode, setMode, isChangingMode, scheme, toggleScheme }),
    [mode, setMode, isChangingMode, scheme, toggleScheme]
  );

  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeCtx);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
