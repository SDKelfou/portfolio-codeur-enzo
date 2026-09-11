/** Shared mutable state read every frame by the hero's 3D scene during the
 *  "Reality Warp" page-transition sequence. A plain object instead of React
 *  state on purpose: GSAP ticks it up to 60x/sec while the transition
 *  plays, and routing that through React state/props would mean a
 *  re-render per tick. The shader backdrop, the biplane and the camera all
 *  read `boost` inside their own useFrame and react directly — zero
 *  re-renders, and it stays in sync automatically since it's read live
 *  rather than snapshotted. */
export const warpState = {
  /** 0 = idle. Ramps toward 1 through the accelerate phase, spikes at
   *  impact, then eases back to 0 once the new page has settled in. */
  boost: 0,
};
