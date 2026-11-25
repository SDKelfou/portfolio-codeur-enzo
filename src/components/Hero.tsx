import { useEffect, useRef, useState } from "react";
import { ArrowRight, ArrowDown, Check, Lock } from "@getpapillon/papicons";
import { useI18n } from "../i18n";
import LiveTiming from "./LiveTiming";
import TLink from "./TLink";

/**
 * The hero says what this is in one line, and proves it on the right: a
 * real little website that two cursors ("Enzo" and "You") build block by
 * block as the visitor scrolls. Desktop: the whole hero stays pinned while
 * the build runs. Phone: the text comes first, then the mock-up pins while
 * it builds. The first two blocks assemble on load so the first screen is
 * never an empty frame.
 */

const STEPS = 6;
// cursor targets per step, in % of the mock-up canvas: [enzoX, enzoY, youX, youY]
const CURSORS: [number, number, number, number][] = [
  [46, 46, 82, 78],
  [34, 9, 86, 72],
  [44, 33, 74, 12],
  [76, 40, 58, 28],
  [17, 63, 66, 46],
  [52, 84, 24, 86],
  [86, 93, 70, 80],
];

function Cursor({ x, y, color, label, dark }: { x: number; y: number; color: string; label: string; dark?: boolean }) {
  return (
    <div className="mock-cursor" style={{ left: `${x}%`, top: `${y}%` }} aria-hidden="true">
      <svg width="20" height="22" viewBox="0 0 20 22">
        <path d="M2 1.5 17.5 11l-7 1.6L7 20Z" fill={color} stroke="#24222d" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
      <span style={{ background: color, color: dark ? "#fff" : "#24222d" }}>{label}</span>
    </div>
  );
}

export default function Hero() {
  const { t } = useI18n();
  const h = t.hero;
  const b = t.build;
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [scrollStep, setScrollStep] = useState(0);
  const [intro, setIntro] = useState(0);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const rm = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(rm.matches);
    const lg = window.matchMedia("(min-width: 1024px)");
    let raf = 0;
    const measure = () => {
      raf = 0;
      const el = lg.matches ? sectionRef.current : trackRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const span = Math.max(1, r.height - window.innerHeight * (lg.matches ? 1 : 0.75));
      const p = Math.min(1, Math.max(0, (lg.matches ? -r.top : window.innerHeight * 0.35 - r.top) / span));
      setScrollStep(Math.min(STEPS, Math.floor(p * (STEPS + 0.6))));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    // the intro: the first two blocks are built by the time the visitor reads the title
    const t1 = window.setTimeout(() => setIntro(1), 250);
    const t2 = window.setTimeout(() => setIntro(2), 950);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, []);

  const step = reduced ? STEPS : Math.max(scrollStep, intro);
  const built = (n: number) => (step >= n ? " is-built" : "");
  const activeCls = (n: number) => (step === n && step < STEPS ? " is-active" : "");
  const [ex, ey, yx, yy] = CURSORS[step];

  return (
    <section ref={sectionRef} className="relative lg:h-[270vh]" aria-labelledby="hero-heading">
      <div className="lg:sticky lg:top-0 lg:flex lg:h-svh lg:items-center">
        <div className="wrap grid gap-10 pb-6 pt-28 lg:grid-cols-12 lg:gap-12 lg:pb-0 lg:pt-16">
          <div className="lg:col-span-6 lg:self-center">
            <h1 id="hero-heading" className="font-display text-[clamp(3rem,6.4vw,6.1rem)] leading-[0.93] tracking-[-0.025em]">
              {h.title}
            </h1>
            <p className="mt-6 max-w-[34rem] text-[clamp(1.08rem,1.5vw,1.3rem)] leading-relaxed" style={{ color: "var(--ink-2)" }}>
              {h.sub}
            </p>
            <p className="mt-5 inline-flex items-center gap-2 rounded-full px-4 py-2 text-[0.95rem] font-bold" style={{ background: "var(--lav)", color: "#24222d" }}>
              {h.price}
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
              <TLink href="/contact#contact" className="btn btn-light">
                {h.cta}
                <ArrowRight size={18} aria-hidden="true" />
              </TLink>
              <TLink href="/projets" className="btn btn-line">
                {h.ctaWork}
              </TLink>
            </div>
            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-[0.8125rem]" style={{ color: "var(--ink-3)" }}>
              <span className="font-semibold" style={{ color: "var(--ink)" }}>
                {h.by}
              </span>
              <span>{h.reply}</span>
              <LiveTiming />
            </div>
          </div>

          <div ref={trackRef} className="relative h-[200vh] lg:col-span-6 lg:h-auto lg:self-center">
            <div className="sticky top-[5.5rem] lg:static">
              <figure className="mock" aria-label={b.label}>
                <div className="mock-bar" aria-hidden="true">
                  <span className="dots">
                    <i />
                    <i />
                    <i />
                  </span>
                  <span className="url">
                    <Lock size={11} />
                    {b.url}
                  </span>
                </div>
                <div className="mock-canvas" aria-hidden="true">
                  <div className={`blk blk-nav${built(1)}${activeCls(1)}`} data-tag={b.steps[0]}>
                    <span className="logo">
                      <i /> {b.brand}
                    </span>
                    <span className="links">
                      {b.nav.map((n) => (
                        <span key={n}>{n}</span>
                      ))}
                    </span>
                  </div>
                  <div className={`blk blk-title${built(2)}${activeCls(2)}`} data-tag={b.steps[1]}>
                    {b.title}
                  </div>
                  <div className={`blk blk-photo${built(3)}${activeCls(3)}`} data-tag={b.steps[2]}>
                    <span className="sun" />
                    <span className="loaf l1" />
                    <span className="loaf l2" />
                    <span className="loaf l3" />
                  </div>
                  <div className={`blk blk-cta${built(4)}${activeCls(4)}`} data-tag={b.steps[3]}>
                    <span className="sub">{b.sub}</span>
                    <span className="btn-mock">{b.cta}</span>
                    <span className="stars">★★★★★</span>
                  </div>
                  <div className={`blk blk-cards${built(5)}${activeCls(5)}`} data-tag={b.steps[4]}>
                    {b.cards.map((c, i) => (
                      <span key={c} className="card">
                        <i className={`ic ic${i}`} />
                        {c}
                      </span>
                    ))}
                  </div>
                  <div className={`mock-toast${built(6)}`}>
                    <Check size={14} />
                    {b.live}
                  </div>
                  {!reduced && (
                    <>
                      <Cursor x={ex} y={ey} color="#fff010" label="Enzo" />
                      <Cursor x={yx} y={yy} color="#a99bcf" label={b.you} dark />
                    </>
                  )}
                </div>
              </figure>
              <ol className="mock-rail" aria-label={b.label}>
                {b.steps.map((s, i) => (
                  <li key={s} data-on={step >= i + 1} aria-current={step === i + 1 ? "step" : undefined}>
                    {s}
                  </li>
                ))}
              </ol>
              <p className="meta mt-2 text-center">{b.note}</p>
            </div>
          </div>
        </div>
        <a
          href="#realisations"
          className="absolute bottom-5 left-1/2 hidden -translate-x-1/2 items-center gap-2 text-sm font-semibold no-underline lg:inline-flex"
          style={{ color: "var(--ink)", opacity: step >= STEPS ? 0 : 1, transition: "opacity .4s" }}
        >
          {h.scroll}
          <ArrowDown size={16} aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}
