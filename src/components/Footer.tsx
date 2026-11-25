import { ArrowUp } from "@getpapillon/papicons";
import { useLocation } from "wouter";
import { useConsent } from "../lib/consent";
import { useI18n } from "../i18n";
import { CONTACT_EMAIL } from "../lib/site";
import TLink from "./TLink";
import { Mark } from "./Nav";

export default function Footer() {
  const { t } = useI18n();
  const { openBanner } = useConsent();
  const f = t.footer;
  const [location] = useLocation();
  // pages that already end on the quote form don't need a second call
  const showCta = location !== "/" && location !== "/contact";

  return (
    <footer className="relative overflow-hidden pt-20" style={{ background: "var(--bg)" }}>
      <div className="wrap">
        {showCta && (
        <div className="mb-20 flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-display text-[clamp(3.5rem,11vw,9rem)] italic leading-[0.85] tracking-[-0.03em]">{t.endCta.text}</p>
            <TLink href="/contact#contact" className="btn btn-light mt-8">
              {t.endCta.button}
            </TLink>
          </div>
          <a href={`mailto:${CONTACT_EMAIL}`} className="link break-all text-lg font-bold" style={{ color: "var(--ink)" }}>
            {CONTACT_EMAIL}
          </a>
        </div>
        )}

        <div className="flex flex-col gap-6 border-t py-8 text-sm sm:flex-row sm:items-center sm:justify-between" style={{ borderColor: "var(--line)" }}>
          <div className="flex items-center gap-3">
            <Mark size={20} />
            <p style={{ color: "var(--ink-2)" }}>
              © {new Date().getFullYear()} enzo.dev — {f.tagline} {f.made}
            </p>
          </div>
          <nav aria-label={f.legal} className="flex flex-wrap gap-x-5 gap-y-2" style={{ color: "var(--ink-2)" }}>
            <TLink href="/mentions-legales" className="link">
              {f.legal}
            </TLink>
            <TLink href="/confidentialite" className="link">
              {f.privacy}
            </TLink>
            <TLink href="/cgv" className="link">
              {f.terms}
            </TLink>
            <button type="button" onClick={openBanner} className="link cursor-pointer">
              {f.cookies}
            </button>
            <a href="#top" className="link inline-flex items-center gap-1" onClick={(e) => (e.preventDefault(), window.scrollTo({ top: 0, behavior: "smooth" }))}>
              {f.top}
              <ArrowUp size={14} aria-hidden="true" />
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
