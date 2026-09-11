import { useRef } from "react";
import type { PointerEvent, ReactNode } from "react";
import { Link } from "wouter";

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  innerClassName?: string;
  maxTilt?: number;
  as?: "div" | "a" | "link";
  href?: string;
  target?: string;
  rel?: string;
  onClick?: () => void;
  "aria-label"?: string;
}

/**
 * Mouse-tracked 3D tilt wrapper with a cursor-following glow.
 * Disabled automatically for users who prefer reduced motion (via CSS).
 * as="link" renders a wouter <Link> (client-side route change);
 * as="a" renders a plain anchor (external links).
 */
export function TiltCard({
  children,
  className = "",
  innerClassName = "",
  maxTilt = 10,
  as = "div",
  href,
  target,
  rel,
  onClick,
  ...rest
}: TiltCardProps) {
  const ref = useRef<HTMLElement>(null);

  const handleMove = (e: PointerEvent<HTMLElement>) => {
    const el = ref.current;
    if (!el || e.pointerType === "touch") return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const tiltY = (px - 0.5) * maxTilt * 2;
    const tiltX = (0.5 - py) * maxTilt * 2;
    el.style.setProperty("--tilt-x", `${tiltX}deg`);
    el.style.setProperty("--tilt-y", `${tiltY}deg`);
    el.style.setProperty("--glow-x", `${px * 100}%`);
    el.style.setProperty("--glow-y", `${py * 100}%`);
  };

  const handleLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--tilt-x", `0deg`);
    el.style.setProperty("--tilt-y", `0deg`);
  };

  const commonProps: Record<string, unknown> = {
    ref,
    onPointerMove: handleMove,
    onPointerLeave: handleLeave,
    className: `tilt-card relative ${className}`,
    onClick,
    ...rest,
  };

  const inner = (
    <div className={`tilt-card-inner relative ${innerClassName}`}>
      <span className="tilt-glow" aria-hidden="true" />
      {children}
    </div>
  );

  if (as === "link" && href) {
    return (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      <Link href={href} {...(commonProps as any)}>
        {inner}
      </Link>
    );
  }

  if (as === "a" && href) {
    return (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      <a href={href} target={target} rel={rel} {...(commonProps as any)}>
        {inner}
      </a>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <div {...(commonProps as any)}>{inner}</div>;
}
