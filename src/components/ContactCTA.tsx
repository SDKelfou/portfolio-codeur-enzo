import { useEffect, useId, useState } from "react";
import type { FormEvent } from "react";
import { Mail, Paper, Check, ArrowRight } from "@getpapillon/papicons";
import TLink from "./TLink";
import { useI18n } from "../i18n";
import { CONTACT_EMAIL } from "../lib/site";
import { onQuotePreset } from "../lib/quoteEvents";

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
  const [sent, setSent] = useState(false);

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
    if (guard(e)) {
      window.location.href = links.mailto;
      setSent(true);
    }
  };

  const copy = async (what: "email" | "message") => {
    try {
      await navigator.clipboard.writeText(what === "email" ? CONTACT_EMAIL : `${subject}\n\n${body}`);
      setCopied(what);
      window.setTimeout(() => setCopied(null), 2000);
    } catch {

    }
  };

  const label = "block text-sm font-bold";

  return (
    <section id="contact" className="cv scroll-mt-24 py-24 sm:py-32" style={{ background: "var(--bg-2)" }} aria-labelledby="contact-heading">
      <div className="wrap grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <h2 id="contact-heading" className="h2" data-reveal="rise">
            {c.title}
          </h2>
          <p className="muted mt-6 max-w-md text-lg" data-reveal="rise" style={{ ["--i" as string]: 1 }}>
            {c.text}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3" data-reveal="rise" style={{ ["--i" as string]: 2 }}>
            <a href={`mailto:${CONTACT_EMAIL}`} className="link break-all text-lg font-bold" style={{ color: "var(--ink)" }}>
              {CONTACT_EMAIL}
            </a>
            <button type="button" onClick={() => copy("email")} className="btn btn-line !min-h-[2.4rem] !px-3.5 !py-1.5 text-xs">
              <Paper size={14} aria-hidden="true" />
              <span aria-live="polite">{copied === "email" ? c.copied : c.copy}</span>
            </button>
          </div>
          <TLink href="/contact#preparer" className="link mt-6 inline-flex items-center gap-2 font-bold" style={{ color: "var(--ink)" }}>
            {t.prep.link}
            <ArrowRight size={16} aria-hidden="true" />
          </TLink>
        </div>

        <form onSubmit={submit} noValidate className="surface p-6 sm:p-10 lg:col-span-7" style={{ boxShadow: "var(--shadow)" }}>
          <h3 className="h3">{f.title}</h3>
          <p className="muted mt-2 text-[0.95rem]">{f.intro}</p>

          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            <label className={label}>
              {f.name}
              <input className="field" value={name} onChange={(e) => setName(e.target.value)} placeholder={f.namePh} autoComplete="name" />
            </label>
            <label className={label}>
              {f.business}
              <input className="field" value={business} onChange={(e) => setBusiness(e.target.value)} placeholder={f.businessPh} autoComplete="organization" />
            </label>
            <label className={label}>
              {f.offer}
              <select className="field" value={offer} onChange={(e) => setOffer(Number(e.target.value))}>
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
              <select className="field" value={deadline} onChange={(e) => setDeadline(Number(e.target.value))}>
                {f.deadlines.map((d, i) => (
                  <option key={d} value={i}>
                    {d}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="mt-5 flex cursor-pointer items-center gap-3 text-[0.95rem] font-semibold">
            <input type="checkbox" checked={care} onChange={(e) => setCare(e.target.checked)} className="h-5 w-5 shrink-0 accent-[#24222d]" />
            {f.care}
          </label>

          <label className={`${label} mt-5`} htmlFor={`${id}-message`}>
            {f.message}
          </label>
          <textarea
            id={`${id}-message`}
            className="field min-h-36 resize-y"
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
            <p id={`${id}-err`} role="alert" className="mt-2 text-sm font-semibold" style={{ color: "#c8323f" }}>
              {f.required}
            </p>
          )}

          <button type="submit" className="btn btn-light mt-7 w-full">
            <Mail size={18} aria-hidden="true" />
            {f.send}
          </button>
          {sent && (
            <p role="status" className="mt-3 flex items-start gap-2 text-sm font-semibold">
              <Check size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
              {f.opened}
            </p>
          )}

          <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-sm">
            <span className="muted">{f.webmail}</span>
            <a href={links.gmail} target="_blank" rel="noopener noreferrer" onClick={guard} className="btn btn-line !min-h-[2.4rem] !px-4 !py-1.5 text-sm">
              Gmail
            </a>
            <a href={links.outlook} target="_blank" rel="noopener noreferrer" onClick={guard} className="btn btn-line !min-h-[2.4rem] !px-4 !py-1.5 text-sm">
              Outlook
            </a>
            <button type="button" onClick={() => (valid ? copy("message") : setError(true))} className="btn btn-line !min-h-[2.4rem] !px-4 !py-1.5 text-sm">
              <span aria-live="polite">{copied === "message" ? f.copied : f.copy}</span>
            </button>
          </div>

          <p className="meta mt-6 text-center">{f.privacy}</p>
        </form>
      </div>
    </section>
  );
}
