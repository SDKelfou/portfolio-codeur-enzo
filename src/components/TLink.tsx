import type { AnchorHTMLAttributes, MouseEvent } from "react";
import { useLocation, useRouter } from "wouter";
import { withPageTransition } from "../lib/pageTransition";

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

export default function TLink({ href, onClick, ...rest }: Props) {
  const [location, navigate] = useLocation();
  const { base } = useRouter();
  const absolute = href.startsWith("~");
  const target = absolute ? href.slice(1) : `${base}${href}`;
  const [path, hash] = (absolute ? href.slice(1) : href).split("#");

  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();

    const samePage = !absolute && (path || "/") === location;
    if (samePage) {
      if (hash) document.getElementById(hash)?.scrollIntoView({ behavior: "smooth", block: "start" });
      else window.scrollTo({ top: 0, behavior: "smooth" });
      if (hash) history.replaceState(null, "", `#${hash}`);
      return;
    }

    withPageTransition(
      () => navigate(href),
      () => {
        const el = hash ? document.getElementById(hash) : null;
        if (el) el.scrollIntoView({ block: "start" });
        else window.scrollTo(0, 0);
      }
    );
  };

  return <a href={target} onClick={handle} {...rest} />;
}
