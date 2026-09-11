/** Small registry the always-mounted <RealityWarpOverlay/> fills in on
 *  mount, so useRealityWarp() (called from wherever the trigger button
 *  lives) can reach its DOM nodes without prop-drilling a ref through the
 *  whole app. Mirrors the warpState.ts pattern: plain mutable objects
 *  instead of context, because this is a single always-present singleton,
 *  not something that varies by where it's read from. */
export const warpDom: {
  flashLayers: HTMLDivElement[];
  boom: HTMLDivElement | null;
} = {
  flashLayers: [],
  boom: null,
};
