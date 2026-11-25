import Layout from "../components/Layout";
import Projects from "../components/Projects";
import Method from "../components/Method";
import { useI18n } from "../i18n";
import { usePageMeta } from "../lib/head";

export default function Catalogue() {
  const { t } = useI18n();
  usePageMeta(t.pages.work.title, t.pages.work.description);
  return (
    <Layout>
      <div className="pt-16" />
      <Projects headingLevel={1} />
      <Method />
    </Layout>
  );
}
