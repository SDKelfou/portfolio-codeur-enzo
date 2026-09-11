import Nav from "../components/Nav";
import Offers from "../components/Offers";
import ContactCTA from "../components/ContactCTA";
import ModeSwitcher from "../components/ModeSwitcher";
import { GsapReveal } from "../lib/GsapReveal";

export default function Contact() {
  return (
    <main style={{ background: "var(--home-bg)", color: "var(--home-text)" }}>
      <a href="#contact-heading" className="skip-link">
        Aller au contenu
      </a>
      <Nav />

      <section className="relative px-6 pb-4 pt-32 sm:px-10 sm:pt-40">
        <GsapReveal>
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-semibold tracking-[0.3em]" style={{ color: "var(--accent-ink)" }}>
              À PROPOS
            </span>
            <h1 id="contact-heading" tabIndex={-1} className="font-display mt-5 text-3xl font-bold tracking-tight outline-none sm:text-4xl">
              Un codeur, <span className="text-gradient-ink">pas une agence.</span>
            </h1>
            <p className="mt-6 text-base leading-relaxed" style={{ color: "var(--home-text-muted)" }}>
              Je m'appelle Enzo. Je conçois et code des sites sur mesure — en vibe coding, en
              direct, avec vous. Pas de brief générique, pas de template recyclé : chaque projet
              a sa propre direction artistique, ses propres animations, sa propre personnalité.
              Vous voulez un site qui ressemble vraiment à ce que vous faites ? On en parle.
            </p>
          </div>
        </GsapReveal>
      </section>

      <Offers />
      <ContactCTA />
      <ModeSwitcher />
    </main>
  );
}
