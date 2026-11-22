import { useEffect, useId, useState } from "react";
import type { FormEvent } from "react";
import { Mail, Paper } from "@getpapillon/papicons";
import { GsapReveal as Reveal } from "../lib/GsapReveal";
import { useI18n } from "../i18n";
import { CONTACT_EMAIL } from "../lib/site";
import { onQuotePreset } from "../lib/quoteEvents";

/** Quote form that writes the email for the visitor: nothing is sent or
 *  stored by the site, it only opens their mail app (or Gmail/Outlook web)
 *  with subject and body already filled in. */
export default function ContactCTA() {
  const { t } = useI18n();
  const c = t.contact;
  const f = t.form;
  const id = useId();

  const [name, setName] = useState("");
  const [business, setBusiness] = useState("");
  const [offer, setOffer] = useState(-1);
  const [care, setCare] = useState(false);
  const [deadline, setDeadline] = useState(0);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState<"email" | "message" | null>(null);

  useEffect(
    () =>
      onQuotePreset((p) => {
        if (typeof p.offer === "number") setOffer(p.offer);
        if (p.care) setCare(true);
      }),
    []
  );

  const offerName = offer >= 0 ? t.offers.items[offer].name : f.offerUnsure;
  const subject = `${c.subject} — ${offerName}${business ? ` — ${business}` : ""}`;
  const lbl = (l: string) => l.replace(/\s*[?¿]\s*/g, "").trim();
  const body = [
    f.hello,
    "",
    message.trim(),
    "",
    `${lbl(f.name)} : ${name || "—"}`,
    `${lbl(f.business)} : ${business || "—"}`,
    `${lbl(f.offer)} : ${offerName}`,
    `${f.careLabel} : ${care ? f.yes : f.no}`,
    `${lbl(f.deadline)} : ${f.deadlines[deadline]}`,
    "",
    f.bye,
    name,
  ].join("\n");

  const enc = encodeURIComponent;
  const links = {
    mailto: `mailto:${CONTACT_EMAIL}?subject=${enc(subject)}&body=${enc(body)}`,
    gmail: `https://mail.google.com/mail/?view=cm&fs=1&to=${enc(CONTACT_EMAIL)}&su=${enc(subject)}&body=${enc(body)}`,
    outlook: `https://outlook.live.com/mail/0/deeplink/compose?to=${enc(CONTACT_EMAIL)}&subject=${enc(subject)}&body=${enc(body)}`,
  };

  const valid = message.trim().length >= 5;

  const guard = (e: { preventDefault: () => void }) => {
    if (valid) return true;
    e.preventDefault();
    setError(true);
    document.getElementById(`${id}-message`)?.focus();
    return false;
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (guard(e)) window.location.href = links.mailto;
  };

  const copy = async (what: "email" | "message") => {
    try {
      await navigator.clipboard.writeText(what === "email" ? CONTACT_EMAIL : `${subject}\n\n${body}`);
      setCopied(what);
      window.setTimeout(() => setCopied(null), 2000);
    } catch {
      /* clipboard blocked: the address stays visible anyway */
    }
  };

  const field = "mt-1.5 w-full rounded-xl border bg-transparent px-4 py-3 text-sm outline-none transition-colors focus:border-[var(--accent-strong)]";
  const fieldStyle = { borderColor: "var(--home-border)", background: "var(--home-bg)" };
  const label = "block text-left text-sm font-semibold";

  return (
    <section id="contact" className="relative scroll-mt-20 overflow-hidden px-6 py-24 sm:px-10 sm:py-32">
      <div className="orb-field">
        <span className="orb orb-a" style={{ opacity: 0.3 }} />
        <span className="orb orb-b" style={{ opacity: 0.25 }} />
      </div>
      <Reveal className="relative z-10">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold tracking-[0.3em]" style={{ color: "var(--accent-ink)" }}>
            {c.kicker}
          </span>
          <h2 className="font-display mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
            {c.title1} <span className="text-gradient-ink">{c.title2}</span>
          </h2>
          <p className="mt-5 text-base leading-relaxed" style={{ color: "var(--home-text-muted)" }}>
            {c.text}
          </p>
        </div>

        <form onSubmit={submit} noValidate className="glass-light-solid mx-auto mt-12 max-w-2xl rounded-2xl p-6 sm:p-10">
          <h3 className="font-display text-xl font-bold">{f.title}</h3>
          <p className="mt-2 text-sm" style={{ color: "var(--home-text-muted)" }}>
            {f.intro}
          </p>

          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            <label className={label}>
              {f.name}
              <input className={field} style={fieldStyle} value={name} onChange={(e) => setName(e.target.value)} placeholder={f.namePh} autoComplete="name" />
            </label>
            <label className={label}>
              {f.business}
              <input className={field} style={fieldStyle} value={business} onChange={(e) => setBusiness(e.target.value)} placeholder={f.businessPh} autoComplete="organization" />
            </label>
            <label className={label}>
              {f.offer}
              <select className={field} style={fieldStyle} value={offer} onChange={(e) => setOffer(Number(e.target.value))}>
                <option value={-1}>{f.offerUnsure}</option>
                {t.offers.items.map((o, i) => (
                  <option key={i} value={i}>
                    {o.name} — {o.price || t.offers.onQuote}
                  </option>
                ))}
              </select>
            </label>
            <label className={label}>
              {f.deadline}
              <select className={field} style={fieldStyle} value={deadline} onChange={(e) => setDeadline(Number(e.target.value))}>
                {f.deadlines.map((d, i) => (
                  <option key={d} value={i}>
                    {d}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="mt-5 flex cursor-pointer items-center gap-3 text-left text-sm">
            <input type="checkbox" checked={care} onChange={(e) => setCare(e.target.checked)} className="h-4 w-4 shrink-0 accent-[var(--accent-strong)]" />
            {f.care}
          </label>

          <label className={`${label} mt-5`} htmlFor={`${id}-message`}>
            {f.message}
          </label>
          <textarea
            id={`${id}-message`}
            className={`${field} min-h-32 resize-y`}
            style={{ ...fieldStyle, ...(error && !valid ? { borderColor: "#e5484d" } : null) }}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              if (error) setError(false);
            }}
            placeholder={f.messagePh}
            aria-invalid={error && !valid}
            aria-describedby={error && !valid ? `${id}-err` : undefined}
          />
          {error && !valid && (
            <p id={`${id}-err`} role="alert" className="mt-2 text-left text-sm" style={{ color: "#e5484d" }}>
              {f.required}
            </p>
          )}

          <button type="submit" className="btn-accent glow-pulse mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full px-8 py-4 text-sm font-semibold">
            <Mail size={18} aria-hidden="true" />
            {f.send}
          </button>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-sm">
            <span style={{ color: "var(--home-text-muted)" }}>{f.webmail}</span>
            <a href={links.gmail} target="_blank" rel="noopener noreferrer" onClick={guard} className="rounded-full border px-4 py-2 font-semibold" style={{ borderColor: "var(--home-border)" }}>
              Gmail
            </a>
            <a href={links.outlook} target="_blank" rel="noopener noreferrer" onClick={guard} className="rounded-full border px-4 py-2 font-semibold" style={{ borderColor: "var(--home-border)" }}>
              Outlook
            </a>
            <button type="button" onClick={() => valid ? copy("message") : setError(true)} className="rounded-full border px-4 py-2 font-semibold" style={{ borderColor: "var(--home-border)" }}>
              <span aria-live="polite">{copied === "message" ? f.copied : f.copy}</span>
            </button>
          </div>

          <p className="mt-6 text-center text-xs" style={{ color: "var(--home-text-muted)" }}>
            {f.privacy}
          </p>
        </form>

        <div className="mx-auto mt-8 flex max-w-2xl flex-wrap items-center justify-center gap-3 text-sm" style={{ color: "var(--home-text-muted)" }}>
          <a href={`mailto:${CONTACT_EMAIL}`} className="font-medium break-all hover:text-[var(--accent-ink)]">
            {CONTACT_EMAIL}
          </a>
          <button type="button" onClick={() => copy("email")} className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold" style={{ borderColor: "var(--home-border)" }}>
            <Paper size={14} aria-hidden="true" />
            <span aria-live="polite">{copied === "email" ? c.copied : c.copy}</span>
          </button>
        </div>
      </Reveal>
    </section>
  );
}
