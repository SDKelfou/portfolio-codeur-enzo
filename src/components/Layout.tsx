import type { ReactNode } from "react";
import Nav from "./Nav";
import Footer from "./Footer";
import { useI18n } from "../i18n";

export default function Layout({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  return (
    <>
      <a href="#main" className="skip-link">
        {t.skip}
      </a>
      <Nav />
      <main id="main" tabIndex={-1} className="outline-none">
        {children}
      </main>
      <Footer />
    </>
  );
}
