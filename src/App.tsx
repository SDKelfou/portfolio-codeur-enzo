import { Suspense } from "react";
import { Route, Switch } from "wouter";
import { AudioProvider } from "./lib/audio";
import { ThemeProvider } from "./lib/theme";
import { RealityWarpOverlay } from "./lib/warp/RealityWarpOverlay";
import Home from "./pages/Home";
import Catalogue from "./pages/Catalogue";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <AudioProvider>
      <ThemeProvider>
        <div className="mode-sweep" aria-hidden="true" />
        {/* Stable node across route changes — useRealityWarp() transforms
            this exact element (scale/blur/y) through the transition, so
            the incoming page inherits the "just punched through" pose
            without needing a ref into content that doesn't exist yet. */}
        <div id="warp-viewport">
          <Suspense fallback={<div style={{ minHeight: "100vh", background: "#07070a" }} />}>
            <Switch>
              <Route path="/" component={Home} />
              <Route path="/projets" component={Catalogue} />
              <Route path="/contact" component={Contact} />
              <Route component={NotFound} />
            </Switch>
          </Suspense>
        </div>
        <RealityWarpOverlay />
      </ThemeProvider>
    </AudioProvider>
  );
}
