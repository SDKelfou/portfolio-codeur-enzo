import { Link } from "wouter";
import { useMagnetic } from "../lib/useMagnetic";
import { GsapReveal } from "../lib/GsapReveal";

interface EndCTAProps {
  text: string;
  buttonLabel: string;
  href: string;
}

/** Compact closing nudge used at the end of a page to route toward the
 *  next natural step, without repeating a full contact block. */
export default function EndCTA({ text, buttonLabel, href }: EndCTAProps) {
  const cta = useMagnetic<HTMLAnchorElement>(0.28);

  return (
    <section className="relative px-6 py-16 text-center sm:px-10">
      <GsapReveal dir="scale">
        <p className="mx-auto max-w-md text-base font-medium" style={{ color: "var(--home-text-muted)" }}>
          {text}
        </p>
        {/* eslint-disable @typescript-eslint/no-explicit-any */}
        <Link
          {...({
            href,
            ref: cta.ref,
            onPointerMove: cta.onPointerMove,
            onPointerLeave: cta.onPointerLeave,
            className: "btn-accent mt-6 inline-block rounded-full px-8 py-3.5 text-sm font-semibold will-change-transform",
          } as any)}
        >
          {buttonLabel}
        </Link>
        {/* eslint-enable @typescript-eslint/no-explicit-any */}
      </GsapReveal>
    </section>
  );
}
