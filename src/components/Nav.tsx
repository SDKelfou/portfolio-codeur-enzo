import { useEffect, useState } from "react";
import { Menu, Cross, ArrowRight } from "@getpapillon/papicons";
import { useLocation } from "wouter";
import { useI18n } from "../i18n";
import TLink from "./TLink";
import ThemeSwitch from "./ThemeSwitch";
import LangSwitcher from "./LangSwitcher";

export function Mark({ size = 22 }: { size?: number }) {

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 1.5 20.5 7l1.5 9.5L12.6 22.5 3 17.2 2 7.5Z" fill="var(--lav)" stroke="var(--ink)" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M12.2 2.5 11 8.6l2.2 4.3-1.6 4.4.9 4.6" fill="none" stroke="var(--ink)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12.2 2.5 11 8.6l2.2 4.3-1.6 4.4.9 4.6" fill="none" stroke="#fff010" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Nav() {
  const { t } = useI18n();
  const [location] = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => setOpen(false), [location]);

  const links = [
    { href: "/projets", label: t.nav.work },
    { href: "/#methode", label: t.nav.method },
    { href: "/contact#tarifs", label: t.nav.pricing },
    { href: "/contact#contact", label: t.nav.contact },
  ];

  return (
    <>
      <header className="site-header" data-scrolled={scrolled} data-open={open}>
        <nav className="wrap flex h-[4.5rem] items-center justify-between gap-4" aria-label={t.nav.menu}>
          <TLink href="/" aria-label={t.nav.homeLabel} className="flex items-center gap-2.5 text-[1.05rem] font-extrabold tracking-tight no-underline" style={{ color: "var(--ink)" }}>
            <Mark />
            enzo.dev
          </TLink>

          <ul className="hidden items-center gap-7 text-[0.95rem] font-semibold lg:flex">
            {links.map((l) => (
              <li key={l.href}>
                <TLink
                  href={l.href}
                  className="link"
                  aria-current={l.href === location ? "page" : undefined}
                  style={{ color: "var(--ink)" }}
                >
                  {l.label}
                </TLink>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <div className="hidden sm:block">
              <LangSwitcher />
            </div>
            <ThemeSwitch />
            <TLink href="/contact#contact" className="btn btn-light hidden !min-h-[2.75rem] !py-2 md:inline-flex">
              {t.nav.cta}
            </TLink>
            <button
              type="button"
              className="theme-switch lg:hidden"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? t.nav.closeMenu : t.nav.openMenu}
              onClick={() => setOpen((o) => !o)}
            >
              {open ? <Cross size={18} aria-hidden="true" /> : <Menu size={18} aria-hidden="true" />}
            </button>
          </div>
        </nav>
      </header>

      {open && (
        <div id="mobile-menu" className="mobile-panel lg:hidden" role="dialog" aria-modal="true" aria-label={t.nav.menu}>
          <ul className="flex flex-col gap-2">
            {[{ href: "/", label: t.nav.home }, ...links].map((l, i) => (
              <li key={l.href}>
                <TLink href={l.href} className="big" style={{ ["--i" as string]: i }} onClick={() => setOpen(false)}>
                  {l.label}
                </TLink>
              </li>
            ))}
          </ul>
          <div className="mt-auto flex flex-wrap items-center gap-3 pt-8">
            <TLink href="/contact#contact" className="btn btn-light flex-1" onClick={() => setOpen(false)}>
              {t.nav.cta}
              <ArrowRight size={18} aria-hidden="true" />
            </TLink>
            <LangSwitcher up onPick={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
