import Nav from "../components/Nav";
import Offers from "../components/Offers";
import Faq from "../components/Faq";
import ContactCTA from "../components/ContactCTA";
import ModeSwitcher from "../components/ModeSwitcher";
import { GsapReveal } from "../lib/GsapReveal";
import { useI18n } from "../i18n";

export default function Contact() {
  const { t } = useI18n();
  const a = t.about;
  return (
    <main style={{ background: "var(--home-bg)", color: "var(--home-text)" }}>
      <a href="#contact-heading" className="skip-link">
        {t.skip}
      </a>
      <Nav />

      <section className="relative px-6 pb-4 pt-32 sm:px-10 sm:pt-40">
        <GsapReveal>
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-semibold tracking-[0.3em]" style={{ color: "var(--accent-ink)" }}>
              {a.kicker}
            </span>
            <h1 id="contact-heading" tabIndex={-1} className="font-display mt-5 text-3xl font-bold tracking-tight outline-none sm:text-4xl">
              {a.title1} <span className="text-gradient-ink">{a.title2}</span>
            </h1>
            <p className="mt-6 text-base leading-relaxed" style={{ color: "var(--home-text-muted)" }}>
              {a.text}
            </p>
          </div>
        </GsapReveal>
      </section>

      <Offers />
      <ContactCTA />
      <Faq />
      <ModeSwitcher />
    </main>
  );
}
