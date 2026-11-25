export type Theme = "light" | "dark";

export const THEME_KEY = "enzo-dev-theme";

export function currentTheme(): Theme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

export function applyTheme(next: Theme) {
  document.documentElement.dataset.theme = next;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", next === "dark" ? "#101016" : "#f8f6f0");
  try {
    window.localStorage.setItem(THEME_KEY, next);
  } catch {
    /* private mode: the choice simply isn't remembered */
  }
  window.dispatchEvent(new CustomEvent("enzo:theme", { detail: next }));
}

/** Inline, render-blocking snippet for <head>: picks the stored theme or
 *  the system preference before first paint (no flash), and marks return
 *  visits so the intro animation can be shorter. */
export const THEME_BOOT = `(function(){try{var d=document.documentElement,t=localStorage.getItem("${THEME_KEY}");if(t!=="light"&&t!=="dark"){t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}d.dataset.theme=t;if(localStorage.getItem("enzo-dev-visited")){d.classList.add("g-short")}else{localStorage.setItem("enzo-dev-visited","1")}}catch(e){}})();`;
