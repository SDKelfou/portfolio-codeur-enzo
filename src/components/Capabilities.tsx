import { useEffect, useRef, useState } from "react";
import type { PointerEvent as RPointerEvent, ReactNode } from "react";
import { Check, Lock, Search, ArrowRightUp } from "@getpapillon/papicons";
import { useI18n } from "../i18n";
import LiveTiming from "./LiveTiming";

/**
 * Proof of range: every tile is a small working demo, not a picture.
 * 3D object you can spin, a booking flow, a cart that pays, a Google
 * result, the live speed of this page, a security checklist, languages,
 * software. Animations start only when a tile is on screen.
 */

function useInView<T extends Element>(threshold = 0.35) {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, seen] as const;
}

function Tile({ title, text, className = "", children, demo }: { title: string; text: string; className?: string; children: ReactNode; demo: string }) {
  return (
    <article className={`tile ${className}`} data-reveal="rise">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-[1.15rem] font-extrabold leading-tight">{title}</h3>
        <span className="tile-pill">{demo}</span>
      </div>
      <p className="mt-1.5 text-[0.95rem]" style={{ color: "var(--ink-2)" }}>
        {text}
      </p>
      <div className="tile-stage">{children}</div>
    </article>
  );
}

/* ---------- 3D: a draggable faceted object, pure CSS 3D ---------- */
function Object3D() {
  const ref = useRef<HTMLDivElement>(null);
  const state = useRef({ rx: -18, ry: 32, vx: 0, vy: 0.18, drag: false, lx: 0, ly: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let visible = false;
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !raf) raf = requestAnimationFrame(loop);
    });
    io.observe(el);
    function loop() {
      const s = state.current;
      if (!s.drag) {
        s.ry += s.vy;
        s.rx += s.vx;
        s.vy += (0.18 - s.vy) * 0.02;
        s.vx *= 0.95;
      }
      s.rx = Math.max(-60, Math.min(60, s.rx));
      el!.style.setProperty("--rx", `${s.rx}deg`);
      el!.style.setProperty("--ry", `${s.ry}deg`);
      raf = visible && !reduced ? requestAnimationFrame(loop) : 0;
    }
    loop();
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, []);

  const down = (e: RPointerEvent) => {
    const s = state.current;
    s.drag = true;
    s.lx = e.clientX;
    s.ly = e.clientY;
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };
  const move = (e: RPointerEvent) => {
    const s = state.current;
    if (!s.drag) return;
    const dx = e.clientX - s.lx;
    const dy = e.clientY - s.ly;
    s.lx = e.clientX;
    s.ly = e.clientY;
    s.ry += dx * 0.5;
    s.rx -= dy * 0.5;
    s.vy = dx * 0.25;
    s.vx = -dy * 0.25;
    ref.current?.style.setProperty("--ry", `${s.ry}deg`);
    ref.current?.style.setProperty("--rx", `${s.rx}deg`);
  };
  const up = () => (state.current.drag = false);

  const faces = ["front", "back", "right", "left", "top", "bottom"];
  return (
    <div className="obj-scene" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
      <div ref={ref} className="obj">
        {faces.map((f) => (
          <span key={f} className={`face ${f}`}>
            {f === "front" && <b>enzo.dev</b>}
          </span>
        ))}
        <span className="ring" />
      </div>
      <span className="obj-shadow" />
    </div>
  );
}

/* ---------- booking ---------- */
function Booking() {
  const { t } = useI18n();
  const c = t.caps.book;
  const [day, setDay] = useState(1);
  const [slot, setSlot] = useState<number | null>(null);
  return (
    <div className="w-full">
      <div className="flex gap-1.5">
        {c.days.map((d, i) => (
          <button key={d} type="button" className="chip" data-on={day === i} onClick={() => (setDay(i), setSlot(null))}>
            {d}
          </button>
        ))}
      </div>
      <p className="meta mt-3">{c.pick}</p>
      <div className="mt-2 grid grid-cols-2 gap-1.5">
        {c.slots.map((s, i) => (
          <button key={s} type="button" className="slot tnum" data-on={slot === i} onClick={() => setSlot(i)}>
            {s}
          </button>
        ))}
      </div>
      <p className="mt-3 flex min-h-[2.6em] items-start gap-2 text-sm font-bold" role="status">
        {slot !== null && (
          <>
            <Check size={16} className="mt-0.5 shrink-0" style={{ color: "#2f7d4f" }} />
            {c.done}
          </>
        )}
      </p>
    </div>
  );
}

/* ---------- shop ---------- */
function Shop() {
  const { t } = useI18n();
  const c = t.caps.shop;
  const [n, setN] = useState(0);
  const [paid, setPaid] = useState(false);
  const [bump, setBump] = useState(0);
  return (
    <div className="w-full">
      <div className="flex items-center gap-3">
        <span className="product-thumb" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold">{c.product}</p>
          <p className="tnum text-sm" style={{ color: "var(--ink-2)" }}>
            {c.price}
          </p>
        </div>
        <span className="cart-badge tnum" key={bump} aria-label={`${c.cart} ${n}`}>
          {n}
        </span>
      </div>
      <div className="mt-3 flex gap-2">
        <button type="button" className="btn btn-line !min-h-[2.4rem] flex-1 !px-3 !py-1.5 text-sm" onClick={() => (setN(n + 1), setBump(bump + 1), setPaid(false))}>
          {c.add}
        </button>
        <button type="button" className="btn btn-light !min-h-[2.4rem] !px-3 !py-1.5 text-sm" disabled={n === 0} onClick={() => setPaid(true)}>
          <Lock size={13} />
          {c.pay}
        </button>
      </div>
      <p className="mt-2 flex min-h-[1.6em] items-center gap-2 text-sm font-bold" role="status">
        {paid && (
          <>
            <Check size={16} style={{ color: "#2f7d4f" }} />
            {c.paid}
          </>
        )}
      </p>
    </div>
  );
}

/* ---------- Google result ---------- */
function Serp() {
  const { t } = useI18n();
  const c = t.caps.seo;
  const [ref, seen] = useInView<HTMLDivElement>();
  const [typed, setTyped] = useState(0);
  useEffect(() => {
    if (!seen) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return setTyped(c.query.length);
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setTyped(i);
      if (i >= c.query.length) window.clearInterval(id);
    }, 55);
    return () => window.clearInterval(id);
  }, [seen, c.query]);
  const done = typed >= c.query.length;
  return (
    <div ref={ref} className="serp w-full">
      <div className="serp-bar">
        <Search size={14} />
        <span>
          {c.query.slice(0, typed)}
          <i className="caret" />
        </span>
      </div>
      <div className="serp-result" data-on={done}>
        <p className="serp-url">boulangerie-lumiere.fr</p>
        <p className="serp-title">{c.resultTitle}</p>
        <p className="serp-desc">{c.resultDesc}</p>
        <p className="serp-stars">★★★★★</p>
      </div>
    </div>
  );
}

/* ---------- security checklist ---------- */
function Security() {
  const { t } = useI18n();
  const items = t.caps.security.items;
  const [ref, seen] = useInView<HTMLUListElement>();
  return (
    <ul ref={ref} className="w-full space-y-2">
      {items.map((it, i) => (
        <li key={it} className="check-row" data-on={seen} style={{ transitionDelay: `${300 + i * 380}ms` }}>
          <span className="box">
            <Check size={12} />
          </span>
          {it}
        </li>
      ))}
    </ul>
  );
}

/* ---------- languages ---------- */
const HELLO = [
  ["fr", "Bonjour"],
  ["en", "Hello"],
  ["es", "Hola"],
  ["de", "Guten Tag"],
  ["it", "Ciao"],
  ["pt", "Olá"],
  ["nl", "Hallo"],
];
function Languages() {
  const [ref, seen] = useInView<HTMLDivElement>();
  const [i, setI] = useState(0);
  useEffect(() => {
    if (!seen || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setI((x) => (x + 1) % HELLO.length), 1300);
    return () => window.clearInterval(id);
  }, [seen]);
  return (
    <div ref={ref} className="w-full">
      <p key={i} className="hello font-display text-[2.6rem] leading-none" lang={HELLO[i][0]}>
        {HELLO[i][1]}
      </p>
      <div className="mt-3 flex flex-wrap gap-1">
        {HELLO.map(([code], k) => (
          <span key={code} className="chip !cursor-default uppercase" data-on={k === i}>
            {code}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Capabilities() {
  const { t } = useI18n();
  const c = t.caps;
  return (
    <section id="savoir-faire" className="cv scroll-mt-24 py-24 sm:py-32" aria-labelledby="caps-heading">
      <div className="wrap">
        <div className="grid gap-6 lg:grid-cols-12">
          <h2 id="caps-heading" className="h2 lg:col-span-7" data-reveal="rise">
            {c.title}
          </h2>
          <p className="muted self-end text-lg lg:col-span-5" data-reveal="rise" style={{ ["--i" as string]: 1 }}>
            {c.intro}
          </p>
        </div>

        <div className="bento mt-14">
          <Tile className="t-3d" title={c.d3.title} text={c.d3.text} demo={c.demo}>
            <Object3D />
          </Tile>
          <Tile className="t-book" title={c.book.title} text={c.book.text} demo={c.demo}>
            <Booking />
          </Tile>
          <Tile className="t-shop" title={c.shop.title} text={c.shop.text} demo={c.demo}>
            <Shop />
          </Tile>
          <Tile className="t-speed" title={c.speed.title} text={c.speed.text} demo={c.demo}>
            <div className="speed text-[0.95rem]">
              <LiveTiming />
            </div>
          </Tile>
          <Tile className="t-seo" title={c.seo.title} text={c.seo.text} demo={c.demo}>
            <Serp />
          </Tile>
          <Tile className="t-sec" title={c.security.title} text={c.security.text} demo={c.demo}>
            <Security />
          </Tile>
          <Tile className="t-lang" title={c.lang.title} text={c.lang.text} demo={c.demo}>
            <Languages />
          </Tile>
          <article className="tile t-soft" data-reveal="rise">
            <div className="grid items-center gap-6 md:grid-cols-2">
              <div>
                <h3 className="text-[1.15rem] font-extrabold leading-tight">{c.soft.title}</h3>
                <p className="mt-1.5 text-[0.95rem]" style={{ color: "var(--ink-2)" }}>
                  {c.soft.text}
                </p>
                <a href="https://nexus-multitools.nexus-multitools.workers.dev/" target="_blank" rel="noopener noreferrer" className="btn btn-line mt-5 !min-h-[2.6rem] !py-2 text-sm">
                  NEXUS
                  <ArrowRightUp size={15} />
                </a>
              </div>
              <img src="/projets/nexus.webp" alt="NEXUS" width={800} height={500} loading="lazy" decoding="async" className="w-full rounded-2xl border" style={{ borderColor: "var(--line)" }} />
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
