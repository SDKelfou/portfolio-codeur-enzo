import { useState } from "react";
import { Copy, Mail } from "lucide-react";
import { GsapReveal as Reveal } from "../lib/GsapReveal";
import { useMagnetic } from "../lib/useMagnetic";
import { useI18n } from "../i18n";
import { CONTACT_EMAIL, mailto } from "../lib/site";

export default function ContactCTA() {
  const { t } = useI18n();
  const c = t.contact;
  const cta = useMagnetic<HTMLAnchorElement>(0.25);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(CONTACT_EMAIL);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked: the address stays visible below anyway */
    }
  };

  return (
    <section id="contact" className="relative scroll-mt-20 overflow-hidden px-6 py-24 text-center sm:px-10 sm:py-32">
      <div className="orb-field">
        <span className="orb orb-a" style={{ opacity: 0.3 }} />
        <span className="orb orb-b" style={{ opacity: 0.25 }} />
      </div>
      <Reveal dir="scale" className="relative z-10">
        <div className="glass-light mx-auto max-w-2xl rounded-2xl px-6 py-16 sm:px-8">
          <span className="text-xs font-semibold tracking-[0.3em]" style={{ color: "var(--accent-ink)" }}>
            {c.kicker}
          </span>
          <h2 className="font-display mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
            {c.title1} <span className="text-gradient-ink">{c.title2}</span>
          </h2>
          <p className="mt-5 text-base leading-relaxed" style={{ color: "var(--home-text-muted)" }}>
            {c.text}
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              ref={cta.ref}
              href={mailto(c.subject)}
              onPointerMove={cta.onPointerMove}
              onPointerLeave={cta.onPointerLeave}
              className="btn-accent glow-pulse inline-flex items-center gap-2 rounded-full px-9 py-4 text-sm font-semibold shadow-[0_16px_45px_-16px_rgba(var(--accent-rgb),0.9)] will-change-transform"
            >
              <Mail size={16} aria-hidden="true" />
              {c.cta}
            </a>
            <button
              type="button"
              onClick={copy}
              className="inline-flex items-center gap-2 rounded-full border px-6 py-4 text-sm font-semibold"
              style={{ borderColor: "var(--home-border)" }}
            >
              <Copy size={16} aria-hidden="true" />
              <span aria-live="polite">{copied ? c.copied : c.copy}</span>
            </button>
          </div>
          <p className="mt-5 text-sm font-medium break-all" style={{ color: "var(--home-text-muted)" }}>
            {CONTACT_EMAIL}
          </p>
        </div>
      </Reveal>
    </section>
  );
}
