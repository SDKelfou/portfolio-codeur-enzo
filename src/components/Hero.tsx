import { ArrowRight, ArrowDown } from "@getpapillon/papicons";
import { useI18n } from "../i18n";
import Sculpture from "./Sculpture";
import Particles from "./Particles";
import LiveTiming from "./LiveTiming";
import TLink from "./TLink";

// where each letter of the name flies in from during Genesis
const SCATTER = [
  { dx: "-0.55em", dy: "-0.35em", r: "-16deg" },
  { dx: "0.15em", dy: "0.55em", r: "11deg" },
  { dx: "0.45em", dy: "-0.45em", r: "19deg" },
  { dx: "0.8em", dy: "0.3em", r: "-13deg" },
  { dx: "0.3em", dy: "0.5em", r: "9deg" },
];

// static keyframes per letter (no var() inside keyframes, so the
// browser can run them off the main thread)
const LETTER_KEYFRAMES = SCATTER.map(
  (s, i) => `@keyframes letter-${i}{from{transform:translate(${s.dx},${s.dy}) rotate(${s.r}) scale(.92)}}`
).join("");

export default function Hero() {
  const { t } = useI18n();
  const h = t.hero;

  return (
    <section className="hero-stage relative overflow-hidden pt-[6.5rem] sm:pt-28" aria-labelledby="hero-heading">
      <style>{LETTER_KEYFRAMES}</style>
      <div className="wrap relative grid min-h-[calc(100svh-6.5rem)] grid-cols-1 content-center gap-y-10 pb-10 lg:grid-cols-12 lg:gap-x-8 lg:pb-14">
        {/* sculpture: right column on desktop, tucked behind the name on phones */}
        <div className="pointer-events-auto absolute right-[-2vw] top-[-0.75rem] z-0 w-[36vw] max-w-[18rem] sm:right-0 sm:top-0 sm:w-[30vw] lg:static lg:order-2 lg:col-span-5 lg:col-start-8 lg:w-auto lg:max-w-none lg:self-center lg:opacity-100">
          <div className="relative mx-auto aspect-[41/45] w-full max-w-[31rem]">
            <Particles />
            <Sculpture className="relative h-full w-full" />
          </div>
        </div>

        <div className="relative z-10 lg:order-1 lg:col-span-7">
          <h1 id="hero-heading" className="font-display -ml-[0.04em] mt-2 italic" style={{ fontSize: "var(--fs-name)", lineHeight: 0.82, letterSpacing: "-0.035em" }}>
            <span className="sr-only">
              {h.name}, {h.role}
            </span>
            <span aria-hidden="true">
              {Array.from(h.name).map((ch, i) => {
                                return (
                  <span key={i} className="genesis-letter" style={{ ["--i" as string]: i, animationName: `letter-${i % SCATTER.length}` }}>
                    {ch}
                  </span>
                );
              })}
              <span className="genesis-letter not-italic" style={{ ["--i" as string]: h.name.length, animationName: `letter-${h.name.length % SCATTER.length}`, color: "var(--iris-ink)" }}>
                .
              </span>
            </span>
          </h1>

          <p className="mt-5 text-xl font-extrabold">{h.role}</p>
          <p className="genesis-up mt-3 max-w-[34rem]" style={{ ["--d" as string]: "380ms", fontSize: "var(--fs-lead)", lineHeight: 1.55, color: "var(--ink-2)" }}>
            {h.lead}
          </p>
          <p className="genesis-up mt-5 font-display text-[1.9rem] leading-none" style={{ ["--d" as string]: "460ms" }}>
            {h.price}
          </p>

          <div className="genesis-up mt-8 flex flex-col gap-3 sm:flex-row sm:items-center" style={{ ["--d" as string]: "560ms" }}>
            <TLink href="/contact#contact" className="btn btn-light">
              {h.cta}
              <ArrowRight size={18} aria-hidden="true" />
            </TLink>
            <TLink href="/projets" className="btn btn-line">
              {h.ctaWork}
            </TLink>
          </div>
        </div>

        <div
          className="genesis-up relative z-10 flex flex-wrap items-center gap-x-6 gap-y-2 border-t pt-5 text-[0.8125rem] lg:order-3 lg:col-span-12"
          style={{ ["--d" as string]: "720ms", borderColor: "var(--line)", color: "var(--ink-3)" }}
        >
          <LiveTiming />
          <span>{h.based}</span>
          <span>{h.reply}</span>
          <a href="#realisations" className="ml-auto inline-flex items-center gap-1.5 font-semibold no-underline" style={{ color: "var(--ink)" }}>
            {h.scroll}
            <ArrowDown size={16} aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}
