import Nav from "../components/Nav";
import Projects from "../components/Projects";
import CapabilityDemos from "../components/CapabilityDemos";
import EndCTA from "../components/EndCTA";
import ModeSwitcher from "../components/ModeSwitcher";

export default function Catalogue() {
  return (
    <main style={{ background: "var(--home-bg)", color: "var(--home-text)" }}>
      <a href="#catalogue-heading" className="skip-link">
        Aller au contenu
      </a>
      <Nav />
      {/* Real h1 for the page/a11y hierarchy — Projects' own gradient
          heading below is the visible, prominent title. */}
      <h1 id="catalogue-heading" tabIndex={-1} className="sr-only outline-none">
        Catalogue de projets — enzo.dev
      </h1>
      <div className="pt-28 sm:pt-32" />
      <Projects />
      <CapabilityDemos />
      <EndCTA text="Convaincu par ce que vous voyez ?" buttonLabel="Discutons de votre projet" href="/contact" />
      <ModeSwitcher />
    </main>
  );
}
