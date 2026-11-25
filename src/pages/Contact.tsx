import Layout from "../components/Layout";
import Offers from "../components/Offers";
import ContactCTA from "../components/ContactCTA";
import Faq from "../components/Faq";
import Prep from "../components/Prep";
import { useI18n } from "../i18n";
import { usePageMeta } from "../lib/head";

export default function Contact() {
  const { t } = useI18n();
  usePageMeta(t.pages.contact.title, t.pages.contact.description);
  return (
    <Layout>
      <section className="pt-36 sm:pt-44">
        <div className="wrap grid gap-8 lg:grid-cols-12">
          <h1 className="font-display text-[clamp(3.6rem,10vw,8.5rem)] italic leading-[0.88] tracking-[-0.03em] lg:col-span-8">{t.about.title}</h1>
          <p className="muted self-end text-lg lg:col-span-4">{t.about.text}</p>
        </div>
      </section>
      <Offers />
      <Prep />
      <ContactCTA />
      <Faq />
    </Layout>
  );
}
