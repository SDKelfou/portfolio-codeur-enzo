import { useEffect, useRef } from "react";

/**
 * The "Enzo" cursor keeps building the whole page: as each section title
 * reaches the reading zone, the cursor glides to it and "selects" it like
 * in a design tool (dashed frame + label), then moves on. Pointer devices
 * only, never on touch screens or with reduced motion, and it never
 * intercepts a click.
 */
export default function GuideCursor() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!window.matchMedia("(pointer: fine) and (min-width: 1024px)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let target: HTMLElement | null = null;
    let raf = 0;
    let hideTimer = 0;

    const place = () => {
      raf = 0;
      if (!target) return;
      const r = target.getBoundingClientRect();
      // sits just after the end of the title's last line
      const x = Math.min(window.innerWidth - 120, r.left + Math.min(r.width, target.scrollWidth) - 6);
      const y = r.bottom - 10;
      el.style.transform = `translate(${x}px, ${y}px)`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(place);
    };

    const select = (h: HTMLElement) => {
      if (target === h) return;
      target?.classList.remove("is-guided");
      target = h;
      h.classList.add("is-guided");
      el.dataset.show = "true";
      place();
      window.clearTimeout(hideTimer);
      hideTimer = window.setTimeout(() => h.classList.remove("is-guided"), 1600);
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) select(e.target as HTMLElement);
      },
      { rootMargin: "-38% 0px -52% 0px" }
    );
    const scan = () => {
      io.disconnect();
      document.querySelectorAll<HTMLElement>("main h2").forEach((h) => io.observe(h));
    };
    scan();
    const mo = new MutationObserver(scan);
    const main = document.getElementById("main");
    if (main) mo.observe(main, { childList: true });

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      io.disconnect();
      mo.disconnect();
      cancelAnimationFrame(raf);
      window.clearTimeout(hideTimer);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      target?.classList.remove("is-guided");
    };
  }, []);

  return (
    <div ref={ref} className="guide-cursor" aria-hidden="true">
      <svg width="22" height="24" viewBox="0 0 20 22">
        <path d="M2 1.5 17.5 11l-7 1.6L7 20Z" fill="#fff010" stroke="#24222d" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
      <span>Enzo</span>
    </div>
  );
}
