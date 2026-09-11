import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import { Eye, Menu, Moon, Sun, X } from "lucide-react";
import { useAudio } from "../lib/audio";
import { useTheme } from "../lib/theme";
import { useMagnetic } from "../lib/useMagnetic";

const LINKS = [
  { href: "/", label: "Accueil" },
  { href: "/projets", label: "Catalogue" },
  { href: "/contact", label: "Contact" },
];

const EGG_MESSAGES = [
  "Œil pour œil. Vous avez trouvé le mode secret.",
  "Curieux, vous. J'aime ça.",
  "D'accord, vous avez gagné le droit de me le dire en entretien.",
];

export default function Nav() {
  const [location, navigate] = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [egg, setEgg] = useState<string | null>(null);
  const clicksRef = useRef<number[]>([]);
  const { clickSfx, hoverSfx, successSfx } = useAudio();
  const { scheme, toggleScheme } = useTheme();
  const ctaMag = useMagnetic<HTMLAnchorElement>(0.28);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  useEffect(() => {
    if (!egg) return;
    const t = window.setTimeout(() => setEgg(null), 3000);
    return () => window.clearTimeout(t);
  }, [egg]);

  const closeMenu = () => setMenuOpen(false);

  const handleLogoClick = () => {
    clickSfx();
    const now = Date.now();
    const recent = clicksRef.current.filter((t) => now - t < 1600);
    recent.push(now);
    clicksRef.current = recent;
    if (recent.length >= 5) {
      clicksRef.current = [];
      successSfx();
      setEgg(EGG_MESSAGES[Math.floor(Math.random() * EGG_MESSAGES.length)]);
    }
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-all duration-300 ${
        scrolled || menuOpen ? "glass-light shadow-[0_8px_30px_-20px_rgba(0,0,0,0.35)]" : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 sm:px-10">
        <a
          href="/"
          className="flex items-center gap-2 font-display text-lg font-bold select-none"
          onClick={(e) => {
            e.preventDefault();
            handleLogoClick();
            if (location === "/") window.scrollTo({ top: 0, behavior: "smooth" });
            else navigate("/");
          }}
        >
          <Eye
            size={20}
            strokeWidth={2.2}
            style={{ color: "var(--accent-ink)", filter: "drop-shadow(0 0 6px rgba(var(--accent-rgb),0.6))" }}
            aria-hidden="true"
          />
          <span className="text-gradient">enzo.dev</span>
        </a>

        <ul className="hidden items-center gap-8 text-sm font-medium sm:flex" style={{ color: "var(--home-text-muted)" }}>
          {LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={clickSfx}
                onPointerEnter={hoverSfx}
                className="transition-colors hover:text-[var(--accent-ink)]"
                style={location === link.href ? { color: "var(--accent-ink)" } : undefined}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => {
              toggleScheme();
              clickSfx();
            }}
            onPointerEnter={hoverSfx}
            aria-label={scheme === "dark" ? "Passer en mode clair" : "Passer en mode sombre"}
            className="flex h-11 w-11 items-center justify-center rounded-full border transition-transform hover:scale-105"
            style={{ borderColor: "var(--home-border)" }}
          >
            {scheme === "dark" ? <Sun size={17} aria-hidden="true" /> : <Moon size={17} aria-hidden="true" />}
          </button>

          {/* eslint-disable @typescript-eslint/no-explicit-any */}
          <Link
            {...({
              href: "/contact",
              onClick: clickSfx,
              onPointerEnter: hoverSfx,
              ref: ctaMag.ref,
              onPointerMove: ctaMag.onPointerMove,
              onPointerLeave: ctaMag.onPointerLeave,
              className: "btn-accent hidden rounded-full px-5 py-2.5 text-sm font-semibold will-change-transform sm:inline-block",
            } as any)}
          >
            Votre projet
          </Link>
          {/* eslint-enable @typescript-eslint/no-explicit-any */}

          <button
            type="button"
            onClick={() => {
              setMenuOpen((o) => !o);
              clickSfx();
            }}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            className="flex h-11 w-11 items-center justify-center rounded-full border sm:hidden"
            style={{ borderColor: "var(--home-border)" }}
          >
            {menuOpen ? <X size={18} aria-hidden="true" /> : <Menu size={18} aria-hidden="true" />}
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div className="glass-light border-t px-6 py-6 sm:hidden" style={{ borderColor: "var(--home-border)" }}>
          <ul className="flex flex-col gap-5 text-base font-medium">
            {LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => {
                    clickSfx();
                    closeMenu();
                  }}
                  style={location === link.href ? { color: "var(--accent-ink)" } : undefined}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/contact"
                onClick={() => {
                  clickSfx();
                  closeMenu();
                }}
                className="btn-accent inline-block rounded-full px-5 py-2.5 text-sm font-semibold"
              >
                Votre projet
              </Link>
            </li>
          </ul>
        </div>
      )}

      {egg && (
        <div className="pointer-events-none fixed inset-0 z-[300] flex items-start justify-center px-6 pt-24" aria-live="polite">
          <div className="egg-pop glass-light-solid flex items-center gap-3 rounded-full px-6 py-3 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.4)]">
            <Eye size={16} style={{ color: "var(--accent-ink)" }} aria-hidden="true" />
            <span className="text-sm font-semibold">{egg}</span>
          </div>
          <EggBurst />
        </div>
      )}
    </header>
  );
}

function EggBurst() {
  const symbols = ["✦", "◆", "●", "▲", "✧"];
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {Array.from({ length: 24 }).map((_, i) => (
        <span
          key={i}
          className="egg-particle absolute font-bold"
          style={{
            left: `${50 + (Math.random() * 60 - 30)}%`,
            top: "18%",
            color: i % 2 === 0 ? "var(--accent)" : "var(--accent-2)",
            fontSize: `${10 + Math.random() * 10}px`,
            animationDelay: `${Math.random() * 0.15}s`,
            ["--eggx" as string]: `${Math.random() * 120 - 60}px`,
          }}
        >
          {symbols[i % symbols.length]}
        </span>
      ))}
    </div>
  );
}
