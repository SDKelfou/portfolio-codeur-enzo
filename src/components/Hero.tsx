import { useEffect, useRef, useState } from "react";
import type { PointerEvent as RPointerEvent } from "react";
import { ArrowRight, Check, Lock } from "@getpapillon/papicons";
import { useI18n } from "../i18n";
import LiveTiming from "./LiveTiming";
import TLink from "./TLink";

const STEPS = 6;
const STEP_MS = 820;
const HOLD_MS = 2300;
const RESET_MS = 420;

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
  const [step, setStep] = useState(0);
  const [site, setSite] = useState(0);
  const [resetting, setResetting] = useState(false);
  const [reduced, setReduced] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);

  const tilt = (e: RPointerEvent<HTMLElement>) => {
    const el = stageRef.current;
    if (!el || e.pointerType !== "mouse" || reduced) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - (r.left + r.width / 2)) / window.innerWidth;
    const y = (e.clientY - (r.top + r.height / 2)) / window.innerHeight;
    el.style.setProperty("--ry", `${(x * 14).toFixed(2)}deg`);
    el.style.setProperty("--rx", `${(-y * 10).toFixed(2)}deg`);
  };
  const untilt = () => {
    stageRef.current?.style.setProperty("--ry", "-6deg");
    stageRef.current?.style.setProperty("--rx", "3deg");
  };

  useEffect(() => {
    const rm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReduced(rm);
    if (rm) {
      setStep(STEPS);
      return;
    }
    let s = 0;
    let v = 0;
    let timer = 0;
    let visible = true;
    let paused = false;
    const tick = () => {
      if (!visible || document.hidden) {
        paused = true;
        return;
      }
      if (s < STEPS) {
        s += 1;
        setStep(s);
        timer = window.setTimeout(tick, s === STEPS ? HOLD_MS : STEP_MS);
      } else {
        setResetting(true);
        timer = window.setTimeout(() => {
          s = 0;
          v = (v + 1) % b.sites.length;
          setSite(v);
          setStep(0);
          setResetting(false);
          timer = window.setTimeout(tick, 500);
        }, RESET_MS);
      }
    };
    const resume = () => {
      if (paused && visible && !document.hidden) {
        paused = false;
        timer = window.setTimeout(tick, 300);
      }
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      resume();
    });
    const el = document.querySelector(".mock");
    if (el) io.observe(el);
    document.addEventListener("visibilitychange", resume);
    timer = window.setTimeout(tick, 450);
    return () => {
      window.clearTimeout(timer);
      io.disconnect();
      document.removeEventListener("visibilitychange", resume);
    };
  }, [b.sites.length]);

  const s = b.sites[site];
  const built = (n: number) => (step >= n && !resetting ? " is-built" : "");
  const activeCls = (n: number) => (step === n && step < STEPS ? " is-active" : "");
  const [ex, ey, yx, yy] = CURSORS[resetting ? 0 : step];

  return (
    <section className="relative overflow-x-clip" aria-labelledby="hero-heading" onPointerMove={tilt} onPointerLeave={untilt}>
      <div className="hero-glow" aria-hidden="true" />
      <div className="wrap relative grid items-center gap-12 pb-16 pt-28 sm:pt-32 lg:min-h-[min(100svh,64rem)] lg:grid-cols-12 lg:gap-16 lg:pb-20">
        <div className="lg:col-span-6 xl:col-span-7">
          <h1 id="hero-heading" className="font-display text-[clamp(3.1rem,6.6vw,8rem)] leading-[0.92] tracking-[-0.028em]">
            {h.title}
          </h1>
          <p className="mt-6 max-w-[36rem] text-[clamp(1.08rem,1.5vw,1.28rem)] leading-relaxed" style={{ color: "var(--ink-2)" }}>
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

        <div className="mock-stage lg:col-span-6 xl:col-span-5" ref={stageRef}>
          <figure className="mock" aria-label={b.label}>
            <div className="mock-bar" aria-hidden="true">
              <span className="dots">
                <i />
                <i />
                <i />
              </span>
              <span className="url">
                <Lock size={11} />
                {s.url}
              </span>
            </div>
            <div className={`mock-canvas v${site}`} aria-hidden="true">
              <div className={`blk blk-nav${built(1)}${activeCls(1)}`} data-tag={b.steps[0]}>
                <span className="logo">
                  <i /> {s.brand}
                </span>
                <span className="links">
                  {s.nav.map((n) => (
                    <span key={n}>{n}</span>
                  ))}
                </span>
              </div>
              <div className={`blk blk-title${built(2)}${activeCls(2)}`} data-tag={b.steps[1]}>
                {s.title}
              </div>
              <div className={`blk blk-photo${built(3)}${activeCls(3)}`} data-tag={b.steps[2]}>
                <span className="sun" />
                <span className="loaf l1" />
                <span className="loaf l2" />
                <span className="loaf l3" />
              </div>
              <div className={`blk blk-cta${built(4)}${activeCls(4)}`} data-tag={b.steps[3]}>
                <span className="sub">{s.sub}</span>
                <span className="btn-mock">{s.cta}</span>
                <span className="stars">★★★★★</span>
              </div>
              <div className={`blk blk-cards${built(5)}${activeCls(5)}`} data-tag={b.steps[4]}>
                {s.cards.map((c, i) => (
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
          <ol className="mock-rail" aria-hidden="true">
            {b.steps.map((st, i) => (
              <li key={st} data-on={step >= i + 1 && !resetting} data-current={step === i + 1 && !resetting}>
                {st}
              </li>
            ))}
          </ol>
          <p className="meta mt-2 text-center">{b.note}</p>
        </div>
      </div>
    </section>
  );
}
