import { useCallback, useRef } from "react";
import { useLocation } from "wouter";
import { gsap } from "../gsapSetup";
import { useAudio } from "../audio";
import { useReducedMotion } from "../useReducedMotion";
import { warpState } from "./warpState";
import { warpDom } from "./warpDom";

const ACCELERATE_DURATION = 0.55;
const SETTLE_DURATION = 0.6;

let warpInFlight = false;

/** Orchestrates the "Reality Warp" hero CTA transition: a GSAP timeline
 *  that boosts the 3D scene (via the shared warpState the Canvas already
 *  reads every frame — see HeroScene/ToonBiplane/ShaderBackdrop), flashes
 *  a chromatic-aberration/shockwave overlay at the peak, swaps the route
 *  mid-flash, then settles the new page in with a quick punch-and-recover.
 *  Sound is synced to the same three beats: thump on click, an engine-rev
 *  sweep through the accelerate phase, a crisp pop at impact. */
export function useRealityWarp() {
  const [, navigate] = useLocation();
  const { warpThumpSfx, warpRevSfx, warpImpactSfx } = useAudio();
  const reducedMotion = useReducedMotion();
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  const triggerWarp = useCallback(
    (to: string) => {
      if (warpInFlight) return;

      if (reducedMotion) {
        navigate(to);
        return;
      }

      const viewport = document.getElementById("warp-viewport");
      const flashLayers = warpDom.flashLayers;
      const boom = warpDom.boom;
      if (!viewport) {
        navigate(to);
        return;
      }

      warpInFlight = true;
      const previousOverflow = document.documentElement.style.overflow;
      document.documentElement.style.overflow = "hidden";

      warpThumpSfx();
      warpRevSfx(ACCELERATE_DURATION);

      const tl = gsap.timeline({
        onComplete: () => {
          document.documentElement.style.overflow = previousOverflow;
          warpInFlight = false;
        },
      });
      timelineRef.current = tl;

      // --- 1. Accelerate: the boost ramp drives the plane rush + shader
      // spike (both read warpState.boost live), while the current page
      // whips away under motion blur.
      tl.to(warpState, { boost: 1, duration: ACCELERATE_DURATION, ease: "power2.in" }, 0);
      tl.to(
        viewport,
        { scale: 1.05, y: -32, filter: "blur(9px)", duration: ACCELERATE_DURATION, ease: "power2.in" },
        0
      );

      // --- 2. Impact: chromatic-aberration flash + shockwave burst, the
      // crisp pop, and the route swap itself — hidden under the flash.
      tl.add(() => warpImpactSfx(), ACCELERATE_DURATION);
      tl.to(flashLayers, { opacity: 0.85, duration: 0.06, ease: "power1.out" }, ACCELERATE_DURATION);
      if (boom) {
        tl.fromTo(boom, { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1.4, duration: 0.16, ease: "power1.out" }, ACCELERATE_DURATION);
      }
      tl.add(() => {
        navigate(to);
        // New content mounts under the same stable #warp-viewport node —
        // snap it straight into the "just punched through" pose so the
        // very next tween reads as the layout stabilizing, not popping in.
        gsap.set(viewport, { scale: 1.08, y: 24, filter: "blur(12px)" });
      }, ACCELERATE_DURATION + 0.05);

      // --- 3. Settle: the new page stabilizes, the flash clears, the
      // boost eases back down to idle.
      tl.to(flashLayers, { opacity: 0, duration: 0.35, ease: "power2.out" }, ACCELERATE_DURATION + 0.1);
      if (boom) {
        tl.to(boom, { opacity: 0, duration: 0.4, ease: "power2.out" }, ACCELERATE_DURATION + 0.08);
      }
      tl.to(
        viewport,
        { scale: 1, y: 0, filter: "blur(0px)", duration: SETTLE_DURATION, ease: "power3.out" },
        ACCELERATE_DURATION + 0.05
      );
      tl.to(warpState, { boost: 0, duration: SETTLE_DURATION, ease: "power2.out" }, ACCELERATE_DURATION + 0.05);
    },
    [navigate, reducedMotion, warpThumpSfx, warpRevSfx, warpImpactSfx]
  );

  return { triggerWarp };
}
