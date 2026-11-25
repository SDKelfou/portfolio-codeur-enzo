export function armReveals() {
  const root = document.documentElement;
  const els = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]:not(.is-in)"));
  const vh = window.innerHeight;
  for (const el of els) {
    const r = el.getBoundingClientRect();
    if (r.top < vh * 0.92 && r.bottom > 0) el.classList.add("is-in", "no-anim");
  }
  root.classList.add("js");

  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add("is-in");
          io.unobserve(e.target);
        }
      }
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
  );
  els.forEach((el) => !el.classList.contains("is-in") && io.observe(el));
  return () => io.disconnect();
}
