export interface QuotePreset {
  offer?: number;
  care?: boolean;
}

const EVENT = "enzo:quote-preset";

export function presetQuote(preset: QuotePreset) {
  window.dispatchEvent(new CustomEvent<QuotePreset>(EVENT, { detail: preset }));
  document.getElementById("contact")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function onQuotePreset(cb: (p: QuotePreset) => void) {
  const handler = (e: Event) => cb((e as CustomEvent<QuotePreset>).detail);
  window.addEventListener(EVENT, handler);
  return () => window.removeEventListener(EVENT, handler);
}
