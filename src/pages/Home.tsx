import Nav from "../components/Nav";
import Hero from "../components/Hero";
import Method from "../components/Method";
import Offers from "../components/Offers";
import CatalogueTeaser from "../components/CatalogueTeaser";
import Faq from "../components/Faq";
import ContactCTA from "../components/ContactCTA";
import ModeSwitcher from "../components/ModeSwitcher";
import { useI18n } from "../i18n";

export default function Home() {
  const { t } = useI18n();
  return (
    <main style={{ background: "var(--home-bg)", color: "var(--home-text)" }}>
      <a href="#hero-heading" className="skip-link">
        {t.skip}
      </a>
      <Nav />
      <Hero />
      <Method />
      <CatalogueTeaser />
      <Offers />
      <Faq />
      <ContactCTA />
      <ModeSwitcher />
    </main>
  );
}
