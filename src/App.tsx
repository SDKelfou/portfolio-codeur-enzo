import { Suspense, lazy, useEffect } from "react";
import { Route, Switch, useLocation } from "wouter";
import { ThemeProvider } from "./lib/theme";
import { ConsentProvider } from "./lib/consent";
import { I18nProvider } from "./i18n";
import { RealityWarpOverlay } from "./lib/warp/RealityWarpOverlay";
import CookieBanner from "./components/CookieBanner";
import Home from "./pages/Home";
import Catalogue from "./pages/Catalogue";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

const Legal = lazy(() => import("./pages/Legal"));

/** Scroll to the #hash target after a route change (e.g. /contact#offres),
 *  otherwise start the new page at the top. */
function ScrollManager() {
  const [location] = useLocation();
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (!hash) {
      window.scrollTo(0, 0);
      return;
    }
    const t = window.setTimeout(() => document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" }), 120);
    return () => window.clearTimeout(t);
  }, [location]);
  return null;
}

export default function App() {
  return (
    <I18nProvider>
      <ConsentProvider>
        <ThemeProvider>
          <ScrollManager />
          <div className="mode-sweep" aria-hidden="true" />
          {/* Stable node across route changes — useRealityWarp() transforms
              this exact element (scale/blur/y) through the transition. */}
          <div id="warp-viewport">
            <Suspense fallback={<div style={{ minHeight: "100vh", background: "var(--home-bg)" }} />}>
              <Switch>
                <Route path="/" component={Home} />
                <Route path="/projets" component={Catalogue} />
                <Route path="/contact" component={Contact} />
                <Route path="/mentions-legales">{() => <Legal page="notice" />}</Route>
                <Route path="/confidentialite">{() => <Legal page="privacy" />}</Route>
                <Route path="/cgv">{() => <Legal page="terms" />}</Route>
                <Route component={NotFound} />
              </Switch>
            </Suspense>
          </div>
          <RealityWarpOverlay />
          <CookieBanner />
        </ThemeProvider>
      </ConsentProvider>
    </I18nProvider>
  );
}
