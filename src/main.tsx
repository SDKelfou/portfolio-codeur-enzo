import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { loadDict, splitPath } from "./i18n";

const el = document.getElementById("root")!;
const app = (
  <StrictMode>
    <App />
  </StrictMode>
);

loadDict(splitPath(window.location.pathname.replace(/\/+$/, "") || "/").lang).then(() => {
  if (el.firstElementChild) hydrateRoot(el, app);
  else createRoot(el).render(app);
});
