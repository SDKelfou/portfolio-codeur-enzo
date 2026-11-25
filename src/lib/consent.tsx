import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { inject } from "@vercel/analytics";

const STORAGE_KEY = "enzo-dev-consent";
const MAX_AGE_MS = 1000 * 60 * 60 * 24 * 182;

export interface Consent {
  analytics: boolean;
  date: number;
}

interface ConsentApi {
  consent: Consent | null;
  bannerOpen: boolean;
  save: (analytics: boolean) => void;
  openBanner: () => void;
}

const ConsentCtx = createContext<ConsentApi | null>(null);

function readConsent(): Consent | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Consent;
    if (typeof parsed.analytics !== "boolean" || Date.now() - parsed.date > MAX_AGE_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

let analyticsLoaded = false;
function loadAnalytics() {
  if (analyticsLoaded || import.meta.env.DEV) return;
  analyticsLoaded = true;
  inject({ mode: "production" });
}

export function ConsentProvider({ children }: { children: ReactNode }) {

  const [consent, setConsent] = useState<Consent | null>(null);
  const [bannerOpen, setBannerOpen] = useState(false);

  useEffect(() => {
    const stored = readConsent();
    setConsent(stored);
    if (!stored) {
      const t = window.setTimeout(() => setBannerOpen(true), 1200);
      return () => window.clearTimeout(t);
    }
  }, []);

  useEffect(() => {
    if (consent?.analytics) loadAnalytics();
  }, [consent]);

  const save = useCallback((analytics: boolean) => {
    const next = { analytics, date: Date.now() };
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
    }

    if (!analytics && analyticsLoaded) window.location.reload();
    setConsent(next);
    setBannerOpen(false);
  }, []);

  const openBanner = useCallback(() => setBannerOpen(true), []);

  const value = useMemo(() => ({ consent, bannerOpen, save, openBanner }), [consent, bannerOpen, save, openBanner]);
  return <ConsentCtx.Provider value={value}>{children}</ConsentCtx.Provider>;
}

export function useConsent() {
  const ctx = useContext(ConsentCtx);
  if (!ctx) throw new Error("useConsent must be used within ConsentProvider");
  return ctx;
}
