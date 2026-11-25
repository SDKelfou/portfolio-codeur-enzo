import { useEffect } from "react";
import { Route, Router, Switch, useLocation } from "wouter";
import { ConsentProvider } from "./lib/consent";
import { I18nProvider, langBase, splitPath } from "./i18n";
import { armReveals } from "./lib/reveal";
import CookieBanner from "./components/CookieBanner";
import Home from "./pages/Home";
import Catalogue from "./pages/Catalogue";
import Contact from "./pages/Contact";
import Legal from "./pages/Legal";
import NotFound from "./pages/NotFound";

function Routes() {
  const [location] = useLocation();
  useEffect(() => armReveals(), [location]);
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/projets" component={Catalogue} />
      <Route path="/contact" component={Contact} />
      <Route path="/mentions-legales">{() => <Legal page="notice" />}</Route>
      <Route path="/confidentialite">{() => <Legal page="privacy" />}</Route>
      <Route path="/cgv">{() => <Legal page="terms" />}</Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function Shell({ ssrPath }: { ssrPath?: string }) {
  const [fullPath] = useLocation();
  const { lang } = splitPath(fullPath.replace(/\/+$/, "") || "/");
  const base = langBase(lang);
  const inner = ssrPath ? splitPath(ssrPath).rest : undefined;
  return (
    <I18nProvider lang={lang}>
      <ConsentProvider>
        <Router base={base} ssrPath={inner}>
          <Routes />
        </Router>
        <CookieBanner />
      </ConsentProvider>
    </I18nProvider>
  );
}

export default function App({ ssrPath }: { ssrPath?: string }) {
  return (
    <Router ssrPath={ssrPath}>
      <Shell ssrPath={ssrPath} />
    </Router>
  );
}
