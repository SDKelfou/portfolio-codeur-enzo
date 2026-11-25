import Layout from "../components/Layout";
import Hero from "../components/Hero";
import Projects from "../components/Projects";
import Method from "../components/Method";
import Offers from "../components/Offers";
import About from "../components/About";
import Faq from "../components/Faq";
import ContactCTA from "../components/ContactCTA";
import { useI18n } from "../i18n";
import { usePageMeta } from "../lib/head";

export default function Home() {
  const { t } = useI18n();
  usePageMeta(t.meta.title, t.meta.description);
  return (
    <Layout>
      <Hero />
      <Projects />
      <Method />
      <Offers />
      <About />
      <Faq />
      <ContactCTA />
    </Layout>
  );
}
