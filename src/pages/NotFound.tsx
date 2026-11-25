import Layout from "../components/Layout";
import TLink from "../components/TLink";
import Sculpture from "../components/Sculpture";
import { useI18n } from "../i18n";
import { usePageMeta } from "../lib/head";

export default function NotFound() {
  const { t } = useI18n();
  usePageMeta(t.pages.notFound.title, t.pages.notFound.description, 404);
  return (
    <Layout>
      <section className="wrap grid min-h-[80svh] items-center gap-10 pb-16 pt-32 md:grid-cols-2">
        <div>
          <p className="font-display tnum text-[clamp(6rem,18vw,12rem)] italic leading-none">404</p>
          <h1 className="h3 mt-4">{t.notFound.title}</h1>
          <p className="muted mt-4 max-w-md">{t.notFound.text}</p>
          <TLink href="/" className="btn btn-light mt-8">
            {t.notFound.back}
          </TLink>
        </div>
        <Sculpture className="sculpture mx-auto w-full max-w-sm is-split" />
      </section>
    </Layout>
  );
}
