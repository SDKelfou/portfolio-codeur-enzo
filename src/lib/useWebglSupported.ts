let cached: boolean | null = null;

/** Cheap, cached feature-detect — checked once per session. */
export function isWebglSupported(): boolean {
  if (cached !== null) return cached;
  try {
    const canvas = document.createElement("canvas");
    cached = !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl2") || canvas.getContext("webgl"))
    );
  } catch {
    cached = false;
  }
  return cached;
}
