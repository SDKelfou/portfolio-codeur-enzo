import { useEffect, useState } from "react";
import TLink from "./TLink";
import { useConsent } from "../lib/consent";
import { useI18n } from "../i18n";

export default function CookieBanner() {
  const { consent, bannerOpen, save } = useConsent();
  const { t } = useI18n();
  const c = t.cookies;
  const [details, setDetails] = useState(false);
  const [analytics, setAnalytics] = useState(consent?.analytics ?? false);

  useEffect(() => {
    if (bannerOpen) setAnalytics(consent?.analytics ?? false);
  }, [bannerOpen, consent]);

  if (!bannerOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="cookie-title"
      className="fixed inset-x-0 bottom-0 z-[200] p-4 sm:bottom-4 sm:left-4 sm:right-auto sm:max-w-md"
    >
      <div
        className="surface p-6"
        style={{ color: "var(--ink)", boxShadow: "var(--shadow)", borderRadius: "var(--r-lg)" }}
      >
        <h2 id="cookie-title" className="text-base font-extrabold">
          {c.title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--ink-2)" }}>
          {c.text}{" "}
          <TLink href="/confidentialite#cookies" className="underline underline-offset-2">
            {c.more}
          </TLink>
        </p>

        {details && (
          <div className="mt-4 space-y-3 text-sm">
            <label className="flex items-start justify-between gap-4">
              <span>
                <span className="font-semibold">{c.necessary}</span>
                <span className="block text-xs" style={{ color: "var(--ink-2)" }}>
                  {c.necessaryDesc}
                </span>
              </span>
              <input type="checkbox" checked disabled className="mt-1 h-4 w-4 shrink-0" aria-describedby="cookie-title" />
            </label>
            <label className="flex cursor-pointer items-start justify-between gap-4">
              <span>
                <span className="font-semibold">{c.analytics}</span>
                <span className="block text-xs" style={{ color: "var(--ink-2)" }}>
                  {c.analyticsDesc}
                </span>
              </span>
              <input
                type="checkbox"
                checked={analytics}
                onChange={(e) => setAnalytics(e.target.checked)}
                className="mt-1 h-4 w-4 shrink-0 cursor-pointer accent-[#24222d]"
              />
            </label>
          </div>
        )}

        <div className="mt-5 flex flex-wrap gap-2">
          <button type="button" onClick={() => save(false)} className="btn btn-line grow !min-h-[2.6rem] whitespace-nowrap !py-2 text-sm">
            {c.reject}
          </button>
          {details ? (
            <button type="button" onClick={() => save(analytics)} className="btn btn-line grow !min-h-[2.6rem] whitespace-nowrap !py-2 text-sm">
              {c.save}
            </button>
          ) : (
            <button type="button" onClick={() => setDetails(true)} className="btn btn-line grow !min-h-[2.6rem] whitespace-nowrap !py-2 text-sm">
              {c.customize}
            </button>
          )}
          <button type="button" onClick={() => save(true)} className="btn btn-light grow !min-h-[2.6rem] whitespace-nowrap !py-2 text-sm">
            {c.accept}
          </button>
        </div>
      </div>
    </div>
  );
}
