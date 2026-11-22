import Nav from "../components/Nav";
import Projects from "../components/Projects";
import CapabilityDemos from "../components/CapabilityDemos";
import EndCTA from "../components/EndCTA";
import ModeSwitcher from "../components/ModeSwitcher";
import { useI18n } from "../i18n";

export default function Catalogue() {
  const { t } = useI18n();
  return (
    <main style={{ background: "var(--home-bg)", color: "var(--home-text)" }}>
      <a href="#catalogue-heading" className="skip-link">
        {t.skip}
      </a>
      <Nav />
      {/* Real h1 for the page/a11y hierarchy — Projects' own gradient
          heading below is the visible, prominent title. */}
      <h1 id="catalogue-heading" tabIndex={-1} className="sr-only outline-none">
        {t.projects.pageTitle}
      </h1>
      <div className="pt-28 sm:pt-32" />
      <Projects />
      <CapabilityDemos />
      <EndCTA text={t.endCta.text} buttonLabel={t.endCta.button} href="/contact#contact" />
      <ModeSwitcher />
    </main>
  );
}
