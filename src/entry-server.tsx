import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import App from "./App";
import { HeadCollector } from "./lib/head";
import type { HeadData } from "./lib/head";

import { registerDict } from "./i18n";
import type { Lang } from "./i18n";
import fr from "./i18n/fr";
import en from "./i18n/en";
import es from "./i18n/es";
import de from "./i18n/de";
import it from "./i18n/it";
import pt from "./i18n/pt";
import nl from "./i18n/nl";
export { LANGS, localizedPath } from "./i18n";

export const DICTS = { fr, en, es, de, it, pt, nl };
for (const [k, v] of Object.entries(DICTS)) registerDict(k as Lang, v);
export { getLegal } from "./legal/content";

export function render(url: string) {
  const head: HeadData = { title: "", description: "" };
  const html = renderToString(
    <StrictMode>
      <HeadCollector.Provider value={head}>
        <App ssrPath={url} />
      </HeadCollector.Provider>
    </StrictMode>
  );
  return { html, head };
}
