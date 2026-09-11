import { useRef } from "react";
import type { MouseEvent } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { MODES, useTheme } from "../lib/theme";
import { useAudio } from "../lib/audio";

export default function ModeSwitcher() {
  const { mode, setMode } = useTheme();
  const { enabled, toggleEnabled, clickSfx } = useAudio();
  const groupRef = useRef<HTMLDivElement>(null);

  const handleSelect = (id: typeof mode, e: MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMode(id, { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
  };

  return (
    <footer className="relative px-6 py-14 sm:px-10" style={{ background: "var(--home-bg-soft)" }}>
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-8 border-t pt-10 sm:flex-row sm:justify-between" style={{ borderColor: "var(--home-border)" }}>
        <p className="text-xs" style={{ color: "var(--home-text-muted)" }}>
          © {new Date().getFullYear()} enzo.dev — codeur web, vibe coding.
        </p>

        <div className="flex flex-wrap items-center gap-4">
          <div
            ref={groupRef}
            role="group"
            aria-label="Choisir un mode de couleur"
            className="flex items-center gap-1 rounded-full border p-1"
            style={{ borderColor: "var(--home-border)" }}
          >
            {MODES.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={(e) => handleSelect(m.id, e)}
                aria-pressed={mode === m.id}
                aria-label={`Mode ${m.label}`}
                className="flex h-11 w-11 items-center justify-center rounded-full transition-transform hover:scale-110"
                data-mode={m.id}
              >
                <span
                  className="h-6 w-6 rounded-full border-2"
                  style={{
                    background:
                      m.id === "ice" ? "#2fb4e8" : m.id === "neon" ? "#39ff88" : m.id === "violet" ? "#a855f7" : "#e8b44a",
                    borderColor: mode === m.id ? "var(--home-text)" : "transparent",
                  }}
                />
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => {
              toggleEnabled();
              clickSfx();
            }}
            aria-pressed={enabled}
            aria-label={enabled ? "Désactiver les sons" : "Activer les sons"}
            className="flex h-11 w-11 items-center justify-center rounded-full border transition-colors hover:text-[var(--accent-ink)]"
            style={{ borderColor: "var(--home-border)" }}
          >
            {enabled ? <Volume2 size={16} aria-hidden="true" /> : <VolumeX size={16} aria-hidden="true" />}
          </button>
        </div>
      </div>
    </footer>
  );
}
