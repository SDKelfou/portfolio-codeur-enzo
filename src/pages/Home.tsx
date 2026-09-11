import Nav from "../components/Nav";
import Hero from "../components/Hero";
import Method from "../components/Method";
import CatalogueTeaser from "../components/CatalogueTeaser";
import ModeSwitcher from "../components/ModeSwitcher";

export default function Home() {
  return (
    <main style={{ background: "var(--home-bg)", color: "var(--home-text)" }}>
      <a href="#hero-heading" className="skip-link">
        Aller au contenu
      </a>
      <Nav />
      <Hero />
      <Method />
      <CatalogueTeaser />
      <ModeSwitcher />
    </main>
  );
}
